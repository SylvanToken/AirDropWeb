#!/bin/bash

# Deploy Update Script for Sylvan Token Application
# Handles zero-downtime updates with automatic rollback on failure

set -e

# Source deployment utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
cd "$PROJECT_ROOT"

if [ -f "lib/deployment-utils.sh" ]; then
    source lib/deployment-utils.sh
else
    echo "ERROR: deployment-utils.sh not found"
    exit 1
fi

# Initialize logging
init_log_file

# Configuration
APP_NAME="${APP_NAME:-sylvan-app-production}"
SKIP_BACKUP=false
SKIP_HEALTH_CHECK=false
FORCE_UPDATE=false
BACKUP_PATH=""

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy updates to the Sylvan Token application with zero downtime.

OPTIONS:
    -h, --help              Show this help message
    --skip-backup           Skip creating backup before update
    --skip-health-check     Skip health check after deployment
    --force                 Force update even if health checks fail
    --app-name NAME         PM2 app name (default: sylvan-app-production)

EXAMPLES:
    $0                                    # Standard update with all checks
    $0 --skip-backup                      # Update without creating backup
    $0 --force                            # Force update ignoring health checks
    $0 --app-name sylvan-app-test         # Update test environment

NOTES:
    - This script performs zero-downtime updates using PM2 reload
    - Automatic rollback occurs if health checks fail
    - All steps are logged to logs/deployments/
    - Backups are stored in backups/ directory

EOF
}

print_deployment_header() {
    echo ""
    echo "=========================================="
    echo "Sylvan Token - Zero-Downtime Update"
    echo "=========================================="
    echo "App Name: $APP_NAME"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
    echo "Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    echo "=========================================="
    echo ""
}

# ============================================================================
# DEPLOYMENT STEPS
# ============================================================================

step_pre_deployment_validation() {
    log_info "=========================================="
    log_info "Step 1: Pre-Deployment Validation"
    log_info "=========================================="
    
    local step_start=$(log_step "Validate environment variables")
    if ! validate_env; then
        log_error "Environment validation failed"
        return 1
    fi
    log_step_complete "Validate environment variables" "$step_start"
    
    step_start=$(log_step "Validate configuration files")
    if ! validate_config; then
        log_error "Configuration validation failed"
        return 1
    fi
    log_step_complete "Validate configuration files" "$step_start"
    
    step_start=$(log_step "Validate system dependencies")
    if ! validate_dependencies; then
        log_error "Dependency validation failed"
        return 1
    fi
    log_step_complete "Validate system dependencies" "$step_start"
    
    log_success "Pre-deployment validation completed"
    return 0
}

step_create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        log_info "=========================================="
        log_info "Step 2: Create Backup (SKIPPED)"
        log_info "=========================================="
        log_info "Backup creation skipped (--skip-backup flag used)"
        return 0
    fi
    
    log_info "=========================================="
    log_info "Step 2: Create Backup"
    log_info "=========================================="
    
    local step_start=$(log_step "Create backup of current deployment")
    BACKUP_PATH=$(create_backup)
    if [ $? -ne 0 ]; then
        log_error "Backup creation failed"
        return 1
    fi
    log_step_complete "Create backup of current deployment" "$step_start"
    
    step_start=$(log_step "Cleanup old backups")
    cleanup_old_backups
    log_step_complete "Cleanup old backups" "$step_start"
    
    log_success "Backup created at: $BACKUP_PATH"
    return 0
}

step_clean_cache() {
    log_info "=========================================="
    log_info "Step 3: Clean Cache"
    log_info "=========================================="
    
    local step_start=$(log_step "Clean all caches")
    clean_all_cache
    log_step_complete "Clean all caches" "$step_start"
    
    log_success "Cache cleaning completed"
    return 0
}

step_install_dependencies() {
    log_info "=========================================="
    log_info "Step 4: Install Dependencies"
    log_info "=========================================="
    
    local step_start=$(log_step "Install dependencies with npm ci")
    log_info "Running npm ci for clean installation..."
    
    if npm ci --production=false 2>&1 | tee -a "$CURRENT_LOG_FILE"; then
        log_step_complete "Install dependencies with npm ci" "$step_start"
        log_success "Dependencies installed successfully"
        return 0
    else
        log_error "Dependency installation failed"
        return 1
    fi
}

