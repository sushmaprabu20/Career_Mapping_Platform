const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Fetches the required skills for a given career target using Groq API.
 * @param {string} careerTarget - The name of the career (e.g., 'Cloud Architect').
 * @returns {Promise<string[]>} - A list of skills.
 */
exports.getSkillsForCareer = async (careerTarget) => {
    try {
        console.log(`[AI SERVICE] Fetching skills for: ${careerTarget}`);
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a career expert. Return a JSON object containing a "skills" key which is an array of strings representing the technical skills required for the given career. Example: {"skills": ["Java", "Spring Boot"]}. Return only the JSON, nothing else.'
                },
                {
                    role: 'user',
                    content: `What are the technical skills required for a ${careerTarget}?`
                }
            ],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        const parsed = JSON.parse(content);
        
        // Handle different possible JSON structures from AI
        const skills = parsed.skills || parsed.technical_skills || Object.values(parsed)[0];
        
        if (Array.isArray(skills)) {
            console.log(`[AI SERVICE] Found ${skills.length} skills for ${careerTarget}`);
            return skills;
        }
        
        throw new Error('AI response did not contain a valid skills array');
    } catch (error) {
        console.error('[AI SERVICE] Error fetching skills:', error);
        // Fallback to empty array or throw error
        throw error;
    }
};
