"""
Complaint triage service.
Classifies complaint urgency based on category and text analysis.
"""


# Category-based base urgency scores
CATEGORY_URGENCY = {
    'harassment': 9,
    'accident_blackspot': 8,
    'crime': 8,
    'fire': 9,
    'traffic': 6,
    'road_damage': 5,
    'street_light': 4,
    'water': 5,
    'sanitation': 4,
    'noise': 3,
    'encroachment': 4,
    'other': 5,
}

# Keywords that boost urgency
URGENCY_KEYWORDS = {
    'high': ['dangerous', 'life-threatening', 'emergency', 'accident', 'death',
             'collapsed', 'bleeding', 'fire', 'attack', 'robbery', 'injured'],
    'medium': ['broken', 'damaged', 'flooding', 'blocked', 'unsafe',
               'dark', 'overflowing', 'stuck', 'delayed'],
}


def triage_complaint(text: str, category: str) -> dict:
    """
    Classify complaint urgency.
    
    In production, this would use a trained NLP classifier.
    For hackathon, we use keyword matching + category base scores.
    
    Returns:
        priority_score: int (1-10)
        urgency_label: str (LOW, MEDIUM, HIGH, CRITICAL)
    """
    # Base score from category
    base_score = CATEGORY_URGENCY.get(category.lower(), 5)

    # Keyword boost
    text_lower = text.lower()
    boost = 0

    for keyword in URGENCY_KEYWORDS['high']:
        if keyword in text_lower:
            boost = max(boost, 2)
            break

    if boost == 0:
        for keyword in URGENCY_KEYWORDS['medium']:
            if keyword in text_lower:
                boost = max(boost, 1)
                break

    # Final score
    priority_score = min(base_score + boost, 10)

    # Map to urgency label
    if priority_score >= 8:
        urgency_label = 'CRITICAL'
    elif priority_score >= 6:
        urgency_label = 'HIGH'
    elif priority_score >= 4:
        urgency_label = 'MEDIUM'
    else:
        urgency_label = 'LOW'

    return {
        'priority_score': priority_score,
        'urgency_label': urgency_label,
    }
