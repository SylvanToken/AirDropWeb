#!/bin/bash

# Deployment Utility Library
# Provides reusable functions for deployment scripts

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
BACKUP_DIR="backups"
LOG_DIR="logs/deployments"
HEALTH_CHECK_LOG_DIR="logs/health-checks"
BACKUP_RETENTION_DAYS=7
LOG_RETENTION_DAYS=30

# Ensure log directories exist
mkdir -p "$LOG_DIR"
mkdir -p "$HEALTH_CHECK_LOG_DIR"
mkdir -p "$BACKUP_DIR"

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

log_info() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$timestamp] [INFO] $message" >> "$CURRENT_LOG_FILE"
}

log_success() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$timestamp] [SUCCESS] $message" >> "$CURRENT_LOG_FILE"
}

log_error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[ERROR]${NC} $message" >&2
    echo "[$timestamp] [ERROR] $message" >> "$CURRENT_LOG_FILE"
}

log_step() {
    local step_name="$1"
    local start_time=$(date +%s)
    log_info "Starting: $step_name"
    echo "$start_time"
}

log_step_complete() {
    local step_name="$1"
    local start_time="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_success "Completed: $step_name (duration: ${duration}s)"
}

init_log_file() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    CURRENT_LOG_FILE="$LOG_DIR/deploy_${timestamp}.log"
    touch "$CURRENT_LOG_FILE"
    log_info "Deployment started at $(date '+%Y-%m-%d %H:%M:%S')"
}

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

