const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Student = require('../models/Student');
const FacultyMember = require('../models/FacultyMember');
const Faculty = require('../models/Faculty');

async function fixUserProfiles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find();
    console.log(`📊 Found ${users.length} users`);

    let studentsFixed = 0;
    let facultyFixed = 0;

    for (const user of users) {
      if (user.role === 'student') {
        // Check if student profile exists
        const existingStudent = await Student.findOne({ user: user._id });
        
        if (!existingStudent) {
          try {
            // Generate studentId
            const studentCount = await Student.countDocuments();
            const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`;
            
            const student = new Student({
              user: user._id,
              studentId: studentId,
              firstName: user.profile?.firstName || user.username,
              lastName: user.profile?.lastName || '',
              email: user.email,
              faculty: null
            });
            
            await student.save();
            console.log(`✅ Created student profile for ${user.username} (${studentId})`);
            studentsFixed++;
          } catch (error) {
            console.error(`❌ Failed to create student profile for ${user.username}:`, error.message);
          }
        }
      } else if (user.role === 'faculty') {
        // Check if faculty member profile exists
        const existingFaculty = await FacultyMember.findOne({ user: user._id });
        
        if (!existingFaculty) {
          try {
            // Get or create default faculty department
            let defaultFaculty = await Faculty.findOne();
            if (!defaultFaculty) {
              defaultFaculty = new Faculty({
                name: 'General Faculty',
                code: 'GEN',
                description: 'General Faculty Department'
              });
              await defaultFaculty.save();
              console.log('✅ Created default faculty department');
            }

            // Generate employeeId
            const facultyCount = await FacultyMember.countDocuments();
            const employeeId = `FAC${String(facultyCount + 1).padStart(4, '0')}`;
            
            const facultyMember = new FacultyMember({
              user: user._id,
              employeeId: employeeId,
              department: defaultFaculty._id,
              position: 'Instructor',
              status: 'pending',
              isApproved: false
            });
            
            await facultyMember.save();
            console.log(`✅ Created faculty profile for ${user.username} (${employeeId})`);
            facultyFixed++;
          } catch (error) {
            console.error(`❌ Failed to create faculty profile for ${user.username}:`, error.message);
          }
        }
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Students fixed: ${studentsFixed}`);
    console.log(`   Faculty fixed: ${facultyFixed}`);
    console.log(`   Total users processed: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  fixUserProfiles();
}

module.exports = fixUserProfiles;