# Requirements Document

## Introduction

This document outlines the requirements for fixing two critical UI issues in the Sylvan Token application: the logo not displaying on the main page and the non-functional avatar upload feature. These fixes will improve user experience and ensure consistent branding across all pages.

## Glossary

- **Main Page**: The landing page of the application accessible at the root URL ("/")
- **Header Component**: The navigation component displayed at the top of all pages
- **Logo Component**: The reusable component that displays the Sylvan Token logo and text
- **Avatar Upload Component**: The component that allows users to upload and update their profile picture
- **Profile API**: The backend API endpoint that handles user profile data operations
- **Image Storage**: The system responsible for storing and serving uploaded images

## Requirements

### Requirement 1: Logo Display on Main Page

**User Story:** As a visitor to the main page, I want to see the Sylvan Token logo in the header, so that I can identify the brand and navigate to other pages.

#### Acceptance Criteria

1. WHEN a user visits the main page ("/"), THE Header Component SHALL display the Sylvan Token logo image with dimensions of 40x40 pixels
2. WHEN a user views the main page on any device, THE Logo Component SHALL be visible and properly rendered without CSS conflicts
3. WHEN a user hovers over the logo on the main page, THE Logo Component SHALL display the same hover effects as on other pages
4. THE Header Component SHALL use the same logo rendering logic for authenticated and non-authenticated users on the main page

### Requirement 2: Functional Avatar Upload

**User Story:** As a registered user, I want to upload a profile picture, so that I can personalize my account and be recognized by other users.

#### Acceptance Criteria

1. WHEN a user selects an image file through the file picker, THE Avatar Upload Component SHALL validate that the file is an image type (PNG, JPG, GIF, WEBP)
2. WHEN a user selects an image file larger than 5MB, THE Avatar Upload Component SHALL display an error message and prevent upload
3. WHEN a user clicks the "Upload Avatar" button, THE Avatar Upload Component SHALL send the image data to the Profile API endpoint
4. WHEN the Profile API receives a valid image, THE Profile API SHALL store the image in Image Storage and update the user's profile record with the image URL
5. WHEN the avatar upload completes successfully, THE Avatar Upload Component SHALL display the new avatar image and show a success message
6. WHEN the avatar upload fails, THE Avatar Upload Component SHALL display an error message with the failure reason
7. WHEN a user drags and drops an image file onto the upload area, THE Avatar Upload Component SHALL process the file using the same validation and upload logic as the file picker

### Requirement 3: Avatar Display Across Application

**User Story:** As a registered user with an uploaded avatar, I want to see my profile picture displayed throughout the application, so that my account feels personalized.

#### Acceptance Criteria

1. WHEN a user has an uploaded avatar, THE Profile API SHALL return the avatar URL in the user profile response
2. WHEN the Avatar Upload Component loads, THE Avatar Upload Component SHALL display the user's current avatar if one exists
3. WHEN a user navigates to any page after uploading an avatar, THE application SHALL display the user's avatar in relevant UI components
4. IF a user does not have an uploaded avatar, THEN THE Avatar Upload Component SHALL display initials based on the username as a fallback
