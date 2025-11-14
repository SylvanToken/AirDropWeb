import * as React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container
   * @default 'xl'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  /**
   * Whether to add responsive padding
   * @default true
   */
  padding?: boolean;
  
  /**
   * Custom padding size
   */
  paddingSize?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether to center the container
   * @default true
   */
  center?: boolean;
}

/**
 * Responsive container component with proper padding and max-width
 * Follows mobile-first design principles
 */
export function ResponsiveContainer({
  maxWidth = 'xl',
  padding = true,
  paddingSize = 'md',
  center = true,
  className,
  children,
  ...props
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    sm: 'px-3 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
  };

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        center && 'mx-auto',
        padding && paddingClasses[paddingSize],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns at different breakpoints
   * Format: { xs?: number, sm?: number, md?: number, lg?: number, xl?: number }
   */
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  
  /**
   * Gap size between grid items
   * @default 'md'
   */
  gap?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether to use auto-fit for responsive columns
   * @default false
   */
  autoFit?: boolean;
  
  /**
   * Minimum column width when using autoFit
   * @default '250px'
   */
  minColWidth?: string;
}

/**
 * Responsive grid component with flexible column configuration
 */
export function ResponsiveGrid({
  cols = { xs: 1, sm: 2, lg: 3 },
  gap = 'md',
  autoFit = false,
  minColWidth = '250px',
  className,
  children,
  ...props
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  const getColClasses = () => {
    if (autoFit) {
      return '';
    }

    const classes: string[] = [];
    if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    
    return classes.join(' ');
  };

  const gridStyle = autoFit
    ? { gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))` }
    : undefined;

  return (
    <div
      className={cn(
        'grid',
        !autoFit && getColClasses(),
        gapClasses[gap],
        className
      )}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction of the stack
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal' | 'responsive';
  
  /**
   * Spacing between items
   * @default 'md'
   */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Alignment of items
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  /**
   * Justify content
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

/**
 * Responsive stack component for flexible layouts
 */
export function ResponsiveStack({
  direction = 'vertical',
  spacing = 'md',
  align,
  justify,
  className,
  children,
  ...props
}: ResponsiveStackProps) {
  const spacingClasses = {
    xs: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    sm: direction === 'vertical' ? 'space-y-3' : 'space-x-3',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
  };

  const responsiveSpacingClasses = {
    xs: 'space-y-2 sm:space-y-0 sm:space-x-2',
    sm: 'space-y-3 sm:space-y-0 sm:space-x-3',
    md: 'space-y-4 sm:space-y-0 sm:space-x-4',
    lg: 'space-y-6 sm:space-y-0 sm:space-x-6',
    xl: 'space-y-8 sm:space-y-0 sm:space-x-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
    responsive: 'flex-col sm:flex-row',
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        direction === 'responsive' ? responsiveSpacingClasses[spacing] : spacingClasses[spacing],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
