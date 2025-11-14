/**
 * WelcomeInfoModal Component Tests
 * 
 * Tests for the welcome information modal that appears on first homepage visit.
 * Covers countdown timer, cookie persistence, accessibility, and responsive behavior.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WelcomeInfoModal from '@/components/home/WelcomeInfoModal';
import * as cookieUtils from '@/lib/cookies';

jest.mock('@/lib/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
}));

describe('WelcomeInfoModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Display - Requirement 1.1', () => {
    it('should display modal on first visit when cookie does not exist', () => {
      (cookieUtils.getCookie as jest.Mock).mockReturnValue(null);
      render(<WelcomeInfoModal />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Important Account Information')).toBeInTheDocument();
    });

    it('should not display modal when cookie exists', () => {
      (cookieUtils.getCookie as jest.Mock).mockReturnValue('true');
      const { container } = render(<WelcomeInfoModal />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Modal Structure - Requirements 1.2, 1.3, 1.4', () => {
    beforeEach(() => {
      (cookieUtils.getCookie as jest.Mock).mockReturnValue(null);
    });

    it('should display modal centered with backdrop', () => {
      render(<WelcomeInfoModal />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('fixed');
      expect(dialog.className).toContain('top-1/2');
    });

    it('should display all 8 information items', () => {
      render(<WelcomeInfoModal />);
      expect(screen.getByText(/Account security is your responsibility/i)).toBeInTheDocument();
      expect(screen.getByText(/Forgot Password.*option is not available/i)).toBeInTheDocument();
      expect(screen.getByText(/Social media username cannot be changed after registration/i)).toBeInTheDocument();
      expect(screen.getByText(/Wallet address cannot be changed after registration/i)).toBeInTheDocument();
      expect(screen.getByText(/Your saved information will be used for future events/i)).toBeInTheDocument();
      expect(screen.getByText(/Early members may receive different scoring advantages/i)).toBeInTheDocument();
      expect(screen.getByText(/Some tasks and activities are time-limited/i)).toBeInTheDocument();
      expect(screen.getByText(/Please ensure all information is accurate/i)).toBeInTheDocument();
    });
  });

  describe('Countdown Timer - Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6', () => {
    beforeEach(() => {
      (cookieUtils.getCookie as jest.Mock).mockReturnValue(null);
    });

    it('should start countdown at 30 seconds', () => {
      render(<WelcomeInfoModal />);
      const button = screen.getByRole('button');
      expect(button.textContent).toBe('Understood (30)');
    });

    it('should decrement countdown every second', () => {
      render(<WelcomeInfoModal />);
      const button = screen.getByRole('button');
      act(() => { jest.advanceTimersByTime(1000); });
      expect(button.textContent).toBe('Understood (29)');
    });

    it('should disable button during countdown', () => {
      render(<WelcomeInfoModal />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should enable button when countdown reaches 0', () => {
      render(<WelcomeInfoModal />);
      const button = screen.getByRole('button');
      act(() => { jest.advanceTimersByTime(30000); });
      expect(button).not.toBeDisabled();
      expect(button.textContent).toBe('Understood');
    });
  });

  describe('Cookie Persistence - Requirements 3.1, 3.2, 3.3, 3.4, 3.5', () => {
    beforeEach(() => {
      (cookieUtils.getCookie as jest.Mock).mockReturnValue(null);
    });

    it('should display checkbox below button', () => {
      render(<WelcomeInfoModal />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByLabelText('Don\'t show this again')).toBeInTheDocument();
    });

    it('should have checkbox unchecked by default', () => {
      render(<WelcomeInfoModal />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should set cookie when checkbox is checked and button clicked', () => {
      render(<WelcomeInfoModal />);
      act(() => { jest.advanceTimersByTime(30000); });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(cookieUtils.setCookie).toHaveBeenCalledWith('welcome_modal_dismissed', 'true', 365);
    });

    it('should not set cookie when checkbox is unchecked', () => {
      render(<WelcomeInfoModal />);
      act(() => { jest.advanceTimersByTime(30000); });
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(cookieUtils.setCookie).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility - Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7', () => {
    beforeEach(() => {
      (cookieUtils.getCookie as jest.Mock).mockReturnValue(null);
    });

    it('should have proper ARIA attributes', () => {
      render(<WelcomeInfoModal />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('welcome-modal-title');
    });

    it('should close modal with Escape key after countdown', async () => {
      render(<WelcomeInfoModal />);
      act(() => { jest.advanceTimersByTime(30000); });
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should not close modal with Escape key during countdown', () => {
      render(<WelcomeInfoModal />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Responsive Design - Requirements 1.5, 4.1, 4.2', () => {
    beforeEach(() => {
      (cookieUtils.getCookie as jest.Mock).mockReturnValue(null);
    });

    it('should have responsive classes', () => {
      render(<WelcomeInfoModal />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('w-[90%]');
      expect(dialog.className).toContain('max-w-[600px]');
    });
  });
});
