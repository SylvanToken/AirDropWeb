# Design Document

## Overview

This design document outlines a robust deployment and update system for the Sylvan Token Next.js application. The system addresses critical issues in the current update process including cache management, zero-downtime deployments, automatic health checks, and rollback capabilities. The solution uses PM2 for process management, implements proper build artifact handling, and provides separate workflows for initial deployments and updates.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Controller                     │
│  (Orchestrates deployment flow and error handling)          │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├──────────────┬──────────────┬─────────────────┐
               │              │              │                 │
               ▼              ▼              ▼                 ▼
    ┌──────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────────┐
    │ Pre-Deploy   │  │   Build      │  │  Deploy  │  │ Post-Deploy  │
    │   Phase      │  │   Phase      │  │  Phase   │  │    Phase     │
    └──────────────┘  └─────────────┘  └──────────┘  └──────────────┘
           │                 │               │               │
           │                 │               │               │
           ▼                 ▼               ▼               ▼
    ┌──────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────────┐
    │ • Backup     │  │ • Clean     │  │ • PM2    │  │ • Health     │
    │ • Validate   │  │   Cache     │  │   Reload │  │   Check      │
    │ • Migrate    │  │ • Install   │  │ • Update │  │ • Verify     │
    │              │  │ • Build     │  │   Env    │  │ • Rollback?  │
    └──────────────┘  └─────────────┘  └──────────┘  └──────────────┘
```

### Deployment Flow Comparison

**Current Flow (Problematic):**
```
Update → npm ci → Build → PM2 Restart → Done
         (no cache clean)  (downtime)
```

**New Flow (Robust):**
```
Update → Backup → Clean Cache → npm ci → Build → 
         Verify → PM2 Reload → Health Check → 
         Success? → Yes: Done | No: Rollback
```

## Components and Interfaces

### 1. Deployment Scripts

#### 1.1 deploy-update.sh (New)
**Purpose:** Handle updates to already-deployed applications with zero downtime

**Key Features:**
- Aggressive cache cleaning
- PM2 reload instead of restart
- Automatic rollback on failure
- Environment variable updates
- Comprehensive logging

**Interface:**
```bash
./deploy-update.sh [--skip-backup] [--skip-health-check] [--force]

Options:
  --skip-backup       Skip creating backup before update
  --skip-health-check Skip health check after deployment
  --force            Force update even if health checks fail
