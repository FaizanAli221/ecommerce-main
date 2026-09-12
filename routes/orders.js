const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  trackOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderCreateSchema, orderStatusSchema, idParamSchema } = require('../validators/schemas');

const router = express.Router();

router.get('/track', trackOrder);
router.post('/', protect, authorize('customer'), validate(orderCreateSchema), createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, validate(idParamSchema), getOrder);
router.patch(
  '/:id/status',
  protect,
  authorize('vendor', 'admin'),
  validate(orderStatusSchema),
  updateOrderStatus
);

module.exports = router;

