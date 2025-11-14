import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface HeroSectionProps {
  variant?: 'home' | 'dashboard' | 'tasks' | 'leaderboard';
  backgroundImage?: string;
  overlay?: 'gradient' | 'solid' | 'none';
  height?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  children?: React.ReactNode;
}

export interface HeroContentProps {
  title: string;
  subtitle?: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  };
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  progress?: {
    label: string;
    current: number;
    total: number;
  };
  ranking?: {
    rank: number;
    total: number;
  };
  className?: string;
}

const heightClasses = {
  sm: 'h-[250px] md:h-[350px] landscape:max-h-[40vh] landscape:md:max-h-[50vh]',
  md: 'h-[300px] md:h-[400px] landscape:max-h-[50vh] landscape:md:max-h-[60vh]',
  lg: 'h-[600px] md:h-[700px] landscape:max-h-[60vh] landscape:md:max-h-[70vh]',
  full: 'h-screen landscape:h-screen',
};

const overlayClasses = {
  gradient: 'bg-gradient-to-b from-transparent via-background/50 to-background',
  solid: 'bg-background/60',
  none: '',
};

export function HeroSection({
  variant = 'home',
  backgroundImage,
  overlay = 'gradient',
  height = 'md',
  className,
  children,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        heightClasses[height],
        className
      )}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0 bg-top bg-no-repeat" 
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: '50%'
          }}
          aria-hidden="true"
        />
      )}

      {/* Overlay */}
      <div className={cn('absolute inset-0 z-10', overlayClasses[overlay])} aria-hidden="true" />

      {/* Content Container with Glassmorphism */}
      <div className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'w-full max-w-7xl',
            overlay !== 'none' && 'backdrop-blur-sm'
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function HeroContent({
  title,
  subtitle,
  cta,
  stats,
  progress,
  ranking,
  className,
}: HeroContentProps) {
  return (
    <div
      className={cn(
        'text-center space-y-6',
        'bg-card/80 backdrop-blur-md rounded-2xl p-8 md:p-12',
        'border border-border/50 shadow-2xl',
        className
      )}
    >
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-eco-leaf to-eco-forest bg-clip-text text-transparent">
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}

      {/* Stats Display */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20 rounded-xl p-4 border border-eco-leaf/30"
            >
              <div className="text-3xl md:text-4xl font-bold text-eco-leaf">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      {progress && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progress.label}</span>
            <span>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-eco-leaf to-eco-forest rounded-full transition-all duration-500"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Ranking Display */}
      {ranking && (
        <div className="mt-6 inline-flex items-center gap-3 bg-gradient-to-r from-eco-leaf/20 to-eco-forest/20 rounded-full px-6 py-3 border border-eco-leaf/30">
          <span className="text-2xl">🏆</span>
          <div className="text-left">
            <div className="text-sm text-muted-foreground">Your Rank</div>
            <div className="text-xl font-bold text-eco-leaf">
              #{ranking.rank} <span className="text-sm text-muted-foreground">of {ranking.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      {cta && (
        <div className="mt-8">
          <Button
            size="lg"
            variant={cta.variant === 'secondary' ? 'outline' : 'default'}
            className={cn(
              'text-lg px-8 py-6',
              cta.variant !== 'secondary' &&
                'bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-forest hover:to-eco-leaf'
            )}
            onClick={cta.onClick}
            asChild={!!cta.href}
          >
            {cta.href ? (
              <a href={cta.href}>{cta.label}</a>
            ) : (
              <span>{cta.label}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
