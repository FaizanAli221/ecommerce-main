const Product = require('../models/Product');
const Review = require('../models/Review');

exports.getProducts = async (req, res, next) => {
  try {
    const { category, vendor, search, sort, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') filter.category = category;
    if (vendor) filter.vendor = vendor;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const products = await Product.find(filter)
      .populate('vendor', 'storeName firstName lastName')
      .sort(sortOption);

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'vendor',
      'storeName firstName lastName email'
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, product, reviews });
  } catch (err) {
    next(err);
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$vendor',
          storeName: { $first: '$vendorName' },
          productCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { storeName: 1 } },
    ]);
    res.json({ success: true, vendors });
  } catch (err) {
    next(err);
  }
};

