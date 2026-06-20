# ==========================================
# Stage 1: Build the React Frontend (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
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
FROM python:3.11-slim AS runner
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

# Expose FastAPI port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
WORKDIR /app/backend

# Run FastAPI backend using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
