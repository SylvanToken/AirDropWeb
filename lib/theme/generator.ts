/**
 * CSS Variable Generator
 * 
 * Generates CSS custom properties from the centralized theme configuration.
 * Supports nested color objects and HSL color format conversion.
 */

import { theme, type ThemeColors } from '@/config/theme';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CSSVariables {
  [key: string]: string;
}

// ============================================
// GENERATOR FUNCTIONS
// ============================================

/**
 * Generate CSS variables from a nested object
 * @param obj - Object containing values
 * @param prefix - Prefix for CSS variable names
 * @returns Object with CSS variable names as keys and values
 */
function generateVariablesFromObject(
  obj: Record<string, any>,
  prefix: string = ''
): CSSVariables {
  const variables: CSSVariables = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to kebab-case
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const varName = prefix ? `${prefix}-${kebabKey}` : kebabKey;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively handle nested objects
      const nestedVars = generateVariablesFromObject(value, varName);
      Object.assign(variables, nestedVars);
    } else {
      // Add the variable
      variables[`--${varName}`] = value;
    }
  }
  
  return variables;
}

/**
 * Generate CSS variables for theme colors
 * @param colors - Theme colors object
 * @returns Object with CSS variable names as keys and HSL values
 */
export function generateColorVariables(colors: ThemeColors): CSSVariables {
  return generateVariablesFromObject(colors);
}

/**
 * Generate CSS variables for all theme properties
 * @param mode - 'light' or 'dark'
 * @returns Object with all CSS variable names and values
 */
export function generateThemeVariables(mode: 'light' | 'dark'): CSSVariables {
  const variables: CSSVariables = {};
  
  // Generate color variables
  const colorVars = generateColorVariables(theme[mode]);
  Object.assign(variables, colorVars);
  
  // Add spacing variables
  const spacingVars = generateVariablesFromObject(theme.spacing, 'spacing');
  Object.assign(variables, spacingVars);
  
  // Add typography variables
  const fontSizeVars = generateVariablesFromObject(theme.typography.fontSize, 'font-size');
  const lineHeightVars = generateVariablesFromObject(theme.typography.lineHeight, 'line-height');
  const fontWeightVars = generateVariablesFromObject(theme.typography.fontWeight, 'font-weight');
  Object.assign(variables, fontSizeVars, lineHeightVars, fontWeightVars);
  
  // Add transition variables
  const transitionVars = generateVariablesFromObject(theme.transitions, 'transition');
  Object.assign(variables, transitionVars);
  
  // Add other theme properties
  variables['--radius'] = theme.radius;
  variables['--bg-opacity'] = theme.bgOpacity;
  
  return variables;
}

/**
 * Convert CSS variables object to CSS string
 * @param variables - Object with CSS variable names and values
 * @param selector - CSS selector (default: ':root')
 * @returns CSS string
 */
export function variablesToCSSString(
  variables: CSSVariables,
  selector: string = ':root'
): string {
  const entries = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  
  return `${selector} {\n${entries}\n}`;
}

/**
 * Generate complete CSS string for both light and dark modes
 * @returns Complete CSS string with all theme variables
 */
export function generateThemeCSS(): string {
  const lightVars = generateThemeVariables('light');
  const darkVars = generateThemeVariables('dark');
  
  const lightCSS = variablesToCSSString(lightVars, ':root');
  const darkCSS = variablesToCSSString(darkVars, '.dark');
  
  return `${lightCSS}\n\n${darkCSS}`;
}

/**
 * Generate CSS variables for a specific color palette
 * @param palette - Color palette object (e.g., eco, task, status)
 * @param prefix - Prefix for variable names
 * @returns Object with CSS variable names and values
 */
export function generatePaletteVariables(
  palette: Record<string, string>,
  prefix: string
): CSSVariables {
  return generateVariablesFromObject(palette, prefix);
}

/**
 * Convert HSL color value to CSS hsl() function
 * @param hsl - HSL color value (e.g., '85 65% 55%')
 * @returns CSS hsl() function string
 */
export function hslToCSS(hsl: string): string {
  return `hsl(${hsl})`;
}

