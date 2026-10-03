# scripts/deploy_cloud_run.ps1
# Automated deployment script for Google Cloud Run (PowerShell)

param(
    [string]$ProjectId = "",
    [string]$Region = "asia-south1"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Charitage Backend Cloud Run Deployment " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] 'gcloud' CLI is not found on your system." -ForegroundColor Red
    Write-Host ""
    Write-Host "To install Google Cloud SDK on Windows, run:" -ForegroundColor Yellow
    Write-Host "  winget install Google.CloudSDK" -ForegroundColor White
    Write-Host "Or download from: https://cloud.google.com/sdk/docs/install#windows" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing, re-run this script." -ForegroundColor Yellow
    exit 1
}

# 2. Project ID handling
if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    $currentProject = (gcloud config get-value project 2>$null)
    if ($currentProject) {
        $ProjectId = Read-Host "Enter GCP Project ID (Press Enter for '$currentProject')"
        if ([string]::IsNullOrWhiteSpace($ProjectId)) {
            $ProjectId = $currentProject
        }
    } else {
        $ProjectId = Read-Host "Enter your GCP Project ID"
    }
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    Write-Host "[ERROR] Project ID is required." -ForegroundColor Red
    exit 1
}

Write-Host "Setting active project to: $ProjectId" -ForegroundColor Green
gcloud config set project $ProjectId

# 3. Enable required Google Cloud APIs
Write-Host "Enabling required APIs (Cloud Run, Cloud Build, Artifact Registry)..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 4. Load backend/.env if available
$envFile = Join-Path $PSScriptRoot "..\backend\.env"
$envVars = @()

if (Test-Path $envFile) {
    Write-Host "Reading backend/.env configuration..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            $envVars += "$key=$val"
        }
    }
}

$envArg = ""
if ($envVars.Count -gt 0) {
    $envArg = "--set-env-vars=" + ($envVars -join ",")
}

# 5. Deploy to Cloud Run
Write-Host "Deploying charitage-backend to Cloud Run ($Region)..." -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "..\backend"

if ($envArg) {
    gcloud run deploy charitage-backend `
        --source $backendDir `
        --region $Region `
        --platform managed `
        --allow-unauthenticated `
        --min-instances 1 `
        --port 8080 `
        $envArg
} else {
    gcloud run deploy charitage-backend `
        --source $backendDir `
        --region $Region `
        --platform managed `
        --allow-unauthenticated `
        --min-instances 1 `
        --port 8080
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host " Deployment Succeeded!" -ForegroundColor Green
    Write-Host " Retrieve your URL with:" -ForegroundColor White
    Write-Host "   gcloud run services describe charitage-backend --region $Region --format='value(status.url)'" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Green
} else {
    Write-Host "Deployment failed with exit code $LASTEXITCODE." -ForegroundColor Red
}