validate_env() {
    log_info "Validating environment variables..."
    
    # Load environment variables from .env.local if it exists
    if [ -f ".env.local" ]; then
        set -a
        source .env.local
        set +a
        log_info "Loaded environment variables from .env.local"
    elif [ -f ".env" ]; then
        set -a
        source .env
        set +a
        log_info "Loaded environment variables from .env"
    else
        log_error "No .env.local or .env file found"
        return 1
    fi
    
    # Define critical environment variables
    local required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "NODE_ENV"
    )
    
    # Define recommended environment variables (warnings only)
    local recommended_vars=(
        "EMAIL_FROM"
        "SMTP_HOST"
        "SMTP_USER"
        "SMTP_PASSWORD"
        "RESEND_API_KEY"
        "TURNSTILE_SECRET_KEY"
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY"

validate_config() {
    log_info "Validating configuration files..."
    local required_files=("package.json" "next.config.js" ".env.local")
    local missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Missing required configuration files: ${missing_files[*]}"
        return 1
    fi
    log_success "All required configuration files are present"
    return 0
}

validate_dependencies() {
    log_info "Validating system dependencies..."
    local required_commands=("node" "npm" "pm2")
    local missing_commands=()
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
        fi
    done
    if [ ${#missing_commands[@]} -gt 0 ]; then
        log_error "Missing required system dependencies: ${missing_commands[*]}"
        return 1
    fi
    log_success "All required system dependencies are available"
    return 0
}

# ============================================================================
# BACKUP FUNCTIONS
# ============================================================================

create_backup() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_path="$BACKUP_DIR/backup_$timestamp"
    
    log_info "Creating backup at $backup_path..."
    mkdir -p "$backup_path"
    
    local backup_size=0
    local files_backed_up=0
    
    # Backup .next directory
    if [ -d ".next" ]; then
        cp -r .next "$backup_path/"
        local next_size=$(du -sb "$backup_path/.next" 2>/dev/null | cut -f1)
        backup_size=$((backup_size + next_size))
        files_backed_up=$((files_backed_up + 1))
        log_info "Backed up .next directory ($(numfmt --to=iec-i --suffix=B $next_size 2>/dev/null || echo "${next_size} bytes"))"
    else
        log_info ".next directory does not exist, skipping"
    fi
    
    # Backup package-lock.json
    if [ -f "package-lock.json" ]; then
        cp package-lock.json "$backup_path/"
        local lock_size=$(stat -c%s "package-lock.json" 2>/dev/null || stat -f%z "package-lock.json" 2>/dev/null || echo "0")
        backup_size=$((backup_size + lock_size))
        files_backed_up=$((files_backed_up + 1))
        log_info "Backed up package-lock.json"
    else
        log_info "package-lock.json does not exist, skipping"
    fi
    
    # Backup .env.local
    if [ -f ".env.local" ]; then
        cp .env.local "$backup_path/"
        local env_size=$(stat -c%s ".env.local" 2>/dev/null || stat -f%z ".env.local" 2>/dev/null || echo "0")
        backup_size=$((backup_size + env_size))
        files_backed_up=$((files_backed_up + 1))
        log_info "Backed up .env.local"
    else
        log_info ".env.local does not exist, skipping"
    fi
    
    # Gather metadata
    local git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    local git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local node_version=$(node --version 2>/dev/null || echo "unknown")
    local npm_version=$(npm --version 2>/dev/null || echo "unknown")
    local package_version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    
    # Create metadata.json
    cat > "$backup_path/metadata.json" <<EOF
{
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "backupPath": "$backup_path",
  "gitCommit": "$git_commit",
  "gitBranch": "$git_branch",
  "version": "$package_version",
  "nodeVersion": "$node_version",
  "npmVersion": "$npm_version",
  "backupSize": $backup_size,
  "filesBackedUp": $files_backed_up,
  "files": {
    "next": $([ -d "$backup_path/.next" ] && echo "true" || echo "false"),
    "packageLock": $([ -f "$backup_path/package-lock.json" ] && echo "true" || echo "false"),
    "envLocal": $([ -f "$backup_path/.env.local" ] && echo "true" || echo "false")
  }
}
EOF
    
    # Verify backup
    if verify_backup "$backup_path"; then
        log_success "Backup created and verified successfully at $backup_path"
        log_info "Backup size: $(numfmt --to=iec-i --suffix=B $backup_size 2>/dev/null || echo "${backup_size} bytes"), Files: $files_backed_up"
        echo "$backup_path"
        return 0
    else
        log_error "Backup verification failed"
        return 1
    fi
}

verify_backup() {
    local backup_path="$1"
    
    if [ -z "$backup_path" ]; then
        log_error "No backup path provided for verification"
        return 1
    fi
    
    if [ ! -d "$backup_path" ]; then
        log_error "Backup directory not found: $backup_path"
        return 1
    fi
    
    log_info "Verifying backup at $backup_path..."
    
    # Check metadata.json exists and is valid JSON
    if [ ! -f "$backup_path/metadata.json" ]; then
        log_error "Backup metadata.json not found"
        return 1
    fi
    
    # Verify JSON is valid (basic check)
    if ! grep -q "timestamp" "$backup_path/metadata.json" 2>/dev/null; then
        log_error "Backup metadata.json appears to be invalid"
        return 1
    fi
    
    # Verify at least one critical file was backed up
    local has_files=false
    if [ -d "$backup_path/.next" ] || [ -f "$backup_path/package-lock.json" ]; then
        has_files=true
    fi
    
    if [ "$has_files" = false ]; then
        log_error "Backup contains no critical files"
        return 1
    fi
    
    log_success "Backup verification passed"
    return 0
}

restore_backup() {
    local backup_path="$1"
    
    if [ -z "$backup_path" ]; then
        log_error "No backup path provided"
        return 1
    fi
    
    if [ ! -d "$backup_path" ]; then
        log_error "Backup directory not found: $backup_path"
        return 1
    fi
    
    # Verify backup before restoring
    if ! verify_backup "$backup_path"; then
        log_error "Backup verification failed, cannot restore"
        return 1
    fi
    
    log_info "Restoring from backup: $backup_path..."
    
    # Read metadata
    if [ -f "$backup_path/metadata.json" ]; then
        log_info "Backup metadata:"
        grep -E "timestamp|gitCommit|version" "$backup_path/metadata.json" | sed 's/^/  /' || true
    fi
    
    local files_restored=0
    
    # Restore .next directory
    if [ -d "$backup_path/.next" ]; then
        log_info "Restoring .next directory..."
        rm -rf .next
        cp -r "$backup_path/.next" .
        files_restored=$((files_restored + 1))
        log_success "Restored .next directory"
    else
        log_info ".next directory not in backup, skipping"
    fi
    
    # Restore package-lock.json
    if [ -f "$backup_path/package-lock.json" ]; then
        log_info "Restoring package-lock.json..."
        cp "$backup_path/package-lock.json" .
        files_restored=$((files_restored + 1))
        log_success "Restored package-lock.json"
    else
        log_info "package-lock.json not in backup, skipping"
    fi
    
    # Restore .env.local
    if [ -f "$backup_path/.env.local" ]; then
        log_info "Restoring .env.local..."
        cp "$backup_path/.env.local" .
        files_restored=$((files_restored + 1))
        log_success "Restored .env.local"
    else
        log_info ".env.local not in backup, skipping"
    fi
    
    if [ $files_restored -eq 0 ]; then
        log_error "No files were restored from backup"
        return 1
    fi
    
    log_success "Backup restored successfully ($files_restored files)"
    return 0
}

get_latest_backup() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory does not exist: $BACKUP_DIR"
        return 1
    fi
    
    local latest_backup=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort -r | head -n 1)
    
    if [ -z "$latest_backup" ]; then
        log_error "No backups found in $BACKUP_DIR"
        return 1
    fi
    
    echo "$latest_backup"
    return 0
}

