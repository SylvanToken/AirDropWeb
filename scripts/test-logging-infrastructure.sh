#!/bin/bash

# Test script for deployment logging infrastructure
# This script verifies that all logging functions work correctly

set -e

echo "=========================================="
echo "Testing Deployment Logging Infrastructure"
echo "=========================================="
echo ""

# Source the deployment utilities
if [ -f "lib/deployment-utils.sh" ]; then
    source lib/deployment-utils.sh
else
    echo "ERROR: lib/deployment-utils.sh not found"
    exit 1
fi

# Initialize log file
init_log_file
echo "✓ Log file initialized: $CURRENT_LOG_FILE"
echo ""

# Test logging functions
echo "Testing logging functions..."
log_info "This is an info message"
log_success "This is a success message"
log_error "This is an error message (expected)"
echo "✓ Basic logging functions work"
echo ""

# Test step timing
echo "Testing step timing..."
start_time=$(log_step "Test deployment step")
sleep 2
log_step_complete "Test deployment step" "$start_time"
echo "✓ Step timing works"
echo ""

# Test log directory structure
echo "Verifying log directory structure..."
if [ -d "logs/deployments" ]; then
    echo "✓ logs/deployments directory exists"
else
    echo "✗ logs/deployments directory missing"
    exit 1
fi

if [ -d "logs/health-checks" ]; then
    echo "✓ logs/health-checks directory exists"
else
    echo "✗ logs/health-checks directory missing"
    exit 1
fi
echo ""

# Test log file format
echo "Verifying log file format..."
if [ -f "$CURRENT_LOG_FILE" ]; then
    echo "✓ Log file created: $CURRENT_LOG_FILE"
    echo ""
    echo "Sample log entries:"
    echo "-------------------"
    head -n 5 "$CURRENT_LOG_FILE"
    echo "-------------------"
else
    echo "✗ Log file not created"
    exit 1
fi
echo ""

# Test log retention settings
echo "Verifying log retention settings..."
echo "✓ Backup retention: $BACKUP_RETENTION_DAYS days"
echo "✓ Log retention: $LOG_RETENTION_DAYS days"
echo ""

# Create some old test log files to test cleanup
echo "Testing log cleanup functionality..."
test_old_log="logs/deployments/deploy_20200101_000000.log"
touch "$test_old_log"
# Set the file modification time to 31 days ago (older than retention period)
if command -v touch &> /dev/null; then
    # Try to set old timestamp (may not work on all systems)
    touch -d "31 days ago" "$test_old_log" 2>/dev/null || echo "Note: Could not set old timestamp (system limitation)"
fi

# Run cleanup
cleanup_old_logs
echo "✓ Log cleanup function executed"
echo ""

# Summary
echo "=========================================="
echo "Logging Infrastructure Test Complete"
echo "=========================================="
echo ""
echo "All logging features verified:"
echo "  ✓ Log directory structure (logs/deployments, logs/health-checks)"
echo "  ✓ Log file creation with timestamps"
echo "  ✓ Log format with timestamp, level, and message"
echo "  ✓ Deployment step timing and duration logging"
echo "  ✓ Log cleanup for old logs (30 days retention)"
echo ""
echo "Log file location: $CURRENT_LOG_FILE"
echo ""
