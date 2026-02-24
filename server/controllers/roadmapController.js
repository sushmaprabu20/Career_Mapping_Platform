const Roadmap = require('../models/Roadmap');
const SkillAssessment = require('../models/SkillAssessment');
const Student = require('../models/Student');
const { generateAIRoadmap } = require('../services/geminiService');

const generateRoadmap = async (req, res) => {
    try {
        console.log('Roadmap generation requested for user:', req.user._id);
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            console.warn('Student profile not found for user:', req.user._id);
            return res.status(404).json({ message: 'Student profile not found. Please upload resume first.' });
        }

        const assessment = await SkillAssessment.findOne({ student: student._id }).sort({ createdAt: -1 });
        if (!assessment) {
            console.warn('No assessment found for student:', student._id);
            return res.status(404).json({ message: 'No skill assessment found. Please upload resume first.' });
        }

        const { targetCareer, missingSkills, readinessScore } = assessment;
        console.log(`Generating roadmap for ${targetCareer} (Readiness: ${readinessScore}%)`);

        const generatedRoadmap = await generateAIRoadmap(targetCareer, missingSkills, readinessScore);

        if (!generatedRoadmap) {
            throw new Error('AI Service returned null roadmap');
        }

        const roadmap = await Roadmap.create({
            student: student._id,
            targetCareer,
            missingSkills,
            readinessScore,
            generatedRoadmap
        });

        console.log('Roadmap saved successfully. ID:', roadmap._id);
        res.status(201).json(roadmap);
    } catch (error) {
        console.error('ROADMAP CONTROLLER ERROR:', error);
        res.status(500).json({
            message: 'Error generating roadmap',
            error: error.message,
            details: error.stack ? 'See server logs for stack trace' : undefined,
            tip: 'Please check if your Gemini API key is valid and has not reached its quota.'
        });
    }
};



const getLatestRoadmap = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Profile not found' });

        const roadmap = await Roadmap.findOne({ student: student._id }).sort({ createdAt: -1 });
        res.json(roadmap);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roadmap' });
    }
};

module.exports = {
    generateRoadmap,
    getLatestRoadmap
};
