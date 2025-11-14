# Utility Functions

This directory contains centralized utility functions for common operations throughout the application.

## Overview

The utilities are organized into three main modules:

- **storage** - LocalStorage operations with error handling
- **time** - Time and duration formatting utilities
- **validation** - Common validation functions

## Usage

### Import All Utilities

```typescript
import { storage, time, validation } from '@/lib/utils';

// Use namespaced
storage.setJSON('key', { data: 'value' });
time.formatDuration(3600);
validation.isValidEmail('user@example.com');
```

### Import Specific Functions

```typescript
import { setJSON, formatDuration, isValidEmail } from '@/lib/utils';

setJSON('key', { data: 'value' });
formatDuration(3600);
isValidEmail('user@example.com');
```

## Storage Utilities

Centralized localStorage operations with error handling and type safety.

### Functions

#### `getItem<T>(key: string, defaultValue?: T): T | null`
Safely get an item from localStorage.

```typescript
const value = storage.getItem('theme', 'light');
```

#### `getJSON<T>(key: string, defaultValue?: T): T | null`
Safely get and parse JSON from localStorage.

```typescript
const user = storage.getJSON<User>('user', null);
```

#### `setItem(key: string, value: string): boolean`
Safely set an item in localStorage.

```typescript
storage.setItem('theme', 'dark');
```

#### `setJSON<T>(key: string, value: T): boolean`
Safely set a JSON object in localStorage.

```typescript
storage.setJSON('user', { id: 1, name: 'John' });
```

#### `removeItem(key: string): boolean`
Safely remove an item from localStorage.

```typescript
storage.removeItem('theme');
```

#### `clear(): boolean`
Safely clear all items from localStorage.

```typescript
storage.clear();
```

#### `isAvailable(): boolean`
Check if localStorage is available.

```typescript
if (storage.isAvailable()) {
  // Use localStorage
}
```

#### `getKeys(prefix?: string): string[]`
Get all keys from localStorage, optionally filtered by prefix.

```typescript
const themeKeys = storage.getKeys('theme-');
```

#### `removeByPrefix(prefix: string): number`
Remove all items with a specific prefix.

```typescript
const removed = storage.removeByPrefix('cache-');
```

#### `getSize(): number`
Get the size of localStorage in bytes.

```typescript
const sizeInBytes = storage.getSize();
```

#### `hasKey(key: string): boolean`
Check if a key exists in localStorage.

```typescript
if (storage.hasKey('user')) {
  // Key exists
}
```

## Time Utilities

Time and duration formatting utilities.

### Functions

#### `formatTime(seconds: number, includeHours?: boolean): string`
Format seconds to HH:MM:SS or MM:SS format.

```typescript
time.formatTime(3665); // "01:01:05"
time.formatTime(65);   // "01:05"
```

#### `formatDuration(seconds: number, short?: boolean): string`
Format duration to human-readable string.

```typescript
time.formatDuration(3665);        // "1h 1m 5s"
time.formatDuration(3665, false); // "1 hour 1 minute 5 seconds"
```

#### `formatDurationCompact(seconds: number): string`
Format duration to compact string.

```typescript
time.formatDurationCompact(3665); // "1:01:05"
time.formatDurationCompact(65);   // "1:05"
```

#### `formatRemainingTime(seconds: number): string`
Format remaining time with appropriate unit.

```typescript
time.formatRemainingTime(3600); // "1 hour left"
time.formatRemainingTime(60);   // "1 minute left"
time.formatRemainingTime(30);   // "30 seconds left"
```

#### `parseTime(timeString: string): number | null`
Parse time string (HH:MM:SS or MM:SS) to seconds.

```typescript
time.parseTime("01:30:00"); // 5400
time.parseTime("30:00");    // 1800
```

#### `getTimeAgo(date: Date, now?: Date): string`
Get time ago string.

```typescript
const past = new Date(Date.now() - 3600000);
time.getTimeAgo(past); // "1 hour ago"
```

#### `getTimeUntil(date: Date, now?: Date): string`
Get time until string.

```typescript
const future = new Date(Date.now() + 3600000);
time.getTimeUntil(future); // "in 1 hour"
```

