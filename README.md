# 🛡️ SafeCity - Smart Urban Risk Mapping & Citizen Safety Platform

**AI-powered urban safety platform for Pune** that unifies crime data, civic grievances, traffic/accident hotspots, and real-time emergency dispatch into a single role-aware intelligence system.

## 🎯 Vision
Turn Pune's raw crime, civic, and traffic data into a living AI-powered safety layer that guides every citizen, cop, and city official in real time.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Leaflet.js + Socket.io
- **Backend**: Node.js + Express + Socket.io + Firebase Admin
- **ML Service**: Python FastAPI + scikit-learn + Prophet + HuggingFace
- **Database**: PostgreSQL + PostGIS (Supabase)
- **Cache**: Redis
- **Auth**: Firebase Authentication
- **Real-time**: Socket.io + Firebase Realtime Database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL with PostGIS
- Redis
- Firebase project

### 1. Clone & Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install ML service dependencies
cd ../ml
pip install -r requirements.txt
```

### 2. Configure Environment Variables

**Frontend (.env)**
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_db_url
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Backend (.env)**
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/safecity
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY="your_key"
FIREBASE_CLIENT_EMAIL=your_email
ML_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_key
```

### 3. Setup Database

```sql
-- Enable PostGIS
CREATE EXTENSION postgis;

-- Create tables
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  ward_id VARCHAR(10),
  severity VARCHAR(20),
  timestamp TIMESTAMP DEFAULT NOW(),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  description TEXT,
  media_url TEXT,
  priority_score INT,
  status VARCHAR(20) DEFAULT 'pending',
  user_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sos_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  timestamp TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  responding_officer_id VARCHAR(100)
);

CREATE TABLE vehicles (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(20),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  status VARCHAR(20),
  officer_id VARCHAR(100),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE risk_scores (
  ward_id VARCHAR(10) PRIMARY KEY,
  score DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT NOW(),
  contributing_factors JSONB
);
```

### 4. Run Services

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - ML Service
cd ml
python main.py

# Terminal 4 - Redis (if not running as service)
redis-server
```

## 📱 Features

### 1. 🗺️ Unified Safety Map
- Crime heatmap with NCRB data
- Accident-prone zones
- Civic grievance pins
- Emergency vehicle tracking
- Time-based layer filtering

### 2. 🆘 SOS Emergency System
- One-tap emergency alert
- Zero-latency Firebase Realtime DB
- Instant broadcast to police dashboards
- Live location streaming

### 3. 📋 AI-Powered Complaint System
- Photo/video upload support
- ARIA auto-triage with urgency scoring
- Priority-based queue for authorities
- Real-time status tracking

### 4. 🧠 ARIA - AI Risk Intelligence
- Risk scoring per zone (0-100)
- DBSCAN hotspot detection
- Sentiment analysis (English + Marathi)
- 7-day crime forecasting
- Generative safety recommendations

### 5. 🚨 Emergency Resource Tracker
- Live police/ambulance positions
- AI-suggested optimal dispatch
- Real-time vehicle status

## 👥 User Roles

### Citizen
- View safety scores
- Trigger SOS alerts
- File complaints with media
- Find nearest help stations
- Plan safe routes

### Police Officer
- Monitor real-time incidents
- Respond to SOS alerts
- View hotspot clusters
- Track patrol vehicles

### Authority/Admin
- Analytics dashboard
- AI insights & predictions
- Complaint management
- Resource allocation

## 🔐 Authentication

Firebase Authentication with:
- Google Sign-In (citizens)
- Phone OTP (police officers)
- Email/Password (authority admins)

Role metadata stored in Firestore at `users/{uid}`.

## 📊 API Endpoints

```
POST   /api/incidents              Create incident
GET    /api/incidents              List incidents
GET    /api/zones/risk             Get risk scores
POST   /api/complaints             File complaint
GET    /api/complaints             List complaints
POST   /api/sos                    Trigger SOS
GET    /api/sos/active             Active SOS events
GET    /api/emergency/vehicles     Vehicle locations
GET    /api/analytics/crime-trends Crime trends
```

## 🔌 Socket.io Events

```javascript
// Client → Server
socket.emit('sos:trigger', { userId, lat, lng })
socket.emit('vehicle:update', { vehicleId, lat, lng })
socket.emit('incident:report', { type, lat, lng, severity })

// Server → Client
socket.on('sos:alert', { sosId, lat, lng, userId })
socket.on('incident:new', { incident })
socket.on('risk:updated', { wardId, score })
```

## 🤖 ML Service Endpoints

```
GET  /health
POST /predict/risk              Risk scoring
POST /predict/cluster           Hotspot detection
POST /predict/sentiment         Sentiment analysis
GET  /predict/forecast/:ward_id 7-day forecast
POST /generate/recommendation   AI recommendations
POST /triage/complaint          Urgency scoring
```

## 🎨 UI Components

Key React components:
- `SOSButton.jsx` - Emergency trigger
- `HeatmapLayer.jsx` - Crime heatmap
- `IncidentPin.jsx` - Incident markers
- `ComplaintForm.jsx` - Complaint filing
- `EmergencyVehicleTracker.jsx` - Vehicle tracking

## 📦 Project Structure

```
safecity/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
├── ml/                # Python FastAPI
└── README.md
```

## 🚢 Deployment

- **Frontend**: Vercel
- **Backend**: Railway.app
- **ML Service**: Railway.app
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Redis**: Railway.app / Upstash

## 🏆 Key Innovations

1. **ARIA Generative Dispatch** - AI-written actionable recommendations
2. **Accident + Road Safety Layer** - Beyond crime data
3. **AI Complaint Triage** - Urgency-based prioritization
4. **Firebase Realtime SOS** - Zero-latency emergency system
5. **Multilingual Sentiment** - Marathi + English support
6. **Safe Route Planner** - Risk-aware navigation

## 📝 License

Built for 30-Hour National Level Hackathon | Pune, India

---

**SafeCity** - *Intelligence That Protects* 🛡️
