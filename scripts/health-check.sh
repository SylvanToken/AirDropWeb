#!/bin/bash

# Health Check Script for Sylvan Token Application
# Performs comprehensive health verification including HTTP, API, performance, and version checks

set -euo pipefail

# Configuration
DEFAULT_HOST="${HOST:-localhost}"
DEFAULT_PORT="${PORT:-3333}"
DEFAULT_MAX_ATTEMPTS="${MAX_ATTEMPTS:-5}"
DEFAULT_RETRY_DELAY="${RETRY_DELAY:-3}"
DEFAULT_TIMEOUT="${TIMEOUT:-5}"
DEFAULT_MAX_RESPONSE_TIME="${MAX_RESPONSE_TIME:-2000}"

# Parse command line arguments
HOST="$DEFAULT_HOST"
PORT="$DEFAULT_PORT"
MAX_ATTEMPTS="$DEFAULT_MAX_ATTEMPTS"
RETRY_DELAY="$DEFAULT_RETRY_DELAY"
TIMEOUT="$DEFAULT_TIMEOUT"
MAX_RESPONSE_TIME="$DEFAULT_MAX_RESPONSE_TIME"
OUTPUT_JSON=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --host)
      HOST="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --max-attempts)
      MAX_ATTEMPTS="$2"
      shift 2
      ;;
    --retry-delay)
      RETRY_DELAY="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --json)
      OUTPUT_JSON=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --host HOST              Application host (default: localhost)"
      echo "  --port PORT              Application port (default: 3333)"
      echo "  --max-attempts N         Maximum retry attempts (default: 5)"
      echo "  --retry-delay SECONDS    Delay between retries (default: 3)"
      echo "  --timeout SECONDS        Request timeout (default: 5)"
      echo "  --json                   Output results in JSON format"
      echo "  --verbose                Enable verbose output"
      echo "  --help                   Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

BASE_URL="http://${HOST}:${PORT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Health check results
declare -A CHECK_RESULTS
declare -A CHECK_MESSAGES
OVERALL_STATUS="healthy"
HTTP_STATUS=""
RESPONSE_TIME=0
MEMORY_USAGE=0
CPU_USAGE=0
VERSION=""
COMMIT=""

# Logging functions
log_info() {
  if [[ "$OUTPUT_JSON" == false ]]; then
    echo -e "${BLUE}[INFO]${NC} $1"
  fi
}

log_success() {
  if [[ "$OUTPUT_JSON" == false ]]; then
    echo -e "${GREEN}[SUCCESS]${NC} $1"
  fi
}

log_error() {
  if [[ "$OUTPUT_JSON" == false ]]; then
    echo -e "${RED}[ERROR]${NC} $1"
  fi
}

log_warn() {
  if [[ "$OUTPUT_JSON" == false ]]; then
    echo -e "${YELLOW}[WARN]${NC} $1"
  fi
}

log_verbose() {
  if [[ "$VERBOSE" == true ]] && [[ "$OUTPUT_JSON" == false ]]; then
    echo -e "${BLUE}[DEBUG]${NC} $1"
  fi
}

# Check if curl is available
check_dependencies() {
  if ! command -v curl &> /dev/null; then
    log_error "curl is not installed. Please install curl to run health checks."
    exit 1
  fi
}

# HTTP Response Check
check_http_response() {
  local endpoint="$1"
  local attempt=1
  local success=false
  
  log_info "Checking HTTP response for ${endpoint}..."
  
  while [[ $attempt -le $MAX_ATTEMPTS ]]; do
    log_verbose "Attempt $attempt of $MAX_ATTEMPTS"
    
    # Measure response time and get HTTP status
    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "\n%{http_code}" --max-time "$TIMEOUT" "${BASE_URL}${endpoint}" 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    
    HTTP_STATUS=$(echo "$response" | tail -n1)
    RESPONSE_TIME=$((end_time - start_time))
    
    log_verbose "HTTP Status: $HTTP_STATUS, Response Time: ${RESPONSE_TIME}ms"
    
    if [[ "$HTTP_STATUS" == "200" ]]; then
      success=true
      CHECK_RESULTS["http"]="pass"
      CHECK_MESSAGES["http"]="HTTP endpoint responding with 200 OK (${RESPONSE_TIME}ms)"
      log_success "HTTP check passed (${RESPONSE_TIME}ms)"
      return 0
    fi
    
    if [[ $attempt -lt $MAX_ATTEMPTS ]]; then
      log_warn "HTTP check failed (status: $HTTP_STATUS), retrying in ${RETRY_DELAY}s..."
      sleep "$RETRY_DELAY"
    fi
    
    ((attempt++))
  done
  
  CHECK_RESULTS["http"]="fail"
  CHECK_MESSAGES["http"]="HTTP endpoint failed after $MAX_ATTEMPTS attempts (status: $HTTP_STATUS)"
  OVERALL_STATUS="unhealthy"
  log_error "HTTP check failed after $MAX_ATTEMPTS attempts"
  return 1
}

