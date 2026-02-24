const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    extractedText: {
        type: String,
        required: true,
    },
    extractedSkills: [String],
}, {
    timestamps: true,
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
