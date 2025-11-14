# Security Measures

This document outlines the security measures implemented in the Sylvan Token Airdrop Platform.

## Authentication & Authorization

### Password Security
- **Minimum Length**: 8 characters required
- **Complexity Requirements**: 
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Hashing**: bcrypt with 12 salt rounds
- **Storage**: Only hashed passwords stored in database

### Session Management
- **Strategy**: JWT-based sessions via NextAuth.js
- **Duration**: 7 days (configurable)
- **Cookie Security**:
  - HTTP-only cookies (prevents XSS attacks)
  - Secure flag in production (HTTPS only)
  - SameSite=lax (CSRF protection)
  - Secure cookie naming in production (`__Secure-` and `__Host-` prefixes)

### CSRF Protection
- Built-in CSRF token validation via NextAuth.js
- CSRF tokens stored in HTTP-only cookies
- Automatic validation on all authentication requests

## Rate Limiting

### Authentication Endpoints
- **Limit**: 5 attempts per 15 minutes
- **Scope**: Per IP address
- **Endpoints**: `/api/auth/register`, login attempts

### Task Completion
- **Limit**: 10 requests per minute
- **Scope**: Per user + IP combination
- **Endpoint**: `/api/completions`

### General API
- **Limit**: 30 requests per minute
- **Scope**: Per IP address
- **Endpoints**: All other API routes

### Implementation
- In-memory rate limiting store
- Automatic cleanup of expired entries
- Returns 429 status with Retry-After header

## Input Validation & Sanitization

### Validation
- **Library**: Zod for schema validation
- **Scope**: All API endpoints
- **Coverage**: Email, username, password, task data

### Sanitization
All user inputs are sanitized to prevent injection attacks:

- **String Sanitization**: Removes null bytes and control characters
- **HTML Escaping**: Prevents XSS attacks
- **URL Validation**: Blocks dangerous protocols (javascript:, data:, etc.)
- **Email Normalization**: Lowercase and trimmed
- **Username Filtering**: Only alphanumeric and underscores allowed

### Applied To
- User registration (email, username, password)
- User login (email, password)
- Task creation/update (title, description, URL)
- Task completion (task ID)

## Role-Based Access Control

### User Roles
- **USER**: Standard user with task completion access
- **ADMIN**: Full access to admin panel and management features

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires ADMIN role
- `/api/admin/*` - Requires ADMIN role

### Middleware Protection
- Automatic route protection via Next.js middleware
- JWT token verification on protected routes
- Role verification for admin routes
- Redirect to login for unauthorized access

## Database Security

### Connection Security
- Connection string stored in environment variables
- Connection pooling via Prisma
- Prepared statements (SQL injection prevention)

### Data Integrity
- Unique constraints on email and username
- Foreign key relationships enforced
- Transaction support for atomic operations
- Automatic timestamp tracking

## Production Configuration

### Environment Variables
Required for production:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<strong-random-secret>
NODE_ENV=production
```

### Security Headers
Configured in `next.config.js`:
- `poweredByHeader: false` - Hides Next.js version
- `compress: true` - Enables gzip compression
- `swcMinify: true` - Code minification
- Console logs removed in production

### Cookie Configuration
Production cookies use:
- `__Secure-` prefix for session tokens
- `__Host-` prefix for CSRF tokens
- `secure: true` flag (HTTPS only)
- `httpOnly: true` (JavaScript access blocked)
- `sameSite: 'lax'` (CSRF protection)

## Security Best Practices

### For Developers
1. Never commit `.env` files
2. Use environment variables for secrets
3. Keep dependencies updated
4. Review security advisories regularly
5. Use TypeScript strict mode
6. Validate all user inputs
7. Sanitize all outputs
8. Use parameterized queries (Prisma handles this)

### For Administrators
1. Use strong admin passwords (16+ characters)
2. Change default admin credentials immediately
3. Enable HTTPS in production
4. Monitor rate limit violations
5. Review user activity logs
6. Keep database backups
7. Restrict database access
8. Use firewall rules

### For Users
1. Use unique, strong passwords
2. Don't share credentials
3. Log out after use on shared devices
4. Report suspicious activity

## Monitoring & Logging

### What's Logged
- Authentication attempts (success/failure)
- Rate limit violations
- API errors with stack traces
- Admin actions
- Database errors

### What's NOT Logged
- Passwords (plain or hashed)
- Session tokens
- Personal identifiable information (PII)

## Known Limitations

### Rate Limiting
- In-memory store (resets on server restart)
- Not distributed (single server only)
- Consider Redis for production scaling

### CSRF Protection
- Relies on NextAuth.js implementation
- Custom endpoints should validate CSRF tokens manually

### Input Sanitization
- Basic sanitization implemented
- Consider additional libraries for complex use cases
- HTML content not supported (by design)

## Reporting Security Issues

If you discover a security vulnerability, please email: security@sylvantoken.org

**Do not** create public GitHub issues for security vulnerabilities.

## Security Checklist

Before deploying to production:

- [ ] Change all default credentials
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Review and restrict database access
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Test rate limiting
- [ ] Verify cookie security settings
- [ ] Remove development/debug code
- [ ] Update all dependencies
- [ ] Review security headers
- [ ] Test authentication flows
- [ ] Verify role-based access control
- [ ] Monitor logs for anomalies

## Updates

This security documentation should be reviewed and updated:
- When new features are added
- When dependencies are updated
- After security audits
- Quarterly at minimum

Last Updated: 2024
