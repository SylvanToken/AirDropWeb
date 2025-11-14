/**
 * Advanced Filtering System - Usage Examples
 * 
 * This file demonstrates how to use the advanced filtering system
 * with various operators and logic combinations.
 */

import { buildPrismaFilter, FilterCriteria } from './filters';
import { prisma } from '@/lib/prisma';

// Example 1: Simple equals filter
export async function getUsersByStatus(status: string) {
  const criteria: FilterCriteria[] = [
    { field: 'status', operator: 'equals', value: status },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 2: Contains filter (case-insensitive search)
export async function searchUsersByEmail(searchTerm: string) {
  const criteria: FilterCriteria[] = [
    { field: 'email', operator: 'contains', value: searchTerm },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 3: Range filter (greater than / less than)
export async function getUsersByPointsRange(min: number, max: number) {
  const criteria: FilterCriteria[] = [
    { field: 'totalPoints', operator: 'gt', value: min },
    { field: 'totalPoints', operator: 'lt', value: max },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 4: Between filter
export async function getUsersByPointsBetween(min: number, max: number) {
  const criteria: FilterCriteria[] = [
    { field: 'totalPoints', operator: 'between', value: [min, max] },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 5: In filter (multiple values)
export async function getUsersByMultipleStatuses(statuses: string[]) {
  const criteria: FilterCriteria[] = [
    { field: 'status', operator: 'in', value: statuses },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 6: Multiple AND conditions
export async function getActiveUsersWithHighPoints(minPoints: number) {
  const criteria: FilterCriteria[] = [
    { field: 'status', operator: 'equals', value: 'ACTIVE' },
    { field: 'totalPoints', operator: 'gt', value: minPoints },
    { field: 'walletVerified', operator: 'equals', value: true },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 7: OR conditions
export async function getUsersByMultipleStatusesUsingOR() {
  const criteria: FilterCriteria[] = [
    { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
    { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 8: Complex AND/OR combination
export async function getComplexUserFilter() {
  const criteria: FilterCriteria[] = [
    // AND: Must have high points
    { field: 'totalPoints', operator: 'gt', value: 1000 },
    // AND: Must be verified
    { field: 'walletVerified', operator: 'equals', value: true },
    // OR: Can be either ACTIVE or PENDING
    { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
    { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
  ];
  
  const filter = buildPrismaFilter(criteria);
  // This generates: { AND: [{ totalPoints: { gt: 1000 } }, { walletVerified: true }, { OR: [{ status: 'ACTIVE' }, { status: 'PENDING' }] }] }
  return await prisma.user.findMany({ where: filter });
}

// Example 9: Date range filter
export async function getUsersCreatedInDateRange(startDate: Date, endDate: Date) {
  const criteria: FilterCriteria[] = [
    { field: 'createdAt', operator: 'between', value: [startDate, endDate] },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 10: Search with multiple fields
export async function searchUsersAcrossFields(searchTerm: string) {
  const criteria: FilterCriteria[] = [
    { field: 'email', operator: 'contains', value: searchTerm, logic: 'OR' },
    { field: 'username', operator: 'contains', value: searchTerm, logic: 'OR' },
    { field: 'walletAddress', operator: 'contains', value: searchTerm, logic: 'OR' },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.user.findMany({ where: filter });
}

// Example 11: Filter completions by status and date
export async function getCompletionsByStatusAndDate(
  status: string,
  startDate: Date,
  endDate: Date
) {
  const criteria: FilterCriteria[] = [
    { field: 'status', operator: 'equals', value: status },
    { field: 'completedAt', operator: 'between', value: [startDate, endDate] },
  ];
  
  const filter = buildPrismaFilter(criteria);
  return await prisma.completion.findMany({
    where: filter,
    include: {
      user: true,
      task: true,
    },
  });
}

// Example 12: Advanced user filtering with pagination
export async function getFilteredUsersWithPagination(
  criteria: FilterCriteria[],
  page: number = 1,
  pageSize: number = 20
) {
  const filter = buildPrismaFilter(criteria);
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: filter,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: filter }),
  ]);
  
  return {
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// Example 13: Filter with additional conditions
export async function getFilteredUsersWithAdditionalConditions(
  criteria: FilterCriteria[],
  additionalWhere?: any
) {
  const filter = buildPrismaFilter(criteria);
  
  // Combine filter with additional conditions
  const where = additionalWhere
    ? { AND: [filter, additionalWhere] }
    : filter;
  
  return await prisma.user.findMany({ where });
}
