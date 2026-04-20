const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');
const cron = require('node-cron');

const DOMAINS = ['Backend Development', 'Frontend Development', 'AI/ML', 'Data Science', 'DevOps & Cloud'];

/**
 * MOCK SCRAPER: Simulates fetching jobs from Naukri.
 * In a real production app, you'd use a dedicated Job API or a headless browser (Puppeteer)
 * as Naukri has strong anti-scraping measures.
 */
const fetchNaukriJobs = async (domain) => {
    console.log(`[JOB SERVICE] Simulating Naukri fetch for: ${domain}`);
    
    // Simulate real-world results based on domain
    const mockJobs = [
        {
            role: 'Backend Developer',
            company: 'Stutzen Corporates',
            location: 'Sivakasi',
            description: 'Building robust backend systems and APIs. 0-1 years experience required.',
            applyLink: 'https://www.naukri.com/job-listings-backend-developer-stutzen-corporates-private-limited-sivakasi-0-to-1-years-190326505447?src=jobsearchDesk&sid=17767025641385458_4&xp=1&px=1&nignbevent_src=jobsearchDeskGNB',
            domain: 'Backend Development',
            source: 'Naukri'
        },
        {
            role: 'Software Developer',
            company: 'Ambion Softwares',
            location: 'India',
            description: 'Explore various developer roles and career opportunities at Ambion Softwares.',
            applyLink: 'https://www.naukri.com/ambion-softwares-jobs-careers-6357872',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'Frontend Developer',
            company: 'Shrewd Business Solutions',
            location: 'Coimbatore',
            description: 'Creating responsive and interactive web interfaces using modern frontend frameworks.',
            applyLink: 'https://www.naukri.com/job-listings-frontend-developer-shrewd-business-solutions-coimbatore-0-to-2-years-131125503792?src=jobsearchDesk&sid=17767025641385458_5&xp=1&px=1&nignbevent_src=jobsearchDeskGNB',
            domain: 'Frontend Development',
            source: 'Naukri'
        },
        {
            role: 'Custom Software Engineer',
            company: 'Accenture',
            location: 'Chennai',
            description: 'Develop and maintain custom software solutions for enterprise clients. 0-1 years experience.',
            applyLink: 'https://www.naukri.com/job-listings-custom-software-engineer-accenture-solutions-pvt-ltd-chennai-0-to-1-years-100426916818?src=jobsearchDesk&sid=17767025641385458_2&xp=1&px=1&nignbevent_src=jobsearchDeskGNB',
            domain: 'Backend Development',
            source: 'Naukri'
        },
        {
            role: 'UI Designer / Developer',
            company: 'Acumen Technologies',
            location: 'Madurai / Chennai / Coimbatore',
            description: 'Create stunning UI/UX designs and implement them using modern frontend technologies.',
            applyLink: 'https://www.naukri.com/job-listings-ui-designer-developer-acumen-technologies-private-limited-madurai-tiruppur-salem-chennai-tiruchirapalli-coimbatore-0-to-2-years-250723500453?src=jobsearchDesk&sid=17767025641385458_3&xp=1&px=1&nignbevent_src=jobsearchDeskGNB',
            domain: 'Frontend Development',
            source: 'Naukri'
        },
        {
            role: 'Cloud Test Engineer',
            company: 'KnowledgeSprint Technologies',
            location: 'Hyderabad',
            description: 'Responsible for testing cloud-based applications and ensuring high quality deployments.',
            applyLink: 'https://www.naukri.com/job-listings-cloud-test-engineer-knowledgesprint-technologies-india-pvt-ltd-hyderabad-0-to-3-years-030426506149?src=jobsearchDesk&sid=17767025641385458_1&xp=3&px=1&nignbevent_src=jobsearchDeskGNB',
            domain: 'DevOps & Cloud',
            source: 'Naukri'
        },
        {
            role: 'Strategic Cloud Engineer - Data Analytics',
            company: 'Google',
            location: 'Hyderabad / Bengaluru',
            description: 'Strategy and implementation of data analytics solutions on Google Cloud Platform.',
            applyLink: 'https://www.naukri.com/job-listings-strategic-cloud-engineer-data-analytics-google-india-private-limited-hyderabad-bengaluru-0-to-0-years-090725503492?src=jobsearchDesk&sid=17767025641385458_1&xp=11&px=1&nignbevent_src=jobsearchDeskGNB',
            domain: 'Data Science',
            source: 'Naukri'
        },
        // --- 20+ Additional Mock Jobs Below ---
        {
            role: 'Junior AI Engineer',
            company: 'NextGen AI',
            location: 'Remote',
            description: 'Work on cutting-edge LLM applications and RAG systems.',
            applyLink: 'https://www.naukri.com/jobs-in-india?k=junior%20ai%20engineer',
            domain: 'AI/ML',
            source: 'Naukri'
        },
        {
            role: 'React Developer',
            company: 'Pixel Perfect',
            location: 'Pune',
            description: 'Building high-performance React applications with a focus on UX.',
            applyLink: 'https://www.naukri.com/jobs-in-pune?k=react%20developer',
            domain: 'Frontend Development',
            source: 'Naukri'
        },
        {
            role: 'Node.js Specialist',
            company: 'ServerSide Inc',
            location: 'Gurgaon',
            description: 'Expertise in microservices architecture and Node.js performance tuning.',
            applyLink: 'https://www.naukri.com/jobs-in-gurgaon?k=nodejs%20specialist',
            domain: 'Backend Development',
            source: 'Naukri'
        },
        {
            role: 'DevOps Engineer',
            company: 'CloudOps Solutions',
            location: 'Mumbai',
            description: 'Automate CI/CD pipelines and manage Kubernetes clusters.',
            applyLink: 'https://www.naukri.com/jobs-in-mumbai?k=devops%20engineer',
            domain: 'DevOps & Cloud',
            source: 'Naukri'
        },
        {
            role: 'Data Scientist',
            company: 'Insight Analytics',
            location: 'Delhi',
            description: 'Derive insights from structured and unstructured data using ML models.',
            applyLink: 'https://www.naukri.com/jobs-in-delhi?k=data%20scientist',
            domain: 'Data Science',
            source: 'Naukri'
        },
        {
            role: 'Full Stack Engineer',
            company: 'Startup Hub',
            location: 'Bengaluru',
            description: 'MERN stack developer to build end-to-end features.',
            applyLink: 'https://www.naukri.com/jobs-in-bangalore?k=full%20stack%20engineer',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'MLOps Engineer',
            company: 'AI Factory',
            location: 'Hyderabad',
            description: 'Deployment and monitoring of machine learning models in production.',
            applyLink: 'https://www.naukri.com/jobs-in-hyderabad?k=mlops%20engineer',
            domain: 'AI/ML',
            source: 'Naukri'
        },
        {
            role: 'Cybersecurity Analyst',
            company: 'SecureNet',
            location: 'Kolkata',
            description: 'Monitor systems for security breaches and implement defensive measures.',
            applyLink: 'https://www.naukri.com/jobs-in-kolkata?k=cybersecurity%20analyst',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'Android Developer',
            company: 'AppVenture',
            location: 'Ahmedabad',
            description: 'Develop high-quality mobile applications for the Android platform.',
            applyLink: 'https://www.naukri.com/jobs-in-ahmedabad?k=android%20developer',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'iOS Engineer',
            company: 'Apple Partner',
            location: 'Chandigarh',
            description: 'Experience with Swift and SwiftUI to build premium iOS apps.',
            applyLink: 'https://www.naukri.com/jobs-in-chandigarh?k=ios%20engineer',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'Blockchain Developer',
            company: 'CryptoLabs',
            location: 'Remote',
            description: 'Develop smart contracts and decentralized applications.',
            applyLink: 'https://www.naukri.com/jobs-in-india?k=blockchain%20developer',
            domain: 'Backend Development',
            source: 'Naukri'
        },
        {
            role: 'Python Developer',
            company: 'DataStream',
            location: 'Noida',
            description: 'Expertise in Django and Flask for scalable web services.',
            applyLink: 'https://www.naukri.com/jobs-in-noida?k=python%20developer',
            domain: 'Backend Development',
            source: 'Naukri'
        },
        {
            role: 'QA Automation Engineer',
            company: 'QualityFirst',
            location: 'Jaipur',
            description: 'Selenium and Cypress expertise for web application testing.',
            applyLink: 'https://www.naukri.com/jobs-in-jaipur?k=qa%20automation%20engineer',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'Cloud Architect',
            company: 'Enterprise Cloud',
            location: 'Lucknow',
            description: 'Design complex cloud infrastructure on AWS and Azure.',
            applyLink: 'https://www.naukri.com/jobs-in-lucknow?k=cloud%20architect',
            domain: 'DevOps & Cloud',
            source: 'Naukri'
        },
        {
            role: 'Product Designer',
            company: 'Creative Studio',
            location: 'Indore',
            description: 'Focus on user research and prototyping for digital products.',
            applyLink: 'https://www.naukri.com/jobs-in-indore?k=product%20designer',
            domain: 'Frontend Development',
            source: 'Naukri'
        },
        {
            role: 'SQL Developer',
            company: 'DB Solutions',
            location: 'Bhopal',
            description: 'Optimize complex queries and manage relational databases.',
            applyLink: 'https://www.naukri.com/jobs-in-bhopal?k=sql%20developer',
            domain: 'Backend Development',
            source: 'Naukri'
        },
        {
            role: 'Unity Game Developer',
            company: 'GameMakers',
            location: 'Remote',
            description: 'Build immersive 2D/3D games for PC and Mobile.',
            applyLink: 'https://www.naukri.com/jobs-in-india?k=unity%20game%20developer',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'Embedded Systems Engineer',
            company: 'HardwareTech',
            location: 'Nagpur',
            description: 'Programming microcontrollers and developing firmware.',
            applyLink: 'https://www.naukri.com/jobs-in-nagpur?k=embedded%20systems%20engineer',
            domain: 'General',
            source: 'Naukri'
        },
        {
            role: 'Natural Language Processing Engineer',
            company: 'SpeechAI',
            location: 'Vishakhapatnam',
            description: 'Developing speech recognition and text-to-speech systems.',
            applyLink: 'https://www.naukri.com/jobs-in-vishakhapatnam?k=nlp%20engineer',
            domain: 'AI/ML',
            source: 'Naukri'
        },
        {
            role: 'DevSecOps Engineer',
            company: 'ShieldCloud',
            location: 'Remote',
            description: 'Integrate security practices into the CI/CD pipeline.',
            applyLink: 'https://www.naukri.com/jobs-in-india?k=devsecops%20engineer',
            domain: 'DevOps & Cloud',
            source: 'Naukri'
        }
    ];

    return mockJobs.reverse();
};

const updateJobDatabase = async () => {
    console.log('[JOB SERVICE] Starting scheduled job update...');
    try {
        for (const domain of DOMAINS) {
            const jobs = await fetchNaukriJobs(domain);
            
            for (const jobData of jobs) {
                // Upsert jobs based on role + company + domain to avoid duplicates
                await Job.findOneAndUpdate(
                    { role: jobData.role, company: jobData.company, domain: jobData.domain },
                    jobData,
                    { upsert: true, new: true }
                );
            }
        }
        console.log('[JOB SERVICE] Database updated with latest jobs.');
    } catch (error) {
        console.error('[JOB SERVICE] Error updating jobs:', error);
    }
};

// Schedule to run every hour
cron.schedule('0 * * * *', () => {
    updateJobDatabase();
});

// Run once on startup
// updateJobDatabase();

module.exports = { updateJobDatabase };
