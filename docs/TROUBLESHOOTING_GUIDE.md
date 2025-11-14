# Troubleshooting Guide

This guide covers common issues and their solutions for the Sylvan Token Airdrop Platform.

## Table of Contents

- [Timer System Issues](#timer-system-issues)
- [Theme System Issues](#theme-system-issues)
- [Background Image Issues](#background-image-issues)
- [Task Organization Issues](#task-organization-issues)
- [Performance Issues](#performance-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)

## Timer System Issues

### Timer Not Starting

**Symptoms**: Timer doesn't appear or shows 0 seconds

**Possible Causes**:
1. Task doesn't have `scheduledDeadline` set
2. Timer store not initialized
3. JavaScript disabled in browser

**Solutions**:

```typescript
// Check if task has timer fields
const task = await prisma.task.findUnique({
  where: { id: taskId },
  select: {
    scheduledDeadline: true,
    estimatedDuration: true,
    isTimeSensitive: true
  }
});

console.log('Task timer fields:', task);

// Verify timer store is initialized
import { getTimerStore } from '@/lib/tasks/timer-manager';
const timerStore = getTimerStore();
console.log('Timer store:', timerStore);
```

### Timer Not Persisting

**Symptoms**: Timer resets after page refresh

**Possible Causes**:
1. localStorage not available
2. Browser in private/incognito mode
3. Storage quota exceeded

**Solutions**:

```typescript
// Check localStorage availability
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('localStorage available');
  
  // Check stored timers
  const stored = localStorage.getItem('task_timers');
  console.log('Stored timers:', stored);
} else {
  console.error('localStorage not available');
}

// Clear storage if corrupted
localStorage.removeItem('task_timers');
```

### Timer Sync Failing

**Symptoms**: Timer state not syncing with server

**Possible Causes**:
1. Network connectivity issues
2. API endpoint not responding
3. Authentication expired

**Solutions**:

```bash
# Check API endpoint
curl -X GET http://localhost:3005/api/tasks/[task-id]/timer \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Check network tab in browser DevTools
# Look for failed requests to /api/tasks/*/timer
```

### Timer Showing Wrong Time

**Symptoms**: Timer displays incorrect remaining time

**Possible Causes**:
1. System clock incorrect
2. Timezone mismatch
3. Deadline calculation error

**Solutions**:

```typescript
// Verify system time
console.log('Current time:', new Date().toISOString());

// Check deadline calculation
const now = Date.now();
const deadline = new Date(task.scheduledDeadline).getTime();
const remaining = Math.floor((deadline - now) / 1000);
console.log('Remaining seconds:', remaining);

// Verify timezone
console.log('Timezone offset:', new Date().getTimezoneOffset());
```

## Theme System Issues

### Theme Not Applying

**Symptoms**: Colors don't change when switching themes

**Possible Causes**:
1. CSS variables not generated
2. Theme provider not wrapping app
3. CSS not loaded

**Solutions**:

```typescript
// Check if theme provider is in layout
// app/layout.tsx
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Verify CSS variables in browser DevTools
// Inspect element and check Computed styles
// Look for --background, --foreground, etc.
```

### Theme Not Persisting

**Symptoms**: Theme resets to default after page refresh

**Possible Causes**:
1. localStorage not saving preference
2. Theme provider not reading stored value
3. Browser blocking cookies/storage

**Solutions**:

```typescript
// Check stored theme
const storedTheme = localStorage.getItem('theme');
console.log('Stored theme:', storedTheme);

// Manually set theme
localStorage.setItem('theme', 'dark');
window.location.reload();
```

### Colors Look Wrong

**Symptoms**: Colors don't match design or look washed out

**Possible Causes**:
1. HSL values incorrect in theme config
2. CSS variable format wrong
3. Tailwind not processing theme colors

**Solutions**:

```typescript
// Verify theme config format
// config/theme.ts
export const theme = {
  light: {
    background: 'hsl(95, 35%, 92%)',  // Must be HSL format
    foreground: 'hsl(140, 60%, 18%)',
  }
};

// Check generated CSS variables
// Should be: --background: 95 35% 92%;
// NOT: --background: hsl(95, 35%, 92%);
```

## Background Image Issues

### Background Not Loading

**Symptoms**: No background image appears, only solid color

**Possible Causes**:
1. Image path incorrect
2. Image file missing
3. Next.js Image optimization failing

**Solutions**:

```bash
# Verify image exists
ls -la public/assets/heroes/

# Check browser console for 404 errors
# Look for failed image requests

# Test image URL directly
curl -I http://localhost:3005/assets/heroes/forest/forest-1.webp
```

### Background Not Changing

**Symptoms**: Same background shows on every refresh

**Possible Causes**:
1. Random selection not working
2. Image history not clearing
3. Only one image available

**Solutions**:

```typescript
// Clear background history
localStorage.removeItem('sylvan-background-image');
localStorage.removeItem('sylvan-background-history');

// Check available images
import { getAllHeroImages } from '@/lib/hero-images';
const images = getAllHeroImages('all');
console.log('Available images:', images.length);
```

### Background Distorted

**Symptoms**: Background image stretched or cropped incorrectly

**Possible Causes**:
1. object-fit not set correctly
2. Image aspect ratio issues
3. Container sizing wrong

**Solutions**:

```tsx
// Verify Image component props
<Image
  src={backgroundImage}
  alt=""
  fill
  priority
  quality={85}
  sizes="100vw"
  className="object-cover object-center"  // Important!
/>

// Check container styles
<div className="fixed inset-0 w-full h-full">
  {/* Image here */}
</div>
```

### Background Loading Slowly

**Symptoms**: Background takes long time to appear

**Possible Causes**:
1. Image not optimized
2. No preloading
3. Network slow

**Solutions**:

```typescript
// Enable priority loading
<Image
  priority  // Loads image immediately
  quality={85}  // Balance quality vs size
/>

// Preload images
import { preloadImages } from '@/lib/background/manager';
preloadImages([image1, image2, image3]);

// Use WebP format
// Convert images: cwebp input.jpg -q 85 -o output.webp
```

## Task Organization Issues

### Tasks Not Organizing Correctly

**Symptoms**: Wrong tasks in box view or list view

**Possible Causes**:
1. Sort order incorrect
2. Filter not applied
3. Box count wrong

**Solutions**:

```typescript
// Check organization config
import { organizeTasks } from '@/lib/tasks/organizer';

const organized = organizeTasks(tasks, {
  boxCount: 10,  // Verify this value
  sortBy: 'priority',  // Check sort order
  filterBy: {
    status: 'active'  // Verify filter
  }
});

console.log('Box tasks:', organized.boxTasks.length);
console.log('List tasks:', organized.listTasks.length);
```

### Priority Calculation Wrong

**Symptoms**: Low priority tasks showing before high priority

**Possible Causes**:
1. Priority algorithm issue
2. Task fields missing
3. Deadline calculation wrong

**Solutions**:

```typescript
// Debug priority calculation
import { organizeTasks } from '@/lib/tasks/organizer';

// Check task fields
tasks.forEach(task => {
  console.log({
    id: task.id,
    isTimeSensitive: task.isTimeSensitive,
    scheduledDeadline: task.scheduledDeadline,
    points: task.points
  });
});

// Manually calculate priority
// Time-sensitive: +1000
// Deadline < 1 hour: +500
// Deadline < 1 day: +300
// Points: +points value
```

### Compact List Not Showing

**Symptoms**: Only box view appears, no list below

**Possible Causes**:
1. Less than 10 tasks total
2. Component not rendering
3. CSS hiding list

**Solutions**:

```typescript
// Check task count
console.log('Total tasks:', tasks.length);
console.log('Box tasks:', organized.boxTasks.length);
console.log('List tasks:', organized.listTasks.length);

// Verify component rendering
<TaskContainer
  tasks={tasks}
  displayConfig={{ boxCount: 10 }}
  viewMode="pending"
/>

// Check if list tasks exist
{organized.listTasks.length > 0 && (
  <TaskListCompact tasks={organized.listTasks} />
)}
```

## Performance Issues

### Slow Timer Updates

**Symptoms**: Timer UI lags or stutters

**Possible Causes**:
1. Too many re-renders
2. Multiple intervals running
3. Heavy computations in render

**Solutions**:

```typescript
// Use memoization
import { memo } from 'react';

const TaskTimerDisplay = memo(({ taskId, deadline }) => {
  // Component code
});

// Batch timer updates
// Timer manager already does this, but verify:
console.log('Active timers:', timerStore.getActiveTimers(userId).length);

// Check for multiple intervals
// Should only be one global interval
```

### Slow Page Load

**Symptoms**: Pages take long time to load

**Possible Causes**:
1. Large bundle size
2. Images not optimized
3. Too many database queries

**Solutions**:

```bash
# Analyze bundle size
npm run build
# Check .next/analyze/ for bundle report

# Optimize images
# Use WebP format, compress images

# Check database queries
# Enable Prisma query logging
# Look for N+1 queries
```

### High Memory Usage

**Symptoms**: Browser tab uses excessive memory

**Possible Causes**:
1. Memory leaks in timers
2. Too many event listeners
3. Large state objects

**Solutions**:

```typescript
// Cleanup timers on unmount
useEffect(() => {
  const timerStore = getTimerStore();
  const unsubscribe = timerStore.subscribe(callback);
  
  return () => {
    unsubscribe();  // Important!
  };
}, []);

// Check for memory leaks
// Use Chrome DevTools Memory profiler
// Take heap snapshots before/after actions
```

## Database Issues

### Migration Failures

**Symptoms**: `prisma migrate` command fails

**Solutions**:

```bash
# Check database connection
npx prisma db pull

# Reset database (⚠️ deletes data)
npx prisma migrate reset

# Apply migrations manually
npx prisma migrate resolve --applied [migration-name]
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Timer Fields Missing

**Symptoms**: Timer-related fields not in database

**Solutions**:

```bash
# Verify schema has timer fields
cat prisma/schema.prisma | grep -A 5 "model Task"

# Generate migration
npx prisma migrate dev --name add-timer-fields

# Apply migration
npx prisma migrate deploy

# Regenerate client
npx prisma generate
```

## Authentication Issues

### Session Expired

**Symptoms**: User logged out unexpectedly

**Solutions**:

```typescript
// Check session expiration
// lib/auth.ts
session: {
  maxAge: 7 * 24 * 60 * 60, // 7 days
}

// Verify NEXTAUTH_SECRET is set
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing');

// Check cookies in browser DevTools
// Look for next-auth.session-token
```

### Cannot Access Admin Panel

**Symptoms**: 403 Forbidden on /admin routes

**Solutions**:

```typescript
// Verify user role
const user = await prisma.user.findUnique({
  where: { email: 'admin@sylvantoken.org' },
  select: { role: true }
});
console.log('User role:', user?.role);

// Update role if needed
await prisma.user.update({
  where: { email: 'admin@sylvantoken.org' },
  data: { role: 'ADMIN' }
});
```

## Build and Deployment Issues

### Build Fails

**Symptoms**: `npm run build` fails with errors

**Solutions**:

```bash
# Clear cache
rm -rf .next node_modules
npm install

# Check for TypeScript errors
npx tsc --noEmit

# Check for ESLint errors
npm run lint

# Build with verbose output
npm run build -- --debug
```

### Environment Variables Not Working

**Symptoms**: App can't read environment variables

**Solutions**:

```bash
# Verify .env.local exists
ls -la .env.local

# Check variable names (must start with NEXT_PUBLIC_ for client)
# Server-side variables don't need prefix

# Restart dev server after changing .env
npm run dev

# In production, set variables in hosting platform
# Vercel: Project Settings > Environment Variables
```

### Database Connection Fails in Production

**Symptoms**: Can't connect to database after deployment

**Solutions**:

```bash
# Verify DATABASE_URL is set in production
echo $DATABASE_URL

# Check database is accessible from production server
# Test connection string

# Run migrations in production
npx prisma migrate deploy

# Check database logs for connection errors
```

## Getting Additional Help

If you're still experiencing issues:

1. **Check Logs**: Look at browser console and server logs
2. **Enable Debug Mode**: Set `DEBUG=*` environment variable
3. **Search Issues**: Check GitHub issues for similar problems
4. **Ask Community**: Post in discussions with error details
5. **Contact Support**: Reach out with reproduction steps

### Useful Debug Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Prisma version
npx prisma --version

# Check Next.js version
npm list next

# View all environment variables
printenv | grep -i next

# Check port availability
lsof -i :3005

# View running processes
ps aux | grep node
```

### Collecting Debug Information

When reporting issues, include:

1. **Error Message**: Full error text and stack trace
2. **Environment**: OS, Node version, browser
3. **Steps to Reproduce**: Exact steps that cause the issue
4. **Expected vs Actual**: What should happen vs what happens
5. **Screenshots**: Visual issues benefit from screenshots
6. **Logs**: Relevant console and server logs

---

**Last Updated**: December 2024
