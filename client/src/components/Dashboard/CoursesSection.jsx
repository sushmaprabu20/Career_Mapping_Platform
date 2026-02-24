import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import './CoursesSection.css';

const CoursesSection = ({ missingSkills }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('gap');

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                const { data } = await api.post('/courses/recommend', { missingSkills });
                setCourses(data.courses || []);
                setStatus(data.status || 'gap');
            } catch (err) {
                console.error('Error fetching recommendations:', err);
            } finally {
                setLoading(false);
            }
        };

        if (missingSkills) {
            fetchRecommendations();
        }
    }, [missingSkills]);

    if (loading) {
        return (
            <div className="courses-section">
                <div className="courses-loading">
                    <Loader2 className="animate-spin" size={32} color="#ff5722" />
                    <p>Curating personalized courses for you...</p>
                </div>
            </div>
        );
    }

    if (status === 'career-ready') {
        return (
            <div className="courses-section">
                <div className="career-ready-message">
                    <h3>🎉 You are career-ready!</h3>
                    <p>Your skills perfectly match the requirements for this role. Keep up the great work!</p>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return null; // Don't show anything if no courses found
    }

    return (
        <div className="courses-section">
            <h2>
                <BookOpen size={24} color="#ff5722" />
                Recommended Courses
            </h2>
            <div className="courses-grid">
                {courses.map((course, index) => (
                    <div key={index} className="course-card">
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="course-image"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=480';
                                e.target.onerror = null;
                            }}
                        />
                        <div className="course-content">
                            <span className={`course-platform platform-${course.platform.toLowerCase()}`}>
                                {course.platform}
                            </span>
                            <h3>{course.title}</h3>
                            <p className="course-description">{course.description}</p>
                            <a
                                href={course.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-start-learning"
                            >
                                Start Learning <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default CoursesSection;
