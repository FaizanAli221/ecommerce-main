const express = require('express');
const {
  getProducts,
  getProduct,
  getVendors,
} = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/vendors/list', getVendors);
router.get('/:id', getProduct);

module.exports = router;

