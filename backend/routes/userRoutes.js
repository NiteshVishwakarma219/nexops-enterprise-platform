const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMyProfile, updateMyProfile, changePassword, listUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/me/change-password', protect, changePassword);
router.get('/', protect, authorize('admin'), listUsers);

module.exports = router;
