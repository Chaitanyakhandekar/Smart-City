import { User } from "../models/users.model.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Register Citizen (Public registration only allows CITIZEN role)
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists.");
  }

  // Security: Public users are strictly assigned role CITIZEN
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone || "",
    role: "CITIZEN",
    isActive: true
  });

  const token = user.generateAccessToken();

  const userResponse = await User.findById(user._id).select("-password");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res
    .status(201)
    .cookie("accessToken", token, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: userResponse, token },
        "Citizen registered successfully."
      )
    );
});

/**
 * Login for Citizen, Staff, or Admin
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await user.isCorrectPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Please contact city administrator.");
  }

  const token = user.generateAccessToken();
  const userResponse = await User.findById(user._id).select("-password");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  res
    .status(200)
    .cookie("accessToken", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userResponse, token },
        `Welcome back, ${user.name}!`
      )
    );
});

/**
 * Get current authenticated user profile
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { user: req.user }, "Current user profile fetched successfully.")
  );
});

/**
 * Logout
 */
export const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("accessToken")
    .json(new ApiResponse(200, {}, "Logged out successfully."));
});
