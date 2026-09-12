const express = require('express');
const {
  getStats,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorOrders,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productCreateSchema, productUpdateSchema, idParamSchema } = require('../validators/schemas');

const router = express.Router();

router.use(protect, authorize('vendor'));

router.get('/stats', getStats);
router.get('/products', getMyProducts);
router.post('/products', validate(productCreateSchema), createProduct);
router.put('/products/:id', validate(productUpdateSchema), updateProduct);
router.delete('/products/:id', validate(idParamSchema), deleteProduct);
router.get('/orders', getVendorOrders);

module.exports = router;

