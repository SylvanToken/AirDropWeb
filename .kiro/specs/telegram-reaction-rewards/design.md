# Telegram Reaction Rewards - Design Document

## Overview

Telegram Reaction Rewards sistemi, kullanıcıların Telegram grubundaki postlara verdikleri tepkiler için otomatik puan kazanmalarını sağlar. Sistem, SylvusBot aracılığıyla her gece saat 23:00'te tepkileri doğrular ve manipülasyonu önler.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Telegram Bot   │
│   (SylvusBot)   │
└────────┬────────┘
         │ Webhooks
         ▼
┌─────────────────────────────────────┐
│     Next.js API Routes              │
│  ┌──────────────────────────────┐  │
│  │ /api/telegram/webhook        │  │
│  │ /api/telegram/verify-reactions│ │
│  │ /api/cron/verify-reactions   │  │
│  └──────────────────────────────┘  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Reaction Service Layer            │
│  ┌──────────────────────────────┐  │
│  │ ReactionTracker              │  │
│  │ ManipulationDetector         │  │
│  │ PointReconciler              │  │
│  └──────────────────────────────┘  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        Database (PostgreSQL)        │
│  ┌──────────────────────────────┐  │
│  │ TelegramReaction             │  │
│  │ ReactionAuditLog             │  │
│  │ User (points update)         │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Component Interaction Flow

1. **Real-time Reaction Tracking:**
   - User reacts to Telegram post
   - Telegram sends webhook to `/api/telegram/webhook`
   - System records reaction and awards 20 points
   - User sees updated points immediately

2. **Nightly Verification (23:00 UTC):**
   - Cron job triggers `/api/cron/verify-reactions`
   - System fetches all reactions from last 24 hours
   - Compares with actual Telegram data via Bot API
   - Adjusts points for removed reactions
   - Creates audit logs

3. **Manipulation Detection:**
   - Tracks add/remove cycles per user per post
   - Flags users with >3 cycles in 24 hours
   - Implements 1-hour cooldown between changes
   - Notifies admins of suspicious activity

## Components and Interfaces

### 1. Database Models

#### TelegramReaction Model

```prisma
model TelegramReaction {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  telegramPostId String  // Telegram message_id
  telegramChatId String  // Telegram chat_id
  reactionEmoji  String  // Emoji used for reaction
  
  isActive      Boolean  @default(true)
  pointsAwarded Int      @default(20)
  
  addedAt       DateTime @default(now())
  removedAt     DateTime?
  verifiedAt    DateTime?
  
  // Manipulation tracking
  addRemoveCycles Int    @default(0)
  lastChangeAt    DateTime @default(now())
  isFlagged       Boolean  @default(false)
  
  @@index([userId])
  @@index([telegramPostId])
  @@index([isActive])
  @@index([verifiedAt])
  @@unique([userId, telegramPostId, reactionEmoji])
}
```

#### ReactionAuditLog Model

```prisma
model ReactionAuditLog {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  reactionId      String?
  reaction        TelegramReaction? @relation(fields: [reactionId], references: [id], onDelete: SetNull)
  
  action          String   // 'ADDED', 'REMOVED', 'VERIFIED', 'ADJUSTED', 'FLAGGED'
  pointsChange    Int      // Positive or negative
  previousPoints  Int
  newPoints       Int
  
  reason          String?  // Explanation for adjustment
  metadata        Json?    // Additional data
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@index([action])
}
```

### 2. Core Services

#### ReactionTracker Service

**Purpose:** Track reactions in real-time as they happen

**Interface:**
```typescript
interface ReactionTracker {
  // Record new reaction
  recordReaction(params: {
    userId: string;
    telegramPostId: string;
    telegramChatId: string;
    reactionEmoji: string;
  }): Promise<ReactionResult>;
  
  // Remove reaction
  removeReaction(params: {
    userId: string;
    telegramPostId: string;
    reactionEmoji: string;
  }): Promise<ReactionResult>;
  
  // Check if reaction exists
  hasReaction(userId: string, postId: string, emoji: string): Promise<boolean>;
}

interface ReactionResult {
  success: boolean;
  pointsAwarded: number;
  totalPoints: number;
  isFlagged: boolean;
  message: string;
}
```

