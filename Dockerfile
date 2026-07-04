# ==========================================
# Stage 1: Build the React Frontend (Vite)
# ==========================================
FROM node:26-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY frontend/ ./
# Set backend URL to empty in production so it uses relative path proxied/served by FastAPI
ENV REACT_APP_BACKEND_URL=""
RUN npm run build

# ==========================================
# Stage 2: Serve Frontend & Backend (FastAPI)
# ==========================================
# Match the Python version CI tests against (.github/workflows/ci.yml)
FROM python:3.13-slim AS runner
WORKDIR /app

# Install system dependencies if needed (e.g. build-essential, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application files
COPY backend/ ./backend/

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# portfolio.json is the single source of truth for the resume PDF and the
# chatbot grounding (config.PORTFOLIO_JSON_PATH resolves it here). It lives
# under frontend/src, which is NOT part of dist, so copy it explicitly —
# without it the resume endpoint 500s in production.
COPY --from=frontend-builder /app/frontend/src/data/portfolio.json ./frontend/src/data/portfolio.json

# Expose FastAPI port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
WORKDIR /app/backend

# Run FastAPI backend using uvicorn.
# --proxy-headers is required behind Render's load balancer: without it,
# request.client.host is the proxy's IP, so per-IP rate limiting lumps all
# visitors into one bucket and audit logs record the wrong address.
# --forwarded-allow-ips="*" is safe here because only the platform proxy
# can reach the container directly.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
