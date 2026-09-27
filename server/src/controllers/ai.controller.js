import { analyzeComplaintImageAndText } from "../services/aiService.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const analyzeCivicIssue = asyncHandler(async (req, res) => {
  const { description } = req.body;
  const imagePath = req.file ? req.file.path : null;

  const result = await analyzeComplaintImageAndText({
    imagePath,
    description: description || ""
  });

  res.status(200).json(
    new ApiResponse(200, result, "AI classification completed.")
  );
});
