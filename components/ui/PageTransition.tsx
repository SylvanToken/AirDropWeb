"use client";

import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

export function PageSlideRight({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-slide-in-right ${className}`}>
      {children}
    </div>
  );
}

export function PageSlideLeft({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-slide-in-left ${className}`}>
      {children}
    </div>
  );
}

export function PageScaleIn({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-scale-in ${className}`}>
      {children}
    </div>
  );
}
