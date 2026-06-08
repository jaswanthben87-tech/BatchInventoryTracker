const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/dashboard', analyticsController.getDashboardMetrics);
router.get('/wastage', analyticsController.getWastageReport);
router.get('/ai-insights', analyticsController.getAIInsights);

module.exports = router;
