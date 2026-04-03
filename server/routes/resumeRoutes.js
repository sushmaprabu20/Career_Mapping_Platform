const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadResume, analyzeManualSkills } = require('../controllers/resumeController');
const { protect } = require('../services/authMiddleware');

const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists with absolute path
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.pdf' && ext !== '.docx') {
            return cb(new Error('Only PDF and DOCX are allowed'));
        }
        cb(null, true);
    }
});

router.post('/upload', protect, (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine.
        next();
    });
}, uploadResume);

router.post('/analyze-manual', protect, analyzeManualSkills);


module.exports = router;
