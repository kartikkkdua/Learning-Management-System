const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Grade = require('../models/Grade');
const GradingRubric = require('../models/GradingRubric');
const GradeCategory = require('../models/GradeCategory');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');

// Helper function to calculate letter grade
function calculateLetterGrade(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

// Get all grades for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const grades = await Grade.find({ course: courseId })
      .populate('student', 'user')
      .populate('assignment', 'title dueDate')
      .populate('gradedBy', 'username profile')
      .populate('rubric', 'name')
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error('Error fetching course grades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get grades for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;
    
    let query = { student: studentId };
    if (courseId) query.course = courseId;
    
    const grades = await Grade.find(query)
      .populate('assignment', 'title dueDate category')
      .populate('course', 'name code')
      .populate('rubric', 'name')
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or update a grade
router.post('/', auth, async (req, res) => {
  try {
    console.log('Grading request received for student:', req.body.studentId);

    const {
      studentId,
      assignmentId,
      courseId,
      rubricId,
      criteriaGrades,
      totalPoints,
      maxPoints,
      feedback,
      privateNotes,
      latePenalty
    } = req.body;

    // Validate required fields
    if (!studentId || !assignmentId || !courseId) {
      console.error('Missing required fields:', { studentId, assignmentId, courseId });
      return res.status(400).json({ 
        message: 'Missing required fields: studentId, assignmentId, and courseId are required' 
      });
    }

    // Verify student and assignment exist
    const Student = require('../models/Student');
    const Assignment = require('../models/Assignment');
    
    const student = await Student.findById(studentId);
    if (!student) {
      console.error('Student not found:', studentId);
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.error('Assignment not found:', assignmentId);
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Student and assignment validation passed

    // Check if grade already exists
    let grade = await Grade.findOne({
      student: studentId,
      assignment: assignmentId
    });
    
    // Check if updating existing grade or creating new one

    if (grade) {
      // Save current grade as revision
      grade.revisions.push({
        gradedBy: grade.gradedBy,
        totalPoints: grade.totalPoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        feedback: grade.feedback,
        gradedAt: grade.gradedAt,
        reason: 'Grade updated'
      });

      // Update existing grade
      grade.gradedBy = req.user._id;
      grade.rubric = rubricId;
      grade.criteriaGrades = criteriaGrades;
      grade.totalPoints = totalPoints;
      grade.maxPoints = maxPoints;
      grade.feedback = feedback;
      grade.privateNotes = privateNotes;
      grade.latePenalty = latePenalty;
      grade.gradedAt = new Date();
    } else {
      // Create new grade
      grade = new Grade({
        student: studentId,
        assignment: assignmentId,
        course: courseId,
        gradedBy: req.user._id,
        rubric: rubricId,
        criteriaGrades,
        totalPoints,
        maxPoints,
        feedback,
        privateNotes,
        latePenalty
      });
    }

    // Calculate percentage and letter grade manually to ensure they're set
    const percentage = (totalPoints / maxPoints) * 100;
    const letterGrade = calculateLetterGrade(percentage);
    
    // Set calculated values
    grade.percentage = percentage;
    grade.letterGrade = letterGrade;
    
    await grade.save();

    // Populate the response
    await grade.populate([
      { path: 'student', populate: { path: 'user', select: 'username profile' } },
      { path: 'assignment', select: 'title' },
      { path: 'gradedBy', select: 'username profile' },
      { path: 'rubric', select: 'name' }
    ]);

    res.json(grade);
  } catch (error) {
    console.error('Error creating/updating grade:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Publish grades (make them visible to students)
router.post('/publish', auth, async (req, res) => {
  try {
    const { gradeIds } = req.body;

    const result = await Grade.updateMany(
      { _id: { $in: gradeIds } },
      { 
        status: 'published',
        publishedAt: new Date()
      }
    );

    res.json({ 
      message: `${result.modifiedCount} grades published successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error publishing grades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get grade statistics for a course
router.get('/stats/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await Grade.aggregate([
      { $match: { course: mongoose.Types.ObjectId(courseId), status: 'published' } },
      {
        $group: {
          _id: null,
          averageGrade: { $avg: '$percentage' },
          highestGrade: { $max: '$percentage' },
          lowestGrade: { $min: '$percentage' },
          totalGrades: { $sum: 1 },
          gradeDistribution: {
            $push: {
              percentage: '$percentage',
              letterGrade: '$letterGrade'
            }
          }
        }
      }
    ]);

    // Calculate grade distribution
    const distribution = {
      'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
      'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'D-': 0, 'F': 0
    };

    if (stats.length > 0) {
      stats[0].gradeDistribution.forEach(grade => {
        distribution[grade.letterGrade]++;
      });
    }

    res.json({
      statistics: stats[0] || {
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        totalGrades: 0
      },
      distribution
    });
  } catch (error) {
    console.error('Error fetching grade statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Calculate final grades for a course
router.get('/final/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get grade categories for the course
    const categories = await GradeCategory.find({ course: courseId, isActive: true })
      .sort({ order: 1 });

    // Get all students in the course
    const course = await Course.findById(courseId)
      .populate({
        path: 'enrolledStudents',
        populate: { path: 'user', select: 'username profile' }
      });

    const finalGrades = [];

    for (const enrollment of course.enrolledStudents) {
      const studentId = enrollment._id;
      
      // Get all grades for this student in this course
      const studentGrades = await Grade.find({
        student: studentId,
        course: courseId,
        status: 'published'
      }).populate('assignment', 'title category');

      let totalWeightedScore = 0;
      let totalWeight = 0;
      const categoryScores = {};

      // Calculate scores for each category
      for (const category of categories) {
        const categoryGrades = studentGrades.filter(grade => 
          grade.assignment.category === category.type
        );

        if (categoryGrades.length > 0) {
          // Sort grades and drop lowest if configured
          const sortedGrades = categoryGrades
            .map(g => g.percentage)
            .sort((a, b) => b - a);

          if (category.dropLowest > 0) {
            sortedGrades.splice(-category.dropLowest);
          }

          const categoryAverage = sortedGrades.length > 0 
            ? sortedGrades.reduce((sum, grade) => sum + grade, 0) / sortedGrades.length
            : 0;

          categoryScores[category.name] = {
            average: categoryAverage,
            weight: category.weight,
            count: sortedGrades.length
          };

          totalWeightedScore += categoryAverage * (category.weight / 100);
          totalWeight += category.weight;
        }
      }

      // Calculate final percentage
      const finalPercentage = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
      const letterGrade = calculateLetterGrade(finalPercentage);

      finalGrades.push({
        student: enrollment.user,
        studentId: studentId,
        categoryScores,
        finalPercentage: Math.round(finalPercentage * 100) / 100,
        letterGrade,
        totalAssignments: studentGrades.length
      });
    }

    res.json({
      categories,
      finalGrades: finalGrades.sort((a, b) => b.finalPercentage - a.finalPercentage)
    });
  } catch (error) {
    console.error('Error calculating final grades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate letter grade
function calculateLetterGrade(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

module.exports = router;