import { prisma } from '@/lib/prisma';

export interface SearchQuery {
  query: string;
  fields?: string[];
  operators?: SearchOperator[];
  limit?: number;
  offset?: number;
}

export interface SearchOperator {
  type: 'AND' | 'OR' | 'NOT';
  field?: string;
  value: string;
}

export interface SearchResult<T = any> {
  item: T;
  score: number;
  highlights: Record<string, string>;
  matchedFields: string[];
}

export interface SearchResponse<T = any> {
  results: SearchResult<T>[];
  total: number;
  query: string;
  executionTime: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'field' | 'value' | 'operator';
  description?: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: Date;
  userId: string;
  resultCount: number;
}

/**
 * Perform full-text search across multiple fields
 */
export async function performSearch<T = any>(
  model: 'user' | 'task' | 'completion' | 'campaign',
  searchQuery: SearchQuery
): Promise<SearchResponse<T>> {
  const startTime = Date.now();
  const { query, fields, operators, limit = 50, offset = 0 } = searchQuery;

  // Parse complex query with operators
  const parsedQuery = parseSearchQuery(query, operators);

  // Build search conditions based on model
  const searchConditions = buildSearchConditions(model, parsedQuery, fields);

  // Execute search
  let results: any[] = [];
  let total = 0;

  switch (model) {
    case 'user':
      [results, total] = await Promise.all([
        prisma.user.findMany({
          where: searchConditions,
          take: limit,
          skip: offset,
          include: {
            completions: {
              select: { id: true },
            },
          },
        }),
        prisma.user.count({ where: searchConditions }),
      ]);
      break;

    case 'task':
      [results, total] = await Promise.all([
        prisma.task.findMany({
          where: searchConditions,
          take: limit,
          skip: offset,
          include: {
            campaign: {
              select: { id: true, title: true },
            },
          },
        }),
        prisma.task.count({ where: searchConditions }),
      ]);
      break;

    case 'completion':
      [results, total] = await Promise.all([
        prisma.completion.findMany({
          where: searchConditions,
          take: limit,
          skip: offset,
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
            task: {
              select: { id: true, title: true },
            },
          },
        }),
        prisma.completion.count({ where: searchConditions }),
      ]);
      break;

    case 'campaign':
      [results, total] = await Promise.all([
        prisma.campaign.findMany({
          where: searchConditions,
          take: limit,
          skip: offset,
          include: {
            tasks: {
              select: { id: true },
            },
          },
        }),
        prisma.campaign.count({ where: searchConditions }),
      ]);
      break;
  }

  // Calculate relevance scores and generate highlights
  const searchResults: SearchResult<T>[] = results.map((item) => {
    const { score, matchedFields } = calculateRelevanceScore(
      item,
      parsedQuery,
      fields
    );
    const highlights = generateHighlights(item, parsedQuery, fields);

    return {
      item: item as T,
      score,
      highlights,
      matchedFields,
    };
  });

  // Sort by relevance score
  searchResults.sort((a, b) => b.score - a.score);

  const executionTime = Date.now() - startTime;

  return {
    results: searchResults,
    total,
    query,
    executionTime,
  };
}

/**
 * Parse search query with operators
 */
function parseSearchQuery(
  query: string,
  operators?: SearchOperator[]
): ParsedQuery {
  const terms: string[] = [];
  const andTerms: string[] = [];
  const orTerms: string[] = [];
  const notTerms: string[] = [];
  const fieldQueries: Record<string, string[]> = {};

  // Extract quoted phrases
  const quotedPhrases = query.match(/"([^"]+)"/g) || [];
  let remainingQuery = query;

  quotedPhrases.forEach((phrase) => {
    const cleanPhrase = phrase.replace(/"/g, '');
    terms.push(cleanPhrase);
    remainingQuery = remainingQuery.replace(phrase, '');
  });

  // Extract field-specific queries (e.g., email:john@example.com)
  const fieldQueryPattern = /(\w+):(\S+)/g;
  let match;
  while ((match = fieldQueryPattern.exec(remainingQuery)) !== null) {
    const [fullMatch, field, value] = match;
    if (!fieldQueries[field]) {
      fieldQueries[field] = [];
    }
    fieldQueries[field].push(value);
    remainingQuery = remainingQuery.replace(fullMatch, '');
  }

  // Split remaining query into terms
  const remainingTerms = remainingQuery
    .split(/\s+/)
    .filter((term) => term.length > 0);

  terms.push(...remainingTerms);

  // Apply operators
  if (operators) {
    operators.forEach((op) => {
      switch (op.type) {
        case 'AND':
          andTerms.push(op.value);
          break;
        case 'OR':
          orTerms.push(op.value);
          break;
        case 'NOT':
          notTerms.push(op.value);
          break;
      }
    });
  }

  return {
    terms,
    andTerms,
    orTerms,
    notTerms,
    fieldQueries,
  };
}

