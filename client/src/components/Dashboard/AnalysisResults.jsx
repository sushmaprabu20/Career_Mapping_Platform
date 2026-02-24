import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './Analysis.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AnalysisResults = ({ assessment, onReset }) => {
    const { readinessScore, targetCareer, matchedSkills, missingSkills, feasibility } = assessment;

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
                    <p>We've analyzed your skills against the industry standards for this role.</p>
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
                </div>
            </div>
        </div>
    );
};


export default AnalysisResults;
