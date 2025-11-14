# Implementation Plan

- [x] 1. Fix logo display on main page




  - Investigate and fix the logo visibility issue in the Header component for non-authenticated users
  - Verify logo image path and accessibility
  - Check for CSS conflicts, z-index issues, or responsive layout problems




  - Test logo display across different viewport sizes and themes (light/dark mode)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_



- [x] 2. Add avatar support to database schema





  - [x] 2.1 Update Prisma schema to add avatarUrl field


    - Add `avatarUrl String?` field to User model in `prisma/schema.prisma`




    - _Requirements: 3.1_
  
  - [x] 2.2 Generate and run database migration


    - Run `npx prisma migrate dev --name add_avatar_url` to create migration

    - Verify migration applies successfully
    - _Requirements: 3.1_
  

  - [x] 2.3 Update profile API to include avatarUrl

    - Modify GET endpoint in `app/api/users/profile/route.ts` to select and return avatarUrl

    - _Requirements: 3.1_

- [x] 3. Implement avatar upload API endpoint





  - [x] 3.1 Create avatar upload route handler


    - Create new file `app/api/users/profile/avatar/route.ts`
    - Implement POST handler to receive multipart form data

    - Add authentication check using getServerSession
    - _Requirements: 2.3, 2.4_
  
  - [x] 3.2 Implement file validation logic





    - Validate file type (image/png, image/jpeg, image/gif, image/webp)
    - Validate file size (max 5MB)
    - Return appropriate error messages for validation failures
    - _Requirements: 2.1, 2.2, 2.5, 2.6_

  

  - [x] 3.3 Implement file storage logic





    - Create `public/avatars` directory if it doesn't exist
    - Generate unique filename using userId and timestamp
    - Save uploaded file to public/avatars directory
    - Handle file system errors gracefully


    - _Requirements: 2.4_

  
  - [x] 3.4 Update user profile with avatar URL





    - Update user record in database with new avatarUrl
    - Return success response with avatar URL
    - Handle database errors appropriately
    - _Requirements: 2.4, 2.5_

- [x] 4. Update AvatarUpload component with real upload functionality






  - [x] 4.1 Replace simulated upload with API call

    - Convert selected file to FormData
    - Make POST request to `/api/users/profile/avatar`
    - Handle loading states during upload
    - _Requirements: 2.3, 2.7_
  

  - [x] 4.2 Implement success and error handling

    - Display success message on successful upload
    - Display error messages from API responses
    - Update preview with new avatar URL after success
    - Reset upload state appropriately
    - _Requirements: 2.5, 2.6_
  

  - [x] 4.3 Update component to display current avatar

    - Modify component to accept and display avatarUrl from props
    - Show current avatar on component mount if available
    - Maintain fallback to initials if no avatar exists
    - _Requirements: 3.2, 3.4_

- [x] 5. Integrate avatar display across application






  - [x] 5.1 Update profile page to pass avatarUrl to AvatarUpload

    - Modify `app/(user)/profile/page.tsx` to include avatarUrl in profile fetch
    - Pass avatarUrl to AvatarUpload component
    - _Requirements: 3.1, 3.2_
  

  - [x] 5.2 Add avatar display to Header component

    - Update Header component to show user avatar in desktop user info section
    - Add avatar to mobile menu user info section
    - Use initials fallback if no avatar exists
    - _Requirements: 3.3_

- [x] 6. Test and verify all functionality






  - [x] 6.1 Test logo display on main page

    - Verify logo appears correctly for non-authenticated users
    - Test hover effects and responsive behavior
    - Test in light and dark modes
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  

  - [ ] 6.2 Test avatar upload flow
    - Test file picker selection with valid images
    - Test drag and drop functionality
    - Test file type validation (try uploading non-image)
    - Test file size validation (try uploading file > 5MB)
    - Verify avatar displays after successful upload
    - Test error messages display correctly
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  
  - [ ] 6.3 Test avatar display across application
    - Verify avatar shows in profile page
    - Verify avatar shows in header (desktop and mobile)
    - Verify initials fallback works when no avatar
    - Test avatar persistence across page navigation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
