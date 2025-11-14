# Twitter Task Automation - Simulation & Testing Guide

Bu dokümanda Twitter entegrasyonunu simule etmek ve test etmek için adım adım senaryolar bulunmaktadır.

## 🎯 Simülasyon Amaçları

1. Twitter API'siz test yapabilmek
2. Tüm senaryoları kontrol etmek
3. Error handling'i test etmek
4. Performance'ı ölçmek
5. UI/UX akışını doğrulamak

## 📋 Test Senaryoları

### Senaryo 1: Yeni Kullanıcı Twitter Bağlantısı

**Adımlar:**

1. **Kullanıcı Profile Sayfasına Gider**
   ```
   URL: /profile
   Beklenen: Twitter Connection section görünür
   Status: "Not Connected"
   ```

2. **"Connect Twitter" Butonuna Tıklar**
   ```
   Action: Click "Connect Twitter"
   API Call: GET /api/auth/twitter/authorize
   Beklenen Response:
   {
     "authorizationUrl": "https://twitter.com/i/oauth2/authorize?..."
   }
   ```

3. **Twitter'a Yönlendirilir (Simulated)**
   ```
   Simulated Twitter OAuth Screen:
   - App name: "Sylvan Token Tasks"
   - Permissions: Read tweets, See accounts you follow
   - Buttons: [Authorize] [Cancel]
   ```

4. **Kullanıcı "Authorize" Tıklar**
   ```
   Redirect: /api/auth/twitter/callback?code=ABC123&state=XYZ789
   ```

5. **Callback İşlenir**
   ```
   API Call: GET /api/auth/twitter/callback
   Process:
   - Validate state
   - Exchange code for tokens
   - Encrypt tokens
   - Store in database
   - Redirect to /profile?twitter_connected=username
   ```

6. **Profile Sayfasında Success Mesajı**
   ```
   Toast: "Twitter Connected! Successfully connected @username"
   Status: "Connected"
   Display: @username, Twitter ID
   ```

**Beklenen Database Değişiklikleri:**

```sql
-- TwitterConnection table
INSERT INTO TwitterConnection (
  id, userId, twitterId, username, 
  accessToken, refreshToken, tokenExpiresAt,
  scope, isActive, connectedAt
) VALUES (
  'conn_123', 'user_456', '1234567890', 'testuser',
  'encrypted_access_token', 'encrypted_refresh_token', 
  '2025-11-14 12:00:00', 'tweet.read users.read', 
  true, '2025-11-13 12:00:00'
);
```

---

### Senaryo 2: Twitter Follow Task Tamamlama

**Başlangıç Durumu:**
- Kullanıcı Twitter'a bağlı
- Follow task mevcut: "Follow @SylvanToken"

**Adımlar:**

1. **Kullanıcı Task'ı Görür**
   ```
   Task Card:
   - Title: "Follow @SylvanToken on Twitter"
   - Points: 50
   - Type: TWITTER_FOLLOW
   - Status: Available
   ```

2. **Task Detaylarını Açar**
   ```
   Modal Opens:
   - TwitterTaskInstructions component görünür
   - Badge: "Twitter Connected" (green)
   - Button: "Follow on Twitter"
   ```

3. **"Follow on Twitter" Tıklar**
   ```
   Action: Opens Twitter in new tab
   URL: https://twitter.com/SylvanToken
   User: Follows the account on Twitter
   ```

4. **"Verify" Butonuna Tıklar**
   ```
   API Call: POST /api/completions
   Body: { taskId: "task_123" }
   ```

5. **Completion Oluşturulur**
   ```
   Database:
   - Create Completion (status: PENDING)
   - Trigger automatic verification
   
   Response:
   {
     "success": true,
     "completion": {
       "id": "comp_789",
       "status": "PENDING"
     },
     "twitterVerification": {
       "enabled": true,
       "userConnected": true,
       "message": "Verification in progress..."
     }
   }
   ```

6. **Automatic Verification Başlar**
   ```
   Background Process:
   1. Get user's Twitter connection
   2. Decrypt access token
   3. Call Twitter API: GET /2/users/:id/following
   4. Check if @SylvanToken in following list
   5. Update completion status
   6. Create verification log
   ```

7. **Verification Tamamlanır (Success)**
   ```
   Twitter API Response (Simulated):
   {
     "data": [
       { "id": "1234567890", "username": "SylvanToken" }
     ]
   }
   
   Verification Result: APPROVED
   
   Database Updates:
   - Completion.status = "APPROVED"
   - Completion.pointsAwarded = 50
   - User.totalPoints += 50
   - Create TwitterVerificationLog
   ```

8. **UI Güncellenir**
   ```
   TwitterVerificationStatus:
   - Badge: "Approved" (green)
   - Message: "Great! Your follow task has been verified."
   - Points: "+50 points earned!"
   ```

