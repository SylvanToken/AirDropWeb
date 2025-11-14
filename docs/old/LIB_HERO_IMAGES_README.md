# Hero Images System

## Overview

The hero images system provides flexible background image management for the Sylvan Token Airdrop Platform. It supports both local images and Unsplash API integration for high-quality, nature-themed imagery.

## Features

- **Dual Image Sources**: Switch between local images and Unsplash API
- **Category-Based Selection**: Organize images by nature themes (forest, ocean, mountain, wildlife, plants, sky, nature)
- **Variant Mapping**: Different page types get appropriate image categories
- **Random Selection**: Automatic random image selection for variety
- **Fallback Support**: Graceful fallbacks when images are unavailable

## Configuration

### Switching Image Sources

Edit `lib/hero-images.ts` and change the `IMAGE_SOURCE` constant:

```typescript
// Use Unsplash images (default)
const IMAGE_SOURCE: 'unsplash' | 'local' = 'unsplash';

// Use local images
const IMAGE_SOURCE: 'unsplash' | 'local' = 'local';
```

## Image Categories

### Available Categories

- **forest**: Forest and woodland scenes
- **ocean**: Ocean, sea, and water scenes
- **mountain**: Mountain and alpine landscapes
- **wildlife**: Animals and wildlife in nature
- **plants**: Plants, leaves, and botanical scenes
- **sky**: Sky, clouds, sunrise, and sunset
- **nature**: General nature and landscape scenes
- **all**: Random selection from all categories

### Page Variant Mapping

Different pages use different image categories:

- **Home**: forest, ocean, mountain, sky, nature
- **Dashboard**: forest, plants, mountain, nature
- **Tasks**: mountain, forest, wildlife, nature
- **Leaderboard**: mountain, sky, wildlife, nature

## Usage

### Get Random Image for Page Variant

```typescript
import { getRandomHeroImageForVariant } from '@/lib/hero-images';

const heroImage = getRandomHeroImageForVariant('home');
```

### Get Random Image by Category

```typescript
import { getRandomHeroImage } from '@/lib/hero-images';

const forestImage = getRandomHeroImage('forest');
const anyNatureImage = getRandomHeroImage('all');
```

### Get Multiple Images

```typescript
import { getRandomHeroImages } from '@/lib/hero-images';

const images = getRandomHeroImages('ocean', 3); // Get 3 ocean images
```

## Unsplash Integration

### How It Works

The system uses Unsplash Source API which provides random images based on search terms:

```
https://source.unsplash.com/random/1920x1080/?forest,trees
```

### Benefits

- **High Quality**: Professional photography from Unsplash's vast collection
- **Variety**: Different images on each page load
- **No Storage**: No need to store large image files locally
- **Eco-Themed**: All images match the environmental theme

### Considerations

- **Internet Required**: Requires internet connection to load images
- **Loading Time**: May take slightly longer than local images
- **Caching**: Browser caches images for better performance

## Local Images

### Location

Local images are stored in:
```
public/assets/heroes/hero/
```

### Adding New Local Images

1. Add image files to the directory above
2. Update `heroImages` object in `lib/hero-images.ts`:

```typescript
const heroImages: Record<HeroImageCategory, string[]> = {
  forest: [
    '/assets/heroes/hero/sylves.jpg',
    '/assets/heroes/hero/your-new-image.jpg', // Add here
  ],
  // ...
};
```

## Performance Optimization

### Background Size

All hero images are displayed at 50% size for better performance:

```typescript
style={{
  backgroundImage: `url(${heroImage})`,
  backgroundSize: '50%'
}}
```

### Caching

- Unsplash images are cached by the browser
- Local images are served directly from the public folder
- Consider implementing service worker caching for offline support

## Best Practices

1. **Use Appropriate Categories**: Match image categories to page context
2. **Test Both Sources**: Ensure both Unsplash and local images work
3. **Optimize Local Images**: Compress local images before adding
4. **Monitor Loading**: Check image loading performance in production
5. **Fallback Strategy**: Always have fallback images configured

## Troubleshooting

### Images Not Loading

1. Check internet connection (for Unsplash)
2. Verify image paths (for local images)
3. Check browser console for errors
4. Ensure IMAGE_SOURCE is set correctly

### Performance Issues

1. Reduce background size percentage
2. Switch to local images
3. Implement lazy loading
4. Add service worker caching

## Future Enhancements

- [ ] Add image preloading
- [ ] Implement progressive image loading
- [ ] Add image quality options
- [ ] Support for custom Unsplash collections
- [ ] Add image transition animations
- [ ] Implement image lazy loading