step_run_migrations() {
    log_info "=========================================="
    log_info "Step 5: Run Database Migrations"
    log_info "=========================================="
    
    local step_start=$(log_step "Run database migrations (safe mode)")
    
    # Determine environment from app name
    local environment="production"
    if [[ "$APP_NAME" == *"test"* ]]; then
        environment="test"
    fi
    
    # Run migrations with safety features
    if run_migrations_safe "$environment" "false" "false"; then
        log_step_complete "Run database migrations (safe mode)" "$step_start"
        log_success "Database migrations completed successfully"
        return 0
    else
        log_error "Database migration failed"
        return 1
    fi
}

step_build_application() {
    log_info "=========================================="
    log_info "Step 6: Build Application"
    log_info "=========================================="
    
    local step_start=$(log_step "Build Next.js application")
    log_info "Running npm run build..."
    
    if npm run build 2>&1 | tee -a "$CURRENT_LOG_FILE"; then
        log_step_complete "Build Next.js application" "$step_start"
    else
        log_error "Build failed"
        return 1
    fi
    
    step_start=$(log_step "Verify build artifacts")
    if [ ! -d ".next" ]; then
        log_error "Build artifacts not found (.next directory missing)"
        return 1
    fi
    
    if [ ! -f ".next/BUILD_ID" ]; then
        log_error "Build ID file not found"
        return 1
    fi
    
    local build_id=$(cat .next/BUILD_ID)
    log_info "Build ID: $build_id"
    log_step_complete "Verify build artifacts" "$step_start"
    
    log_success "Application build completed successfully"
    return 0
}

step_reload_pm2() {
    log_info "=========================================="
    log_info "Step 7: Reload PM2"
    log_info "=========================================="
    
    local step_start=$(log_step "Reload PM2 with --update-env")
    log_info "Reloading PM2 process: $APP_NAME"
    
    if ! pm2_reload_safe "$APP_NAME" 3 5; then
        log_error "PM2 reload failed"
        return 1
    fi
    log_step_complete "Reload PM2 with --update-env" "$step_start"
    
    log_success "PM2 reload completed successfully"
    return 0
}

step_health_check() {
    if [ "$SKIP_HEALTH_CHECK" = true ]; then
        log_info "=========================================="
        log_info "Step 8: Health Check (SKIPPED)"
        log_info "=========================================="
        log_info "Health check skipped (--skip-health-check flag used)"
        return 0
    fi
    
    log_info "=========================================="
    log_info "Step 8: Health Check"
    log_info "=========================================="
    
    local step_start=$(log_step "Wait for application to be ready")
    if ! wait_for_ready 30 2 "http://localhost:3333"; then
        log_error "Application failed to become ready"
        return 1
    fi
    log_step_complete "Wait for application to be ready" "$step_start"
    
    step_start=$(log_step "Verify deployment")
    if ! verify_deployment; then
        log_error "Deployment verification failed"
        return 1
    fi
    log_step_complete "Verify deployment" "$step_start"
    
    log_success "Health check completed successfully"
    return 0
}

step_rollback() {
    log_error "=========================================="
    log_error "DEPLOYMENT FAILED - INITIATING ROLLBACK"
    log_error "=========================================="
    
    if [ -z "$BACKUP_PATH" ]; then
        log_error "No backup available for rollback"
        log_error "Manual intervention required"
        return 1
    fi
    
    log_info "Rolling back to: $BACKUP_PATH"
    
    if [ -f "scripts/rollback.sh" ]; then
        if bash scripts/rollback.sh --force --skip-health-check "$BACKUP_PATH"; then
            log_success "Rollback completed successfully"
            log_info "Application restored to previous version"
            return 0
        else
            log_error "Rollback failed"
            log_error "CRITICAL: Manual intervention required immediately"
            return 1
        fi
    else
        log_error "Rollback script not found"
        log_info "Attempting manual rollback..."
        
        if restore_backup "$BACKUP_PATH"; then
            log_info "Backup restored, reloading PM2..."
            if pm2 reload "$APP_NAME" --update-env; then
                log_success "Manual rollback completed"
                return 0
            fi
        fi
        
        log_error "Manual rollback failed"
        return 1
    fi
}

show_deployment_summary() {
    local success="$1"
    local deployment_end_time=$(date +%s)
    local deployment_duration=$((deployment_end_time - DEPLOYMENT_START_TIME))
    
    echo ""
    echo "=========================================="
    echo "Deployment Summary"
    echo "=========================================="
    echo "Status: $([ "$success" = "0" ] && echo "SUCCESS" || echo "FAILED")"
    echo "Duration: ${deployment_duration}s"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "App Name: $APP_NAME"
    echo ""
    
    if [ "$success" = "0" ]; then
        echo "Deployed Version:"
        echo "  Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
        echo "  Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
        if [ -f ".next/BUILD_ID" ]; then
            echo "  Build ID: $(cat .next/BUILD_ID)"
        fi
        echo ""
        
        echo "PM2 Status:"
        pm2_get_status "$APP_NAME" | grep -E "status|uptime|restarts|memory|cpu" || echo "Unable to get detailed PM2 status"
        echo ""
        
        echo "Application URLs:"
        echo "  - http://localhost:3333"
        echo "  - Health Check: http://localhost:3333/api/health"
        echo ""
        
        echo "Monitoring Commands:"
        echo "  - pm2 status"
        echo "  - pm2 logs $APP_NAME"
        echo "  - pm2 monit"
        echo "  - pm2 describe $APP_NAME"
        echo ""
        
        if [ -n "$BACKUP_PATH" ]; then
            echo "Backup Location: $BACKUP_PATH"
            echo "Rollback Command: bash scripts/rollback.sh $BACKUP_PATH"
        fi
    else
        echo "Deployment failed. Check logs for details."
        echo "Log file: $CURRENT_LOG_FILE"
        echo ""
        
        if [ -n "$BACKUP_PATH" ]; then
            echo "Application has been rolled back to: $BACKUP_PATH"
        else
            echo "No rollback was performed (no backup available)"
        fi
    fi
    
    echo "=========================================="
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --force)
                FORCE_UPDATE=true
                shift
                ;;
            --app-name)
                APP_NAME="$2"
                shift 2
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                log_error "Unexpected argument: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Record deployment start time
    DEPLOYMENT_START_TIME=$(date +%s)
    
    # Print deployment header
    print_deployment_header
    
    # Execute deployment steps
    local deployment_failed=false
    
    # Step 1: Pre-deployment validation
    if ! step_pre_deployment_validation; then
        log_error "Pre-deployment validation failed. Aborting deployment."
        exit 1
    fi
    
    # Step 2: Create backup
    if ! step_create_backup; then
        log_error "Backup creation failed. Aborting deployment."
        exit 1
    fi
    
    # Step 3: Clean cache
    if ! step_clean_cache; then
        log_error "Cache cleaning failed. Aborting deployment."
        deployment_failed=true
    fi
    
    # Step 4: Install dependencies
    if [ "$deployment_failed" = false ]; then
        if ! step_install_dependencies; then
            log_error "Dependency installation failed."
            deployment_failed=true
        fi
    fi
    
    # Step 5: Run migrations
    if [ "$deployment_failed" = false ]; then
        if ! step_run_migrations; then
            log_error "Database migration failed."
            deployment_failed=true
        fi
    fi
    
    # Step 6: Build application
    if [ "$deployment_failed" = false ]; then
        if ! step_build_application; then
            log_error "Application build failed."
            deployment_failed=true
        fi
    fi
    
    # Step 7: Reload PM2
    if [ "$deployment_failed" = false ]; then
        if ! step_reload_pm2; then
            log_error "PM2 reload failed."
            deployment_failed=true
        fi
    fi
    
    # Step 8: Health check
    if [ "$deployment_failed" = false ]; then
        if ! step_health_check; then
            log_error "Health check failed."
            deployment_failed=true
        fi
    fi
    
    # Handle deployment result
    if [ "$deployment_failed" = true ]; then
        if [ "$FORCE_UPDATE" = true ]; then
            log_info "Deployment had issues but continuing due to --force flag"
            show_deployment_summary 0
            exit 0
        else
            log_error "Deployment failed. Initiating rollback..."
            step_rollback
            show_deployment_summary 1
            exit 1
        fi
    else
        log_success "=========================================="
        log_success "DEPLOYMENT COMPLETED SUCCESSFULLY"
        log_success "=========================================="
        
        # Cleanup old logs
        cleanup_old_logs
        
        show_deployment_summary 0
        exit 0
    fi
}

# Run main function
main "$@"
