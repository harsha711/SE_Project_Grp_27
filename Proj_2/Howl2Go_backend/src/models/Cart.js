import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FastFoodItem',
    required: true
  },
  restaurant: {
    type: String,
    required: true
  },
  item: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  totalFat: Number,
  protein: Number,
  carbohydrates: Number,
  price: {
    type: Number,
    required: true,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: { expires: 0 } // TTL index - MongoDB will automatically delete expired carts
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

// Methods
cartSchema.methods.addItem = function(itemData) {
  const existingItemIndex = this.items.findIndex(
    item => item.foodItem.toString() === itemData.foodItem.toString()
  );

  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    this.items[existingItemIndex].quantity += itemData.quantity || 1;
  } else {
    // Add new item
    this.items.push({
      ...itemData,
      quantity: itemData.quantity || 1
    });
  }

  return this.save();
};

cartSchema.methods.removeItem = function(foodItemId) {
  this.items = this.items.filter(
    item => item.foodItem.toString() !== foodItemId.toString()
  );
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(foodItemId, quantity) {
  const item = this.items.find(
    item => item.foodItem.toString() === foodItemId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(foodItemId);
    }
    item.quantity = quantity;
    return this.save();
  }

  throw new Error('Item not found in cart');
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
