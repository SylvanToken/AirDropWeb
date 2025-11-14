# Deployment Logging Infrastructure

## Overview

The deployment logging infrastructure provides comprehensive logging capabilities for all deployment operations. It ensures that every deployment action is tracked, timed, and stored for troubleshooting and audit purposes.

## Directory Structure

```
logs/
├── deployments/          # Deployment operation logs
│   ├── deploy_20241114_143022.log
│   └── deploy_20241114_120015.log
└── health-checks/        # Health check logs
    ├── health_20241114_143025.log
    └── health_20241114_120018.log
```

## Log File Format

Each log entry follows this format:

```
[YYYY-MM-DD HH:MM:SS] [LEVEL] Message
```

**Example:**
```
[2024-11-14 14:30:22] [INFO] Starting deployment update
[2024-11-14 14:30:23] [STEP] Cleaning build cache (duration: 1.2s)
[2024-11-14 14:30:45] [STEP] Installing dependencies (duration: 22.3s)
[2024-11-14 14:31:12] [STEP] Building application (duration: 27.1s)
[2024-11-14 14:31:15] [STEP] Reloading PM2 (duration: 3.2s)
[2024-11-14 14:31:20] [SUCCESS] Health check passed
[2024-11-14 14:31:20] [INFO] Deployment completed successfully
```

## Log Levels

- **INFO**: General informational messages about deployment progress
- **SUCCESS**: Successful completion of operations
- **ERROR**: Errors that occurred during deployment
- **STEP**: Deployment steps with timing information

## Logging Functions

### Basic Logging

```bash
# Log informational message
log_info "Starting deployment process"

# Log success message
log_success "Deployment completed successfully"

# Log error message
log_error "Failed to build application"
```

### Step Timing

```bash
# Start timing a step
start_time=$(log_step "Building application")

# ... perform the step ...

# Complete the step and log duration
log_step_complete "Building application" "$start_time"
```

### Initialize Log File

```bash
# Initialize a new log file with timestamp
init_log_file

# The log file path is stored in $CURRENT_LOG_FILE
echo "Logging to: $CURRENT_LOG_FILE"
```

## Log Retention

### Automatic Cleanup

The system automatically cleans up old log files to prevent disk space issues:

- **Deployment logs**: Retained for 30 days
- **Health check logs**: Retained for 30 days
- **Backup metadata**: Retained for 7 days

### Manual Cleanup

```bash
# Clean up old logs manually
cleanup_old_logs
```

## Configuration

Log retention periods are configured in `lib/deployment-utils.sh`:

```bash
BACKUP_RETENTION_DAYS=7   # Backup retention period
LOG_RETENTION_DAYS=30     # Log retention period
```

## Usage in Deployment Scripts

### Example: deploy-update.sh

```bash
#!/bin/bash

# Source deployment utilities
source lib/deployment-utils.sh

# Initialize logging
init_log_file

# Log deployment start
log_info "Starting deployment update"
log_info "Git commit: $(git rev-parse --short HEAD)"

# Time a deployment step
start_time=$(log_step "Cleaning cache")
clean_all_cache
log_step_complete "Cleaning cache" "$start_time"

# Log success or error
if [ $? -eq 0 ]; then
    log_success "Deployment completed successfully"
else
    log_error "Deployment failed"
    exit 1
fi

# Clean up old logs
cleanup_old_logs
```

## Viewing Logs

### View Latest Deployment Log

```bash
# Find the most recent deployment log
ls -lt logs/deployments/ | head -n 2

# View the log
cat logs/deployments/deploy_20241114_143022.log
```

### View Logs in Real-Time

```bash
# Tail the most recent log file
tail -f logs/deployments/deploy_*.log
```

### Search Logs for Errors

```bash
# Find all errors in deployment logs
grep "\[ERROR\]" logs/deployments/*.log

# Find errors from today
grep "\[ERROR\]" logs/deployments/deploy_$(date +%Y%m%d)*.log
```

## Log Analysis

### Deployment Duration

```bash
# Extract deployment duration from logs
grep "duration:" logs/deployments/deploy_20241114_143022.log
```

### Success Rate

```bash
# Count successful deployments
grep -c "\[SUCCESS\].*Deployment completed" logs/deployments/*.log

# Count failed deployments
grep -c "\[ERROR\].*Deployment failed" logs/deployments/*.log
```

## Troubleshooting

### Log File Not Created

**Problem**: Log file is not being created

**Solution**:
1. Ensure `lib/deployment-utils.sh` is sourced
2. Call `init_log_file` before logging
3. Check directory permissions for `logs/deployments/`

```bash
# Check permissions
ls -ld logs/deployments/

# Fix permissions if needed
chmod 755 logs/deployments/
```

### Logs Growing Too Large

**Problem**: Log directory consuming too much disk space

**Solution**:
1. Reduce `LOG_RETENTION_DAYS` in `lib/deployment-utils.sh`
2. Run manual cleanup: `cleanup_old_logs`
3. Archive old logs to external storage

```bash
# Archive logs older than 7 days
tar -czf logs-archive-$(date +%Y%m%d).tar.gz \
    $(find logs/deployments/ -type f -mtime +7)

# Remove archived logs
find logs/deployments/ -type f -mtime +7 -delete
```

### Missing Log Entries

**Problem**: Some deployment steps are not logged

**Solution**:
1. Ensure all deployment steps use logging functions
2. Check that `$CURRENT_LOG_FILE` is set
3. Verify script doesn't exit before logging

```bash
# Always initialize logging first
init_log_file

# Use logging functions for all output
log_info "Step description"
# Instead of: echo "Step description"
```

## Best Practices

1. **Always initialize logging**: Call `init_log_file` at the start of deployment scripts
2. **Use appropriate log levels**: INFO for progress, SUCCESS for completion, ERROR for failures
3. **Time important steps**: Use `log_step` and `log_step_complete` for operations that take time
4. **Include context**: Add relevant information like git commit, environment, timestamps
5. **Clean up regularly**: Run `cleanup_old_logs` at the end of deployments
6. **Monitor log size**: Check disk usage periodically
7. **Archive important logs**: Keep logs from production deployments for audit purposes

## Integration with Monitoring

### PM2 Logs

PM2 maintains separate logs configured in `ecosystem.config.js`:

```javascript
{
  error_file: './logs/pm2-error.log',
  out_file: './logs/pm2-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
}
```

### Centralized Logging

For production environments, consider forwarding logs to a centralized logging service:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **CloudWatch Logs** (AWS)
- **Stackdriver** (GCP)

## Security Considerations

1. **Sensitive Data**: Never log sensitive information (passwords, API keys, tokens)
2. **Access Control**: Restrict log directory permissions to deployment user
3. **Log Rotation**: Implement proper log rotation to prevent disk exhaustion
4. **Audit Trail**: Maintain logs for compliance and security auditing

```bash
# Secure log directories
chmod 700 logs/
chmod 700 logs/deployments/
chmod 700 logs/health-checks/

# Ensure logs are owned by deployment user
chown -R deploy-user:deploy-group logs/
```

## Testing

Run the logging infrastructure test:

```bash
# PowerShell (Windows)
powershell -ExecutionPolicy Bypass -File scripts/test-logging-infrastructure.ps1

# Bash (Linux/Mac)
bash scripts/test-logging-infrastructure.sh
```

## Related Documentation

- [Deployment Guide](./deployment.md)
- [Health Check System](../scripts/health-check-README.md)
- [Rollback Procedures](./rollback.md)
