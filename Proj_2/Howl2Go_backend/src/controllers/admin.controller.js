import User from "../models/User.js";

/**
 * Admin controller
 *
 * Provides admin-only user management endpoints: list users, create staff
 * accounts, update user fields, and deactivate/delete users.
 *
 * Author: Ahmed Hassan
 */

// List all users (admin only)
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("name email role isActive createdAt updatedAt");
    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ success: false, message: "Failed to list users" });
  }
};

// Create a staff user (admin only)
export const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    // Defensive normalization
    const nameStr = name ? String(name).trim() : "";
    const emailStr = email ? String(email).trim().toLowerCase() : "";
    const passwordStr = password ? String(password) : "";

    if (!nameStr || !emailStr || !passwordStr) {
      return res.status(400).json({ success: false, message: "name, email, and password are required" });
    }

    const existing = await User.findOne({ email: emailStr });
    if (existing) {
      return res.status(409).json({ success: false, message: "User with this email already exists" });
    }

    const user = await User.create({ name: nameStr, email: emailStr, password: passwordStr, role: "staff" });
    res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (error) {
    console.error("Error creating staff:", error && error.stack ? error.stack : error);
    // Return error message in development to aid debugging (safe for local dev)
    const msg = error && error.message ? error.message : "Failed to create staff";
    res.status(500).json({ success: false, message: msg });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Prevent role escalation to admin via this endpoint for safety
    if (updates.role === "admin") delete updates.role;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("name email role isActive createdAt updatedAt");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// Delete / deactivate user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Soft-delete: deactivate account
    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: "User deactivated" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};
