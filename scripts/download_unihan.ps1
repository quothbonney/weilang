# Download and extract Unihan data for Chinese character analysis
# PowerShell script for Windows

param(
    [string]$DataDir = "$PSScriptRoot\..\data\unihan"
)

Write-Host "Creating data directory..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

Write-Host "Downloading Unihan database from Unicode.org..." -ForegroundColor Green

$zipFile = Join-Path $DataDir "Unihan.zip"
$url = "https://unicode.org/Public/UNIDATA/Unihan.zip"

Push-Location $DataDir

try {
    # Download the latest Unihan database
    Write-Host "Downloading from $url..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $url -OutFile $zipFile -UserAgent "Mozilla/5.0"

    Write-Host "Extracting required files..." -ForegroundColor Green

    # Extract specific files using .NET classes
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipFile)

    $filesToExtract = @(
        "Unihan_RadicalStrokeCounts.txt",
        "Unihan_Readings.txt", 
        "Unihan_DictionaryLikeData.txt",
        "Unihan_Variants.txt"
    )

    foreach ($fileName in $filesToExtract) {
        $entry = $zip.Entries | Where-Object { $_.Name -eq $fileName }
        if ($entry) {
            Write-Host "Extracting $fileName..." -ForegroundColor Yellow
            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, (Join-Path $DataDir $fileName), $true)
        } else {
            Write-Warning "File $fileName not found in archive"
        }
    }

    $zip.Dispose()

    Write-Host "Cleaning up..." -ForegroundColor Green
    Remove-Item $zipFile -Force

    Write-Host "Unihan data downloaded successfully!" -ForegroundColor Green
    Write-Host "Files extracted to: $DataDir" -ForegroundColor Cyan
    Get-ChildItem $DataDir | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Gray }

} catch {
    Write-Error "Failed to download or extract Unihan data: $($_.Exception.Message)"
    exit 1
} finally {
    Pop-Location
}

Write-Host "Done!" -ForegroundColor Green 