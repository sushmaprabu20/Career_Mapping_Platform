const path = require('path');
const fs = require('fs');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Student = require('../models/Student');
const SkillAssessment = require('../models/SkillAssessment');
const { extractText } = require('../services/parserService');
const { extractSkills } = require('../services/skillExtractionService');
const careerConfig = require('../config/careerConfig');
const { getSkillsForCareer } = require('../services/aiService');

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { targetCareer } = req.body;
        if (!targetCareer) {
            return res.status(400).json({ message: 'Target career is required' });
        }

        // Get required skills: from config OR dynamically from Groq
        let requiredSkills = careerConfig[targetCareer];
        if (!requiredSkills) {
            console.log(`[ANALYSIS] Career ${targetCareer} not in config. Fetching from AI...`);
            requiredSkills = await getSkillsForCareer(targetCareer);
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // 1. Extract text
        console.log(`[ANALYSIS] Starting text extraction for file: ${req.file.originalname} (${req.file.mimetype})`);
        const extractedText = await extractText(req.file);
        if (!extractedText) throw new Error('Text extraction returned empty content');
        console.log(`[ANALYSIS] Text extracted successfully. Length: ${extractedText.length}`);

        // 2. Extract skills
        console.log('[ANALYSIS] Extracting skills from text...');
        const extractedSkills = extractSkills(extractedText);
        console.log('[ANALYSIS] Extracted skills:', extractedSkills);

        // 3. Find or create student
        console.log(`[ANALYSIS] Updating student profile for user ID: ${req.user._id}`);
        let student = await Student.findOne({ user: req.user._id });
        if (!student) {
            console.log('[ANALYSIS] Creating new student profile');
            student = await Student.create({
                user: req.user._id,
                targetCareer,
                skills: extractedSkills
            });
        } else {
            console.log('[ANALYSIS] Updating existing student profile');
            student.targetCareer = targetCareer;
            student.skills = Array.from(new Set([...student.skills, ...extractedSkills]));
            await student.save();
        }
        console.log('[ANALYSIS] Student profile updated successfully');

        // 4. Calculate Alternative Careers (based on known config)
        console.log('[ANALYSIS] Calculating alternative career recommendations...');
        const allCareers = Object.keys(careerConfig);
        const recommendations = allCareers
            .map(career => {
                const careerSkills = careerConfig[career];
                const matchedForThisCareer = extractedSkills.filter(skill =>
                    careerSkills.some(cs => cs.toLowerCase() === skill.toLowerCase())
                );
                const score = Math.round((matchedForThisCareer.length / careerSkills.length) * 100);
                return {
                    career,
                    matchScore: score,
                    matchedSkills: matchedForThisCareer
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3); // Get top 3 alternatives

        console.log('[ANALYSIS] Alternative recommendations:', recommendations.map(r => r.career));

        // 5. Save analysis
        console.log('[ANALYSIS] Saving raw analysis results...');
        const analysis = await ResumeAnalysis.create({
            student: student._id,
            fileName: req.file.originalname,
            extractedText,
            extractedSkills,
            alternativeCareers: recommendations
        });
        console.log(`[ANALYSIS] Analysis record created with ID: ${analysis._id}`);

        // 5. Skill gap analysis
        console.log(`[ANALYSIS] Performing skill gap analysis for target career: ${targetCareer}`);
        // requiredSkills is already set above (config or AI)
        const matchedSkills = extractedSkills.filter(skill =>
            requiredSkills.some(reqSkill => reqSkill.toLowerCase() === skill.toLowerCase())
        );
        const missingSkills = requiredSkills.filter(reqSkill =>
            !extractedSkills.some(skill => skill.toLowerCase() === reqSkill.toLowerCase())
        );

        const readinessScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);

        let feasibility = 'Low';
        if (readinessScore > 75) feasibility = 'High';
        else if (readinessScore >= 50) feasibility = 'Medium';

        console.log(`[ANALYSIS] Results - Score: ${readinessScore}%, Feasibility: ${feasibility}`);

        const assessment = await SkillAssessment.create({
            student: student._id,
            targetCareer,
            requiredSkills,
            missingSkills,
            matchedSkills,
            readinessScore,
            feasibility
        });
        console.log(`[ANALYSIS] Skill assessment record created with ID: ${assessment._id}`);

        // Remove file after processing
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('[ANALYSIS] Internal temporary file cleaned up');
        }

        console.log('[ANALYSIS] COMPLETED SUCCESSFULLY');
        res.status(201).json({
            analysis,
            assessment
        });
    } catch (error) {
        console.error('[ANALYSIS] CRITICAL ERROR:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('[ANALYSIS] Cleanup: Deleted temporary file after error');
            } catch (cleanupErr) {
                console.error('[ANALYSIS] Cleanup failed:', cleanupErr);
            }
        }
        res.status(500).json({
            message: 'Server error during resume analysis',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const analyzeManualSkills = async (req, res) => {
    try {
        const { targetCareer, manualSkills } = req.body;
        if (!targetCareer) {
            return res.status(400).json({ message: 'Target career is required' });
        }

        // Get required skills: from config OR dynamically from Groq
        let requiredSkills = careerConfig[targetCareer];
        if (!requiredSkills) {
            console.log(`[MANUAL ANALYSIS] Career ${targetCareer} not in config. Fetching from AI...`);
            requiredSkills = await getSkillsForCareer(targetCareer);
        }
        if (!manualSkills) {
            return res.status(400).json({ message: 'Skills are required for manual analysis' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // 1. Extract/Normalize skills from manual input
        console.log(`[MANUAL ANALYSIS] Processing manual skills for user ID: ${req.user._id}`);
        // We can treat manualSkills as text and use our robust extractor
        const extractedSkills = extractSkills(manualSkills);
        console.log('[MANUAL ANALYSIS] Normalized skills:', extractedSkills);

        // 2. Find or create student
        let student = await Student.findOne({ user: req.user._id });
        if (!student) {
            student = await Student.create({
                user: req.user._id,
                targetCareer,
                skills: extractedSkills
            });
        } else {
            student.targetCareer = targetCareer;
            student.skills = Array.from(new Set([...student.skills, ...extractedSkills]));
            await student.save();
        }

        // 3. Calculate Alternative Careers
        const allCareers = Object.keys(careerConfig);
        const recommendations = allCareers
            .map(career => {
                const careerSkills = careerConfig[career];
                const matchedForThisCareer = extractedSkills.filter(skill =>
                    careerSkills.some(cs => cs.toLowerCase() === skill.toLowerCase())
                );
                const score = Math.round((matchedForThisCareer.length / careerSkills.length) * 100);
                return {
                    career,
                    matchScore: score,
                    matchedSkills: matchedForThisCareer
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3);

        // 4. Skill gap analysis
        // requiredSkills already set above (config or AI)
        const matchedSkills = extractedSkills.filter(skill =>
            requiredSkills.some(reqSkill => reqSkill.toLowerCase() === skill.toLowerCase())
        );
        const missingSkills = requiredSkills.filter(reqSkill =>
            !extractedSkills.some(skill => skill.toLowerCase() === reqSkill.toLowerCase())
        );

        const readinessScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);

        let feasibility = 'Low';
        if (readinessScore > 75) feasibility = 'High';
        else if (readinessScore >= 50) feasibility = 'Medium';

        const assessment = await SkillAssessment.create({
            student: student._id,
            targetCareer,
            requiredSkills,
            missingSkills,
            matchedSkills,
            readinessScore,
            feasibility
        });

        console.log('[MANUAL ANALYSIS] COMPLETED SUCCESSFULLY');
        res.status(201).json({
            analysis: { extractedSkills, alternativeCareers: recommendations },
            assessment
        });
    } catch (error) {
        console.error('[MANUAL ANALYSIS] CRITICAL ERROR:', error);
        res.status(500).json({
            message: 'Server error during manual skill analysis',
            error: error.message
        });
    }
};

module.exports = {
    uploadResume,
    analyzeManualSkills
};
