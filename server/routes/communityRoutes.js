const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect } = require('../services/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure community uploads directory exists with robust absolute pathing
const communityDir = path.resolve(__dirname, '..', 'uploads', 'community');
if (!fs.existsSync(communityDir)) {
    console.log('[MULTER] Creating community directory at:', communityDir);
    fs.mkdirSync(communityDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Double check existence before each upload
        if (!fs.existsSync(communityDir)) fs.mkdirSync(communityDir, { recursive: true });
        cb(null, communityDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mov', '.avi'];
        if (!allowed.includes(ext)) {
            return cb(new Error('Only images and videos are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/posts', protect, upload.single('media'), communityController.createPost);
router.get('/posts', protect, communityController.getPosts);
router.post('/posts/:id/like', protect, communityController.likePost);
router.post('/posts/:id/comment', protect, communityController.addComment);

router.get('/groups', protect, communityController.getGroups);
router.post('/groups/:id/join', protect, communityController.joinGroup);
router.delete('/posts/:id', protect, communityController.deletePost);
router.delete('/posts/:id/comment/:commentId', protect, communityController.deleteComment);

module.exports = router;
