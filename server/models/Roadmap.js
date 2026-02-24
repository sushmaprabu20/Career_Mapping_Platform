const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    targetCareer: {
        type: String,
        required: true,
    },
    missingSkills: [String],
    readinessScore: Number,
    generatedRoadmap: {
        type: Object, // Structured AI response
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
