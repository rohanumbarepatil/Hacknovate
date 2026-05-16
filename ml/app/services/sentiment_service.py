"""
Sentiment analysis service.
Analyzes text for emotional tone and extracts key topics.
"""

# Simple keyword-based sentiment (upgradeable to HuggingFace)
NEGATIVE_WORDS = [
    'angry', 'frustrated', 'terrible', 'awful', 'worst', 'disgusting',
    'horrible', 'pathetic', 'useless', 'negligence', 'dangerous',
    'unsafe', 'broken', 'ignored', 'corrupt', 'incompetent', 'no action',
    'delayed', 'suffering', 'dirty', 'stinking',
]

POSITIVE_WORDS = [
    'good', 'great', 'excellent', 'helpful', 'quick', 'resolved',
    'thank', 'appreciate', 'improved', 'better', 'clean', 'safe',
]

# Topic extraction keywords
TOPIC_KEYWORDS = {
    'road damage': ['pothole', 'road', 'crack', 'broken road', 'crater'],
    'street lighting': ['light', 'dark', 'street light', 'lamp', 'bulb'],
    'water supply': ['water', 'pipeline', 'leakage', 'supply', 'tap'],
    'sanitation': ['garbage', 'waste', 'sewage', 'drain', 'dustbin', 'dirty'],
    'traffic': ['traffic', 'signal', 'jam', 'congestion', 'parking'],
    'safety': ['unsafe', 'crime', 'theft', 'robbery', 'harassment'],
    'infrastructure': ['bridge', 'building', 'construction', 'collapse'],
    'noise': ['noise', 'loud', 'speaker', 'horn', 'music'],
}


def analyze_sentiment(text: str) -> dict:
    """
    Analyze text sentiment and extract topics.
    
    Returns:
        score: float (0-1, higher = more negative/urgent)
        emotion: str
        topics: List[str]
    """
    text_lower = text.lower()

    # Calculate sentiment score
    neg_count = sum(1 for w in NEGATIVE_WORDS if w in text_lower)
    pos_count = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    total = neg_count + pos_count or 1

    # Score: 0 = positive, 1 = very negative
    score = round(neg_count / total, 3)

    # Determine emotion
    if score >= 0.7:
        emotion = 'angry'
    elif score >= 0.5:
        emotion = 'frustrated'
    elif score >= 0.3:
        emotion = 'concerned'
    elif score > 0:
        emotion = 'neutral'
    else:
        emotion = 'satisfied'

    # Extract topics
    topics = []
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            topics.append(topic)

    if not topics:
        topics = ['general']

    return {
        'score': score,
        'emotion': emotion,
        'topics': topics[:5],  # Max 5 topics
    }
