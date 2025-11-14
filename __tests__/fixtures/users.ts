/**
 * User Test Fixtures
 * Predefined user data for consistent testing
 */

export const testUsers = {
  regularUser: {
    email: 'user@test.com',
    username: 'testuser',
    password: 'Test123!',
    role: 'USER',
    totalPoints: 0,
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
  
  adminUser: {
    email: 'admin@test.com',
    username: 'testadmin',
    password: 'Admin123!',
    role: 'ADMIN',
    totalPoints: 0,
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
  
  verifiedUser: {
    email: 'verified@test.com',
    username: 'verifieduser',
    password: 'Test123!',
    role: 'USER',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    walletVerified: true,
    twitterUsername: 'testuser',
    twitterVerified: true,
    telegramUsername: 'testuser',
    telegramVerified: true,
    totalPoints: 100,
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
  
  unverifiedUser: {
    email: 'unverified@test.com',
    username: 'unverifieduser',
    password: 'Test123!',
    role: 'USER',
    walletAddress: null,
    walletVerified: false,
    twitterUsername: null,
    twitterVerified: false,
    telegramUsername: null,
    telegramVerified: false,
    totalPoints: 0,
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
  
  newUser: {
    email: 'newuser@test.com',
    username: 'newuser',
    password: 'Test123!',
    role: 'USER',
    totalPoints: 0,
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
  
  blockedUser: {
    email: 'blocked@test.com',
    username: 'blockeduser',
    password: 'Test123!',
    role: 'USER',
    status: 'BLOCKED',
    totalPoints: 0,
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
  
  highPointsUser: {
    email: 'highpoints@test.com',
    username: 'highpointsuser',
    password: 'Test123!',
    role: 'USER',
    totalPoints: 1000,
    walletVerified: true,
    twitterVerified: true,
    telegramVerified: true,
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
}

export const invalidUsers = {
  invalidEmail: {
    email: 'invalid-email',
    username: 'testuser',
    password: 'Test123!',
  },
  
  weakPassword: {
    email: 'test@test.com',
    username: 'testuser',
    password: 'weak',
  },
  
  shortUsername: {
    email: 'test@test.com',
    username: 'ab',
    password: 'Test123!',
  },
  
  missingEmail: {
    username: 'testuser',
    password: 'Test123!',
  },
  
  missingPassword: {
    email: 'test@test.com',
    username: 'testuser',
  },
}

export const walletAddresses = {
  valid: [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
    '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
  ],
  
  invalid: [
    'invalid-address',
    '0x123', // Too short
    '0xGGGd35Cc6634C0532925a3b844Bc9e7595f0bEb', // Invalid characters
    'not-an-address',
    '',
  ],
}

export const socialMediaUsernames = {
  twitter: {
    valid: ['testuser', 'test_user', 'TestUser123', 'user'],
    invalid: ['', 'a', 'user@invalid', 'user with spaces'],
  },
  
  telegram: {
    valid: ['testuser', 'test_user', 'TestUser123', 'user'],
    invalid: ['', 'a', 'user@invalid', 'user with spaces'],
  },
}
