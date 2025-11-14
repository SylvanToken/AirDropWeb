#!/bin/bash

# Database Migration Script with Safety Features
# Provides safe database migration with backup, rollback, and dry-run capabilities

set -e

# Source deployment utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
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
ENVIRONMENT="production"
SKIP_BACKUP=false
DRY_RUN=false

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Safely run database migrations with backup and rollback capabilities.

OPTIONS:
    -h, --help              Show this help message
    --environment ENV       Environment (production|test) (default: production)
    --skip-backup           Skip creating database backup before migration
    --dry-run               Check pending migrations without applying them
    --list-pending          List pending migrations and exit
    --verify                Verify migration status and exit

EXAMPLES:
    $0                                    # Run migrations in production with backup
    $0 --dry-run                          # Check pending migrations without applying
    $0 --environment test                 # Run migrations in test environment
    $0 --skip-backup                      # Run migrations without backup
    $0 --list-pending                     # List pending migrations
    $0 --verify                           # Verify migration status

NOTES:
    - Production migrations always create database backup (unless --skip-backup)
    - Test environment migrations skip backup by default
    - Failed migrations automatically rollback database (if backup exists)
    - All migration steps are logged to logs/deployments/

EOF
}

list_pending_migrations() {
    log_info "Checking for pending migrations..."
    
    if ! run_migration_dry_run; then
        log_error "Failed to check migration status"
        return 1
    fi
    
    local pending=$(get_pending_migrations)
    
    if [ -z "$pending" ]; then
        log_success "No pending migrations"
        return 0
    fi
    
    echo ""
    echo "Pending migrations:"
    echo "$pending" | sed 's/^/  - /'
    echo ""
    
    return 0
}

verify_migration_status() {
    log_info "Verifying migration status..."
    
    if verify_migrations; then
        log_success "All migrations are up to date"
        return 0
    else
        log_error "Some migrations are not applied"
        return 1
    fi
}

# ============================================================================
# MAIN FUNCTION
# ============================================================================

main() {
    # Parse command line arguments
    local list_only=false
    local verify_only=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --list-pending)
                list_only=true
                shift
                ;;
            --verify)
                verify_only=true
                shift
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
    
    # Validate environment
    if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "test" ]]; then
        log_error "Invalid environment: $ENVIRONMENT (must be 'production' or 'test')"
        exit 1
    fi
    
    echo ""
    echo "=========================================="
    echo "Database Migration Script"
    echo "=========================================="
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=========================================="
    echo ""
    
    # Handle list-only mode
    if [ "$list_only" = true ]; then
        list_pending_migrations
        exit $?
    fi
    
    # Handle verify-only mode
    if [ "$verify_only" = true ]; then
        verify_migration_status
        exit $?
    fi
    
    # Validate environment
    log_info "Validating environment..."
    if ! validate_env; then
        log_error "Environment validation failed"
        exit 1
    fi
    
    # Run migrations with safety features
    local skip_backup_flag="$SKIP_BACKUP"
    
    # For test environment, skip backup by default unless explicitly requested
    if [ "$ENVIRONMENT" = "test" ] && [ "$SKIP_BACKUP" = false ]; then
        skip_backup_flag="true"
        log_info "Test environment: Skipping database backup by default"
    fi
    
    if run_migrations_safe "$ENVIRONMENT" "$skip_backup_flag" "$DRY_RUN"; then
        log_success "=========================================="
        log_success "Migration completed successfully"
        log_success "=========================================="
        
        # Cleanup old database backups
        if [ "$ENVIRONMENT" = "production" ]; then
            cleanup_old_database_backups 7
        fi
        
        exit 0
    else
        log_error "=========================================="
        log_error "Migration failed"
        log_error "=========================================="
        log_error "Check logs for details: $CURRENT_LOG_FILE"
        exit 1
    fi
}

# Run main function
main "$@"
