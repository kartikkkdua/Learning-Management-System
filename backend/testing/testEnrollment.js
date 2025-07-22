const mongoose = require('mongoose');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');

async function testEnrollment() {
  try {
    console.log('Testing enrollment system...');
    
    // Find a course
    const course = await Course.findOne().populate('enrolledStudents');
    if (!course) {
      console.log('No courses found. Please create a course first.');
      return;
    }
    
    console.log('Found course:', course.title, course.courseCode);
    console.log('Currently enrolled students:', course.enrolledStudents.length);
    
    // Find a student
    const student = await Student.findOne().populate('user');
    if (!student) {
      console.log('No students found. Please create a student first.');
      return;
    }
    
    console.log('Found student:', student.firstName, student.lastName);
    console.log('Student has user account:', !!student.user);
    
    // Check if student is already enrolled
    const isEnrolled = course.enrolledStudents.some(s => s._id.toString() === student._id.toString());
    
    if (!isEnrolled) {
      console.log('Enrolling student in course...');
      course.enrolledStudents.push(student._id);
      await course.save();
      console.log('Student enrolled successfully!');
    } else {
      console.log('Student is already enrolled in this course.');
    }
    
    // Verify enrollment
    const updatedCourse = await Course.findById(course._id).populate({
      path: 'enrolledStudents',
      select: 'firstName lastName studentId email user',
      populate: {
        path: 'user',
        select: 'username profile email'
      }
    });
    
    console.log('Updated course enrollment:');
    console.log('Total enrolled students:', updatedCourse.enrolledStudents.length);
    updatedCourse.enrolledStudents.forEach((s, index) => {
      console.log(`${index + 1}. ${s.firstName} ${s.lastName} (${s.email}) - Has user: ${!!s.user}`);
    });
    
  } catch (error) {
    console.error('Error testing enrollment:', error);
  } finally {
    mongoose.connection.close();
  }
}

testEnrollment();