/**
 * LocalStorage Utility Functions
 * 
 * Centralized utilities for localStorage operations with error handling
 * and type safety.
 */

/**
 * Safely get an item from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or error occurs
 * @returns Stored value or default value
 */
export function getItem<T = string>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue ?? null;
    }
    return item as T;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return defaultValue ?? null;
  }
}

/**
 * Safely get and parse JSON from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or parsing fails
 * @returns Parsed object or default value
 */
export function getJSON<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading/parsing JSON from localStorage (key: ${key}):`, error);
    return defaultValue ?? null;
  }
}

/**
 * Safely set an item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 * @returns true if successful, false otherwise
 */
export function setItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Safely set a JSON object in localStorage
 * @param key - Storage key
 * @param value - Object to store
 * @returns true if successful, false otherwise
 */
export function setJSON<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing JSON to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param key - Storage key
 * @returns true if successful, false otherwise
 */
export function removeItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Safely clear all items from localStorage
 * @returns true if successful, false otherwise
 */
export function clear(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
export function isAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all keys from localStorage
 * @param prefix - Optional prefix to filter keys
 * @returns Array of keys
 */
export function getKeys(prefix?: string): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (!prefix || key.startsWith(prefix))) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
}

/**
 * Remove all items with a specific prefix
 * @param prefix - Key prefix to match
 * @returns Number of items removed
 */
export function removeByPrefix(prefix: string): number {
  try {
    const keys = getKeys(prefix);
    keys.forEach(key => localStorage.removeItem(key));
    return keys.length;
  } catch (error) {
    console.error(`Error removing items by prefix (${prefix}):`, error);
    return 0;
  }
}

/**
 * Get the size of localStorage in bytes
 * @returns Size in bytes
 */
export function getSize(): number {
  try {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item) {
          size += key.length + item.length;
        }
      }
    }
    return size * 2; // UTF-16 uses 2 bytes per character
  } catch (error) {
    console.error('Error calculating localStorage size:', error);
    return 0;
  }
}

/**
 * Check if a key exists in localStorage
 * @param key - Storage key
 * @returns true if key exists, false otherwise
 */
export function hasKey(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage key (${key}):`, error);
    return false;
  }
}
