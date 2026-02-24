import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check } from 'lucide-react';
import './Roadmap.css';

const RoadmapSection = ({ roadmap }) => {
    if (!roadmap || !roadmap.generatedRoadmap) return null;

    const { months } = roadmap.generatedRoadmap;

    if (!months || !Array.isArray(months)) {
        return (
            <div className="roadmap-section error">
                <p>Invalid roadmap data. Please try generating again.</p>
            </div>
        );
    }

    return (
        <div className="roadmap-section">
            <h2>Your Personalized 3-Month Roadmap</h2>
            <div className="months-container">
                {months.map((month, mIdx) => (
                    <motion.div
                        key={mIdx}
                        className="month-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mIdx * 0.2 }}
                    >
                        <div className="month-header">
                            <BookOpen size={24} />
                            <h3>Month {month.month || mIdx + 1}</h3>
                        </div>
                        <div className="weeks-list">
                            {(month.weeks || []).map((week, wIdx) => (
                                <div key={wIdx} className="week-item">
                                    <h4>Week {week.week || wIdx + 1}: {week.goal || 'Learning Goal'}</h4>
                                    <ul>
                                        {(week.tasks || []).map((task, tIdx) => (
                                            <li key={tIdx}><Check size={14} /> {task}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};


export default RoadmapSection;
