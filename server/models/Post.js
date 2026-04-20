const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    category: {
        type: String,
        enum: ['General', 'Backend Development', 'Frontend Development', 'Data Science', 'AI/ML', 'DevOps', 'Interview Experience', 'Job Hiring'],
        default: 'General'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    mediaUrl: String,
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    jobData: {
        role: String,
        company: String,
        location: String,
        applyLink: String,
        isHiringPost: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
