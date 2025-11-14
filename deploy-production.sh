#!/bin/bash

# Sylvan Token - Production Deployment Script
# Bu script uygulamayı ana dizinde (/) production'a alır

set -e  # Hata durumunda dur

# Source deployment utility library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/lib/deployment-utils.sh" ]; then
    source "$SCRIPT_DIR/lib/deployment-utils.sh"
else
    echo "ERROR: deployment-utils.sh not found!"
    exit 1
fi

# Start deployment logging
DEPLOYMENT_TYPE="production-initial"
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

log_info "🚀 Sylvan Token Production Deployment Starting..."
log_info "================================================"
log_info "Deployment Type: $DEPLOYMENT_TYPE"
log_info "Git Commit: $GIT_COMMIT"
log_info "Version: $VERSION"
log_info "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
log_info "================================================"

# Onay al
log_step "User Confirmation"
echo ""
echo "⚠️  WARNING: This will deploy the application to production!"
echo "   - Countdown index.html will be removed"
echo "   - Application will run at root path (/)"
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Deployment cancelled by user"
    exit 1
fi
log_success "User confirmed deployment"

# 1. Pre-deployment validation
log_step "Pre-deployment Validation"

# Validate environment
log_info "Validating environment..."
validate_env || {
    log_error "Environment validation failed"
    exit 1
}

# Validate configuration
log_info "Validating configuration..."
validate_config || {
    log_error "Configuration validation failed"
    exit 1
}

# Validate dependencies
log_info "Validating dependencies..."
validate_dependencies || {
    log_error "Dependencies validation failed"
    exit 1
}

# Restore production configuration
log_info "Activating production configuration..."
if [ -f "next.config.js.backup" ]; then
    cp next.config.js.backup next.config.js
    log_success "Restored from backup"
else
    # Restore from git
    git checkout next.config.js 2>/dev/null || log_error "Could not restore from git, manual check required"
fi

# Verify basePath and assetPrefix are not present
if grep -q "basePath" next.config.js; then
    log_error "next.config.js still contains basePath!"
    log_error "Please remove basePath and assetPrefix from next.config.js"
    exit 1
fi
log_success "Production configuration ready"

# 2. Create initial backup
log_step "Creating Initial Backup"
BACKUP_DIR=$(create_backup)
if [ $? -eq 0 ]; then
    log_success "Backup created at: $BACKUP_DIR"
else
    log_error "Failed to create backup"
    exit 1
fi

# 3. Install dependencies
log_step "Installing Dependencies"
npm ci
if [ $? -eq 0 ]; then
    log_success "Dependencies installed"
else
    log_error "Failed to install dependencies"
    exit 1
fi

# 4. Database migration
log_step "Running Database Migrations"
if run_migrations_safe "production" "false" "false"; then
    log_success "Database migrations completed"
else
    log_error "Database migrations failed"
    exit 1
fi

# 5. Build application
log_step "Building Application"
NODE_ENV=production npm run build
if [ $? -eq 0 ]; then
    log_success "Build successful"
    
    # Verify build artifacts
    if [ ! -d ".next" ]; then
        log_error "Build artifacts not found (.next directory missing)"
        exit 1
    fi
    log_success "Build artifacts verified"
else
    log_error "Build failed"
    exit 1
fi

# 6. Backup countdown
log_step "Backing Up Countdown"
if [ -d "/var/www/countdown" ]; then
    COUNTDOWN_BACKUP="/var/www/countdown_backup_$(date +%Y%m%d_%H%M%S)"
    sudo cp -r /var/www/countdown "$COUNTDOWN_BACKUP"
    log_success "Countdown backed up to: $COUNTDOWN_BACKUP"
else
    log_info "No countdown directory found, skipping"
fi

# 7. Start PM2 with ecosystem config
log_step "Starting PM2 with Ecosystem Config"

# Check if ecosystem.config.js exists
if [ ! -f "ecosystem.config.js" ]; then
    log_error "ecosystem.config.js not found"
    exit 1
fi

# Start or restart with ecosystem config
if pm2 list | grep -q "sylvan-app"; then
    log_info "Application already running, restarting with ecosystem config..."
    pm2 delete sylvan-app
fi

