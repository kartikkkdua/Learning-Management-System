const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transcript = require('../models/Transcript');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');
const crypto = require('crypto');

// Generate transcript for a student
router.post('/generate', auth, async (req, res) => {
  try {
    const { studentId, courseId, academicYear, semester } = req.body;
    
    // Set default values if not provided
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const defaultAcademicYear = academicYear || currentYear;
    const defaultSemester = semester || (currentMonth < 6 ? 'Spring' : 'Fall');

    // Get student information
    const student = await Student.findById(studentId)
      .populate('user', 'username email profile');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all published grades for the student in the specified period
    const grades = await Grade.find({
      student: studentId,
      status: 'published'
    })
    .populate('course', 'name code credits instructor')
    .populate('assignment', 'title category')
    .populate('gradedBy', 'username profile');

    // Group grades by course
    const courseGrades = {};
    grades.forEach(grade => {
      const courseId = grade.course._id.toString();
      if (!courseGrades[courseId]) {
        courseGrades[courseId] = {
          course: grade.course,
          grades: [],
          categoryScores: {}
        };
      }
      courseGrades[courseId].grades.push(grade);
    });

    // Calculate final grades for each course
    const transcriptCourses = [];
    
    for (const courseId in courseGrades) {
      const courseData = courseGrades[courseId];
      const course = courseData.course;
      
      // Get grade categories for this course
      const GradeCategory = require('../models/GradeCategory');
      const categories = await GradeCategory.find({ 
        course: courseId, 
        isActive: true 
      }).sort({ order: 1 });

      let totalWeightedScore = 0;
      let totalWeight = 0;
      const categoryGrades = [];

      // Calculate scores for each category
      for (const category of categories) {
        const categoryGradesList = courseData.grades.filter(grade => 
          grade.assignment.category === category.type
        );

        if (categoryGradesList.length > 0) {
          // Sort grades and drop lowest if configured
          const sortedGrades = categoryGradesList
            .map(g => ({ score: g.percentage, assignment: g.assignment.title, maxPoints: g.maxPoints, submittedDate: g.createdAt }))
            .sort((a, b) => b.score - a.score);

          if (category.dropLowest > 0) {
            sortedGrades.splice(-category.dropLowest);
          }

          const categoryAverage = sortedGrades.length > 0 
            ? sortedGrades.reduce((sum, grade) => sum + grade.score, 0) / sortedGrades.length
            : 0;

          categoryGrades.push({
            categoryName: category.name,
            weight: category.weight,
            score: Math.round(categoryAverage * 100) / 100,
            assignments: sortedGrades.map(g => ({
              name: g.assignment,
              score: g.score,
              maxPoints: g.maxPoints,
              percentage: g.score,
              submittedDate: g.submittedDate
            }))
          });

          totalWeightedScore += categoryAverage * (category.weight / 100);
          totalWeight += category.weight;
        }
      }

      // Calculate final percentage and letter grade
      const finalPercentage = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
      const letterGrade = calculateLetterGrade(finalPercentage);
      const gradePoints = Transcript.letterToGradePoints(letterGrade);

      transcriptCourses.push({
        course: courseId,
        courseName: course.name,
        courseCode: course.code,
        credits: course.credits || 3,
        finalGrade: {
          percentage: Math.round(finalPercentage * 100) / 100,
          letterGrade,
          gradePoints
        },
        instructor: course.instructor,
        completedDate: new Date(),
        categoryGrades
      });
    }

    // Check if transcript already exists
    let transcript = await Transcript.findOne({
      student: studentId,
      academicYear: defaultAcademicYear,
      semester: defaultSemester
    });

    if (transcript) {
      // Update existing transcript
      transcript.courses = transcriptCourses;
      transcript.generatedBy = req.user._id;
      transcript.generatedAt = new Date();
    } else {
      // Create new transcript
      transcript = new Transcript({
        student: studentId,
        academicYear: defaultAcademicYear,
        semester: defaultSemester,
        courses: transcriptCourses,
        generatedBy: req.user._id,
        verificationCode: crypto.randomBytes(16).toString('hex')
      });
    }

    await transcript.save();

    // Populate the response
    await transcript.populate([
      { path: 'student', populate: { path: 'user', select: 'username email profile' } },
      { path: 'courses.course', select: 'name code credits' },
      { path: 'courses.instructor', select: 'username profile' },
      { path: 'generatedBy', select: 'username profile' }
    ]);

    res.json(transcript);
  } catch (error) {
    console.error('Error generating transcript:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transcript for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester, official } = req.query;

    let query = { student: studentId };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (official === 'true') query.isOfficial = true;

    const transcripts = await Transcript.find(query)
      .populate('student', 'user')
      .populate('courses.course', 'name code credits')
      .populate('courses.instructor', 'username profile')
      .populate('generatedBy', 'username profile')
      .sort({ academicYear: -1, semester: -1 });

    res.json(transcripts);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get cumulative transcript (all semesters)
router.get('/cumulative/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    const transcripts = await Transcript.find({ student: studentId })
      .populate('student', 'user')
      .populate('courses.course', 'name code credits')
      .populate('courses.instructor', 'username profile')
      .sort({ academicYear: 1, semester: 1 });

    // Calculate cumulative GPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    const allCourses = [];

    transcripts.forEach(transcript => {
      transcript.courses.forEach(course => {
        allCourses.push(course);
        if (course.finalGrade && course.credits) {
          totalGradePoints += course.finalGrade.gradePoints * course.credits;
          totalCredits += course.credits;
        }
      });
    });

    const cumulativeGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    res.json({
      student: transcripts[0]?.student,
      transcripts,
      cumulativeStats: {
        cumulativeGPA: Math.round(cumulativeGPA * 100) / 100,
        totalCredits,
        totalGradePoints,
        totalCourses: allCourses.length
      },
      allCourses
    });
  } catch (error) {
    console.error('Error fetching cumulative transcript:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Make transcript official
router.post('/:id/make-official', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can make transcripts official' });
    }

    const transcript = await Transcript.findById(req.params.id);
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }

    transcript.isOfficial = true;
    transcript.digitalSignature = crypto.createHash('sha256')
      .update(`${transcript._id}${transcript.verificationCode}${Date.now()}`)
      .digest('hex');

    await transcript.save();

    res.json({ message: 'Transcript marked as official', transcript });
  } catch (error) {
    console.error('Error making transcript official:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify transcript
router.get('/verify/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const transcript = await Transcript.findOne({ verificationCode })
      .populate('student', 'user')
      .populate('courses.course', 'name code credits')
      .populate('generatedBy', 'username profile');

    if (!transcript) {
      return res.status(404).json({ message: 'Invalid verification code' });
    }

    res.json({
      verified: true,
      transcript: {
        student: transcript.student,
        academicYear: transcript.academicYear,
        semester: transcript.semester,
        semesterGPA: transcript.semesterGPA,
        cumulativeGPA: transcript.cumulativeGPA,
        totalCredits: transcript.totalCredits,
        isOfficial: transcript.isOfficial,
        generatedAt: transcript.generatedAt,
        courses: transcript.courses.map(course => ({
          courseName: course.courseName,
          courseCode: course.courseCode,
          credits: course.credits,
          finalGrade: course.finalGrade,
          completedDate: course.completedDate
        }))
      }
    });
  } catch (error) {
    console.error('Error verifying transcript:', error);
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