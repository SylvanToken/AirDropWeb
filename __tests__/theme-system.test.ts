/**
 * Theme System Tests
 * 
 * Tests for the centralized theme management system including:
 * - Theme configuration
 * - CSS variable generation
 * - Theme provider functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { theme, getThemeColor, hslToVar, hslToVarWithAlpha } from '@/config/theme';
import {
  generateColorVariables,
  generateThemeVariables,
  variablesToCSSString,
  generateThemeCSS,
  hslToCSS,
  hslToCSSWithAlpha,
  getCSSVar,
  getCSSVarWithFallback,
  isValidHSL,
  parseHSL,
  adjustLightness,
  adjustSaturation,
  camelToKebab,
  kebabToCamel,
} from '@/lib/theme/generator';

describe('Theme Configuration', () => {
  describe('Theme Structure', () => {
    it('should have light and dark mode configurations', () => {
      expect(theme.light).toBeDefined();
      expect(theme.dark).toBeDefined();
    });

    it('should have all required color properties in light mode', () => {
      expect(theme.light.background).toBeDefined();
      expect(theme.light.foreground).toBeDefined();
      expect(theme.light.primary).toBeDefined();
      expect(theme.light.secondary).toBeDefined();
      expect(theme.light.accent).toBeDefined();
      expect(theme.light.muted).toBeDefined();
      expect(theme.light.destructive).toBeDefined();
    });

    it('should have all required color properties in dark mode', () => {
      expect(theme.dark.background).toBeDefined();
      expect(theme.dark.foreground).toBeDefined();
      expect(theme.dark.primary).toBeDefined();
      expect(theme.dark.secondary).toBeDefined();
      expect(theme.dark.accent).toBeDefined();
      expect(theme.dark.muted).toBeDefined();
      expect(theme.dark.destructive).toBeDefined();
    });

    it('should have eco-themed colors', () => {
      expect(theme.light.eco).toBeDefined();
      expect(theme.light.eco.leaf).toBeDefined();
      expect(theme.light.eco.forest).toBeDefined();
      expect(theme.light.eco.earth).toBeDefined();
      expect(theme.light.eco.sky).toBeDefined();
      expect(theme.light.eco.moss).toBeDefined();
    });

    it('should have task state colors', () => {
      expect(theme.light.task).toBeDefined();
      expect(theme.light.task.pending).toBeDefined();
      expect(theme.light.task.active).toBeDefined();
      expect(theme.light.task.completed).toBeDefined();
      expect(theme.light.task.expired).toBeDefined();
      expect(theme.light.task.urgent).toBeDefined();
    });

    it('should have status colors', () => {
      expect(theme.light.status).toBeDefined();
      expect(theme.light.status.success).toBeDefined();
      expect(theme.light.status.error).toBeDefined();
      expect(theme.light.status.warning).toBeDefined();
      expect(theme.light.status.info).toBeDefined();
    });

    it('should have spacing tokens', () => {
      expect(theme.spacing).toBeDefined();
      expect(theme.spacing.xs).toBe('0.25rem');
      expect(theme.spacing.sm).toBe('0.5rem');
      expect(theme.spacing.md).toBe('1rem');
      expect(theme.spacing.lg).toBe('1.5rem');
      expect(theme.spacing.xl).toBe('2rem');
    });

    it('should have typography tokens', () => {
      expect(theme.typography).toBeDefined();
      expect(theme.typography.fontSize).toBeDefined();
      expect(theme.typography.lineHeight).toBeDefined();
      expect(theme.typography.fontWeight).toBeDefined();
    });

    it('should have shadow tokens', () => {
      expect(theme.shadows).toBeDefined();
      expect(theme.shadows.eco).toBeDefined();
      expect(theme.shadows.neonGlow).toBeDefined();
      expect(theme.shadows.depth4k1).toBeDefined();
    });

    it('should have transition tokens', () => {
      expect(theme.transitions).toBeDefined();
      expect(theme.transitions.fast).toBe('150ms');
      expect(theme.transitions.base).toBe('200ms');
      expect(theme.transitions.slow).toBe('300ms');
    });
  });

  describe('Theme Helper Functions', () => {
    it('should get theme color by path', () => {
      const color = getThemeColor('light', 'eco.leaf');
      expect(color).toBe('85 65% 55%');
    });

    it('should get nested theme color', () => {
      const color = getThemeColor('dark', 'task.pending');
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });

    it('should convert HSL to CSS var format', () => {
      const cssVar = hslToVar('85 65% 55%');
      expect(cssVar).toBe('hsl(85 65% 55%)');
    });

    it('should convert HSL to CSS var with alpha', () => {
      const cssVar = hslToVarWithAlpha('85 65% 55%', 0.5);
      expect(cssVar).toBe('hsl(85 65% 55% / 0.5)');
    });
  });
});

describe('CSS Variable Generator', () => {
  describe('Color Variable Generation', () => {
    it('should generate CSS variables from theme colors', () => {
      const variables = generateColorVariables(theme.light);
      
      expect(variables['--background']).toBe('95 35% 92%');
      expect(variables['--foreground']).toBe('140 60% 18%');
      expect(variables['--primary']).toBe('140 60% 18%');
    });

    it('should generate nested color variables', () => {
      const variables = generateColorVariables(theme.light);
      
      expect(variables['--eco-leaf']).toBe('85 65% 55%');
      expect(variables['--eco-forest']).toBe('140 60% 18%');
      expect(variables['--task-pending']).toBeDefined();
      expect(variables['--status-success']).toBeDefined();
    });

    it('should convert camelCase to kebab-case', () => {
      const variables = generateColorVariables(theme.light);
      
      expect(variables['--card-foreground']).toBeDefined();
      expect(variables['--primary-foreground']).toBeDefined();
      expect(variables['--muted-foreground']).toBeDefined();
    });
  });

  describe('Theme Variable Generation', () => {
    it('should generate all theme variables for light mode', () => {
      const variables = generateThemeVariables('light');
      
      expect(variables['--background']).toBeDefined();
      expect(variables['--eco-leaf']).toBeDefined();
      expect(variables['--spacing-md']).toBe('1rem');
      expect(variables['--font-size-base']).toBe('1rem');
      expect(variables['--transition-fast']).toBe('150ms');
      expect(variables['--radius']).toBe('0.75rem');
    });

    it('should generate all theme variables for dark mode', () => {
      const variables = generateThemeVariables('dark');
      
      expect(variables['--background']).toBe('140 35% 10%');
      expect(variables['--foreground']).toBe('85 65% 55%');
    });
  });

  describe('CSS String Generation', () => {
    it('should convert variables to CSS string', () => {
      const variables = { '--test-color': '85 65% 55%', '--test-size': '1rem' };
      const css = variablesToCSSString(variables, ':root');
      
      expect(css).toContain(':root {');
      expect(css).toContain('--test-color: 85 65% 55%;');
      expect(css).toContain('--test-size: 1rem;');
      expect(css).toContain('}');
    });

    it('should generate complete theme CSS', () => {
      const css = generateThemeCSS();
      
      expect(css).toContain(':root {');
      expect(css).toContain('.dark {');
      expect(css).toContain('--background:');
      expect(css).toContain('--eco-leaf:');
    });
  });

  describe('HSL Conversion Functions', () => {
    it('should convert HSL to CSS function', () => {
      const css = hslToCSS('85 65% 55%');
      expect(css).toBe('hsl(85 65% 55%)');
    });

    it('should convert HSL to CSS function with alpha', () => {
      const css = hslToCSSWithAlpha('85 65% 55%', 0.8);
      expect(css).toBe('hsl(85 65% 55% / 0.8)');
    });
  });

  describe('CSS Variable Reference Functions', () => {
    it('should get CSS var reference', () => {
      const varRef = getCSSVar('eco-leaf');
      expect(varRef).toBe('var(--eco-leaf)');
    });

    it('should get CSS var reference with fallback', () => {
      const varRef = getCSSVarWithFallback('eco-leaf', '#9cb86e');
      expect(varRef).toBe('var(--eco-leaf, #9cb86e)');
    });
  });
});

describe('Utility Functions', () => {
  describe('Case Conversion', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(camelToKebab('backgroundColor')).toBe('background-color');
      expect(camelToKebab('primaryForeground')).toBe('primary-foreground');
      expect(camelToKebab('ecoLeaf')).toBe('eco-leaf');
    });

    it('should convert kebab-case to camelCase', () => {
      expect(kebabToCamel('background-color')).toBe('backgroundColor');
      expect(kebabToCamel('primary-foreground')).toBe('primaryForeground');
      expect(kebabToCamel('eco-leaf')).toBe('ecoLeaf');
    });
  });

  describe('HSL Validation', () => {
    it('should validate correct HSL format', () => {
      expect(isValidHSL('85 65% 55%')).toBe(true);
      expect(isValidHSL('140 60% 18%')).toBe(true);
      expect(isValidHSL('0 0% 100%')).toBe(true);
    });

    it('should reject invalid HSL format', () => {
      expect(isValidHSL('85 65 55')).toBe(false);
      expect(isValidHSL('invalid')).toBe(false);
      expect(isValidHSL('')).toBe(false);
    });
  });

  describe('HSL Parsing', () => {
    it('should parse HSL color value', () => {
      const parsed = parseHSL('85 65% 55%');
      
      expect(parsed).not.toBeNull();
      expect(parsed?.h).toBe(85);
      expect(parsed?.s).toBe(65);
      expect(parsed?.l).toBe(55);
    });

    it('should return null for invalid HSL', () => {
      const parsed = parseHSL('invalid');
      expect(parsed).toBeNull();
    });
  });

  describe('HSL Adjustments', () => {
    it('should adjust lightness', () => {
      const adjusted = adjustLightness('85 65% 55%', 10);
      expect(adjusted).toBe('85 65% 65%');
    });

    it('should clamp lightness to valid range', () => {
      const tooLight = adjustLightness('85 65% 95%', 10);
      expect(tooLight).toBe('85 65% 100%');
      
      const tooDark = adjustLightness('85 65% 5%', -10);
      expect(tooDark).toBe('85 65% 0%');
    });

    it('should adjust saturation', () => {
      const adjusted = adjustSaturation('85 65% 55%', -10);
      expect(adjusted).toBe('85 55% 55%');
    });

    it('should clamp saturation to valid range', () => {
      const tooSaturated = adjustSaturation('85 95% 55%', 10);
      expect(tooSaturated).toBe('85 100% 55%');
      
      const tooDesaturated = adjustSaturation('85 5% 55%', -10);
      expect(tooDesaturated).toBe('85 0% 55%');
    });
  });
});

describe('Color Consistency', () => {
  it('should have consistent eco colors across light and dark modes', () => {
    // Eco colors should exist in both modes
    expect(theme.light.eco.leaf).toBeDefined();
    expect(theme.dark.eco.leaf).toBeDefined();
    
    // In this theme, eco.leaf is the same in both modes
    expect(theme.light.eco.leaf).toBe(theme.dark.eco.leaf);
  });

  it('should have different background colors for light and dark modes', () => {
    expect(theme.light.background).not.toBe(theme.dark.background);
  });

  it('should have appropriate contrast between foreground and background', () => {
    // Light mode: dark text on light background
    const lightBg = parseHSL(theme.light.background);
    const lightFg = parseHSL(theme.light.foreground);
    
    expect(lightBg).not.toBeNull();
    expect(lightFg).not.toBeNull();
    expect(lightBg!.l).toBeGreaterThan(lightFg!.l);
    
    // Dark mode: light text on dark background
    const darkBg = parseHSL(theme.dark.background);
    const darkFg = parseHSL(theme.dark.foreground);
    
    expect(darkBg).not.toBeNull();
    expect(darkFg).not.toBeNull();
    expect(darkBg!.l).toBeLessThan(darkFg!.l);
  });
});

describe('Theme Integration', () => {
  it('should have all colors in HSL format', () => {
    const lightColors = generateColorVariables(theme.light);
    
    for (const [key, value] of Object.entries(lightColors)) {
      if (key.startsWith('--') && typeof value === 'string') {
        // Should be in HSL format (H S% L%)
        expect(isValidHSL(value)).toBe(true);
      }
    }
  });

  it('should generate valid CSS for both themes', () => {
    const css = generateThemeCSS();
    
    // Should contain both selectors
    expect(css).toContain(':root {');
    expect(css).toContain('.dark {');
    
    // Should contain color variables
    expect(css).toContain('--background:');
    expect(css).toContain('--foreground:');
    expect(css).toContain('--eco-leaf:');
    expect(css).toContain('--task-pending:');
    
    // Should be valid CSS syntax
    expect(css).toMatch(/:\s*\d+\s+\d+%\s+\d+%;/);
  });
});
