const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty'],
    },
    image: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', vendorName: 'text' });
productSchema.index({ category: 1, vendor: 1 });

module.exports = mongoose.model('Product', productSchema);

