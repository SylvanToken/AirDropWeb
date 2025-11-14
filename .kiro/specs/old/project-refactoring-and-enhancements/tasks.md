# Implementation Plan

- [x] 1. Set up centralized theme management system





  - Create theme configuration file with all color definitions
  - Implement theme provider component
  - Generate CSS variables from theme config
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 1.1 Create central theme configuration file

  - Create `config/theme.ts` with complete color palette
  - Define light and dark mode variants
  - Include eco-themed colors (leaf, forest, earth, sky, moss)
  - Add task state colors (pending, active, completed, expired, urgent)
  - Document color usage and purpose
  - _Requirements: 5.1, 5.2, 5.5_


- [x] 1.2 Implement CSS variable generator

  - Create `lib/theme/generator.ts` utility
  - Generate CSS custom properties from theme config
  - Support nested color objects (eco.leaf, task.pending, etc.)
  - Handle HSL color format conversion
  - _Requirements: 5.2, 5.4_


- [x] 1.3 Create theme provider component

  - Implement `components/providers/ThemeProvider.tsx`
  - Provide theme context to all components
  - Handle theme switching (light/dark/system)
  - Persist user theme preference to localStorage
  - Sync with system color scheme preference
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 1.4 Migrate existing colors to theme system


  - Update `app/globals.css` to use theme variables
  - Replace hardcoded colors in `tailwind.config.ts`
  - Update component inline styles to use CSS variables
  - Remove duplicate color definitions
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 1.5 Test theme system

  - Verify theme switching works correctly
  - Test color consistency across components
  - Validate WCAG contrast ratios
  - Test system theme sync
  - _Requirements: 5.3, 5.4, 8.2, 8.3_

- [x] 2. Implement task timing system with persistent timers





  - Extend database schema for scheduled tasks
  - Create timer manager service
  - Implement timer display components
  - Add timer persistence and sync
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 2.1 Extend database schema for task timing

  - Add migration for Task model fields (scheduledDeadline, estimatedDuration, isTimeSensitive)
  - Add migration for Completion model fields (scheduledFor, actualDeadline, isExpired)
  - Update Prisma schema
  - Generate Prisma client
  - _Requirements: 1.4, 7.1_


- [x] 2.2 Create timer manager service

  - Implement `lib/tasks/timer-manager.ts`
  - Create TaskTimer interface and TimerStore class
  - Implement timer lifecycle methods (start, pause, resume, complete, expire)
  - Add localStorage persistence for timer state
  - Implement server sync for timer data
  - Handle timezone differences correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 2.3 Create timer display component

  - Implement `components/tasks/TaskTimerDisplay.tsx`
  - Show real-time countdown with seconds precision
  - Add visual urgency indicators (color changes based on remaining time)
  - Implement automatic expiration handling
  - Add ARIA live regions for screen reader support
  - Support compact and full display variants
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 2.4 Integrate timer with existing TaskCard

  - Update `components/tasks/TaskCard.tsx` to show timer for scheduled tasks
  - Display remaining time prominently
  - Show expired state for past-deadline tasks
  - Prevent completion of expired tasks
  - _Requirements: 1.1, 1.2, 1.5, 8.1, 8.2_

- [x] 2.5 Create API endpoints for timer operations


  - Create `app/api/tasks/[id]/timer/route.ts` for timer CRUD
  - Implement POST endpoint to start timer
  - Implement GET endpoint to fetch timer state
  - Implement PATCH endpoint to update timer
  - Implement DELETE endpoint to cancel timer
  - Add validation and error handling
  - _Requirements: 1.4, 7.1, 7.2, 7.3_


- [x] 2.6 Implement timer persistence and recovery

  - Save timer state to localStorage on every update
  - Load active timers on page load
  - Sync local timers with server on reconnection
  - Handle expired timers that occurred while offline
  - _Requirements: 1.4, 1.5, 7.1, 7.2, 7.3, 7.4_


- [x] 2.7 Add timer performance optimizations

  - Use single interval for all timers instead of one per timer
  - Batch timer UI updates to reduce re-renders
  - Debounce server sync operations
  - Implement efficient timer update scheduler
  - _Requirements: 1.3, 7.5_

