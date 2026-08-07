const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/assetController');

const router = express.Router();

router.get('/', protect, ctrl.listAssets);
router.get('/:id', protect, ctrl.getAsset);
router.post('/', protect, authorize('admin', 'hr'), ctrl.createAsset);
router.put('/:id', protect, authorize('admin', 'hr'), ctrl.updateAsset);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteAsset);

module.exports = router;
