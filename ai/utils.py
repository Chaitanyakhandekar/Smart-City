"""
Smart City Civic AI Utilities
Helper functions for image processing, color analysis, text cleaning,
emergency hazard detection, and base64 handling.
"""

import os
import re
import base64
from typing import Tuple, List, Optional
from schemas import ImageFeatures, EMERGENCY_KEYWORDS

try:
    from PIL import Image, ImageStat
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


def clean_text(text: Optional[str]) -> str:
    """
    Normalizes input text: strips leading/trailing spaces, lowercases,
    and condenses multiple spaces into a single space.
    """
    if not text:
        return ""
    text = text.strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def detect_hazard_keywords(text: str) -> Tuple[bool, str, List[str]]:
    """
    Detects public safety emergency/hazard terms in text.
    Returns:
        (is_hazard: bool, recommended_priority: str, matched_terms: List[str])
    """
    matched = []
    text_lower = text.lower()

    for term in EMERGENCY_KEYWORDS:
        pattern = r"\b" + re.escape(term) + r"\b"
        if re.search(pattern, text_lower):
            matched.append(term)

    if not matched:
        return False, "MEDIUM", []

    # Highest hazard checks
    critical_triggers = [
        "accident", "open manhole", "live wire", "electric shock",
        "sparking", "pipeline burst", "burst", "flood", "collapse",
        "explosion", "fire", "death hazard", "fatal", "electrocution"
    ]
    if any(item in matched for item in critical_triggers):
        return True, "CRITICAL", matched

    return True, "HIGH", matched


def extract_image_features(image_path: Optional[str]) -> ImageFeatures:
    """
    Extracts computer vision and statistical color/brightness features from an image.
    Works entirely locally on CPU with zero paid APIs.
    """
    features = ImageFeatures(valid=False)

    if not image_path or not os.path.exists(image_path):
        return features

    if not PIL_AVAILABLE:
        # Pillow not installed; return default valid=False
        return features

    try:
        with Image.open(image_path) as img:
            features.valid = True
            width, height = img.size
            features.aspect_ratio = round(width / max(height, 1), 2)

            # Resize to small thumbnail for fast CPU analysis
            thumb = img.convert("RGB").resize((64, 64))
            pixels = list(thumb.getdata())
            n = len(pixels)

            total_r = sum(p[0] for p in pixels)
            total_g = sum(p[1] for p in pixels)
            total_b = sum(p[2] for p in pixels)

            avg_r = total_r / n
            avg_g = total_g / n
            avg_b = total_b / n
            brightness = (avg_r + avg_g + avg_b) / 3.0
            features.brightness = round(brightness, 2)

            # Calculate luminance contrast/variance
            stat = ImageStat.Stat(thumb.convert("L"))
            features.contrast = round(stat.stddev[0], 2)

            # 1. Dark night scene (broken street lights, nighttime hazards)
            if brightness < 65:
                features.is_dark = True

            # 2. Greyish asphalt / road / concrete surface
            # R, G, B are tightly clustered and brightness is moderate
            if abs(avg_r - avg_g) < 18 and abs(avg_g - avg_b) < 18 and abs(avg_r - avg_b) < 18 and brightness < 155:
                features.is_greyish = True

            # 3. Water / Drainage / Sewage bluish-green liquid reflection
            if avg_b > avg_r + 8 and avg_b > avg_g:
                features.is_wet_blue = True

            # 4. Greenery / Park / Garden foliage
            if avg_g > avg_r + 12 and avg_g > avg_b + 12:
                features.is_greenish = True

    except Exception as e:
        print(f"[SmartCity AI Utils] Image inspection warning: {e}")
        features.valid = False

    return features


def encode_image_to_base64(image_path: str) -> Optional[str]:
    """Reads an image file and converts it into a base64 encoded string."""
    if not image_path or not os.path.exists(image_path):
        return None
    try:
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"[SmartCity AI Utils] Base64 encoding error: {e}")
        return None


def cleanup_temp_file(file_path: Optional[str]) -> None:
    """Safely removes a temporary file from disk."""
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass
