const skillKeywords = {
    'frontend': [
        'react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css',
        'sass', 'tailwind', 'next.js', 'redux', 'frontend', 'web development'
    ],
    'backend': [
        'node.js', 'express', 'mongodb', 'mongoose', 'sql', 'postgresql',
        'python', 'django', 'flask', 'java', 'spring boot', 'rest api', 'graphql',
        'backend', 'microservices'
    ],
    'data-science': [
        'python', 'r', 'machine learning', 'data science', 'pandas', 'numpy',
        'scikit-learn', 'tensorflow', 'pytorch', 'sql', 'big data', 'nlp'
    ],
    'devops': [
        'docker', 'kubernetes', 'aws', 'azure', 'cicd', 'jenkins', 'terraform',
        'linux', 'git', 'infrastructure as code', 'monitoring'
    ]
};

const extractSkills = (text) => {
    const foundSkills = new Set();
    const lowerText = text.toLowerCase();

    Object.values(skillKeywords).flat().forEach(skill => {
        // Escape special characters for regex
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        if (regex.test(lowerText)) {
            foundSkills.add(skill);
        }
    });

    return Array.from(foundSkills);
};

module.exports = {
    extractSkills,
    skillKeywords
};
