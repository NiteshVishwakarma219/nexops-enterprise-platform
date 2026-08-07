const express = require('express');
const requireAdminKey = require('../middleware/adminKey');
const { runSeed } = require('../controllers/adminController');

const router = express.Router();

router.post('/seed', requireAdminKey, runSeed);

module.exports = router;
