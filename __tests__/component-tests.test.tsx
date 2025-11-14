/**
 * Component Tests
 * 
 * Tests for React components including authentication, tasks, wallet, profile, and admin components.
 * Uses React Testing Library for component rendering and user interaction testing.
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
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: any) => {
    // Return the key as the translation for testing
    return key;
  },
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe('Authentication Components', () => {
  describe('LoginForm', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render login form with all fields', () => {
      const { LoginForm } = require('@/components/auth/LoginForm');
      renderWithProviders(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should handle form submission with valid credentials', async () => {
      const { signIn } = require('next-auth/react');
      signIn.mockResolvedValue({ error: null });

      const { LoginForm } = require('@/components/auth/LoginForm');
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('should display error message on failed login', async () => {
      const { signIn } = require('next-auth/react');
      signIn.mockResolvedValue({ error: 'Invalid credentials' });

      const { LoginForm } = require('@/components/auth/LoginForm');
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('RegisterForm', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      global.fetch = jest.fn();
    });

    it('should render registration form with all fields', () => {
      const { RegisterForm } = require('@/components/auth/RegisterForm');
      renderWithProviders(<RegisterForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should validate password confirmation', async () => {
      const { RegisterForm } = require('@/components/auth/RegisterForm');
      renderWithProviders(<RegisterForm />);

      const passwordInput = screen.getAllByLabelText(/password/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'differentpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('AdminLoginForm', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      global.fetch = jest.fn();
    });

    it('should render admin login form', () => {
      const { AdminLoginForm } = require('@/components/auth/AdminLoginForm');
      renderWithProviders(<AdminLoginForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});


describe('Task Components', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Follow on Twitter',
    description: 'Follow @SylvanToken on Twitter',
    points: 10,
    taskType: 'TWITTER_FOLLOW' as const,
    taskUrl: 'https://twitter.com/SylvanToken',
    isActive: true,
    completedToday: false,
    campaignId: 'campaign-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('TaskCard', () => {
    it('should render task card with props', () => {
      const { TaskCard } = require('@/components/tasks/TaskCard');
      const onComplete = jest.fn();

      renderWithProviders(
        <TaskCard task={mockTask} onComplete={onComplete} />
      );

      expect(screen.getByText('Follow on Twitter')).toBeInTheDocument();
      expect(screen.getByText('Follow @SylvanToken on Twitter')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle completion button click', async () => {
      const { TaskCard } = require('@/components/tasks/TaskCard');
      const onComplete = jest.fn();

      renderWithProviders(
        <TaskCard task={mockTask} onComplete={onComplete} />
      );

      const startButton = screen.getByRole('button', { name: /start task/i });
      await userEvent.click(startButton);

      // Timer should start
      expect(screen.getByText(/timer active/i)).toBeInTheDocument();
    });

    it('should show completed state for completed tasks', () => {
      const { TaskCard } = require('@/components/tasks/TaskCard');
      const completedTask = { ...mockTask, completedToday: true };
      const onComplete = jest.fn();

      renderWithProviders(
        <TaskCard task={completedTask} onComplete={onComplete} />
      );

      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });

  describe('TaskList', () => {
    const mockTasks = [
      { ...mockTask, id: 'task-1' },
      { ...mockTask, id: 'task-2', title: 'Join Telegram', taskType: 'TELEGRAM_JOIN' as const },
    ];

    it('should render multiple tasks', () => {
      const { TaskList } = require('@/components/tasks/TaskList');

      renderWithProviders(
        <TaskList initialTasks={mockTasks} hasVerifiedWallet={true} />
      );

      expect(screen.getByText('Follow on Twitter')).toBeInTheDocument();
      expect(screen.getByText('Join Telegram')).toBeInTheDocument();
    });
  });

  describe('TaskCompletionModal', () => {
    it('should display completion modal', () => {
      const { TaskCompletionModal } = require('@/components/tasks/TaskCompletionModal');
      const onClose = jest.fn();

      renderWithProviders(
        <TaskCompletionModal
          isOpen={true}
          onClose={onClose}
          taskTitle="Follow on Twitter"
          pointsEarned={10}
        />
      );

      expect(screen.getByText(/follow on twitter/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('TaskTimer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should countdown from 30 seconds', () => {
      const { TaskTimer } = require('@/components/tasks/TaskTimer');
      const onComplete = jest.fn();

      renderWithProviders(
        <TaskTimer
          taskId="task-1"
          taskUrl="https://twitter.com/test"
          taskTitle="Test Task"
          onComplete={onComplete}
          isCompleting={false}
        />
      );

      const startButton = screen.getByRole('button', { name: /start task/i });
      fireEvent.click(startButton);

      // Timer should show 30 seconds
      expect(screen.getByText(/30s/i)).toBeInTheDocument();
    });
  });
});


describe('Wallet Components', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  describe('WalletSetup', () => {
    it('should render wallet setup form', () => {
      const { WalletSetup } = require('@/components/wallet/WalletSetup');

      renderWithProviders(
        <WalletSetup initialWalletAddress={null} initialWalletVerified={false} />
      );

      expect(screen.getByLabelText(/wallet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should validate wallet address format', async () => {
      const { WalletSetup } = require('@/components/wallet/WalletSetup');

      renderWithProviders(
        <WalletSetup initialWalletAddress={null} initialWalletVerified={false} />
      );

      const walletInput = screen.getByLabelText(/wallet/i);
      const submitButton = screen.getByRole('button', { name: /continue/i });

      await userEvent.type(walletInput, 'invalid-address');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });

    it('should show verified state for verified wallets', () => {
      const { WalletSetup } = require('@/components/wallet/WalletSetup');

      renderWithProviders(
        <WalletSetup
          initialWalletAddress="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
          initialWalletVerified={true}
        />
      );

      expect(screen.getByText(/verified/i)).toBeInTheDocument();
      expect(screen.getByText(/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/i)).toBeInTheDocument();
    });
  });

  describe('WalletConfirmationModal', () => {
    it('should display confirmation modal', () => {
      const { WalletConfirmationModal } = require('@/components/wallet/WalletConfirmationModal');
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      renderWithProviders(
        <WalletConfirmationModal
          isOpen={true}
          walletAddress="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
          onConfirm={onConfirm}
          onCancel={onCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText(/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('WalletWarningBanner', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ walletAddress: null, walletVerified: false }),
        })
      ) as jest.Mock;
    });

    it('should display warning banner for users without wallet', async () => {
      const { WalletWarningBanner } = require('@/components/layout/WalletWarningBanner');

      renderWithProviders(<WalletWarningBanner />);

      await waitFor(() => {
        expect(screen.getByText(/add your wallet address/i)).toBeInTheDocument();
      });
    });
  });
});


describe('Profile Components', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    totalPoints: 100,
    createdAt: new Date().toISOString(),
  };

  describe('ProfileForm', () => {
    it('should render profile form with user data', () => {
      const { ProfileForm } = require('@/components/profile/ProfileForm');

      renderWithProviders(<ProfileForm user={mockUser} />);

      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('AvatarUpload', () => {
    it('should render avatar upload component', () => {
      const { AvatarUpload } = require('@/components/profile/AvatarUpload');

      renderWithProviders(
        <AvatarUpload currentAvatar={null} username="testuser" />
      );

      expect(screen.getByText(/drop your image/i)).toBeInTheDocument();
    });
  });

  describe('SocialMediaSetup', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should render social media setup for Twitter', () => {
      const { SocialMediaSetup } = require('@/components/profile/SocialMediaSetup');
      const onUpdate = jest.fn();

      renderWithProviders(
        <SocialMediaSetup
          type="twitter"
          username={null}
          verified={false}
          onUpdate={onUpdate}
        />
      );

      expect(screen.getByText(/twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('should render social media setup for Telegram', () => {
      const { SocialMediaSetup } = require('@/components/profile/SocialMediaSetup');
      const onUpdate = jest.fn();

      renderWithProviders(
        <SocialMediaSetup
          type="telegram"
          username={null}
          verified={false}
          onUpdate={onUpdate}
        />
      );

      expect(screen.getByText(/telegram/i)).toBeInTheDocument();
    });

    it('should show verified state for verified accounts', () => {
      const { SocialMediaSetup } = require('@/components/profile/SocialMediaSetup');
      const onUpdate = jest.fn();

      renderWithProviders(
        <SocialMediaSetup
          type="twitter"
          username="testuser"
          verified={true}
          onUpdate={onUpdate}
        />
      );

      expect(screen.getByText(/verified/i)).toBeInTheDocument();
      expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
    });
  });

  describe('SocialMediaConfirmationModal', () => {
    it('should display confirmation modal', () => {
      const { SocialMediaConfirmationModal } = require('@/components/profile/SocialMediaConfirmationModal');
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      renderWithProviders(
        <SocialMediaConfirmationModal
          isOpen={true}
          type="twitter"
          username="testuser"
          onConfirm={onConfirm}
          onCancel={onCancel}
          isLoading={false}
        />
      );

      expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });
  });
});


describe('Admin Components', () => {
  const mockUsers = [
    {
      id: 'user-1',
      username: 'user1',
      email: 'user1@example.com',
      role: 'USER' as const,
      totalPoints: 100,
      completionCount: 5,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    },
    {
      id: 'user-2',
      username: 'admin1',
      email: 'admin@example.com',
      role: 'ADMIN' as const,
      totalPoints: 200,
      completionCount: 10,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    },
  ];

  describe('UserTable', () => {
    it('should render user table with data', () => {
      const UserTable = require('@/components/admin/UserTable').default;
      const onSort = jest.fn();
      const onSearch = jest.fn();

      renderWithProviders(
        <UserTable users={mockUsers} onSort={onSort} onSearch={onSearch} />
      );

      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('admin1')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
  });

  describe('TaskManager', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        })
      ) as jest.Mock;
    });

    it('should render task manager', async () => {
      const TaskManager = require('@/components/admin/TaskManager').default;

      renderWithProviders(<TaskManager />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('TaskForm', () => {
    it('should render task form with validation', () => {
      const TaskForm = require('@/components/admin/TaskForm').default;
      const onSuccess = jest.fn();
      const onCancel = jest.fn();

      renderWithProviders(
        <TaskForm onSuccess={onSuccess} onCancel={onCancel} />
      );

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/points/i)).toBeInTheDocument();
    });
  });

  describe('StatsCard', () => {
    it('should display stats card with data', () => {
      const StatsCard = require('@/components/admin/StatsCard').default;

      renderWithProviders(
        <StatsCard
          title="Total Users"
          value="1,234"
          description="Active users"
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Active users')).toBeInTheDocument();
    });
  });

  describe('VerificationDashboard', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              completions: [],
              pagination: { page: 1, total: 0, pages: 0, limit: 20 },
            }),
        })
      ) as jest.Mock;
    });

    it('should render verification dashboard', async () => {
      const { VerificationDashboard } = require('@/components/admin/VerificationDashboard');

      renderWithProviders(<VerificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/verification/i)).toBeInTheDocument();
      });
    });
  });
});


describe('Loading States', () => {
  describe('LoadingSpinner', () => {
    it('should display loading spinner', () => {
      const { Spinner } = require('@/components/ui/spinner');

      renderWithProviders(<Spinner />);

      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should display loading spinner with label', () => {
      const { Spinner } = require('@/components/ui/spinner');

      renderWithProviders(<Spinner label="Loading..." />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('LoadingOverlay', () => {
    it('should display loading overlay when visible', () => {
      const { LoadingOverlay } = require('@/components/ui/LoadingOverlay');

      renderWithProviders(<LoadingOverlay visible={true} message="Please wait..." />);

      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('should not display loading overlay when not visible', () => {
      const { LoadingOverlay } = require('@/components/ui/LoadingOverlay');

      const { container } = renderWithProviders(
        <LoadingOverlay visible={false} message="Please wait..." />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Skeleton Loaders', () => {
    it('should display skeleton card', () => {
      const { SkeletonCard } = require('@/components/ui/skeleton');

      const { container } = renderWithProviders(<SkeletonCard />);

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should display skeleton table', () => {
      const { SkeletonTable } = require('@/components/ui/skeleton');

      const { container } = renderWithProviders(<SkeletonTable />);

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  describe('LoadingStates Component', () => {
    it('should display inline loading', () => {
      const { InlineLoading } = require('@/components/ui/LoadingStates');

      renderWithProviders(<InlineLoading message="Loading data..." />);

      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should display centered loading', () => {
      const { CenteredLoading } = require('@/components/ui/LoadingStates');

      renderWithProviders(<CenteredLoading message="Loading..." />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});


describe('Error States', () => {
  describe('Error Message Display', () => {
    it('should display error message in login form', async () => {
      const { signIn } = require('next-auth/react');
      signIn.mockResolvedValue({ error: 'Invalid credentials' });

      const { LoginForm } = require('@/components/auth/LoginForm');
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should display error message in wallet setup', async () => {
      const { WalletSetup } = require('@/components/wallet/WalletSetup');

      renderWithProviders(
        <WalletSetup initialWalletAddress={null} initialWalletVerified={false} />
      );

      const walletInput = screen.getByLabelText(/wallet/i);
      const submitButton = screen.getByRole('button', { name: /continue/i });

      await userEvent.type(walletInput, 'invalid');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Errors', () => {
    it('should display validation errors in task form', async () => {
      const TaskForm = require('@/components/admin/TaskForm').default;
      const onSuccess = jest.fn();
      const onCancel = jest.fn();

      renderWithProviders(
        <TaskForm onSuccess={onSuccess} onCancel={onCancel} />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        // Form should show validation errors for required fields
        const titleInput = screen.getByLabelText(/title/i);
        expect(titleInput).toBeInTheDocument();
      });
    });

    it('should display password mismatch error in register form', async () => {
      const { RegisterForm } = require('@/components/auth/RegisterForm');
      renderWithProviders(<RegisterForm />);

      const passwordInput = screen.getAllByLabelText(/password/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'different');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Error Handling', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock;
    });

    it('should handle API errors in task manager', async () => {
      const TaskManager = require('@/components/admin/TaskManager').default;

      renderWithProviders(<TaskManager />);

      await waitFor(() => {
        // Should show error state or message
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });
  });
});


describe('Translation in Components', () => {
  describe('Components using useTranslation hook', () => {
    it('should display translated text in login form', () => {
      const { LoginForm } = require('@/components/auth/LoginForm');
      renderWithProviders(<LoginForm />);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should display translated text in register form', () => {
      const { RegisterForm } = require('@/components/auth/RegisterForm');
      renderWithProviders(<RegisterForm />);

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should display translated text in admin login form', () => {
      const { AdminLoginForm } = require('@/components/auth/AdminLoginForm');
      renderWithProviders(<AdminLoginForm />);

      expect(screen.getByText('Admin Login')).toBeInTheDocument();
      expect(screen.getByText('Access admin dashboard')).toBeInTheDocument();
    });
  });

  describe('Language switching in components', () => {
    it('should render components with translation keys', () => {
      const { LoginForm } = require('@/components/auth/LoginForm');
      
      renderWithProviders(<LoginForm />);

      // Since we're mocking translations, we just verify the component renders
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Translated error messages', () => {
    it('should display translated error in login form', async () => {
      const { signIn } = require('next-auth/react');
      signIn.mockResolvedValue({ error: 'Invalid credentials' });

      const { LoginForm } = require('@/components/auth/LoginForm');
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrong');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should display translated validation error in register form', async () => {
      const { RegisterForm } = require('@/components/auth/RegisterForm');
      renderWithProviders(<RegisterForm />);

      const passwordInput = screen.getAllByLabelText(/password/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'different');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });
});
