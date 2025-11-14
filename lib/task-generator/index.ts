import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import { generateTaskTranslations, TaskTranslations } from './translations';

// Load Sylvan Token configuration
const configPath = path.join(process.cwd(), 'config', 'sylvan-token-info.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

export interface TaskTemplate extends TaskTranslations {
  points: number;
  taskType: string;
  taskUrl?: string;
  category?: string;
  isActive?: boolean;
}

export interface EnvironmentalOrg {
  name: string;
  website: string;
  twitter?: string;
  description?: string;
}

/**
 * Parse environmental organizations from HTML file
 */
export function parseEnvironmentalOrgs(): EnvironmentalOrg[] {
  try {
    const htmlPath = path.join(process.cwd(), 'public', 'cevreciler.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const root = parse(htmlContent);
    
    const orgs: EnvironmentalOrg[] = [];
    const orgElements = root.querySelectorAll('.org');
    
    orgElements.forEach(element => {
      const name = element.getAttribute('data-name');
      const website = element.getAttribute('data-website');
      const twitter = element.getAttribute('data-twitter');
      const description = element.querySelector('p')?.text || '';
      
      if (name && website) {
        orgs.push({
          name,
          website,
          twitter: twitter || undefined,
          description
        });
      }
    });
    
    return orgs;
  } catch (error) {
    console.error('Error parsing environmental organizations:', error);
    return [];
  }
}

/**
 * Generate random tasks from Sylvan Token configuration
 */
export function generateRandomTasks(count: number = 10): TaskTemplate[] {
  const tasks: TaskTemplate[] = [];
  const categories = Object.keys(config.taskTemplates);
  
  for (let i = 0; i < count; i++) {
    // Randomly select a category
    const category = categories[Math.floor(Math.random() * categories.length)];
    const categoryTemplates = config.taskTemplates[category];
    const templateKeys = Object.keys(categoryTemplates);
    
    // Randomly select a template from the category
    const templateKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
    const template = categoryTemplates[templateKey];
    
    tasks.push({
      ...template,
      category,
      isActive: false // Default to inactive, requires admin approval
    });
  }
  
  return tasks;
}

/**
 * Generate environmental organization tasks
 */
export function generateEnvironmentalTasks(): TaskTemplate[] {
  const orgs = parseEnvironmentalOrgs();
  const tasks: TaskTemplate[] = [];
  
  orgs.forEach(org => {
    // Website visit task with translations
    const visitTranslations = generateTaskTranslations('environmental', 'visit', { org: org.name });
    tasks.push({
      ...visitTranslations,
      points: config.environmentalOrganizations.pointsPerTask.WEBSITE_VISIT,
      taskType: 'WEBSITE_VISIT',
      taskUrl: org.website,
      category: 'environmental',
      isActive: false
    });
    
    // Twitter follow task (if Twitter URL exists)
    if (org.twitter) {
      const followTranslations = generateTaskTranslations('twitter', 'follow', { account: org.name });
      tasks.push({
        ...followTranslations,
        points: config.environmentalOrganizations.pointsPerTask.TWITTER_FOLLOW,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: org.twitter,
        category: 'environmental',
        isActive: false
      });
    }
  });
  
  return tasks;
}

/**
 * Generate profile completion tasks
 */
export function generateProfileTasks(): TaskTemplate[] {
  const tasks: TaskTemplate[] = [];
  
  // Wallet connection task
  const walletTranslations = generateTaskTranslations('profile', 'wallet', {});
  tasks.push({
    ...walletTranslations,
    points: 50,
    taskType: 'WALLET_CONNECT',
    category: 'profile',
    isActive: false
  });
  
  // Twitter link task
  const twitterTranslations = generateTaskTranslations('profile', 'twitter', {});
  tasks.push({
    ...twitterTranslations,
    points: 30,
    taskType: 'TWITTER_LINK',
    category: 'profile',
    isActive: false
  });
  
  return tasks;
}

/**
 * Generate social media tasks
 */
export function generateSocialTasks(): TaskTemplate[] {
  const tasks: TaskTemplate[] = [];
  
  // Twitter follow task
  const followTranslations = generateTaskTranslations('twitter', 'follow', { account: 'Sylvan Token' });
  tasks.push({
    ...followTranslations,
    points: 20,
    taskType: 'TWITTER_FOLLOW',
    taskUrl: 'https://twitter.com/sylvantoken',
    category: 'social',
    isActive: false
  });
  
  // Twitter like task
  const likeTranslations = generateTaskTranslations('twitter', 'like', { account: 'Sylvan Token' });
  tasks.push({
    ...likeTranslations,
    points: 10,
    taskType: 'TWITTER_LIKE',
    taskUrl: 'https://twitter.com/sylvantoken',
    category: 'social',
    isActive: false
  });
  
  // Twitter retweet task
  const retweetTranslations = generateTaskTranslations('twitter', 'retweet', { account: 'Sylvan Token' });
  tasks.push({
    ...retweetTranslations,
    points: 15,
    taskType: 'TWITTER_RETWEET',
    taskUrl: 'https://twitter.com/sylvantoken',
    category: 'social',
    isActive: false
  });
  
  // Telegram join task
  const telegramTranslations = generateTaskTranslations('telegram', 'join', { channel: 'Sylvan Token' });
  tasks.push({
    ...telegramTranslations,
    points: 25,
    taskType: 'TELEGRAM_JOIN',
    taskUrl: 'https://t.me/sylvantoken',
    category: 'social',
    isActive: false
  });
  
  return tasks;
}

/**
 * Generate listing site tasks
 */
export function generateListingTasks(): TaskTemplate[] {
  const listingTemplates = config.taskTemplates.listing;
  return Object.values(listingTemplates).map((template: any) => ({
    ...template,
    category: 'listing',
    isActive: false
  }));
}

/**
 * Generate all types of tasks
 */
export function generateAllTasks(): {
  social: TaskTemplate[];
  profile: TaskTemplate[];
  environmental: TaskTemplate[];
  listing: TaskTemplate[];
  random: TaskTemplate[];
} {
  return {
    social: generateSocialTasks(),
    profile: generateProfileTasks(),
    environmental: generateEnvironmentalTasks(),
    listing: generateListingTasks(),
    random: generateRandomTasks(10)
  };
}

/**
 * Get task generation statistics
 */
export function getTaskStats() {
  const allTasks = generateAllTasks();
  
  return {
    total: Object.values(allTasks).flat().length,
    byCategory: {
      social: allTasks.social.length,
      profile: allTasks.profile.length,
      environmental: allTasks.environmental.length,
      listing: allTasks.listing.length,
      random: allTasks.random.length
    },
    environmentalOrgs: parseEnvironmentalOrgs().length
  };
}

export default {
  generateRandomTasks,
  generateEnvironmentalTasks,
  generateProfileTasks,
  generateSocialTasks,
  generateListingTasks,
  generateAllTasks,
  getTaskStats,
  parseEnvironmentalOrgs,
  config
};
