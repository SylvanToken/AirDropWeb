/**
 * Generate Webhook Secret
 * 
 * Generates a secure random webhook secret for use with Resend webhooks.
 * 
 * Usage:
 *   tsx scripts/generate-webhook-secret.ts
 */

import { generateWebhookSecret } from '@/lib/webhook-security';

console.log('🔐 Generating Webhook Secret...\n');

const secret = generateWebhookSecret(64);

console.log('✅ Generated Webhook Secret:');
console.log('━'.repeat(80));
console.log(secret);
console.log('━'.repeat(80));
console.log('\n📝 Add this to your .env file:');
console.log(`RESEND_WEBHOOK_SECRET="${secret}"`);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!');
console.log('\n📚 Next Steps:');
console.log('1. Add the secret to your .env file');
console.log('2. Configure the webhook in Resend dashboard');
console.log('3. Use this same secret in Resend webhook settings');
console.log('4. Test the webhook with: npm run test:webhook\n');
