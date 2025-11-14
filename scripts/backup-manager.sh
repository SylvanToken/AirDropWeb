#!/bin/bash

# Backup Manager Script
# Provides command-line interface for backup management operations

set -e

# Source deployment utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

source lib/deployment-utils.sh

# Initialize logging
init_log_file

# Display usage information
usage() {
    cat <<EOF
Backup Manager - Manage application backups

Usage: $0 <command> [options]

Commands:
  create              Create a new backup
  restore <path>      Restore from a specific backup
  restore-latest      Restore from the most recent backup
  list                List all available backups
  verify <path>       Verify a specific backup
  cleanup             Remove backups older than $BACKUP_RETENTION_DAYS days
  help                Display this help message

Examples:
  $0 create
  $0 list
  $0 restore backups/backup_20241114_143022
  $0 restore-latest
  $0 verify backups/backup_20241114_143022
  $0 cleanup

EOF
}

# Main command handler
main() {
    local command="${1:-help}"
    
    case "$command" in
        create)
            log_info "Creating new backup..."
            if backup_path=$(create_backup); then
                echo ""
                echo "Backup created successfully!"
                echo "Path: $backup_path"
                echo ""
                echo "To restore this backup later, run:"
                echo "  $0 restore $backup_path"
            else
                log_error "Failed to create backup"
                exit 1
            fi
            ;;
            
        restore)
            local backup_path="$2"
            if [ -z "$backup_path" ]; then
                log_error "Please specify a backup path"
                echo "Usage: $0 restore <backup_path>"
                echo "Run '$0 list' to see available backups"
                exit 1
            fi
            
            log_info "Restoring from backup: $backup_path"
            if restore_backup "$backup_path"; then
                echo ""
                echo "Backup restored successfully!"
                echo ""
                echo "Next steps:"
                echo "  1. Restart your application: pm2 reload sylvan-app"
                echo "  2. Verify the application is working correctly"
            else
                log_error "Failed to restore backup"
                exit 1
            fi
            ;;
            
        restore-latest)
            log_info "Finding latest backup..."
            if backup_path=$(get_latest_backup); then
                log_info "Latest backup: $backup_path"
                if restore_backup "$backup_path"; then
                    echo ""
                    echo "Latest backup restored successfully!"
                    echo ""
                    echo "Next steps:"
                    echo "  1. Restart your application: pm2 reload sylvan-app"
                    echo "  2. Verify the application is working correctly"
                else
                    log_error "Failed to restore backup"
                    exit 1
                fi
            else
                log_error "No backups found"
                exit 1
            fi
            ;;
            
        list)
            list_backups
            ;;
            
        verify)
            local backup_path="$2"
            if [ -z "$backup_path" ]; then
                log_error "Please specify a backup path"
                echo "Usage: $0 verify <backup_path>"
                echo "Run '$0 list' to see available backups"
                exit 1
            fi
            
            if verify_backup "$backup_path"; then
                echo ""
                echo "Backup verification passed!"
                echo "This backup can be safely restored."
            else
                log_error "Backup verification failed"
                exit 1
            fi
            ;;
            
        cleanup)
            cleanup_old_backups
            echo ""
            echo "Cleanup complete!"
            echo "Run '$0 list' to see remaining backups"
            ;;
            
        help|--help|-h)
            usage
            ;;
            
        *)
            log_error "Unknown command: $command"
            echo ""
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
