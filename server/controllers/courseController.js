const courseRecommendations = require('../config/courseRecommendations');

const getRecommendations = async (req, res) => {
    try {
        const { missingSkills } = req.body;

        if (!missingSkills || !Array.isArray(missingSkills)) {
            return res.status(400).json({ message: 'Missing skills must be an array' });
        }

        if (missingSkills.length === 0) {
            return res.json({
                status: 'career-ready',
                message: 'You are career-ready!',
                courses: []
            });
        }

        let recommendedCourses = [];
        const seenCourses = new Set();

        // Map each missing skill to its corresponding courses
        missingSkills.forEach(skill => {
            const normalizedSkill = skill.toLowerCase();
            const courses = courseRecommendations[normalizedSkill];

            if (courses) {
                courses.forEach(course => {
                    if (!seenCourses.has(course.link)) {
                        recommendedCourses.push(course);
                        seenCourses.add(course.link);
                    }
                });
            }
        });

        // Limit to 5 courses
        recommendedCourses = recommendedCourses.slice(0, 5);

        // If no curated courses found for specifically missing skills, 
        // return an empty array but status 'gap' to show gaps message on frontend
        res.status(200).json({
            status: 'gap',
            courses: recommendedCourses
        });

    } catch (error) {
        console.error('Course recommendation error:', error);
        res.status(500).json({ message: 'Error fetching course recommendations' });
    }
};

module.exports = {
    getRecommendations
};
