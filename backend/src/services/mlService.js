import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000
});

export const predictRisk = async (wardId, features) => {
  const response = await mlClient.post('/predict/risk', { ward_id: wardId, features });
  return response.data;
};

export const clusterIncidents = async (points) => {
  const response = await mlClient.post('/predict/cluster', { points });
  return response.data;
};

export const analyzeSentiment = async (text) => {
  const response = await mlClient.post('/predict/sentiment', { text });
  return response.data;
};

export const getForecast = async (wardId) => {
  const response = await mlClient.get(`/predict/forecast/${wardId}`);
  return response.data;
};

export const generateRecommendation = async (wardId, risk, complaints, forecast) => {
  const response = await mlClient.post('/generate/recommendation', {
    ward_id: wardId,
    risk,
    complaints,
    forecast
  });
  return response.data;
};

export const triageComplaint = async (text, category) => {
  const response = await mlClient.post('/triage/complaint', { text, category });
  return response.data;
};
