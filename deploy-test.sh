#!/bin/bash

# Sylvan Token - Test Deployment Script
# This script deploys the application to test environment using PM2 ecosystem config

set -e  # Exit on error

# Source deployment utility library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/deployment-utils.sh"

# Initialize logging
init_log_file

# Configuration
APP_NAME="sylvan-app-test"
TEST_PORT=3334
ECOSYSTEM_CONFIG="ecosystem.config.js"

echo "🚀 Sylvan Token Test Deployment Starting..."
echo "================================================"

# Start deployment timer
DEPLOYMENT_START=$(date +%s)

# ============================================================================
# PRE-DEPLOYMENT VALIDATION
# ============================================================================

log_info "Starting pre-deployment validation..."

# Validate system dependencies
STEP_START=$(log_step "Validate dependencies")
validate_dependencies
log_step_complete "Validate dependencies" "$STEP_START"

# Validate configuration files
STEP_START=$(log_step "Validate configuration")
validate_config
log_step_complete "Validate configuration" "$STEP_START"

# Check ecosystem config
if [ ! -f "$ECOSYSTEM_CONFIG" ]; then
    log_error "PM2 ecosystem config not found: $ECOSYSTEM_CONFIG"
    exit 1
fi
log_success "PM2 ecosystem config found"

# Load environment variables
if [ -f ".env.local" ]; then
    set -a
    source .env.local
    set +a
    log_success "Environment variables loaded from .env.local"
else
    log_error ".env.local file not found"
    exit 1
fi

# ============================================================================
# TEST CONFIGURATION
# ============================================================================

STEP_START=$(log_step "Configure test environment")

# Use test configuration if available
if [ -f "next.config.test.js" ]; then
    cp next.config.test.js next.config.js
    log_success "Test configuration activated"
else
    log_info "next.config.test.js not found, using default configuration"
fi

log_step_complete "Configure test environment" "$STEP_START"

# ============================================================================
# SIMPLIFIED BACKUP FOR TEST
# ============================================================================

STEP_START=$(log_step "Create backup")

# For test environment, only backup if .next exists (simpler than production)
BACKUP_PATH=""
if [ -d ".next" ]; then
    BACKUP_PATH=$(create_backup)
    log_success "Backup created at: $BACKUP_PATH"
else
    log_info "No existing build to backup (first deployment)"
fi

log_step_complete "Create backup" "$STEP_START"

# ============================================================================
# DEPENDENCY INSTALLATION
# ============================================================================

STEP_START=$(log_step "Install dependencies")

if [ -f "package-lock.json" ]; then
    npm ci
    log_success "Dependencies installed with npm ci"
else
    npm install
    log_success "Dependencies installed with npm install"
fi

log_step_complete "Install dependencies" "$STEP_START"

# ============================================================================
# DATABASE MIGRATION
# ============================================================================

STEP_START=$(log_step "Run database migrations")

if command -v npx &> /dev/null; then
    # Run migrations with safety features (skip backup for test environment)
    if run_migrations_safe "test" "true" "false"; then
        log_success "Database migrations completed"
    else
        log_info "No migrations to apply or migration skipped"
    fi
else
    log_info "npx not available, skipping migrations"
fi

log_step_complete "Run database migrations" "$STEP_START"

# ============================================================================
# BUILD APPLICATION
# ============================================================================

STEP_START=$(log_step "Build application")

npm run build

# Verify build artifacts
if [ ! -d ".next" ]; then
    log_error "Build failed: .next directory not created"
    exit 1
fi

log_success "Application built successfully"
log_step_complete "Build application" "$STEP_START"

# ============================================================================
# PM2 DEPLOYMENT WITH ECOSYSTEM CONFIG
# ============================================================================

STEP_START=$(log_step "Deploy with PM2")

# Check if PM2 process exists
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    log_info "Existing PM2 process found, reloading..."
    pm2 reload "$ECOSYSTEM_CONFIG" --only "$APP_NAME" --update-env
    log_success "PM2 process reloaded"
else
    log_info "Starting new PM2 process..."
    pm2 start "$ECOSYSTEM_CONFIG" --only "$APP_NAME"
    log_success "PM2 process started"
fi

# Save PM2 configuration
pm2 save
log_success "PM2 configuration saved"

log_step_complete "Deploy with PM2" "$STEP_START"

# ============================================================================
# QUICK HEALTH CHECK FOR TEST
# ============================================================================

STEP_START=$(log_step "Health check")

log_info "Performing quick health check for test environment..."

# Wait for application to be ready (shorter timeout for test)
if wait_for_ready 15 2 "http://localhost:$TEST_PORT"; then
    log_success "Application is responding"
else
    log_error "Application failed to respond"
    
    # For test environment, show error but don't rollback automatically
    log_info "Check PM2 logs for details: pm2 logs $APP_NAME"
    exit 1
fi

# Quick health check
if check_health "http://localhost:$TEST_PORT/api/health" 5; then
    log_success "Health check passed"
else
    log_error "Health check failed"
    log_info "Application may still be starting. Check logs: pm2 logs $APP_NAME"
fi

log_step_complete "Health check" "$STEP_START"

# ============================================================================
# NGINX RELOAD (OPTIONAL)
# ============================================================================

if command -v nginx &> /dev/null; then
    log_info "Reloading Nginx..."
    if sudo systemctl reload nginx 2>/dev/null; then
        log_success "Nginx reloaded"
    else
        log_info "Nginx reload skipped or failed (not critical for test)"
    fi
else
    log_info "Nginx not found (optional for test environment)"
fi

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================

DEPLOYMENT_END=$(date +%s)
DEPLOYMENT_DURATION=$((DEPLOYMENT_END - DEPLOYMENT_START))

echo ""
echo "================================================"
log_success "Test Deployment Completed Successfully!"
echo "================================================"
echo ""

# Display version information
log_info "Version Information:"
pm2_get_version "$APP_NAME"

echo ""
log_info "Deployment Summary:"
echo "-------------------"
echo "Environment: Test"
echo "App Name: $APP_NAME"
echo "Port: $TEST_PORT"
echo "Instances: 1 (single instance mode)"
echo "Duration: ${DEPLOYMENT_DURATION}s"
if [ -n "$BACKUP_PATH" ]; then
    echo "Backup: $BACKUP_PATH"
fi
echo "Log File: $CURRENT_LOG_FILE"

echo ""
log_info "Test URLs:"
echo "-------------------"
echo "Application:     http://localhost:$TEST_PORT"
echo "Health Check:    http://localhost:$TEST_PORT/api/health"

echo ""
log_info "Useful Commands:"
echo "-------------------"
echo "View logs:       pm2 logs $APP_NAME"
echo "View status:     pm2 describe $APP_NAME"
echo "Restart:         pm2 restart $APP_NAME"
echo "Stop:            pm2 stop $APP_NAME"
echo "Monitor:         pm2 monit"

echo ""
echo "================================================"

# Cleanup old backups and logs
cleanup_old_backups
cleanup_old_logs
