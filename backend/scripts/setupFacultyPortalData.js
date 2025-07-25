const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FacultyMember = require('../models/FacultyMember');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Assignment = require('../models/Assignment');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function setupFacultyPortalData() {
  try {
    console.log('🚀 Setting up Faculty Portal Data...\n');

    // 1. Create Faculty Department if not exists
    let facultyDept = await Faculty.findOne({ code: 'CS' });
    if (!facultyDept) {
      facultyDept = new Faculty({
        name: 'Computer Science',
        code: 'CS',
        description: 'Computer Science Department'
      });
      await facultyDept.save();
      console.log('✅ Created Computer Science department');
    }

    // 2. Create Faculty User if not exists
    let facultyUser = await User.findOne({ username: 'prof.smith' });
    if (!facultyUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      facultyUser = new User({
        username: 'prof.smith',
        email: 'prof.smith@university.edu',
        password: hashedPassword,
        role: 'faculty',
        profile: {
          firstName: 'John',
          lastName: 'Smith'
        }
      });
      await facultyUser.save();
      console.log('✅ Created faculty user: prof.smith');
    }

    // 3. Create Faculty Member record
    let facultyMember = await FacultyMember.findOne({ user: facultyUser._id });
    if (!facultyMember) {
      facultyMember = new FacultyMember({
        user: facultyUser._id,
        employeeId: 'FAC001',
        department: facultyDept._id,
        position: 'Professor',
        status: 'approved',
        isApproved: true,
        joinDate: new Date()
      });
      await facultyMember.save();
      console.log('✅ Created faculty member record for prof.smith');
    } else if (facultyMember.status !== 'approved') {
      // Approve existing faculty member
      facultyMember.status = 'approved';
      facultyMember.isApproved = true;
      await facultyMember.save();
      console.log('✅ Approved faculty member: prof.smith');
    }

    // 4. Create Sample Courses
    const sampleCourses = [
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Basic concepts of computer science and programming',
        credits: 3,
        semester: 'Fall',
        year: 2024,
        capacity: 30
      },
      {
        courseCode: 'CS201',
        title: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithm design',
        credits: 4,
        semester: 'Spring',
        year: 2024,
        capacity: 25
      }
    ];

    const createdCourses = [];
    for (const courseData of sampleCourses) {
      let course = await Course.findOne({ courseCode: courseData.courseCode });
      if (!course) {
        course = new Course({
          ...courseData,
          instructor: facultyMember._id,
          faculty: facultyMember._id
        });
        await course.save();
        console.log(`✅ Created course: ${course.courseCode} - ${course.title}`);
      } else if (!course.instructor) {
        // Assign faculty to existing course
        course.instructor = facultyMember._id;
        course.faculty = facultyMember._id;
        await course.save();
        console.log(`✅ Assigned faculty to course: ${course.courseCode}`);
      }
      createdCourses.push(course);
    }

    // 5. Create Sample Students
    const sampleStudents = [
      {
        username: 'student1',
        email: 'student1@university.edu',
        firstName: 'Alice',
        lastName: 'Johnson',
        studentId: 'STU001'
      },
      {
        username: 'student2',
        email: 'student2@university.edu',
        firstName: 'Bob',
        lastName: 'Wilson',
        studentId: 'STU002'
      },
      {
        username: 'student3',
        email: 'student3@university.edu',
        firstName: 'Carol',
        lastName: 'Davis',
        studentId: 'STU003'
      }
    ];

    const createdStudents = [];
    for (const studentData of sampleStudents) {
      let user = await User.findOne({ username: studentData.username });
      if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = new User({
          username: studentData.username,
          email: studentData.email,
          password: hashedPassword,
          role: 'student',
          profile: {
            firstName: studentData.firstName,
            lastName: studentData.lastName
          }
        });
        await user.save();
      }

      let student = await Student.findOne({ user: user._id });
      if (!student) {
        student = new Student({
          user: user._id,
          studentId: studentData.studentId,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          faculty: facultyDept._id,
          status: 'active',
          year: 1
        });
        await student.save();
        console.log(`✅ Created student: ${studentData.firstName} ${studentData.lastName}`);
      }
      createdStudents.push(student);
    }

    // 6. Enroll Students in Courses
    for (const course of createdCourses) {
      for (const student of createdStudents) {
        if (!course.enrolledStudents.includes(student._id)) {
          course.enrolledStudents.push(student._id);
        }
      }
      await course.save();
      console.log(`✅ Enrolled ${createdStudents.length} students in ${course.courseCode}`);
    }

    // 7. Create Sample Assignments
    const sampleAssignments = [
      {
        title: 'Programming Assignment 1',
        description: 'Write a simple calculator program',
        course: createdCourses[0]._id,
        instructor: facultyMember._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxPoints: 100,
        type: 'assignment'
      },
      {
        title: 'Midterm Exam',
        description: 'Comprehensive midterm examination',
        course: createdCourses[0]._id,
        instructor: facultyMember._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxPoints: 150,
        type: 'exam'
      }
    ];

    for (const assignmentData of sampleAssignments) {
      let assignment = await Assignment.findOne({ 
        title: assignmentData.title,
        course: assignmentData.course 
      });
      if (!assignment) {
        assignment = new Assignment(assignmentData);
        await assignment.save();
        console.log(`✅ Created assignment: ${assignment.title}`);
      }
    }

    // 8. Create Admin User if not exists
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = new User({
        username: 'admin',
        email: 'admin@university.edu',
        password: hashedPassword,
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator'
        }
      });
      await adminUser.save();
      console.log('✅ Created admin user: admin');
    }

    console.log('\n🎉 Faculty Portal Data Setup Complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Faculty Users: 1 (prof.smith)`);
    console.log(`   - Approved Faculty: 1`);
    console.log(`   - Courses: ${createdCourses.length}`);
    console.log(`   - Students: ${createdStudents.length}`);
    console.log(`   - Enrollments: ${createdCourses.length * createdStudents.length}`);
    console.log(`   - Assignments: ${sampleAssignments.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Faculty: prof.smith / password123');
    console.log('   Admin: admin / admin123');
    console.log('   Students: student1, student2, student3 / password123');

  } catch (error) {
    console.error('Error setting up faculty portal data:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupFacultyPortalData();