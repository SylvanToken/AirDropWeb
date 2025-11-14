/**
 * Database Health Check and Connection Management
 * 
 * This module provides utilities for checking database health
 * and managing connections with retry logic.
 */

import { prisma } from './prisma'

/**
 * Check if database is accessible and healthy
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  latency?: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1`
    
    const latency = Date.now() - startTime
    
    return {
      healthy: true,
      latency,
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Ensure database connection is alive
 * Reconnects if necessary
 */
export async function ensureDatabaseConnection(maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect()
      
      // Verify connection with a simple query
      await prisma.$queryRaw`SELECT 1`
      
      console.log(`Database connection established (attempt ${attempt}/${maxRetries})`)
      return true
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error)
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('Failed to establish database connection after all retries')
  return false
}

/**
 * Execute a database operation with automatic retry on connection errors
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a connection error
      const isConnectionError = 
        error instanceof Error && (
          error.message.includes('Connection') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('P1001') || // Prisma connection error
          error.message.includes('P1002') || // Prisma connection timeout
          error.message.includes('P1008') || // Prisma connection timeout
          error.message.includes('P1017')    // Prisma server closed connection
        )
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error
      }
      
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying...`, error)
      
      // Try to reconnect
      await ensureDatabaseConnection(1)
      
      // Exponential backoff
      const delay = Math.min(500 * Math.pow(2, attempt - 1), 3000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('Database disconnected successfully')
  } catch (error) {
    console.error('Error disconnecting from database:', error)
  }
}
