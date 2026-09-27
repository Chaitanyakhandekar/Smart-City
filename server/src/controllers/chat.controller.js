import { processChatQuery } from "../services/chatService.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    throw new ApiError(400, "Message text is required.");
  }

  // Pass full user object (not just _id) to enable role-aware responses
  const result = await processChatQuery(req.user, message);

  res.status(200).json(
    new ApiResponse(200, result, "Assistant response generated.")
  );
});
