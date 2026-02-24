import React from 'react';
import { motion } from 'framer-motion';
import { Map, Zap, Target } from 'lucide-react';

const CareerPaths = () => {
    const paths = [
        { title: 'Software Engineering', icon: <Zap color="#ff9800" />, desc: 'Build the machines that power the world.' },
        { title: 'Data Science', icon: <Target color="#00f2fe" />, desc: 'Extract wisdom from the noise of data.' },
        { title: 'UI/UX Design', icon: <Map color="#4facfe" />, desc: 'Shape the experiences of tomorrow.' }
    ];

    return (
        <div className="container" style={{ padding: '6rem 5%' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: '#fff' }}>Explore Career Paths</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {paths.map((path, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="card"
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{path.icon}</div>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>{path.title}</h3>
                        <p style={{ color: '#ccc' }}>{path.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CareerPaths;
