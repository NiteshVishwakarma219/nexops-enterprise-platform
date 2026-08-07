const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

const router = express.Router();

router.get('/headcount-by-department', protect, authorize('admin', 'hr', 'manager'), ctrl.headcountByDepartment);
router.get('/employee-status-breakdown', protect, authorize('admin', 'hr', 'manager'), ctrl.employeeStatusBreakdown);
router.get('/leave-type-breakdown', protect, authorize('admin', 'hr', 'manager'), ctrl.leaveTypeBreakdown);
router.get('/asset-category-breakdown', protect, authorize('admin', 'hr'), ctrl.assetCategoryBreakdown);
router.get('/attendance-status-breakdown', protect, authorize('admin', 'hr', 'manager'), ctrl.attendanceStatusBreakdown);

module.exports = router;
