#!/usr/bin/env bash
# scripts/deploy_cloud_run.sh
# Automated deployment script for Google Cloud Run (Bash)

set -e

PROJECT_ID=${1:-""}
REGION=${2:-"asia-south1"}

echo "========================================="
echo "  Charitage Backend Cloud Run Deployment "
echo "========================================="

if ! command -v gcloud &> /dev/null; then
    echo "[ERROR] 'gcloud' CLI is not found on your system."
    echo "Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if [ -z "$PROJECT_ID" ]; then
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || true)
    if [ -n "$CURRENT_PROJECT" ]; then
        read -p "Enter GCP Project ID (Press Enter for '$CURRENT_PROJECT'): " INPUT_PROJECT
        PROJECT_ID=${INPUT_PROJECT:-$CURRENT_PROJECT}
    else
        read -p "Enter your GCP Project ID: " PROJECT_ID
    fi
fi

if [ -z "$PROJECT_ID" ]; then
    echo "[ERROR] Project ID is required."
    exit 1
fi

echo "Setting active project to: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

echo "Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
ENV_FILE="$BACKEND_DIR/.env"

ENV_VARS=""
if [ -f "$ENV_FILE" ]; then
    echo "Reading backend/.env configuration..."
    while IFS= read -r line || [ -n "$line" ]; do
        line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        if [[ -n "$line" && ! "$line" =~ ^# && "$line" == *"="* ]]; then
            if [ -n "$ENV_VARS" ]; then
                ENV_VARS="$ENV_VARS,$line"
            else
                ENV_VARS="$line"
            fi
        fi
    done < "$ENV_FILE"
fi

echo "Deploying charitage-backend to Cloud Run ($REGION)..."
if [ -n "$ENV_VARS" ]; then
    gcloud run deploy charitage-backend \
        --source "$BACKEND_DIR" \
        --region "$REGION" \
        --platform managed \
        --allow-unauthenticated \
        --min-instances 1 \
        --port 8080 \
        --set-env-vars "$ENV_VARS"
else
    gcloud run deploy charitage-backend \
        --source "$BACKEND_DIR" \
        --region "$REGION" \
        --platform managed \
        --allow-unauthenticated \
        --min-instances 1 \
        --port 8080
fi

echo ""
echo "========================================="
echo " Deployment Complete!"
echo " Service URL:"
gcloud run services describe charitage-backend --region "$REGION" --format='value(status.url)'
echo "========================================="
