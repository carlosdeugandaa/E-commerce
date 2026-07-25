const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }]
}, {
  timestamps: true
});

// Calculate total items in cart
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Calculate total price
cartSchema.virtual('totalPrice').get(function() {
  // This will be populated with product prices
  return this.items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
});

// Ensure virtuals are included in JSON output
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