**Key Logic:**
- Check for existing reaction (prevent duplicates)
- Check manipulation (add/remove cycles)
- Enforce cooldown period (1 hour)
- Award/deduct points atomically
- Create audit log entry

#### ManipulationDetector Service

**Purpose:** Detect and prevent gaming the system

**Interface:**
```typescript
interface ManipulationDetector {
  // Check if action is manipulative
  checkManipulation(params: {
    userId: string;
    postId: string;
    action: 'ADD' | 'REMOVE';
  }): Promise<ManipulationCheck>;
  
  // Flag user for review
  flagUser(userId: string, reason: string): Promise<void>;
  
  // Get user's manipulation score
  getManipulationScore(userId: string): Promise<number>;
}

interface ManipulationCheck {
  isManipulative: boolean;
  cycles: number;
  cooldownRemaining: number; // seconds
  shouldFlag: boolean;
  reason?: string;
}
```

**Detection Rules:**
1. Track add/remove cycles per user per post
2. Flag if >3 cycles in 24 hours
3. Enforce 1-hour cooldown between changes
4. Consider time patterns (rapid add/remove)
5. Check across multiple posts

#### PointReconciler Service

**Purpose:** Reconcile points during nightly verification

**Interface:**
```typescript
interface PointReconciler {
  // Verify all reactions from last 24 hours
  verifyReactions(timeRange: {
    from: Date;
    to: Date;
  }): Promise<ReconciliationResult>;
  
  // Adjust points for specific user
  adjustUserPoints(params: {
    userId: string;
    pointsChange: number;
    reason: string;
  }): Promise<void>;
  
  // Get reconciliation report
  getReconciliationReport(date: Date): Promise<ReconciliationReport>;
}

interface ReconciliationResult {
  totalChecked: number;
  adjustmentsMade: number;
  pointsAdded: number;
  pointsDeducted: number;
  flaggedUsers: string[];
  errors: string[];
}

interface ReconciliationReport {
  date: Date;
  totalReactions: number;
  activeReactions: number;
  removedReactions: number;
  pointsAwarded: number;
  pointsDeducted: number;
  manipulationAttempts: number;
}
```

**Reconciliation Logic:**
1. Fetch all reactions from last 24 hours
2. Query Telegram Bot API for actual reactions
3. Compare stored vs actual
4. Calculate point differences
5. Update user points atomically
6. Create audit logs
7. Handle errors gracefully

### 3. API Routes

#### POST /api/telegram/webhook

**Purpose:** Receive real-time updates from Telegram

**Request:**
```typescript
{
  update_id: number;
  message_reaction?: {
    chat: { id: number };
    message_id: number;
    user: { id: number; username?: string };
    date: number;
    old_reaction: Array<{ type: string; emoji?: string }>;
    new_reaction: Array<{ type: string; emoji?: string }>;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  pointsAwarded?: number;
  message: string;
}
```

**Logic:**
1. Verify webhook signature
2. Extract reaction data
3. Find user by Telegram username/ID
4. Check manipulation
5. Record reaction or removal
6. Award/deduct points
7. Return result

#### POST /api/cron/verify-reactions

**Purpose:** Nightly verification job (23:00 UTC)

**Authentication:** Vercel Cron Secret

**Response:**
```typescript
{
  success: boolean;
  result: ReconciliationResult;
}
```

**Logic:**
1. Verify cron secret
2. Get reactions from last 24 hours
3. Call PointReconciler.verifyReactions()
4. Send admin notification if errors
5. Return summary

#### GET /api/admin/reactions/stats

**Purpose:** Admin dashboard statistics

**Response:**
```typescript
{
  today: {
    totalReactions: number;
    pointsAwarded: number;
    manipulationAttempts: number;
  };
  week: { /* same structure */ };
  month: { /* same structure */ };
  topUsers: Array<{
    userId: string;
    username: string;
    reactionCount: number;
    pointsEarned: number;
  }>;
}
```

### 4. User Notification System

#### Notification Component

**Location:** `components/notifications/ReactionNotification.tsx`

**Display Logic:**
- Check on user login
- Show popup if pending notifications
- Display: points change, reason, new total
- Mark as shown after display
- Allow dismiss

**Notification Data:**
```typescript
interface ReactionNotification {
  id: string;
  userId: string;
  type: 'POINTS_ADDED' | 'POINTS_DEDUCTED' | 'FLAGGED';
  pointsChange: number;
  reason: string;
  newTotal: number;
  createdAt: Date;
  shown: boolean;
}
```

