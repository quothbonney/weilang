# PowerShell script to run the word import
Write-Host "WeiLang Word Import Script" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check if Node.js is available
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Converting CSV to JSON..." -ForegroundColor Yellow
    node scripts/import_words.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "CSV conversion completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Start your app with: npm start" -ForegroundColor White
        Write-Host "2. The 300 words will be automatically imported on first load" -ForegroundColor White
        Write-Host "3. Navigate to 'My Words' to see all imported words" -ForegroundColor White
    } else {
        Write-Host "Error converting CSV file" -ForegroundColor Red
    }
} else {
    Write-Host "Node.js not found. Please install Node.js to run this script." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 