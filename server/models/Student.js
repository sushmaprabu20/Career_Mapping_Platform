const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    currentCareer: {
        type: String,
    },
    targetCareer: {
        type: String,
    },
    skills: [String],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Student', studentSchema);
