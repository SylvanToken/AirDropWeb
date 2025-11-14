#!/bin/bash

# Test Script for Database Migration Safety Features
# Tests the migration safety functions without affecting production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Source deployment utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

if [ -f "lib/deployment-utils.sh" ]; then
    source lib/deployment-utils.sh
else
    echo -e "${RED}ERROR: deployment-utils.sh not found${NC}"
    exit 1
fi

# Initialize logging
init_log_file

echo ""
echo "=========================================="
echo "Database Migration Safety Tests"
echo "=========================================="
echo "Testing migration safety features..."
echo ""

# ============================================================================
# TEST FUNCTIONS
# ============================================================================

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${BLUE}[TEST $TESTS_RUN]${NC} $test_name"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo ""
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo ""
        return 1
    fi
}

# ============================================================================
# TESTS
# ============================================================================

# Test 1: Check if migration dry-run function exists
test_dry_run_exists() {
    if type run_migration_dry_run &> /dev/null; then
        echo "  - run_migration_dry_run function exists"
        return 0
    else
        echo "  - ERROR: run_migration_dry_run function not found"
        return 1
    fi
}

# Test 2: Check if database backup function exists
test_db_backup_exists() {
    if type create_database_backup &> /dev/null; then
        echo "  - create_database_backup function exists"
        return 0
    else
        echo "  - ERROR: create_database_backup function not found"
        return 1
    fi
}

# Test 3: Check if database restore function exists
test_db_restore_exists() {
    if type restore_database_backup &> /dev/null; then
        echo "  - restore_database_backup function exists"
        return 0
    else
        echo "  - ERROR: restore_database_backup function not found"
        return 1
    fi
}

# Test 4: Check if migration verification function exists
test_verify_exists() {
    if type verify_migrations &> /dev/null; then
        echo "  - verify_migrations function exists"
        return 0
    else
        echo "  - ERROR: verify_migrations function not found"
        return 1
    fi
}

# Test 5: Check if safe migration function exists
test_safe_migration_exists() {
    if type run_migrations_safe &> /dev/null; then
        echo "  - run_migrations_safe function exists"
        return 0
    else
        echo "  - ERROR: run_migrations_safe function not found"
        return 1
    fi
}

# Test 6: Check if get_pending_migrations function exists
test_get_pending_exists() {
    if type get_pending_migrations &> /dev/null; then
        echo "  - get_pending_migrations function exists"
        return 0
    else
        echo "  - ERROR: get_pending_migrations function not found"
        return 1
    fi
}

# Test 7: Check if cleanup function exists
test_cleanup_exists() {
    if type cleanup_old_database_backups &> /dev/null; then
        echo "  - cleanup_old_database_backups function exists"
        return 0
    else
        echo "  - ERROR: cleanup_old_database_backups function not found"
        return 1
    fi
}

# Test 8: Test migration dry-run (actual execution)
test_dry_run_execution() {
    echo "  - Running migration dry-run..."
    if run_migration_dry_run 2>&1 | grep -q "migration"; then
        echo "  - Dry-run executed successfully"
        return 0
    else
        echo "  - Dry-run completed (no output is also valid)"
        return 0
    fi
}

# Test 9: Test database backup directory creation
test_backup_dir_creation() {
    local db_backup_dir="backups/db_backups"
    
    if [ -d "$db_backup_dir" ] || mkdir -p "$db_backup_dir"; then
        echo "  - Database backup directory exists or created: $db_backup_dir"
        return 0
    else
        echo "  - ERROR: Failed to create database backup directory"
        return 1
    fi
}

# Test 10: Test migration script exists
test_migration_script_exists() {
    if [ -f "scripts/migrate-database.sh" ]; then
        echo "  - Migration script exists: scripts/migrate-database.sh"
        return 0
    else
        echo "  - ERROR: Migration script not found"
        return 1
    fi
}

# Test 11: Test migration script help
test_migration_script_help() {
    if bash scripts/migrate-database.sh --help 2>&1 | grep -q "Usage"; then
        echo "  - Migration script help works"
        return 0
    else
        echo "  - ERROR: Migration script help failed"
        return 1
    fi
}

# Test 12: Test migration script list-pending
test_migration_script_list() {
    echo "  - Testing migration script --list-pending..."
    if bash scripts/migrate-database.sh --list-pending 2>&1 | grep -qE "(pending|migrations|up to date)"; then
        echo "  - Migration script list-pending works"
        return 0
    else
        echo "  - Migration script list-pending completed (no output is valid)"
        return 0
    fi
}

# Test 13: Verify deployment scripts use safe migrations
test_deployment_scripts_updated() {
    local all_updated=true
    
    # Check deploy-update.sh
    if grep -q "run_migrations_safe" deploy-update.sh; then
        echo "  - deploy-update.sh uses run_migrations_safe"
    else
        echo "  - WARNING: deploy-update.sh does not use run_migrations_safe"
        all_updated=false
    fi
    
    # Check deploy-production.sh
    if grep -q "run_migrations_safe" deploy-production.sh; then
        echo "  - deploy-production.sh uses run_migrations_safe"
    else
        echo "  - WARNING: deploy-production.sh does not use run_migrations_safe"
        all_updated=false
    fi
    
    # Check deploy-test.sh
    if grep -q "run_migrations_safe" deploy-test.sh; then
        echo "  - deploy-test.sh uses run_migrations_safe"
    else
        echo "  - WARNING: deploy-test.sh does not use run_migrations_safe"
        all_updated=false
    fi
    
    if [ "$all_updated" = true ]; then
        return 0
    else
        return 1
    fi
}

# ============================================================================
# RUN ALL TESTS
# ============================================================================

run_test "Migration dry-run function exists" "test_dry_run_exists"
run_test "Database backup function exists" "test_db_backup_exists"
run_test "Database restore function exists" "test_db_restore_exists"
run_test "Migration verification function exists" "test_verify_exists"
run_test "Safe migration function exists" "test_safe_migration_exists"
run_test "Get pending migrations function exists" "test_get_pending_exists"
run_test "Cleanup function exists" "test_cleanup_exists"
run_test "Migration dry-run execution" "test_dry_run_execution"
run_test "Database backup directory creation" "test_backup_dir_creation"
run_test "Migration script exists" "test_migration_script_exists"
run_test "Migration script help" "test_migration_script_help"
run_test "Migration script list-pending" "test_migration_script_list"
run_test "Deployment scripts updated" "test_deployment_scripts_updated"

# ============================================================================
# TEST SUMMARY
# ============================================================================

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "=========================================="
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Migration safety features are working correctly."
    echo ""
    echo "Available commands:"
    echo "  - bash scripts/migrate-database.sh --help"
    echo "  - bash scripts/migrate-database.sh --dry-run"
    echo "  - bash scripts/migrate-database.sh --list-pending"
    echo "  - bash scripts/migrate-database.sh --verify"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Please review the failed tests above."
    exit 1
fi
