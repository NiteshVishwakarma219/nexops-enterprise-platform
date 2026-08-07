const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

const router = express.Router();

router.get('/', protect, ctrl.listAttendance);
router.post('/', protect, authorize('admin', 'hr', 'manager'), ctrl.markAttendance);
router.put('/:id', protect, authorize('admin', 'hr', 'manager'), ctrl.updateAttendance);
router.delete('/:id', protect, authorize('admin', 'hr'), ctrl.deleteAttendance);

module.exports = router;
