/**
 * Hero Image Management System
 * 
 * Provides random hero image selection from all available categories
 * in public/assets/heroes directory
 */

export type HeroImageCategory = 
  | 'conservation'
  | 'ecology'
  | 'environmental'
  | 'forest'
  | 'green'
  | 'landscape'
  | 'mountain'
  | 'nature'
  | 'ocean'
  | 'plants'
  | 'sea'
  | 'sky'
  | 'sylonis'
  | 'wildlife'
  | 'all';

/**
 * All available hero images organized by category
 * These images are located in public/assets/heroes/
 */
const heroImages: Record<HeroImageCategory, string[]> = {
  conservation: [
    '/assets/heroes/conservation/conservation_20251111_105913_19.jpg',
    '/assets/heroes/conservation/conservation_20251111_211436_3.jpg',
    '/assets/heroes/conservation/conservation_20251111_211616_6.jpg',
  ],
  ecology: [
    '/assets/heroes/ecology/ecology_20251110_125009_10.jpg',
    '/assets/heroes/ecology/ecology_20251110_132453_12.jpg',
    '/assets/heroes/ecology/ecology_20251110_170204_15.jpg',
    '/assets/heroes/ecology/ecology_20251110_233706_9.jpg',
    '/assets/heroes/ecology/ecology_20251111_104927_1.jpg',
    '/assets/heroes/ecology/ecology_20251111_105704_15.jpg',
    '/assets/heroes/ecology/ecology_20251111_211403_2.jpg',
    '/assets/heroes/ecology/ecology_20251111_211933_12.jpg',
  ],
  environmental: [
    '/assets/heroes/environmental/environmental_20251110_124624_3.jpg',
    '/assets/heroes/environmental/environmental_20251110_165533_3.jpg',
    '/assets/heroes/environmental/environmental_20251111_105000_2.jpg',
    '/assets/heroes/environmental/environmental_20251111_105209_6.jpg',
    '/assets/heroes/environmental/environmental_20251111_105808_17.jpg',
  ],
  forest: [
    '/assets/heroes/forest/forest_20251110_124552_2.jpg',
    '/assets/heroes/forest/forest_20251110_132631_15.jpg',
    '/assets/heroes/forest/forest_20251110_170343_18.jpg',
    '/assets/heroes/forest/forest_20251110_233558_7.jpg',
  ],
  green: [
    '/assets/heroes/green/green_20251110_132317_9.jpg',
    '/assets/heroes/green/green_20251110_233319_2.jpg',
  ],
  landscape: [
    '/assets/heroes/landscape/landscape_20251110_124759_6.jpg',
    '/assets/heroes/landscape/landscape_20251110_125041_11.jpg',
    '/assets/heroes/landscape/landscape_20251110_125408_17.jpg',
    '/assets/heroes/landscape/landscape_20251110_165605_4.jpg',
    '/assets/heroes/landscape/landscape_20251110_233248_1.jpg',
    '/assets/heroes/landscape/landscape_20251110_234159_18.jpg',
    '/assets/heroes/landscape/landscape_20251111_105033_3.jpg',
    '/assets/heroes/landscape/landscape_20251111_105137_5.jpg',
    '/assets/heroes/landscape/landscape_20251111_105945_20.jpg',
    '/assets/heroes/landscape/landscape_20251111_211752_9.jpg',
    '/assets/heroes/landscape/landscape_20251111_212118_15.jpg',
  ],
  mountain: [
    '/assets/heroes/mountain/mountain_20251110_131932_2.jpg',
    '/assets/heroes/mountain/mountain_20251110_132108_5.jpg',
    '/assets/heroes/mountain/mountain_20251110_165638_5.jpg',
    '/assets/heroes/mountain/mountain_20251110_165923_10.jpg',
    '/assets/heroes/mountain/mountain_20251110_234125_17.jpg',
    '/assets/heroes/mountain/mountain_20251111_105240_7.jpg',
    '/assets/heroes/mountain/mountain_20251111_105632_14.jpg',
    '/assets/heroes/mountain/mountain_20251111_211329_1.jpg',
    '/assets/heroes/mountain/mountain_20251111_211648_7.jpg',
  ],
  nature: [
    '/assets/heroes/nature/nature_20251110_131859_1.jpg',
    '/assets/heroes/nature/nature_20251110_132036_4.jpg',
    '/assets/heroes/nature/nature_20251110_132559_14.jpg',
    '/assets/heroes/nature/nature_20251110_132735_17.jpg',
    '/assets/heroes/nature/nature_20251110_170415_19.jpg',
    '/assets/heroes/nature/nature_20251110_234020_15.jpg',
    '/assets/heroes/nature/nature_20251111_105736_16.jpg',
  ],
  ocean: [
    '/assets/heroes/ocean/ocean_20251110_125232_14.jpg',
    '/assets/heroes/ocean/ocean_20251110_132525_13.jpg',
    '/assets/heroes/ocean/ocean_20251110_170309_17.jpg',
    '/assets/heroes/ocean/ocean_20251110_233947_14.jpg',
    '/assets/heroes/ocean/ocean_20251110_234233_19.jpg',
    '/assets/heroes/ocean/ocean_20251111_105525_12.jpg',
    '/assets/heroes/ocean/ocean_20251111_211509_4.jpg',
    '/assets/heroes/ocean/ocean_20251111_211543_5.jpg',
    '/assets/heroes/ocean/ocean_20251111_212010_13.jpg',
    '/assets/heroes/ocean/ocean_20251111_212221_17.jpg',
  ],
  plants: [],
  sea: [
    '/assets/heroes/sea/sea_20251110_233455_5.jpg',
    '/assets/heroes/sea/sea_20251110_233633_8.jpg',
    '/assets/heroes/sea/sea_20251110_233915_13.jpg',
    '/assets/heroes/sea/sea_20251111_105452_11.jpg',
    '/assets/heroes/sea/sea_20251111_105558_13.jpg',
    '/assets/heroes/sea/sea_20251111_211857_11.jpg',
  ],
  sky: [
    '/assets/heroes/sky/skylandscape_20251111_212545_2.jpg',
  ],
  sylonis: [
    '/assets/heroes/sylonis/syla.jpg',
    '/assets/heroes/sylonis/sylbo.jpg',
    '/assets/heroes/sylonis/sylens.jpg',
    '/assets/heroes/sylonis/sylervus.jpg',
    '/assets/heroes/sylonis/sylmica.jpg',
    '/assets/heroes/sylonis/sylor.jpg',
    '/assets/heroes/sylonis/sylphinus.jpg',
    '/assets/heroes/sylonis/sylpis.jpg',
    '/assets/heroes/sylonis/sylsto.jpg',
    '/assets/heroes/sylonis/syltrox.jpg',
    '/assets/heroes/sylonis/sylurs.jpg',
    '/assets/heroes/sylonis/sylves.jpg',
    '/assets/heroes/sylonis/sylvus.jpg',
  ],
  wildlife: [
    '/assets/heroes/wildlife/wildlife_20251110_170447_20.jpg',
    '/assets/heroes/wildlife/wildlife_20251110_234305_20.jpg',
    '/assets/heroes/wildlife/wildlife_20251111_211720_8.jpg',
    '/assets/heroes/wildlife/wildlife_20251111_211824_10.jpg',
    '/assets/heroes/wildlife/wildlife_20251111_212045_14.jpg',
    '/assets/heroes/wildlife/wildlife_20251111_212149_16.jpg',
  ],
  all: [], // Will be populated dynamically
};

