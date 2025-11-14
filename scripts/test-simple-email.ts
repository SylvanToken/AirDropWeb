/**
 * Simple Email Test - Direct HTML
 */

import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendSimpleEmail() {
  console.log('Sending simple HTML email...\n');
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2d7a4f 0%, #1a4d2e 100%); padding: 24px; text-align: center;">
              <img src="https://sylvantoken.org/assets/images/sylvan-token-logo.png" width="48" height="48" alt="Sylvan Token" style="display: inline-block; vertical-align: middle;">
              <span style="font-size: 20px; font-weight: 700; color: #ffffff; display: inline-block; vertical-align: middle; margin-left: 12px;">Sylvan Token</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="color: #2d7a4f; font-size: 28px; font-weight: 700; margin: 0 0 24px; text-align: center;">Welcome to Sylvan Token! 🌿</h1>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hello!
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Thank you for joining Sylvan Token! We're excited to have you as part of our community.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://sylvantoken.org/dashboard" style="display: inline-block; background-color: #2d7a4f; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              
              <h2 style="color: #2d7a4f; font-size: 18px; font-weight: 600; margin: 0 0 16px;">Next Steps</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" style="background-color: #2d7a4f; color: #ffffff; font-size: 16px; font-weight: 700; text-align: center; border-radius: 50%; padding: 8px;">1</td>
                  <td style="padding-left: 16px; color: #333333; font-size: 15px;">Complete your profile</td>
                </tr>
                <tr><td colspan="2" style="height: 8px;"></td></tr>
                <tr>
                  <td width="36" style="background-color: #2d7a4f; color: #ffffff; font-size: 16px; font-weight: 700; text-align: center; border-radius: 50%; padding: 8px;">2</td>
                  <td style="padding-left: 16px; color: #333333; font-size: 15px;">Connect your wallet</td>
                </tr>
                <tr><td colspan="2" style="height: 8px;"></td></tr>
                <tr>
                  <td width="36" style="background-color: #2d7a4f; color: #ffffff; font-size: 16px; font-weight: 700; text-align: center; border-radius: 50%; padding: 8px;">3</td>
                  <td style="padding-left: 16px; color: #333333; font-size: 15px;">Start earning tokens</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
                © 2025 Sylvan Token. All rights reserved.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                If you have any questions, contact us at support@sylvantoken.org
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  try {
    const result = await resend.emails.send({
      from: 'Sylvan Token <noreply@sylvantoken.org>',
      to: ['admin@sylvantoken.org', 'gada.tr@gmail.com'],
      subject: 'Welcome to Sylvan Token! 🌿',
      html: html,
      replyTo: 'support@sylvantoken.org',
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

sendSimpleEmail();
