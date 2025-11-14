# Design Document

## Overview

This design document outlines the technical approach to fix two critical issues in the Sylvan Token application:
1. Logo not displaying on the main page
2. Non-functional avatar upload feature

The fixes will ensure consistent branding across all pages and enable users to personalize their profiles with custom avatars.

## Architecture

### Logo Display Fix

The logo display issue appears to be related to how the Header component renders for non-authenticated users on the main page. The current implementation shows the logo correctly on authenticated pages but may have CSS or rendering issues on the public main page.

**Current State:**
- Logo file exists at `/assets/images/sylvan-token-logo.png`
- Header component has separate rendering logic for authenticated vs non-authenticated users
- Logo Component is reusable but may not be properly integrated in the non-authenticated header

**Solution Approach:**
- Verify logo image path and accessibility
- Ensure consistent logo rendering across authenticated and non-authenticated states
- Check for CSS conflicts or z-index issues that might hide the logo
- Test logo visibility across different viewport sizes

### Avatar Upload System

The avatar upload feature currently has a simulated upload function that doesn't persist data. We need to implement a complete upload pipeline.

**Components:**
1. **Frontend (AvatarUpload Component)**: Handles file selection, validation, preview, and upload UI
2. **API Endpoint**: Receives and processes image uploads
3. **File Storage**: Stores uploaded images in the public directory
4. **Database**: Stores avatar URL reference in user profile

**Data Flow:**
```
User selects image → Validation → Base64 encoding → API request → 
File system storage → Database update → Response → UI update
```

## Components and Interfaces

### 1. Logo Component Enhancement

**File:** `components/ui/Logo.tsx`

No changes needed to the Logo component itself. The issue is in how it's used in the Header.

### 2. Header Component Fix

**File:** `components/layout/Header.tsx`

**Current Issue:**
The non-authenticated header section renders the logo, but there may be CSS or visibility issues.

**Solution:**
- Verify the logo image path is correct
- Ensure no CSS conflicts hide the logo
- Test logo rendering in both light and dark modes
- Verify responsive behavior

### 3. Avatar Upload Component

**File:** `components/profile/AvatarUpload.tsx`

**Current State:**
- Has file selection and drag-and-drop functionality
- Validates file type and size
- Shows preview
- Has simulated upload function

**Required Changes:**
- Replace simulated upload with real API call
- Add proper error handling
- Show success/error messages
- Update preview after successful upload
- Add loading states

**Interface:**
```typescript
interface AvatarUploadProps {
  currentAvatar?: string | null;
  username: string;
}

interface UploadResponse {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}
```

### 4. Profile API Endpoint

**New File:** `app/api/users/profile/avatar/route.ts`

**Responsibilities:**
- Receive multipart form data with image file
- Validate file type and size on server
- Generate unique filename
- Save file to public directory
- Update user record in database
- Return avatar URL

**Interface:**
```typescript
// POST /api/users/profile/avatar
Request: FormData with 'avatar' file field
Response: {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}
```

### 5. Database Schema Update

**File:** `prisma/schema.prisma`

**Required Changes:**
Add `avatarUrl` field to User model:
```prisma
model User {
  // ... existing fields
  avatarUrl        String?
  // ... rest of fields
}
```

### 6. Profile API Enhancement

**File:** `app/api/users/profile/route.ts`

**Required Changes:**
- Add `avatarUrl` to the select statement in GET endpoint
- Ensure avatar URL is returned in profile response

## Data Models

### User Model Extension

```typescript
interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;  // NEW FIELD
  walletAddress: string | null;
  walletVerified: boolean;
  twitterUsername: string | null;
  twitterVerified: boolean;
  telegramUsername: string | null;
  telegramVerified: boolean;
  totalPoints: number;
  createdAt: string;
}
```

### File Storage Structure

```
public/
  avatars/
    {userId}-{timestamp}.{ext}
```

Example: `public/avatars/clx123abc-1699876543210.jpg`

## Error Handling

### Logo Display

