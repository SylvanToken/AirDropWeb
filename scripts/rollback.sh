#!/bin/bash

# Rollback Script for Sylvan Token Application
# Automatically restores the application to a previous working state

set -e

# Source deployment utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
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
APP_NAME="${APP_NAME:-sylvan-app}"
BACKUP_DIR="backups"
SKIP_HEALTH_CHECK=false
FORCE_ROLLBACK=false

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] [BACKUP_PATH]

Rollback the application to a previous version from backup.

OPTIONS:
    -h, --help              Show this help message
    --skip-health-check     Skip health check after rollback
    --force                 Force rollback even if current version is healthy
    --latest                Use the most recent backup (default if no path provided)
    --list                  List available backups and exit

ARGUMENTS:
    BACKUP_PATH            Path to specific backup directory (optional)
                          If not provided, uses the most recent backup

EXAMPLES:
    $0                                    # Rollback to most recent backup
    $0 --latest                           # Same as above
    $0 backups/backup_20241114_143022     # Rollback to specific backup
    $0 --list                             # List available backups
    $0 --force --skip-health-check        # Force rollback without health check

EOF
}

# Note: list_backups, get_latest_backup, verify_backup, and restore_backup
# are now provided by lib/deployment-utils.sh

check_current_health() {
    log_info "Checking current application health..."
    
    if ! pm2_get_status "$APP_NAME" > /dev/null 2>&1; then
        log_info "Application is not running"
        return 1
    fi
    
    if ! check_health "http://localhost:3333/api/health" 5; then
        log_info "Application health check failed"
        return 1
    fi
    
    log_success "Current application is healthy"
    return 0
}

perform_rollback() {
    local backup_path="$1"
    
    log_info "=========================================="
    log_info "Starting rollback process"
    log_info "Backup: $backup_path"
    log_info "=========================================="
    
    # Step 1: Verify backup
    local step_start=$(log_step "Verify backup")
    if ! verify_backup "$backup_path"; then
        log_error "Backup verification failed"
        return 1
    fi
    log_step_complete "Verify backup" "$step_start"
    
    # Step 2: Check if force rollback is needed
    if [ "$FORCE_ROLLBACK" = false ]; then
        if check_current_health; then
            log_info "Current application is healthy"
            log_info "Use --force to rollback anyway"
            return 0
        fi
    fi
    
    # Step 3: Stop PM2 gracefully (but keep it managed)
    step_start=$(log_step "Prepare PM2 for rollback")
    if pm2_get_status "$APP_NAME" > /dev/null 2>&1; then
        log_info "Stopping PM2 process..."
        pm2 stop "$APP_NAME" || log_info "PM2 stop returned non-zero (may already be stopped)"
    fi
    log_step_complete "Prepare PM2 for rollback" "$step_start"
    
    # Step 4: Restore backup files
    step_start=$(log_step "Restore backup files")
    if ! restore_backup "$backup_path"; then
        log_error "Failed to restore backup"
        return 1
    fi
    log_step_complete "Restore backup files" "$step_start"
    
    # Step 5: Reload PM2 with restored version
    step_start=$(log_step "Reload PM2 with previous version")
    if ! pm2_reload_safe "$APP_NAME" 3 5; then
        log_error "Failed to reload PM2"
        log_info "Attempting to restart PM2..."
        if ! pm2 restart "$APP_NAME"; then
            log_error "Failed to restart PM2"
            return 1
        fi
    fi
    log_step_complete "Reload PM2 with previous version" "$step_start"
    
    # Step 6: Wait for application to be ready
    step_start=$(log_step "Wait for application to be ready")
    if ! wait_for_ready 30 2 "http://localhost:3333"; then
        log_error "Application failed to become ready after rollback"
        return 1
    fi
    log_step_complete "Wait for application to be ready" "$step_start"
    
    # Step 7: Verify rollback with health check
    if [ "$SKIP_HEALTH_CHECK" = false ]; then
        step_start=$(log_step "Verify rollback with health check")
        if ! verify_deployment; then
            log_error "Rollback verification failed"
            return 1
        fi
        log_step_complete "Verify rollback with health check" "$step_start"
    else
        log_info "Skipping health check (--skip-health-check flag used)"
    fi
    
    log_success "=========================================="
    log_success "Rollback completed successfully"
    log_success "=========================================="
    
    return 0
}

show_rollback_summary() {
    local backup_path="$1"
    local success="$2"
    
    echo ""
    echo "=========================================="
    echo "Rollback Summary"
    echo "=========================================="
    echo "Backup Used: $backup_path"
    echo "Status: $([ "$success" = "0" ] && echo "SUCCESS" || echo "FAILED")"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    if [ -f "$backup_path/metadata.json" ]; then
        echo "Restored Version Information:"
        cat "$backup_path/metadata.json" | grep -E "gitCommit|timestamp|nodeVersion" || true
        echo ""
    fi
    
    echo "Current PM2 Status:"
    pm2_get_status "$APP_NAME" | grep -E "status|uptime|restarts" || echo "Unable to get PM2 status"
    echo ""
    
    if [ "$success" = "0" ]; then
        echo "Application URLs:"
        echo "  - http://localhost:3333"
        echo ""
        echo "Monitoring Commands:"
        echo "  - pm2 status"
        echo "  - pm2 logs $APP_NAME"
        echo "  - pm2 monit"
    else
        echo "Rollback failed. Please check logs for details."
        echo "Log file: $CURRENT_LOG_FILE"
    fi
    
    echo "=========================================="
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

main() {
    local backup_path=""
    local list_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --force)
                FORCE_ROLLBACK=true
                shift
                ;;
            --latest)
                # This is the default behavior, just skip
                shift
                ;;
            --list)
                list_only=true
                shift
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                backup_path="$1"
                shift
                ;;
        esac
    done
    
    # Handle list command
    if [ "$list_only" = true ]; then
        # Use the list_backups function from deployment-utils.sh
        list_backups
        exit $?
    fi
    
    # Determine backup path
    if [ -z "$backup_path" ]; then
        log_info "No backup path specified, using latest backup..."
        backup_path=$(get_latest_backup)
        if [ $? -ne 0 ]; then
            log_error "Failed to find latest backup"
            exit 1
        fi
        log_info "Using backup: $backup_path"
    fi
    
    # Validate backup path
    if [ ! -d "$backup_path" ]; then
        log_error "Backup path does not exist: $backup_path"
        log_info "Use --list to see available backups"
        exit 1
    fi
    
    # Confirm rollback
    if [ "$FORCE_ROLLBACK" = false ] && [ -t 0 ]; then
        echo ""
        echo "WARNING: This will rollback the application to a previous version."
        echo "Backup: $backup_path"
        echo ""
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log_info "Rollback cancelled by user"
            exit 0
        fi
    fi
    
    # Perform rollback
    if perform_rollback "$backup_path"; then
        show_rollback_summary "$backup_path" 0
        exit 0
    else
        show_rollback_summary "$backup_path" 1
        exit 1
    fi
}

# Run main function
main "$@"
