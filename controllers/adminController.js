const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getDashboard = async (_req, res, next) => {
  try {
    const [totalUsers, totalVendors, totalProducts, orders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      Product.countDocuments(),
      Order.find(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const activeOrders = orders.filter((o) =>
      ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
    ).length;

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalUsers,
        totalVendors,
        totalProducts,
        activeOrders,
        totalOrders: orders.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (role && ['customer', 'vendor', 'admin'].includes(role)) user.role = role;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.getAllProducts = async (_req, res, next) => {
  try {
    const products = await Product.find().populate('vendor', 'storeName email').sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = req.body.status;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

