/**
 * Database Connection Middleware
 * 
 * This file ensures database connection is healthy before processing requests.
 * Import and use this in your API routes that need database access.
 */

import { NextRequest, NextResponse } from 'next/server'
import { ensureDatabaseConnection } from './lib/db-health'

/**
 * Middleware to ensure database connection before processing request
 */
export async function withDatabaseConnection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Ensure database connection is alive
      const connected = await ensureDatabaseConnection(2)
      
      if (!connected) {
        return NextResponse.json(
          {
            error: 'Database connection failed',
            message: 'Unable to connect to database. Please try again later.',
          },
          { status: 503 }
        )
      }
      
      // Process the request
      return await handler(req)
    } catch (error) {
      console.error('Database middleware error:', error)
      
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        },
        { status: 500 }
      )
    }
  }
}