**Beklenen Database Değişiklikleri:**

```sql
-- Completion
UPDATE Completion 
SET status = 'APPROVED', pointsAwarded = 50
WHERE id = 'comp_789';

-- User
UPDATE User 
SET totalPoints = totalPoints + 50
WHERE id = 'user_456';

-- TwitterVerificationLog
INSERT INTO TwitterVerificationLog (
  id, completionId, userId, taskId, taskType,
  verificationResult, verificationTime, 
  apiCallCount, verifiedAt
) VALUES (
  'log_999', 'comp_789', 'user_456', 'task_123',
  'TWITTER_FOLLOW', 'APPROVED', 1250, 1,
  '2025-11-13 12:05:00'
);
```

---

### Senaryo 3: Twitter Like Task (Rejected)

**Başlangıç Durumu:**
- Kullanıcı Twitter'a bağlı
- Like task mevcut
- Kullanıcı tweet'i like'lamadı

**Adımlar:**

1. **Task Tamamlama Denemesi**
   ```
   User: Clicks "Verify" without liking
   API Call: POST /api/completions
   ```

2. **Verification Başlar**
   ```
   Process:
   1. Get user's liked tweets
   2. Check if target tweet in list
   3. Result: NOT FOUND
   ```

3. **Verification Fails**
   ```
   Twitter API Response (Simulated):
   {
     "data": [
       // Target tweet NOT in list
     ]
   }
   
   Verification Result: REJECTED
   Reason: "Tweet not found in user's liked tweets"
   ```

4. **Database Updates**
   ```sql
   UPDATE Completion 
   SET status = 'REJECTED', 
       rejectionReason = 'Tweet not found in user\'s liked tweets'
   WHERE id = 'comp_789';
   
   INSERT INTO TwitterVerificationLog (
     verificationResult, rejectionReason, ...
   ) VALUES (
     'REJECTED', 'Tweet not found in user\'s liked tweets', ...
   );
   ```

5. **UI Shows Rejection**
   ```
   TwitterVerificationStatus:
   - Badge: "Rejected" (red)
   - Message: "Please complete the like action and try again."
   - Button: "Retry Verification"
   ```

6. **Kullanıcı Tweet'i Like'lar**
   ```
   User: Goes to Twitter, likes the tweet
   ```

7. **Retry Verification**
   ```
   User: Clicks "Retry Verification"
   API Call: POST /api/twitter/verify
   Body: { completionId: "comp_789" }
   
   Result: APPROVED (this time)
   ```

---

### Senaryo 4: Token Expiration & Reconnection

**Başlangıç Durumu:**
- Kullanıcı Twitter'a bağlı
- Token expired (tokenExpiresAt < now)

**Adımlar:**

1. **Kullanıcı Task Tamamlamaya Çalışır**
   ```
   API Call: POST /api/completions
   ```

2. **Verification Sırasında Token Expired Tespit Edilir**
   ```
   Process:
   1. Get Twitter connection
   2. Check tokenExpiresAt
   3. Token expired!
   4. Try to refresh token
   ```

3. **Token Refresh Attempt**
   ```
   API Call to Twitter: POST /2/oauth2/token
   Body: {
     grant_type: "refresh_token",
     refresh_token: "encrypted_refresh_token"
   }
   
   Response (Simulated - Success):
   {
     "access_token": "new_access_token",
     "refresh_token": "new_refresh_token",
     "expires_in": 7200
   }
   ```

4. **Tokens Updated**
   ```sql
   UPDATE TwitterConnection
   SET accessToken = 'new_encrypted_access_token',
       refreshToken = 'new_encrypted_refresh_token',
       tokenExpiresAt = datetime('now', '+2 hours'),
       lastVerifiedAt = datetime('now')
   WHERE userId = 'user_456';
   ```

5. **Verification Continues**
   ```
   Process continues with new token
   Result: APPROVED
   ```

**Alternative: Refresh Fails**

```
Refresh Token Response (Simulated - Failure):
{
  "error": "invalid_grant",
  "error_description": "Refresh token expired"
}

Action:
1. Mark connection as inactive
2. Notify user to reconnect
3. Show "Token Expired" message in UI
```

---

### Senaryo 5: Rate Limiting

**Başlangıç Durumu:**
- Çok sayıda verification request
- Twitter API rate limit'e yaklaşıldı

**Adımlar:**

1. **15. Verification Request**
   ```
   API Call: POST /api/twitter/verify
   Rate Limit Check: 14/15 requests used
   ```

2. **Twitter API Call**
   ```
   Response Headers:
   x-rate-limit-limit: 15
   x-rate-limit-remaining: 0
   x-rate-limit-reset: 1699876800
   
   Status: 429 Too Many Requests
   ```

