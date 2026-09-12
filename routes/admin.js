const express = require('express');
const {
  getDashboard,
  getUsers,
  updateUser,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderStatusSchema, idParamSchema } = require('../validators/schemas');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id', validate(idParamSchema), updateUser);
router.get('/products', getAllProducts);
router.delete('/products/:id', validate(idParamSchema), deleteProduct);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', validate(orderStatusSchema), updateOrderStatus);

module.exports = router;