**Potential Issues:**
1. Image file not found (404)
2. CSS z-index conflicts
3. Responsive layout issues
4. Dark mode rendering issues

**Handling:**
- Verify file path is correct
- Add fallback text if image fails to load
- Ensure proper z-index layering
- Test across all breakpoints and themes

### Avatar Upload

**Client-Side Validation:**
- File type must be image/* (PNG, JPG, GIF, WEBP)
- File size must be ≤ 5MB
- Display user-friendly error messages

**Server-Side Validation:**
- Verify file type using file signature (magic numbers)
- Verify file size
- Check user authentication
- Validate file content is actually an image

**Error Scenarios:**
1. **Invalid file type**: Return 400 with message "Please upload an image file (PNG, JPG, GIF, WEBP)"
2. **File too large**: Return 400 with message "Image must be smaller than 5MB"
3. **Unauthorized**: Return 401 with message "You must be logged in"
4. **Storage error**: Return 500 with message "Failed to save image"
5. **Database error**: Return 500 with message "Failed to update profile"

**Error Response Format:**
```typescript
{
  success: false,
  error: string
}
```

## Testing Strategy

### Logo Display Testing

**Manual Testing:**
1. Visit main page as non-authenticated user
2. Verify logo is visible in header
3. Test hover effects
4. Test responsive behavior (mobile, tablet, desktop)
5. Test in light and dark modes
6. Compare with authenticated pages

**Browser Testing:**
- Chrome
- Firefox
- Safari
- Edge

### Avatar Upload Testing

**Unit Tests:**
- File validation logic
- File size checking
- File type checking
- Error message generation

**Integration Tests:**
1. **Successful upload flow:**
   - Select valid image
   - Upload completes
   - Avatar displays in UI
   - Database updated
   - File saved to disk

2. **Validation errors:**
   - Upload non-image file → Error message
   - Upload file > 5MB → Error message
   - Upload without authentication → 401 error

3. **Edge cases:**
   - Upload same image twice
   - Upload while another upload in progress
   - Network error during upload
   - Server error during save

**Manual Testing:**
1. Test file picker selection
2. Test drag and drop
3. Test preview display
4. Test upload button states
5. Test success/error messages
6. Test avatar display after upload
7. Test on different devices and browsers

### Performance Considerations

**Image Optimization:**
- Consider resizing images on server to standard dimensions (e.g., 256x256)
- Convert to optimized format (WebP with JPEG fallback)
- Implement lazy loading for avatar images

**Storage Management:**
- Implement cleanup for old avatars when user uploads new one
- Consider file size limits for total user storage

**Future Enhancements:**
- CDN integration for avatar serving
- Image cropping UI before upload
- Multiple avatar sizes (thumbnail, medium, large)
- Avatar caching strategy

## Security Considerations

### Avatar Upload Security

1. **File Type Validation:**
   - Check MIME type
   - Verify file signature (magic numbers)
   - Reject executable files

2. **File Size Limits:**
   - Enforce 5MB limit
   - Prevent DoS through large uploads

3. **File Storage:**
   - Store in public directory with restricted permissions
   - Use unique, non-guessable filenames
   - Prevent directory traversal attacks

4. **Authentication:**
   - Verify user session before upload
   - Ensure users can only update their own avatar

5. **Content Security:**
   - Sanitize filenames
   - Strip EXIF data from images
   - Scan for malicious content

## Implementation Notes

### Logo Fix Priority

This is a high-priority fix as it affects brand visibility on the main landing page. The fix should be straightforward - likely just verifying the image path and CSS.

### Avatar Upload Implementation

This requires:
1. Database migration to add avatarUrl field
2. New API endpoint for upload
3. File system operations
4. Frontend component updates

The implementation should follow Next.js best practices for file uploads and use the existing authentication system.

### Deployment Considerations

- Database migration must run before deploying new code
- Ensure public/avatars directory exists and is writable
- Test file upload limits on production server
- Monitor storage usage after deployment
