import { prisma } from '@/lib/prisma';

export interface FilterCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface FilterPreset {
  id: string;
  name: string;
  criteria: FilterCriteria[];
  createdBy: string;
}

export function buildPrismaFilter(criteria: FilterCriteria[]): any {
  if (criteria.length === 0) {
    return {};
  }

  // Group criteria by logic operator
  const andCriteria: FilterCriteria[] = [];
  const orCriteria: FilterCriteria[] = [];

  for (const criterion of criteria) {
    if (criterion.logic === 'OR') {
      orCriteria.push(criterion);
    } else {
      // Default to AND
      andCriteria.push(criterion);
    }
  }

  // Build individual filter conditions
  const buildCondition = (criterion: FilterCriteria) => {
    const { field, operator, value } = criterion;

    switch (operator) {
      case 'equals':
        return { [field]: value };
      case 'contains':
        return { [field]: { contains: value, mode: 'insensitive' } };
      case 'gt':
        return { [field]: { gt: value } };
      case 'lt':
        return { [field]: { lt: value } };
      case 'between':
        return { [field]: { gte: value[0], lte: value[1] } };
      case 'in':
        return { [field]: { in: value } };
      default:
        return {};
    }
  };

  // Build the final filter
  const filter: any = {};

  // Add AND conditions
  if (andCriteria.length > 0) {
    const andConditions = andCriteria.map(buildCondition);
    if (andConditions.length === 1) {
      Object.assign(filter, andConditions[0]);
    } else {
      filter.AND = andConditions;
    }
  }

  // Add OR conditions
  if (orCriteria.length > 0) {
    const orConditions = orCriteria.map(buildCondition);
    if (filter.AND) {
      // Combine AND and OR - add OR group to AND array
      filter.AND.push({ OR: orConditions });
    } else if (Object.keys(filter).length > 0) {
      // We have a single AND condition, need to wrap it
      const existingCondition = { ...filter };
      Object.keys(filter).forEach(key => delete filter[key]);
      filter.AND = [existingCondition, { OR: orConditions }];
    } else {
      // Only OR conditions
      filter.OR = orConditions;
    }
  }

  return filter;
}

export async function saveFilterPreset(
  preset: Omit<FilterPreset, 'id'>
): Promise<FilterPreset> {
  const created = await prisma.filterPreset.create({
    data: {
      name: preset.name,
      criteria: JSON.stringify(preset.criteria),
      createdBy: preset.createdBy,
    },
  });

  return {
    id: created.id,
    name: created.name,
    criteria: JSON.parse(created.criteria) as FilterCriteria[],
    createdBy: created.createdBy,
  };
}

export async function getFilterPresets(userId: string): Promise<FilterPreset[]> {
  const presets = await prisma.filterPreset.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: 'desc' },
  });

  return presets.map(preset => ({
    id: preset.id,
    name: preset.name,
    criteria: JSON.parse(preset.criteria) as FilterCriteria[],
    createdBy: preset.createdBy,
  }));
}

export async function getFilterPresetById(
  presetId: string,
  userId: string
): Promise<FilterPreset | null> {
  const preset = await prisma.filterPreset.findFirst({
    where: {
      id: presetId,
      createdBy: userId,
    },
  });

  if (!preset) {
    return null;
  }

  return {
    id: preset.id,
    name: preset.name,
    criteria: JSON.parse(preset.criteria) as FilterCriteria[],
    createdBy: preset.createdBy,
  };
}

export async function updateFilterPreset(
  presetId: string,
  userId: string,
  updates: { name?: string; criteria?: FilterCriteria[] }
): Promise<FilterPreset | null> {
  const preset = await prisma.filterPreset.findFirst({
    where: {
      id: presetId,
      createdBy: userId,
    },
  });

  if (!preset) {
    return null;
  }

  const updated = await prisma.filterPreset.update({
    where: { id: presetId },
    data: {
      ...(updates.name && { name: updates.name }),
      ...(updates.criteria && { criteria: JSON.stringify(updates.criteria) }),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    criteria: JSON.parse(updated.criteria) as FilterCriteria[],
    createdBy: updated.createdBy,
  };
}

export async function deleteFilterPreset(
  presetId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.filterPreset.deleteMany({
      where: {
        id: presetId,
        createdBy: userId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting filter preset:', error);
    return false;
  }
}

// Helper function to validate filter criteria
export function validateFilterCriteria(criteria: FilterCriteria[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (let i = 0; i < criteria.length; i++) {
    const criterion = criteria[i];

    if (!criterion.field) {
      errors.push(`Criterion ${i + 1}: field is required`);
    }

    if (!criterion.operator) {
      errors.push(`Criterion ${i + 1}: operator is required`);
    }

    if (criterion.value === undefined || criterion.value === null) {
      errors.push(`Criterion ${i + 1}: value is required`);
    }

    if (criterion.operator === 'between') {
      if (!Array.isArray(criterion.value) || criterion.value.length !== 2) {
        errors.push(
          `Criterion ${i + 1}: 'between' operator requires an array of two values`
        );
      }
    }

    if (criterion.operator === 'in') {
      if (!Array.isArray(criterion.value)) {
        errors.push(
          `Criterion ${i + 1}: 'in' operator requires an array of values`
        );
      }
    }

    if (criterion.logic && !['AND', 'OR'].includes(criterion.logic)) {
      errors.push(
        `Criterion ${i + 1}: logic must be either 'AND' or 'OR'`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Helper function to apply filters to a Prisma query
export async function applyFiltersToQuery<T>(
  model: any,
  criteria: FilterCriteria[],
  additionalWhere?: any
): Promise<T[]> {
  const filter = buildPrismaFilter(criteria);
  const where = additionalWhere
    ? { AND: [filter, additionalWhere] }
    : filter;

  return await model.findMany({ where });
}
