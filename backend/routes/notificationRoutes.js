const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, ctrl.listNotifications);
router.put('/read-all', protect, ctrl.markAllRead);
router.put('/:id/read', protect, ctrl.markAsRead);
router.delete('/:id', protect, ctrl.deleteNotification);

module.exports = router;
