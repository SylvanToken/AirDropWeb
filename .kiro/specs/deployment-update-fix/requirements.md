# Requirements Document

## Introduction

This document defines the requirements for a robust deployment and update system for the Sylvan Token application. The current deployment process works for initial deployments but fails during updates, causing downtime and requiring manual intervention. The system must support zero-downtime updates, proper cache management, health checks, and automatic rollback capabilities.

## Glossary

- **Deployment System**: The automated infrastructure and scripts that handle deploying the application to production and test environments
- **PM2**: Process manager for Node.js applications that keeps applications alive and manages restarts
- **Next.js Build Cache**: The `.next` directory containing compiled application code and cached assets
- **Zero-Downtime Deployment**: A deployment strategy where the application remains available during updates
- **Health Check**: An automated test that verifies the application is running correctly after deployment
- **Rollback**: The process of reverting to a previous working version when a deployment fails
- **Update Process**: The procedure for deploying new code changes to an already-running application
- **Build Artifacts**: Generated files from the build process including compiled code and static assets

## Requirements

### Requirement 1

**User Story:** As a developer, I want updates to deploy successfully without manual intervention, so that I can release new features quickly and reliably

#### Acceptance Criteria

1. WHEN the update script is executed, THE Deployment System SHALL clean all build artifacts before building
2. WHEN the update script is executed, THE Deployment System SHALL clear the Next.js Build Cache completely
3. WHEN the update script is executed, THE Deployment System SHALL clear node_modules cache directories
4. WHEN dependencies are updated, THE Deployment System SHALL use `npm ci` to ensure clean installation
5. WHEN the build completes successfully, THE Deployment System SHALL verify build artifacts exist before proceeding

### Requirement 2

**User Story:** As a system administrator, I want zero-downtime deployments, so that users experience no service interruption during updates

#### Acceptance Criteria

1. WHEN an update is deployed, THE Deployment System SHALL use PM2 reload instead of restart to maintain availability
2. WHEN PM2 reload is executed, THE Deployment System SHALL wait for the new process to be ready before terminating the old process
3. WHEN the new process fails to start, THE Deployment System SHALL keep the old process running
4. WHEN multiple instances are running, THE Deployment System SHALL reload them one at a time
5. THE Deployment System SHALL configure PM2 with at least 2 instances for production deployments

### Requirement 3

**User Story:** As a developer, I want automatic health checks after deployment, so that I know immediately if the update succeeded or failed

#### Acceptance Criteria

1. WHEN a deployment completes, THE Deployment System SHALL execute health checks within 10 seconds
2. WHEN health checks are executed, THE Deployment System SHALL test the API health endpoint
3. WHEN health checks are executed, THE Deployment System SHALL verify the application responds within 5 seconds
4. WHEN health checks fail, THE Deployment System SHALL report the failure with specific error details
5. WHEN health checks pass, THE Deployment System SHALL log success confirmation with timestamp

### Requirement 4

**User Story:** As a system administrator, I want automatic rollback on failed deployments, so that the application remains stable even when updates fail

#### Acceptance Criteria

1. WHEN health checks fail after deployment, THE Deployment System SHALL automatically initiate rollback
2. WHEN rollback is initiated, THE Deployment System SHALL restore the previous build artifacts
3. WHEN rollback is initiated, THE Deployment System SHALL restart PM2 with the previous version
4. WHEN rollback completes, THE Deployment System SHALL verify the previous version is running correctly
5. WHEN rollback fails, THE Deployment System SHALL alert administrators with detailed error information

### Requirement 5

**User Story:** As a developer, I want proper environment variable management, so that configuration changes are applied correctly during updates

#### Acceptance Criteria

1. WHEN an update is deployed, THE Deployment System SHALL reload environment variables from .env.local
2. WHEN PM2 processes are reloaded, THE Deployment System SHALL pass the --update-env flag
3. WHEN environment variables change, THE Deployment System SHALL verify critical variables are present
4. WHEN required environment variables are missing, THE Deployment System SHALL halt deployment with error message
5. THE Deployment System SHALL log which environment variables were updated during deployment

### Requirement 6

**User Story:** As a developer, I want database migrations to run safely during updates, so that schema changes are applied without data loss

#### Acceptance Criteria

1. WHEN an update includes migrations, THE Deployment System SHALL run migrations before building the application
2. WHEN migrations are executed, THE Deployment System SHALL use `prisma migrate deploy` for production
3. WHEN migrations fail, THE Deployment System SHALL halt deployment and report the error
4. WHEN migrations succeed, THE Deployment System SHALL log which migrations were applied
5. THE Deployment System SHALL create a database backup before running migrations in production

### Requirement 7

**User Story:** As a system administrator, I want comprehensive deployment logging, so that I can troubleshoot issues quickly

#### Acceptance Criteria

1. WHEN deployment starts, THE Deployment System SHALL log the deployment type, timestamp, and git commit hash
2. WHEN each deployment step executes, THE Deployment System SHALL log the step name and duration
3. WHEN errors occur, THE Deployment System SHALL log the full error message and stack trace
4. WHEN deployment completes, THE Deployment System SHALL create a deployment summary with all key metrics
5. THE Deployment System SHALL store deployment logs in a dedicated log directory with timestamps

### Requirement 8

**User Story:** As a developer, I want a PM2 ecosystem configuration, so that process management is consistent and reproducible

#### Acceptance Criteria

1. THE Deployment System SHALL use a PM2 ecosystem.config.js file for all process configuration
2. WHEN PM2 starts the application, THE Deployment System SHALL use the ecosystem configuration
3. THE PM2 ecosystem configuration SHALL define instance count, memory limits, and restart policies
4. THE PM2 ecosystem configuration SHALL specify environment-specific settings for production and test
5. THE PM2 ecosystem configuration SHALL enable automatic restart on file changes in development mode only

### Requirement 9

**User Story:** As a developer, I want separate update and initial deployment scripts, so that each scenario is handled optimally

#### Acceptance Criteria

1. THE Deployment System SHALL provide a deploy-update.sh script specifically for updates
2. WHEN deploy-update.sh is executed, THE Deployment System SHALL perform additional cache cleaning steps
3. WHEN deploy-update.sh is executed, THE Deployment System SHALL use PM2 reload instead of restart
4. WHEN deploy-production.sh is executed for initial deployment, THE Deployment System SHALL use PM2 start
5. THE Deployment System SHALL clearly document when to use each script

### Requirement 10

**User Story:** As a system administrator, I want deployment verification steps, so that I can confirm the deployment was successful

#### Acceptance Criteria

1. WHEN deployment completes, THE Deployment System SHALL display the current PM2 process status
2. WHEN deployment completes, THE Deployment System SHALL display the application version number
3. WHEN deployment completes, THE Deployment System SHALL display all accessible URLs
4. WHEN deployment completes, THE Deployment System SHALL provide commands for monitoring and troubleshooting
5. THE Deployment System SHALL verify that the deployed version matches the intended version
