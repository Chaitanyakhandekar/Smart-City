import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
].filter(Boolean);

/**
 * Intelligent rule-based civic classification fallback.
 * Evaluates complaint description keywords and filename to determine
 * category, subcategory, priority, and confidence.
 */
export function getFallbackClassification(description = "", filename = "") {
  const text = `${description} ${filename}`.toLowerCase();

  let category = "Other";
  let subcategory = "General Issue";
  let priority = "MEDIUM";
  let confidence = 0.55;
  let reason = "Automated keyword-based classification";

  // Category matching
  if (/waste|garbage|trash|dustbin|dump|litter|debris|filth|rubbish|compost/i.test(text)) {
    category = "Waste Management";
    if (/dump|illegal/i.test(text)) {
      subcategory = "Illegal Waste Disposal";
      priority = "HIGH";
    } else if (/overflow/i.test(text)) {
      subcategory = "Overflowing Dustbin";
      priority = "HIGH";
    } else {
      subcategory = "Garbage Dump";
      priority = "MEDIUM";
    }
    confidence = 0.88;
  } else if (/pothole|road|asphalt|tar|crater|pavement|footpath|divider|speed breaker|carriageway/i.test(text)) {
    category = "Roads";
    if (/pothole|crater/i.test(text)) {
      subcategory = "Pothole";
      priority = "HIGH";
    } else if (/footpath|sidewalk/i.test(text)) {
      subcategory = "Broken Footpath";
      priority = "MEDIUM";
    } else {
      subcategory = "Damaged Road";
      priority = "HIGH";
    }
    confidence = 0.91;
  } else if (/drain|gutter|sewage|sewer|waterlogging|blocked drain|manhole|flooding/i.test(text)) {
    category = "Drainage";
    if (/manhole|open drain|flood/i.test(text)) {
      subcategory = "Drainage Overflow";
      priority = "CRITICAL";
    } else if (/sewage|leakage/i.test(text)) {
      subcategory = "Sewage Leakage";
      priority = "HIGH";
    } else {
      subcategory = "Blocked Drain";
      priority = "HIGH";
    }
    confidence = 0.89;
  } else if (/water supply|pipeline|pipe|leak|drinking water|tap|valve|water leak/i.test(text)) {
    category = "Water Supply";
    if (/burst|pipeline damage/i.test(text)) {
      subcategory = "Pipeline Damage";
      priority = "HIGH";
    } else if (/leak/i.test(text)) {
      subcategory = "Water Leakage";
      priority = "HIGH";
    } else {
      subcategory = "Water Supply Issue";
      priority = "MEDIUM";
    }
    confidence = 0.87;
  } else if (/street light|streetlight|lamp|dark|traffic signal|signal|sign board|signboard|pole/i.test(text)) {
    category = "Street Infrastructure";
    if (/signal/i.test(text)) {
      subcategory = "Damaged Traffic Signal";
      priority = "HIGH";
    } else if (/sign/i.test(text)) {
      subcategory = "Damaged Sign Board";
      priority = "LOW";
    } else {
      subcategory = "Broken Street Light";
      priority = "MEDIUM";
    }
    confidence = 0.85;
  } else if (/bench|park|garden|playground|public property|vandalism|fence|bus stop|shelter/i.test(text)) {
    category = "Public Property";
    if (/vandal/i.test(text)) {
      subcategory = "Vandalism";
      priority = "MEDIUM";
    } else if (/bench/i.test(text)) {
      subcategory = "Damaged Bench";
      priority = "LOW";
    } else {
      subcategory = "Damaged Park Equipment";
      priority = "MEDIUM";
    }
    confidence = 0.82;
  }

  // Priority escalation overrides
  if (/danger|hazard|accident|open manhole|live wire|electric shock|explosion|urgent|emergency|collapse/i.test(text)) {
    priority = "CRITICAL";
    confidence = Math.max(confidence, 0.92);
    reason += " (Escalated to CRITICAL due to public safety hazard)";
  } else if (/major|severe|heavy|deep|main road|highway/i.test(text) && priority === "LOW") {
    priority = "MEDIUM";
  }

  return {
    category,
    subcategory,
    priority,
    confidence,
    reason,
    isFallback: true,
    source: "fallback",
    serviceStatus: "Rule-based fallback active (Gemini offline)",
  };
}

export async function analyzeComplaintImageAndText({
  imagePath,
  description = "",
}) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[Gemini AI] No GEMINI_API_KEY configured. Using intelligent fallback.");
    return getFallbackClassification(
      description,
      imagePath ? path.basename(imagePath) : ""
    );
  }

  try {
    const parts = [
      {
        text: `
Analyze this civic complaint.

Description:
${description}

Classify it into:

Category:
- Waste Management
- Roads
- Drainage
- Water Supply
- Street Infrastructure
- Public Property
- Other

Return:
1. category
2. subcategory
3. priority: LOW, MEDIUM, HIGH, CRITICAL
4. confidence between 0 and 1
5. short reason

Return ONLY valid JSON.
        `,
      },
    ];

    // Add image if available and exists on disk
    if (imagePath && fs.existsSync(imagePath)) {
      const imageData = fs.readFileSync(imagePath).toString("base64");
      const ext = path.extname(imagePath).toLowerCase();
      const mimeType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : "image/jpeg";

      parts.push({
        inlineData: {
          mimeType,
          data: imageData,
        },
      });
    }

    // Try candidate models in order of availability
    let response = null;
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });
        if (response && response.text) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("No response received from Gemini models");
    }

    const result = JSON.parse(response.text);

    return {
      category: result.category || "Other",
      subcategory: result.subcategory || "General Issue",
      priority: result.priority || "MEDIUM",
      confidence: Number(result.confidence) || 0.85,
      reason: result.reason || "",
      isFallback: false,
      source: "gemini",
      serviceStatus: "Gemini AI connected",
    };
  } catch (error) {
    console.error(
      "[Gemini AI Error]",
      error.message
    );

    return getFallbackClassification(
      description,
      imagePath ? path.basename(imagePath) : ""
    );
  }
}