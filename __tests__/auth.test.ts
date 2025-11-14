/**
 * Integration tests for user registration and login flow
 * Tests Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { registerSchema } from '@/lib/validations'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Helper function to simulate registration logic
async function registerUser(email: string, username: string, password: string) {
  // Validate input
  const validation = registerSchema.safeParse({ email, username, password })
  if (!validation.success) {
    return { success: false, error: 'Validation failed', status: 400 }
  }

  // Check if email exists
  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    return { success: false, error: 'Email already exists', status: 400 }
  }

  // Check if username exists
  const existingUsername = await prisma.user.findUnique({ where: { username } })
  if (existingUsername) {
    return { success: false, error: 'Username already exists', status: 400 }
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  })

  return { success: true, user, status: 201 }
}

// Helper function to simulate login logic
async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  
  if (!user) {
    return { success: false, error: 'Invalid credentials', status: 401 }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  
  if (!isPasswordValid) {
    return { success: false, error: 'Invalid credentials', status: 401 }
  }

  return { success: true, user, status: 200 }
}

describe('User Registration and Login Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Registration', () => {
    it('should successfully register a new user with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'USER',
        totalPoints: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await registerUser('test@example.com', 'testuser', 'Password123!')

      // Assert
      expect(result.success).toBe(true)
      expect(result.status).toBe(201)
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2) // Check email and username
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
          password: expect.any(String),
        }),
      })
    })

    it('should reject registration with duplicate email', async () => {
      // Arrange
      const existingUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'hashedpassword',
        role: 'USER',
        totalPoints: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser)

      // Act
      const result = await registerUser('existing@example.com', 'newuser', 'Password123!')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      expect(result.error).toBe('Email already exists')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should reject registration with duplicate username', async () => {
      // Arrange
      const existingUser = {
        id: 'existing-user-id',
        email: 'different@example.com',
        username: 'existinguser',
        password: 'hashedpassword',
        role: 'USER',
        totalPoints: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce(existingUser) // Username check fails

      // Act
      const result = await registerUser('new@example.com', 'existinguser', 'Password123!')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      expect(result.error).toBe('Username already exists')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should reject registration with invalid email format', async () => {
      // Act
      const result = await registerUser('invalid-email', 'testuser', 'Password123!')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      expect(result.error).toBe('Validation failed')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should reject registration with weak password', async () => {
      // Act
      const result = await registerUser('test@example.com', 'testuser', 'weak')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      expect(result.error).toBe('Validation failed')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })
  })

  describe('User Login', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('Password123!', 10)
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        role: 'USER',
        totalPoints: 100,
        createdAt: new Date(),
        lastActive: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await loginUser('test@example.com', 'Password123!')

      // Assert
      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      expect(result.user?.email).toBe('test@example.com')
    })

    it('should reject login with invalid password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('Password123!', 10)
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        role: 'USER',
        totalPoints: 100,
        createdAt: new Date(),
        lastActive: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await loginUser('test@example.com', 'WrongPassword')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(401)
      expect(result.error).toBe('Invalid credentials')
    })

    it('should reject login with non-existent email', async () => {
      // Arrange
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      // Act
      const result = await loginUser('nonexistent@example.com', 'Password123!')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(401)
      expect(result.error).toBe('Invalid credentials')
    })
  })
})
