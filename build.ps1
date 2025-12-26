# PowerShell build script for injecting API key
# Usage: .\build.ps1 [api_key]
# Example: .\build.ps1 "your_api_key_here"

param(
    [string]$ApiKey = ""
)

# If no API key provided as argument, check environment variable
if ([string]::IsNullOrEmpty($ApiKey)) {
    $ApiKey = $env:UPC_DATABASE_API_KEY
}

# If still no API key, check .env file
if ([string]::IsNullOrEmpty($ApiKey) -and (Test-Path ".env")) {
    Write-Host "📄 Reading API key from .env file..." -ForegroundColor Cyan
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^UPC_DATABASE_API_KEY=(.+)$") {
            $ApiKey = $matches[1]
        }
    }
}

# Set environment variable for the build process
$env:UPC_DATABASE_API_KEY = $ApiKey

# Run the Node.js build script
Write-Host "🔨 Running build script..." -ForegroundColor Cyan
node build.js

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    
    if ([string]::IsNullOrEmpty($ApiKey)) {
        Write-Host "⚠️  No API key set - using limited access mode" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To set an API key, use one of these methods:" -ForegroundColor Yellow
        Write-Host "  1. Pass as argument:     .\build.ps1 `"your_api_key`"" -ForegroundColor Gray
        Write-Host "  2. Set env variable:     `$env:UPC_DATABASE_API_KEY=`"your_key`"; .\build.ps1" -ForegroundColor Gray
        Write-Host "  3. Create .env file:     UPC_DATABASE_API_KEY=your_key" -ForegroundColor Gray
    } else {
        Write-Host "✅ API key configured (${ApiKey.Length} characters)" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

