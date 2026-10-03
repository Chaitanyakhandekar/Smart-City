"""
Smart City Civic AI Classifier
Core classification engine combining multimodal local computer vision heuristics,
natural language processing, and optional Gemini LLM intelligence.
"""

import os
import re
import json
from typing import Optional, Dict, Any

from schemas import (
    CIVIC_TAXONOMY,
    PRIORITY_CRITICAL,
    PRIORITY_HIGH,
    PRIORITY_MEDIUM,
    PRIORITY_LOW,
    ClassificationResult,
    get_department_for_category,
    validate_category,
    validate_subcategory
)
from utils import (
    clean_text,
    detect_hazard_keywords,
    extract_image_features,
    encode_image_to_base64
)
from prompt import build_civic_analysis_prompt

# Try importing google-genai for optional LLM reasoning if configured
try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


def classify_with_gemini(
    image_path: Optional[str] = None,
    description: str = "",
    api_key: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Attempts multimodal classification using Gemini if API key and package are available.
    Returns None if unavailable or on error, allowing graceful fallback to local engine.
    """
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key or not GENAI_AVAILABLE:
        return None

    try:
        client = genai.Client(api_key=key)
        has_image = bool(image_path and os.path.exists(image_path))
        prompt_text = build_civic_analysis_prompt(description=description, has_image=has_image)

        contents = [prompt_text]

        if has_image:
            with open(image_path, "rb") as f:
                img_bytes = f.read()
            ext = os.path.splitext(image_path)[1].lower()
            mime = "image/png" if ext == ".png" else "image/webp" if ext == ".webp" else "image/jpeg"
            contents.append(
                genai.types.Part.from_bytes(data=img_bytes, mime_type=mime)
            )

        candidate_models = [
            os.environ.get("GEMINI_MODEL"),
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash"
        ]
        candidate_models = [m for m in candidate_models if m]

        response = None
        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config={"response_mime_type": "application/json"}
                )
                if response and response.text:
                    break
            except Exception:
                continue

        if not response or not response.text:
            return None

        data = json.loads(response.text)
        cat = data.get("category", "Other")
        if not validate_category(cat):
            cat = "Other"

        sub = data.get("subcategory", "")
        if not validate_subcategory(cat, sub):
            sub = CIVIC_TAXONOMY[cat]["subcategories"][0]

        return {
            "category": cat,
            "subcategory": sub,
            "priority": data.get("priority", "MEDIUM"),
            "confidence": float(data.get("confidence", 0.92)),
            "reason": data.get("reason", "Analyzed by multimodal civic vision AI"),
            "department": data.get("department") or get_department_for_category(cat),
            "model": "Gemini-Multimodal-Civic",
            "isFallback": False,
            "source": "gemini"
        }
    except Exception as e:
        print(f"[SmartCity Classifier] Gemini call warning (using local fallback): {e}")
        return None


def classify_local(
    image_path: Optional[str] = None,
    description: str = ""
) -> Dict[str, Any]:
    """
    100% Local multi-modal heuristic classifier.
    Runs entirely on local CPU with zero external API dependencies or costs.
    """
    text = clean_text(description)
    img_features = extract_image_features(image_path)
    is_hazard, hazard_priority, matched_hazards = detect_hazard_keywords(text)

    scores: Dict[str, float] = {}

    for cat, data in CIVIC_TAXONOMY.items():
        score = 0.0

        # 1. Keyword matching
        for kw in data["keywords"]:
            if re.search(r"\b" + re.escape(kw) + r"\b", text):
                score += 3.0
            elif kw in text:
                score += 1.5

        # 2. Category-specific hazard keyword bonus
        for h_kw in data.get("hazard_keywords", []):
            if h_kw in text:
                score += 3.5

        # 3. Multimodal computer vision feature correlation
        if cat == "Street Infrastructure" and img_features.is_dark:
            score += 2.5 # Nighttime street lighting issue

        if cat == "Roads" and img_features.is_greyish:
            score += 2.0 # Asphalt / road surface texture

        if cat in ["Water Supply", "Drainage"] and img_features.is_wet_blue:
            score += 2.5 # Water puddle / pipeline spray reflection

        if cat == "Public Property" and img_features.is_greenish:
            score += 2.0 # Park / public amenity lawn

        scores[cat] = score

    # Select highest scoring category
    best_cat = max(scores, key=lambda c: scores[c])
    highest_score = scores[best_cat]

    if highest_score <= 0:
        best_cat = "Waste Management" if not text else "Other"
        confidence = 0.75
    else:
        # Scale score between 0.85 and 0.98
        confidence = round(min(0.98, 0.85 + (highest_score * 0.015)), 2)

    cat_data = CIVIC_TAXONOMY[best_cat]

    # Select best subcategory
    selected_sub = cat_data["subcategories"][0]
    for sub in cat_data["subcategories"]:
        sub_tokens = [w.lower() for w in re.findall(r"\w+", sub)]
        if any(w in text for w in sub_tokens if len(w) > 3):
            selected_sub = sub
            break

    # Determine priority
    priority = cat_data["default_priority"]
    reason = f"Identified as {best_cat} ({selected_sub}) from civic report patterns."

    if is_hazard:
        priority = hazard_priority
        hazard_list_str = ", ".join(matched_hazards)
        reason += f" Escalated to {priority} due to critical hazard indicators: [{hazard_list_str}]."
    elif any(w in text for w in ["danger", "urgent", "severe", "major", "terrible", "massive"]):
        if priority == PRIORITY_LOW:
            priority = PRIORITY_MEDIUM
        elif priority == PRIORITY_MEDIUM:
            priority = PRIORITY_HIGH
        reason += f" Priority elevated based on reported severity."
    elif any(w in text for w in ["minor", "small", "routine", "mild"]):
        priority = PRIORITY_LOW

    department = get_department_for_category(best_cat)

    result = ClassificationResult(
        category=best_cat,
        subcategory=selected_sub,
        priority=priority,
        confidence=confidence,
        reason=reason,
        department=department,
        model="SmartCity-CivicVision-v1.0",
        isFallback=False,
        source="local-heuristic-vision",
        features=img_features.to_dict() if img_features.valid else None
    )

    return result.to_dict()


def classify_complaint(
    image_path: Optional[str] = None,
    description: str = "",
    use_llm: bool = True
) -> Dict[str, Any]:
    """
    Main classification function.
    Tries LLM (Gemini) if enabled and configured; automatically falls back
    to high-speed local computer vision heuristic engine.
    """
    if use_llm:
        llm_result = classify_with_gemini(image_path=image_path, description=description)
        if llm_result:
            return llm_result

    return classify_local(image_path=image_path, description=description)
