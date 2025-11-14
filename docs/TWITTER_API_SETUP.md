# Twitter API Setup Guide

This guide will walk you through setting up Twitter OAuth 2.0 for the Twitter Task Automation feature.

## Prerequisites

- A Twitter Developer Account
- Access to Twitter Developer Portal
- A registered application on Twitter

## Step 1: Create Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Apply for a developer account if you haven't already
4. Complete the application form with your use case

## Step 2: Create a New App

1. Navigate to the [Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Click on "Projects & Apps" in the sidebar
3. Click "Create App" or "New App"
4. Fill in the required information:
   - **App name**: Your application name (e.g., "Sylvan Token Tasks")
   - **Description**: Brief description of your app
   - **Website URL**: Your application URL

## Step 3: Configure OAuth 2.0 Settings

1. In your app settings, navigate to "User authentication settings"
2. Click "Set up" to configure OAuth 2.0
3. Configure the following settings:

### App Permissions
Select the following permissions:
- ✅ **Read** - Required to verify follows, likes, and retweets
- ✅ **Write** - Optional, but recommended for future features

### Type of App
- Select: **Web App, Automated App or Bot**

### App Info
- **Callback URI / Redirect URL**: 
  ```
  https://yourdomain.com/api/auth/twitter/callback
  ```
  For local development:
  ```
  http://localhost:3000/api/auth/twitter/callback
  ```

- **Website URL**: Your application's homepage
- **Terms of Service URL**: (Optional)
- **Privacy Policy URL**: (Optional)

4. Click "Save" to apply the settings

## Step 4: Get Your API Credentials

1. Navigate to "Keys and tokens" tab
2. You'll need the following credentials:
   - **API Key** (also called Client ID)
   - **API Key Secret** (also called Client Secret)
3. Click "Regenerate" if you need new credentials
4. **Important**: Save these credentials securely - you won't be able to see the secret again!

## Step 5: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Twitter OAuth 2.0 Configuration
TWITTER_CLIENT_ID=your_api_key_here
TWITTER_CLIENT_SECRET=your_api_key_secret_here
TWITTER_CALLBACK_URL=https://yourdomain.com/api/auth/twitter/callback

# Token Encryption Key (generate a secure random string)
TWITTER_TOKEN_ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### Generating Encryption Key

Generate a secure 32-character encryption key:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Step 6: Verify API Access Level

Ensure your app has the correct access level:

1. Go to your app settings
2. Check "App permissions" section
3. Required scopes for our features:
   - `tweet.read` - Read tweets
   - `users.read` - Read user information
   - `follows.read` - Check if user follows an account
   - `like.read` - Check if user liked a tweet

## Step 7: Test Your Configuration

1. Start your application
2. Navigate to the profile page
3. Click "Connect Twitter"
4. You should be redirected to Twitter's authorization page
5. After authorizing, you should be redirected back to your app

## Troubleshooting

### "Invalid callback URL" Error
- Ensure the callback URL in your Twitter app settings exactly matches the one in your `.env` file
- Include the protocol (http:// or https://)
- For production, use HTTPS

### "App not authorized" Error
- Check that your app has the correct permissions enabled
- Verify that OAuth 2.0 is properly configured
- Ensure your API keys are correct

### Token Encryption Errors
- Verify that `TWITTER_TOKEN_ENCRYPTION_KEY` is exactly 32 characters (64 hex characters)
- Ensure the key is the same across all deployments

### Rate Limiting
- Twitter API has rate limits per endpoint
- Our implementation includes automatic rate limit handling
- Monitor your API usage in the Twitter Developer Portal

## Production Deployment

### Security Checklist
- ✅ Use HTTPS for all callbacks
- ✅ Store API credentials securely (use environment variables)
- ✅ Never commit credentials to version control
- ✅ Use a strong encryption key for token storage
- ✅ Regularly rotate API credentials
- ✅ Monitor API usage and rate limits

### Callback URL Configuration
For production, update your Twitter app settings:
```
https://yourdomain.com/api/auth/twitter/callback
```

And update your `.env`:
```env
TWITTER_CALLBACK_URL=https://yourdomain.com/api/auth/twitter/callback
```

## API Rate Limits

Twitter API v2 rate limits (per 15-minute window):

| Endpoint | Rate Limit |
|----------|------------|
| User Lookup | 300 requests |
| Following Check | 15 requests |
| Liked Tweets | 75 requests |
| Retweeted By | 75 requests |

Our implementation includes:
- Automatic rate limit detection
- Exponential backoff retry logic
- Request queuing when rate limited

## Support

For Twitter API issues:
- [Twitter Developer Documentation](https://developer.twitter.com/en/docs)
- [Twitter Developer Community](https://twittercommunity.com/)
- [Twitter API Status](https://api.twitterstat.us/)

For application-specific issues:
- Check the verification logs in the admin panel
- Review server logs for detailed error messages
- Contact your development team

## Next Steps

After completing the setup:
1. Test the Twitter connection flow
2. Create test Twitter tasks
3. Verify automatic verification works
4. Monitor the admin analytics dashboard
5. Review verification logs regularly

---

**Last Updated**: November 13, 2025  
**Version**: 1.0
