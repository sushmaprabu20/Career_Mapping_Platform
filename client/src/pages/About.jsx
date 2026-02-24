import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="container" style={{ padding: '6rem 5%' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
            >
                <h1 style={{ marginBottom: '1.5rem', color: '#fff' }}>About Career.co</h1>
                <p style={{ fontSize: '1.2rem', color: '#ccc', lineHeight: '1.8' }}>
                    Career.co is a state-of-the-art <strong>Smart Career Mapping Platform</strong> designed to empower
                    professionals in their transition to modern tech roles.
                </p>
                <p style={{ marginTop: '1.5rem', color: '#aaa' }}>
                    Leveraging AI-powered resume analysis and personalized roadmap generation, we bridge the gap
                    between your current skills and your dream career.
                </p>
            </motion.div>
        </div>
    );
};

export default About;
