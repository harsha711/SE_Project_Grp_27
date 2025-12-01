import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import connectDB from "../config/database.js";
import FastFoodItem from "../models/FastFoodItem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to parse numeric values from CSV
const parseNumber = (value) => {
    if (!value || value.trim() === "") {
        return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
};

const importData = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log("Connected to MongoDB");

        // Clear existing data
        await FastFoodItem.deleteMany({});
        console.log("Cleared existing fast food items");

        // Path to CSV file
        const csvPath = path.join(
            __dirname,
            "../../../data/fast-food/FastFoodNutritionMenuV3.csv"
        );

        const items = [];

        // Read and parse CSV
        fs.createReadStream(csvPath)
            .pipe(
                csv({
                    mapHeaders: ({ header }) => {
                        // Clean up header names by removing line breaks and extra spaces
                        return header
                            .replace(/\r?\n/g, " ")
                            .replace(/\s+/g, " ")
                            .trim();
                    },
                })
            )
            .on("data", (row) => {
                // Skip empty rows or header rows
                if (
                    !row.Company ||
                    row.Company.trim() === "" ||
                    !row.Item ||
                    row.Item.trim() === ""
                ) {
                    return;
                }

                // Log first row to debug column names
                if (items.length === 0) {
                    console.log("\nFirst row data (for debugging):");
                    console.log("Available columns:", Object.keys(row));
                    console.log("Sample values:", row);
                    console.log("");
                }

                const item = {
                    company: row.Company.trim(),
                    item: row.Item.trim(),
                    calories: parseNumber(row["Calories"]),
                    caloriesFromFat: parseNumber(row["Calories from Fat"]),
                    totalFat: parseNumber(row["Total Fat (g)"]),
                    saturatedFat: parseNumber(row["Saturated Fat (g)"]),
                    transFat: parseNumber(row["Trans Fat (g)"]),
                    cholesterol: parseNumber(row["Cholesterol (mg)"]),
                    sodium: parseNumber(row["Sodium (mg)"]),
                    carbs: parseNumber(row["Carbs (g)"]),
                    fiber: parseNumber(row["Fiber (g)"]),
                    sugars: parseNumber(row["Sugars (g)"]),
                    protein: parseNumber(row["Protein (g)"]),
                    weightWatchersPoints: parseNumber(
                        row["Weight Watchers Pnts"]
                    ),
                };

                items.push(item);
            })
            .on("end", async () => {
                try {
                    console.log(`Parsed ${items.length} items from CSV`);

                    // Show sample of first item with all fields
                    if (items.length > 0) {
                        console.log("\nSample parsed item:");
                        console.log(JSON.stringify(items[0], null, 2));
                    }

                    // Insert all items in bulk
                    if (items.length > 0) {
                        const result = await FastFoodItem.insertMany(items);
                        console.log(
                            `\n✅ Successfully imported ${result.length} fast food items`
                        );

                        // Print some statistics
                        const companies = await FastFoodItem.distinct(
                            "company"
                        );
                        console.log(
                            `\nCompanies in database: ${companies.length}`
                        );
                        companies.forEach((company) => {
                            console.log(`  - ${company}`);
                        });

                        // Show sample with nutrition data
                        const sampleItems = await FastFoodItem.find({
                            calories: { $ne: null },
                        }).limit(5);
                        console.log("\nSample items with nutrition data:");
                        sampleItems.forEach((item) => {
                            console.log(`  - ${item.company}: ${item.item}`);
                            console.log(
                                `    Calories: ${item.calories}, Protein: ${item.protein}g, Carbs: ${item.carbs}g`
                            );
                        });
                    }

                    process.exit(0);
                } catch (error) {
                    console.error("Error inserting data:", error);
                    process.exit(1);
                }
            })
            .on("error", (error) => {
                console.error("Error reading CSV:", error);
                process.exit(1);
            });
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

// Run the import
importData();
