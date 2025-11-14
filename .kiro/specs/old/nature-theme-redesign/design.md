# Design Document

## Overview

Bu tasarım, mevcut Next.js uygulamasını "Wild Nature" temalı yeşil renk paletine dönüştürmek için kapsamlı bir yaklaşım sunmaktadır. Tasarım, koyu orman yeşili ve açık lime yeşili tonlarını kullanarak doğal, modern ve profesyonel bir görünüm sağlayacaktır. 4K derinlik efektleri, neon parlama efektleri ve glassmorphism teknikleri kullanılarak görsel zenginlik artırılacaktır.

## Architecture

### Color System Architecture

Renk sistemi, CSS custom properties (değişkenler) ve Tailwind CSS konfigürasyonu üzerinden merkezi olarak yönetilecektir. Bu yaklaşım, tutarlılık ve bakım kolaylığı sağlar.

```
┌─────────────────────────────────────────┐
│         CSS Custom Properties           │
│         (globals.css :root)              │
│  - Primary Colors (Dark/Light Mode)     │
│  - Eco Theme Colors                     │
│  - Opacity Values                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Tailwind Config Extension          │
│  - Color Mappings                       │
│  - Utility Classes                      │
│  - Custom Variants                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Component Layer                 │
│  - Card Components                      │
│  - Button Components                    │
│  - Layout Components                    │
└─────────────────────────────────────────┘
```

### Component Architecture

```
Application
├── Global Styles (globals.css)
│   ├── CSS Variables
│   ├── Base Styles
│   ├── Utility Classes
│   └── Animation Keyframes
│
├── Theme Configuration (tailwind.config.ts)
│   ├── Color Extensions
│   ├── Shadow Extensions
│   └── Animation Extensions
│
├── Layout Components
│   ├── Header (with new colors)
│   ├── Footer (with new colors)
│   ├── Sidebar (with new colors)
│   └── PageBackground (updated gradients)
│
├── UI Components
│   ├── Card (neon variant enhanced)
│   ├── Button (neon glow effects)
│   ├── Input (neon focus rings)
│   └── Badge (eco-themed)
│
└── Page Components
    ├── Home Page (hero, features, CTA)
    ├── User Dashboard (profile, tasks)
    └── Admin Dashboard (stats, task grid)
```

## Components and Interfaces

### 1. Color Palette Definition

#### Primary Colors (Light Mode)
```css
--background: 95 35% 92%;           /* Very light sage green */
--foreground: 140 60% 18%;          /* Deep forest green */
--primary: 140 60% 18%;             /* Deep forest green */
--primary-foreground: 85 65% 55%;   /* Lime green */
--accent: 85 65% 55%;               /* Lime green */
--accent-foreground: 140 60% 18%;   /* Deep forest green */
```

#### Primary Colors (Dark Mode)
```css
--background: 140 35% 10%;          /* Very dark forest */
--foreground: 85 65% 55%;           /* Lime green */
--primary: 85 65% 55%;              /* Lime green */
--primary-foreground: 140 35% 10%;  /* Very dark forest */
--accent: 85 70% 60%;               /* Bright lime */
--accent-foreground: 140 35% 10%;   /* Very dark forest */
```

#### Eco Theme Colors
```css
--eco-leaf: 85 65% 55%;             /* Lime green - #9cb86e */
--eco-forest: 140 60% 18%;          /* Dark forest - #2d5016 */
--eco-earth: 85 35% 40%;            /* Olive green */
--eco-moss: 100 40% 38%;            /* Moss green */
--eco-sky: 95 35% 65%;              /* Sage green */
```

### 2. Card Component Enhancement

#### Neon Variant (Enhanced)
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'neon';
  gradient?: boolean;
  organic?: boolean;
  depth?: '1' | '2' | '3'; // 4K depth levels
}
```

**Neon Variant Styles:**
```css
.card-neon {
  background: linear-gradient(135deg, 
    hsl(var(--card)) 0%, 
    hsl(var(--eco-leaf) / 0.05) 100%
  );
  border: 1px solid hsl(var(--eco-leaf) / 0.3);
  box-shadow: 
    0 0 10px hsla(var(--eco-leaf), 0.2),
    0 0 20px hsla(var(--eco-leaf), 0.1),
    0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  opacity: 0.9;
}

