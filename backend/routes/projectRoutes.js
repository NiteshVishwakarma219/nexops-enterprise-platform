const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/projectController');

const router = express.Router();

router.get('/', protect, ctrl.listProjects);
router.get('/:id', protect, ctrl.getProject);
router.post('/', protect, authorize('admin', 'manager'), ctrl.createProject);
router.put('/:id', protect, authorize('admin', 'manager'), ctrl.updateProject);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProject);
router.post('/:id/members', protect, authorize('admin', 'manager'), ctrl.addMember);
router.delete('/:id/members/:employeeId', protect, authorize('admin', 'manager'), ctrl.removeMember);

module.exports = router;
