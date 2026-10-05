const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  triggerServiceCheck,
  getServiceHealthHistory
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// All service routes require authentication
router.use(protect);

router.route('/')
  .get(getServices)
  .post(createService);

router.route('/:id')
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);

router.post('/:id/check', triggerServiceCheck);
router.get('/:id/health-history', getServiceHealthHistory);

module.exports = router;
