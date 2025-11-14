/**
 * WCAG Contrast Checker Utility
 * 
 * This utility provides functions to calculate and verify color contrast ratios
 * according to WCAG 2.1 AA standards.
 * 
 * WCAG Requirements:
 * - Normal text (< 18pt or < 14pt bold): minimum 4.5:1 contrast ratio
 * - Large text (>= 18pt or >= 14pt bold): minimum 3:1 contrast ratio
 * - UI components and graphical objects: minimum 3:1 contrast ratio
 */

/**
 * Convert HSL color to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values to 0-1 range
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function calculateContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const lum1 = getRelativeLuminance(...color1);
  const lum2 = getRelativeLuminance(...color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse HSL string to RGB values
 */
export function parseHslToRgb(hslString: string): [number, number, number] {
  // Extract H, S, L values from string like "140 60% 18%"
  const parts = hslString.trim().split(/\s+/);
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1].replace('%', ''));
  const l = parseFloat(parts[2].replace('%', ''));

  return hslToRgb(h, s, l);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  ratio: number,
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  const minimumRatio = textSize === 'large' ? 3 : 4.5;
  return ratio >= minimumRatio;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  ratio: number,
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  const minimumRatio = textSize === 'large' ? 4.5 : 7;
  return ratio >= minimumRatio;
}

/**
 * Get contrast level description
 */
export function getContrastLevel(
  ratio: number,
  textSize: 'normal' | 'large' = 'normal'
): 'AAA' | 'AA' | 'Fail' {
  if (meetsWCAGAAA(ratio, textSize)) return 'AAA';
  if (meetsWCAGAA(ratio, textSize)) return 'AA';
  return 'Fail';
}

/**
 * Color combination interface
 */
export interface ColorCombination {
  name: string;
  foreground: string;
  background: string;
  usage: string;
  textSize?: 'normal' | 'large';
}

/**
 * Contrast test result interface
 */
export interface ContrastTestResult {
  name: string;
  foreground: string;
  background: string;
  usage: string;
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  passes: boolean;
  textSize: 'normal' | 'large';
}

/**
 * Test a color combination for WCAG compliance
 */
export function testColorCombination(
  combination: ColorCombination
): ContrastTestResult {
  const fgRgb = parseHslToRgb(combination.foreground);
  const bgRgb = parseHslToRgb(combination.background);
  const ratio = calculateContrastRatio(fgRgb, bgRgb);
  const textSize = combination.textSize || 'normal';
  const level = getContrastLevel(ratio, textSize);
  const passes = meetsWCAGAA(ratio, textSize);

  return {
    name: combination.name,
    foreground: combination.foreground,
    background: combination.background,
    usage: combination.usage,
    ratio: Math.round(ratio * 100) / 100,
    level,
    passes,
    textSize,
  };
}

/**
 * Nature theme color combinations to test
 */
