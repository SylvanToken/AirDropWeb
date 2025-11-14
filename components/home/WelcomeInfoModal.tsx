'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getCookie, setCookie } from '@/lib/cookies';
import { 
  AlertTriangle, 
  Lock, 
  X, 
  User, 
  Wallet, 
  Target, 
  Star, 
  Clock, 
  CheckCircle 
} from 'lucide-react';

export default function WelcomeInfoModal() {
  const t = useTranslations('welcomeModal');
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Check cookie on component mount
  useEffect(() => {
    const cookieValue = getCookie('welcome_modal_dismissed');
    
    if (cookieValue) {
      // Cookie exists, don't show modal
      setIsOpen(false);
    } else {
      // Cookie doesn't exist, show modal
      setIsOpen(true);
    }
  }, []);

  // Handle modal dismiss
  const handleDismiss = useCallback(() => {
    // Check if countdown has completed
    if (countdown === 0) {
      // Check if "don't show again" checkbox is checked
      if (dontShowAgain) {
        // Set cookie with 365 days expiration
        setCookie('welcome_modal_dismissed', 'true', 365);
      }
      // Close modal
      setIsOpen(false);
    }
  }, [countdown, dontShowAgain]);

  // Countdown timer logic
  useEffect(() => {
    // Only run timer if modal is open and countdown is greater than 0
    if (!isOpen || countdown <= 0) return;
    
    // Set up interval to decrement countdown every second
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Countdown reached 0, enable button
          setIsButtonEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up interval on component unmount or when dependencies change
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  // Focus trap and keyboard support - Task 8.1, 8.2
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Store the element that had focus before modal opened
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      return modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab and Shift+Tab for focus trap
    const handleTabKey = (e: KeyboardEvent) => {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab: moving backwards
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab: moving forwards
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Handle Escape key to close modal (after countdown)
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && countdown === 0) {
        handleDismiss();
      }
    };

    // Add event listeners
    modal.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup: return focus to previous element when modal closes
    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Return focus to the element that had focus before modal opened
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, countdown, handleDismiss]);

  // Get button text based on countdown state
  const getButtonText = () => {
    if (countdown > 0) {
      // Display countdown format with translation
      return `${t('button.understood')} (${countdown})`;
    }
    // Display ready state with translation
    return t('button.understood');
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself (not the modal content)
    if (e.target === e.currentTarget && countdown === 0) {
      handleDismiss();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040] animate-backdrop-fade-in"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Content Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-description"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1050] w-[90%] sm:w-[85%] md:w-[80%] lg:w-[600px] max-w-[600px] bg-white dark:bg-card border-2 border-eco-leaf/30 rounded-lg sm:rounded-xl shadow-eco-xl p-4 sm:p-5 md:p-6 lg:p-8 animate-modal-fade-in max-h-[90vh] overflow-y-auto"
      >
        {/* Title and Subtitle Section - Task 4.3, Task 9, Task 10 */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <AlertTriangle 
              className="w-5 h-5 sm:w-6 sm:h-6 text-eco-forest dark:text-eco-leaf flex-shrink-0 animate-pulse-eco" 
              aria-hidden="true"
            />
            <h2 
              id="welcome-modal-title" 
              className="text-lg sm:text-xl md:text-2xl font-bold text-eco-forest dark:text-eco-leaf"
            >
              {t('title')}
            </h2>
          </div>
          <p 
            id="welcome-modal-description" 
            className="text-xs sm:text-sm md:text-base text-muted-foreground transition-colors duration-300"
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Information Items List - Task 4.4, Task 9, Task 10 */}
        <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 mb-4 sm:mb-5 md:mb-6 max-h-[45vh] sm:max-h-[50vh] overflow-y-auto scrollbar-thin">
          {/* Item 1: Security */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in">
            <Lock 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.security')}
            </p>
          </div>

          {/* Item 2: No Password Reset */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in-delay">
            <X 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.noPasswordReset')}
            </p>
          </div>

          {/* Item 3: Social Media Lock */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in-delay-2">
            <User 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.socialMediaLock')}
            </p>
          </div>

          {/* Item 4: Wallet Lock */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in">
            <Wallet 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.walletLock')}
            </p>
          </div>

          {/* Item 5: Future Events */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in-delay">
            <Target 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.futureEvents')}
            </p>
          </div>

          {/* Item 6: Early Benefits */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in-delay-2">
            <Star 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.earlyBenefits')}
            </p>
          </div>

          {/* Item 7: Time Limited */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in">
            <Clock 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.timeLimited')}
            </p>
          </div>

          {/* Item 8: Accuracy */}
          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10 transition-all duration-200 animate-fade-in-delay">
            <CheckCircle 
              className="w-4 h-4 sm:w-5 sm:h-5 text-eco-leaf dark:text-eco-moss flex-shrink-0 mt-0.5 transition-colors duration-300" 
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300">
              {t('items.accuracy')}
            </p>
          </div>
        </div>

        {/* Countdown Button - Task 4.5, Task 8.2, Task 8.3, Task 9, Task 10 */}
        <button
          onClick={handleDismiss}
          disabled={!isButtonEnabled}
          aria-disabled={!isButtonEnabled}
          aria-label={countdown > 0 ? t('button.countdownLabel', { count: countdown }) : t('button.readyLabel')}
          className={`
            w-full py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-5 md:px-6 rounded-md sm:rounded-lg font-semibold text-sm sm:text-base md:text-lg
            transition-all duration-300 touch-target min-h-[44px]
            ${
              isButtonEnabled
                ? 'gradient-eco-primary text-white hover:brightness-110 hover:shadow-eco-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          {getButtonText()}
        </button>

        {/* "Don't Show Again" Checkbox - Task 4.6, Task 8.2, Task 9, Task 10 */}
        <div className="flex items-center gap-2 mt-3 sm:mt-4 justify-center group">
          <input
            type="checkbox"
            id="dont-show-again"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            aria-label={t('checkbox.label')}
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded border-eco-leaf/30 text-eco-leaf dark:text-eco-moss focus:ring-2 focus:ring-eco-leaf dark:focus:ring-eco-moss focus:ring-offset-2 cursor-pointer transition-all duration-200 hover:border-eco-leaf dark:hover:border-eco-moss min-w-[16px] min-h-[16px]"
          />
          <label
            htmlFor="dont-show-again"
            className="text-xs sm:text-sm text-muted-foreground cursor-pointer select-none transition-colors duration-200 group-hover:text-eco-forest dark:group-hover:text-eco-leaf"
          >
            {t('checkbox.label')}
          </label>
        </div>
      </div>
    </>
  );
}
