import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface AuditEvent {
  id?: string;
  action: string;
  adminId: string;
  adminEmail: string;
  timestamp?: Date;
  affectedModel?: string;
  affectedId?: string;
  affectedCount?: number;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  workflowId?: string;
  error?: string;
  details?: any;
  context?: any;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  affectedModel?: string;
  dateRange?: { start: Date; end: Date };
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Extract IP address from NextRequest
 */
export function getIpAddress(request: NextRequest): string | undefined {
  // Try various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection remote address (may not be available in all environments)
  return request.headers.get('x-client-ip') || undefined;
}

/**
 * Extract user agent from NextRequest
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * Log an audit event to the database
 * This function automatically captures timestamp and handles JSON serialization
 */
export async function logAuditEvent(
  event: Omit<AuditEvent, 'id' | 'timestamp'>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: event.action,
        adminId: event.adminId,
        adminEmail: event.adminEmail,
        timestamp: new Date(),
        affectedModel: event.affectedModel,
        affectedId: event.affectedId,
        beforeData: event.beforeData ? JSON.stringify(event.beforeData) : null,
        afterData: event.afterData ? JSON.stringify(event.afterData) : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Log an audit event with automatic request context extraction
 * Use this helper in API routes to automatically capture IP and user agent
 */
export async function logAuditEventFromRequest(
  request: NextRequest,
  event: Omit<AuditEvent, 'id' | 'timestamp' | 'ipAddress' | 'userAgent' | 'adminId' | 'adminEmail'>
): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.warn('Attempted to log audit event without session');
      return;
    }

    await logAuditEvent({
      ...event,
      adminId: session.user.id,
      adminEmail: session.user.email || 'unknown',
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });
  } catch (error) {
    console.error('Failed to log audit event from request:', error);
  }
}

/**
 * Retrieve audit logs with filtering and pagination
 * Supports filtering by admin, action type, model, date range, and search
 */
export async function getAuditLogs(
  filters?: AuditLogFilters
): Promise<{ logs: AuditEvent[]; total: number }> {
  const where: any = {};

  if (filters?.adminId) {
    where.adminId = filters.adminId;
  }

  if (filters?.action) {
    where.action = filters.action;
  }

  if (filters?.affectedModel) {
    where.affectedModel = filters.affectedModel;
  }

  if (filters?.dateRange) {
    where.timestamp = {
      gte: filters.dateRange.start,
      lte: filters.dateRange.end,
    };
  }

  if (filters?.search) {
    where.OR = [
      { action: { contains: filters.search, mode: 'insensitive' } },
      { adminEmail: { contains: filters.search, mode: 'insensitive' } },
      { affectedModel: { contains: filters.search, mode: 'insensitive' } },
      { affectedId: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map(log => ({
      id: log.id,
      action: log.action,
      adminId: log.adminId,
      adminEmail: log.adminEmail,
      timestamp: log.timestamp,
      affectedModel: log.affectedModel || undefined,
      affectedId: log.affectedId || undefined,
      beforeData: log.beforeData ? JSON.parse(log.beforeData) : undefined,
      afterData: log.afterData ? JSON.parse(log.afterData) : undefined,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
    })),
    total,
  };
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLogById(id: string): Promise<AuditEvent | null> {
  const log = await prisma.auditLog.findUnique({
    where: { id },
  });

  if (!log) return null;

  return {
    id: log.id,
    action: log.action,
    adminId: log.adminId,
    adminEmail: log.adminEmail,
    timestamp: log.timestamp,
    affectedModel: log.affectedModel || undefined,
    affectedId: log.affectedId || undefined,
    beforeData: log.beforeData ? JSON.parse(log.beforeData) : undefined,
    afterData: log.afterData ? JSON.parse(log.afterData) : undefined,
    ipAddress: log.ipAddress || undefined,
    userAgent: log.userAgent || undefined,
  };
}

/**
 * Helper to log CRUD operations with before/after data
 */
export async function logCrudOperation(
  request: NextRequest,
  operation: 'create' | 'update' | 'delete',
  model: string,
  recordId: string,
  beforeData?: Record<string, any>,
  afterData?: Record<string, any>
): Promise<void> {
  await logAuditEventFromRequest(request, {
    action: `${model.toLowerCase()}_${operation}`,
    affectedModel: model,
    affectedId: recordId,
    beforeData,
    afterData,
  });
}

/**
 * Helper to log bulk operations
 */
export async function logBulkOperation(
  request: NextRequest,
  operation: string,
  model: string,
  affectedCount: number,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEventFromRequest(request, {
    action: `bulk_${operation}`,
    affectedModel: model,
    affectedCount,
    afterData: details,
  });
}

/**
 * Detect if an action is a security-sensitive event
 */
export function isSecurityEvent(action: string): boolean {
  const securityActions = [
    'user_delete',
    'bulk_delete',
    'role_change',
    'permission_change',
    'admin_login_failed',
    'unauthorized_access',
    'data_export',
    'database_reset',
  ];

  return securityActions.some(sa => action.includes(sa));
}

/**
 * Get security-related audit logs
 */
export async function getSecurityEvents(
  filters?: Omit<AuditLogFilters, 'action'>
): Promise<{ logs: AuditEvent[]; total: number }> {
  const securityActions = [
    'user_delete',
    'bulk_delete',
    'role_change',
    'permission_change',
    'admin_login_failed',
    'unauthorized_access',
    'data_export',
    'database_reset',
  ];

  const where: any = {
    OR: securityActions.map(action => ({
      action: { contains: action },
    })),
  };

  if (filters?.adminId) {
    where.adminId = filters.adminId;
  }

  if (filters?.dateRange) {
    where.timestamp = {
      gte: filters.dateRange.start,
      lte: filters.dateRange.end,
    };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map(log => ({
      id: log.id,
      action: log.action,
      adminId: log.adminId,
      adminEmail: log.adminEmail,
      timestamp: log.timestamp,
      affectedModel: log.affectedModel || undefined,
      affectedId: log.affectedId || undefined,
      beforeData: log.beforeData ? JSON.parse(log.beforeData) : undefined,
      afterData: log.afterData ? JSON.parse(log.afterData) : undefined,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
    })),
    total,
  };
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(dateRange?: {
  start: Date;
  end: Date;
}): Promise<{
  totalEvents: number;
  eventsByAction: Array<{ action: string; count: number }>;
  eventsByAdmin: Array<{ adminEmail: string; count: number }>;
  securityEventCount: number;
}> {
  const where = dateRange
    ? {
        timestamp: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }
    : {};

  const [totalEvents, eventsByAction, eventsByAdmin, securityEvents] =
    await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.groupBy({
        by: ['adminEmail'],
        where,
        _count: true,
        orderBy: { _count: { adminEmail: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.count({
        where: {
          ...where,
          OR: [
            { action: { contains: 'delete' } },
            { action: { contains: 'role' } },
            { action: { contains: 'permission' } },
            { action: { contains: 'export' } },
            { action: { contains: 'reset' } },
          ],
        },
      }),
    ]);

  return {
    totalEvents,
    eventsByAction: eventsByAction.map(e => ({
      action: e.action,
      count: e._count,
    })),
    eventsByAdmin: eventsByAdmin.map(e => ({
      adminEmail: e.adminEmail,
      count: e._count,
    })),
    securityEventCount: securityEvents,
  };
}
