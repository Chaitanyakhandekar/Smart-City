from flask import Flask, request, jsonify
import os
import tempfile
from classifier import classify_complaint

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Smart City Local AI Vision Service",
        "port": 8000
    }), 200

@app.route("/analyze", methods=["POST"])
def analyze():
    description = request.form.get("description", "")
    temp_path = None

    if "image" in request.files:
        file = request.files["image"]
        if file.filename != "":
            fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1])
            os.close(fd)
            file.save(temp_path)

    try:
        result = classify_complaint(image_path=temp_path, description=description)
        result["isFallback"] = False
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "isFallback": True
        }), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Smart City Local AI Vision Service on http://localhost:8000")
    print("=" * 60)
    app.run(host="0.0.0.0", port=8000, debug=False)