list_backups() {
    log_info "Available backups:"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "No backup directory found"
        return 0
    fi
    
    local backup_count=0
    while IFS= read -r backup; do
        backup_count=$((backup_count + 1))
        local backup_name=$(basename "$backup")
        local backup_date=$(echo "$backup_name" | sed 's/backup_//' | sed 's/_/ /')
        
        echo "  [$backup_count] $backup_name (Created: $backup_date)"
        
        if [ -f "$backup/metadata.json" ]; then
            local git_commit=$(grep -o '"gitCommit": "[^"]*"' "$backup/metadata.json" | cut -d'"' -f4)
            local version=$(grep -o '"version": "[^"]*"' "$backup/metadata.json" | cut -d'"' -f4)
            [ -n "$git_commit" ] && echo "      Git: $git_commit"
            [ -n "$version" ] && echo "      Version: $version"
        fi
    done < <(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort -r)
    
    if [ $backup_count -eq 0 ]; then
        log_info "No backups found"
    else
        log_info "Total backups: $backup_count"
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than $BACKUP_RETENTION_DAYS days..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "No backup directory found"
        return 0
    fi
    
    local deleted_count=0
    local total_size_freed=0
    
    while IFS= read -r backup; do
        local backup_size=$(du -sb "$backup" 2>/dev/null | cut -f1 || echo "0")
        total_size_freed=$((total_size_freed + backup_size))
        rm -rf "$backup"
        deleted_count=$((deleted_count + 1))
        log_info "Deleted old backup: $(basename "$backup")"
    done < <(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" -mtime +$BACKUP_RETENTION_DAYS)
    
    if [ $deleted_count -gt 0 ]; then
        log_success "Cleaned up $deleted_count old backup(s), freed $(numfmt --to=iec-i --suffix=B $total_size_freed 2>/dev/null || echo "${total_size_freed} bytes")"
    else
        log_info "No old backups to clean up"
    fi
    
    return 0
}

# ============================================================================
# CACHE MANAGEMENT FUNCTIONS
# ============================================================================

clean_build_cache() {
    log_info "Cleaning Next.js build cache..."
    if [ -d ".next" ]; then
        rm -rf .next
        log_success "Removed .next directory"
    else
        log_info ".next directory does not exist"
    fi
}

clean_node_cache() {
    log_info "Cleaning node_modules cache..."
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        log_success "Removed node_modules/.cache directory"
    else
        log_info "node_modules/.cache directory does not exist"
    fi
}

clean_all_cache() {
    log_info "Cleaning all caches..."
    clean_build_cache
    clean_node_cache
    npm cache clean --force 2>/dev/null || true
    log_success "All caches cleaned"
}

# ============================================================================
# HEALTH CHECK FUNCTIONS
# ============================================================================

wait_for_ready() {
    local max_attempts="${1:-30}"
    local delay="${2:-2}"
    local url="${3:-http://localhost:3333}"
    log_info "Waiting for application to be ready (max ${max_attempts} attempts)..."
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            log_success "Application is ready (attempt $attempt)"
            return 0
        fi
        log_info "Attempt $attempt/$max_attempts - waiting ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
    done
    log_error "Application failed to become ready after $max_attempts attempts"
    return 1
}

check_health() {
    local url="${1:-http://localhost:3333/api/health}"
    local timeout="${2:-5}"
    log_info "Performing health check on $url..."
    local response_code=$(curl -sf -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000")
    if [ "$response_code" = "200" ]; then
        log_success "Health check passed (HTTP $response_code)"
        return 0
    else
        log_error "Health check failed (HTTP $response_code)"
        return 1
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."
    local all_checks_passed=true
    if ! pm2_get_status > /dev/null 2>&1; then
        log_error "PM2 process is not running"
        all_checks_passed=false
    fi
    if ! wait_for_ready 15 2; then
        log_error "Application failed to become ready"
        all_checks_passed=false
    fi
    if ! check_health; then
        log_error "Health check failed"
        all_checks_passed=false
    fi
    if [ "$all_checks_passed" = true ]; then
        log_success "Deployment verification passed"
        return 0
    else
        log_error "Deployment verification failed"
        return 1
    fi
}

# ============================================================================
# PM2 MANAGEMENT FUNCTIONS
# ============================================================================

pm2_reload_safe() {
    local app_name="${1:-sylvan-app}"
    local max_retries="${2:-3}"
    local retry_delay="${3:-5}"
    log_info "Performing safe PM2 reload for $app_name..."
    local attempt=1
    while [ $attempt -le $max_retries ]; do
        log_info "Reload attempt $attempt/$max_retries..."
        if pm2 reload "$app_name" --update-env; then
            log_success "PM2 reload successful"
            return 0
        else
            log_error "PM2 reload failed (attempt $attempt)"
            if [ $attempt -lt $max_retries ]; then
                log_info "Retrying in ${retry_delay}s..."
                sleep $retry_delay
            fi
        fi
        attempt=$((attempt + 1))
    done
    log_error "PM2 reload failed after $max_retries attempts"
    return 1
}

pm2_get_status() {
    local app_name="${1:-sylvan-app}"
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed"
        return 1
    fi
    pm2 describe "$app_name" 2>/dev/null
}

pm2_get_version() {
    local app_name="${1:-sylvan-app}"
    log_info "Getting version information for $app_name..."
    local git_commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local node_version=$(node --version)
    echo "Git Commit: $git_commit"
    echo "Git Branch: $git_branch"
    echo "Node Version: $node_version"
    if pm2_get_status "$app_name" > /dev/null 2>&1; then
        echo "PM2 Status: Running"
        pm2 describe "$app_name" | grep -E "status|uptime|restarts|memory|cpu" || true
    else
        echo "PM2 Status: Not running"
    fi
}

# ============================================================================
# DATABASE MIGRATION FUNCTIONS
# ============================================================================

create_database_backup() {
    local environment="${1:-production}"
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local db_backup_dir="$BACKUP_DIR/db_backups"
    local db_backup_path="$db_backup_dir/db_backup_$timestamp"
    
    log_info "Creating database backup for $environment environment..."
    mkdir -p "$db_backup_dir"
    
    # Load environment variables
    if [ -f ".env.local" ]; then
        set -a
        source .env.local
        set +a
    elif [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL not found in environment"
        return 1
    fi
    
    # Determine database type from DATABASE_URL
    local db_type=""
    if [[ "$DATABASE_URL" == postgresql://* ]] || [[ "$DATABASE_URL" == postgres://* ]]; then
        db_type="postgresql"
    elif [[ "$DATABASE_URL" == mysql://* ]]; then
        db_type="mysql"
    elif [[ "$DATABASE_URL" == file:* ]] || [[ "$DATABASE_URL" == *.db ]]; then
        db_type="sqlite"
    else
        log_error "Unsupported database type in DATABASE_URL"
        return 1
    fi
    
    log_info "Detected database type: $db_type"
    
    case "$db_type" in
        sqlite)
            # Extract SQLite database file path
            local db_file=$(echo "$DATABASE_URL" | sed 's/file://')
            if [ -f "$db_file" ]; then
                cp "$db_file" "$db_backup_path.db"
                log_success "SQLite database backed up to $db_backup_path.db"
                echo "$db_backup_path.db"
                return 0
            else
                log_error "SQLite database file not found: $db_file"
                return 1
            fi
            ;;
        postgresql)
            # PostgreSQL backup using pg_dump
            if command -v pg_dump &> /dev/null; then
                if pg_dump "$DATABASE_URL" > "$db_backup_path.sql" 2>/dev/null; then
                    log_success "PostgreSQL database backed up to $db_backup_path.sql"
                    echo "$db_backup_path.sql"
                    return 0
                else
                    log_error "PostgreSQL backup failed"
                    return 1
                fi
            else
                log_error "pg_dump not found. Install PostgreSQL client tools."
                return 1
            fi
            ;;
        mysql)
            # MySQL backup using mysqldump
            if command -v mysqldump &> /dev/null; then
                # Parse MySQL connection details from DATABASE_URL
                # Format: mysql://user:password@host:port/database
                local mysql_url=$(echo "$DATABASE_URL" | sed 's/mysql:\/\///')
                if mysqldump "$mysql_url" > "$db_backup_path.sql" 2>/dev/null; then
                    log_success "MySQL database backed up to $db_backup_path.sql"
                    echo "$db_backup_path.sql"
                    return 0
                else
                    log_error "MySQL backup failed"
                    return 1
                fi
            else
                log_error "mysqldump not found. Install MySQL client tools."
                return 1
            fi
            ;;
        *)
            log_error "Database backup not implemented for type: $db_type"
            return 1
            ;;
    esac
}

restore_database_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "No database backup file provided"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Database backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Restoring database from backup: $backup_file..."
    
    # Load environment variables
    if [ -f ".env.local" ]; then
        set -a
        source .env.local
        set +a
    elif [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL not found in environment"
        return 1
    fi
    
    # Determine backup type from file extension
    if [[ "$backup_file" == *.db ]]; then
        # SQLite restore
        local db_file=$(echo "$DATABASE_URL" | sed 's/file://')
        cp "$backup_file" "$db_file"
        log_success "SQLite database restored from backup"
        return 0
    elif [[ "$backup_file" == *.sql ]]; then
        # SQL restore (PostgreSQL or MySQL)
        if [[ "$DATABASE_URL" == postgresql://* ]] || [[ "$DATABASE_URL" == postgres://* ]]; then
            if command -v psql &> /dev/null; then
                if psql "$DATABASE_URL" < "$backup_file" 2>/dev/null; then
                    log_success "PostgreSQL database restored from backup"
                    return 0
                else
                    log_error "PostgreSQL restore failed"
                    return 1
                fi
            else
                log_error "psql not found. Install PostgreSQL client tools."
                return 1
            fi
        elif [[ "$DATABASE_URL" == mysql://* ]]; then
            if command -v mysql &> /dev/null; then
                local mysql_url=$(echo "$DATABASE_URL" | sed 's/mysql:\/\///')
                if mysql "$mysql_url" < "$backup_file" 2>/dev/null; then
                    log_success "MySQL database restored from backup"
                    return 0
                else
                    log_error "MySQL restore failed"
                    return 1
                fi
            else
                log_error "mysql not found. Install MySQL client tools."
                return 1
            fi
        fi
    fi
    
    log_error "Unable to restore database backup"
    return 1
}

run_migration_dry_run() {
    log_info "Running migration dry-run (checking pending migrations)..."
    
    # Check if prisma is available
    if ! command -v npx &> /dev/null; then
        log_error "npx not found"
        return 1
    fi
    
    # Get migration status
    log_info "Checking migration status..."
    local migration_status=$(npx prisma migrate status 2>&1)
    
    if echo "$migration_status" | grep -q "Database schema is up to date"; then
        log_success "No pending migrations"
        return 0
    elif echo "$migration_status" | grep -q "following migration.*not yet been applied"; then
        log_info "Pending migrations detected:"
        echo "$migration_status" | grep -A 20 "following migration" | sed 's/^/  /'
        return 0
    else
        log_info "Migration status:"
        echo "$migration_status" | sed 's/^/  /'
        return 0
    fi
}

get_pending_migrations() {
    # Get list of pending migrations
    local migration_status=$(npx prisma migrate status 2>&1)
    
    if echo "$migration_status" | grep -q "following migration.*not yet been applied"; then
        # Extract migration names
        echo "$migration_status" | grep -E "^\s+[0-9]+_" | sed 's/^[[:space:]]*//'
    fi
}

verify_migrations() {
    log_info "Verifying migrations were applied successfully..."
    
    # Check migration status
    local migration_status=$(npx prisma migrate status 2>&1)
    
    if echo "$migration_status" | grep -q "Database schema is up to date"; then
        log_success "All migrations applied successfully"
        return 0
    elif echo "$migration_status" | grep -q "following migration.*not yet been applied"; then
        log_error "Some migrations were not applied"
        echo "$migration_status" | grep -A 10 "following migration" | sed 's/^/  /'
        return 1
    else
        log_info "Migration verification status:"
        echo "$migration_status" | sed 's/^/  /'
        # Assume success if no clear failure
        return 0
    fi
}

run_migrations_safe() {
    local environment="${1:-production}"
    local skip_backup="${2:-false}"
    local dry_run="${3:-false}"
    
    log_info "=========================================="
    log_info "Database Migration (Safe Mode)"
    log_info "Environment: $environment"
    log_info "=========================================="
    
    # Step 1: Dry run to check pending migrations
    log_info "Step 1: Checking for pending migrations..."
    if ! run_migration_dry_run; then
        log_error "Failed to check migration status"
        return 1
    fi
    
    # Get list of pending migrations
    local pending_migrations=$(get_pending_migrations)
    
    if [ -z "$pending_migrations" ]; then
        log_info "No pending migrations to apply"
        return 0
    fi
    
    log_info "Pending migrations to be applied:"
    echo "$pending_migrations" | sed 's/^/  - /'
    
    # If dry-run mode, stop here
    if [ "$dry_run" = "true" ]; then
        log_info "Dry-run mode: Stopping before applying migrations"
        return 0
    fi
    
    # Step 2: Create database backup (production only, unless skip_backup is true)
    local db_backup_file=""
    if [ "$environment" = "production" ] && [ "$skip_backup" = "false" ]; then
        log_info "Step 2: Creating database backup..."
        db_backup_file=$(create_database_backup "$environment")
        if [ $? -ne 0 ]; then
            log_error "Database backup failed. Aborting migrations."
            return 1
        fi
        log_success "Database backup created: $db_backup_file"
    else
        log_info "Step 2: Skipping database backup (environment: $environment, skip_backup: $skip_backup)"
    fi
    
    # Step 3: Run migrations
    log_info "Step 3: Applying migrations..."
    local migration_start=$(date +%s)
    
    if npx prisma migrate deploy 2>&1 | tee -a "$CURRENT_LOG_FILE"; then
        local migration_end=$(date +%s)
        local migration_duration=$((migration_end - migration_start))
        log_success "Migrations applied successfully (duration: ${migration_duration}s)"
    else
        log_error "Migration failed"
        
        # Step 4: Rollback on failure (if backup exists)
        if [ -n "$db_backup_file" ] && [ -f "$db_backup_file" ]; then
            log_error "Attempting to restore database from backup..."
            if restore_database_backup "$db_backup_file"; then
                log_success "Database restored from backup"
                log_error "Migration failed but database was restored to previous state"
                return 1
            else
                log_error "CRITICAL: Migration failed AND database restore failed"
                log_error "Manual intervention required immediately"
                log_error "Backup file: $db_backup_file"
                return 1
            fi
        else
            log_error "No database backup available for rollback"
            return 1
        fi
    fi
    
    # Step 5: Verify migrations
    log_info "Step 4: Verifying migrations..."
    if ! verify_migrations; then
        log_error "Migration verification failed"
        
        # Attempt rollback if backup exists
        if [ -n "$db_backup_file" ] && [ -f "$db_backup_file" ]; then
            log_error "Attempting to restore database from backup..."
            if restore_database_backup "$db_backup_file"; then
                log_success "Database restored from backup"
                return 1
            fi
        fi
        return 1
    fi
    
    # Step 6: Log applied migrations
    log_info "Step 5: Logging applied migrations..."
    log_info "Successfully applied migrations:"
    echo "$pending_migrations" | sed 's/^/  ✓ /'
    
    log_success "=========================================="
    log_success "Database migration completed successfully"
    log_success "=========================================="
    
    return 0
}

cleanup_old_database_backups() {
    local retention_days="${1:-7}"
    log_info "Cleaning up database backups older than $retention_days days..."
    
    local db_backup_dir="$BACKUP_DIR/db_backups"
    
    if [ ! -d "$db_backup_dir" ]; then
        log_info "No database backup directory found"
        return 0
    fi
    
    local deleted_count=0
    local total_size_freed=0
    
    while IFS= read -r backup_file; do
        local backup_size=$(stat -c%s "$backup_file" 2>/dev/null || stat -f%z "$backup_file" 2>/dev/null || echo "0")
        total_size_freed=$((total_size_freed + backup_size))
        rm -f "$backup_file"
        deleted_count=$((deleted_count + 1))
        log_info "Deleted old database backup: $(basename "$backup_file")"
    done < <(find "$db_backup_dir" -type f \( -name "db_backup_*.db" -o -name "db_backup_*.sql" \) -mtime +$retention_days)
    
    if [ $deleted_count -gt 0 ]; then
        log_success "Cleaned up $deleted_count old database backup(s), freed $(numfmt --to=iec-i --suffix=B $total_size_freed 2>/dev/null || echo "${total_size_freed} bytes")"
    else
        log_info "No old database backups to clean up"
    fi
    
    return 0
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

cleanup_old_logs() {
    log_info "Cleaning up logs older than $LOG_RETENTION_DAYS days..."
    local deleted_count=0
    if [ -d "$LOG_DIR" ]; then
        while IFS= read -r logfile; do
            rm -f "$logfile"
            deleted_count=$((deleted_count + 1))
        done < <(find "$LOG_DIR" -type f -name "deploy_*.log" -mtime +$LOG_RETENTION_DAYS)
    fi
    if [ -d "$HEALTH_CHECK_LOG_DIR" ]; then
        while IFS= read -r logfile; do
            rm -f "$logfile"
            deleted_count=$((deleted_count + 1))
        done < <(find "$HEALTH_CHECK_LOG_DIR" -type f -name "health_*.log" -mtime +$LOG_RETENTION_DAYS)
    fi
    if [ $deleted_count -gt 0 ]; then
        log_success "Cleaned up $deleted_count old log file(s)"
    else
        log_info "No old logs to clean up"
    fi
}

# Export functions for use in other scripts
export -f log_info log_success log_error log_step log_step_complete init_log_file
export -f validate_env validate_config validate_dependencies
export -f create_backup verify_backup restore_backup get_latest_backup list_backups cleanup_old_backups
export -f clean_build_cache clean_node_cache clean_all_cache
export -f wait_for_ready check_health verify_deployment
export -f pm2_reload_safe pm2_get_status pm2_get_version
export -f create_database_backup restore_database_backup run_migration_dry_run get_pending_migrations verify_migrations run_migrations_safe cleanup_old_database_backups
export -f cleanup_old_logs