```

#### 1.2 deploy-production.sh (Enhanced)
**Purpose:** Initial production deployment

**Enhancements:**
- Uses PM2 ecosystem config
- Creates initial backup
- Sets up monitoring
- Configures multiple instances

#### 1.3 deploy-test.sh (Enhanced)
**Purpose:** Test environment deployment

**Enhancements:**
- Single instance mode
- Development-friendly settings
- Quick restart without backup

### 2. PM2 Ecosystem Configuration

#### ecosystem.config.js
**Purpose:** Centralized PM2 process configuration

**Structure:**
```javascript
module.exports = {
  apps: [
    {
      name: 'sylvan-app',
      script: 'npm',
      args: 'start',
      instances: 2,  // Production: 2, Test: 1
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
}
```

**Key Configuration Options:**
- `instances: 2` - Run 2 instances for zero-downtime reload
- `exec_mode: 'cluster'` - Enable cluster mode for load balancing
- `wait_ready: true` - Wait for app to signal ready before considering it started
- `listen_timeout: 10000` - Wait up to 10s for app to be ready
- `kill_timeout: 5000` - Give old process 5s to gracefully shutdown

### 3. Deployment Library (lib/deployment-utils.sh)

**Purpose:** Reusable functions for deployment scripts

**Functions:**

```bash
# Logging functions
log_info()    # Log informational messages
log_success() # Log success messages
log_error()   # Log error messages
log_step()    # Log deployment step with timing

# Validation functions
validate_env()           # Check required environment variables
validate_config()        # Verify configuration files
validate_dependencies()  # Check system dependencies

# Backup functions
create_backup()    # Create timestamped backup
restore_backup()   # Restore from backup
cleanup_old_backups() # Remove backups older than 7 days

# Cache management
clean_build_cache()     # Remove .next directory
clean_node_cache()      # Remove node_modules/.cache
clean_all_cache()       # Clean all caches

# Health check functions
wait_for_ready()        # Wait for app to be ready
check_health()          # Perform health check
verify_deployment()     # Comprehensive deployment verification

# PM2 management
pm2_reload_safe()       # Safe reload with verification
pm2_get_status()        # Get current PM2 status
pm2_get_version()       # Get deployed version
```

### 4. Health Check System

#### health-check.sh
**Purpose:** Comprehensive health verification

**Checks:**
1. **HTTP Response Check**
   - Endpoint: `/api/health`
   - Expected: 200 status code
   - Timeout: 5 seconds

2. **API Functionality Check**
   - Test critical endpoints
   - Verify database connectivity
   - Check authentication system

3. **Performance Check**
   - Response time < 2 seconds
   - Memory usage < 80%
   - CPU usage < 70%

4. **Version Verification**
   - Compare deployed version with expected
   - Verify git commit hash matches

**Output:**
```json
{
  "status": "healthy",
  "checks": {
    "http": "pass",
    "api": "pass",
    "performance": "pass",
    "version": "pass"
  },
  "metrics": {
    "responseTime": 145,
    "memoryUsage": 512,
    "cpuUsage": 23
  },
  "version": "1.2.3",
  "commit": "abc123"
}
```

### 5. Rollback System

#### rollback.sh
**Purpose:** Automatic rollback on deployment failure

**Rollback Process:**
1. Stop new deployment
2. Restore previous build artifacts from backup
3. Restore previous node_modules if needed
4. Reload PM2 with previous version
5. Verify previous version is working
6. Log rollback details

**Backup Structure:**
```
backups/
├── backup_20241114_143022/
│   ├── .next/
│   ├── package-lock.json
│   ├── .env.local
│   └── metadata.json
└── backup_20241114_120015/
    └── ...
```

**Metadata Format:**
```json
{
  "timestamp": "2024-11-14T14:30:22Z",
  "gitCommit": "abc123def456",
  "version": "1.2.3",
  "nodeVersion": "20.10.0",
  "npmVersion": "10.2.3"
}
```

### 6. Logging System

#### Log Structure
```
logs/
├── deployments/
│   ├── deploy_20241114_143022.log
│   └── deploy_20241114_120015.log
├── pm2-error.log
├── pm2-out.log
└── health-checks/
    ├── health_20241114_143025.log
    └── health_20241114_120018.log
```

#### Log Format
```
[2024-11-14 14:30:22] [INFO] Starting deployment update
[2024-11-14 14:30:23] [STEP] Cleaning build cache (duration: 1.2s)
[2024-11-14 14:30:45] [STEP] Installing dependencies (duration: 22.3s)
[2024-11-14 14:31:12] [STEP] Building application (duration: 27.1s)
[2024-11-14 14:31:15] [STEP] Reloading PM2 (duration: 3.2s)
[2024-11-14 14:31:20] [SUCCESS] Health check passed
[2024-11-14 14:31:20] [INFO] Deployment completed successfully
```

## Data Models

### Deployment State
```typescript
interface DeploymentState {
  id: string;
  type: 'initial' | 'update';
  environment: 'production' | 'test';
  status: 'in_progress' | 'success' | 'failed' | 'rolled_back';
  startTime: Date;
  endTime?: Date;
  gitCommit: string;
  version: string;
  steps: DeploymentStep[];
  backupPath?: string;
  healthCheck?: HealthCheckResult;
  error?: DeploymentError;
}

interface DeploymentStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: string;
  error?: string;
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: Record<string, 'pass' | 'fail'>;
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  timestamp: Date;
}

interface DeploymentError {
  step: string;
  message: string;
  stack?: string;
  code?: string;
}
```

### PM2 Process State
```typescript
interface PM2ProcessState {
  name: string;
  pm_id: number;
  status: 'online' | 'stopping' | 'stopped' | 'launching' | 'errored';
  restart_time: number;
  created_at: Date;
  pm2_env: {
    version: string;
    NODE_ENV: string;
    PORT: number;
    instances: number;
    exec_mode: string;
  };
  monit: {
    memory: number;
    cpu: number;
  };
}
```

## Error Handling

### Error Categories

1. **Pre-Deployment Errors**
   - Missing environment variables
   - Invalid configuration
   - Missing dependencies
   - Action: Halt deployment, no rollback needed

2. **Build Errors**
   - Compilation failures
   - TypeScript errors
   - Missing dependencies
   - Action: Halt deployment, no rollback needed

3. **Deployment Errors**
   - PM2 reload failure
   - Process crash
   - Port binding issues
   - Action: Automatic rollback

4. **Post-Deployment Errors**
   - Health check failure
   - Performance degradation
   - API errors
   - Action: Automatic rollback

### Error Handling Flow

```
Error Detected
     │
     ├─ Pre-Deployment Error?
     │  └─ Yes → Log Error → Exit (no rollback)
     │
     ├─ Build Error?
     │  └─ Yes → Log Error → Exit (no rollback)
     │
     └─ Deployment/Post-Deployment Error?
        └─ Yes → Log Error → Initiate Rollback
                  │
                  ├─ Rollback Success?
                  │  ├─ Yes → Log Success → Exit
                  │  └─ No → Alert Admin → Manual Intervention
```

### Retry Logic

**PM2 Reload Retry:**
- Max attempts: 3
- Delay between attempts: 5 seconds
- Exponential backoff: No (fixed delay)

**Health Check Retry:**
- Max attempts: 5
- Delay between attempts: 3 seconds
- Exponential backoff: No (fixed delay)

**Database Migration Retry:**
- Max attempts: 1 (no retry)
- Reason: Migrations should be idempotent

## Testing Strategy

### 1. Unit Tests

**Test Deployment Utility Functions:**
```bash
test/deployment-utils.test.sh
├── test_log_functions
├── test_validate_env
├── test_clean_cache
├── test_create_backup
└── test_restore_backup
```

### 2. Integration Tests

**Test Complete Deployment Flow:**
```bash
test/deployment-integration.test.sh
├── test_initial_deployment
├── test_update_deployment
├── test_rollback_on_failure
├── test_health_check_integration
└── test_pm2_reload
```

### 3. Smoke Tests

**Quick Verification After Deployment:**
- Application starts successfully
- Health endpoint responds
- Critical pages load
- API endpoints work
- Database connection active

### 4. Load Tests

**Verify Zero-Downtime:**
- Run continuous requests during deployment
- Measure request success rate (should be 100%)
- Measure response time increase (should be < 10%)
- Verify no dropped connections

### 5. Rollback Tests

**Test Rollback Scenarios:**
- Build failure rollback
- Health check failure rollback
- PM2 crash rollback
- Partial deployment rollback

## Performance Considerations

### Build Performance

**Cache Strategy:**
- Clean `.next` directory on updates (prevents stale cache issues)
- Keep `node_modules` unless package.json changed
- Use `npm ci` for reproducible builds

**Build Time Optimization:**
- Parallel builds: Not applicable (single app)
- Incremental builds: Disabled for updates (reliability > speed)
- Expected build time: 20-40 seconds

### Deployment Performance

**Zero-Downtime Strategy:**
- PM2 cluster mode with 2 instances
- Reload instances one at a time
- Wait for new instance to be ready before killing old one
- Expected reload time: 5-10 seconds per instance

**Resource Usage:**
- Memory: ~1GB per instance during reload
- CPU: 50-70% spike during build
- Disk I/O: High during cache clean and build

### Rollback Performance

**Rollback Time:**
- Backup restoration: 2-5 seconds
- PM2 reload: 5-10 seconds
- Total rollback time: < 20 seconds

## Security Considerations

### 1. Environment Variables

**Protection:**
- Never log sensitive environment variables
- Validate required variables before deployment
- Use `.env.local` (not committed to git)
- Restrict file permissions: `chmod 600 .env.local`

### 2. Backup Security

**Protection:**
- Store backups in protected directory
- Restrict access: `chmod 700 backups/`
- Encrypt sensitive data in backups
- Auto-delete backups older than 7 days

### 3. Script Security

**Protection:**
- Use `set -e` to exit on errors
- Validate all user inputs
- Use absolute paths where possible
- Avoid command injection vulnerabilities
- Run with minimum required permissions

### 4. PM2 Security

**Protection:**
- Run PM2 as non-root user
- Limit process memory and CPU
- Enable log rotation
- Secure PM2 web interface (if used)

### 5. Health Check Security

**Protection:**
- Use internal health endpoint (not public)
- Implement rate limiting
- Don't expose sensitive system information
- Use authentication for detailed health data

## Deployment Scenarios

### Scenario 1: Successful Update

```
1. Developer pushes code to repository
2. SSH into server
3. Pull latest code: git pull origin main
4. Run: ./deploy-update.sh
5. Script performs:
   - Creates backup
   - Cleans cache
   - Installs dependencies
   - Builds application
   - Reloads PM2 (zero downtime)
   - Runs health checks
6. Health checks pass
7. Deployment complete
8. Users experience no downtime
```

### Scenario 2: Failed Update with Rollback

```
1. Developer pushes code with bug
2. Run: ./deploy-update.sh
3. Script performs:
   - Creates backup
   - Cleans cache
   - Builds successfully
   - Reloads PM2
   - Runs health checks
4. Health checks fail (API error)
5. Automatic rollback initiated:
   - Restores previous build
   - Reloads PM2 with old version
   - Verifies old version works
6. Rollback complete
7. Admin notified of failure
8. Users continue using old version
```

### Scenario 3: Initial Production Deployment

```
1. Server prepared with Node.js, PM2, Nginx
2. Clone repository
3. Create .env.local with production settings
4. Run: ./deploy-production.sh
5. Script performs:
   - Validates environment
   - Installs dependencies
   - Runs database migrations
   - Builds application
   - Starts PM2 with ecosystem config
   - Configures 2 instances
   - Runs health checks
6. Manual Nginx configuration
7. Deployment complete
8. Application live
```

### Scenario 4: Update with Database Migration

```
1. Developer adds new Prisma migration
2. Run: ./deploy-update.sh
3. Script performs:
   - Creates database backup
   - Creates application backup
   - Runs migrations
   - Cleans cache
   - Builds application
   - Reloads PM2
   - Runs health checks
4. Health checks pass
5. Deployment complete
6. Database and application updated
```

## Monitoring and Observability

### Deployment Metrics

**Track:**
- Deployment frequency
- Deployment success rate
- Average deployment time
- Rollback frequency
- Time to rollback

### Application Metrics

**Monitor:**
- Response times
- Error rates
- Memory usage
- CPU usage
- Active connections

### Alerting

**Alert On:**
- Deployment failure
- Rollback triggered
- Health check failure
- High error rate post-deployment
- Memory/CPU threshold exceeded

### Logging

**Log Levels:**
- INFO: Normal operations
- WARN: Non-critical issues
- ERROR: Failures requiring attention
- DEBUG: Detailed troubleshooting info

## Migration Path

### Phase 1: Preparation
1. Create PM2 ecosystem config
2. Create deployment utility library
3. Create backup directory structure
4. Test scripts in development

### Phase 2: Test Environment
1. Deploy new scripts to test environment
2. Run integration tests
3. Verify zero-downtime works
4. Test rollback scenarios

### Phase 3: Production Deployment
1. Create backup of current production
2. Deploy new deployment scripts
3. Update documentation
4. Train team on new process

### Phase 4: Monitoring
1. Monitor first few deployments closely
2. Collect metrics
3. Tune configuration based on results
4. Document lessons learned
