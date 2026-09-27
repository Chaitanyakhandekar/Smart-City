import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, "Authentication token required. Please log in.");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "smart_city_access_secret_key_12345"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found or account removed.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated. Contact city administrator.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired token. Please log in again.");
  }
});

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${allowedRoles.join(" or ")}`
      );
    }
    next();
  };
};
