import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  foodItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FastFoodItem',
    required: true,
    index: true
  },
  restaurant: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false // Verified if user actually ordered the item
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
reviewSchema.index({ foodItemId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, orderId: 1, foodItemId: 1 }, { unique: true }); // One review per user per item per order
reviewSchema.index({ restaurant: 1, rating: -1 });
reviewSchema.index({ rating: -1, createdAt: -1 });

// Virtual for average rating (will be calculated via aggregation)
reviewSchema.virtual('averageRating').get(function() {
  return this.rating;
});

// Methods
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpfulUsers.includes(userId)) {
    this.helpfulUsers.push(userId);
    this.helpful += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

reviewSchema.methods.unmarkHelpful = function(userId) {
  const index = this.helpfulUsers.indexOf(userId);
  if (index > -1) {
    this.helpfulUsers.splice(index, 1);
    this.helpful = Math.max(0, this.helpful - 1);
    return this.save();
  }
  return Promise.resolve(this);
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;

