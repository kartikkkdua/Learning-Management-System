const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdminOrApprovedFaculty } = require('../middleware/facultyAuth');
const Course = require('../models/Course');

// Get all courses (public access for basic listing)
router.get('/', async (req, res) => {
  try {
    // Public access - show all active courses
    let query = { isActive: true };

    const courses = await Course.find(query)
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate({
        path: 'enrolledStudents',
        select: 'firstName lastName studentId email user',
        populate: {
          path: 'user',
          select: 'username profile email'
        }
      })
      .sort({ courseCode: 1 });

    console.log(`Found ${courses.length} active courses`);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get courses for authenticated faculty member
router.get('/my-courses', auth, requireAdminOrApprovedFaculty, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty access required.' });
    }

    // Find the faculty member record for this user
    const FacultyMember = require('../models/FacultyMember');
    const facultyMember = await FacultyMember.findOne({ user: req.user.userId });

    if (!facultyMember) {
      return res.status(404).json({ message: 'Faculty member record not found' });
    }

    const courses = await Course.find({ instructor: facultyMember._id })
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate('enrolledStudents', 'firstName lastName studentId')
      .sort({ courseCode: 1 });

    console.log(`Found ${courses.length} courses for faculty member ${req.user.userId}`);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching faculty courses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get courses by faculty member ID
router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.params.facultyId })
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate('enrolledStudents', 'firstName lastName studentId')
      .sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID (with access control)
router.get('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // If user is faculty, ensure they can only access courses they teach
    if (req.user.role === 'faculty') {
      // First find the faculty member record for this user
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(404).json({ message: 'Faculty member record not found' });
      }
      
      query.instructor = facultyMember._id;
    }

    const course = await Course.findOne(query)
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate({
        path: 'enrolledStudents',
        select: 'firstName lastName studentId email user',
        populate: {
          path: 'user',
          select: 'username profile email'
        }
      })
      .populate('prerequisites', 'courseCode title');

    if (!course) {
      return res.status(404).json({
        message: req.user.role === 'faculty'
          ? 'Course not found or you do not have access to this course'
          : 'Course not found'
      });
    }

    console.log(`Course ${course.courseCode} accessed by ${req.user.role} user`);
    res.json(course);
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new course (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Only admin can create courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only administrators can create courses.'
      });
    }

    const course = new Course(req.body);
    const savedCourse = await course.save();
    const populatedCourse = await Course.findById(savedCourse._id)
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'profile username email'
        }
      });

    console.log(`Course ${populatedCourse.courseCode} created by admin ${req.user.userId}`);
    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Only admin can update courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only administrators can update courses.'
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'faculty',
      populate: {
        path: 'user',
        select: 'profile username email'
      }
    }).populate({
      path: 'instructor',
      populate: {
        path: 'user',
        select: 'profile username email'
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log(`Course ${course.courseCode} updated by admin ${req.user.userId}`);
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign course to faculty (Admin only)
router.post('/:id/assign-faculty', auth, async (req, res) => {
  try {
    // Only admin can assign courses to faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only administrators can assign courses to faculty.'
      });
    }

    const { instructorId } = req.body;

    if (!instructorId) {
      return res.status(400).json({ message: 'Instructor ID is required' });
    }

    // Verify the instructor exists and is an approved faculty member
    const FacultyMember = require('../models/FacultyMember');
    const instructor = await FacultyMember.findById(instructorId).populate('user');

    if (!instructor) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    if (instructor.status !== 'approved') {
      return res.status(400).json({ message: 'Faculty member must be approved to be assigned as instructor' });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { instructor: instructorId },
      { new: true, runValidators: true }
    ).populate({
      path: 'faculty',
      populate: {
        path: 'user',
        select: 'profile username email'
      }
    }).populate({
      path: 'instructor',
      populate: {
        path: 'user',
        select: 'profile username email'
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log(`Course ${course.courseCode} assigned to faculty ${instructor.user.username} by admin ${req.user.userId}`);
    res.json({
      message: 'Course assigned to faculty successfully',
      course
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove faculty assignment from course (Admin only)
router.post('/:id/unassign-faculty', auth, async (req, res) => {
  try {
    // Only admin can unassign courses from faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only administrators can unassign courses from faculty.'
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $unset: { instructor: 1 } },
      { new: true }
    ).populate({
      path: 'faculty',
      populate: {
        path: 'user',
        select: 'profile username email'
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log(`Faculty unassigned from course ${course.courseCode} by admin ${req.user.userId}`);
    res.json({
      message: 'Faculty unassigned from course successfully',
      course
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Enroll student in course
router.post('/:id/enroll', async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    if (course.enrolledStudents.length >= course.capacity) {
      return res.status(400).json({ message: 'Course is full' });
    }

    course.enrolledStudents.push(studentId);
    await course.save();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName studentId');

    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove student from course
router.post('/:id/unenroll', async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentId
    );
    await course.save();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName studentId');

    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only administrators can delete courses.'
      });
    }

    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log(`Course ${course.courseCode} deleted by admin ${req.user.userId}`);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty members available for course assignment (Admin only)
router.get('/admin/available-faculty', auth, async (req, res) => {
  try {
    // Only admin can view available faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only administrators can view available faculty.'
      });
    }

    const FacultyMember = require('../models/FacultyMember');
    const faculty = await FacultyMember.find({ status: 'approved', isActive: true })
      .populate('user', 'username email profile')
      .sort({ 'user.profile.firstName': 1 });

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint to check course assignments (Admin only)
router.get('/admin/debug', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const FacultyMember = require('../models/FacultyMember');

    // Get all courses with their instructor assignments
    const courses = await Course.find()
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'username email profile'
        }
      })
      .select('courseCode title instructor');

    // Get all faculty members
    const facultyMembers = await FacultyMember.find({ status: 'approved' })
      .populate('user', 'username email profile');

    res.json({
      success: true,
      data: {
        courses: courses.map(course => ({
          id: course._id,
          courseCode: course.courseCode,
          title: course.title,
          instructor: course.instructor ? {
            id: course.instructor._id,
            employeeId: course.instructor.employeeId,
            name: `${course.instructor.user?.profile?.firstName || ''} ${course.instructor.user?.profile?.lastName || ''}`.trim(),
            email: course.instructor.user?.email
          } : null
        })),
        facultyMembers: facultyMembers.map(faculty => ({
          id: faculty._id,
          employeeId: faculty.employeeId,
          name: `${faculty.user?.profile?.firstName || ''} ${faculty.user?.profile?.lastName || ''}`.trim(),
          email: faculty.user?.email,
          status: faculty.status
        })),
        summary: {
          totalCourses: courses.length,
          coursesWithInstructor: courses.filter(c => c.instructor).length,
          coursesWithoutInstructor: courses.filter(c => !c.instructor).length,
          totalFacultyMembers: facultyMembers.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Utility endpoint to assign faculty to courses (Admin only)
router.post('/admin/assign-instructor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { courseId, facultyMemberId } = req.body;

    if (!courseId || !facultyMemberId) {
      return res.status(400).json({ message: 'Course ID and Faculty Member ID are required' });
    }

    const FacultyMember = require('../models/FacultyMember');

    // Verify faculty member exists and is approved
    const facultyMember = await FacultyMember.findById(facultyMemberId);
    if (!facultyMember || facultyMember.status !== 'approved') {
      return res.status(400).json({ message: 'Faculty member not found or not approved' });
    }

    // Update the course - set both instructor and faculty fields
    const course = await Course.findByIdAndUpdate(
      courseId,
      { 
        instructor: facultyMemberId,
        faculty: facultyMemberId  // Set both fields for consistency
      },
      { new: true }
    ).populate({
      path: 'instructor',
      populate: {
        path: 'user',
        select: 'username email profile'
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      success: true,
      message: 'Instructor assigned successfully',
      course: {
        id: course._id,
        courseCode: course.courseCode,
        title: course.title,
        instructor: {
          id: course.instructor._id,
          employeeId: course.instructor.employeeId,
          name: `${course.instructor.user?.profile?.firstName || ''} ${course.instructor.user?.profile?.lastName || ''}`.trim(),
          email: course.instructor.user?.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Utility endpoint to sync faculty and instructor fields (Admin only)
router.post('/admin/sync-instructors', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Only administrators can sync instructors.'
      });
    }

    // Find all courses that have faculty but no instructor
    const coursesToUpdate = await Course.find({
      faculty: { $exists: true, $ne: null },
      $or: [
        { instructor: { $exists: false } },
        { instructor: null }
      ]
    });

    let updatedCount = 0;
    for (const course of coursesToUpdate) {
      course.instructor = course.faculty;
      await course.save();
      updatedCount++;
    }

    console.log(`Synced ${updatedCount} courses with instructor assignments`);
    res.json({
      success: true,
      message: `Successfully synced ${updatedCount} courses`,
      updatedCount
    });
  } catch (error) {
    console.error('Error syncing instructors:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;