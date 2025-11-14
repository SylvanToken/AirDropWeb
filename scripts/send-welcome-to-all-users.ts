/**
 * Send Welcome Email to All Users
 * Tüm kayıtlı üyelere logo ile hoşgeldin maili gönderir
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import path from 'path';

const prisma = new PrismaClient();

// Üye için hoşgeldin maili (attachment ile)
async function sendMemberWelcomeEmail(to: string, username: string) {
  const logoPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo.png');
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: 'Sylvan Token <noreply@sylvantoken.org>',
      replyTo: 'noreply@sylvantoken.org',
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
                      <img src="cid:logo-header" alt="Sylvan Token" style="width: 120px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
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
                  
                  <!-- Footer with Logo -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <img src="cid:logo-footer" alt="Sylvan Token" style="width: 80px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
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
      text: `Welcome to Sylvan Token, ${username}! Start completing tasks to earn SYLVAN tokens. Visit: ${process.env.NEXTAUTH_URL}/tasks`,
      attachments: [
        {
          filename: 'sylvan-logo-header.png',
          path: logoPath,
          cid: 'logo-header'
        },
        {
          filename: 'sylvan-logo-footer.png',
          path: logoPath,
          cid: 'logo-footer'
        }
      ]
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
}

// Tüm üyelere mail gönder
async function sendWelcomeToAllUsers() {
  console.log('🚀 Sending Welcome Emails to All Users...\n');
  
  try {
    // Tüm kullanıcıları getir (admin olmayanlar)
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    
    console.log(`📊 Found ${users.length} users\n`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found to send emails to.');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // Her kullanıcıya mail gönder
    for (const user of users) {
      console.log(`📧 Sending to: ${user.username} (${user.email})`);
      
      const result = await sendMemberWelcomeEmail(user.email, user.username);
      
      if (result.success) {
        console.log(`   ✅ Sent successfully`);
        successCount++;
      } else {
        console.log(`   ❌ Failed:`, result.error);
        failCount++;
      }
      
      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✨ Email sending completed!');
    console.log('\n📋 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script çalıştır
sendWelcomeToAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script error:', error);
    process.exit(1);
  });
