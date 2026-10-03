import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

let io = null;

/**
 * Normalize any user ID or object to a clean string
 */
export function normalizeUserId(id) {
  if (!id) return "";
  if (typeof id === "object" && id._id) return String(id._id);
  return String(id);
}

/**
 * Extract JWT token from socket handshake auth, headers, or cookies
 */
function extractSocketToken(socket) {
  // 1. Check handshake auth object (preferred in socket.io-client)
  let token = socket.handshake.auth?.token;
  if (token) {
    return token.startsWith("Bearer ") ? token.slice(7) : token;
  }

  // 2. Check authorization header
  const authHeader = socket.handshake.headers?.authorization;
  if (authHeader) {
    return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  }

  // 3. Check cookie
  if (socket.handshake.headers?.cookie) {
    const match = socket.handshake.headers.cookie.match(/accessToken=([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Initialize Socket.IO with the HTTP server.
 * Authenticates sockets via JWT and places users into user-specific private rooms.
 */
export function initSocketIO(httpServer) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.ALLOW_ORIGIN,
    "https://smart-city-mu-wine.vercel.app",
    "https://dev-mark.vercel.app"
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, test runners)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in development
      },
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"]
  });

  // JWT authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = extractSocketToken(socket);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "smart_city_access_secret_key_12345"
      );

      const userId = decoded.id || decoded._id || decoded.userId;
      if (!userId) {
        return next(new Error("Token payload missing user ID"));
      }

      const user = await User.findById(userId).select("_id name role isActive");
      if (!user || !user.isActive) {
        return next(new Error("User not found or account deactivated"));
      }

      socket.userId = normalizeUserId(user._id);
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch (error) {
      console.warn("[Socket.IO] Auth middleware error:", error.message);
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = normalizeUserId(socket.userId);
    const userRoom = `user:${userId}`;

    // Required development logs
    console.log(`Socket connected: ${socket.id}, user: ${userId}`);
    socket.join(userRoom);
    console.log(`Joined room: ${userRoom}`);

    // Rejoin room explicitly on reconnect/join event
    socket.on("join", () => {
      socket.join(userRoom);
      console.log(`Re-joined room: ${userRoom}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}, user: ${userId} (${reason})`);
    });
  });

  console.log("[Socket.IO] Initialized successfully on HTTP server");
  return io;
}

/**
 * Get the Socket.IO instance. Returns null if not initialized.
 */
export function getIO() {
  return io;
}

export default { initSocketIO, getIO, normalizeUserId };
