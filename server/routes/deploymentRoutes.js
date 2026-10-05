const express = require('express');
const router = express.Router();
const {
  getDeployments,
  getDeploymentById,
  createDeployment,
  updateDeploymentStatus
} = require('../controllers/deploymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getDeployments)
  .post(createDeployment);

router.route('/:id')
  .get(getDeploymentById);

router.route('/:id/status')
  .put(updateDeploymentStatus);

module.exports = router;
