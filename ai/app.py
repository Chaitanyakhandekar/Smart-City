"""
Smart City Civic AI Microservice (Flask Web API)
Exposes REST endpoints for civic issue classification, health checks,
and category schema validation.
"""

import os
import tempfile
import base64
from flask import Flask, request, jsonify

# Load environment variables if python-dotenv is installed
try:
    from dotenv import load_dotenv
    load_dotenv()
    # Also attempt loading root/server .env if present
    root_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server", ".env")
    if os.path.exists(root_env):
        load_dotenv(root_env)
except ImportError:
    pass

from schemas import CIVIC_TAXONOMY, validate_category, validate_subcategory
from classifier import classify_complaint
from utils import cleanup_temp_file

app = Flask(__name__)

# Enable CORS manually so dependencies remain lightweight
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.route("/health", methods=["GET"])
def health():
    """Service health and capability probe."""
    gemini_key = os.environ.get("GEMINI_API_KEY")
    return jsonify({
        "status": "online",
        "service": "Smart City Civic AI Microservice",
        "version": "1.0.0",
        "port": int(os.environ.get("PORT", 8000)),
        "capabilities": [
            "multimodal-vision-inspection",
            "civic-taxonomy-classification",
            "emergency-hazard-escalation",
            "department-routing",
            "dual-engine-local-and-gemini"
        ],
        "geminiConfigured": bool(gemini_key)
    }), 200


@app.route("/categories", methods=["GET"])
def get_categories():
    """Returns the civic master taxonomy with subcategories and departments."""
    summary = {}
    for cat, info in CIVIC_TAXONOMY.items():
        summary[cat] = {
            "department": info.get("department", ""),
            "subcategories": info.get("subcategories", []),
            "defaultPriority": info.get("default_priority", "MEDIUM")
        }
    return jsonify({
        "categories": summary,
        "total": len(summary)
    }), 200


@app.route("/validate", methods=["POST"])
def validate_issue():
    """Validates if a category and subcategory exist in the taxonomy."""
    data = request.get_json(silent=True) or {}
    category = data.get("category", "")
    subcategory = data.get("subcategory", "")

    cat_valid = validate_category(category)
    sub_valid = validate_subcategory(category, subcategory) if cat_valid else False

    return jsonify({
        "categoryValid": cat_valid,
        "subcategoryValid": sub_valid,
        "isValid": cat_valid and (sub_valid or not subcategory)
    }), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Primary civic complaint analysis endpoint.
    Accepts multipart/form-data or application/json payloads.
    """
    description = ""
    temp_path = None

    # Handle multipart/form-data
    if request.content_type and "multipart/form-data" in request.content_type:
        description = request.form.get("description", "")
        if "image" in request.files:
            file = request.files["image"]
            if file and file.filename != "":
                ext = os.path.splitext(file.filename)[1] or ".jpg"
                fd, temp_path = tempfile.mkstemp(suffix=ext)
                os.close(fd)
                file.save(temp_path)

    # Handle application/json
    elif request.is_json:
        data = request.get_json(silent=True) or {}
        description = data.get("description", "")
        b64_image = data.get("image_base64")
        if b64_image:
            try:
                # Strip data URL header if present (e.g. data:image/png;base64,...)
                if "," in b64_image:
                    b64_image = b64_image.split(",", 1)[1]
                img_bytes = base64.b64decode(b64_image)
                fd, temp_path = tempfile.mkstemp(suffix=".jpg")
                os.close(fd)
                with open(temp_path, "wb") as f:
                    f.write(img_bytes)
            except Exception as b64_err:
                print(f"[SmartCity App] Base64 decode warning: {b64_err}")

    # Fallback to form/query parameters
    else:
        description = request.form.get("description") or request.args.get("description") or ""

    try:
        result = classify_complaint(
            image_path=temp_path,
            description=description,
            use_llm=True
        )
        return jsonify(result), 200
    except Exception as e:
        print(f"[SmartCity App] Analysis error: {e}")
        return jsonify({
            "error": str(e),
            "category": "Other",
            "subcategory": "General Issue",
            "priority": "MEDIUM",
            "confidence": 0.5,
            "department": "General Municipal Grievance Cell",
            "reason": "Automated fallback due to processing error",
            "isFallback": True
        }), 500
    finally:
        cleanup_temp_file(temp_path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("=" * 65)
    print(f"Starting Smart City Civic AI Microservice on http://0.0.0.0:{port}")
    print("=" * 65)
    app.run(host="0.0.0.0", port=port, debug=False)
