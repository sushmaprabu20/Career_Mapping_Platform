import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import RoadmapModal from './RoadmapModal';
import './Analysis.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent match! You have a very strong foundation for this role.";
    if (score >= 60) return "Great match! You're on the right track, just refine a few skills.";
    if (score >= 40) return "Strong potential. Focused learning on key gaps will get you there.";
    return "We've identified several key areas to build upon for this career path.";
};

const AnalysisResults = ({ assessment, analysis, onReset }) => {
    const { readinessScore, targetCareer, matchedSkills, missingSkills, feasibility } = assessment;
    const [showRoadmap, setShowRoadmap] = useState(false);

    const chartData = {
        datasets: [{
            data: [readinessScore, 100 - readinessScore],
            backgroundColor: ['#ff5722', '#e0e6e8'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
        }],
    };

    return (
        <div className="analysis-results">
            <div className="results-header">
                <button onClick={onReset} className="btn-back">← Upload Different Resume</button>
                <div className={`feasibility-badge ${feasibility.toLowerCase()}`}>
                    {feasibility} Transition Feasibility
                </div>
            </div>

            <div className="results-hero card">
                <div className="readiness-chart">
                    <Doughnut
                        data={chartData}
                        options={{
                            cutout: '82%',
                            plugins: { tooltip: { enabled: false }, legend: { display: false } },
                            maintainAspectRatio: false
                        }}
                    />
                    <div className="readiness-text">
                        <span className="score">{readinessScore}%</span>
                        <span className="label">Match Score</span>
                    </div>
                </div>
                <div className="hero-stats">
                    <h2>Targeting: {targetCareer}</h2>
                    <p>{getScoreMessage(readinessScore)}</p>
                </div>
            </div>

            <div className="skill-grid">
                <div className="skill-card card matched">
                    <h3><CheckCircle size={22} color="#38a169" /> Strengths Identified</h3>
                    <ul>
                        {matchedSkills.map(skill => <li key={skill}>{skill}</li>)}
                    </ul>
                </div>
                <div className="skill-card card missing">
                    <h3><AlertCircle size={22} color="#e53e3e" /> Critical Skill Gaps</h3>
                    <ul>
                        {missingSkills.map(skill => <li key={skill}>{skill}</li>)}
                    </ul>
                    {missingSkills.length > 0 && (
                        <button
                            className="btn-generate-roadmap-card"
                            onClick={() => setShowRoadmap(true)}
                        >
                            <Sparkles size={16} />
                            Generate Roadmap
                        </button>
                    )}
                </div>
            </div>

            {analysis?.alternativeCareers?.length > 0 && (
                <div className="alternative-careers card">
                    <h3>Recommended Alternative Career Paths</h3>
                    <p>Based on your detected skills, you might also be a strong fit for:</p>
                    <div className="alternatives-grid">
                        {analysis.alternativeCareers.map((alt, index) => (
                            <div key={index} className="alt-career-item">
                                <div className="alt-name">{alt.career}</div>
                                <div className="alt-score">{alt.matchScore}% Match</div>
                                <div className="alt-skills">
                                    {alt.matchedSkills.slice(0, 3).join(', ')}
                                    {alt.matchedSkills.length > 3 && '...'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showRoadmap && (
                <RoadmapModal
                    missingSkills={missingSkills}
                    targetCareer={targetCareer}
                    readinessScore={readinessScore}
                    onClose={() => setShowRoadmap(false)}
                />
            )}
        </div>
    );
};


export default AnalysisResults;
