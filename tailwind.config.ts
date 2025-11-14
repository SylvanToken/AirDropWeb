import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Eco-themed color palette with opacity support
        eco: {
          leaf: "hsl(var(--eco-leaf) / <alpha-value>)",
          forest: "hsl(var(--eco-forest) / <alpha-value>)",
          earth: "hsl(var(--eco-earth) / <alpha-value>)",
          sky: "hsl(var(--eco-sky) / <alpha-value>)",
          moss: "hsl(var(--eco-moss) / <alpha-value>)",
        },
        // Task state colors with opacity support
        task: {
          pending: "hsl(var(--task-pending) / <alpha-value>)",
          active: "hsl(var(--task-active) / <alpha-value>)",
          completed: "hsl(var(--task-completed) / <alpha-value>)",
          expired: "hsl(var(--task-expired) / <alpha-value>)",
          urgent: "hsl(var(--task-urgent) / <alpha-value>)",
        },
        // Status colors with opacity support
        status: {
          success: "hsl(var(--status-success) / <alpha-value>)",
          error: "hsl(var(--status-error) / <alpha-value>)",
          warning: "hsl(var(--status-warning) / <alpha-value>)",
          info: "hsl(var(--status-info) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-sm': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'eco': '0 4px 20px -2px hsla(var(--eco-leaf), 0.15)',
        'eco-lg': '0 10px 40px -5px hsla(var(--eco-leaf), 0.2)',
        'eco-xl': '0 20px 60px -10px hsla(var(--eco-leaf), 0.25)',
        'glow': '0 0 20px hsla(var(--eco-leaf), 0.3)',
        'glow-lg': '0 0 40px hsla(var(--eco-leaf), 0.4)',
        // 4K Depth Effect Shadows
        'depth-4k-1': '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.05), 0 0 10px hsla(var(--eco-leaf), 0.05)',
        'depth-4k-2': '0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.06), 0 16px 32px rgba(0, 0, 0, 0.06), 0 0 20px hsla(var(--eco-leaf), 0.1)',
        'depth-4k-3': '0 4px 8px rgba(0, 0, 0, 0.07), 0 8px 16px rgba(0, 0, 0, 0.07), 0 16px 32px rgba(0, 0, 0, 0.07), 0 32px 64px rgba(0, 0, 0, 0.07), 0 0 30px hsla(var(--eco-leaf), 0.15)',
        // Neon Glow Shadow Variants
        'neon-glow': '0 0 10px hsla(var(--eco-leaf), 0.3), 0 0 20px hsla(var(--eco-leaf), 0.2), 0 0 30px hsla(var(--eco-leaf), 0.1), inset 0 0 10px hsla(var(--eco-leaf), 0.05)',
        'neon-glow-strong': '0 0 15px hsla(var(--eco-leaf), 0.5), 0 0 30px hsla(var(--eco-leaf), 0.3), 0 0 45px hsla(var(--eco-leaf), 0.2), 0 0 60px hsla(var(--eco-leaf), 0.1), inset 0 0 15px hsla(var(--eco-leaf), 0.1)',
        'neon-border': '0 0 5px hsla(var(--eco-leaf), 0.2), inset 0 0 5px hsla(var(--eco-leaf), 0.1)',
        'neon-border-strong': '0 0 10px hsla(var(--eco-leaf), 0.4), 0 0 20px hsla(var(--eco-leaf), 0.2), inset 0 0 10px hsla(var(--eco-leaf), 0.15)',
        // Glass Depth Effect
        'glass-depth': '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 20px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      opacity: {
        '90': '0.9',
      },
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'photo': '4 / 3',
        'portrait': '3 / 4',
        'landscape': '4 / 3',
        'wide': '21 / 9',
        'ultrawide': '32 / 9',
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
      },
      transitionProperty: {
        'shadow': 'box-shadow',
        'glow': 'box-shadow, border-color',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "leaf-float": {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        "grow": {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        "wave": {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
        "pulse-eco": {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        "shimmer": {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        "fade-in": {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        "slide-in-right": {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        "slide-in-left": {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        "scale-in": {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        "gradient-x": {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        "gradient": {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Neon Pulse Animation
        "neon-pulse": {
          '0%, 100%': { 
            boxShadow: '0 0 10px hsla(var(--eco-leaf), 0.3), 0 0 20px hsla(var(--eco-leaf), 0.2), 0 0 30px hsla(var(--eco-leaf), 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 15px hsla(var(--eco-leaf), 0.5), 0 0 30px hsla(var(--eco-leaf), 0.3), 0 0 45px hsla(var(--eco-leaf), 0.2)' 
          },
        },
        // Gradient Shift for Animated Backgrounds
        "gradient-shift": {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Loading animations
        "bounce-slow": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        "pulse-slow": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        "rotate-slow": {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "leaf-float": "leaf-float 3s ease-in-out infinite",
        "grow": "grow 0.3s ease-out",
        "wave": "wave 2s ease-in-out infinite",
        "pulse-eco": "pulse-eco 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-delay": "fade-in 0.5s ease-out 0.2s both",
        "fade-in-delay-2": "fade-in 0.5s ease-out 0.4s both",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "gradient-x": "gradient-x 3s ease infinite",
        "gradient": "gradient 3s ease infinite",
        // Neon Effects
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        // Loading animations
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "rotate-slow": "rotate-slow 3s linear infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Nature Theme Gradients
        'gradient-eco': 'linear-gradient(135deg, hsl(var(--eco-leaf)) 0%, hsl(var(--eco-forest)) 100%)',
        'gradient-eco-soft': 'linear-gradient(135deg, hsl(var(--eco-moss)) 0%, hsl(var(--eco-leaf)) 100%)',
        'gradient-eco-earth': 'linear-gradient(135deg, hsl(var(--eco-earth)) 0%, hsl(var(--eco-moss)) 100%)',
        'gradient-eco-sky': 'linear-gradient(135deg, hsl(var(--eco-sky)) 0%, hsl(var(--eco-leaf)) 100%)',
        // Card Gradients with Opacity
        'gradient-eco-card': 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--eco-leaf) / 0.05) 100%)',
        'gradient-eco-card-strong': 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--eco-leaf) / 0.1) 100%)',
        // Multi-color Nature Gradients
        'gradient-nature-triple': 'linear-gradient(135deg, hsl(var(--eco-leaf)) 0%, hsl(var(--eco-forest)) 50%, hsl(var(--eco-moss)) 100%)',
        'gradient-nature-radial': 'radial-gradient(circle at center, hsl(var(--eco-leaf) / 0.1) 0%, transparent 70%)',
        // Radial Gradients with Eco Colors (90% opacity)
        'gradient-radial-eco-leaf': 'radial-gradient(circle at center, hsla(var(--eco-leaf), 0.08) 0%, transparent 50%)',
        'gradient-radial-eco-moss': 'radial-gradient(circle at center, hsla(var(--eco-moss), 0.06) 0%, transparent 50%)',
        'gradient-radial-eco-forest': 'radial-gradient(circle at center, hsla(var(--eco-forest), 0.05) 0%, transparent 50%)',
        // Animated Gradient Background
        'gradient-eco-animated': 'linear-gradient(135deg, hsla(var(--eco-leaf), 0.05) 0%, hsla(var(--eco-forest), 0.03) 25%, hsla(var(--eco-moss), 0.04) 50%, hsla(var(--eco-leaf), 0.02) 75%, hsla(var(--eco-forest), 0.05) 100%)',
        // Combined Multi-layer Background (for PageBackground-like effects)
        'gradient-eco-multilayer': `
          radial-gradient(circle at 20% 50%, hsla(var(--eco-leaf), 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, hsla(var(--eco-moss), 0.06) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, hsla(var(--eco-forest), 0.05) 0%, transparent 50%),
          linear-gradient(135deg, hsla(var(--eco-leaf), 0.02) 0%, hsla(var(--eco-forest), 0.03) 100%)
        `,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
