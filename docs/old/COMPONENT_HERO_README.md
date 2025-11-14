# Hero Section Component System

A comprehensive hero section system with random nature-themed imagery, glassmorphism effects, and specialized layouts for different page variants.

## Components

### 1. HeroSection (Base Component)

The foundational hero section component with support for background images, overlays, and responsive heights.

```tsx
import { HeroSection } from '@/components/ui/HeroSection';

<HeroSection
  variant="home"
  backgroundImage="/assets/heroes/forest/forest-1.jpg"
  overlay="gradient"
  height="lg"
>
  {/* Your content here */}
</HeroSection>
```

**Props:**
- `variant`: 'home' | 'dashboard' | 'tasks' | 'leaderboard'
- `backgroundImage`: Path to background image
- `overlay`: 'gradient' | 'solid' | 'none'
- `height`: 'sm' | 'md' | 'lg' | 'full'
- `className`: Additional CSS classes
- `children`: Content to display

**Heights:**
- `sm`: 250px (mobile) / 350px (desktop)
- `md`: 300px (mobile) / 400px (desktop)
- `lg`: 600px (mobile) / 700px (desktop)
- `full`: 100vh

### 2. HeroContent (Generic Content Layout)

Flexible content layout with support for titles, subtitles, CTAs, stats, progress, and rankings.

```tsx
import { HeroContent } from '@/components/ui/HeroSection';

<HeroContent
  title="Welcome"
  subtitle="Get started today"
  cta={{
    label: "Sign Up",
    href: "/register"
  }}
  stats={[
    { label: "Users", value: "10K+" },
    { label: "Tasks", value: "500+" }
  ]}
/>
```

### 3. Specialized Layouts

Pre-built layouts optimized for specific page types.

#### HomeHeroLayout

```tsx
import { HomeHeroLayout } from '@/components/ui/hero-layouts';

<HomeHeroLayout
  title="Welcome to Sylvan Token"
  subtitle="Complete tasks and earn rewards"
  ctaLabel="Get Started"
  ctaHref="/register"
/>
```

#### DashboardHeroLayout

```tsx
import { DashboardHeroLayout } from '@/components/ui/hero-layouts';

<DashboardHeroLayout
  userName="John"
  stats={{
    points: 1250,
    tasksCompleted: 45,
    rank: 12,
    streak: 7
  }}
/>
```

#### TasksHeroLayout

```tsx
import { TasksHeroLayout } from '@/components/ui/hero-layouts';

<TasksHeroLayout
  totalTasks={50}
  completedTasks={35}
  availableTasks={15}
  dailyProgress={{
    current: 5,
    total: 10
  }}
/>
```

#### LeaderboardHeroLayout

```tsx
import { LeaderboardHeroLayout } from '@/components/ui/hero-layouts';

<LeaderboardHeroLayout
  userRank={12}
  totalUsers={1500}
  userPoints={1250}
  topUsers={[
    { name: "Alice", points: 5000, rank: 1 },
    { name: "Bob", points: 4500, rank: 2 },
    { name: "Charlie", points: 4000, rank: 3 }
  ]}
/>
```

## Random Hero Images

The system includes utilities for random hero image selection.

```tsx
import { 
  getRandomHeroImage,
  getRandomHeroImageForVariant 
} from '@/lib/hero-images';

// Get random image from specific category
const forestImage = getRandomHeroImage('forest');

// Get random image suitable for page variant
const homeImage = getRandomHeroImageForVariant('home');
```

**Image Categories:**
- `forest`: Dense forests, tree canopies, forest paths
- `ocean`: Waves, beaches, underwater scenes
- `mountain`: Peaks, valleys, hiking trails
- `wildlife`: Animals in nature, birds, ecosystems
- `plants`: Close-ups of leaves, flowers, gardens
- `sky`: Sunsets, clouds, stars, aurora
- `all`: Random from all categories

**Variant Mappings:**
- `home`: forest, ocean, mountain, sky
- `dashboard`: forest, plants, mountain
- `tasks`: mountain, forest, wildlife
- `leaderboard`: mountain, sky, wildlife

## Adding Hero Images

1. Add images to the appropriate category folder:
   ```
   public/assets/heroes/
   ├── forest/
   ├── ocean/
   ├── mountain/
   ├── wildlife/
   ├── plants/
   └── sky/
   ```

2. Update the image paths in `lib/hero-images.ts`:
   ```tsx
   const heroImages = {
     forest: [
       '/assets/heroes/forest/forest-1.jpg',
       '/assets/heroes/forest/forest-2.jpg',
       // Add more...
     ],
     // ...
   };
   ```

**Image Specifications:**
- Format: WebP with JPEG fallback
- Desktop: 1920x1080px
- Mobile: 768x1024px
- Quality: 85%
- Use Next.js Image component for optimization

## Features

### Glassmorphism Effect
All hero content includes a glassmorphism effect with:
- Semi-transparent background
- Backdrop blur
- Subtle border
- Shadow effects

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-optimized for mobile devices
- Adaptive typography scales

### Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support
- High contrast text

### Performance
- Next.js Image optimization
- Lazy loading for below-fold images
- Blur placeholders
- Priority loading for above-fold content

## Examples

Refer to the actual page implementations in `app/` directory for complete usage examples:
- Home page: `app/page.tsx`
- Dashboard: `app/(user)/dashboard/page.tsx`
- Tasks: `app/(user)/tasks/page.tsx`
- Leaderboard: `app/(user)/leaderboard/page.tsx`

## Customization

### Custom Overlay Colors

Modify overlay classes in `HeroSection.tsx`:

```tsx
const overlayClasses = {
  gradient: 'bg-gradient-to-b from-transparent via-background/50 to-background',
  solid: 'bg-background/60',
  custom: 'bg-gradient-to-r from-eco-leaf/20 to-eco-forest/20',
};
```

### Custom Heights

Add new height variants:

```tsx
const heightClasses = {
  xs: 'h-[200px] md:h-[300px]',
  // ... existing heights
  xl: 'h-[800px] md:h-[900px]',
};
```

### Custom Layouts

Create your own specialized layout by following the pattern in `hero-layouts.tsx`.

## Best Practices

1. **Use appropriate variants**: Match the hero variant to the page type
2. **Optimize images**: Compress and convert to WebP format
3. **Test responsiveness**: Verify on multiple screen sizes
4. **Maintain consistency**: Use the same overlay style across similar pages
5. **Accessibility first**: Always include descriptive text and proper semantics
6. **Performance**: Use priority loading only for above-fold heroes

## Troubleshooting

### Images not loading
- Verify image paths in `lib/hero-images.ts`
- Check that images exist in `public/assets/heroes/`
- Ensure proper file extensions (.jpg, .webp)

### Blur effect not working
- Check browser support for `backdrop-filter`
- Verify Tailwind config includes backdrop utilities
- Test with different overlay options

### Layout issues
- Verify container max-width settings
- Check responsive breakpoints
- Test with different content lengths
