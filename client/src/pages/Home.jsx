import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            <section className="hero">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                >
                    <span className="badge-new">NEW: AI Career Mapping v2.0</span>
                    <h1>Navigate Your Career <br />With <span>AI Precision</span></h1>
                    <p>Upload your resume to instantly identify skill gaps and generate a personalized roadmap to your dream role.</p>
                    <div className="hero-btns">
                        <Link to="/signup" className="btn-primary">Get Started Free</Link>
                        <Link to="/career-paths" className="btn-hero-secondary">Explore Paths</Link>
                    </div>
                </motion.div>

                <motion.div
                    className="hero-image"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <div className="hero-visual-container">
                        <div className="circle-grad c1"></div>
                        <div className="circle-grad c2"></div>
                        <div className="floating-card c-1">Resume Analyzed ✓</div>
                        <div className="floating-card c-2">Roadmap Generated 🚀</div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};


export default Home;
