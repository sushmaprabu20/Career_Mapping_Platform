const express = require('express');
const { generateRoadmap, getLatestRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../services/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateRoadmap);
router.get('/latest', protect, getLatestRoadmap);

module.exports = router;
