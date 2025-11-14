'use client';

import { useMotionPreferences } from '@/components/providers/MotionPreferencesProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Accessibility, Zap, ZapOff } from 'lucide-react';

/**
 * Accessibility Settings Component
 * Allows users to control animation and motion preferences
 */
export function AccessibilitySettings() {
  const t = useTranslations('common');
  const { prefersReducedMotion, animationsEnabled, toggleAnimations } = useMotionPreferences();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-eco-leaf" aria-hidden="true" />
          <CardTitle>{t('accessibility.settings') || 'Accessibility Settings'}</CardTitle>
        </div>
        <CardDescription>
          {t('accessibility.settingsDescription') || 'Customize your experience for better accessibility'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Animation Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="animations-toggle" className="text-base font-medium flex items-center gap-2">
              {animationsEnabled ? (
                <Zap className="h-4 w-4 text-eco-leaf" aria-hidden="true" />
              ) : (
                <ZapOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              {t('accessibility.animations') || 'Animations'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {animationsEnabled
                ? t('accessibility.animationsEnabled') || 'Animations and transitions are enabled'
                : t('accessibility.animationsDisabled') || 'Animations and transitions are disabled'}
            </p>
          </div>
          <Switch
            id="animations-toggle"
            checked={animationsEnabled}
            onCheckedChange={toggleAnimations}
            aria-label={t('accessibility.toggleAnimations') || 'Toggle animations'}
          />
        </div>

        {/* System Preference Info */}
        {prefersReducedMotion && (
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">
                {t('accessibility.systemPreference') || 'System Preference:'}
              </span>{' '}
              {t('accessibility.reducedMotionDetected') || 
                'Your system is set to prefer reduced motion. You can override this setting above.'}
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t('accessibility.info') || 
              'Disabling animations will reduce motion effects throughout the application while maintaining functionality.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Accessibility Toggle
 * Smaller version for headers or sidebars
 */
export function AccessibilityToggle() {
  const t = useTranslations('common');
  const { animationsEnabled, toggleAnimations } = useMotionPreferences();

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="animations-toggle-compact" className="text-sm cursor-pointer">
        {animationsEnabled ? (
          <Zap className="h-4 w-4 text-eco-leaf" aria-hidden="true" />
        ) : (
          <ZapOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </Label>
      <Switch
        id="animations-toggle-compact"
        checked={animationsEnabled}
        onCheckedChange={toggleAnimations}
        aria-label={t('accessibility.toggleAnimations') || 'Toggle animations'}
      />
    </div>
  );
}
