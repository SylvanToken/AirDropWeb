# Fraud Detection System Documentation

## Overview

The Sylvan Token Airdrop Platform includes a comprehensive hybrid anti-fraud detection system that combines automatic risk analysis with manual review capabilities. This system helps prevent abuse, bot activity, and fraudulent task completions while maintaining a smooth user experience for legitimate users.

## System Architecture

### Three-Tier Verification System

1. **Low Risk (Score < 20)**: Auto-approved immediately
2. **Medium Risk (Score 20-50)**: Auto-approved after 1-24 hours
3. **High Risk (Score > 50)**: Manual review required

### Components

- **Fraud Detection Engine** (`lib/fraud-detection.ts`)
- **Completion API** (`app/api/completions/route.ts`)
- **Admin Verification API** (`app/api/admin/verifications/route.ts`)
- **Admin Dashboard** (`components/admin/VerificationDashboard.tsx`)
- **Auto-Approval Cron Job** (`app/api/cron/auto-approve/route.ts`)

## Fraud Detection Indicators

### 1. Completion Time Analysis
- **Trigger**: Task completed in less than 30 seconds
- **Risk Score**: +25 points
- **Rationale**: Legitimate users need time to read and complete tasks

### 2. Account Age
- **New Account** (< 24 hours): +20 points
- **Recent Account** (< 72 hours): +10 points
- **Rationale**: New accounts are more likely to be created for abuse

### 3. Verification Status
- **No Wallet Verification**: +15 points
- **No Social Media Verification**: +10 points
- **Rationale**: Verified accounts are more trustworthy

### 4. Daily Completion Rate
- **Excessive** (> 50 completions/day): +30 points + Manual Review
- **High** (> 20 completions/day): +15 points
- **Rationale**: Abnormally high activity suggests bot behavior

### 5. IP Address Patterns
- **Multiple IPs** (> 5 different IPs in last 10 completions): +20 points
- **Shared IP** (> 3 accounts from same IP in 24h): +25 points + Manual Review
- **Rationale**: IP switching or sharing indicates coordinated abuse

### 6. Completion Pattern Analysis
- **Regular Intervals**: +20 points
- **Rationale**: Bot-like behavior shows very consistent timing

### 7. Random Review Selection
- **20% of all completions** are randomly flagged for manual review
- **Rationale**: Quality control and deterrent effect

## User Experience

### Completion Status Flow

```
User Completes Task
        ↓
Fraud Analysis (0-100 score)
        ↓
    ┌───────┴───────┐
    ↓               ↓
Low Risk        High Risk
(< 20)          (≥ 50)
    ↓               ↓
Instant         Manual
Approval        Review
    ↓               ↓
Points          Pending
Awarded         Status
```

### User-Facing Messages

**Low Risk (Instant Approval)**:
```
"Task completed successfully"
Points awarded immediately
```

**Medium Risk (Delayed Approval)**:
```
"Task completed. Points will be awarded after verification period."
Estimated approval time: [timestamp]
```

**High Risk (Manual Review)**:
```
"Task submitted for review. Points will be awarded after verification."
Status: Under Review
```

**Rejected**:
```
"This task completion was rejected during review. No points were awarded."
```

## Admin Dashboard

### Access
Navigate to `/admin/verifications` in the admin panel.

### Features

#### Tabs
- **Pending**: All completions awaiting approval
- **Needs Review**: High-risk completions requiring manual review
- **Approved**: Approved completions
- **Rejected**: Rejected completions

#### Completion Card Information
- **User Details**:
  - Username, email, total points
  - Account age
  - Verification status (wallet, Twitter, Telegram)
  
- **Task Details**:
  - Task title, description, type
  - Points value
  - Completion time
  - IP address
  - Task URL (clickable)

- **Fraud Analysis**:
  - Risk score (0-100)
  - Risk level (LOW, MEDIUM, HIGH, CRITICAL)
  - Risk description

#### Actions
- **Approve**: Award points and mark as verified
- **Reject**: Deny points with optional reason

### Filtering & Pagination
- Filter by status (Pending, Approved, Rejected)
- Filter by review requirement
- 20 completions per page
- Real-time count display

## Auto-Approval System

### Cron Job Setup

