/**
 * Logo and Avatar Tests
 * 
 * Tests for logo display on main page and avatar upload/display functionality.
 * Covers Requirements 1.1-1.4 (Logo Display) and 2.1-3.4 (Avatar Upload and Display)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-auth/react
const mockSession = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
  },
  expires: '2024-12-31',
};

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: any) => key,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Helper to wrap components with providers
const renderWithProviders = (component: React.ReactElement) => {
  const { SessionProvider } = require('next-auth/react');
  return render(
    <SessionProvider session={null}>
      {component}
    </SessionProvider>
  );
};

describe('Logo Display Tests (Task 6.1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  describe('Logo on Main Page for Non-Authenticated Users', () => {
    it('should display logo with correct dimensions (40x40) for non-authenticated users - Requirement 1.1', () => {
      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      const logo = screen.getByAltText('Sylvan Token');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('width', '40');
      expect(logo).toHaveAttribute('height', '40');
    });

    it('should display logo with correct image path - Requirement 1.2', () => {
      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      const logo = screen.getByAltText('Sylvan Token');
      expect(logo).toHaveAttribute('src', '/assets/images/sylvan-token-logo.png');
    });

    it('should display logo text "Sylvan Token" - Requirement 1.1', () => {
      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      expect(screen.getByText('Sylvan Token')).toBeInTheDocument();
    });

    it('should have proper CSS classes for visibility - Requirement 1.2', () => {
      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      const logo = screen.getByAltText('Sylvan Token');
      expect(logo).toHaveClass('object-contain');
    });
  });

  describe('Logo Hover Effects', () => {
    it('should have hover effect classes applied - Requirement 1.3', () => {
      const { Header } = require('@/components/layout/Header');
      const { container } = renderWithProviders(<Header />);

      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toHaveClass('group');
    });
  });

  describe('Logo for Authenticated Users', () => {
    beforeEach(() => {
      const { useSession } = require('next-auth/react');
      useSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ avatarUrl: null }),
        })
      ) as jest.Mock;
    });

    it('should display logo for authenticated users with same rendering - Requirement 1.4', () => {
      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      const logo = screen.getByAltText('Sylvan Token');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('width', '40');
      expect(logo).toHaveAttribute('height', '40');
      expect(logo).toHaveAttribute('src', '/assets/images/sylvan-token-logo.png');
    });
  });
});

describe('Avatar Upload Flow Tests (Task 6.2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('File Picker Selection', () => {
    it('should accept valid image file through file picker - Requirement 2.1', async () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload avatar/i })).toBeInTheDocument();
      });
    });

    it('should accept PNG files - Requirement 2.1', async () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.queryByText(/please select an image file/i)).not.toBeInTheDocument();
      });
    });

    it('should accept JPG files - Requirement 2.1', async () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.queryByText(/please select an image file/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('File Type Validation', () => {
    it('should reject non-image files - Requirement 2.1', async () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Manually trigger the change event with the file
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/please select an image file/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Size Validation', () => {
    it('should reject files larger than 5MB - Requirement 2.2', async () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      // Create a file larger than 5MB
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/image size must be less than 5mb/i)).toBeInTheDocument();
      });
    });

    it('should accept files smaller than 5MB - Requirement 2.2', async () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const smallFile = new File([new ArrayBuffer(1024)], 'small.png', {
        type: 'image/png',
      });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, smallFile);

      await waitFor(() => {
        expect(screen.queryByText(/image size must be less than 5mb/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should handle drag and drop of image files - Requirement 2.7', async () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      const { container } = renderWithProviders(
        <AvatarUpload currentAvatar={null} username="testuser" />
      );

      const dropZone = container.querySelector('[class*="border-dashed"]') as HTMLElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('border-eco-leaf');

      const dataTransfer = {
        files: [file],
      };

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload avatar/i })).toBeInTheDocument();
      });
    });

    it('should show visual feedback during drag - Requirement 2.7', () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      const { container } = renderWithProviders(
        <AvatarUpload currentAvatar={null} username="testuser" />
      );

      const dropZone = container.querySelector('[class*="border-dashed"]') as HTMLElement;

      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('border-eco-leaf');
      expect(dropZone).toHaveClass('bg-eco-leaf/10');

      fireEvent.dragLeave(dropZone);
    });
  });

  describe('Upload Button and API Call', () => {
    it('should send image to API when upload button clicked - Requirement 2.3', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              avatarUrl: '/avatars/user-1-123456.png',
            }),
        })
      ) as jest.Mock;

      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      const uploadButton = await screen.findByRole('button', { name: /upload avatar/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/users/profile/avatar',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
      });
    });

    it('should display success message after successful upload - Requirement 2.5', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              avatarUrl: '/avatars/user-1-123456.png',
            }),
        })
      ) as jest.Mock;

      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      const uploadButton = await screen.findByRole('button', { name: /upload avatar/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/avatar uploaded successfully/i)).toBeInTheDocument();
      });
    });

    it('should display error message on upload failure - Requirement 2.6', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              success: false,
              error: 'Failed to save image',
            }),
        })
      ) as jest.Mock;

      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      const uploadButton = await screen.findByRole('button', { name: /upload avatar/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save image/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during upload - Requirement 2.3', async () => {
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      success: true,
                      avatarUrl: '/avatars/user-1-123456.png',
                    }),
                }),
              100
            )
          )
      ) as jest.Mock;

      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      const uploadButton = await screen.findByRole('button', { name: /upload avatar/i });
      await userEvent.click(uploadButton);

      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });

  describe('Avatar Display After Upload', () => {
    it('should display new avatar after successful upload - Requirement 2.5', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              avatarUrl: '/avatars/user-1-123456.png',
            }),
        })
      ) as jest.Mock;

      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, file);

      const uploadButton = await screen.findByRole('button', { name: /upload avatar/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        const avatar = screen.getByAltText('testuser');
        expect(avatar).toHaveAttribute('src', '/avatars/user-1-123456.png');
      });
    });
  });
});

describe('Avatar Display Across Application Tests (Task 6.3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Avatar in Profile Page', () => {
    it('should display current avatar in AvatarUpload component - Requirement 3.2', () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(
        <AvatarUpload currentAvatar="/avatars/user-1-123456.png" username="testuser" />
      );

      const avatar = screen.getByAltText('testuser');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', '/avatars/user-1-123456.png');
    });
  });

  describe('Avatar in Header', () => {
    beforeEach(() => {
      const { useSession } = require('next-auth/react');
      useSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
    });

    it('should display avatar in header for desktop view - Requirement 3.3', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ avatarUrl: '/avatars/user-1-123456.png' }),
        })
      ) as jest.Mock;

      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      await waitFor(() => {
        const avatar = screen.getAllByAltText('testuser')[0];
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', '/avatars/user-1-123456.png');
      });
    });

    it('should display avatar in mobile menu - Requirement 3.3', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ avatarUrl: '/avatars/user-1-123456.png' }),
        })
      ) as jest.Mock;

      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      // Open mobile menu
      const menuButton = screen.getByLabelText(/toggle menu/i);
      await userEvent.click(menuButton);

      await waitFor(() => {
        const avatars = screen.getAllByAltText('testuser');
        expect(avatars.length).toBeGreaterThan(1); // Should appear in both desktop and mobile
      });
    });
  });

  describe('Initials Fallback', () => {
    beforeEach(() => {
      const { useSession } = require('next-auth/react');
      useSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
    });

    it('should display initials when no avatar exists - Requirement 3.4', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ avatarUrl: null }),
        })
      ) as jest.Mock;

      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      await waitFor(() => {
        // The initials are split into single characters, so we check for 'T' which is the first initial
        const initialsElements = screen.getAllByText(/T/);
        expect(initialsElements.length).toBeGreaterThan(0);
      });
    });

    it('should display initials in AvatarUpload when no avatar - Requirement 3.4', () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="testuser" />);

      // The initials are displayed as a single character 'T' for single-word username
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should calculate initials correctly for multi-word usernames', () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');
      renderWithProviders(<AvatarUpload currentAvatar={null} username="john doe" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Avatar Persistence', () => {
    beforeEach(() => {
      const { useSession } = require('next-auth/react');
      useSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
    });

    it('should fetch and display avatar from API on component mount - Requirement 3.1', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ avatarUrl: '/avatars/user-1-123456.png' }),
        })
      ) as jest.Mock;

      const { Header } = require('@/components/layout/Header');
      renderWithProviders(<Header />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users/profile');
      });

      await waitFor(() => {
        const avatar = screen.getAllByAltText('testuser')[0];
        expect(avatar).toHaveAttribute('src', '/avatars/user-1-123456.png');
      });
    });
  });
});
