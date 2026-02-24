import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../Loader/Loader';
import UploadSection from './UploadSection';
import AnalysisResults from './AnalysisResults';
import RoadmapSection from '../Roadmap/RoadmapSection';
import CoursesSection from './CoursesSection';

import './Dashboard.css';

const Dashboard = () => {
    const [analysis, setAnalysis] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);
    const [roadmapLoading, setRoadmapLoading] = useState(false);

    const handleUploadSuccess = (data) => {
        setAnalysis(data.analysis);
        setAssessment(data.assessment);
        setRoadmap(null); // Clear old roadmap on new analysis
    };

    const handleGenerateRoadmap = async () => {
        setRoadmapLoading(true);
        try {
            const { data } = await api.post('/roadmap/generate');
            setRoadmap(data);
        } catch (err) {
            console.error('Roadmap generation failed:', err);
            const resData = err.response?.data;
            const errorMessage = resData?.message || 'Error generating roadmap';
            const errorDetail = resData?.error || err.message || '';

            alert(`Error: ${errorMessage}\nDetail: ${errorDetail}`);
        } finally {

            setRoadmapLoading(false);
        }
    };


    return (
        <div className="dashboard-container">
            {loading && <Loader />}

            <div className="dashboard-header">
                <h1>Career Intelligence Dashboard</h1>
                <p>Track your progress and map your transition to {assessment ? assessment.targetCareer : 'your dream role'}</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-main">
                    {!assessment ? (
                        <UploadSection onUploadStart={() => setLoading(true)} onUploadSuccess={(data) => {
                            setLoading(false);
                            handleUploadSuccess(data);
                        }} onUploadError={() => setLoading(false)} />
                    ) : (
                        <AnalysisResults assessment={assessment} onReset={() => setAssessment(null)} />
                    )}

                    {assessment && !roadmap && (
                        <div className="generate-roadmap-cta">
                            <button
                                onClick={handleGenerateRoadmap}
                                disabled={roadmapLoading}
                                className="btn-primary"
                            >
                                {roadmapLoading ? 'Generating AI Roadmap...' : 'Generate 3-Month Learning Roadmap'}
                            </button>
                        </div>
                    )}

                    {roadmap && <RoadmapSection roadmap={roadmap} />}
                    {assessment && <CoursesSection missingSkills={assessment.missingSkills} />}

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