log_info "Starting application with PM2 ecosystem config (2 instances)..."
pm2 start ecosystem.config.js --env production
if [ $? -eq 0 ]; then
    pm2 save
    log_success "PM2 started with ecosystem config (2 instances in cluster mode)"
else
    log_error "Failed to start PM2"
    exit 1
fi

# Wait for application to be ready
log_info "Waiting for application to be ready..."
sleep 10

# 8. Nginx configuration update
log_step "Nginx Configuration Update"
echo ""
log_info "⚠️  MANUAL ACTION REQUIRED:"
echo "Update Nginx configuration:"
echo "1. sudo nano /etc/nginx/sites-available/sylvan-token"
echo "2. Change /app locations to /"
echo "3. Remove countdown locations"
echo "4. sudo nginx -t"
echo "5. sudo systemctl reload nginx"
echo ""
read -p "Has Nginx update been completed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_error "Please update Nginx manually!"
else
    log_success "Nginx configuration confirmed"
fi

# 9. Health check
log_step "Running Health Checks"

# Use health-check.sh if available
if [ -f "$SCRIPT_DIR/scripts/health-check.sh" ]; then
    log_info "Running comprehensive health check..."
    bash "$SCRIPT_DIR/scripts/health-check.sh"
    HEALTH_STATUS=$?
    
    if [ $HEALTH_STATUS -eq 0 ]; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        log_error "Check logs: pm2 logs sylvan-app"
        exit 1
    fi
else
    # Fallback to simple health check
    log_info "Running basic health check..."
    sleep 5
    
    PORT=$(grep -oP 'PORT=\K\d+' .env.local 2>/dev/null || echo "3000")
    if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
        log_success "Application is healthy"
    else
        log_error "Health check failed"
        log_error "Check logs: pm2 logs sylvan-app"
        exit 1
    fi
fi

# 10. Deployment summary
log_step "Deployment Summary"

# Get PM2 status
PM2_STATUS=$(pm2_get_status "sylvan-app")
DEPLOYED_VERSION=$(pm2_get_version "sylvan-app")

echo ""
echo "================================================"
log_success "✅ PRODUCTION DEPLOYMENT COMPLETED!"
echo "================================================"
echo ""
echo "📊 Deployment Information:"
echo "-------------------"
echo "Deployment Type:  $DEPLOYMENT_TYPE"
echo "Version:          $VERSION"
echo "Git Commit:       $GIT_COMMIT"
echo "Deployed Version: $DEPLOYED_VERSION"
echo "Backup Location:  $BACKUP_DIR"
echo "Timestamp:        $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""
echo "📊 PM2 Status:"
echo "-------------------"
pm2 list | grep sylvan-app || pm2 list
echo ""
echo "🌐 Production URLs:"
echo "-------------------"
PORT=$(grep -oP 'PORT=\K\d+' .env.local 2>/dev/null || echo "3000")
DOMAIN=$(grep -oP 'NEXTAUTH_URL=\K[^/]+//\K[^/]+' .env.local 2>/dev/null || echo "yourdomain.com")
echo "Home:             http://$DOMAIN/"
echo "Login:            http://$DOMAIN/login"
echo "Dashboard:        http://$DOMAIN/dashboard"
echo "API Health:       http://$DOMAIN/api/health"
echo "Local:            http://localhost:$PORT/"
echo ""
echo "📝 Important Notes:"
echo "-------------------"
echo "✓ Countdown backed up"
echo "✓ Application running at root path"
echo "✓ /app path no longer used"
echo "✓ PM2 configured with 2 instances (cluster mode)"
echo "✓ Zero-downtime reload enabled"
echo ""
echo "🔍 Monitoring Commands:"
echo "-------------------"
echo "View logs:        pm2 logs sylvan-app"
echo "Monitor:          pm2 monit"
echo "Status:           pm2 status sylvan-app"
echo "Restart:          pm2 restart sylvan-app"
echo "Reload:           pm2 reload sylvan-app"
echo ""
echo "🔄 For Updates:"
echo "-------------------"
echo "Use:              ./deploy-update.sh"
echo ""
echo "================================================"
log_success "Deployment completed successfully at $(date)"
echo "================================================"
