/**
 * Test Welcome Email with Sylvan Token Logo
 * Admin ve üyeye logo ile hoşgeldin maili gönderir
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../lib/email';

const LOGO_URL = 'https://github.com/SylvanToken/SylvanToken/blob/main/assets/images/sylvan-token-logo.png?raw=true';

// Admin için hoşgeldin maili
async function sendAdminWelcomeEmail(to: string, username: string) {
  return sendEmail({
    to,
    subject: '🌿 Welcome to Sylvan Token Admin Panel',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                    <img src="${LOGO_URL}" alt="Sylvan Token" style="width: 120px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Admin Panel</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hi <strong style="color: #10b981;">${username}</strong>,
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Welcome to the <strong>Sylvan Token Admin Panel</strong>! 🎉
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      You now have full access to manage:
                    </p>
                    
                    <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                      <li>User accounts and verifications</li>
                      <li>Task creation and management</li>
                      <li>Airdrop distributions</li>
                      <li>System analytics and reports</li>
                      <li>Audit logs and security</li>
                    </ul>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXTAUTH_URL}/admin" 
                             style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                            Access Admin Panel
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="color: #065f46; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>🔒 Security Tip:</strong> Keep your admin credentials secure and never share them with anyone.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                      Best regards,<br>
                      <strong style="color: #10b981;">Sylvan Token Team</strong>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                      © 2024 Sylvan Token. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Welcome to Sylvan Token Admin Panel, ${username}! You now have full access to manage the platform.`,
  });
}

// Üye için hoşgeldin maili
async function sendMemberWelcomeEmail(to: string, username: string) {
  return sendEmail({
    to,
    subject: '🌿 Welcome to Sylvan Token Community!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                    <img src="${LOGO_URL}" alt="Sylvan Token" style="width: 120px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Sylvan Token!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hi <strong style="color: #10b981;">${username}</strong>,
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Thank you for joining the <strong>Sylvan Token</strong> community! 🎉
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Get started by completing simple tasks to earn SYLVAN tokens:
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 10px 0;">
                                <span style="color: #10b981; font-size: 24px; margin-right: 10px;">✓</span>
                                <span style="color: #374151; font-size: 15px;">Follow us on social media</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0;">
                                <span style="color: #10b981; font-size: 24px; margin-right: 10px;">✓</span>
                                <span style="color: #374151; font-size: 15px;">Join our Telegram community</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0;">
                                <span style="color: #10b981; font-size: 24px; margin-right: 10px;">✓</span>
                                <span style="color: #374151; font-size: 15px;">Complete your profile</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0;">
                                <span style="color: #10b981; font-size: 24px; margin-right: 10px;">✓</span>
                                <span style="color: #374151; font-size: 15px;">Refer friends and earn more!</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXTAUTH_URL}/tasks" 
                             style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                            Start Earning Tokens
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>💡 Pro Tip:</strong> Complete your profile verification to unlock all tasks and maximize your earnings!
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Stats Section -->
                <tr>
                  <td style="padding: 0 30px 40px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="33%" align="center" style="padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                          <p style="color: #10b981; font-size: 32px; font-weight: bold; margin: 0;">0</p>
                          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Tasks Completed</p>
                        </td>
                        <td width="2%"></td>
                        <td width="33%" align="center" style="padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                          <p style="color: #10b981; font-size: 32px; font-weight: bold; margin: 0;">0</p>
                          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Tokens Earned</p>
                        </td>
                        <td width="2%"></td>
                        <td width="33%" align="center" style="padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                          <p style="color: #10b981; font-size: 32px; font-weight: bold; margin: 0;">🌱</p>
                          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Let's Grow!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                      Best regards,<br>
                      <strong style="color: #10b981;">Sylvan Token Team</strong>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                      © 2024 Sylvan Token. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Welcome to Sylvan Token, ${username}! Start completing tasks to earn SYLVAN tokens.`,
  });
}

// Test fonksiyonu
async function testWelcomeEmails() {
  console.log('🚀 Testing Welcome Emails with Sylvan Token Logo...\n');
  
  // Test email adresleri (gerçek adreslerinizi buraya yazın)
  const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
  const memberEmail = process.env.TEST_MEMBER_EMAIL || 'member@example.com';
  
  console.log('📧 Sending Admin Welcome Email...');
  const adminResult = await sendAdminWelcomeEmail(adminEmail, 'Admin User');
  
  if (adminResult.success) {
    console.log('✅ Admin email sent successfully!');
    console.log('   Message ID:', adminResult.messageId);
  } else {
    console.error('❌ Admin email failed:', adminResult.error);
  }
  
  console.log('\n📧 Sending Member Welcome Email...');
  const memberResult = await sendMemberWelcomeEmail(memberEmail, 'Test Member');
  
  if (memberResult.success) {
    console.log('✅ Member email sent successfully!');
    console.log('   Message ID:', memberResult.messageId);
  } else {
    console.error('❌ Member email failed:', memberResult.error);
  }
  
  console.log('\n✨ Test completed!');
  console.log('\n📋 Summary:');
  console.log('   Admin Email:', adminResult.success ? '✅ Sent' : '❌ Failed');
  console.log('   Member Email:', memberResult.success ? '✅ Sent' : '❌ Failed');
  console.log('\n💡 Check your inbox for the emails with Sylvan Token logo!');
}

// Script çalıştır
testWelcomeEmails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script error:', error);
    process.exit(1);
  });
