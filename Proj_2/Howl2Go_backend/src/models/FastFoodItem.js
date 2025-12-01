import mongoose from "mongoose";

const fastFoodItemSchema = new mongoose.Schema(
    {
        company: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        item: {
            type: String,
            required: true,
            trim: true,
        },
        calories: {
            type: Number,
            default: null,
        },
        caloriesFromFat: {
            type: Number,
            default: null,
        },
        totalFat: {
            type: Number,
            default: null,
        },
        saturatedFat: {
            type: Number,
            default: null,
        },
        transFat: {
            type: Number,
            default: null,
        },
        cholesterol: {
            type: Number,
            default: null,
        },
        sodium: {
            type: Number,
            default: null,
        },
        carbs: {
            type: Number,
            default: null,
        },
        fiber: {
            type: Number,
            default: null,
        },
        sugars: {
            type: Number,
            default: null,
        },
        protein: {
            type: Number,
            default: null,
        },
        weightWatchersPoints: {
            type: Number,
            default: null,
        },
        price: {
            type: Number,
            default: 2,
        },
        iron: {
            type: Number,
            default: null,
        },
        potassium: {
            type: Number,
            default: null,
        },
        magnesium: {
            type: Number,
            default: null,
        },
        calcium: {
            type: Number,
            default: null,
        },
        vitaminA: {
            type: Number,
            default: null,
        },
        vitaminC: {
            type: Number,
            default: null,
        },
        vitaminD: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Create compound index for efficient querying
fastFoodItemSchema.index({ company: 1, item: 1 });

// Create text index for searching items
fastFoodItemSchema.index({ item: "text", company: "text" });

const FastFoodItem = mongoose.model("FastFoodItem", fastFoodItemSchema);

export default FastFoodItem;
