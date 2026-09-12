const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendVendorOrderEmail,
} = require('../utils/email');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product unavailable: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        vendor: product.vendor,
        vendorName: product.vendorName,
      });
      subtotal += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingCost = subtotal >= 500 ? 0 : 9.99;
    const total = subtotal + shippingCost;

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      status: 'confirmed',
      trackingNumber: `NX${Date.now().toString(36).toUpperCase()}`,
    });

    await order.populate('customer', 'firstName lastName email');
    await sendOrderConfirmationEmail(order.customer, order);

    const vendorIds = [...new Set(orderItems.map((i) => i.vendor.toString()))];
    for (const vendorId of vendorIds) {
      const vendor = await User.findById(vendorId);
      if (vendor) await sendVendorOrderEmail(vendor, order);
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image');
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'firstName lastName email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.customer._id.toString() === req.user._id.toString();
    const isVendor = order.items.some((i) => i.vendor.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isVendor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.trackOrder = async (req, res, next) => {
  try {
    const { trackingNumber, orderId } = req.query;
    const filter = {};

    if (orderId) filter._id = orderId;
    else if (trackingNumber) filter.trackingNumber = trackingNumber;
    else {
      return res.status(400).json({ success: false, message: 'Provide orderId or trackingNumber' });
    }

    const order = await Order.findOne(filter).select(
      'status trackingNumber createdAt updatedAt items total shippingAddress'
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', 'email firstName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isVendorOrder = order.items.some((i) => i.vendor.toString() === req.user._id.toString());

    if (req.user.role === 'vendor' && !isVendorOrder) {
      return res.status(403).json({ success: false, message: 'Not your order' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();

    if (order.customer) {
      await sendOrderStatusEmail(order.customer, order);
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

