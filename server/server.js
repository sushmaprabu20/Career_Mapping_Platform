const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const courseRoutes = require('./routes/courseRoutes');

console.log('Starting server...');
console.log('Env loaded');

connectDB().then(() => {
    console.log('[SERVER] Database connected successfully');
}).catch(err => {
    console.error('[SERVER] Database connection failed:', err);
});

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
        if (!origin || allowedOrigins.includes(origin) || process.env.FRONTEND_URL === '*' || !process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); 
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/mentors', require('./routes/mentorRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));

app.get('/api/diag', (req, res) => {
    res.json({
        status: 'ok',
        env: process.env.NODE_ENV,
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve frontend static files in production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// For all other routes, send back index.html (SPA support)
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    } else {
        res.status(404).json({ message: 'API Route not found' });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
