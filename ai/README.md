# Smart City Civic AI Microservice

The **Smart City Civic AI Service** is a high-performance multi-modal intelligence service that automatically categorizes civic grievances, detects public safety hazards, assigns municipal departments, and estimates urgency priority levels.

It is designed with a **dual-engine architecture**:
1. **Local Multi-Modal Vision & Heuristic Engine**: Runs 100% locally on CPU with zero paid API dependencies, performing rapid visual color/brightness/texture analysis combined with keyword & hazard regex parsing.
2. **LLM/Gemini Vision Integration**: Optionally leverages Google Gemini multi-modal vision models when `GEMINI_API_KEY` is present.

---

## Architecture & Directory Structure

```text
ai/
├── app.py              # Flask REST API server exposing /health, /analyze, /categories, /validate
├── classifier.py       # Core classification engine (dual-engine: Gemini + Local Vision)
├── prompt.py           # Structured prompts, system instructions, and few-shot examples
├── schemas.py          # Civic taxonomy master data, priority levels, data models & validation
├── utils.py            # Image feature analysis (Pillow), text cleaning, hazard detector, base64 utilities
├── requirements.txt    # Python dependencies
└── README.md           # Documentation & integration guide
```

---

## Civic Categories & Municipal Routing

| Category | Default Priority | Responsible Department | Typical Subcategories |
| :--- | :--- | :--- | :--- |
| **Waste Management** | `HIGH` | Department of Solid Waste Management & Sanitation | Garbage Dump, Overflowing Dustbin, Illegal Waste Disposal, Dead Animal Removal |
| **Roads** | `HIGH` | Public Works Department (PWD) - Roads & Bridges | Pothole, Damaged Road, Broken Footpath, Missing Manhole Cover |
| **Drainage** | `HIGH` | Municipal Water Supply & Sewerage Board (Drainage) | Blocked Drain, Drainage Overflow, Sewage Leakage, Waterlogging |
| **Water Supply** | `HIGH` | Municipal Water Supply & Sewerage Board (Water) | Water Leakage, Pipeline Damage, Contaminated Water, Water Shortage |
| **Street Infrastructure** | `MEDIUM` | Electrical Engineering & Public Lighting Division | Broken Street Light, Damaged Traffic Signal, Exposed Electric Wire |
| **Public Property** | `LOW` | Department of Parks, Gardens & Public Amenities | Damaged Bench, Damaged Park Equipment, Vandalism, Damaged Shelter |
| **Other** | `MEDIUM` | General Municipal Grievance Cell | General Issue, Noise Pollution, Stray Animals, Encroachment |

> **Automatic Life Safety Escalation**: Any report containing life-safety hazard terms (such as `open manhole`, `live wire`, `sparking`, `pipeline burst`, `collapse`, `flood`, or `explosion`) is immediately escalated to **`CRITICAL`** priority.

---

## Installation & Setup

1. **Prerequisites**: Python 3.10+ installed.

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Service**:
   ```bash
   python app.py
   ```
   By default, the server listens on **`http://localhost:8000`** (or the port specified by the `PORT` environment variable).

4. **Environment Variables (Optional)**:
   - `PORT`: Port to bind (default: `8000`).
   - `GEMINI_API_KEY`: If provided, enables Gemini multimodal reasoning. If absent or invalid, the service seamlessly uses the local engine.

---

## API Endpoints

### 1. Health Probe
- **Method**: `GET`
- **Path**: `/health`
- **Response**:
  ```json
  {
    "status": "online",
    "service": "Smart City Civic AI Microservice",
    "version": "1.0.0",
    "port": 8000,
    "capabilities": [
      "multimodal-vision-inspection",
      "civic-taxonomy-classification",
      "emergency-hazard-escalation",
      "department-routing",
      "dual-engine-local-and-gemini"
    ],
    "geminiConfigured": false
  }
  ```

### 2. Analyze Complaint
- **Method**: `POST`
- **Path**: `/analyze`
- **Content-Type**: `multipart/form-data` or `application/json`

#### Using `multipart/form-data` (with image file):
```bash
curl -X POST http://localhost:8000/analyze \
  -F "description=Large deep pothole on 2nd cross road near metro station" \
  -F "image=@/path/to/road_pothole.jpg"
```

#### Using `application/json` (text-only or base64 image):
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Black sewage water overflowing from drain near market",
    "image_base64": ""
  }'
```

#### Response Example:
```json
{
  "category": "Drainage",
  "subcategory": "Drainage Overflow",
  "priority": "HIGH",
  "confidence": 0.94,
  "department": "Municipal Water Supply & Sewerage Board (Drainage Wing)",
  "reason": "Identified as Drainage (Drainage Overflow) from civic report patterns.",
  "model": "SmartCity-CivicVision-v1.0",
  "source": "local-heuristic-vision",
  "isFallback": false
}
```

### 3. Categories Taxonomy
- **Method**: `GET`
- **Path**: `/categories`
- **Response**: Full map of valid categories, subcategories, default priorities, and departments.

### 4. Validate Category / Subcategory
- **Method**: `POST`
- **Path**: `/validate`
- **Body**: `{"category": "Roads", "subcategory": "Pothole"}`
- **Response**: `{"isValid": true, "categoryValid": true, "subcategoryValid": true}`

---

## Server Integration

The Node.js backend (`server/`) can communicate with this microservice via HTTP POST:
- **Service URL**: `http://localhost:8000/analyze`
- When reporting a complaint, the Node.js server forwards the complaint description and uploaded image to `/analyze`.
- If the microservice is unreachable, the Node.js server seamlessly falls back to its built-in rule handler or Gemini.
