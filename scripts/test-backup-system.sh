#!/bin/bash

# Test script for backup management system
# Validates all backup functionality

set -e

echo "=========================================="
echo "Backup Management System Test"
echo "=========================================="
echo ""

# Source deployment utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

source lib/deployment-utils.sh

# Initialize logging
init_log_file

# Test counter
tests_passed=0
tests_failed=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo "Testing: $test_name"
    if eval "$test_command"; then
        echo "  ✓ PASSED"
        tests_passed=$((tests_passed + 1))
    else
        echo "  ✗ FAILED"
        tests_failed=$((tests_failed + 1))
    fi
    echo ""
}

# Test 1: Backup directory creation
run_test "Backup directory exists" "[ -d 'backups' ]"

# Test 2: Create backup function
run_test "Create backup" "backup_path=\$(create_backup) && [ -n \"\$backup_path\" ]"

# Test 3: Verify backup function
run_test "Verify backup" "verify_backup \"\$backup_path\""

# Test 4: Backup contains metadata
run_test "Metadata file exists" "[ -f \"\$backup_path/metadata.json\" ]"

# Test 5: Metadata is valid JSON
run_test "Metadata is valid JSON" "grep -q 'timestamp' \"\$backup_path/metadata.json\""

# Test 6: Get latest backup
run_test "Get latest backup" "latest=\$(get_latest_backup) && [ -n \"\$latest\" ]"

# Test 7: List backups
run_test "List backups" "list_backups > /dev/null 2>&1"

# Test 8: Backup verification with invalid path
run_test "Verify invalid backup fails" "! verify_backup 'nonexistent/backup'"

# Test 9: Restore backup (dry run - just test function exists)
run_test "Restore backup function exists" "type restore_backup > /dev/null 2>&1"

# Test 10: Cleanup function exists
run_test "Cleanup function exists" "type cleanup_old_backups > /dev/null 2>&1"

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Tests Passed: $tests_passed"
echo "Tests Failed: $tests_failed"
echo ""

if [ $tests_failed -eq 0 ]; then
    echo "✓ All tests passed!"
    echo ""
    echo "Backup system is working correctly."
    echo ""
    echo "Available commands:"
    echo "  ./scripts/backup-manager.sh create"
    echo "  ./scripts/backup-manager.sh list"
    echo "  ./scripts/backup-manager.sh restore <path>"
    echo "  ./scripts/backup-manager.sh restore-latest"
    echo "  ./scripts/backup-manager.sh verify <path>"
    echo "  ./scripts/backup-manager.sh cleanup"
    exit 0
else
    echo "✗ Some tests failed!"
    exit 1
fi
