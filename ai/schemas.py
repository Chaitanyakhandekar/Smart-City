"""
Smart City Civic AI Schemas
Defines civic issue categories, subcategories, priority tiers, municipal departments,
and request/response validation data structures.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict

# Supported Civic Issue Priorities
PRIORITY_CRITICAL = "CRITICAL"
PRIORITY_HIGH = "HIGH"
PRIORITY_MEDIUM = "MEDIUM"
PRIORITY_LOW = "LOW"

VALID_PRIORITIES = [PRIORITY_LOW, PRIORITY_MEDIUM, PRIORITY_HIGH, PRIORITY_CRITICAL]

# Civic Issue Master Taxonomy
CIVIC_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "Waste Management": {
        "department": "Department of Solid Waste Management & Sanitation",
        "subcategories": [
            "Garbage Dump",
            "Overflowing Dustbin",
            "Illegal Waste Disposal",
            "Dead Animal Removal",
            "Biohazard Waste",
        ],
        "keywords": [
            "garbage", "trash", "waste", "dustbin", "bin", "litter", "rubbish",
            "dump", "dumping", "filth", "debris", "plastic", "compost", "smell",
            "stink", "foul odor", "uncollected", "sweep", "dead dog", "carcass"
        ],
        "default_priority": PRIORITY_HIGH,
        "hazard_keywords": ["biohazard", "toxic", "medical waste", "chemical dump", "carcass"]
    },
    "Roads": {
        "department": "Public Works Department (PWD) - Roads & Bridges",
        "subcategories": [
            "Pothole",
            "Damaged Road",
            "Broken Footpath",
            "Missing Manhole Cover",
            "Damaged Road Divider",
            "Caved-in Road"
        ],
        "keywords": [
            "pothole", "road", "footpath", "sidewalk", "asphalt", "cracks", "pavement",
            "hole", "crater", "tar", "divider", "speed breaker", "carriageway",
            "kerb", "curb", "uneven road", "broken tiles", "cobblestone"
        ],
        "default_priority": PRIORITY_HIGH,
        "hazard_keywords": ["open manhole", "missing manhole", "deep crater", "caved in", "road collapse", "accident"]
    },
    "Drainage": {
        "department": "Municipal Water Supply & Sewerage Board (Drainage Wing)",
        "subcategories": [
            "Blocked Drain",
            "Drainage Overflow",
            "Sewage Leakage",
            "Waterlogging",
            "Choked Stormwater Drain"
        ],
        "keywords": [
            "drain", "drainage", "sewage", "sewer", "gutter", "clog", "choke",
            "overflow", "stagnant", "manhole", "dirty water", "foul water",
            "waterlogging", "flooding", "black water", "stormwater", "sludge"
        ],
        "default_priority": PRIORITY_HIGH,
        "hazard_keywords": ["overflowing sewage", "flood", "flooding", "sewer burst", "submerged"]
    },
    "Water Supply": {
        "department": "Municipal Water Supply & Sewerage Board (Water Wing)",
        "subcategories": [
            "Water Leakage",
            "Pipeline Damage",
            "Water Supply Issue",
            "Contaminated Water",
            "Low Water Pressure"
        ],
        "keywords": [
            "water", "leak", "leaking", "pipe", "pipeline", "burst", "supply",
            "drinking water", "tap", "valve", "main line", "water shortage",
            "muddy water", "dirty water", "no water", "contamination"
        ],
        "default_priority": PRIORITY_HIGH,
        "hazard_keywords": ["pipeline burst", "burst pipe", "contaminated drinking water", "massive leak"]
    },
    "Street Infrastructure": {
        "department": "Electrical Engineering & Public Lighting Division",
        "subcategories": [
            "Broken Street Light",
            "Damaged Traffic Signal",
            "Damaged Sign Board",
            "Exposed Electric Wire",
            "Fallen Electric Pole"
        ],
        "keywords": [
            "street light", "light", "lamp", "pole", "dark", "pitch dark",
            "signal", "traffic signal", "traffic light", "sign board", "signboard",
            "wire", "cable", "electric pole", "junction box", "streetlamp"
        ],
        "default_priority": PRIORITY_MEDIUM,
        "hazard_keywords": ["live wire", "hanging wire", "electric shock", "sparking", "fallen pole", "traffic light failure"]
    },
    "Public Property": {
        "department": "Department of Parks, Gardens & Public Amenities",
        "subcategories": [
            "Damaged Bench",
            "Damaged Park Equipment",
            "Vandalism",
            "Broken Public Toilet",
            "Damaged Bus Shelter",
            "Broken Railing"
        ],
        "keywords": [
            "bench", "park", "garden", "equipment", "swing", "slide", "seesaw",
            "vandalism", "fence", "railing", "wall", "public toilet", "urinal",
            "bus stop", "bus shelter", "community hall", "public fountain"
        ],
        "default_priority": PRIORITY_LOW,
        "hazard_keywords": ["structural collapse", "broken glass", "falling roof"]
    },
    "Other": {
        "department": "General Municipal Grievance Cell",
        "subcategories": [
            "General Issue",
            "Encroachment",
            "Noise Pollution",
            "Stray Animal Menace"
        ],
        "keywords": ["noise", "encroachment", "hawker", "stray", "nuisance", "other", "general"],
        "default_priority": PRIORITY_MEDIUM,
        "hazard_keywords": ["rabid animal", "danger", "riot", "fire"]
    }
}

# Critical Life Safety Escalation Keywords (across all categories)
EMERGENCY_KEYWORDS = [
    "emergency", "accident", "open manhole", "live wire", "electric shock",
    "sparking", "pipeline burst", "burst", "flood", "flooding", "collapse",
    "explosion", "fire", "death hazard", "fatal", "lethal", "electrocution"
]

@dataclass
class ImageFeatures:
    """Extracted visual signals from complaint image."""
    valid: bool = False
    is_dark: bool = False
    is_greyish: bool = False
    is_wet_blue: bool = False
    is_greenish: bool = False
    brightness: float = 0.0
    contrast: float = 0.0
    aspect_ratio: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class ClassificationResult:
    """Standardized response schema for civic issue analysis."""
    category: str
    subcategory: str
    priority: str
    confidence: float
    reason: str
    department: str
    model: str = "SmartCity-CivicVision-v1.0"
    isFallback: bool = False
    source: str = "local-heuristic-vision"
    features: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        if self.features is None:
            data.pop("features", None)
        return data

def validate_category(category: str) -> bool:
    """Checks whether a category exists in master taxonomy."""
    return category in CIVIC_TAXONOMY

def validate_subcategory(category: str, subcategory: str) -> bool:
    """Checks whether a subcategory is valid for a given category."""
    if category not in CIVIC_TAXONOMY:
        return False
    return subcategory in CIVIC_TAXONOMY[category]["subcategories"]

def get_department_for_category(category: str) -> str:
    """Returns assigned municipal department for a category."""
    cat_data = CIVIC_TAXONOMY.get(category)
    if cat_data and "department" in cat_data:
        return cat_data["department"]
    return CIVIC_TAXONOMY["Other"]["department"]
