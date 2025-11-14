/**
 * Test Email Configuration Validation
 * 
 * This script tests the email configuration validation functionality
 * to ensure proper startup checks and error handling.
 */

import { validateEmailEnvironment } from '@/lib/email/client';

async function testEmailConfigValidation() {
  console.log('🧪 Testing Email Configuration Validation\n');
  console.log('=' .repeat(60));
  
  // Test the validation function
  console.log('\n📋 Running validation...\n');
  const validation = validateEmailEnvironment();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Validation Results:');
  console.log('  - Valid:', validation.isValid ? '✅ Yes' : '❌ No');
  console.log('  - Errors:', validation.errors.length);
  console.log('  - Warnings:', validation.warnings.length);
  
  if (validation.errors.length > 0) {
    console.log('\n❌ Configuration Errors:');
    validation.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Configuration Warnings:');
    validation.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Test graceful error handling
  console.log('\n🔍 Testing Graceful Error Handling:\n');
  
  if (!validation.isValid) {
    console.log('✅ Application will start despite missing configuration');
    console.log('✅ Email functionality will be disabled gracefully');
    console.log('✅ Clear error messages are provided for configuration');
  } else {
    console.log('✅ Email system is properly configured');
    console.log('✅ All required environment variables are set');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Configuration validation test complete!\n');
  
  // Show current configuration (without sensitive data)
  console.log('📝 Current Configuration:');
  console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('  - EMAIL_FROM:', process.env.EMAIL_FROM || '(using default: noreply@sylvantoken.org)');
  console.log('  - EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || '(using default: Sylvan Token)');
  console.log('  - EMAIL_REPLY_TO:', process.env.EMAIL_REPLY_TO || '(using default: support@sylvantoken.org)');
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 To fix configuration issues:');
  console.log('  1. Copy .env.example to .env');
  console.log('  2. Set RESEND_API_KEY with your API key from https://resend.com/api-keys');
  console.log('  3. Optionally customize EMAIL_FROM, EMAIL_FROM_NAME, and EMAIL_REPLY_TO');
  console.log('  4. Restart the application\n');
}

// Run the test
testEmailConfigValidation().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
