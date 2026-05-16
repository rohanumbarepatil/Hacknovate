"""
Request/Response schemas for all ML endpoints.
Centralized Pydantic models used by FastAPI routes.
"""

from pydantic import BaseModel
from typing import List, Dict, Optional


# ── Risk Prediction ──
class RiskPredictionRequest(BaseModel):
    ward_id: str
    features: Dict


class RiskPredictionResponse(BaseModel):
    ward_id: str
    score: float
    factors: Dict


# ── Clustering ──
class ClusterRequest(BaseModel):
    points: List[Dict]


class ClusterResult(BaseModel):
    centroid: Dict
    radius: float
    count: int
    dominant_type: Optional[str] = None


class ClusterResponse(BaseModel):
    clusters: List[ClusterResult]


# ── Sentiment Analysis ──
class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    score: float
    emotion: str
    topics: List[str]


# ── Complaint Triage ──
class ComplaintTriageRequest(BaseModel):
    text: str
    category: str


class ComplaintTriageResponse(BaseModel):
    priority_score: int
    urgency_label: str


# ── Recommendation ──
class RecommendationRequest(BaseModel):
    ward_id: str
    risk: float
    complaints: List[Dict]
    forecast: Dict


class RecommendationResponse(BaseModel):
    text: str


# ── Forecast ──
class ForecastResponse(BaseModel):
    dates: List[str]
    values: List[float]
    lower: List[float]
    upper: List[float]