- [x] 3. Implement task display organization (box + list view)





  - Create task organizer service
  - Implement compact list component
  - Create task container with hybrid layout
  - Add responsive grid for boxes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.1 Create task organizer service


  - Implement `lib/tasks/organizer.ts`
  - Create function to split tasks into box (first 10) and list (remaining)
  - Add sorting logic (priority, deadline, points, created)
  - Add filtering by status and type
  - Return OrganizedTasks interface with boxTasks and listTasks
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.2 Implement compact task list component


  - Create `components/tasks/TaskListCompact.tsx`
  - Display tasks in single-row format
  - Show essential info: title, points, status, timer
  - Add hover state for full details tooltip
  - Implement keyboard navigation (arrow keys, enter)
  - Add click handler to expand task details
  - _Requirements: 2.2, 2.4, 2.5, 8.5_

- [x] 3.3 Create task container component


  - Implement `components/tasks/TaskContainer.tsx`
  - Layout: Grid of boxes (first 10 tasks) + List below (remaining tasks)
  - Support responsive grid (2-4 columns based on screen size)
  - Add section headers ("Featured Tasks" and "More Tasks")
  - Handle empty states for both sections
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.4 Update tasks page to use new container


  - Modify tasks page to use TaskContainer component
  - Pass organized tasks (pending and completed separately)
  - Configure display settings (box count, sort order)
  - Maintain existing task completion functionality
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.5 Add animations for task transitions


  - Animate task moving from box to list when new tasks added
  - Smooth transition when task completes
  - Fade in/out for task state changes
  - Respect prefers-reduced-motion
  - _Requirements: 8.4_
-

- [x] 4. Optimize background image system







  - Implement background manager service
  - Update PageBackground component
  - Add image preloading
  - Fix aspect ratio and scaling
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.1 Create background manager service


  - Implement `lib/background/manager.ts`
  - Create function to get random image from all categories
  - Add image selection persistence (save current image)
  - Implement image preloading utility
  - Add fallback logic for failed image loads
  - _Requirements: 3.4_

- [x] 4.2 Update PageBackground component for full-page coverage


  - Modify `components/layout/PageBackground.tsx`
  - Use `object-fit: cover` for full coverage without distortion
  - Use `object-position: center` for proper centering
  - Set width and height to 100% of viewport
  - Maintain original aspect ratio
  - Remove size percentage limitation (currently 90%)
  - _Requirements: 3.1, 3.2, 3.3_



- [x] 4.3 Implement image rotation on refresh

  - Select new random image on every page load
  - Clear previous image selection from storage
  - Ensure different image each time (avoid immediate repeats)
  - _Requirements: 3.4_

- [x] 4.4 Add image preloading for performance


  - Create `lib/background/preloader.ts`
  - Preload current and next 2-3 images
  - Use requestIdleCallback for non-priority images
  - Cache loaded images in memory
  - _Requirements: 3.4, 3.5_

- [x] 4.5 Ensure background doesn't interfere with content


  - Verify eco-gradient overlay provides sufficient contrast
  - Test readability across all background images
  - Adjust overlay opacity if needed
  - Ensure fixed positioning doesn't cause scroll issues
  - _Requirements: 3.5_

- [x] 5. Fix logo and homepage visual issues





  - Verify logo paths and dimensions
  - Ensure logo visibility on all backgrounds
  - Fix homepage layout issues
  - Test across different screen sizes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 5.1 Audit logo component and usage

  - Review `components/ui/Logo.tsx` implementation
  - Check logo image path (`/assets/images/sylvan-token-logo.png`)
  - Verify logo displays correctly in Header and Footer
  - Test logo on homepage with various backgrounds
  - _Requirements: 4.1, 4.2, 4.4_


- [x] 5.2 Fix logo visibility issues

  - Ensure logo has sufficient contrast against backgrounds
  - Add subtle shadow or outline if needed for visibility
  - Test logo in both light and dark modes
  - Verify logo aspect ratio is maintained
  - _Requirements: 4.2, 4.3, 4.5_


- [x] 5.3 Fix homepage background and logo integration

  - Review `app/page.tsx` for background/logo issues
  - Ensure PageBackground renders correctly on homepage
  - Verify logo displays in Header on homepage
  - Test hero section with background
  - _Requirements: 4.1, 4.4_

- [x] 5.4 Test responsive logo behavior


  - Test logo on mobile devices (320px - 768px)
  - Test logo on tablets (768px - 1024px)
  - Test logo on desktop (1024px+)
  - Verify text visibility on small screens
  - _Requirements: 4.5_