interface ParsedQuery {
  terms: string[];
  andTerms: string[];
  orTerms: string[];
  notTerms: string[];
  fieldQueries: Record<string, string[]>;
}

/**
 * Build Prisma search conditions
 */
function buildSearchConditions(
  model: string,
  parsedQuery: ParsedQuery,
  fields?: string[]
): any {
  const { terms, andTerms, orTerms, notTerms, fieldQueries } = parsedQuery;

  const conditions: any = {};
  const orConditions: any[] = [];
  const andConditions: any[] = [];
  const notConditions: any[] = [];

  // Get searchable fields for the model
  const searchableFields = fields || getDefaultSearchFields(model);

  // Build OR conditions for general terms (search across all fields)
  if (terms.length > 0) {
    terms.forEach((term) => {
      const termConditions = searchableFields.map((field) => ({
        [field]: {
          contains: term,
        },
      }));
      orConditions.push(...termConditions);
    });
  }

  // Build AND conditions
  if (andTerms.length > 0) {
    andTerms.forEach((term) => {
      const termConditions = searchableFields.map((field) => ({
        [field]: {
          contains: term,
        },
      }));
      andConditions.push({ OR: termConditions });
    });
  }

  // Build OR conditions for OR terms
  if (orTerms.length > 0) {
    orTerms.forEach((term) => {
      const termConditions = searchableFields.map((field) => ({
        [field]: {
          contains: term,
        },
      }));
      orConditions.push(...termConditions);
    });
  }

  // Build NOT conditions
  if (notTerms.length > 0) {
    notTerms.forEach((term) => {
      const termConditions = searchableFields.map((field) => ({
        [field]: {
          not: {
            contains: term,
          },
        },
      }));
      notConditions.push({ AND: termConditions });
    });
  }

  // Build field-specific conditions
  Object.entries(fieldQueries).forEach(([field, values]) => {
    if (searchableFields.includes(field)) {
      values.forEach((value) => {
        andConditions.push({
          [field]: {
            contains: value,
          },
        });
      });
    }
  });

  // Combine all conditions
  if (orConditions.length > 0) {
    conditions.OR = orConditions;
  }

  if (andConditions.length > 0) {
    conditions.AND = andConditions;
  }

  if (notConditions.length > 0) {
    if (conditions.AND) {
      conditions.AND.push(...notConditions);
    } else {
      conditions.AND = notConditions;
    }
  }

  return conditions;
}

/**
 * Get default searchable fields for a model
 */
function getDefaultSearchFields(model: string): string[] {
  switch (model) {
    case 'user':
      return ['username', 'email', 'walletAddress'];
    case 'task':
      return ['title', 'description', 'taskType'];
    case 'completion':
      return ['status'];
    case 'campaign':
      return ['title', 'description'];
    default:
      return [];
  }
}

/**
 * Calculate relevance score for search result
 */
function calculateRelevanceScore(
  item: any,
  parsedQuery: ParsedQuery,
  fields?: string[]
): { score: number; matchedFields: string[] } {
  let score = 0;
  const matchedFields: string[] = [];
  const searchableFields = fields || Object.keys(item);

  const allTerms = [
    ...parsedQuery.terms,
    ...parsedQuery.andTerms,
    ...parsedQuery.orTerms,
  ];

  searchableFields.forEach((field) => {
    const fieldValue = String(item[field] || '').toLowerCase();

    allTerms.forEach((term) => {
      const termLower = term.toLowerCase();

      // Exact match: highest score
      if (fieldValue === termLower) {
        score += 100;
        if (!matchedFields.includes(field)) {
          matchedFields.push(field);
        }
      }
      // Starts with: high score
      else if (fieldValue.startsWith(termLower)) {
        score += 50;
        if (!matchedFields.includes(field)) {
          matchedFields.push(field);
        }
      }
      // Contains: medium score
      else if (fieldValue.includes(termLower)) {
        score += 25;
        if (!matchedFields.includes(field)) {
          matchedFields.push(field);
        }
      }
    });

    // Field-specific queries: bonus score
    Object.entries(parsedQuery.fieldQueries).forEach(([queryField, values]) => {
      if (field === queryField) {
        values.forEach((value) => {
          if (fieldValue.includes(value.toLowerCase())) {
            score += 75;
            if (!matchedFields.includes(field)) {
              matchedFields.push(field);
            }
          }
        });
      }
    });
  });

  return { score, matchedFields };
}