#### `isPast(date: Date, now?: Date): boolean`
Check if a date is in the past.

```typescript
time.isPast(new Date('2020-01-01')); // true
```

#### `isFuture(date: Date, now?: Date): boolean`
Check if a date is in the future.

```typescript
time.isFuture(new Date('2030-01-01')); // true
```

#### `addSeconds(date: Date, seconds: number): Date`
Add seconds to a date.

```typescript
const future = time.addSeconds(new Date(), 3600);
```

#### `getSecondsBetween(start: Date, end: Date): number`
Get seconds between two dates.

```typescript
const seconds = time.getSecondsBetween(start, end);
```

## Validation Utilities

Common validation functions for forms and data.

### Functions

#### `isValidEmail(email: string): boolean`
Check if a string is a valid email address.

```typescript
validation.isValidEmail('user@example.com'); // true
```

#### `isValidUrl(url: string): boolean`
Check if a string is a valid URL.

```typescript
validation.isValidUrl('https://example.com'); // true
```

#### `isValidBEP20Address(address: string): boolean`
Check if a string is a valid BEP20 wallet address.

```typescript
validation.isValidBEP20Address('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'); // true
```

#### `isNotEmpty(value: string): boolean`
Check if a string is not empty (after trimming).

```typescript
validation.isNotEmpty('  hello  '); // true
validation.isNotEmpty('   ');       // false
```

#### `hasMinLength(value: string, minLength: number): boolean`
Check if a string has minimum length.

```typescript
validation.hasMinLength('hello', 3); // true
```

#### `hasMaxLength(value: string, maxLength: number): boolean`
Check if a string has maximum length.

```typescript
validation.hasMaxLength('hello', 10); // true
```

#### `isLengthInRange(value: string, minLength: number, maxLength: number): boolean`
Check if a string is within length range.

```typescript
validation.isLengthInRange('hello', 3, 10); // true
```

#### `isValidNumber(value: any): boolean`
Check if a value is a valid number.

```typescript
validation.isValidNumber(42);    // true
validation.isValidNumber(NaN);   // false
```

#### `isNumberInRange(value: number, min: number, max: number): boolean`
Check if a number is within range.

```typescript
validation.isNumberInRange(5, 1, 10); // true
```

#### `isPositive(value: number): boolean`
Check if a number is positive.

```typescript
validation.isPositive(5);  // true
validation.isPositive(-5); // false
```

#### `isNonNegative(value: number): boolean`
Check if a number is non-negative.

```typescript
validation.isNonNegative(0);  // true
validation.isNonNegative(-1); // false
```

#### `isAlphanumeric(value: string): boolean`
Check if a string contains only alphanumeric characters.

```typescript
validation.isAlphanumeric('abc123'); // true
validation.isAlphanumeric('abc-123'); // false
```

#### `isAlpha(value: string): boolean`
Check if a string contains only letters.

```typescript
validation.isAlpha('abc'); // true
validation.isAlpha('abc123'); // false
```

#### `isNumeric(value: string): boolean`
Check if a string contains only digits.

```typescript
validation.isNumeric('123'); // true
validation.isNumeric('12.3'); // false
```

#### `matchesPattern(value: string, pattern: RegExp): boolean`
Check if a string matches a regex pattern.

```typescript
validation.matchesPattern('abc123', /^[a-z0-9]+$/); // true
```

#### `isValidDate(date: any): boolean`
Check if a date is valid.

```typescript
validation.isValidDate(new Date()); // true
validation.isValidDate(new Date('invalid')); // false
```

#### `isDateInPast(date: Date): boolean`
Check if a date is in the past.

```typescript
validation.isDateInPast(new Date('2020-01-01')); // true
```

#### `isDateInFuture(date: Date): boolean`
Check if a date is in the future.

```typescript
validation.isDateInFuture(new Date('2030-01-01')); // true
```

#### `isArrayNotEmpty<T>(array: T[]): boolean`
Check if an array is not empty.

```typescript
validation.isArrayNotEmpty([1, 2, 3]); // true
validation.isArrayNotEmpty([]); // false
```

