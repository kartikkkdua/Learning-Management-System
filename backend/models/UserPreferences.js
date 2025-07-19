const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    notifications: {
        email: {
            enabled: { type: Boolean, default: true },
            frequency: {
                type: String,
                enum: ['immediate', 'daily', 'weekly'],
                default: 'immediate'
            },
            types: {
                assignment_due: { type: Boolean, default: true },
                grade_posted: { type: Boolean, default: true },
                enrollment_confirmation: { type: Boolean, default: true },
                course_update: { type: Boolean, default: true },
                registration_reminder: { type: Boolean, default: true },
                announcement: { type: Boolean, default: true }
            }
        },
        push: {
            enabled: { type: Boolean, default: true },
            types: {
                assignment_due: { type: Boolean, default: true },
                grade_posted: { type: Boolean, default: true },
                enrollment_confirmation: { type: Boolean, default: true },
                course_update: { type: Boolean, default: false },
                registration_reminder: { type: Boolean, default: true },
                announcement: { type: Boolean, default: false }
            }
        },
        sms: {
            enabled: { type: Boolean, default: false },
            phoneNumber: String,
            types: {
                assignment_due: { type: Boolean, default: false },
                grade_posted: { type: Boolean, default: false },
                enrollment_confirmation: { type: Boolean, default: false },
                course_update: { type: Boolean, default: false },
                registration_reminder: { type: Boolean, default: true },
                announcement: { type: Boolean, default: false }
            }
        }
    },
    dashboard: {
        layout: {
            type: String,
            enum: ['default', 'compact', 'detailed'],
            default: 'default'
        },
        widgets: {
            upcomingAssignments: { type: Boolean, default: true },
            recentGrades: { type: Boolean, default: true },
            courseSchedule: { type: Boolean, default: true },
            announcements: { type: Boolean, default: true },
            academicProgress: { type: Boolean, default: true },
            calendarEvents: { type: Boolean, default: true }
        },
        defaultTab: {
            type: String,
            enum: ['dashboard', 'courses', 'assignments', 'grades', 'calendar'],
            default: 'dashboard'
        }
    },
    appearance: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'America/New_York'
        },
        dateFormat: {
            type: String,
            enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
            default: 'MM/DD/YYYY'
        },
        timeFormat: {
            type: String,
            enum: ['12h', '24h'],
            default: '12h'
        }
    },
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'course_members', 'private'],
            default: 'course_members'
        },
        showOnlineStatus: { type: Boolean, default: true },
        allowDirectMessages: { type: Boolean, default: true },
        shareAcademicProgress: { type: Boolean, default: false }
    },
    accessibility: {
        highContrast: { type: Boolean, default: false },
        largeText: { type: Boolean, default: false },
        screenReader: { type: Boolean, default: false },
        keyboardNavigation: { type: Boolean, default: false },
        reducedMotion: { type: Boolean, default: false }
    },
    academic: {
        defaultSemesterView: {
            type: String,
            enum: ['current', 'all'],
            default: 'current'
        },
        gradeDisplayFormat: {
            type: String,
            enum: ['percentage', 'letter', 'both'],
            default: 'both'
        },
        showGPA: { type: Boolean, default: true },
        autoEnrollWaitlist: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);