export const NATURE_THEME_COMBINATIONS: ColorCombination[] = [
  // Light Mode - Primary Text
  {
    name: 'Light Mode - Primary Text',
    foreground: '140 60% 18%', // Deep forest green
    background: '95 35% 92%', // Very light sage green
    usage: 'Main body text on light background',
    textSize: 'normal',
  },
  {
    name: 'Light Mode - Card Text',
    foreground: '140 60% 18%', // Deep forest green
    background: '95 25% 96%', // Card background
    usage: 'Text on card components',
    textSize: 'normal',
  },
  {
    name: 'Light Mode - Muted Text',
    foreground: '140 25% 35%', // Muted foreground
    background: '95 35% 92%', // Background
    usage: 'Secondary/muted text',
    textSize: 'normal',
  },
  {
    name: 'Light Mode - Primary Button',
    foreground: '85 65% 55%', // Lime green
    background: '140 60% 18%', // Deep forest green
    usage: 'Primary button text',
    textSize: 'normal',
  },
  {
    name: 'Light Mode - Accent Text',
    foreground: '140 60% 18%', // Deep forest green
    background: '85 65% 55%', // Lime green
    usage: 'Text on accent background',
    textSize: 'normal',
  },
  {
    name: 'Light Mode - Secondary Button',
    foreground: '95 25% 96%', // Light text
    background: '85 40% 32%', // Olive green (darkened)
    usage: 'Secondary button text',
    textSize: 'normal',
  },
  {
    name: 'Light Mode - Link Text',
    foreground: '140 60% 18%', // Deep forest green
    background: '95 35% 92%', // Background
    usage: 'Hyperlinks',
    textSize: 'normal',
  },
  {
    name: 'Light Mode - Heading (Large)',
    foreground: '140 60% 18%', // Deep forest green
    background: '95 35% 92%', // Background
    usage: 'Large headings (h1, h2)',
    textSize: 'large',
  },

  // Dark Mode - Primary Text
  {
    name: 'Dark Mode - Primary Text',
    foreground: '85 65% 55%', // Lime green
    background: '140 35% 10%', // Very dark forest
    usage: 'Main body text on dark background',
    textSize: 'normal',
  },
  {
    name: 'Dark Mode - Card Text',
    foreground: '85 65% 55%', // Lime green
    background: '140 30% 14%', // Card background
    usage: 'Text on card components',
    textSize: 'normal',
  },
  {
    name: 'Dark Mode - Muted Text',
    foreground: '95 15% 65%', // Muted foreground
    background: '140 35% 10%', // Background
    usage: 'Secondary/muted text',
    textSize: 'normal',
  },
  {
    name: 'Dark Mode - Primary Button',
    foreground: '140 35% 10%', // Very dark forest
    background: '85 65% 55%', // Lime green
    usage: 'Primary button text',
    textSize: 'normal',
  },
  {
    name: 'Dark Mode - Accent Text',
    foreground: '140 35% 10%', // Very dark forest
    background: '85 70% 60%', // Vibrant lime
    usage: 'Text on accent background',
    textSize: 'normal',
  },
  {
    name: 'Dark Mode - Secondary Button',
    foreground: '95 25% 92%', // Light text
    background: '85 25% 25%', // Dark olive
    usage: 'Secondary button text',
    textSize: 'normal',
  },
  {
    name: 'Dark Mode - Link Text',
    foreground: '85 65% 55%', // Lime green
    background: '140 35% 10%', // Background
    usage: 'Hyperlinks',
    textSize: 'normal',
  },
  {
    name: 'Dark Mode - Heading (Large)',
    foreground: '85 65% 55%', // Lime green
    background: '140 35% 10%', // Background
    usage: 'Large headings (h1, h2)',
    textSize: 'large',
  },

  // Eco Colors on Light Background
  {
    name: 'Eco Leaf on Light (Decorative)',
    foreground: '85 65% 55%', // eco-leaf
    background: '95 35% 92%', // Light background
    usage: 'Eco leaf color for decorative elements only (icons, borders) - NOT for text',
    textSize: 'large',
  },
  {
    name: 'Eco Forest on Light',
    foreground: '140 60% 18%', // eco-forest
    background: '95 35% 92%', // Light background
    usage: 'Eco forest color for text',
    textSize: 'normal',
  },
  {
    name: 'Eco Earth on Light (Large Text)',
    foreground: '85 40% 32%', // eco-earth (darkened)
    background: '95 35% 92%', // Light background
    usage: 'Eco earth color for large text/headings only',
    textSize: 'large',
  },
  {
    name: 'Eco Moss on Light (Large Text)',
    foreground: '100 40% 30%', // eco-moss (darkened)
    background: '95 35% 92%', // Light background
    usage: 'Eco moss color for large text/headings only',
    textSize: 'large',
  },

  // Eco Colors on Dark Background
  {
    name: 'Eco Leaf on Dark',
    foreground: '85 65% 55%', // eco-leaf
    background: '140 35% 10%', // Dark background
    usage: 'Eco leaf color for text/icons',
    textSize: 'normal',
  },
  {
    name: 'Eco Sky on Dark',
    foreground: '95 30% 55%', // eco-sky (dark mode)
    background: '140 35% 10%', // Dark background
    usage: 'Eco sky color for text',
    textSize: 'normal',
  },

  // Status Colors
  {
    name: 'Error Text (Light)',
    foreground: '0 70% 40%', // Error text
    background: '95 35% 92%', // Light background
    usage: 'Error messages',
    textSize: 'normal',
  },
  {
    name: 'Error Text (Dark)',
    foreground: '0 70% 70%', // Error text
    background: '140 35% 10%', // Dark background
    usage: 'Error messages',
    textSize: 'normal',
  },
  {
    name: 'Success Text (Light)',
    foreground: '145 65% 28%', // Success text (darkened)
    background: '95 35% 92%', // Light background
    usage: 'Success messages',
    textSize: 'normal',
  },
  {
    name: 'Success Text (Dark)',
    foreground: '145 65% 70%', // Success text
    background: '140 35% 10%', // Dark background
    usage: 'Success messages',
    textSize: 'normal',
  },
];

/**
 * Run all contrast tests and return results
 */
export function runAllContrastTests(): ContrastTestResult[] {
  return NATURE_THEME_COMBINATIONS.map(testColorCombination);
}

/**
 * Format test results as a readable string
 */
export function formatTestResults(results: ContrastTestResult[]): string {
  let output = 'WCAG Contrast Compliance Test Results\n';
  output += '=====================================\n\n';

  const passed = results.filter(r => r.passes);
  const failed = results.filter(r => !r.passes);

  output += `Total Tests: ${results.length}\n`;
  output += `Passed: ${passed.length}\n`;
  output += `Failed: ${failed.length}\n\n`;

  if (failed.length > 0) {
    output += 'FAILED TESTS:\n';
    output += '-------------\n';
    failed.forEach(result => {
      output += `❌ ${result.name}\n`;
      output += `   Usage: ${result.usage}\n`;
      output += `   Ratio: ${result.ratio}:1 (Required: ${result.textSize === 'large' ? '3:1' : '4.5:1'})\n`;
      output += `   Level: ${result.level}\n\n`;
    });
  }

  output += 'PASSED TESTS:\n';
  output += '-------------\n';
  passed.forEach(result => {
    output += `✅ ${result.name}\n`;
    output += `   Usage: ${result.usage}\n`;
    output += `   Ratio: ${result.ratio}:1 (Level: ${result.level})\n\n`;
  });

  return output;
}
