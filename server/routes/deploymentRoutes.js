const express = require('express');
const router = express.Router();
const {
  getDeployments,
  getDeploymentById,
  createDeployment,
  updateDeploymentStatus,
  recordJenkinsDeployment
} = require('../controllers/deploymentController');
const { protect } = require('../middleware/authMiddleware');

// Webhook endpoints for Jenkins CI/CD (secured via x-jenkins-token header or ?token=)
router.post('/jenkins', recordJenkinsDeployment);
router.post('/webhook', recordJenkinsDeployment);

// Protected routes (User JWT required)
router.use(protect);


router.route('/')
  .get(getDeployments)
  .post(createDeployment);

router.route('/:id')
  .get(getDeploymentById);

router.route('/:id/status')
  .put(updateDeploymentStatus);

module.exports = router;
