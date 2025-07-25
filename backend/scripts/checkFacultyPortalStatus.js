const mongoose = require('mongoose');
const User = require('../models/User');
const FacultyMember = require('../models/FacultyMember');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkFacultyPortalStatus() {
  try {
    console.log('🔍 Checking Faculty Portal Status...\n');

    // 1. Check Faculty Users
    const facultyUsers = await User.find({ role: 'faculty' });
    console.log(`👥 Faculty Users: ${facultyUsers.length}`);
    
    if (facultyUsers.length > 0) {
      console.log('   Faculty Users:');
      facultyUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email})`);
      });
    }

    // 2. Check Faculty Members
    const facultyMembers = await FacultyMember.find().populate('user', 'username email');
    console.log(`\n📋 Faculty Members: ${facultyMembers.length}`);
    
    if (facultyMembers.length > 0) {
      console.log('   Faculty Members:');
      facultyMembers.forEach(member => {
        console.log(`   - ${member.user?.username || 'No User'} | Status: ${member.status} | Approved: ${member.isApproved} | Employee ID: ${member.employeeId}`);
      });
    }

    // 3. Check Approved Faculty
    const approvedFaculty = await FacultyMember.find({ status: 'approved' }).populate('user', 'username email');
    console.log(`\n✅ Approved Faculty: ${approvedFaculty.length}`);

    // 4. Check Courses
    const allCourses = await Course.find().populate('instructor', 'employeeId').populate('enrolledStudents');
    console.log(`\n📚 Total Courses: ${allCourses.length}`);
    
    const coursesWithInstructors = allCourses.filter(course => course.instructor);
    console.log(`👨‍🏫 Courses with Instructors: ${coursesWithInstructors.length}`);
    
    if (coursesWithInstructors.length > 0) {
      console.log('   Assigned Courses:');
      coursesWithInstructors.forEach(course => {
        console.log(`   - ${course.courseCode}: ${course.title} | Instructor: ${course.instructor?.employeeId || 'Unknown'} | Students: ${course.enrolledStudents?.length || 0}`);
      });
    }

    // 5. Check Students
    const allStudents = await Student.find().populate('user', 'username email');
    console.log(`\n👨‍🎓 Total Students: ${allStudents.length}`);

    // 6. Check Course Enrollments
    const coursesWithStudents = allCourses.filter(course => course.enrolledStudents && course.enrolledStudents.length > 0);
    console.log(`📝 Courses with Enrolled Students: ${coursesWithStudents.length}`);

    // 7. Check Assignments
    const assignments = await Assignment.find().populate('course', 'courseCode title').populate('instructor', 'employeeId');
    console.log(`\n📋 Total Assignments: ${assignments.length}`);
    
    if (assignments.length > 0) {
      console.log('   Assignments:');
      assignments.forEach(assignment => {
        console.log(`   - ${assignment.title} | Course: ${assignment.course?.courseCode || 'Unknown'} | Instructor: ${assignment.instructor?.employeeId || 'Unknown'}`);
      });
    }

    // 8. Faculty Portal Readiness Check
    console.log('\n🎯 Faculty Portal Readiness:');
    
    const issues = [];
    
    if (facultyUsers.length === 0) {
      issues.push('❌ No faculty users found');
    }
    
    if (approvedFaculty.length === 0) {
      issues.push('❌ No approved faculty members');
    }
    
    if (coursesWithInstructors.length === 0) {
      issues.push('❌ No courses assigned to faculty');
    }
    
    if (coursesWithStudents.length === 0) {
      issues.push('❌ No students enrolled in courses');
    }
    
    if (issues.length === 0) {
      console.log('✅ Faculty Portal is ready to use!');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }

    // 9. Recommendations
    console.log('\n💡 Recommendations:');
    
    if (facultyUsers.length === 0) {
      console.log('   1. Create faculty user accounts');
    }
    
    if (approvedFaculty.length === 0) {
      console.log('   2. Approve faculty members in admin panel');
    }
    
    if (coursesWithInstructors.length === 0) {
      console.log('   3. Assign faculty to courses using Course-Faculty Assignment');
    }
    
    if (coursesWithStudents.length === 0) {
      console.log('   4. Enroll students in courses using Enrollment Management');
    }

  } catch (error) {
    console.error('Error checking faculty portal status:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkFacultyPortalStatus();