/**
 * Completion Test Fixtures
 * Predefined completion data for consistent testing
 */

export const testCompletions = {
  pendingCompletion: {
    pointsAwarded: 10,
    status: 'PENDING',
    verificationStatus: 'UNVERIFIED',
    needsReview: false,
    fraudScore: 15,
    completionTime: 30, // 30 seconds
  },
  
  approvedCompletion: {
    pointsAwarded: 10,
    status: 'APPROVED',
    verificationStatus: 'VERIFIED',
    needsReview: false,
    fraudScore: 5,
    completionTime: 45,
  },
  
  autoApprovedCompletion: {
    pointsAwarded: 10,
    status: 'AUTO_APPROVED',
    verificationStatus: 'VERIFIED',
    needsReview: false,
    fraudScore: 10,
    completionTime: 35,
  },
  
  rejectedCompletion: {
    pointsAwarded: 0,
    status: 'REJECTED',
    verificationStatus: 'FLAGGED',
    needsReview: false,
    fraudScore: 85,
    rejectionReason: 'Suspicious activity detected',
    completionTime: 2, // Too fast
  },
  
  flaggedCompletion: {
    pointsAwarded: 0,
    status: 'PENDING',
    verificationStatus: 'FLAGGED',
    needsReview: true,
    fraudScore: 65,
    completionTime: 3, // Very fast
  },
  
  lowRiskCompletion: {
    pointsAwarded: 10,
    status: 'AUTO_APPROVED',
    verificationStatus: 'VERIFIED',
    needsReview: false,
    fraudScore: 5,
    completionTime: 60, // Normal time
  },
  
  mediumRiskCompletion: {
    pointsAwarded: 10,
    status: 'PENDING',
    verificationStatus: 'UNVERIFIED',
    needsReview: false,
    fraudScore: 35,
    completionTime: 15, // Quick
    autoApproveAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  },
  
  highRiskCompletion: {
    pointsAwarded: 0,
    status: 'PENDING',
    verificationStatus: 'FLAGGED',
    needsReview: true,
    fraudScore: 75,
    completionTime: 2, // Very fast
  },
}

export const completionStatuses = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  autoApproved: 'AUTO_APPROVED',
}

export const verificationStatuses = {
  unverified: 'UNVERIFIED',
  verified: 'VERIFIED',
  flagged: 'FLAGGED',
}

export const fraudScoreRanges = {
  lowRisk: { min: 0, max: 19 },
  mediumRisk: { min: 20, max: 50 },
  highRisk: { min: 51, max: 100 },
}

export const completionTimes = {
  tooFast: 2, // 2 seconds - suspicious
  fast: 10, // 10 seconds - quick but possible
  normal: 30, // 30 seconds - normal
  slow: 120, // 2 minutes - taking time
}

export const rejectionReasons = {
  suspiciousActivity: 'Suspicious activity detected',
  tooFast: 'Completion time too fast',
  multipleAccounts: 'Multiple accounts from same IP',
  botBehavior: 'Bot-like behavior detected',
  invalidProof: 'Invalid proof of completion',
  duplicateSubmission: 'Duplicate submission',
}

export const ipAddresses = {
  valid: [
    '192.168.1.1',
    '10.0.0.1',
    '172.16.0.1',
    '8.8.8.8',
    '1.1.1.1',
  ],
  suspicious: [
    '192.168.1.1', // Same IP multiple times
    '192.168.1.1',
    '192.168.1.1',
  ],
}

export const userAgents = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  bot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
}