- [x] 6. Code cleanup and organization





  - Analyze and remove duplicate files
  - Consolidate utility functions
  - Organize folder structure
  - Update imports across codebase
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 6.1 Identify duplicate and redundant files

  - Scan codebase for duplicate functionality
  - List files with similar purposes
  - Identify unused files
  - Document findings in cleanup report
  - _Requirements: 6.1, 6.4_


- [x] 6.2 Remove duplicate color definitions

  - Consolidate all color definitions into theme.ts
  - Remove color definitions from globals.css (keep only references)
  - Remove duplicate colors from tailwind.config.ts
  - Update components using removed colors
  - _Requirements: 6.1, 6.2_


- [x] 6.3 Consolidate utility functions

  - Move scattered utilities to `lib/utils/` folder
  - Create `lib/utils/storage.ts` for localStorage operations
  - Create `lib/utils/time.ts` for time formatting
  - Create `lib/utils/validation.ts` for validation functions
  - Remove duplicate utility implementations
  - _Requirements: 6.2, 6.3_


- [x] 6.4 Organize folder structure

  - Group related files into logical folders
  - Move task-related utilities to `lib/tasks/`
  - Move theme-related files to `lib/theme/`
  - Move background-related files to `lib/background/`
  - Update all import paths
  - _Requirements: 6.3, 6.5_


- [x] 6.5 Update documentation

  - Document new folder structure in README
  - Add JSDoc comments to new utilities
  - Update component documentation
  - Create migration guide for developers
  - _Requirements: 6.5_

- [x] 7. Integration and testing





  - Test complete task flow with timers
  - Test theme switching across all pages
  - Test background rotation
  - Verify responsive behavior
  - Test accessibility features

  - _Requirements: All requirements_

- [x] 7.1 Test task timing system end-to-end

  - Create task with scheduled deadline
  - Start timer and verify countdown
  - Wait for timer to expire
  - Verify task marked as expired
  - Test timer persistence across page refresh
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 7.2 Test task display organization





  - Load page with 15+ tasks
  - Verify first 10 shown as boxes
  - Verify remaining shown as list
  - Test sorting and filtering
  - Test responsive grid layout
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 7.3 Test background system
















  - Load page and note background image
  - Refresh page multiple times
  - Verify different images displayed
  - Test image loading performance
  - Verify no distortion or scaling issues

  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7.4 Test theme system







  - Switch between light and dark themes
  - Verify all colors update correctly
  - Test system theme sync
  - Verify theme persistence

  - Check contrast ratios
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.3_

- [x] 7.5 Test accessibility features





  - Test keyboard navigation for tasks
  - Verify screen reader announcements for timers
  - Test with reduced motion enabled

  - Verify ARIA labels and roles
  - Test focus management
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7.6 Test cross-browser compatibility




  - Test on Chrome, Firefox, Safari, Edge
  - Verify timer accuracy across browsers

  - Test background rendering
  - Verify theme switching
  - Test responsive layouts
  - _Requirements: All requirements_

- [x] 7.7 Performance testing





  - Measure timer update performance with 10+ active timers
  - Test background image loading time
  - Measure theme switch time
  - Test task list rendering with 100+ tasks
  - Verify no memory leaks
  - _Requirements: 1.3, 7.5_

- [x] 8. Final polish and deployment preparation





  - Fix any bugs found during testing
  - Optimize performance bottlenecks
  - Update user documentation
  - Prepare deployment checklist
  - _Requirements: All requirements_

- [x] 8.1 Fix bugs and issues


  - Address all bugs found during testing
  - Fix edge cases and error scenarios
  - Improve error messages
  - Add missing validations
  - _Requirements: All requirements_

- [x] 8.2 Performance optimization


  - Optimize timer update frequency
  - Reduce bundle size if needed
  - Optimize image loading
  - Minimize re-renders
  - _Requirements: 1.3, 7.5_

- [x] 8.3 Update documentation


  - Update README with new features
  - Document theme customization
  - Document timer system usage
  - Add troubleshooting guide
  - _Requirements: 6.5_

- [x] 8.4 Create deployment checklist


  - Database migration steps
  - Environment variable updates
  - Cache clearing procedures
  - Rollback procedures
  - _Requirements: All requirements_
