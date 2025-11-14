/**
 * Email Attachments Utility
 * 
 * Provides functions to embed images as base64 data URIs in HTML.
 * This ensures images are displayed inline without external requests.
 */

import fs from 'fs';
import path from 'path';

/**
 * Get the Sylvan Token logo as a base64 data URI
 * This can be used directly in img src attributes
 * Uses optimized email logo: public/images/sylvan_logo_email.png (4KB)
 */
export function getSylvanLogoBase64(): string {
  // Use optimized email logo (4KB instead of 800KB)
  const logoPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo_email.png');
  
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    const base64Logo = logoBuffer.toString('base64');
    return `data:image/png;base64,${base64Logo}`;
  } catch (error) {
    console.error('Failed to read optimized email logo:', error);
    console.error('Attempted path:', logoPath);
    
    // Fallback to original logo if optimized version not found
    try {
      const fallbackPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo.png');
      const fallbackBuffer = fs.readFileSync(fallbackPath);
      const base64Fallback = fallbackBuffer.toString('base64');
      console.warn('Using original logo as fallback (may be large)');
      return `data:image/png;base64,${base64Fallback}`;
    } catch (fallbackError) {
      console.error('Failed to read fallback logo:', fallbackError);
      // Return a fallback transparent pixel if logo not found
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
  }
}

/**
 * Get the Sylvan Token logo as an attachment for email
 * Uses CID (Content-ID) for inline embedding in emails
 * This ensures the logo displays correctly in all email clients
 */
export function getSylvanLogoAttachment() {
  const logoPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo.png');
  
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    
    return {
      filename: 'sylvan_logo.png',
      content: logoBuffer,
      contentType: 'image/png',
      cid: 'sylvan-logo', // This CID is referenced in email templates as cid:sylvan-logo
    };
  } catch (error) {
    console.error('Failed to read logo file for attachment:', error);
    return null;
  }
}
