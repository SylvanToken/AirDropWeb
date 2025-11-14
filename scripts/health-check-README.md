# Health Check Script

## Overview

The `health-check.sh` script performs comprehensive health verification for the Sylvan Token application. It checks HTTP response, API functionality, performance metrics, and version information.

## Requirements Met

- ✅ HTTP response check for endpoints
- ✅ API functionality checks for critical endpoints
- ✅ Performance checks (response time, memory, CPU)
- ✅ Version verification check
- ✅ JSON output format
- ✅ Retry logic with configurable attempts and delays

## Usage

### Basic Usage

```bash
bash scripts/health-check.sh
```

### With Options

```bash
# Check specific host and port
bash scripts/health-check.sh --host localhost --port 3333

# Output in JSON format
bash scripts/health-check.sh --json

# Verbose output
bash scripts/health-check.sh --verbose

# Custom retry configuration
bash scripts/health-check.sh --max-attempts 10 --retry-delay 5

# Combined options
bash scripts/health-check.sh --host localhost --port 3333 --json --verbose
```

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--host HOST` | Application host | localhost |
| `--port PORT` | Application port | 3333 |
| `--max-attempts N` | Maximum retry attempts | 5 |
| `--retry-delay SECONDS` | Delay between retries | 3 |
| `--timeout SECONDS` | Request timeout | 5 |
| `--json` | Output results in JSON format | false |
| `--verbose` | Enable verbose output | false |
| `--help` | Show help message | - |

## Environment Variables

You can also configure the script using environment variables:

```bash
export HOST=localhost
export PORT=3333
export MAX_ATTEMPTS=5
export RETRY_DELAY=3
export TIMEOUT=5
export MAX_RESPONSE_TIME=2000

bash scripts/health-check.sh
```

## Health Checks Performed

### 1. HTTP Response Check
- Tests the root endpoint (`/`)
- Verifies 200 OK status code
- Measures response time
- Retries on failure with configurable delay

### 2. API Functionality Check
- Tests critical API endpoints:
  - `/api/stats/public`
  - `/api/tasks`
  - `/api/leaderboard`
- Accepts 200, 401, or 403 status codes (protected endpoints)
- Reports failed endpoints

### 3. Performance Check
- Response time (threshold: 2000ms)
- Memory usage (threshold: 800MB per instance)
- CPU usage (threshold: 70%)
- Requires PM2 for memory/CPU checks

### 4. Version Verification
- Reads version from `package.json`
- Gets git commit hash
- Reports version information

## Output Formats

### Human-Readable Output

```
Starting health check for http://localhost:3333...

[INFO] Checking HTTP response for /...
[SUCCESS] HTTP check passed (145ms)
[INFO] Checking API functionality...
[SUCCESS] API functionality check passed
[INFO] Checking performance metrics...
[SUCCESS] Performance check passed
[INFO] Checking version information...
[SUCCESS] Version check passed

=========================================
Health Check Results
=========================================
Overall Status: healthy
Timestamp: Fri Nov 14 14:30:22 2024
Base URL: http://localhost:3333

Checks:
  HTTP Response:    pass - HTTP endpoint responding with 200 OK (145ms)
  API Functionality: pass - All critical API endpoints responding (3/3)
  Performance:      pass - Performance metrics within acceptable range
  Version:          pass - Version: 0.1.0, Commit: abc123

Metrics:
  Response Time: 145ms
  Memory Usage:  512MB
  CPU Usage:     23%
  HTTP Status:   200

Version Info:
  Version: 0.1.0
  Commit:  abc123
=========================================
```

### JSON Output

```json
{
  "status": "healthy",
  "timestamp": "2024-11-14T14:30:22Z",
  "checks": {
    "http": "pass",
    "api": "pass",
    "performance": "pass",
    "version": "pass"
  },
  "messages": {
    "http": "HTTP endpoint responding with 200 OK (145ms)",
    "api": "All critical API endpoints responding (3/3)",
    "performance": "Performance metrics within acceptable range",
    "version": "Version: 0.1.0, Commit: abc123"
  },
  "metrics": {
    "responseTime": 145,
    "memoryUsage": 512,
    "cpuUsage": 23,
    "httpStatus": "200"
  },
  "version": "0.1.0",
  "commit": "abc123",
  "baseUrl": "http://localhost:3333"
}
```

## Exit Codes

- `0`: All health checks passed (status: healthy)
- `1`: One or more health checks failed (status: unhealthy)

## Integration with Deployment Scripts

The health check script is designed to be used in deployment workflows:

```bash
# In deploy-update.sh
if bash scripts/health-check.sh --json > health-check-result.json; then
  echo "Health check passed"
else
  echo "Health check failed, initiating rollback"
  bash scripts/rollback.sh
fi
```

## Troubleshooting

### curl not found
Install curl:
```bash
# Ubuntu/Debian
sudo apt-get install curl

# CentOS/RHEL
sudo yum install curl

# macOS
brew install curl
```

### Permission denied
Make the script executable:
```bash
chmod +x scripts/health-check.sh
```

### Connection refused
Ensure the application is running:
```bash
pm2 status
```

### Timeout errors
Increase the timeout value:
```bash
bash scripts/health-check.sh --timeout 10
```

## Requirements Mapping

This script fulfills the following requirements from the design document:

- **Requirement 3.1**: Health checks execute within 10 seconds after deployment
- **Requirement 3.2**: Tests the API health endpoint (and other critical endpoints)
- **Requirement 3.3**: Verifies application responds within 5 seconds (configurable timeout)
- **Requirement 3.4**: Reports failure with specific error details
- **Requirement 3.5**: Logs success confirmation with timestamp
- **Requirement 10.5**: Provides comprehensive deployment verification

## Notes

- The script is designed to run on Linux/Unix systems with bash
- PM2 integration is optional; the script works without it but with limited metrics
- The script can be run manually or integrated into automated deployment pipelines
- All thresholds are configurable via command-line options or environment variables
