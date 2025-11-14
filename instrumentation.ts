/**
 * Next.js Instrumentation
 * 
 * This file runs once when the Next.js server starts up.
 * It's used for initialization tasks like configuration validation.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing Sylvan Token application...');
    
    // Validate email configuration on startup
    const { validateEmailEnvironment } = await import('./lib/email/client');
    const validation = validateEmailEnvironment();
    
    if (!validation.isValid) {
      console.error('\n⚠️  APPLICATION STARTUP WARNING ⚠️');
      console.error('Email system is not properly configured.');
      console.error('The application will start, but email functionality will be disabled.\n');
      console.error('To fix this, please configure the following environment variables:');
      validation.errors.forEach((error) => console.error(`  - ${error}`));
      console.error('\nRefer to .env.example for configuration examples.\n');
    }
    
    console.log('✅ Application initialization complete\n');
  }
}
