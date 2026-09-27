import mongoose, { Schema } from 'mongoose';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const DEPARTMENTS = [
  "Waste Management",
  "Roads",
  "Drainage",
  "Water Supply",
  "Street Infrastructure",
  "Public Property",
  "Other"
];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    phone: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["CITIZEN", "STAFF", "ADMIN"],
      default: "CITIZEN"
    },
    department: {
      type: String,
      enum: [...DEPARTMENTS, ""],
      default: ""
    },
    designation: {
      type: String,
      default: ""
    },
    employeeId: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.isCorrectPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET || "smart_city_access_secret_key_12345",
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d"
    }
  );
};

export const User = mongoose.model("User", userSchema);
export default User;
