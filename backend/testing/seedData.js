const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Create Faculties
    const faculties = [
      {
        name: 'Computer Science',
        code: 'CS',
        description: 'Faculty of Computer Science and Engineering',
        dean: 'Dr. John Smith'
      },
      {
        name: 'Business Administration',
        code: 'BA',
        description: 'Faculty of Business and Management',
        dean: 'Dr. Jane Doe'
      },
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Faculty of Engineering and Technology',
        dean: 'Dr. Mike Johnson'
      }
    ];

    console.log('Creating faculties...');
    const createdFaculties = [];
    for (const facultyData of faculties) {
      const existingFaculty = await Faculty.findOne({ code: facultyData.code });
      if (!existingFaculty) {
        const faculty = new Faculty(facultyData);
        await faculty.save();
        createdFaculties.push(faculty);
        console.log(`Created faculty: ${faculty.name}`);
      } else {
        createdFaculties.push(existingFaculty);
        console.log(`Faculty already exists: ${existingFaculty.name}`);
      }
    }

    // Create Courses
    const courses = [
      {
        courseCode: 'CS101',
        title: 'Introduction to Programming',
        description: 'Basic programming concepts using Python',
        credits: 3,
        faculty: createdFaculties[0]._id, // Computer Science
        semester: 'Fall',
        year: 2024,
        capacity: 30,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '09:00',
          endTime: '10:00',
          room: 'CS-101'
        }
      },
      {
        courseCode: 'CS102',
        title: 'Data Structures',
        description: 'Fundamental data structures and algorithms',
        credits: 4,
        faculty: createdFaculties[0]._id, // Computer Science
        semester: 'Spring',
        year: 2024,
        capacity: 25,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '10:00',
          endTime: '11:30',
          room: 'CS-102'
        }
      },
      {
        courseCode: 'BA201',
        title: 'Business Management',
        description: 'Principles of business management and leadership',
        credits: 3,
        faculty: createdFaculties[1]._id, // Business Administration
        semester: 'Fall',
        year: 2024,
        capacity: 40,
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '14:00',
          endTime: '15:30',
          room: 'BA-201'
        }
      },
      {
        courseCode: 'ENG301',
        title: 'Software Engineering',
        description: 'Software development lifecycle and methodologies',
        credits: 4,
        faculty: createdFaculties[2]._id, // Engineering
        semester: 'Fall',
        year: 2024,
        capacity: 20,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '13:00',
          endTime: '14:30',
          room: 'ENG-301'
        }
      },
      {
        courseCode: 'CS201',
        title: 'Database Systems',
        description: 'Database design and management systems',
        credits: 3,
        faculty: createdFaculties[0]._id, // Computer Science
        semester: 'Spring',
        year: 2024,
        capacity: 30,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '11:00',
          endTime: '12:00',
          room: 'CS-201'
        }
      }
    ];

    console.log('Creating courses...');
    const createdCourses = [];
    for (const courseData of courses) {
      const existingCourse = await Course.findOne({ courseCode: courseData.courseCode });
      if (!existingCourse) {
        const course = new Course(courseData);
        await course.save();
        createdCourses.push(course);
        console.log(`Created course: ${course.courseCode} - ${course.title}`);
      } else {
        createdCourses.push(existingCourse);
        console.log(`Course already exists: ${existingCourse.courseCode}`);
      }
    }

    // Create sample students for existing users with role 'student'
    console.log('Creating student profiles for existing users...');
    const studentUsers = await User.find({ role: 'student' });
    
    for (let i = 0; i < studentUsers.length; i++) {
      const user = studentUsers[i];
      
      // Check if student profile already exists
      const existingStudent = await Student.findOne({ 
        $or: [{ user: user._id }, { email: user.email }] 
      });
      
      if (!existingStudent) {
        const student = new Student({
          user: user._id,
          studentId: `STU${String(i + 1).padStart(3, '0')}`, // STU001, STU002, etc.
          firstName: user.profile?.firstName || 'Student',
          lastName: user.profile?.lastName || `User ${i + 1}`,
          email: user.email,
          faculty: createdFaculties[i % createdFaculties.length]._id, // Distribute among faculties
          year: Math.floor(Math.random() * 4) + 1 // Random year 1-4
        });
        
        await student.save();
        console.log(`Created student profile: ${student.studentId} for user ${user.username}`);
      } else {
        console.log(`Student profile already exists for user: ${user.username}`);
      }
    }

    console.log('Data seeding completed successfully!');
    console.log(`Created ${createdFaculties.length} faculties`);
    console.log(`Created ${createdCourses.length} courses`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding
seedData();