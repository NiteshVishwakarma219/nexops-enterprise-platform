const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/departmentController');

const router = express.Router();

router.get('/', protect, ctrl.listDepartments);
router.get('/:id', protect, ctrl.getDepartment);
router.post('/', protect, authorize('admin', 'hr'), ctrl.createDepartment);
router.put('/:id', protect, authorize('admin', 'hr'), ctrl.updateDepartment);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteDepartment);

module.exports = router;
