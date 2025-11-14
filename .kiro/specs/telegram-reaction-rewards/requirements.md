# Telegram Reaction Rewards - Requirements

## Overview

Kullanıcıların Telegram grubundaki postlara verdikleri tepkiler (reactions) için otomatik puan kazanma sistemi. Her gece saat 23:00'te SylvusBot ile teyit edilir ve manipülasyon önlenir.

## Glossary

- **System**: Telegram Reaction Rewards System
- **SylvusBot**: Telegram bot that monitors reactions
- **User**: Registered platform user with referral code
- **Reaction**: Emoji reaction to a Telegram post
- **Post**: Message in Telegram group/channel
- **Daily Verification**: Nightly check at 23:00
- **Manipulation**: Adding/removing reactions repeatedly to gain points

## Requirements

### Requirement 1: Reaction Tracking

**User Story:** As a user, I want to earn points for reacting to Telegram posts, so that I can be rewarded for engagement.

#### Acceptance Criteria

1. WHEN a registered user reacts to a Telegram post, THE System SHALL record the reaction with user ID, post ID, and reaction type
2. WHEN a user adds a reaction, THE System SHALL award 20 points to the user
3. WHEN a user removes a reaction, THE System SHALL deduct 20 points from the user
4. WHEN a user reacts to the same post multiple times, THE System SHALL track each unique reaction separately
5. THE System SHALL store reaction timestamp for audit purposes

### Requirement 2: User Identification

**User Story:** As the system, I need to identify users by their referral code, so that I can match Telegram users with platform accounts.

#### Acceptance Criteria

1. THE System SHALL identify users by their registered referral code
2. WHEN a Telegram user is not found in the database, THE System SHALL skip point award
3. THE System SHALL log unmatched Telegram users for admin review
4. THE System SHALL match Telegram username or user ID with platform account
5. THE System SHALL handle case-insensitive referral code matching

### Requirement 3: Nightly Verification

**User Story:** As an admin, I want the system to verify reactions daily, so that manipulation is prevented.

#### Acceptance Criteria

1. THE System SHALL run verification process every night at 23:00 UTC
2. WHEN verification runs, THE System SHALL check all reactions from the past 24 hours
3. THE System SHALL compare stored reactions with actual Telegram reactions
4. WHEN a reaction is removed, THE System SHALL deduct previously awarded points
5. THE System SHALL create audit log for all point adjustments

### Requirement 4: Manipulation Prevention

**User Story:** As an admin, I want to prevent users from gaming the system, so that points are fairly distributed.

#### Acceptance Criteria

1. WHEN a user adds and removes the same reaction multiple times, THE System SHALL detect manipulation
2. WHEN manipulation is detected (>3 add/remove cycles in 24h), THE System SHALL flag the user
3. THE System SHALL not award points for flagged manipulative behavior
4. THE System SHALL notify admins of detected manipulation attempts
5. THE System SHALL implement cooldown period (1 hour) between reaction changes

### Requirement 5: Point Reconciliation

**User Story:** As the system, I need to reconcile points accurately, so that user balances are correct.

#### Acceptance Criteria

1. WHEN verification detects removed reactions, THE System SHALL calculate point difference
2. THE System SHALL update user total points atomically
3. WHEN points are deducted, THE System SHALL not allow negative total points
4. THE System SHALL create point adjustment record with reason
5. THE System SHALL handle concurrent point updates safely

### Requirement 6: User Notification

**User Story:** As a user, I want to be notified of point changes, so that I understand my balance.

#### Acceptance Criteria

1. WHEN a user logs in, THE System SHALL check for pending notifications
2. WHEN points were awarded or deducted, THE System SHALL show popup notification
3. THE notification SHALL display: points change, reason, and new total
4. THE System SHALL show notification only once per login session
5. THE System SHALL allow user to dismiss notification

### Requirement 7: Post Tracking

**User Story:** As the system, I need to track which posts users reacted to, so that I can prevent duplicate rewards.

#### Acceptance Criteria

1. THE System SHALL store unique post identifier (message_id)
2. THE System SHALL track post creation date and time
3. THE System SHALL link reactions to specific posts
4. WHEN a post is deleted, THE System SHALL handle orphaned reactions
5. THE System SHALL archive old post data after 90 days

### Requirement 8: Reaction Types

**User Story:** As a user, I want all reaction types to be rewarded equally, so that I can express myself freely.

#### Acceptance Criteria

1. THE System SHALL accept all Telegram reaction emojis
2. THE System SHALL award 20 points per reaction regardless of emoji type
3. THE System SHALL track reaction emoji for analytics
4. THE System SHALL support custom emoji reactions
5. THE System SHALL handle reaction updates (changing emoji)

### Requirement 9: Admin Dashboard

**User Story:** As an admin, I want to monitor reaction activity, so that I can ensure system health.

#### Acceptance Criteria

1. THE System SHALL provide admin dashboard for reaction statistics
2. THE dashboard SHALL show: total reactions, points awarded, manipulation attempts
3. THE System SHALL display recent reaction activity
4. THE System SHALL show top active users
5. THE System SHALL provide export functionality for audit

### Requirement 10: Error Handling

**User Story:** As the system, I need to handle errors gracefully, so that the service remains reliable.

#### Acceptance Criteria

1. WHEN Telegram API is unavailable, THE System SHALL retry with exponential backoff
2. WHEN verification fails, THE System SHALL log error and continue
3. THE System SHALL not award points if verification cannot be completed
4. WHEN database is unavailable, THE System SHALL queue operations
5. THE System SHALL send alerts to admins for critical failures

### Requirement 11: Performance

**User Story:** As the system, I need to process reactions efficiently, so that users experience no delays.

#### Acceptance Criteria

1. THE System SHALL process reaction events within 5 seconds
2. THE nightly verification SHALL complete within 30 minutes
3. THE System SHALL handle 1000+ reactions per day
4. THE System SHALL use database indexes for fast queries
5. THE System SHALL cache frequently accessed data

### Requirement 12: Security

**User Story:** As an admin, I want the system to be secure, so that points cannot be fraudulently obtained.

#### Acceptance Criteria

1. THE System SHALL validate all Telegram webhook signatures
2. THE System SHALL use secure API tokens
3. THE System SHALL encrypt sensitive user data
4. THE System SHALL implement rate limiting on API endpoints
5. THE System SHALL log all point adjustments for audit

---

**Version**: 1.0  
**Date**: November 13, 2025  
**Status**: Draft
