# Master setup script for WeiLang word profile data
# Downloads Unihan, stroke order data, and sets up databases

param(
    [switch]$SkipDownload,
    [switch]$SkipETL,
    [string]$PythonExe = "python"
)

$ErrorActionPreference = "Stop"

Write-Host "=== WeiLang Word Profile Data Setup ===" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")

# Check for Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    & $PythonExe --version
    Write-Host "Python found!" -ForegroundColor Green
} catch {
    Write-Error "Python not found. Please install Python 3.7+ and add it to PATH."
    exit 1
}

# Step 1: Download Unihan data
if (-not $SkipDownload) {
    Write-Host ""
    Write-Host "Step 1: Downloading Unihan data..." -ForegroundColor Cyan
    & (Join-Path $scriptDir "download_unihan.ps1")
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to download Unihan data"
        exit 1
    }
} else {
    Write-Host "Skipping Unihan download..." -ForegroundColor Yellow
}

# Step 2: Download stroke order data
if (-not $SkipDownload) {
    Write-Host ""
    Write-Host "Step 2: Downloading stroke order data..." -ForegroundColor Cyan
    & (Join-Path $scriptDir "fetch_mmah.ps1")
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to download stroke order data"
        exit 1
    }
} else {
    Write-Host "Skipping stroke order download..." -ForegroundColor Yellow
}

# Step 3: Run ETL to create databases
if (-not $SkipETL) {
    Write-Host ""
    Write-Host "Step 3: Processing data with ETL..." -ForegroundColor Cyan
    
    # Create databases directory
    $dbDir = Join-Path $projectRoot "data\databases"
    New-Item -ItemType Directory -Force -Path $dbDir | Out-Null
    
    # Run Python ETL script
    Push-Location $scriptDir
    try {
        Write-Host "Running Unihan ETL script..." -ForegroundColor Yellow
        & $PythonExe "etl_unihan.py"
        if ($LASTEXITCODE -ne 0) {
            throw "ETL script failed"
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "Skipping ETL processing..." -ForegroundColor Yellow
}

# Step 4: Create cache directory structure
Write-Host ""
Write-Host "Step 4: Setting up cache directories..." -ForegroundColor Cyan
$cacheDir = Join-Path $projectRoot "data\cache"
New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
New-Item -ItemType Directory -Force -Path "$cacheDir\profiles" | Out-Null
New-Item -ItemType Directory -Force -Path "$cacheDir\audio" | Out-Null

# Step 5: Create public assets directory for CDN
Write-Host "Setting up public assets..." -ForegroundColor Cyan
$publicDir = Join-Path $projectRoot "public"
New-Item -ItemType Directory -Force -Path $publicDir | Out-Null

# Copy stroke SVGs to public directory for CDN access
$strokesPublic = Join-Path $publicDir "strokes"
$strokesData = Join-Path $projectRoot "data\strokes"
if (Test-Path $strokesData) {
    Write-Host "Copying stroke SVGs to public directory..." -ForegroundColor Yellow
    Copy-Item $strokesData $strokesPublic -Recurse -Force
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Data directories created:" -ForegroundColor Cyan
Write-Host "  - data/unihan/     (Unihan text files)" -ForegroundColor Gray
Write-Host "  - data/strokes/    (Stroke order SVGs)" -ForegroundColor Gray
Write-Host "  - data/databases/  (SQLite databases)" -ForegroundColor Gray
Write-Host "  - data/cache/      (Profile cache)" -ForegroundColor Gray
Write-Host "  - public/strokes/  (CDN-ready SVGs)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Add your API keys to environment variables" -ForegroundColor Gray
Write-Host "  2. Start your development server" -ForegroundColor Gray
Write-Host "  3. Test the word profile API" -ForegroundColor Gray
Write-Host "" 