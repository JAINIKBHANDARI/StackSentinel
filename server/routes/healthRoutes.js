const express = require('express');
const router = express.Router();
const { getPlatformHealth } = require('../controllers/healthController');

router.get('/', getPlatformHealth);

module.exports = router;
