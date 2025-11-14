# Twitter Feature Environment Variables

This document describes all environment variables required for the Twitter Task Automation feature.

## Required Variables

### Twitter OAuth 2.0 Credentials

```env
# Twitter API Client ID (API Key)
TWITTER_CLIENT_ID=your_twitter_client_id

# Twitter API Client Secret (API Key Secret)
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# OAuth Callback URL
TWITTER_CALLBACK_URL=https://yourdomain.com/api/auth/twitter/callback
```

**How to obtain:**
1. Create an app in [Twitter Developer Portal](https://developer.twitter.com/)
2. Navigate to "Keys and tokens"
3. Copy the API Key (Client ID) and API Key Secret (Client Secret)

### Token Encryption

```env
# 32-byte encryption key for storing Twitter tokens securely
TWITTER_TOKEN_ENCRYPTION_KEY=your_64_character_hex_string
```

**How to generate:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Important:**
- Must be exactly 64 hexadecimal characters (32 bytes)
- Keep this key secret and secure
- Use the same key across all deployments
- Changing this key will invalidate all existing Twitter connections

## Optional Variables

### Rate Limiting Configuration

```env
# Maximum requests per 15-minute window (default: 15)
TWITTER_RATE_LIMIT_MAX=15

# Rate limit window in milliseconds (default: 900000 = 15 minutes)
TWITTER_RATE_LIMIT_WINDOW=900000
```

### Verification Settings

```env
# Enable automatic verification on task completion (default: true)
TWITTER_AUTO_VERIFY=true

# Verification timeout in milliseconds (default: 30000 = 30 seconds)
TWITTER_VERIFICATION_TIMEOUT=30000

# Maximum retry attempts for failed verifications (default: 3)
TWITTER_MAX_RETRY_ATTEMPTS=3
```

### Caching Configuration

```env
# Cache TTL for verification results in seconds (default: 60)
TWITTER_CACHE_TTL=60

# Cache TTL for user lookups in seconds (default: 300)
TWITTER_USER_CACHE_TTL=300
```

## Example .env File

```env
# ============================================
# Twitter Task Automation Configuration
# ============================================

# Twitter OAuth 2.0 Credentials
TWITTER_CLIENT_ID=abc123xyz789
TWITTER_CLIENT_SECRET=secret_key_here_very_long_string
TWITTER_CALLBACK_URL=https://yourdomain.com/api/auth/twitter/callback

# Token Encryption (REQUIRED - Generate with: openssl rand -hex 32)
TWITTER_TOKEN_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Optional: Rate Limiting
TWITTER_RATE_LIMIT_MAX=15
TWITTER_RATE_LIMIT_WINDOW=900000

# Optional: Verification Settings
TWITTER_AUTO_VERIFY=true
TWITTER_VERIFICATION_TIMEOUT=30000
TWITTER_MAX_RETRY_ATTEMPTS=3

# Optional: Caching
TWITTER_CACHE_TTL=60
TWITTER_USER_CACHE_TTL=300
```

## Environment-Specific Configuration

### Development

```env
TWITTER_CLIENT_ID=dev_client_id
TWITTER_CLIENT_SECRET=dev_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/twitter/callback
TWITTER_TOKEN_ENCRYPTION_KEY=dev_encryption_key_32_bytes_hex
```

### Staging

```env
TWITTER_CLIENT_ID=staging_client_id
TWITTER_CLIENT_SECRET=staging_client_secret
TWITTER_CALLBACK_URL=https://staging.yourdomain.com/api/auth/twitter/callback
TWITTER_TOKEN_ENCRYPTION_KEY=staging_encryption_key_32_bytes_hex
```

### Production

```env
TWITTER_CLIENT_ID=prod_client_id
TWITTER_CLIENT_SECRET=prod_client_secret
TWITTER_CALLBACK_URL=https://yourdomain.com/api/auth/twitter/callback
TWITTER_TOKEN_ENCRYPTION_KEY=prod_encryption_key_32_bytes_hex
```

## Security Best Practices

1. **Never commit `.env` files to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Use different credentials per environment**
   - Separate Twitter apps for dev/staging/prod
   - Different encryption keys per environment

3. **Rotate credentials regularly**
   - Change API keys every 90 days
   - Update encryption keys annually
   - Notify users to reconnect after key rotation

4. **Secure storage**
   - Use secret management services (AWS Secrets Manager, Azure Key Vault, etc.)
   - Encrypt environment variables in CI/CD pipelines
   - Limit access to production credentials

5. **Monitor usage**
   - Track API usage in Twitter Developer Portal
   - Set up alerts for unusual activity
   - Review verification logs regularly

## Validation

To verify your environment variables are correctly configured:

```bash
# Check if all required variables are set
npm run check-env

# Test Twitter API connection
npm run test:twitter-connection
```

## Troubleshooting

### "Missing TWITTER_CLIENT_ID" Error
- Ensure the variable is set in your `.env` file
- Restart your application after adding variables
- Check for typos in variable names

### "Invalid encryption key" Error
- Verify the key is exactly 64 hexadecimal characters
- Regenerate the key if corrupted
- Ensure no extra spaces or newlines

### "Callback URL mismatch" Error
- Ensure `TWITTER_CALLBACK_URL` matches the URL in Twitter app settings
- Include the protocol (http:// or https://)
- Check for trailing slashes

## Migration Guide

If you need to change the encryption key:

1. **Backup existing connections**
   ```sql
   SELECT * FROM TwitterConnection;
   ```

2. **Notify users**
   - Send email notification
   - Display banner in app

3. **Update encryption key**
   ```env
   TWITTER_TOKEN_ENCRYPTION_KEY=new_key_here
   ```

4. **Clear existing connections**
   ```sql
   DELETE FROM TwitterConnection;
   ```

5. **Users reconnect**
   - Users will need to reconnect their Twitter accounts
   - Automatic verification will resume after reconnection

---

**Last Updated**: November 13, 2025  
**Version**: 1.0
