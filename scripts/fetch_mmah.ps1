# Fetch Make Me A Hanzi stroke order data
# PowerShell script for Windows

param(
    [string]$DataDir = "$PSScriptRoot\..\data\strokes",
    [string]$TempDir = "$PSScriptRoot\..\temp"
)

Write-Host "Setting up stroke order data from Make Me A Hanzi..." -ForegroundColor Green

# Create directories
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

try {
    # Check if git is available
    $gitAvailable = $false
    try {
        git --version | Out-Null
        $gitAvailable = $true
        Write-Host "Git found, cloning repository..." -ForegroundColor Green
    } catch {
        Write-Host "Git not available, will download ZIP instead..." -ForegroundColor Yellow
    }

    if ($gitAvailable) {
        # Clone the repository (shallow clone for faster download)
        $repoDir = Join-Path $TempDir "makemeahanzi"
        if (Test-Path $repoDir) {
            Remove-Item $repoDir -Recurse -Force
        }
        Write-Host "Cloning Make Me A Hanzi repository..." -ForegroundColor Green
        git clone --depth 1 https://github.com/skishore/makemeahanzi.git $repoDir
        
        # Look for SVG directory (repo structure changed from "graphics" to "svgs")
        $svgDir = Join-Path $repoDir "svgs"
        if (Test-Path $svgDir) {
            Write-Host "Copying SVG stroke data files..." -ForegroundColor Green
            Copy-Item (Join-Path $svgDir "*") $DataDir -Recurse -Force
        } else {
            # Show what's actually in the repo for debugging
            Write-Host "Contents of cloned repository:" -ForegroundColor Yellow
            Get-ChildItem $repoDir | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Gray }
            throw "SVG directory not found in cloned repository. The repo structure may have changed."
        }
    } else {
        # Download as ZIP if git is not available
        Write-Host "Downloading repository as ZIP..." -ForegroundColor Green
        $zipUrl = "https://github.com/skishore/makemeahanzi/archive/refs/heads/master.zip"
        $zipFile = Join-Path $TempDir "makemeahanzi-master.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipFile -UserAgent "Mozilla/5.0"
        Write-Host "Extracting ZIP file..." -ForegroundColor Yellow
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $TempDir)
        
        # Look for SVG directory in extracted ZIP
        $svgDir = Join-Path $TempDir "makemeahanzi-master\svgs"
        if (Test-Path $svgDir) {
            Write-Host "Copying SVG stroke data files..." -ForegroundColor Green
            Copy-Item (Join-Path $svgDir "*") $DataDir -Recurse -Force
        } else {
            # Show what's actually in the extracted folder for debugging
            $extractedDir = Join-Path $TempDir "makemeahanzi-master"
            Write-Host "Contents of extracted repository:" -ForegroundColor Yellow
            Get-ChildItem $extractedDir | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Gray }
            throw "SVG directory not found in extracted ZIP. The repo structure may have changed."
        }
    }
    
    Write-Host "Stroke order data downloaded successfully!" -ForegroundColor Green
    Write-Host "Files copied to: $DataDir" -ForegroundColor Cyan
    
    # Show some stats
    $fileCount = (Get-ChildItem $DataDir -File).Count
    Write-Host "Total stroke data files: $fileCount" -ForegroundColor Gray
    
} catch {
    Write-Error "Failed to fetch stroke order data: $($_.Exception.Message)"
    exit 1
} finally {
    # Clean up temp directory
    if (Test-Path $TempDir) {
        Write-Host "Cleaning up temporary files..." -ForegroundColor Green
        Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Done!" -ForegroundColor Green 