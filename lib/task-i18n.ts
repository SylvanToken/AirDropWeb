/**
 * Task Internationalization Helper
 * Provides localized task titles and descriptions
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  titleTr?: string | null;
  descriptionTr?: string | null;
  titleAr?: string | null;
  descriptionAr?: string | null;
  titleDe?: string | null;
  descriptionDe?: string | null;
  titleEs?: string | null;
  descriptionEs?: string | null;
  titleKo?: string | null;
  descriptionKo?: string | null;
  titleRu?: string | null;
  descriptionRu?: string | null;
  titleZh?: string | null;
  descriptionZh?: string | null;
  [key: string]: any;
}

/**
 * Get localized task title and description
 */
export function getLocalizedTask(task: Task, locale: string): { title: string; description: string } {
  const localeMap: Record<string, { title: keyof Task; description: keyof Task }> = {
    en: { title: 'title', description: 'description' },
    tr: { title: 'titleTr', description: 'descriptionTr' },
    ar: { title: 'titleAr', description: 'descriptionAr' },
    de: { title: 'titleDe', description: 'descriptionDe' },
    es: { title: 'titleEs', description: 'descriptionEs' },
    ko: { title: 'titleKo', description: 'descriptionKo' },
    ru: { title: 'titleRu', description: 'descriptionRu' },
    zh: { title: 'titleZh', description: 'descriptionZh' },
  };

  const keys = localeMap[locale] || localeMap.en;
  
  return {
    title: (task[keys.title] as string) || task.title,
    description: (task[keys.description] as string) || task.description,
  };
}

/**
 * Get localized tasks array
 */
export function getLocalizedTasks(tasks: Task[], locale: string): Task[] {
  return tasks.map(task => {
    const localized = getLocalizedTask(task, locale);
    return {
      ...task,
      title: localized.title,
      description: localized.description,
    };
  });
}

/**
 * Check if task has translation for a specific locale
 */
export function hasTranslation(task: Task, locale: string): boolean {
  const localeMap: Record<string, keyof Task> = {
    tr: 'titleTr',
    ar: 'titleAr',
    de: 'titleDe',
    es: 'titleEs',
    ko: 'titleKo',
    ru: 'titleRu',
    zh: 'titleZh',
  };

  if (locale === 'en') return true; // English is always available
  
  const titleKey = localeMap[locale];
  return titleKey ? !!task[titleKey] : false;
}

/**
 * Get available translations for a task
 */
export function getAvailableTranslations(task: Task): string[] {
  const locales = ['en']; // English is always available
  
  const localeMap: Record<string, keyof Task> = {
    tr: 'titleTr',
    ar: 'titleAr',
    de: 'titleDe',
    es: 'titleEs',
    ko: 'titleKo',
    ru: 'titleRu',
    zh: 'titleZh',
  };

  Object.entries(localeMap).forEach(([locale, key]) => {
    if (task[key]) {
      locales.push(locale);
    }
  });

  return locales;
}

export default {
  getLocalizedTask,
  getLocalizedTasks,
  hasTranslation,
  getAvailableTranslations,
};
