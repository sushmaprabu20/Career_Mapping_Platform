const mongoose = require('mongoose');
const Group = require('../models/Group');
const { updateJobDatabase } = require('../services/jobService');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedJobHiringGroup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const jobHiringGroup = {
            name: 'Job Hiring / Opportunities',
            domain: 'Job Hiring',
            description: 'Latest job openings from Naukri, HR postings, and referral opportunities.',
            members: []
        };

        const existing = await Group.findOne({ domain: 'Job Hiring' });
        if (existing) {
            console.log('Job Hiring group already exists.');
        } else {
            await Group.create(jobHiringGroup);
            console.log('Job Hiring group created successfully.');
        }

        // Clear existing platform jobs to ensure links are refreshed
        console.log('Clearing old platform jobs...');
        const Job = require('../models/Job');
        await Job.deleteMany({ source: { $in: ['Naukri', 'Indeed'] } });

        // Run initial job fetch
        console.log('Running initial job fetch...');
        await updateJobDatabase();

        mongoose.connection.close();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedJobHiringGroup();
