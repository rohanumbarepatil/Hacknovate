"""
Risk scoring service.
Calculates weighted risk scores for zones based on multiple factors.
"""

import random


def calculate_risk_score(ward_id: str, features: dict) -> dict:
    """
    Calculate a weighted risk score for a zone.
    
    In production, this would load a trained model (risk_model.pkl).
    For hackathon, we use a weighted formula with realistic variation.
    
    Features expected:
        - crime_count: int
        - accident_count: int 
        - complaint_count: int
        - time_hour: int (0-23)
        - historical_incidents: int
    """
    # Extract features with defaults
    crime = features.get('crime_count', 0)
    accidents = features.get('accident_count', 0)
    complaints = features.get('complaint_count', 0)
    hour = features.get('time_hour', 12)
    historical = features.get('historical_incidents', 0)

    # Time factor: higher risk at night (20:00 - 04:00)
    time_factor = 0.8 if 20 <= hour or hour <= 4 else 0.3

    # Weighted factors
    weights = {
        'crime_factor': min(crime * 3.0, 30),
        'accident_factor': min(accidents * 2.5, 25),
        'complaint_factor': min(complaints * 1.5, 20),
        'time_factor': time_factor * 15,
        'historical_factor': min(historical * 0.5, 10),
    }

    # Calculate overall score (0-100)
    raw_score = sum(weights.values())
    overall_score = min(max(raw_score + random.uniform(-5, 5), 0), 100)

    # Normalize factors to proportions
    total = sum(weights.values()) or 1
    factors = {k: round(v / total, 3) for k, v in weights.items()}

    return {
        'ward_id': ward_id,
        'score': round(overall_score, 1),
        'factors': factors,
    }