/**
 * Generate highlighted text for search results
 */
function generateHighlights(
  item: any,
  parsedQuery: ParsedQuery,
  fields?: string[]
): Record<string, string> {
  const highlights: Record<string, string> = {};
  const searchableFields = fields || Object.keys(item);

  const allTerms = [
    ...parsedQuery.terms,
    ...parsedQuery.andTerms,
    ...parsedQuery.orTerms,
  ];

  searchableFields.forEach((field) => {
    const fieldValue = String(item[field] || '');
    let highlightedValue = fieldValue;

    allTerms.forEach((term) => {
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      highlightedValue = highlightedValue.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
      );
    });

    // Field-specific queries
    Object.entries(parsedQuery.fieldQueries).forEach(([queryField, values]) => {
      if (field === queryField) {
        values.forEach((value) => {
          const regex = new RegExp(`(${escapeRegex(value)})`, 'gi');
          highlightedValue = highlightedValue.replace(
            regex,
            '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
          );
        });
      }
    });

    if (highlightedValue !== fieldValue) {
      highlights[field] = highlightedValue;
    }
  });

  return highlights;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get autocomplete suggestions
 */
export async function getAutocompleteSuggestions(
  model: 'user' | 'task' | 'completion' | 'campaign',
  query: string,
  limit: number = 10
): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = [];

  if (query.length < 2) {
    return suggestions;
  }

  // Field suggestions
  const fields = getDefaultSearchFields(model);
  fields.forEach((field) => {
    if (field.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        text: `${field}:`,
        type: 'field',
        description: `Search in ${field} field`,
      });
    }
  });

  // Operator suggestions
  const operators = ['AND', 'OR', 'NOT'];
  operators.forEach((op) => {
    if (op.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        text: op,
        type: 'operator',
        description: `Use ${op} operator`,
      });
    }
  });

  // Value suggestions from database
  try {
    const valueSuggestions = await getValueSuggestions(model, query, limit);
    suggestions.push(...valueSuggestions);
  } catch (error) {
    console.error('Error getting value suggestions:', error);
  }

  return suggestions.slice(0, limit);
}

/**
 * Get value suggestions from database
 */
async function getValueSuggestions(
  model: string,
  query: string,
  limit: number
): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = [];

  switch (model) {
    case 'user':
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { email: { contains: query } },
          ],
        },
        select: { username: true, email: true },
        take: limit,
      });

      users.forEach((user) => {
        if (user.username) {
          suggestions.push({
            text: user.username,
            type: 'value',
            description: user.email,
          });
        }
      });
      break;

    case 'task':
      const tasks = await prisma.task.findMany({
        where: {
          title: { contains: query },
        },
        select: { title: true, taskType: true },
        take: limit,
      });

      tasks.forEach((task) => {
        suggestions.push({
          text: task.title,
          type: 'value',
          description: task.taskType,
        });
      });
      break;

    case 'campaign':
      const campaigns = await prisma.campaign.findMany({
        where: {
          title: { contains: query },
        },
        select: { title: true },
        take: limit,
      });

      campaigns.forEach((campaign) => {
        suggestions.push({
          text: campaign.title,
          type: 'value',
        });
      });
      break;
  }

  return suggestions;
}

/**
 * Save search to history
 */
export async function saveSearchHistory(
  userId: string,
  query: string,
  resultCount: number
): Promise<SearchHistoryEntry> {
  const entry = await prisma.searchHistory.create({
    data: {
      userId,
      query,
      resultCount,
    },
  });

  return {
    id: entry.id,
    query: entry.query,
    timestamp: entry.createdAt,
    userId: entry.userId,
    resultCount: entry.resultCount,
  };
}

/**
 * Get search history for user
 */
export async function getSearchHistory(
  userId: string,
  limit: number = 20
): Promise<SearchHistoryEntry[]> {
  const history = await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return history.map((entry: any) => ({
    id: entry.id,
    query: entry.query,
    timestamp: entry.createdAt,
    userId: entry.userId,
    resultCount: entry.resultCount,
  }));
}

/**
 * Clear search history for user
 */
export async function clearSearchHistory(userId: string): Promise<void> {
  await prisma.searchHistory.deleteMany({
    where: { userId },
  });
}

/**
 * Delete specific search history entry
 */
export async function deleteSearchHistoryEntry(
  entryId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.searchHistory.deleteMany({
      where: {
        id: entryId,
        userId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting search history entry:', error);
    return false;
  }
}
