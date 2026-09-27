# Smart City Local AI Vision Service

A local computer-vision and multi-modal heuristic classifier for civic complaint categorization.

## Features
- **Zero Paid APIs**: Runs 100% locally on your machine CPU.
- **Multimodal Analysis**: Extracts visual attributes (brightness, color dominance, structural textures) paired with natural language description processing.
- **Civic Categories Supported**:
  - Waste Management (Garbage Dump, Overflowing Dustbin, Illegal Waste Disposal)
  - Roads (Pothole, Damaged Road, Broken Footpath)
  - Drainage (Blocked Drain, Drainage Overflow, Sewage Leakage)
  - Water Supply (Water Leakage, Pipeline Damage, Water Supply Issue)
  - Street Infrastructure (Broken Street Light, Damaged Traffic Signal, Sign Board)
  - Public Property (Damaged Bench, Damaged Park Equipment, Vandalism)
- **Automatic Priority Recommendation**: Identifies hazard words ("emergency", "accident", "burst", "flood") to recommend `CRITICAL` or `HIGH` priority.

## Setup & Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the service:
   ```bash
   python app.py
   ```
   The service will listen on `http://localhost:8000`.

3. Test Endpoint:
   ```bash
   curl http://localhost:8000/health
   ```
