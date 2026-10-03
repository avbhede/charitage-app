# Use lightweight official Python runtime
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logging for Cloud Run
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Cloud Run injects PORT environment variable (default: 8080)
ENV PORT=8080
EXPOSE 8080

# Run Uvicorn listening on 0.0.0.0 and the dynamic Cloud Run port
CMD exec uvicorn server:app --host 0.0.0.0 --port ${PORT}
