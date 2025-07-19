const mongoose = require('mongoose');
const AcademicCalendar = require('./models/AcademicCalendar');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedCalendarData = async () => {
    try {
        console.log('Starting academic calendar seeding...');

        // Create Academic Calendar for 2024-2025
        const academicCalendar = {
            academicYear: '2024-2025',
            semester: 'Fall',
            events: [
                {
                    title: 'Fall Semester Registration Opens',
                    description: 'Registration for Fall 2024 semester begins for all students',
                    type: 'registration',
                    startDate: new Date('2024-08-01'),
                    endDate: new Date('2024-08-15'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Fall Classes Begin',
                    description: 'First day of Fall 2024 semester classes',
                    type: 'classes_start',
                    startDate: new Date('2024-08-26'),
                    isImportant: true,
                    targetAudience: 'all'
                },
                {
                    title: 'Labor Day Holiday',
                    description: 'University closed - No classes',
                    type: 'holiday',
                    startDate: new Date('2024-09-02'),
                    isImportant: false,
                    targetAudience: 'all'
                },
                {
                    title: 'Add/Drop Deadline',
                    description: 'Last day to add or drop courses without penalty',
                    type: 'deadline',
                    startDate: new Date('2024-09-06'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Midterm Exams',
                    description: 'Midterm examination period',
                    type: 'exam_period',
                    startDate: new Date('2024-10-14'),
                    endDate: new Date('2024-10-18'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Spring Registration Opens',
                    description: 'Registration for Spring 2025 semester begins',
                    type: 'registration',
                    startDate: new Date('2024-11-01'),
                    endDate: new Date('2024-11-15'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Thanksgiving Break',
                    description: 'Thanksgiving holiday break',
                    type: 'holiday',
                    startDate: new Date('2024-11-28'),
                    endDate: new Date('2024-11-29'),
                    isImportant: false,
                    targetAudience: 'all'
                },
                {
                    title: 'Fall Classes End',
                    description: 'Last day of Fall 2024 semester classes',
                    type: 'classes_end',
                    startDate: new Date('2024-12-06'),
                    isImportant: true,
                    targetAudience: 'all'
                },
                {
                    title: 'Final Exams',
                    description: 'Final examination period',
                    type: 'exam_period',
                    startDate: new Date('2024-12-09'),
                    endDate: new Date('2024-12-13'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Fall Graduation',
                    description: 'Fall 2024 commencement ceremony',
                    type: 'graduation',
                    startDate: new Date('2024-12-15'),
                    isImportant: true,
                    targetAudience: 'all'
                }
            ],
            registrationPeriods: {
                earlyRegistration: {
                    startDate: new Date('2024-07-15'),
                    endDate: new Date('2024-07-31'),
                    eligibleStudents: ['senior', 'junior']
                },
                regularRegistration: {
                    startDate: new Date('2024-08-01'),
                    endDate: new Date('2024-08-15')
                },
                lateRegistration: {
                    startDate: new Date('2024-08-16'),
                    endDate: new Date('2024-08-25'),
                    lateFee: 50
                }
            },
            isActive: true
        };

        // Check if calendar already exists
        const existingCalendar = await AcademicCalendar.findOne({
            academicYear: '2024-2025',
            semester: 'Fall'
        });

        if (!existingCalendar) {
            const calendar = new AcademicCalendar(academicCalendar);
            await calendar.save();
            console.log('Created Fall 2024-2025 academic calendar');
        } else {
            console.log('Fall 2024-2025 academic calendar already exists');
        }

        // Create Spring 2025 Calendar
        const springCalendar = {
            academicYear: '2024-2025',
            semester: 'Spring',
            events: [
                {
                    title: 'Spring Semester Registration Opens',
                    description: 'Registration for Spring 2025 semester begins',
                    type: 'registration',
                    startDate: new Date('2025-01-01'),
                    endDate: new Date('2025-01-15'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Spring Classes Begin',
                    description: 'First day of Spring 2025 semester classes',
                    type: 'classes_start',
                    startDate: new Date('2025-01-20'),
                    isImportant: true,
                    targetAudience: 'all'
                },
                {
                    title: 'Presidents Day Holiday',
                    description: 'University closed - No classes',
                    type: 'holiday',
                    startDate: new Date('2025-02-17'),
                    isImportant: false,
                    targetAudience: 'all'
                },
                {
                    title: 'Spring Break',
                    description: 'Spring break - No classes',
                    type: 'holiday',
                    startDate: new Date('2025-03-10'),
                    endDate: new Date('2025-03-14'),
                    isImportant: false,
                    targetAudience: 'all'
                },
                {
                    title: 'Midterm Exams',
                    description: 'Midterm examination period',
                    type: 'exam_period',
                    startDate: new Date('2025-03-17'),
                    endDate: new Date('2025-03-21'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Fall Registration Opens',
                    description: 'Registration for Fall 2025 semester begins',
                    type: 'registration',
                    startDate: new Date('2025-04-01'),
                    endDate: new Date('2025-04-15'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Spring Classes End',
                    description: 'Last day of Spring 2025 semester classes',
                    type: 'classes_end',
                    startDate: new Date('2025-05-02'),
                    isImportant: true,
                    targetAudience: 'all'
                },
                {
                    title: 'Final Exams',
                    description: 'Final examination period',
                    type: 'exam_period',
                    startDate: new Date('2025-05-05'),
                    endDate: new Date('2025-05-09'),
                    isImportant: true,
                    targetAudience: 'students'
                },
                {
                    title: 'Spring Graduation',
                    description: 'Spring 2025 commencement ceremony',
                    type: 'graduation',
                    startDate: new Date('2025-05-12'),
                    isImportant: true,
                    targetAudience: 'all'
                }
            ],
            registrationPeriods: {
                earlyRegistration: {
                    startDate: new Date('2024-12-01'),
                    endDate: new Date('2024-12-15'),
                    eligibleStudents: ['senior', 'junior']
                },
                regularRegistration: {
                    startDate: new Date('2025-01-01'),
                    endDate: new Date('2025-01-15')
                },
                lateRegistration: {
                    startDate: new Date('2025-01-16'),
                    endDate: new Date('2025-01-19'),
                    lateFee: 50
                }
            },
            isActive: false // Not currently active
        };

        const existingSpringCalendar = await AcademicCalendar.findOne({
            academicYear: '2024-2025',
            semester: 'Spring'
        });

        if (!existingSpringCalendar) {
            const springCal = new AcademicCalendar(springCalendar);
            await springCal.save();
            console.log('Created Spring 2024-2025 academic calendar');
        } else {
            console.log('Spring 2024-2025 academic calendar already exists');
        }

        console.log('Academic calendar seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding academic calendar:', error);
        process.exit(1);
    }
};

// Run the seeding
seedCalendarData();