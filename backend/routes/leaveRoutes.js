const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/leaveController');

const router = express.Router();

router.get('/', protect, ctrl.listLeaves);
router.post('/', protect, ctrl.applyLeave);
router.put('/:id/review', protect, authorize('admin', 'hr', 'manager'), ctrl.reviewLeave);
router.put('/:id/cancel', protect, ctrl.cancelLeave);

module.exports = router;
