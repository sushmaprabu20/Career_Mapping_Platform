import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle } from 'lucide-react';

const Contact = () => {
    return (
        <div className="container" style={{ padding: '6rem 5%' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}
            >
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#fff' }}>
                    <MessageCircle size={32} color="#ff9800" /> Get in Touch
                </h1>
                <p style={{ margin: '2rem 0', color: '#ccc' }}>
                    Have questions or feedback? Our team is here to help you navigate your career journey.
                </p>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <p style={{ marginBottom: '0.5rem', color: '#fff' }}><strong>Email us at:</strong></p>
                    <a href="mailto:support@career.co" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '1.1rem' }}>
                        support@career.co
                    </a>
                </div>
                <button className="btn-primary" style={{ marginTop: '2rem' }}>Send a Message</button>
            </motion.div>
        </div>
    );
};

export default Contact;
