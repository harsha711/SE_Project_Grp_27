/**
 * Order model
 *
 * Defines the MongoDB schema for persisted orders. An order stores a reference
 * to the originating session (`sessionId`) and optionally the authenticated
 * `userId` when the request was made by a logged-in user. Each order contains
 * an array of `items` which may reference `FastFoodItem` documents via
 * `foodItem` or include an embedded `snapshot` object capturing the item
 * details at purchase time (price, nutrition, restaurant, etc.). The schema
 * computes `totalItems` and `totalPrice` before save and includes a numeric
 * sequential `orderNumber` and status lifecycle for staff workflows.
 *
 * @author Ahmed Hassan
 */
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FastFoodItem",
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
    },
    restaurant: String,
    item: String,
    calories: Number,
    totalFat: Number,
    protein: Number,
    carbohydrates: Number,
    price: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    items: [orderItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    orderNumber: {
      type: Number,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "ready", "complete", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  this.totalPrice = this.items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
    0
  );
  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