# API Functionality Check
check_api_functionality() {
  log_info "Checking API functionality..."
  
  local endpoints=(
    "/api/stats/public"
    "/api/tasks"
    "/api/leaderboard"
  )
  
  local failed_endpoints=()
  local success_count=0
  
  for endpoint in "${endpoints[@]}"; do
    log_verbose "Testing endpoint: $endpoint"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "${BASE_URL}${endpoint}" 2>/dev/null || echo "000")
    
    if [[ "$status" == "200" ]] || [[ "$status" == "401" ]] || [[ "$status" == "403" ]]; then
      # 401/403 are acceptable for protected endpoints
      ((success_count++))
      log_verbose "Endpoint $endpoint: OK (status: $status)"
    else
      failed_endpoints+=("$endpoint:$status")
      log_verbose "Endpoint $endpoint: FAILED (status: $status)"
    fi
  done
  
  if [[ ${#failed_endpoints[@]} -eq 0 ]]; then
    CHECK_RESULTS["api"]="pass"
    CHECK_MESSAGES["api"]="All critical API endpoints responding ($success_count/${#endpoints[@]})"
    log_success "API functionality check passed"
    return 0
  else
    CHECK_RESULTS["api"]="fail"
    CHECK_MESSAGES["api"]="Some API endpoints failed: ${failed_endpoints[*]}"
    OVERALL_STATUS="unhealthy"
    log_error "API functionality check failed: ${failed_endpoints[*]}"
    return 1
  fi
}

# Performance Check
check_performance() {
  log_info "Checking performance metrics..."
  
  local perf_issues=()
  
  # Check response time
  if [[ $RESPONSE_TIME -gt $MAX_RESPONSE_TIME ]]; then
    perf_issues+=("response_time:${RESPONSE_TIME}ms")
    log_warn "Response time (${RESPONSE_TIME}ms) exceeds threshold (${MAX_RESPONSE_TIME}ms)"
  else
    log_verbose "Response time OK: ${RESPONSE_TIME}ms"
  fi
  
  # Check memory usage (if PM2 is available)
  if command -v pm2 &> /dev/null; then
    local pm2_info=$(pm2 jlist 2>/dev/null || echo "[]")
    
    if [[ "$pm2_info" != "[]" ]]; then
      # Extract memory usage (in MB) from first process
      MEMORY_USAGE=$(echo "$pm2_info" | grep -o '"memory":[0-9]*' | head -1 | cut -d':' -f2 || echo "0")
      MEMORY_USAGE=$((MEMORY_USAGE / 1024 / 1024))
      
      # Extract CPU usage
      CPU_USAGE=$(echo "$pm2_info" | grep -o '"cpu":[0-9.]*' | head -1 | cut -d':' -f2 || echo "0")
      
      log_verbose "Memory usage: ${MEMORY_USAGE}MB, CPU usage: ${CPU_USAGE}%"
      
      # Check if memory usage is too high (> 800MB per instance)
      if [[ $MEMORY_USAGE -gt 800 ]]; then
        perf_issues+=("memory:${MEMORY_USAGE}MB")
        log_warn "Memory usage (${MEMORY_USAGE}MB) is high"
      fi
      
      # Check if CPU usage is too high (> 70%)
      if (( $(echo "$CPU_USAGE > 70" | bc -l 2>/dev/null || echo "0") )); then
        perf_issues+=("cpu:${CPU_USAGE}%")
        log_warn "CPU usage (${CPU_USAGE}%) is high"
      fi
    else
      log_verbose "PM2 not running or no processes found"
    fi
  else
    log_verbose "PM2 not available, skipping memory/CPU checks"
  fi
  
  if [[ ${#perf_issues[@]} -eq 0 ]]; then
    CHECK_RESULTS["performance"]="pass"
    CHECK_MESSAGES["performance"]="Performance metrics within acceptable range"
    log_success "Performance check passed"
    return 0
  else
    CHECK_RESULTS["performance"]="warn"
    CHECK_MESSAGES["performance"]="Performance issues detected: ${perf_issues[*]}"
    log_warn "Performance check completed with warnings"
    return 0
  fi
}

# Version Verification Check
check_version() {
  log_info "Checking version information..."
  
  # Try to get version from package.json
  if [[ -f "package.json" ]]; then
    VERSION=$(grep -o '"version": *"[^"]*"' package.json | cut -d'"' -f4 || echo "unknown")
    log_verbose "Application version: $VERSION"
  else
    VERSION="unknown"
    log_verbose "package.json not found"
  fi
  
  # Try to get git commit hash
  if command -v git &> /dev/null && [[ -d ".git" ]]; then
    COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    log_verbose "Git commit: $COMMIT"
  else
    COMMIT="unknown"
    log_verbose "Git not available or not a git repository"
  fi
  
  if [[ "$VERSION" != "unknown" ]] || [[ "$COMMIT" != "unknown" ]]; then
    CHECK_RESULTS["version"]="pass"
    CHECK_MESSAGES["version"]="Version: $VERSION, Commit: $COMMIT"
    log_success "Version check passed"
    return 0
  else
    CHECK_RESULTS["version"]="warn"
    CHECK_MESSAGES["version"]="Version information not available"
    log_warn "Version check completed with warnings"
    return 0
  fi
}

# Output results in JSON format
output_json() {
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  cat << EOF
{
  "status": "$OVERALL_STATUS",
  "timestamp": "$timestamp",
  "checks": {
    "http": "${CHECK_RESULTS[http]:-unknown}",
    "api": "${CHECK_RESULTS[api]:-unknown}",
    "performance": "${CHECK_RESULTS[performance]:-unknown}",
    "version": "${CHECK_RESULTS[version]:-unknown}"
  },
  "messages": {
    "http": "${CHECK_MESSAGES[http]:-}",
    "api": "${CHECK_MESSAGES[api]:-}",
    "performance": "${CHECK_MESSAGES[performance]:-}",
    "version": "${CHECK_MESSAGES[version]:-}"
  },
  "metrics": {
    "responseTime": $RESPONSE_TIME,
    "memoryUsage": $MEMORY_USAGE,
    "cpuUsage": $CPU_USAGE,
    "httpStatus": "$HTTP_STATUS"
  },
  "version": "$VERSION",
  "commit": "$COMMIT",
  "baseUrl": "$BASE_URL"
}
EOF
}

# Output results in human-readable format
output_human() {
  echo ""
  echo "========================================="
  echo "Health Check Results"
  echo "========================================="
  echo "Overall Status: $OVERALL_STATUS"
  echo "Timestamp: $(date)"
  echo "Base URL: $BASE_URL"
  echo ""
  echo "Checks:"
  echo "  HTTP Response:    ${CHECK_RESULTS[http]:-unknown} - ${CHECK_MESSAGES[http]:-}"
  echo "  API Functionality: ${CHECK_RESULTS[api]:-unknown} - ${CHECK_MESSAGES[api]:-}"
  echo "  Performance:      ${CHECK_RESULTS[performance]:-unknown} - ${CHECK_MESSAGES[performance]:-}"
  echo "  Version:          ${CHECK_RESULTS[version]:-unknown} - ${CHECK_MESSAGES[version]:-}"
  echo ""
  echo "Metrics:"
  echo "  Response Time: ${RESPONSE_TIME}ms"
  echo "  Memory Usage:  ${MEMORY_USAGE}MB"
  echo "  CPU Usage:     ${CPU_USAGE}%"
  echo "  HTTP Status:   $HTTP_STATUS"
  echo ""
  echo "Version Info:"
  echo "  Version: $VERSION"
  echo "  Commit:  $COMMIT"
  echo "========================================="
}

# Main execution
main() {
  check_dependencies
  
  if [[ "$OUTPUT_JSON" == false ]]; then
    echo "Starting health check for ${BASE_URL}..."
    echo ""
  fi
  
  # Run all checks
  check_http_response "/"
  check_api_functionality
  check_performance
  check_version
  
  # Output results
  if [[ "$OUTPUT_JSON" == true ]]; then
    output_json
  else
    output_human
  fi
  
  # Exit with appropriate code
  if [[ "$OVERALL_STATUS" == "healthy" ]]; then
    exit 0
  else
    exit 1
  fi
}

# Run main function
main
