import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
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
    required: true,
    default: 0
  },
  totalFat: Number,
  saturatedFat: Number,
  transFat: Number,
  protein: Number,
  carbohydrates: Number,
  fiber: Number,
  sugars: Number,
  sodium: Number,
  cholesterol: Number,
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

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true, // Required, but generated in controller before save
    index: true
  },
  items: [orderItemSchema],
  // Aggregated nutrition totals
  nutrition: {
    totalCalories: {
      type: Number,
      default: 0
    },
    totalFat: {
      type: Number,
      default: 0
    },
    totalSaturatedFat: {
      type: Number,
      default: 0
    },
    totalTransFat: {
      type: Number,
      default: 0
    },
    totalProtein: {
      type: Number,
      default: 0
    },
    totalCarbohydrates: {
      type: Number,
      default: 0
    },
    totalFiber: {
      type: Number,
      default: 0
    },
    totalSugars: {
      type: Number,
      default: 0
    },
    totalSodium: {
      type: Number,
      default: 0
    },
    totalCholesterol: {
      type: Number,
      default: 0
    }
  },
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Generate unique order number before saving (backup - should be set in controller)
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Calculate nutrition totals before saving
orderSchema.pre('save', function(next) {
  // Calculate item totals
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate nutrition totals
  this.nutrition.totalCalories = this.items.reduce((sum, item) => 
    sum + (item.calories * item.quantity), 0);
  this.nutrition.totalFat = this.items.reduce((sum, item) => 
    sum + ((item.totalFat || 0) * item.quantity), 0);
  this.nutrition.totalSaturatedFat = this.items.reduce((sum, item) => 
    sum + ((item.saturatedFat || 0) * item.quantity), 0);
  this.nutrition.totalTransFat = this.items.reduce((sum, item) => 
    sum + ((item.transFat || 0) * item.quantity), 0);
  this.nutrition.totalProtein = this.items.reduce((sum, item) => 
    sum + ((item.protein || 0) * item.quantity), 0);
  this.nutrition.totalCarbohydrates = this.items.reduce((sum, item) => 
    sum + ((item.carbohydrates || 0) * item.quantity), 0);
  this.nutrition.totalFiber = this.items.reduce((sum, item) => 
    sum + ((item.fiber || 0) * item.quantity), 0);
  this.nutrition.totalSugars = this.items.reduce((sum, item) => 
    sum + ((item.sugars || 0) * item.quantity), 0);
  this.nutrition.totalSodium = this.items.reduce((sum, item) => 
    sum + ((item.sodium || 0) * item.quantity), 0);
  this.nutrition.totalCholesterol = this.items.reduce((sum, item) => 
    sum + ((item.cholesterol || 0) * item.quantity), 0);
  
  next();
});

// Indexes for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

