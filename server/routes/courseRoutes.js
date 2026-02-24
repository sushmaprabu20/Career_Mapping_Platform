const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/courseController');
const { protect } = require('../services/authMiddleware');

router.post('/recommend', protect, getRecommendations);


module.exports = router;
