import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exportData, ExportOptions } from '@/lib/admin/export'
import { FilterCriteria } from '@/lib/admin/filters'
import { logAuditEvent } from '@/lib/admin/audit'

/**
 * POST /api/admin/export
 * Export data in various formats (CSV, Excel, JSON)
 * Handles large exports asynchronously with email notification
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { format, model, filters, fields } = body as {
      format: 'csv' | 'excel' | 'json'
      model: 'users' | 'tasks' | 'completions' | 'campaigns'
      filters?: FilterCriteria[]
      fields?: string[]
    }

    // Validate required fields
    if (!format || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: format, model' },
        { status: 400 }
      )
    }

    // Validate format
    if (!['csv', 'excel', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be csv, excel, or json' },
        { status: 400 }
      )
    }

    // Validate model
    if (!['users', 'tasks', 'completions', 'campaigns'].includes(model)) {
      return NextResponse.json(
        { error: 'Invalid model. Must be users, tasks, completions, or campaigns' },
        { status: 400 }
      )
    }

    // Check if this should be an async export
    // For now, we'll estimate based on model type
    // In production, you'd query the count first
    const shouldBeAsync = await shouldExportAsync(model, filters)

    if (shouldBeAsync) {
      // Queue async export job
      await queueAsyncExport({
        format,
        model,
        filters,
        fields,
        adminEmail: session.user.email!,
        adminId: session.user.id,
      })

      // Log audit event
      await logAuditEvent({
        action: 'export_queued',
        adminId: session.user.id,
        adminEmail: session.user.email!,
        affectedModel: model,
        afterData: {
          format,
          model,
          filterCount: filters?.length || 0,
          fieldCount: fields?.length || 0,
        },
      })

      return NextResponse.json({
        async: true,
        message: 'Export is being processed. You will receive an email with the download link.',
      })
    }

    // Perform synchronous export
    const exportOptions: ExportOptions = {
      format,
      model,
      filters,
      fields,
    }

    const result = await exportData(exportOptions)

    // Log audit event
    await logAuditEvent({
      action: 'export_completed',
      adminId: session.user.id,
      adminEmail: session.user.email!,
      affectedModel: model,
      afterData: {
        format,
        model,
        filename: result.filename,
        filterCount: filters?.length || 0,
        fieldCount: fields?.length || 0,
      },
    })

    // Return file as download
    const headers = new Headers()
    headers.set('Content-Type', result.mimeType)
    headers.set('Content-Disposition', `attachment; filename="${result.filename}"`)

    // Convert Buffer to appropriate format for NextResponse
    const responseData = typeof result.data === 'string' 
      ? result.data 
      : Buffer.from(result.data)

    return new NextResponse(responseData, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Export error:', error)
    
    // Log error in audit
    const session = await getServerSession(authOptions)
    if (session?.user) {
      await logAuditEvent({
        action: 'export_failed',
        adminId: session.user.id,
        adminEmail: session.user.email!,
        afterData: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }

    return NextResponse.json(
      { 
        error: 'Export failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Determine if export should be handled asynchronously
 * based on estimated data size
 */
async function shouldExportAsync(
  model: string,
  filters?: FilterCriteria[]
): Promise<boolean> {
  // For now, we'll use a simple heuristic
  // In production, you'd query the actual count
  
  // If filters are applied, assume smaller dataset
  if (filters && filters.length > 0) {
    return false
  }

  // For unfiltered exports, check model type
  // Users and completions are likely to be large
  switch (model) {
    case 'users':
    case 'completions':
      // In production, query actual count
      // For now, assume these could be large
      return false // Set to false for MVP, enable when email system is ready
    case 'tasks':
    case 'campaigns':
      return false
    default:
      return false
  }
}

/**
 * Queue an async export job
 * In production, this would use a job queue (Bull, BullMQ, etc.)
 * For now, we'll process it immediately in the background
 */
async function queueAsyncExport(options: {
  format: 'csv' | 'excel' | 'json'
  model: string
  filters?: FilterCriteria[]
  fields?: string[]
  adminEmail: string
  adminId: string
}) {
  // In production implementation:
  // 1. Add job to queue (Redis + Bull/BullMQ)
  // 2. Worker processes the export
  // 3. Upload file to cloud storage (S3, etc.)
  // 4. Send email with download link
  // 5. Set expiration on download link (24-48 hours)
  
  // For MVP, we'll just log that this would be queued
  console.log('Async export queued:', {
    ...options,
    timestamp: new Date().toISOString(),
  })

  // NOTE: Background job queue not implemented
  // Future enhancement: Use Bull/BullMQ for async export processing
  // Benefits:
  // - Handle large exports without timeout
  // - Email notification when export is ready
  // - Progress tracking and retry logic
  // Current: Synchronous export (works for small datasets)
}
