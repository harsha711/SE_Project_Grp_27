import mongoose from "mongoose";
import env from "../config/env.js";
import User from "../models/User.js";

/**
 * Seed script to ensure an admin user exists.
 * Usage: node dist/src/scripts/seedAdmin.js (after build) or run via ts-node in dev
 * It reads ADMIN_EMAIL and ADMIN_PASSWORD from env or uses defaults for local dev.
 */

async function run() {
  try {
    await mongoose.connect(env.mongodbUri);
    const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "adminpass";
    const name = process.env.ADMIN_NAME || "Administrator";

    let admin = await User.findOne({ email: email.toLowerCase() });
    if (admin) {
      console.log("Admin already exists:", admin.email);
      process.exit(0);
    }

    admin = await User.create({ name, email, password, role: "admin" });
    console.log("Created admin:", admin.email, "(name:", name + ")");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
}

run();
