import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../Loader/Loader';
import UploadSection from './UploadSection';
import AnalysisResults from './AnalysisResults';
import CoursesSection from './CoursesSection';

import './Dashboard.css';

const Dashboard = () => {
    const [analysis, setAnalysis] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUploadSuccess = (data) => {
        setAnalysis(data.analysis);
        setAssessment(data.assessment);
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
                        <AnalysisResults
                            assessment={assessment}
                            analysis={analysis}
                            onReset={() => setAssessment(null)}
                        />
                    )}

                    {assessment && <CoursesSection missingSkills={assessment.missingSkills} />}

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
