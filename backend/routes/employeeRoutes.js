const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');
const ctrl = require('../controllers/employeeController');

const router = express.Router();

router.get('/', protect, ctrl.listEmployees);
router.get('/:id', protect, ctrl.getEmployee);
router.post('/', protect, authorize('admin', 'hr'), ctrl.createEmployee);
router.put('/:id', protect, authorize('admin', 'hr', 'manager'), ctrl.updateEmployee);
router.delete('/:id', protect, authorize('admin', 'hr'), ctrl.deleteEmployee);
router.post('/:id/documents/:docType', protect, authorize('admin', 'hr'), upload.single('file'), ctrl.uploadDocument);

module.exports = router;