.card-neon:hover {
  border-color: hsl(var(--eco-leaf) / 0.5);
  box-shadow: 
    0 0 15px hsla(var(--eco-leaf), 0.3),
    0 0 30px hsla(var(--eco-leaf), 0.2),
    0 8px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### 3. 4K Depth System

#### Depth Layers
```css
/* Layer 1 - Subtle depth */
.depth-4k-1 {
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.05),
    0 0 10px hsla(var(--eco-leaf), 0.05);
  transform: translateZ(10px);
}

/* Layer 2 - Medium depth */
.depth-4k-2 {
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.06),
    0 8px 16px rgba(0, 0, 0, 0.06),
    0 16px 32px rgba(0, 0, 0, 0.06),
    0 0 20px hsla(var(--eco-leaf), 0.1);
  transform: translateZ(20px);
}

/* Layer 3 - Maximum depth */
.depth-4k-3 {
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.07),
    0 8px 16px rgba(0, 0, 0, 0.07),
    0 16px 32px rgba(0, 0, 0, 0.07),
    0 32px 64px rgba(0, 0, 0, 0.07),
    0 0 30px hsla(var(--eco-leaf), 0.15);
  transform: translateZ(30px);
}
```

### 4. Admin Task Grid Layout

#### Grid Configuration
```typescript
interface TaskGridProps {
  tasks: Task[];
  onDelete: (taskId: string) => Promise<void>;
}
```

**Responsive Grid Classes:**
```css
/* Large screens: 5 columns */
@media (min-width: 1280px) {
  .task-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 1rem;
  }
}

/* Medium screens: 3 columns */
@media (min-width: 768px) and (max-width: 1279px) {
  .task-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }
}

/* Small screens: 1 column */
@media (max-width: 767px) {
  .task-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.5rem;
  }
}
```

### 5. Task Card with Delete Button

#### Task Card Component
```typescript
interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => Promise<void>;
  showDeleteButton?: boolean;
}
```

**Task Card Layout:**
```
┌─────────────────────────────────────┐
│  Task Title              [X Delete] │
│  ─────────────────────────────────  │
│  Description text here...           │
│                                     │
│  💰 Points  |  ✓ Completions       │
│  📋 Campaign | 🏷️ Type             │
│                                     │
│  [Edit Button]                      │
└─────────────────────────────────────┘
```

### 6. Neon Effects System

#### Button Neon Glow
```css
.btn-neon {
  background: linear-gradient(135deg, 
    hsl(var(--eco-leaf)), 
    hsl(var(--eco-forest))
  );
  box-shadow: 
    0 0 10px hsla(var(--eco-leaf), 0.3),
    0 0 20px hsla(var(--eco-leaf), 0.2),
    0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.btn-neon:hover {
  box-shadow: 
    0 0 15px hsla(var(--eco-leaf), 0.5),
    0 0 30px hsla(var(--eco-leaf), 0.3),
    0 0 45px hsla(var(--eco-leaf), 0.2),
    0 8px 25px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}
```

#### Input Neon Focus
```css
.input-neon:focus {
  outline: none;
  border-color: hsl(var(--eco-leaf));
  box-shadow: 
    0 0 0 3px hsla(var(--eco-leaf), 0.2),
    0 0 10px hsla(var(--eco-leaf), 0.3),
    0 0 20px hsla(var(--eco-leaf), 0.1);
}
```

## Data Models

### Theme Configuration Model
```typescript
interface ThemeConfig {
  colors: {
    light: ColorPalette;
    dark: ColorPalette;
  };
  effects: {
    opacity: number;        // 0.9 (90%)
    depthLayers: number;    // 3 (for 4K depth)
    neonIntensity: number;  // 0.3 (30%)
  };
  aspectRatio: {
    cards: string;          // "1/1" or "auto"
    images: string;         // "auto" or specific ratio
  };
}

interface ColorPalette {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ecoLeaf: string;
  ecoForest: string;
  ecoEarth: string;
  ecoMoss: string;
  ecoSky: string;
}
```

### Task Model (Extended)
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  taskType: string;
  isActive: boolean;
  campaign: {
    id: string;
    title: string;
  };
  _count: {
    completions: number;
  };
  // UI-specific properties
  canDelete?: boolean;
  isDeleting?: boolean;
}
```

## Error Handling

### Color Contrast Validation
```typescript
function validateContrast(
  foreground: string, 
  background: string
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA standard
}
```

### Fallback Colors
```typescript
const fallbackColors = {
  primary: '#2d5016',      // eco-forest
  accent: '#9cb86e',       // eco-leaf
  background: '#f5f5f0',   // light sage
  foreground: '#1a1a1a',   // dark text
};
```

### Delete Operation Error Handling
```typescript
async function handleTaskDelete(taskId: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete task');
    }
    
    // Success: Remove from UI
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success('Task deleted successfully');
    
  } catch (error) {
    console.error('Delete error:', error);
    toast.error(error.message || 'Failed to delete task');
  }
}
```

## Testing Strategy

### Visual Regression Testing
```typescript
describe('Nature Theme Visual Tests', () => {
  test('Home page renders with correct colors', async () => {
    const page = await renderPage('/');
    const heroSection = await page.find('[data-testid="hero"]');
    const bgColor = await heroSection.getComputedStyle('background');
    expect(bgColor).toContain('eco-leaf');
  });
  
  test('Cards have neon glow on hover', async () => {
    const card = await page.find('.card-neon');
    await card.hover();
    const shadow = await card.getComputedStyle('box-shadow');
    expect(shadow).toContain('hsla');
  });
});
```

### Contrast Testing
```typescript
describe('WCAG Contrast Tests', () => {
  test('Primary text has sufficient contrast', () => {
    const foreground = getComputedColor('--foreground');
    const background = getComputedColor('--background');
    const ratio = calculateContrastRatio(foreground, background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
```

### Responsive Grid Testing
```typescript
describe('Admin Task Grid', () => {
  test('Shows 5 columns on large screens', async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    const grid = await page.find('.task-grid');
    const columns = await grid.getComputedStyle('grid-template-columns');
    expect(columns.split(' ').length).toBe(5);
  });
  
  test('Shows 3 columns on medium screens', async () => {
    await page.setViewport({ width: 1024, height: 768 });
    const grid = await page.find('.task-grid');
    const columns = await grid.getComputedStyle('grid-template-columns');
    expect(columns.split(' ').length).toBe(3);
  });
  
  test('Shows 1 column on small screens', async () => {
    await page.setViewport({ width: 375, height: 667 });
    const grid = await page.find('.task-grid');
    const columns = await grid.getComputedStyle('grid-template-columns');
    expect(columns.split(' ').length).toBe(1);
  });
});
```

### Delete Functionality Testing
```typescript
describe('Task Delete Feature', () => {
  test('Shows confirmation dialog before delete', async () => {
    const deleteBtn = await page.find('[data-testid="delete-task"]');
    await deleteBtn.click();
    const dialog = await page.find('[role="dialog"]');
    expect(dialog).toBeVisible();
  });
  
  test('Deletes task on confirmation', async () => {
    const initialCount = await page.findAll('.task-card').length;
    await deleteTask('task-123');
    const newCount = await page.findAll('.task-card').length;
    expect(newCount).toBe(initialCount - 1);
  });
});
```

## Implementation Notes

### Performance Considerations
1. **CSS Variables**: Kullanımı runtime'da değişiklik yapılmasına izin verir
2. **Backdrop Blur**: Performans için dikkatli kullanılmalı (max 10-20px)
3. **Box Shadows**: Çok katmanlı gölgeler GPU hızlandırması kullanmalı
4. **Animations**: `transform` ve `opacity` kullanarak GPU'da çalıştırılmalı

### Browser Compatibility
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Backdrop-filter fallback for older browsers
- CSS custom properties fallback values

### Accessibility
- Maintain WCAG AA contrast ratios (4.5:1 minimum)
- Focus indicators with neon glow (visible and distinct)
- Reduced motion support (disable animations)
- Screen reader friendly (semantic HTML)

### Dark Mode Support
- All colors have dark mode variants
- Automatic switching based on system preference
- Manual toggle option in settings
- Smooth transitions between modes
