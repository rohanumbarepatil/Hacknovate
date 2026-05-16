import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import logging

from app.schemas.schemas import (
    RiskPredictionRequest, RiskPredictionResponse,
    SentimentRequest, SentimentResponse,
    ComplaintTriageRequest, ComplaintTriageResponse,
    ForecastResponse
)
from app.services.risk_service import calculate_risk_score
from app.services.sentiment_service import analyze_sentiment
from app.services.triage_service import triage_complaint

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_service")

app = FastAPI(
    title="SafeCity AI Service",
    description="Microservice for risk prediction, sentiment analysis, and complaint triage",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for request timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/")
async def root():
    return {"message": "SafeCity AI Microservice is online", "version": "1.0.0"}

@app.post("/risk/predict", response_model=RiskPredictionResponse)
async def predict_risk(request: RiskPredictionRequest):
    """Predict risk score for a zone based on features."""
    try:
        result = calculate_risk_score(request.ward_id, request.features)
        return result
    except Exception as e:
        logger.error(f"Risk prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Risk calculation failed")

@app.post("/sentiment", response_model=SentimentResponse)
async def get_sentiment(request: SentimentRequest):
    """Analyze sentiment and extract topics from text."""
    try:
        return analyze_sentiment(request.text)
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Sentiment analysis failed")

@app.post("/triage", response_model=ComplaintTriageResponse)
async def triage(request: ComplaintTriageRequest):
    """Classify complaint urgency and priority."""
    try:
        return triage_complaint(request.text, request.category)
    except Exception as e:
        logger.error(f"Triage error: {str(e)}")
        raise HTTPException(status_code=500, detail="Complaint triage failed")

@app.get("/forecast/{zone_id}", response_model=ForecastResponse)
async def get_forecast(zone_id: str):
    """Get risk forecast for the next 7 days (Mock for now)."""
    # In production, this would use a time-series model (e.g. Prophet, LSTM)
    import datetime
    
    dates = [(datetime.datetime.now() + datetime.timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    # Mock some data
    values = [45.2, 48.5, 52.1, 49.3, 44.7, 55.2, 58.1]
    lower = [v - 5 for v in values]
    upper = [v + 5 for v in values]
    
    return {
        "dates": dates,
        "values": values,
        "lower": lower,
        "upper": upper
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
