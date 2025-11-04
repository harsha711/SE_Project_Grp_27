import User from "../models/User.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
} from "../utils/jwt.util.js";

/**
 * Register a new user
 * POST /api/users/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        //console.log(req.body);

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and password",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
        });

        // Generate tokens
        const accessToken = generateAccessToken(
            user._id,
            user.email,
            user.role
        );
        const refreshToken = generateRefreshToken(user._id);

        // Update last login
        await user.updateLastLogin();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    preferences: user.preferences,
                    createdAt: user.createdAt,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        res.status(500).json({
            success: false,
            message: "Registration failed",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Login user
 * POST /api/users/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Find user and explicitly select password field
        const user = await User.findOne({ email: email.toLowerCase() }).select(
            "+password"
        );

        // Check if user exists and password is correct
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is deactivated. Please contact support.",
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(
            user._id,
            user.email,
            user.role
        );
        const refreshToken = generateRefreshToken(user._id);

        // Update last login
        await user.updateLastLogin();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    preferences: user.preferences,
                    lastLogin: user.lastLogin,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Get current user profile
 * GET /api/users/profile
 */
export const getProfile = async (req, res) => {
    try {
        // User is already attached to req by authentication middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    preferences: user.preferences,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve profile",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Change user password
 * POST /api/users/change-password
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide current password and new password",
            });
        }

        // Get user with password field
        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Verify current password
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate new tokens
        const accessToken = generateAccessToken(
            user._id,
            user.email,
            user.role
        );
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Change password error:", error);

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Refresh access token using refresh token
 * POST /api/users/refresh-token
 */
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyToken(refreshToken, true);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || "Invalid refresh token",
            });
        }

        // Check if user exists
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found or account deactivated",
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(
            user._id,
            user.email,
            user.role
        );

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken,
            },
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to refresh token",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Deactivate user account
 * DELETE /api/users/profile
 */
export const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.isActive = false;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: "Account deactivated successfully",
        });
    } catch (error) {
        console.error("Deactivate account error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to deactivate account",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isActive } = req.query;

        // Build query filters
        const filters = {};
        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive === "true";

        const users = await User.find(filters)
            .select("-passwordChangedAt")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(filters);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalUsers: count,
                    usersPerPage: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve users",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Get user by ID (Admin only)
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            "-passwordChangedAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        console.error("Get user by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve user",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Update user by ID (Admin only)
 * PATCH /api/users/:id
 */
export const updateUserById = async (req, res) => {
    try {
        const { name, email, role, isActive, preferences } = req.body;

        // Don't allow password updates through this endpoint
        delete req.body.password;

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select("-passwordChangedAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: { user },
        });
    } catch (error) {
        console.error("Update user by ID error:", error);

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Delete user by ID (Admin only)
 * DELETE /api/users/:id
 */
export const deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete user by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};
