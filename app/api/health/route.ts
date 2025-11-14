import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db-health'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Health Check Endpoint
 * 
 * Returns the health status of the application and its dependencies
 */
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth()
    
    const responseTime = Date.now() - startTime
    
    // Determine overall health status
    const isHealthy = dbHealth.healthy
    const status = isHealthy ? 200 : 503
    
    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime,
        checks: {
          database: {
            status: dbHealth.healthy ? 'up' : 'down',
            latency: dbHealth.latency,
            error: dbHealth.error,
          },
          server: {
            status: 'up',
            nodeVersion: process.version,
            platform: process.platform,
            memory: {
              used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
              total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
              external: Math.round(process.memoryUsage().external / 1024 / 1024),
            },
          },
        },
      },
      { status }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    )
  }
}
