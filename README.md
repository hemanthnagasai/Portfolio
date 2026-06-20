# 🌌 The Multi-Dimensional Universe of Hemanth

A premium, interactive, scroll-driven portfolio application that spans across multiple dimensions of professional capabilities, personal memories, and emotional journeys.

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/ThreeJS-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Gemini](https://img.shields.io/badge/Gemini%20AI-8E75FF?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 🌌 The Four Dimensions

Explore Hemanth's life and work through four unique visual dimensions:

| Dimension | Aesthetic | Core Features | 3D WebGL Background |
| :--- | :--- | :--- | :--- |
| **🌀 Gateway** | Futuristic Portal | Locked paths that unlock as you explore; cinematic typewriter intro. | Interactive Starfield Vortex |
| **💻 Professional** | Cybernetic HUD | 3D film-reel timeline, interactive projects, education tree, skills. | Data Sky Highway |
| **🍃 Personal** | Scrapbook Journal | Real Polaroid frames, glassmorphic panels, value vertical spine. | Warm Stepping Stones & Fireflies |
| **🕯️ Emotional** | Candlelight Poetry | Poetic letters, signature, moderated message board ("Leave a Trace"). | Constellation Spiral + Flashlight |

---

## 🛠️ Architecture & Flow

```mermaid
graph TD
    User([User Browser]) -->|Interacts| FE[Vite + React + TS Frontend]
    FE -->|WebGL Background Canvas| Canvas[Three.js Engine]
    FE -->|Queries /api| BE[FastAPI Backend]
    BE -->|Saves Traces| DB[(SQLite Database)]
    BE -->|Generates PDF| PDF[ReportLab Resume Engine]
    BE -->|Requests Generation| Gemini[Gemini 2.5 Flash API]
    Gemini -->|Returns Response| BE
    BE -->|Sends Response| FE
```

---

## 🔒 Security & Moderation

This application includes robust security and content moderation features to prevent abuse, resource exhaustion, and spam:

- **AI-Driven Moderation:** Guestbook trace submissions are automatically validated by the Gemini API (`gemini-2.5-flash`) with a fast-path local profanity filter fallback to reject inappropriate content instantly.
- **Rate Limiting:** Protects AI generation quotas and server capacity using an IP-based sliding window rate limiter on key interaction endpoints.
- **Database Row Capping:** Automatically auto-prunes database tables during write operations to prevent disk space exhaustion from continuous spam.
- **Payload Constraints:** Enforces strict Pydantic length and validation constraints on client-supplied data inputs.
- **Secure Admin Deletion:** A protected `DELETE /api/traces/{word}` endpoint is available for manual moderation, secured by an `ADMIN_TOKEN` header check.

---

## ⚙️ Setup & Local Development

### 📋 Prerequisites
- **Node.js** (v18+)
- **Python** (v3.11+)
- **Gemini API Key** (Required for the interactive Recruiter chatbot)

---

### 1️⃣ Environment Configuration

Create a local environment configuration using the provided examples:

* **Backend**: Create a `backend/.env` file:
  ```env
  DB_NAME=portfolio
  GEMINI_API_KEY=your_gemini_api_key_here
  ADMIN_TOKEN=your_admin_token_here
  ```
* **Frontend**: Create a `frontend/.env` file:
  ```env
  PORT=5000
  HOST=0.0.0.0
  REACT_APP_BACKEND_URL=
  ```

---

### 2️⃣ Backend Server Installation (FastAPI)

From the `backend/` directory:

1. **Initialize and Activate Virtual Environment**:
   ```bash
   python -m venv .venv
   
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   
   # macOS / Linux
   source .venv/bin/activate
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Launch Server**:
   ```bash
   python -m uvicorn app.main:app --host localhost --port 8000 --reload
   ```

> [!NOTE]
> The local API Documentation is available at `http://localhost:8000/docs`.

---

### 3️⃣ Frontend Development Setup (Vite + React)

From the `frontend/` directory:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Dev Server**:
   ```bash
   npm run start
   ```

> [!TIP]
> The frontend will load at `http://localhost:5000/`. Vite will automatically proxy API requests to port `8000` locally.

---

## 🐳 Docker Deployment (Production)

You can run the entire application (serving the built frontend through FastAPI) from a single container:

1. **Build Image**:
   ```bash
   docker build -t life-portfolio .
   ```
2. **Launch Container**:
   ```bash
   docker run -d -p 8000:8000 -e DB_NAME="portfolio" -e GEMINI_API_KEY="your_api_key" -e ADMIN_TOKEN="your_admin_token" life-portfolio
   ```

Open `http://localhost:8000` to view the live app.

---

## 🧪 Running Tests

To run the automated backend test suite, navigate to the `backend/` directory and execute:

```bash
cd backend

# Windows PowerShell:
.\.venv\Scripts\pytest

# macOS / Linux:
source .venv/bin/activate
pytest
```