#### Vercel (Recommended)
The `vercel.json` file is already configured:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-approve",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### Manual Cron (Linux/Unix)
```bash
# Add to crontab (crontab -e)
0 * * * * curl -X POST https://your-domain.com/api/cron/auto-approve \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### GitHub Actions
```yaml
name: Auto-Approve Completions
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  auto-approve:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Auto-Approval
        run: |
          curl -X POST https://your-domain.com/api/cron/auto-approve \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Environment Variables
Add to `.env`:
```bash
CRON_SECRET="your-secure-random-string-here"
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

### POST /api/completions
Complete a task with fraud detection.

**Request**:
```json
{
  "taskId": "task_id_here",
  "completionTime": 45  // Optional: seconds taken
}
```

**Response**:
```json
{
  "message": "Task completed successfully",
  "completion": {
    "id": "completion_id",
    "status": "PENDING",
    "fraudAnalysis": {
      "score": 15,
      "needsReview": false,
      "flags": ["NEW_ACCOUNT"]
    }
  },
  "pointsEarned": 10,
  "estimatedApprovalTime": "2025-11-09T14:00:00Z"
}
```

### GET /api/admin/verifications
Get completions for review (Admin only).

**Query Parameters**:
- `status`: PENDING | APPROVED | REJECTED | ALL
- `needsReview`: true | false
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response**:
```json
{
  "completions": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### POST /api/admin/verifications
Approve or reject a completion (Admin only).

**Request**:
```json
{
  "completionId": "completion_id",
  "action": "approve",  // or "reject"
  "reason": "Optional rejection reason"
}
```

### POST /api/cron/auto-approve
Auto-approve pending completions (Cron job).

**Headers**:
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response**:
```json
{
  "success": true,
  "message": "Auto-approved 12 completions",
  "approvedCount": 12
}
```

## Database Schema

### Completion Model
```prisma
model Completion {
  id                 String    @id @default(cuid())
  userId             String
  taskId             String
  completedAt        DateTime  @default(now())
  pointsAwarded      Int       @default(0)
  
  // Verification fields
  status             String    @default("PENDING")
  verificationStatus String    @default("UNVERIFIED")
  needsReview        Boolean   @default(false)
  reviewedBy         String?
  reviewedAt         DateTime?
  fraudScore         Int       @default(0)
  autoApproveAt      DateTime?
  rejectionReason    String?
  completionTime     Int?
  ipAddress          String?
  userAgent          String?
  
  user               User      @relation(...)
  task               Task      @relation(...)
}
```

## Best Practices

### For Administrators

1. **Daily Review**: Check the verification dashboard daily
2. **Pattern Recognition**: Look for patterns in flagged completions
3. **Fair Judgment**: Consider context before rejecting
4. **Documentation**: Always provide rejection reasons
5. **Monitor Trends**: Track fraud score distributions

### For Developers

1. **Adjust Thresholds**: Tune fraud score thresholds based on your needs
2. **Add Indicators**: Extend fraud detection with custom indicators
3. **Monitor Performance**: Track auto-approval rates
4. **Log Analysis**: Review fraud detection logs regularly
5. **User Feedback**: Collect feedback on false positives

### Security Considerations

1. **Secure Cron Secret**: Use strong, random secrets
2. **Rate Limiting**: Implement rate limits on completion endpoints
3. **IP Logging**: Store IP addresses for forensic analysis
4. **Audit Trail**: Maintain logs of all admin actions
5. **Regular Updates**: Keep fraud detection rules updated

## Troubleshooting

### High False Positive Rate
- Lower fraud score thresholds
- Reduce random review percentage
- Adjust specific indicator weights

### High False Negative Rate
- Increase fraud score thresholds
- Add more fraud indicators
- Increase random review percentage

### Auto-Approval Not Working
- Check cron job is running
- Verify CRON_SECRET is set
- Check server logs for errors
- Ensure database connectivity

### Performance Issues
- Add database indexes
- Implement caching for user data
- Optimize fraud detection queries
- Consider async processing

## Future Enhancements

- Machine learning-based fraud detection
- Behavioral analysis over time
- Device fingerprinting
- Social graph analysis
- Reputation scoring system
- Automated ban system for repeat offenders
- Real-time fraud alerts
- Advanced analytics dashboard

## Support

For issues or questions:
1. Check server logs
2. Review database records
3. Test with different user scenarios
4. Contact development team

---

**Last Updated**: November 9, 2025
**Version**: 1.0.0
