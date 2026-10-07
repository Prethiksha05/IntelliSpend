"""
Expense Categorization API.
Phase 1: Rule-based categorization.
Phase 2: ML classifier (trained on labeled data).
"""

from fastapi import APIRouter, HTTPException
import logging
import re
from typing import Dict, List, Tuple

from app.schemas.schemas import CategorizationRequest, CategorizationResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================
# Rule-based keyword mapping
# ============================
CATEGORY_RULES: Dict[str, List[str]] = {
    "Food": [
        "swiggy", "zomato", "uber eats", "domino", "pizza", "burger", "mcdonalds",
        "kfc", "subway", "restaurant", "cafe", "coffee", "starbucks", "dunkin",
        "food", "meal", "lunch", "dinner", "breakfast", "snack", "bakery",
        "biryani", "hotel", "dine", "eat", "taste", "kitchen"
    ],
    "Transport": [
        "uber", "ola", "rapido", "auto", "cab", "taxi", "metro", "bus", "train",
        "irctc", "railway", "fuel", "petrol", "diesel", "parking", "toll",
        "transport", "travel pass", "commute", "flight", "indigo", "spicejet",
        "air india", "vistara", "makemytrip", "yatra", "goibibo"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "meesho", "ajio", "nykaa", "shop",
        "purchase", "buy", "order", "delivery", "market", "mall", "store",
        "clothing", "shoes", "fashion", "apparel", "electronics", "gadget",
        "snapdeal", "bigbasket", "grofer", "blinkit", "zepto", "dunzo"
    ],
    "Bills": [
        "electricity", "water", "gas", "bill", "utility", "jio", "airtel",
        "vodafone", "vi", "bsnl", "broadband", "internet", "phone", "mobile",
        "recharge", "dth", "tata sky", "dish tv", "emi", "loan", "insurance",
        "premium", "tax", "rent", "maintenance"
    ],
    "Entertainment": [
        "netflix", "prime video", "amazon prime", "hotstar", "disney",
        "spotify", "youtube", "zee5", "sonyliv", "voot", "gaana", "wynk",
        "movie", "cinema", "theatre", "pvr", "inox", "game", "gaming",
        "playstation", "xbox", "steam", "concert", "event", "show"
    ],
    "Healthcare": [
        "hospital", "clinic", "doctor", "medicine", "pharmacy", "medplus",
        "apollo", "1mg", "netmeds", "health", "medical", "dental", "eye",
        "lab", "test", "diagnostic", "surgery", "consultation", "chemist"
    ],
    "Education": [
        "school", "college", "university", "tuition", "course", "udemy",
        "coursera", "edx", "byju", "unacademy", "toppr", "vedantu",
        "book", "stationery", "study", "exam", "fee", "coaching", "class"
    ],
    "Travel": [
        "hotel", "resort", "hostel", "oyo", "airbnb", "makemytrip",
        "holiday", "vacation", "trip", "tour", "sightseeing", "luggage",
        "visa", "passport", "booking"
    ],
    "Subscriptions": [
        "subscription", "monthly plan", "annual plan", "membership",
        "renewal", "auto pay", "recurring"
    ],
}

FALLBACK_CATEGORY = "Others"


def _classify_rule_based(description: str, merchant: str = None) -> Tuple[str, float, List[dict]]:
    """
    Rule-based categorization using keyword matching.
    Returns (category, confidence, alternatives).
    """
    text = f"{description or ''} {merchant or ''}".lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    scores: Dict[str, int] = {}

    for category, keywords in CATEGORY_RULES.items():
        match_count = sum(1 for kw in keywords if kw in text)
        if match_count > 0:
            scores[category] = match_count

    if not scores:
        return FALLBACK_CATEGORY, 0.4, []

    sorted_cats = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_cat, best_score = sorted_cats[0]

    total_matches = sum(scores.values())
    confidence = min(0.95, 0.55 + (best_score / max(total_matches, 1)) * 0.4)

    alternatives = [
        {"category": cat, "confidence": round(sc / total_matches, 3)}
        for cat, sc in sorted_cats[1:3]
    ]

    return best_cat, round(confidence, 3), alternatives


@router.post("/categorize", response_model=CategorizationResponse)
async def categorize_expense(request: CategorizationRequest):
    """
    Categorize an expense based on description and merchant name.
    Uses rule-based matching (Phase 1).
    """
    try:
        category, confidence, alternatives = _classify_rule_based(
            description=request.description,
            merchant=request.merchant
        )

        return CategorizationResponse(
            category=category,
            confidence=confidence,
            method="rule_based",
            alternatives=alternatives
        )
    except Exception as e:
        logger.error(f"Categorization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Categorization failed: {str(e)}")


@router.post("/categorize/batch")
async def categorize_batch(requests: List[CategorizationRequest]):
    """Categorize multiple expenses in one call."""
    try:
        results = []
        for req in requests:
            category, confidence, alternatives = _classify_rule_based(
                description=req.description,
                merchant=req.merchant
            )
            results.append({
                "description": req.description,
                "category": category,
                "confidence": confidence,
                "method": "rule_based",
                "alternatives": alternatives
            })
        return {"results": results, "total": len(results)}
    except Exception as e:
        logger.error(f"Batch categorization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
