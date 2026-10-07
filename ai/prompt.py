"""
Smart City Civic AI Prompts
System prompts, multimodal templates, few-shot examples,
and structured JSON formatting instructions for LLM / vision classification.
"""

from typing import Dict, Any
from schemas import CIVIC_TAXONOMY

CIVIC_CATEGORIES_LIST = list(CIVIC_TAXONOMY.keys())

SYSTEM_PROMPT = """You are the official Smart City Civic AI Grievance Classifier.
Your mission is to analyze citizen grievance reports (both visual images and textual descriptions),
accurately determine the municipal problem category, identify the specific subcategory, evaluate the urgency/priority level,
assign the appropriate municipal department, and produce strict structured JSON output.
"""

FEW_SHOT_EXAMPLES = [
    {
        "description": "Deep crater on 5th main road causing bike riders to slip and fall, traffic completely jammed",
        "output": {
            "category": "Roads",
            "subcategory": "Pothole",
            "priority": "HIGH",
            "confidence": 0.94,
            "department": "Public Works Department (PWD) - Roads & Bridges",
            "reason": "Dangerous road crater causing vehicle skids and congestion."
        }
    },
    {
        "description": "Black sewage water overflowing from uncovered gutter directly in front of primary school gate, unbearable stench",
        "output": {
            "category": "Drainage",
            "subcategory": "Drainage Overflow",
            "priority": "CRITICAL",
            "confidence": 0.96,
            "department": "Municipal Water Supply & Sewerage Board (Drainage Wing)",
            "reason": "Severe public health and child safety hazard from overflowing sewage near school."
        }
    },
    {
        "description": "Fallen tree branch broke public garden park bench",
        "output": {
            "category": "Public Property",
            "subcategory": "Damaged Bench",
            "priority": "LOW",
            "confidence": 0.89,
            "department": "Department of Parks, Gardens & Public Amenities",
            "reason": "Non-hazardous damage to park seating amenity."
        }
    },
    {
        "description": "Live electric cable snapped from pole and sparking on wet sidewalk during rain, people running away",
        "output": {
            "category": "Street Infrastructure",
            "subcategory": "Exposed Electric Wire",
            "priority": "CRITICAL",
            "confidence": 0.98,
            "department": "Electrical Engineering & Public Lighting Division",
            "reason": "Imminent electrocution life hazard on pedestrian walkway."
        }
    }
]

def get_taxonomy_summary() -> str:
    """Formats the master civic taxonomy into a concise prompt string."""
    lines = []
    for cat, info in CIVIC_TAXONOMY.items():
        subcats = ", ".join(info["subcategories"])
        lines.append(f"- **{cat}** (Dept: {info['department']})\n  Subcategories: {subcats}")
    return "\n".join(lines)


def build_civic_analysis_prompt(description: str, has_image: bool = False) -> str:
    """
    Constructs a complete instruction prompt for LLM / vision models.
    """
    prompt = f"""
{SYSTEM_PROMPT}

### Master Civic Taxonomy:
{get_taxonomy_summary()}

### Analysis Instructions:
1. Examine the {'complaint image and the ' if has_image else ''}citizen grievance description.
2. Select the most accurate `category` strictly from the taxonomy list above.
3. Select the most appropriate `subcategory` under that category.
4. Determine `priority`:
   - "CRITICAL": Imminent threat to human life, live electrical hazards, open deep manholes, structural collapse, major flooding.
   - "HIGH": Severe disruption, large potholes, blocked arterial drainage, drinking water contamination, illegal toxic dumping.
   - "MEDIUM": Moderate inconvenience, broken street lights, small leaks, broken footpaths, overflowing bins.
   - "LOW": Cosmetic damage, broken park benches, faded signs, minor graffiti.
5. Provide a realistic `confidence` score (float between 0.50 and 0.99).
6. State a concise, actionable `reason` (1 sentence).

Citizen Grievance Description:
\"\"\"{description}\"\"\"

Return ONLY valid JSON matching this schema:
{{
  "category": "String (exact category name)",
  "subcategory": "String (exact subcategory name)",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "confidence": Float,
  "department": "String (assigned department)",
  "reason": "String"
}}
"""
    return prompt.strip()
