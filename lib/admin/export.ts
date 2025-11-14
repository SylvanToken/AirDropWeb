import { prisma } from '@/lib/prisma';
import { FilterCriteria, buildPrismaFilter } from './filters';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  model: 'users' | 'tasks' | 'completions' | 'campaigns';
  filters?: FilterCriteria[];
  fields?: string[];
}

export interface ExportResult {
  data: string | Buffer;
  filename: string;
  mimeType: string;
}

/**
 * Export data in various formats (CSV, Excel, JSON)
 * Supports field selection and filtered exports
 */
export async function exportData(options: ExportOptions): Promise<ExportResult> {
  // Fetch data with filters
  const data = await fetchDataForExport(options);

  // Apply field selection if specified
  const processedData = options.fields ? selectFields(data, options.fields) : data;

  // Generate timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const baseFilename = `${options.model}_export_${timestamp}`;

  // Generate file based on format
  switch (options.format) {
    case 'csv': {
      const csvData = generateCSV(processedData, options.fields);
      return {
        data: csvData,
        filename: `${baseFilename}.csv`,
        mimeType: 'text/csv',
      };
    }
    case 'excel': {
      const excelBuffer = generateExcel(processedData, options.fields);
      return {
        data: excelBuffer,
        filename: `${baseFilename}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
    case 'json': {
      const jsonData = JSON.stringify(processedData, null, 2);
      return {
        data: jsonData,
        filename: `${baseFilename}.json`,
        mimeType: 'application/json',
      };
    }
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

/**
 * Fetch data from database based on model and filters
 */
async function fetchDataForExport(options: ExportOptions): Promise<any[]> {
  const filter = options.filters ? buildPrismaFilter(options.filters) : {};

  switch (options.model) {
    case 'users':
      return await prisma.user.findMany({
        where: filter,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          status: true,
          totalPoints: true,
          walletAddress: true,
          walletVerified: true,
          twitterUsername: true,
          twitterVerified: true,
          telegramUsername: true,
          telegramVerified: true,
          createdAt: true,
          lastActive: true,
        },
      });
    case 'tasks':
      return await prisma.task.findMany({
        where: filter,
        include: {
          campaign: {
            select: {
              title: true,
            },
          },
        },
      });
    case 'completions':
      return await prisma.completion.findMany({
        where: filter,
        include: {
          user: { 
            select: { 
              id: true,
              email: true, 
              username: true,
              walletAddress: true,
            } 
          },
          task: { 
            select: { 
              id: true,
              title: true,
              taskType: true,
              points: true,
            } 
          },
        },
      });
    case 'campaigns':
      return await prisma.campaign.findMany({
        where: filter,
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });
    default:
      throw new Error(`Unsupported model: ${options.model}`);
  }
}

/**
 * Select specific fields from data array
 */
function selectFields(data: any[], fields: string[]): any[] {
  return data.map(row => {
    const selected: any = {};
    fields.forEach(field => {
      const value = getNestedValue(row, field);
      if (value !== undefined) {
        selected[field] = value;
      }
    });
    return selected;
  });
}

/**
 * Generate CSV format from data
 */
function generateCSV(data: any[], fields?: string[]): string {
  if (data.length === 0) return '';

  // Flatten nested objects for CSV export
  const flattenedData = data.map(row => flattenObject(row));

  // Determine headers
  const headers = fields || Object.keys(flattenedData[0]);

  // Generate CSV rows
  const rows = flattenedData.map(row =>
    headers
      .map(field => {
        const value = row[field];
        
        // Handle different value types
        if (value === null || value === undefined) {
          return '';
        }
        
        // Convert dates to ISO string
        if (value instanceof Date) {
          return value.toISOString();
        }
        
        // Convert objects/arrays to JSON string
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        
        // Escape commas and quotes in strings
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      })
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate Excel format from data using xlsx library
 */
function generateExcel(data: any[], fields?: string[]): Buffer {
  if (data.length === 0) {
    // Create empty workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['No data available']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Flatten nested objects for Excel export
  const flattenedData = data.map(row => flattenObject(row));

  // Apply field selection if specified
  const processedData = fields 
    ? flattenedData.map(row => {
        const selected: any = {};
        fields.forEach(field => {
          if (row[field] !== undefined) {
            selected[field] = row[field];
          }
        });
        return selected;
      })
    : flattenedData;

  // Convert dates to proper format
  const formattedData = processedData.map(row => {
    const formatted: any = {};
    Object.keys(row).forEach(key => {
      const value = row[key];
      if (value instanceof Date) {
        formatted[key] = value.toISOString();
      } else if (typeof value === 'object' && value !== null) {
        formatted[key] = JSON.stringify(value);
      } else {
        formatted[key] = value;
      }
    });
    return formatted;
  });

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto-size columns
  const columnWidths = Object.keys(formattedData[0] || {}).map(key => ({
    wch: Math.max(
      key.length,
      ...formattedData.map(row => String(row[key] || '').length)
    ),
  }));
  worksheet['!cols'] = columnWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

  // Generate buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Flatten nested objects into dot notation
 */
function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = value;
    } else if (value instanceof Date) {
      flattened[newKey] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
