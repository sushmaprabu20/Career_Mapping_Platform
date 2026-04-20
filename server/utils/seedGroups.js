const mongoose = require('mongoose');
const Group = require('../models/Group');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const domainGroups = [
    {
        name: 'Backend Development',
        domain: 'Backend Development',
        description: 'Discuss Node.js, Python, Databases, API design and System Architecture.',
        icon: 'Server'
    },
    {
        name: 'Frontend Development',
        domain: 'Frontend Development',
        description: 'Everything about React, Vue, CSS, UI/UX and modern frontend tools.',
        icon: 'Layout'
    },
    {
        name: 'AI / ML',
        domain: 'AI / ML',
        description: 'Explore Machine Learning, Neural Networks, NLP and the future of AI.',
        icon: 'Cpu'
    },
    {
        name: 'Data Science',
        domain: 'Data Science',
        description: 'Data analysis, visualization, statistics and big data discussions.',
        icon: 'Database'
    },
    {
        name: 'DevOps & Cloud',
        domain: 'DevOps & Cloud',
        description: 'CI/CD, Docker, Kubernetes, AWS/Azure/GCP and cloud infrastructure.',
        icon: 'Cloud'
    }
];

const seedGroups = async () => {
    try {
        await connectDB();
        
        for (const groupData of domainGroups) {
            const exists = await Group.findOne({ name: groupData.name });
            if (!exists) {
                await Group.create(groupData);
                console.log(`Created group: ${groupData.name}`);
            } else {
                console.log(`Group already exists: ${groupData.name}`);
            }
        }
        
        console.log('Seeding completed successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding groups:', error);
        process.exit(1);
    }
};

seedGroups();
