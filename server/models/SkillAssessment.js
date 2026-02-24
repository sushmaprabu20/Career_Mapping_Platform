const mongoose = require('mongoose');

const skillAssessmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    targetCareer: {
        type: String,
        required: true,
    },
    requiredSkills: [String],
    missingSkills: [String],
    matchedSkills: [String],
    readinessScore: {
        type: Number,
        required: true,
    },
    feasibility: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('SkillAssessment', skillAssessmentSchema);
