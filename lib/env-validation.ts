/**
 * Environment Variable Validation Utility
 * 
 * Validates required environment variables at build time and runtime
 */

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Required environment variables for production
 */
const REQUIRED_PRODUCTION_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'TEST_ACCESS_KEY',
];

/**
 * Required environment variables for development
 */
const REQUIRED_DEVELOPMENT_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
];

/**
 * Optional environment variables with warnings
 */
const OPTIONAL_VARS_WITH_WARNINGS = [
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD',
];

/**
 * Validate environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const isProduction = process.env.NODE_ENV === 'production';
  const requiredVars = isProduction ? REQUIRED_PRODUCTION_VARS : REQUIRED_DEVELOPMENT_VARS;
  
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  // Check optional variables
  for (const varName of OPTIONAL_VARS_WITH_WARNINGS) {
    if (!process.env[varName]) {
      warnings.push(`Optional variable ${varName} is not set. Some features may not work.`);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Log validation results
 */
export function logValidationResults(result: EnvValidationResult): void {
  if (!result.isValid) {
    console.error('❌ Environment validation failed!');
    console.error('Missing required variables:', result.missing.join(', '));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
    }
  } else {
    console.log('✅ Environment validation passed');
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
}

/**
 * Validate and log environment variables
 * Call this at application startup
 */
export function validateAndLogEnvironment(): void {
  const result = validateEnvironment();
  logValidationResults(result);
}

/**
 * Get environment variable with validation
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  
  if (!value) {
    const error = `Required environment variable ${name} is not set`;
    console.error(error);
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error);
    }
    
    return '';
  }
  
  return value;
}

/**
 * Get environment variable with default fallback
 */
export function getEnvWithDefault(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}