/**
 * Get all images from all categories
 */
function getAllImages(): string[] {
  const allImages: string[] = [];
  Object.keys(heroImages).forEach(key => {
    if (key !== 'all') {
      allImages.push(...heroImages[key as HeroImageCategory]);
    }
  });
  return allImages;
}

/**
 * Get a random hero image from specified category or all categories
 * 
 * @param category - The image category to select from (default: 'all')
 * @returns Random image path from the category
 */
export function getRandomHeroImage(category: HeroImageCategory = 'all'): string {
  let images: string[] = [];
  
  if (category === 'all') {
    images = getAllImages();
  } else {
    images = heroImages[category] || [];
  }
  
  if (!images || images.length === 0) {
    // Fallback to all images if category is empty
    images = getAllImages();
  }
  
  if (!images || images.length === 0) {
    // Ultimate fallback
    return '/assets/heroes/sylonis/syla.jpg';
  }
  
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

/**
 * Get multiple random hero images from a category
 * 
 * @param category - The image category to select from
 * @param count - Number of images to return
 * @returns Array of random image paths
 */
export function getRandomHeroImages(
  category: HeroImageCategory = 'all',
  count: number = 3
): string[] {
  const images = category === 'all' ? getAllImages() : heroImages[category];
  
  if (images.length === 0) {
    const fallback = '/assets/heroes/sylonis/syla.jpg';
    return Array(count).fill(fallback);
  }
  
  // Shuffle and take first 'count' items
  const shuffled = [...images].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get all available images for a category
 * 
 * @param category - The image category
 * @returns Array of all image paths in the category
 */
export function getAllHeroImages(category: HeroImageCategory): string[] {
  if (category === 'all') {
    return getAllImages();
  }
  return [...heroImages[category]];
}

/**
 * Get image count for a category
 * 
 * @param category - The category to count
 * @returns Number of images in the category
 */
export function getHeroImageCount(category: HeroImageCategory): number {
  if (category === 'all') {
    return getAllImages().length;
  }
  return heroImages[category].length;
}
