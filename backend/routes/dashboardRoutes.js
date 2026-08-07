const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', protect, ctrl.getStats);
router.get('/department-distribution', protect, ctrl.getDepartmentDistribution);
router.get('/attendance-trend', protect, ctrl.getAttendanceTrend);
router.get('/recent-activities', protect, ctrl.getRecentActivities);

module.exports = router;
