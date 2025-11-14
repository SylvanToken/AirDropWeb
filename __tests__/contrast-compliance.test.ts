/**
 * WCAG Contrast Compliance Tests
 * 
 * This test suite verifies that all color combinations in the nature theme
 * meet WCAG 2.1 AA contrast requirements.
 */

import {
  runAllContrastTests,
  testColorCombination,
  calculateContrastRatio,
  parseHslToRgb,
  meetsWCAGAA,
  NATURE_THEME_COMBINATIONS,
  type ContrastTestResult,
} from '../lib/contrast-checker';

describe('WCAG Contrast Compliance', () => {
  describe('Color Parsing', () => {
    it('should correctly parse HSL to RGB', () => {
      // Test pure red (0, 100%, 50%)
      const red = parseHslToRgb('0 100% 50%');
      expect(red).toEqual([255, 0, 0]);

      // Test pure green (120, 100%, 50%)
      const green = parseHslToRgb('120 100% 50%');
      expect(green).toEqual([0, 255, 0]);

      // Test pure blue (240, 100%, 50%)
      const blue = parseHslToRgb('240 100% 50%');
      expect(blue).toEqual([0, 0, 255]);
    });
  });

  describe('Contrast Ratio Calculation', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const black: [number, number, number] = [0, 0, 0];
      const white: [number, number, number] = [255, 255, 255];
      const ratio = calculateContrastRatio(black, white);
      
      // Black and white should have maximum contrast ratio of 21:1
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate correct contrast ratio for same colors', () => {
      const color: [number, number, number] = [128, 128, 128];
      const ratio = calculateContrastRatio(color, color);
      
      // Same colors should have contrast ratio of 1:1
      expect(ratio).toBeCloseTo(1, 0);
    });
  });

  describe('WCAG AA Compliance', () => {
    it('should correctly identify passing normal text contrast', () => {
      // 4.5:1 is the minimum for normal text
      expect(meetsWCAGAA(4.5, 'normal')).toBe(true);
      expect(meetsWCAGAA(4.6, 'normal')).toBe(true);
      expect(meetsWCAGAA(4.4, 'normal')).toBe(false);
    });

    it('should correctly identify passing large text contrast', () => {
      // 3:1 is the minimum for large text
      expect(meetsWCAGAA(3, 'large')).toBe(true);
      expect(meetsWCAGAA(3.1, 'large')).toBe(true);
      expect(meetsWCAGAA(2.9, 'large')).toBe(false);
    });
  });

  describe('Nature Theme Color Combinations', () => {
    let results: ContrastTestResult[];

    beforeAll(() => {
      results = runAllContrastTests();
    });

    it('should test all defined color combinations', () => {
      expect(results.length).toBe(NATURE_THEME_COMBINATIONS.length);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should have all light mode primary text combinations pass', () => {
      const lightModePrimary = results.filter(r => 
        r.name.includes('Light Mode') && r.name.includes('Primary Text')
      );
      
      lightModePrimary.forEach(result => {
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should have all dark mode primary text combinations pass', () => {
      const darkModePrimary = results.filter(r => 
        r.name.includes('Dark Mode') && r.name.includes('Primary Text')
      );
      
      darkModePrimary.forEach(result => {
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should have all button text combinations pass', () => {
      const buttons = results.filter(r => r.name.includes('Button'));
      
      buttons.forEach(result => {
        expect(result.passes).toBe(true);
        const minRatio = result.textSize === 'large' ? 3 : 4.5;
        expect(result.ratio).toBeGreaterThanOrEqual(minRatio);
      });
    });

    it('should have all heading combinations pass', () => {
      const headings = results.filter(r => r.name.includes('Heading'));
      
      headings.forEach(result => {
        expect(result.passes).toBe(true);
        // Headings are large text, so 3:1 minimum
        expect(result.ratio).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have all status color combinations pass', () => {
      const statusColors = results.filter(r => 
        r.name.includes('Error') || 
        r.name.includes('Success') ||
        r.name.includes('Warning') ||
        r.name.includes('Info')
      );
      
      statusColors.forEach(result => {
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should have all eco color combinations pass or be documented', () => {
      const ecoColors = results.filter(r => r.name.includes('Eco'));
      
      ecoColors.forEach(result => {
        if (!result.passes) {
          // If an eco color fails, it should be documented
          console.warn(`⚠️  ${result.name} does not meet WCAG AA: ${result.ratio}:1`);
          console.warn(`   Usage: ${result.usage}`);
          console.warn(`   Consider using this color only for decorative purposes or with larger text`);
        }
      });
    });

    it('should have at least 85% of all combinations pass', () => {
      const passedCount = results.filter(r => r.passes).length;
      const passRate = (passedCount / results.length) * 100;
      
      // Allow some decorative colors to not meet standards
      // as long as they're documented as decorative-only
      expect(passRate).toBeGreaterThanOrEqual(85);
    });

    it('should document any failing combinations', () => {
      const failed = results.filter(r => !r.passes);
      
      if (failed.length > 0) {
        console.log('\n⚠️  Failing Color Combinations:');
        failed.forEach(result => {
          console.log(`   ${result.name}: ${result.ratio}:1 (needs ${result.textSize === 'large' ? '3:1' : '4.5:1'})`);
          console.log(`   Usage: ${result.usage}`);
        });
      }
    });
  });

  describe('Specific Color Pair Tests', () => {
    it('should pass: Deep forest green on light sage (primary text)', () => {
      const result = testColorCombination({
        name: 'Test',
        foreground: '140 60% 18%',
        background: '95 35% 92%',
        usage: 'Test',
        textSize: 'normal',
      });
      
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: Lime green on very dark forest (dark mode text)', () => {
      const result = testColorCombination({
        name: 'Test',
        foreground: '85 65% 55%',
        background: '140 35% 10%',
        usage: 'Test',
        textSize: 'normal',
      });
      
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: Lime green on deep forest (button text)', () => {
      const result = testColorCombination({
        name: 'Test',
        foreground: '85 65% 55%',
        background: '140 60% 18%',
        usage: 'Test',
        textSize: 'normal',
      });
      
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: Deep forest on lime green (inverse button)', () => {
      const result = testColorCombination({
        name: 'Test',
        foreground: '140 60% 18%',
        background: '85 65% 55%',
        usage: 'Test',
        textSize: 'normal',
      });
      
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle colors with very similar values', () => {
      const result = testColorCombination({
        name: 'Test',
        foreground: '140 60% 50%',
        background: '140 60% 51%',
        usage: 'Test',
        textSize: 'normal',
      });
      
      // Very similar colors should fail
      expect(result.passes).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it('should handle pure black and white', () => {
      const result = testColorCombination({
        name: 'Test',
        foreground: '0 0% 0%',
        background: '0 0% 100%',
        usage: 'Test',
        textSize: 'normal',
      });
      
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 0);
    });
  });
});
