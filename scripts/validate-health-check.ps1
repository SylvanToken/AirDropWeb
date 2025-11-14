# PowerShell script to validate health-check.sh structure
# This validates the script has all required components

$scriptPath = "scripts/health-check.sh"
$errors = @()
$warnings = @()

Write-Host "Validating health-check.sh script..." -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: Script not found at $scriptPath" -ForegroundColor Red
    exit 1
}

$content = Get-Content $scriptPath -Raw

# Check for required functions
$requiredFunctions = @(
    "check_http_response",
    "check_api_functionality", 
    "check_performance",
    "check_version",
    "output_json",
    "output_human",
    "main"
)

Write-Host "Checking for required functions..." -ForegroundColor Yellow
foreach ($func in $requiredFunctions) {
    if ($content -match "$func\(\)") {
        Write-Host "  ✓ $func" -ForegroundColor Green
    } else {
        $errors += "Missing function: $func"
        Write-Host "  ✗ $func" -ForegroundColor Red
    }
}
Write-Host ""

# Check for retry logic
Write-Host "Checking for retry logic..." -ForegroundColor Yellow
if ($content -match "MAX_ATTEMPTS" -and $content -match "RETRY_DELAY" -and $content -match "while.*attempt.*MAX_ATTEMPTS") {
    Write-Host "  ✓ Retry logic implemented" -ForegroundColor Green
} else {
    $errors += "Retry logic not properly implemented"
    Write-Host "  ✗ Retry logic missing" -ForegroundColor Red
}
Write-Host ""

# Check for JSON output
Write-Host "Checking for JSON output..." -ForegroundColor Yellow
if ($content -match "output_json" -and $content -match '"status":' -and $content -match '"checks":') {
    Write-Host "  ✓ JSON output implemented" -ForegroundColor Green
} else {
    $errors += "JSON output not properly implemented"
    Write-Host "  ✗ JSON output missing" -ForegroundColor Red
}
Write-Host ""

# Check for command-line arguments
Write-Host "Checking for command-line argument parsing..." -ForegroundColor Yellow
$requiredArgs = @("--host", "--port", "--max-attempts", "--retry-delay", "--json", "--verbose", "--help")
$foundArgs = 0
foreach ($arg in $requiredArgs) {
    if ($content -match [regex]::Escape($arg)) {
        $foundArgs++
    }
}
if ($foundArgs -eq $requiredArgs.Count) {
    Write-Host "  ✓ All command-line arguments supported ($foundArgs/$($requiredArgs.Count))" -ForegroundColor Green
} else {
    $warnings += "Some command-line arguments may be missing ($foundArgs/$($requiredArgs.Count))"
    Write-Host "  ⚠ Some arguments missing ($foundArgs/$($requiredArgs.Count))" -ForegroundColor Yellow
}
Write-Host ""

# Check for logging functions
Write-Host "Checking for logging functions..." -ForegroundColor Yellow
$loggingFunctions = @("log_info", "log_success", "log_error", "log_warn", "log_verbose")
foreach ($func in $loggingFunctions) {
    if ($content -match "$func\(\)") {
        Write-Host "  ✓ $func" -ForegroundColor Green
    } else {
        $warnings += "Missing logging function: $func"
        Write-Host "  ⚠ $func" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check for critical endpoints
Write-Host "Checking for API endpoint tests..." -ForegroundColor Yellow
if ($content -match "/api/stats" -or $content -match "/api/tasks" -or $content -match "/api/leaderboard") {
    Write-Host "  ✓ Critical API endpoints tested" -ForegroundColor Green
} else {
    $warnings += "API endpoint tests may be incomplete"
    Write-Host "  ⚠ API endpoint tests incomplete" -ForegroundColor Yellow
}
Write-Host ""

# Check for performance metrics
Write-Host "Checking for performance metrics..." -ForegroundColor Yellow
$metrics = @("RESPONSE_TIME", "MEMORY_USAGE", "CPU_USAGE")
$foundMetrics = 0
foreach ($metric in $metrics) {
    if ($content -match $metric) {
        $foundMetrics++
    }
}
if ($foundMetrics -eq $metrics.Count) {
    Write-Host "  ✓ All performance metrics tracked ($foundMetrics/$($metrics.Count))" -ForegroundColor Green
} else {
    $warnings += "Some performance metrics may be missing ($foundMetrics/$($metrics.Count))"
    Write-Host "  ⚠ Some metrics missing ($foundMetrics/$($metrics.Count))" -ForegroundColor Yellow
}
Write-Host ""

# Check for version verification
Write-Host "Checking for version verification..." -ForegroundColor Yellow
if ($content -match "package\.json" -and $content -match "git.*rev-parse") {
    Write-Host "  ✓ Version verification implemented" -ForegroundColor Green
} else {
    $warnings += "Version verification may be incomplete"
    Write-Host "  ⚠ Version verification incomplete" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✓ All validations passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The health-check.sh script is properly structured and ready to use." -ForegroundColor Green
    exit 0
} elseif ($errors.Count -eq 0) {
    Write-Host "⚠ Validation completed with warnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "The script should work but may have minor issues." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✗ Validation failed with errors:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "Please fix the errors before using the script." -ForegroundColor Red
    exit 1
}
