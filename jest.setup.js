import '@testing-library/jest-dom'

// Polyfill for Request and Response
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = input
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers)
      this.body = init?.body
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || 'OK'
      this.headers = new Headers(init?.headers)
    }
    
    async json() {
      return JSON.parse(this.body)
    }
    
    async text() {
      return this.body
    }
  }
}

// Set test environment variables before any imports
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Import after setting environment variables
const { prisma } = require('@/lib/prisma')

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Database setup and teardown
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect()
  
  // Enable foreign keys for SQLite
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON')
})

afterAll(async () => {
  // Clean up and disconnect
  try {
    // Clean all tables
    await prisma.completion.deleteMany()
    await prisma.task.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.loginLog.deleteMany()
    await prisma.searchHistory.deleteMany()
    await prisma.filterPreset.deleteMany()
    await prisma.workflow.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.user.deleteMany()
    await prisma.role.deleteMany()
  } catch (error) {
    console.error('Error cleaning database:', error)
  } finally {
    await prisma.$disconnect()
  }
})

// Clean database before each test to ensure isolation
beforeEach(async () => {
  try {
    // Clean all tables in correct order
    await prisma.completion.deleteMany()
    await prisma.task.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.loginLog.deleteMany()
    await prisma.searchHistory.deleteMany()
    await prisma.filterPreset.deleteMany()
    await prisma.workflow.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.user.deleteMany()
    await prisma.role.deleteMany()
  } catch (error) {
    console.error('Error cleaning database before test:', error)
  }
})

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection in test:', reason)
})
