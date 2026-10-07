import http from "http";
import server from "./server.js";
import dotenv from "dotenv";
import connectDB from "./db/dbConfig.js";
import { initSocketIO } from "./services/socket.service.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    // Create HTTP server from Express app (required for Socket.IO)
    const httpServer = http.createServer(server);

    // Initialize Socket.IO on the HTTP server
    initSocketIO(httpServer);

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to DB connection error:", err.message);
    process.exit(1);
  });
