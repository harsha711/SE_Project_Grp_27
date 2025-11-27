import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import FastFoodItem from '../models/FastFoodItem.js';

/**
 * Create a review for a food item from an order
 * POST /api/reviews
 */
export const createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { orderId, foodItemId, rating, comment } = req.body;

    // Validate required fields
    if (!orderId || !foodItemId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Food Item ID, and rating are required'
      });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Verify order belongs to user and contains the food item
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: 'completed'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to you'
      });
    }

    // Check if item exists in order
    const orderItem = order.items.find(
      item => item.foodItem.toString() === foodItemId.toString()
    );

    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'Food item not found in this order'
      });
    }

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      userId,
      foodItemId,
      orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item from this order'
      });
    }

    // Get food item details
    const foodItem = await FastFoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // Create review
    const review = await Review.create({
      userId,
      orderId,
      foodItemId,
      restaurant: orderItem.restaurant,
      itemName: orderItem.item,
      rating,
      comment: comment || '',
      isVerified: true // Verified since it's from an actual order
    });

    // Populate user info for response
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get reviews for a food item
 * GET /api/reviews/item/:foodItemId
 */
export const getItemReviews = async (req, res) => {
  try {
    const { foodItemId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    // Validate food item exists
    const foodItem = await FastFoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'recent':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'highest':
        sortCriteria = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortCriteria = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sortCriteria = { helpful: -1, createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews
    const reviews = await Review.find({ foodItemId })
      .populate('userId', 'name email')
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const total = await Review.countDocuments({ foodItemId });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { foodItemId: new mongoose.Types.ObjectId(foodItemId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    let stats = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    if (ratingStats.length > 0) {
      const stat = ratingStats[0];
      stats.averageRating = Math.round(stat.averageRating * 10) / 10;
      stats.totalReviews = stat.totalReviews;
      
      // Calculate distribution
      stat.ratingDistribution.forEach(rating => {
        if (stats.ratingDistribution[rating] !== undefined) {
          stats.ratingDistribution[rating]++;
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's reviews
 * GET /api/reviews/my-reviews
 */
export const getMyReviews = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ userId })
      .populate('foodItemId', 'company item')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Review.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a review
 * PATCH /api/reviews/:reviewId
 */
export const updateReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to update it'
      });
    }

    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:reviewId
 */
export const deleteReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }

    await Review.deleteOne({ _id: reviewId });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mark review as helpful
 * POST /api/reviews/:reviewId/helpful
 */
export const markHelpful = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markHelpful(userId);

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpful: review.helpful
      }
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

