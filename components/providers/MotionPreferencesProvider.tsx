'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MotionPreferencesContextType {
  prefersReducedMotion: boolean;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const MotionPreferencesContext = createContext<MotionPreferencesContextType>({
  prefersReducedMotion: false,
  animationsEnabled: true,
  toggleAnimations: () => {},
});

export function useMotionPreferences() {
  const context = useContext(MotionPreferencesContext);
  if (!context) {
    throw new Error('useMotionPreferences must be used within MotionPreferencesProvider');
  }
  return context;
}

interface MotionPreferencesProviderProps {
  children: ReactNode;
}

export function MotionPreferencesProvider({ children }: MotionPreferencesProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Load user preference from localStorage
    const savedPreference = localStorage.getItem('animations-enabled');
    if (savedPreference !== null) {
      setAnimationsEnabled(savedPreference === 'true');
    } else if (mediaQuery.matches) {
      // If system prefers reduced motion and no user preference, disable animations
      setAnimationsEnabled(false);
    }

    // Listen for changes to system preference
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      // Only auto-disable if user hasn't set a preference
      if (localStorage.getItem('animations-enabled') === null && e.matches) {
        setAnimationsEnabled(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply data attribute to document for CSS targeting
    if (!animationsEnabled || prefersReducedMotion) {
      document.documentElement.setAttribute('data-reduce-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduce-motion');
    }
  }, [animationsEnabled, prefersReducedMotion]);

  const toggleAnimations = () => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    localStorage.setItem('animations-enabled', String(newValue));
  };

  return (
    <MotionPreferencesContext.Provider
      value={{
        prefersReducedMotion,
        animationsEnabled,
        toggleAnimations,
      }}
    >
      {children}
    </MotionPreferencesContext.Provider>
  );
}
