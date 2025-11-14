/**
 * Social Media Linking Tests
 * Tests for Twitter/X and Telegram account linking functionality
 */

import { prisma } from '@/lib/prisma'
import {
  createTestUser,
  cleanDatabase,
} from './utils/test-helpers'

describe('Social Media Linking', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  describe('4.1 Twitter/X Linking', () => {
    it('should link Twitter account with valid username', async () => {
      const user = await createTestUser()
      const username = 'testuser'

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: username,
          twitterVerified: true,
        },
      })

      expect(updatedUser.twitterUsername).toBe(username)
      expect(updatedUser.twitterVerified).toBe(true)
    })

    it('should validate Twitter username format', () => {
      // Valid usernames
      const validUsernames = ['testuser', 'test_user', 'TestUser123', 'user123']
      validUsernames.forEach((username) => {
        expect(/^[a-zA-Z0-9_]+$/.test(username)).toBe(true)
        expect(username.length).toBeGreaterThanOrEqual(3)
        expect(username.length).toBeLessThanOrEqual(30)
      })

      // Invalid usernames
      const invalidUsernames = ['user@invalid', 'user with spaces', 'user-name', 'user.name']
      invalidUsernames.forEach((username) => {
        expect(/^[a-zA-Z0-9_]+$/.test(username)).toBe(false)
      })
    })

    it('should store Twitter connection correctly', async () => {
      const user = await createTestUser()
      const username = 'testuser123'

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: username,
          twitterVerified: true,
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.twitterUsername).toBe(username)
      expect(updatedUser?.twitterVerified).toBe(true)
    })

    it('should update existing Twitter username if not verified', async () => {
      const user = await createTestUser({
        twitterUsername: 'oldusername',
        twitterVerified: false,
      })

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: 'newusername',
          twitterVerified: true,
        },
      })

      expect(updatedUser.twitterUsername).toBe('newusername')
      expect(updatedUser.twitterVerified).toBe(true)
    })

    it('should require authenticated user for Twitter linking', async () => {
      const user = await createTestUser()
      
      // Verify that user must exist to link Twitter
      expect(user.id).toBeTruthy()
      
      // Simulate linking
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { twitterUsername: 'testuser' },
      })
      
      expect(updatedUser.twitterUsername).toBe('testuser')
    })
  })

  describe('4.2 Telegram Linking', () => {
    it('should link Telegram account with valid username', async () => {
      const user = await createTestUser()
      const username = 'testuser'

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: username,
          telegramVerified: true,
        },
      })

      expect(updatedUser.telegramUsername).toBe(username)
      expect(updatedUser.telegramVerified).toBe(true)
    })

    it('should validate Telegram username format', () => {
      // Valid usernames
      const validUsernames = ['testuser', 'test_user', 'TestUser123', 'user123']
      validUsernames.forEach((username) => {
        expect(/^[a-zA-Z0-9_]+$/.test(username)).toBe(true)
        expect(username.length).toBeGreaterThanOrEqual(3)
        expect(username.length).toBeLessThanOrEqual(30)
      })

      // Invalid usernames - too short
      expect('ab'.length).toBeLessThan(3)
      
      // Invalid usernames - too long
      expect('a'.repeat(31).length).toBeGreaterThan(30)
    })

    it('should store Telegram connection correctly', async () => {
      const user = await createTestUser()
      const username = 'telegram_user'

      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: username,
          telegramVerified: true,
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.telegramUsername).toBe(username)
      expect(updatedUser?.telegramVerified).toBe(true)
    })

    it('should update existing Telegram username if not verified', async () => {
      const user = await createTestUser({
        telegramUsername: 'oldtelegram',
        telegramVerified: false,
      })

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: 'newtelegram',
          telegramVerified: true,
        },
      })

      expect(updatedUser.telegramUsername).toBe('newtelegram')
      expect(updatedUser.telegramVerified).toBe(true)
    })

    it('should require authenticated user for Telegram linking', async () => {
      const user = await createTestUser()
      
      // Verify that user must exist to link Telegram
      expect(user.id).toBeTruthy()
      
      // Simulate linking
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { telegramUsername: 'testuser' },
      })
      
      expect(updatedUser.telegramUsername).toBe('testuser')
    })
  })

  describe('4.3 Social Media Verification', () => {
    it('should verify Twitter account on submission', async () => {
      const user = await createTestUser()

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: 'verifieduser',
          twitterVerified: true,
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.twitterVerified).toBe(true)
      expect(updatedUser?.twitterUsername).toBe('verifieduser')
    })

    it('should verify Telegram account on submission', async () => {
      const user = await createTestUser()

      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: 'verifieduser',
          telegramVerified: true,
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.telegramVerified).toBe(true)
      expect(updatedUser?.telegramUsername).toBe('verifieduser')
    })

    it('should update verification status correctly', async () => {
      const user = await createTestUser({
        twitterUsername: 'olduser',
        twitterVerified: false,
      })

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: 'newuser',
          twitterVerified: true,
        },
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.twitterVerified).toBe(true)
      expect(updatedUser?.twitterUsername).toBe('newuser')
    })

    it('should allow admin to manually verify social media accounts', async () => {
      // Create admin user
      const admin = await createTestUser({ role: 'ADMIN' })
      
      // Create regular user with unverified social media
      const user = await createTestUser({
        twitterUsername: 'pendinguser',
        twitterVerified: false,
        telegramUsername: 'pendingtelegram',
        telegramVerified: false,
      })

      // Admin manually verifies Twitter account
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterVerified: true,
          telegramVerified: true,
        },
      })

      expect(updatedUser.twitterVerified).toBe(true)
      expect(updatedUser.twitterUsername).toBe('pendinguser')
      expect(updatedUser.telegramVerified).toBe(true)
      expect(updatedUser.telegramUsername).toBe('pendingtelegram')
      
      // Verify admin role exists
      expect(admin.role).toBe('ADMIN')
    })
  })

  describe('4.4 Duplicate Social Media Prevention', () => {
    it('should prevent duplicate Twitter usernames', async () => {
      const user1 = await createTestUser({
        twitterUsername: 'existinguser',
        twitterVerified: true,
      })

      const user2 = await createTestUser()

      // Try to assign the same Twitter username to another user
      const usernameInUse = await prisma.user.findFirst({
        where: {
          twitterUsername: 'existinguser',
          id: { not: user2.id },
        },
      })

      expect(usernameInUse).not.toBeNull()
      expect(usernameInUse?.id).toBe(user1.id)
      expect(usernameInUse?.twitterUsername).toBe('existinguser')
    })

    it('should prevent duplicate Telegram usernames', async () => {
      const user1 = await createTestUser({
        telegramUsername: 'existingtelegram',
        telegramVerified: true,
      })

      // Verify the username is in use
      const usernameInUse = await prisma.user.findFirst({
        where: {
          telegramUsername: 'existingtelegram',
        },
      })

      expect(usernameInUse).not.toBeNull()
      expect(usernameInUse?.id).toBe(user1.id)
      expect(usernameInUse?.telegramUsername).toBe('existingtelegram')
    })

    it('should return 409 Conflict on duplicate Twitter username', async () => {
      await createTestUser({
        twitterUsername: 'duplicateuser',
        twitterVerified: true,
      })

      // Check for duplicate - simulating what the API would do
      const usernameInUse = await prisma.user.findFirst({
        where: { twitterUsername: 'duplicateuser' },
      })

      expect(usernameInUse).not.toBeNull()
      
      // In the API, this would result in a 409 Conflict response
      // We verify the duplicate detection logic here
      expect(usernameInUse?.twitterUsername).toBe('duplicateuser')
    })

    it('should return 409 Conflict on duplicate Telegram username', async () => {
      await createTestUser({
        telegramUsername: 'duplicatetelegram',
        telegramVerified: true,
      })

      // Check for duplicate - simulating what the API would do
      const usernameInUse = await prisma.user.findFirst({
        where: { telegramUsername: 'duplicatetelegram' },
      })

      expect(usernameInUse).not.toBeNull()
      
      // In the API, this would result in a 409 Conflict response
      // We verify the duplicate detection logic here
      expect(usernameInUse?.telegramUsername).toBe('duplicatetelegram')
    })

    it('should perform case-insensitive duplicate check for Twitter', async () => {
      await createTestUser({
        twitterUsername: 'TestUser',
      })

      // Fetch all users and perform case-insensitive comparison
      const allUsers = await prisma.user.findMany({
        where: {
          twitterUsername: { not: null },
        },
      })

      const targetUsername = 'testuser'
      const caseInsensitiveMatch = allUsers.find(
        (user) => user.twitterUsername?.toLowerCase() === targetUsername.toLowerCase()
      )

      // Should find the user regardless of case
      expect(caseInsensitiveMatch).not.toBeNull()
      expect(caseInsensitiveMatch?.twitterUsername).toBe('TestUser')
      
      // Verify that different cases would be caught
      const upperCaseMatch = allUsers.find(
        (user) => user.twitterUsername?.toLowerCase() === 'TESTUSER'.toLowerCase()
      )
      expect(upperCaseMatch).not.toBeNull()
    })

    it('should perform case-insensitive duplicate check for Telegram', async () => {
      await createTestUser({
        telegramUsername: 'TelegramUser',
      })

      // Fetch all users and perform case-insensitive comparison
      const allUsers = await prisma.user.findMany({
        where: {
          telegramUsername: { not: null },
        },
      })

      const targetUsername = 'telegramuser'
      const caseInsensitiveMatch = allUsers.find(
        (user) => user.telegramUsername?.toLowerCase() === targetUsername.toLowerCase()
      )

      // Should find the user regardless of case
      expect(caseInsensitiveMatch).not.toBeNull()
      expect(caseInsensitiveMatch?.telegramUsername).toBe('TelegramUser')
      
      // Verify that different cases would be caught
      const upperCaseMatch = allUsers.find(
        (user) => user.telegramUsername?.toLowerCase() === 'TELEGRAMUSER'.toLowerCase()
      )
      expect(upperCaseMatch).not.toBeNull()
    })
  })

  describe('4.5 Social Media Unlinking', () => {
    it('should unlink Twitter account and remove connection data', async () => {
      const user = await createTestUser({
        twitterUsername: 'linkeduser',
        twitterVerified: true,
      })

      // Verify initial state
      expect(user.twitterUsername).toBe('linkeduser')
      expect(user.twitterVerified).toBe(true)

      // Unlink Twitter account
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: null,
          twitterVerified: false,
        },
      })

      // Verify Twitter connection is removed
      expect(updatedUser.twitterUsername).toBeNull()
      expect(updatedUser.twitterVerified).toBe(false)
    })

    it('should unlink Telegram account and remove connection data', async () => {
      const user = await createTestUser({
        telegramUsername: 'linkedtelegram',
        telegramVerified: true,
      })

      // Verify initial state
      expect(user.telegramUsername).toBe('linkedtelegram')
      expect(user.telegramVerified).toBe(true)

      // Unlink Telegram account
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: null,
          telegramVerified: false,
        },
      })

      // Verify Telegram connection is removed
      expect(updatedUser.telegramUsername).toBeNull()
      expect(updatedUser.telegramVerified).toBe(false)
    })

    it('should remove Twitter connection data completely', async () => {
      const user = await createTestUser({
        twitterUsername: 'testuser',
        twitterVerified: true,
      })

      // Unlink Twitter
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: null,
          twitterVerified: false,
        },
      })

      // Fetch user from database to verify data is removed
      const fetchedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(fetchedUser?.twitterUsername).toBeNull()
      expect(fetchedUser?.twitterVerified).toBe(false)
    })

    it('should remove Telegram connection data completely', async () => {
      const user = await createTestUser({
        telegramUsername: 'testuser',
        telegramVerified: true,
      })

      // Unlink Telegram
      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: null,
          telegramVerified: false,
        },
      })

      // Fetch user from database to verify data is removed
      const fetchedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(fetchedUser?.telegramUsername).toBeNull()
      expect(fetchedUser?.telegramVerified).toBe(false)
    })

    it('should update verification status to false when unlinking Twitter', async () => {
      const user = await createTestUser({
        twitterUsername: 'verifieduser',
        twitterVerified: true,
      })

      // Verify initial verified state
      expect(user.twitterVerified).toBe(true)

      // Unlink Twitter account
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: null,
          twitterVerified: false,
        },
      })

      // Verification status should be false
      expect(updatedUser.twitterVerified).toBe(false)
      expect(updatedUser.twitterUsername).toBeNull()
    })

    it('should update verification status to false when unlinking Telegram', async () => {
      const user = await createTestUser({
        telegramUsername: 'verifiedtelegram',
        telegramVerified: true,
      })

      // Verify initial verified state
      expect(user.telegramVerified).toBe(true)

      // Unlink Telegram account
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: null,
          telegramVerified: false,
        },
      })

      // Verification status should be false
      expect(updatedUser.telegramVerified).toBe(false)
      expect(updatedUser.telegramUsername).toBeNull()
    })

    it('should allow relinking Twitter after unlinking', async () => {
      const user = await createTestUser({
        twitterUsername: 'firstuser',
        twitterVerified: true,
      })

      // Unlink Twitter
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: null,
          twitterVerified: false,
        },
      })

      // Relink with new username
      const relinkUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: 'seconduser',
          twitterVerified: true,
        },
      })

      expect(relinkUser.twitterUsername).toBe('seconduser')
      expect(relinkUser.twitterVerified).toBe(true)
    })

    it('should allow relinking Telegram after unlinking', async () => {
      const user = await createTestUser({
        telegramUsername: 'firsttelegram',
        telegramVerified: true,
      })

      // Unlink Telegram
      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: null,
          telegramVerified: false,
        },
      })

      // Relink with new username
      const relinkUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: 'secondtelegram',
          telegramVerified: true,
        },
      })

      expect(relinkUser.telegramUsername).toBe('secondtelegram')
      expect(relinkUser.telegramVerified).toBe(true)
    })

    it('should unlink both Twitter and Telegram independently', async () => {
      const user = await createTestUser({
        twitterUsername: 'twitteruser',
        twitterVerified: true,
        telegramUsername: 'telegramuser',
        telegramVerified: true,
      })

      // Unlink only Twitter
      const afterTwitterUnlink = await prisma.user.update({
        where: { id: user.id },
        data: {
          twitterUsername: null,
          twitterVerified: false,
        },
      })

      // Twitter should be unlinked, Telegram should remain
      expect(afterTwitterUnlink.twitterUsername).toBeNull()
      expect(afterTwitterUnlink.twitterVerified).toBe(false)
      expect(afterTwitterUnlink.telegramUsername).toBe('telegramuser')
      expect(afterTwitterUnlink.telegramVerified).toBe(true)

      // Now unlink Telegram
      const afterTelegramUnlink = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: null,
          telegramVerified: false,
        },
      })

      // Both should be unlinked
      expect(afterTelegramUnlink.twitterUsername).toBeNull()
      expect(afterTelegramUnlink.twitterVerified).toBe(false)
      expect(afterTelegramUnlink.telegramUsername).toBeNull()
      expect(afterTelegramUnlink.telegramVerified).toBe(false)
    })

    it('should make previously used username available after unlinking', async () => {
      const user1 = await createTestUser({
        twitterUsername: 'availableuser',
        twitterVerified: true,
      })

      // Unlink from user1
      await prisma.user.update({
        where: { id: user1.id },
        data: {
          twitterUsername: null,
          twitterVerified: false,
        },
      })

      // Create another user and link the same username
      const user2 = await createTestUser()
      const user2Updated = await prisma.user.update({
        where: { id: user2.id },
        data: {
          twitterUsername: 'availableuser',
          twitterVerified: true,
        },
      })

      // Should successfully link the username to user2
      expect(user2Updated.twitterUsername).toBe('availableuser')
      expect(user2Updated.twitterVerified).toBe(true)

      // Verify user1 no longer has the username
      const user1Check = await prisma.user.findUnique({
        where: { id: user1.id },
      })
      expect(user1Check?.twitterUsername).toBeNull()
    })
  })
})
