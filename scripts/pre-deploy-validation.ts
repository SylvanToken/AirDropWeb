#!/usr/bin/env tsx

/**
 * Pre-Deployment Validation Script
 * 
 * Validates the application before deployment to catch issues early
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  error?: string;
}

const results: ValidationResult[] = [];

/**
 * Run a command and return success status
 */
function runCommand(command: string, description: string): boolean {
  try {
    console.log(`\n🔍 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    return false;
  }
}

/**
 * Check if file exists
 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

/**
 * Validate configuration files
 */
function validateConfigFiles(): ValidationResult {
  const requiredFiles = [
    'next.config.js',
    'vercel.json',
    'middleware.ts',
    'app/countdown/page.tsx',
    '.env',
  ];

  const missing = requiredFiles.filter(file => !fileExists(file));

  if (missing.length > 0) {
    return {
      name: 'Configuration Files',
      passed: false,
      message: `Missing required files: ${missing.join(', ')}`,
    };
  }

  return {
    name: 'Configuration Files',
    passed: true,
    message: 'All required configuration files exist',
  };
}

/**
 * Validate environment variables
 */
function validateEnvironmentVariables(): ValidationResult {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'TEST_ACCESS_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    return {
      name: 'Environment Variables',
      passed: false,
      message: `Missing required environment variables: ${missing.join(', ')}`,
    };
  }

  return {
    name: 'Environment Variables',
    passed: true,
    message: 'All required environment variables are set',
  };
}

/**
 * Run linting
 */
function runLinting(): ValidationResult {
  const passed = runCommand('npm run lint', 'Linting');
  return {
    name: 'Linting',
    passed,
    message: passed ? 'No linting errors' : 'Linting failed',
  };
}

/**
 * Run type checking
 */
function runTypeChecking(): ValidationResult {
  const passed = runCommand('npx tsc --noEmit', 'Type Checking');
  return {
    name: 'Type Checking',
    passed,
    message: passed ? 'No type errors' : 'Type checking failed',
  };
}

/**
 * Run build
 */
function runBuild(): ValidationResult {
  const passed = runCommand('npm run build', 'Build');
  return {
    name: 'Build',
    passed,
    message: passed ? 'Build successful' : 'Build failed',
  };
}

/**
 * Print summary
 */
function printSummary(results: ValidationResult[]): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  console.log('='.repeat(60));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n❌ Validation failed! Please fix the issues before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ All validations passed! Ready to deploy.');
    process.exit(0);
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log('🚀 Starting Pre-Deployment Validation...\n');

  // Run validations
  results.push(validateConfigFiles());
  results.push(validateEnvironmentVariables());
  results.push(runLinting());
  results.push(runTypeChecking());
  results.push(runBuild());

  // Print summary
  printSummary(results);
}

// Run validation
main().catch(error => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});
