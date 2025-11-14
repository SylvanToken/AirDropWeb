"use client";

import { useEffect, useState } from 'react';
import { getSessionBackground } from '@/lib/session-background';

/**
 * Session-persistent background gradient
 * - Selects random gradient on first load
 * - Persists throughout user session
 * - Clears on logout
 */
export function SessionBackground() {
  const [bgClass, setBgClass] = useState('');

  useEffect(() => {
    const gradient = getSessionBackground();
    setBgClass(gradient);
  }, []);

  return (
    <div 
      className={`fixed inset-0 -z-10 ${bgClass} transition-colors duration-300`}
      aria-hidden="true"
    />
  );
}
