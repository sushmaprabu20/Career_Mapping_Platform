const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    applyLink: {
        type: String,
        required: true
    },
    source: {
        type: String,
        enum: ['Naukri', 'Indeed', 'HR', 'Referral'],
        default: 'Naukri'
    },
    domain: {
        type: String,
        enum: ['Backend Development', 'Frontend Development', 'AI/ML', 'Data Science', 'DevOps & Cloud', 'General'],
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Null for Naukri jobs
    },
    salary: String,
    experience: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
