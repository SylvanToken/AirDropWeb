import { render, screen } from '@testing-library/react';
import { TaskDetailModal } from '../TaskDetailModal';
import { TaskWithCompletion } from '@/types';
import { NextIntlClientProvider } from 'next-intl';

// Mock task data
const mockActiveTask: TaskWithCompletion = {
  id: '1',
  campaignId: 'campaign-1',
  title: 'Test Task',
  description: 'This is a test task description',
  points: 100,
  taskType: 'TWITTER_FOLLOW',
  taskUrl: 'https://twitter.com/test',
  isActive: true,
  isCompleted: false,
  completedToday: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCompletedTask: TaskWithCompletion = {
  ...mockActiveTask,
  id: '2',
  isCompleted: true,
  completedToday: true,
  lastCompletedAt: new Date(),
  completionStatus: 'APPROVED',
};

const mockMissedTask: TaskWithCompletion = {
  ...mockActiveTask,
  id: '3',
  missedAt: new Date(),
  expiresAt: new Date(Date.now() - 1000),
};

const mockTimeLimitedTask: TaskWithCompletion = {
  ...mockActiveTask,
  id: '4',
  duration: 2,
  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
};

const messages = {
  tasks: {
    taskTypes: {
      TWITTER_FOLLOW: 'Twitter Follow',
      TWITTER_LIKE: 'Twitter Like',
      TWITTER_RETWEET: 'Twitter Retweet',
      TELEGRAM_JOIN: 'Telegram Join',
      CUSTOM: 'Custom Task',
    },
  },
};

describe('TaskDetailModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders nothing when task is null', () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={null} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays task title and description', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockActiveTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task description')).toBeInTheDocument();
  });

  it('displays task points and type', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockActiveTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Twitter Follow')).toBeInTheDocument();
  });

  it('displays active status badge for active tasks', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockActiveTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays completed status for completed tasks', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockCompletedTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('displays missed status for expired tasks', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockMissedTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.getByText(/This task expired on/)).toBeInTheDocument();
  });

  it('displays task URL when available', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockActiveTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    const link = screen.getByRole('link', { name: /twitter.com\/test/ });
    expect(link).toHaveAttribute('href', 'https://twitter.com/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays close button', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockActiveTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TaskDetailModal task={mockActiveTask} isOpen={true} onClose={mockOnClose} />
      </NextIntlClientProvider>
    );

    // Dialog should have proper ARIA attributes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });
});