/**
 * Convert HSL color value to CSS hsl() function with alpha
 * @param hsl - HSL color value (e.g., '85 65% 55%')
 * @param alpha - Alpha value (0-1)
 * @returns CSS hsl() function string with alpha
 */
export function hslToCSSWithAlpha(hsl: string, alpha: number): string {
  return `hsl(${hsl} / ${alpha})`;
}

/**
 * Get CSS variable reference
 * @param varName - Variable name without '--' prefix
 * @returns CSS var() function string
 */
export function getCSSVar(varName: string): string {
  return `var(--${varName})`;
}

/**
 * Get CSS variable reference with fallback
 * @param varName - Variable name without '--' prefix
 * @param fallback - Fallback value
 * @returns CSS var() function string with fallback
 */
export function getCSSVarWithFallback(varName: string, fallback: string): string {
  return `var(--${varName}, ${fallback})`;
}

/**
 * Generate CSS variables for shadows
 * @returns Object with shadow CSS variables
 */
export function generateShadowVariables(): CSSVariables {
  return generateVariablesFromObject(theme.shadows, 'shadow');
}

/**
 * Apply theme variables to document root
 * @param mode - 'light' or 'dark'
 */
export function applyThemeVariables(mode: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  
  const variables = generateThemeVariables(mode);
  const root = document.documentElement;
  
  // Apply each variable to the root element
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Remove theme class and apply new one
 * @param mode - 'light' or 'dark'
 */
export function setThemeMode(mode: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme class
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(mode);
  
  // Apply theme variables
  applyThemeVariables(mode);
}

/**
 * Get current theme mode from document
 * @returns Current theme mode or null if not set
 */
export function getCurrentThemeMode(): 'light' | 'dark' | null {
  if (typeof document === 'undefined') return null;
  
  const root = document.documentElement;
  
  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';
  
  return null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert camelCase to kebab-case
 * @param str - camelCase string
 * @returns kebab-case string
 */
export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 * @param str - kebab-case string
 * @returns camelCase string
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Validate HSL color format
 * @param hsl - HSL color value
 * @returns true if valid HSL format
 */
export function isValidHSL(hsl: string): boolean {
  // HSL format: "H S% L%" or "H S% L% / A"
  const hslRegex = /^\d+\s+\d+%\s+\d+%(\s*\/\s*[\d.]+)?$/;
  return hslRegex.test(hsl.trim());
}

/**
 * Parse HSL color value
 * @param hsl - HSL color value (e.g., '85 65% 55%')
 * @returns Object with h, s, l values
 */
export function parseHSL(hsl: string): { h: number; s: number; l: number } | null {
  const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%/);
  
  if (!match) return null;
  
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
  };
}

/**
 * Adjust lightness of HSL color
 * @param hsl - HSL color value
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted HSL color value
 */
export function adjustLightness(hsl: string, amount: number): string {
  const parsed = parseHSL(hsl);
  if (!parsed) return hsl;
  
  const newL = Math.max(0, Math.min(100, parsed.l + amount));
  return `${parsed.h} ${parsed.s}% ${newL}%`;
}

/**
 * Adjust saturation of HSL color
 * @param hsl - HSL color value
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted HSL color value
 */
export function adjustSaturation(hsl: string, amount: number): string {
  const parsed = parseHSL(hsl);
  if (!parsed) return hsl;
  
  const newS = Math.max(0, Math.min(100, parsed.s + amount));
  return `${parsed.h} ${newS}% ${parsed.l}%`;
}

// Export all functions
const themeGenerator = {
  generateColorVariables,
  generateThemeVariables,
  variablesToCSSString,
  generateThemeCSS,
  generatePaletteVariables,
  hslToCSS,
  hslToCSSWithAlpha,
  getCSSVar,
  getCSSVarWithFallback,
  generateShadowVariables,
  applyThemeVariables,
  setThemeMode,
  getCurrentThemeMode,
  camelToKebab,
  kebabToCamel,
  isValidHSL,
  parseHSL,
  adjustLightness,
  adjustSaturation,
};

export default themeGenerator;