3. **Rate Limit Handler**
   ```
   Process:
   1. Detect 429 status
   2. Parse reset time
   3. Calculate wait time
   4. Queue request for retry
   5. Log rate limit event
   ```

4. **User Notification**
   ```
   UI Message:
   "Twitter API rate limit reached. 
    Your verification will be processed in 12 minutes."
   
   Status: PENDING
   ```

5. **Automatic Retry**
   ```
   After wait time:
   1. Retry verification
   2. Process normally
   3. Update status
   ```

---

### Senaryo 6: Admin Batch Verification

**Başlangıç Durumu:**
- 10 pending completions
- Admin wants to verify all

**Adımlar:**

1. **Admin Opens Batch Verify Tool**
   ```
   URL: /admin/twitter/batch-verify
   ```

2. **Enters Completion IDs**
   ```
   Input:
   comp_001
   comp_002
   comp_003
   ...
   comp_010
   ```

3. **Clicks "Verify All"**
   ```
   API Call: POST /api/twitter/verify/batch
   Body: {
     completionIds: ["comp_001", "comp_002", ...]
   }
   ```

4. **Batch Processing**
   ```
   Process:
   For each completion:
   1. Load completion and task
   2. Get user's Twitter connection
   3. Verify based on task type
   4. Update status
   5. Create log
   
   Concurrent processing (max 5 at a time)
   ```

5. **Results Displayed**
   ```
   Results:
   - comp_001: APPROVED
   - comp_002: APPROVED
   - comp_003: REJECTED (not followed)
   - comp_004: APPROVED
   - comp_005: ERROR (token expired)
   - comp_006: APPROVED
   - comp_007: APPROVED
   - comp_008: REJECTED (not liked)
   - comp_009: APPROVED
   - comp_010: APPROVED
   
   Summary:
   - Total: 10
   - Approved: 7
   - Rejected: 2
   - Errors: 1
   ```

---

### Senaryo 7: Analytics Dashboard

**Başlangıç Durumu:**
- 1000 verifications completed
- Various results

**Simulated Data:**

```javascript
const analyticsData = {
  totalVerifications: 1000,
  successRate: 87.5, // 875 approved
  averageVerificationTime: 1850, // ms
  errorRate: 2.5, // 25 errors
  
  byTaskType: {
    TWITTER_FOLLOW: {
      total: 400,
      approved: 360,
      successRate: 90%
    },
    TWITTER_LIKE: {
      total: 350,
      approved: 300,
      successRate: 85.7%
    },
    TWITTER_RETWEET: {
      total: 250,
      approved: 215,
      successRate: 86%
    }
  },
  
  timeDistribution: {
    "< 1s": 250,
    "1-2s": 450,
    "2-3s": 200,
    "3-5s": 75,
    "> 5s": 25
  },
  
  errorBreakdown: {
    "Token Expired": 10,
    "Rate Limit": 8,
    "API Error": 5,
    "Network Error": 2
  }
};
```

**Dashboard Display:**

```
┌─────────────────────────────────────────┐
│  Twitter Verification Analytics         │
├─────────────────────────────────────────┤
│                                         │
│  📊 Total Verifications: 1,000          │
│  ✅ Success Rate: 87.5%                 │
│  ⚡ Avg Time: 1.85s                     │
│  ❌ Error Rate: 2.5%                    │
│                                         │
├─────────────────────────────────────────┤
│  By Task Type:                          │
│                                         │
│  Follow:   [████████████░░] 90%        │
│            360/400 approved             │
│                                         │
│  Like:     [███████████░░░] 85.7%      │
│            300/350 approved             │
│                                         │
│  Retweet:  [███████████░░░] 86%        │
│            215/250 approved             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🧪 Mock Data Generator

Test için mock data oluşturma:

```typescript
// Mock Twitter API Responses
const mockTwitterResponses = {
  // Following check - Success
  checkFollowing: {
    success: {
      data: [
        {
          id: "1234567890",
          name: "Sylvan Token",
          username: "SylvanToken"
        }
      ]
    },
    notFollowing: {
      data: []
    }
  },
  
  // Liked tweets - Success
  checkLiked: {
    success: {
      data: [
        {
          id: "9876543210",
          text: "Check out our new feature!"
        }
      ]
    },
    notLiked: {
      data: []
    }
  },
  
  // Retweet check - Success
  checkRetweeted: {
    success: {
      data: [
        {
          id: "user_456",
          username: "testuser"
        }
      ]
    },
    notRetweeted: {
      data: []
    }
  },
  
  // Rate limit error
  rateLimitError: {
    status: 429,
    headers: {
      "x-rate-limit-limit": "15",
      "x-rate-limit-remaining": "0",
      "x-rate-limit-reset": "1699876800"
    },
    data: {
      title: "Too Many Requests",
      detail: "Too Many Requests",
      type: "about:blank",
      status: 429
    }
  },
  
  // Token expired error
  tokenExpiredError: {
    status: 401,
    data: {
      title: "Unauthorized",
      detail: "Invalid or expired token",
      type: "about:blank",
      status: 401
    }
  }
};

// Mock Database State
const mockDatabaseState = {
  users: [
    {
      id: "user_456",
      username: "testuser",
      email: "test@example.com",
      totalPoints: 1000
    }
  ],
  
  twitterConnections: [
    {
      id: "conn_123",
      userId: "user_456",
      twitterId: "1234567890",
      username: "testuser",
      accessToken: "encrypted_token",
      refreshToken: "encrypted_refresh",
      tokenExpiresAt: new Date("2025-11-14 12:00:00"),
      isActive: true
    }
  ],
  
  tasks: [
    {
      id: "task_follow",
      title: "Follow @SylvanToken",
      taskType: "TWITTER_FOLLOW",
      taskUrl: "https://twitter.com/SylvanToken",
      points: 50
    },
    {
      id: "task_like",
      title: "Like our announcement",
      taskType: "TWITTER_LIKE",
      taskUrl: "https://twitter.com/SylvanToken/status/9876543210",
      points: 30
    },
    {
      id: "task_retweet",
      title: "Retweet our post",
      taskType: "TWITTER_RETWEET",
      taskUrl: "https://twitter.com/SylvanToken/status/9876543210",
      points: 40
    }
  ],
  
  completions: [],
  verificationLogs: []
};
```

---

## 📊 Performance Benchmarks

**Expected Performance:**

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Verification Time | < 2s | 2-5s | > 5s |
| Success Rate | > 90% | 80-90% | < 80% |
| Error Rate | < 5% | 5-10% | > 10% |
| API Response | < 1s | 1-3s | > 3s |

**Simulated Performance Test:**

```
Test: 100 concurrent verifications

Results:
- Total Time: 45 seconds
- Avg per verification: 1.8s
- Success: 92 (92%)
- Rejected: 6 (6%)
- Errors: 2 (2%)

Performance: ✅ EXCELLENT
```

---

## 🔍 Debugging Scenarios

### Debug 1: Verification Always Fails

**Symptoms:**
- All verifications return REJECTED
- User claims they completed action

**Debug Steps:**

1. Check Twitter connection status
2. Verify token not expired
3. Test Twitter API manually
4. Check task URL format
5. Verify user completed correct action
6. Check API response logs

### Debug 2: Slow Verifications

**Symptoms:**
- Verifications take > 5 seconds
- Users complaining about delays

**Debug Steps:**

1. Check Twitter API response times
2. Review database query performance
3. Check network latency
4. Verify caching working
5. Check concurrent request limits

### Debug 3: Token Refresh Fails

**Symptoms:**
- Users need to reconnect frequently
- Token refresh errors in logs

**Debug Steps:**

1. Verify refresh token stored correctly
2. Check token expiration calculation
3. Test refresh endpoint manually
4. Verify encryption/decryption
5. Check Twitter app permissions

---

## ✅ Test Checklist

### Functional Tests
- [ ] User can connect Twitter
- [ ] OAuth flow works correctly
- [ ] Follow verification works
- [ ] Like verification works
- [ ] Retweet verification works
- [ ] Token refresh works
- [ ] Reconnection works
- [ ] Disconnection works
- [ ] Admin features work
- [ ] Analytics display correctly

### Error Handling Tests
- [ ] Token expired handled
- [ ] Rate limit handled
- [ ] API errors handled
- [ ] Network errors handled
- [ ] Invalid tokens handled
- [ ] Missing data handled

### Performance Tests
- [ ] Verification < 3s average
- [ ] Success rate > 85%
- [ ] Error rate < 10%
- [ ] Concurrent requests handled
- [ ] Database queries optimized

### Security Tests
- [ ] Tokens encrypted
- [ ] OAuth state validated
- [ ] CSRF protection works
- [ ] Rate limiting works
- [ ] Admin access controlled

---

## 📝 Simulation Summary

Bu simulation guide ile:

✅ Tüm user flows test edilebilir  
✅ Error scenarios simule edilebilir  
✅ Performance ölçülebilir  
✅ Admin features test edilebilir  
✅ Database changes doğrulanabilir  

**Next Steps:**
1. Mock data ile local test
2. Staging environment test
3. Production deployment
4. Real user testing
5. Monitoring ve optimization

---

**Last Updated**: November 13, 2025  
**Version**: 1.0  
**Status**: Ready for Testing ✅
