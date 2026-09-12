const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

exports.getStats = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    const products = await Product.find({ vendor: vendorId });
    const orders = await Order.find({ 'items.vendor': vendorId });

    let totalSales = 0;
    let productsSold = 0;
    const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped'];

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.vendor.toString() === vendorId.toString()) {
          totalSales += item.price * item.quantity;
          productsSold += item.quantity;
        }
      });
    });

    const activeOrders = orders.filter((o) => activeStatuses.includes(o.status)).length;

    const reviews = await Review.find({
      product: { $in: products.map((p) => p._id) },
    });
    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    res.json({
      success: true,
      stats: {
        totalSales,
        activeOrders,
        productsSold,
        rating: avgRating,
        productCount: products.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      vendor: req.user._id,
      vendorName: req.user.storeName || `${req.user.firstName}'s Store`,
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getVendorOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.vendor': req.user._id })
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

