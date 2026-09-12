const express = require('express');
const {
  getProductReviews,
  createReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { reviewSchema } = require('../validators/schemas');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post(
  '/product/:productId',
  protect,
  authorize('customer'),
  validate(reviewSchema),
  createReview
);

module.exports = router;