## Data Models

### User Model Extension

Add to existing User model:

```prisma
model User {
  // ... existing fields
  
  // Telegram integration
  telegramUserId    String?  @unique
  telegramUsername  String?
  
  // Reaction tracking
  reactions         TelegramReaction[]
  reactionAuditLogs ReactionAuditLog[]
  
  // Manipulation tracking
  isFlaggedForManipulation Boolean @default(false)
  flaggedAt                DateTime?
  flagReason               String?
}
```

## Error Handling

### Error Types

1. **Telegram API Errors**
   - Retry with exponential backoff (3 attempts)
   - Log error details
   - Continue processing other reactions
   - Alert admin if persistent

2. **Database Errors**
   - Use transactions for atomic operations
   - Rollback on failure
   - Queue failed operations for retry
   - Alert admin for critical failures

3. **Verification Errors**
   - Log error with context
   - Skip problematic reaction
   - Continue with others
   - Generate error report

4. **User Not Found**
   - Log unmatched Telegram user
   - Skip point award
   - Create admin notification
   - Suggest user linking

### Error Recovery

- **Webhook Failures:** Telegram will retry automatically
- **Cron Failures:** Manual trigger available for admins
- **Point Mismatches:** Admin can manually adjust
- **Database Locks:** Retry with backoff

## Testing Strategy

### Unit Tests

1. **ReactionTracker**
   - Test reaction recording
   - Test duplicate prevention
   - Test point calculation
   - Test manipulation detection

2. **ManipulationDetector**
   - Test cycle counting
   - Test cooldown enforcement
   - Test flagging logic
   - Test edge cases

3. **PointReconciler**
   - Test verification logic
   - Test point adjustment
   - Test atomic updates
   - Test error handling

### Integration Tests

1. **Webhook Flow**
   - Test end-to-end reaction flow
   - Test point award/deduction
   - Test audit log creation

2. **Verification Flow**
   - Test nightly verification
   - Test reconciliation
   - Test admin notifications

3. **Manipulation Detection**
   - Test flagging workflow
   - Test cooldown enforcement
   - Test admin alerts

### Performance Tests

- Test with 1000+ reactions per day
- Test concurrent webhook processing
- Test verification completion time (<30 min)
- Test database query performance

## Security Considerations

1. **Webhook Security**
   - Verify Telegram webhook signature
   - Use HTTPS only
   - Rate limit webhook endpoint
   - Log all webhook attempts

2. **Data Protection**
   - Encrypt sensitive Telegram data
   - Secure bot token storage
   - Implement access controls
   - Regular security audits

3. **Manipulation Prevention**
   - Multi-layer detection
   - Admin review for flagged users
   - Cooldown enforcement
   - Pattern analysis

4. **API Security**
   - Authenticate cron endpoints
   - Rate limit admin endpoints
   - Validate all inputs
   - Sanitize user data

## Performance Optimization

1. **Database Indexes**
   - Index on userId, telegramPostId
   - Index on isActive, verifiedAt
   - Composite indexes for common queries

2. **Caching**
   - Cache user Telegram mappings (5 min TTL)
   - Cache manipulation scores (1 min TTL)
   - Cache recent reactions (30 sec TTL)

3. **Batch Processing**
   - Process verifications in batches of 100
   - Use database transactions efficiently
   - Parallel processing where safe

4. **Query Optimization**
   - Use select specific fields
   - Limit result sets
   - Use pagination for large datasets
   - Optimize JOIN operations

## Monitoring and Alerts

### Metrics to Track

- Reactions per hour/day
- Points awarded/deducted
- Manipulation attempts
- Verification success rate
- API response times
- Error rates

### Alerts

- Critical: Verification failure
- High: Manipulation spike (>10 attempts/hour)
- Medium: Telegram API errors
- Low: Unmatched users

### Dashboards

1. **Admin Dashboard**
   - Real-time reaction stats
   - Top active users
   - Manipulation attempts
   - Recent audit logs

2. **System Health**
   - API uptime
   - Verification status
   - Error rates
   - Performance metrics

---

**Version:** 1.0  
**Date:** November 13, 2025  
**Status:** Ready for Implementation