#### `isObjectNotEmpty(obj: any): boolean`
Check if an object is not empty.

```typescript
validation.isObjectNotEmpty({ key: 'value' }); // true
validation.isObjectNotEmpty({}); // false
```

#### `sanitizeHtml(value: string): string`
Sanitize a string by removing HTML tags.

```typescript
validation.sanitizeHtml('<p>Hello</p>'); // "Hello"
```

#### `normalizeWhitespace(value: string): string`
Trim and normalize whitespace in a string.

```typescript
validation.normalizeWhitespace('  hello   world  '); // "hello world"
```

#### `isNullOrUndefined(value: any): boolean`
Check if a value is null or undefined.

```typescript
validation.isNullOrUndefined(null); // true
validation.isNullOrUndefined(undefined); // true
validation.isNullOrUndefined(0); // false
```

#### `isDefined<T>(value: T | null | undefined): boolean`
Check if a value is defined (not null or undefined).

```typescript
validation.isDefined(0); // true
validation.isDefined(null); // false
```

### Validation Helpers

#### `validateAll(validations: Array<() => string | null>): string | null`
Validate multiple conditions and return first error.

```typescript
const error = validation.validateAll([
  () => validation.required('Name')(name),
  () => validation.minLength('Name', 3)(name),
  () => validation.email('Email')(email),
]);
```

#### `required(fieldName: string): (value: any) => string | null`
Create a validation function that checks if value is required.

```typescript
const validateName = validation.required('Name');
const error = validateName(''); // "Name is required"
```

#### `minLength(fieldName: string, minLength: number): (value: string) => string | null`
Create a validation function that checks minimum length.

```typescript
const validateName = validation.minLength('Name', 3);
const error = validateName('ab'); // "Name must be at least 3 characters"
```

#### `maxLength(fieldName: string, maxLength: number): (value: string) => string | null`
Create a validation function that checks maximum length.

```typescript
const validateName = validation.maxLength('Name', 50);
const error = validateName('a'.repeat(51)); // "Name must be at most 50 characters"
```

#### `email(fieldName: string): (value: string) => string | null`
Create a validation function that checks email format.

```typescript
const validateEmail = validation.email('Email');
const error = validateEmail('invalid'); // "Email must be a valid email address"
```

## Best Practices

1. **Error Handling**: All storage functions include try-catch blocks and return boolean success indicators or default values.

2. **Type Safety**: Use TypeScript generics for type-safe storage operations:
   ```typescript
   interface User {
     id: number;
     name: string;
   }
   
   const user = storage.getJSON<User>('user');
   ```

3. **Validation Composition**: Combine validation functions for complex validation:
   ```typescript
   const error = validation.validateAll([
     () => validation.required('Email')(email),
     () => validation.email('Email')(email),
   ]);
   ```

4. **Time Formatting**: Choose the appropriate format for your use case:
   - `formatTime()` for timer displays
   - `formatDuration()` for human-readable durations
   - `formatRemainingTime()` for countdown displays

## Migration Guide

If you're migrating from existing utility functions:

### Storage Operations

**Before:**
```typescript
try {
  localStorage.setItem('key', JSON.stringify(value));
} catch (error) {
  console.error(error);
}
```

**After:**
```typescript
import { setJSON } from '@/lib/utils';

setJSON('key', value);
```

### Time Formatting

**Before:**
```typescript
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
```

**After:**
```typescript
import { formatTime } from '@/lib/utils';

formatTime(seconds);
```

### Validation

**Before:**
```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**After:**
```typescript
import { isValidEmail } from '@/lib/utils';

isValidEmail(email);
```

## Testing

All utility functions include comprehensive error handling and edge case management. When testing:

1. Test with valid inputs
2. Test with invalid inputs (null, undefined, empty strings)
3. Test edge cases (negative numbers, very large values, special characters)
4. Test error conditions (localStorage unavailable, invalid JSON)

## Contributing

When adding new utility functions:

1. Add the function to the appropriate module (storage, time, or validation)
2. Include JSDoc comments with description, parameters, and return value
3. Export the function from the module
4. Add the export to `index.ts`
5. Update this README with usage examples
6. Add tests for the new function
