'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, Trophy, CheckCircle2, Loader2 } from 'lucide-react';

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    username: string;
    totalPoints: number;
    createdAt: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300">
      <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-eco-forest to-eco-leaf bg-clip-text text-transparent">
          {t('accountInfo.title')}
        </CardTitle>
        <CardDescription className="text-eco-forest/70">
          {t('accountInfo.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2 text-eco-forest font-medium">
            <User className="w-4 h-4 text-eco-leaf" />
            {t('accountInfo.username')}
          </Label>
          <Input
            id="username"
            value={user.username}
            disabled
            className="bg-eco-leaf/5 border-eco-leaf/20 text-eco-forest cursor-not-allowed"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-eco-forest font-medium">
            <Mail className="w-4 h-4 text-eco-leaf" />
            {t('accountInfo.email')}
          </Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-eco-leaf/5 border-eco-leaf/20 text-eco-forest cursor-not-allowed"
          />
        </div>

        {/* Member Since */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-eco-forest font-medium">
            <Calendar className="w-4 h-4 text-eco-leaf" />
            {t('accountInfo.memberSince')}
          </Label>
          <div className="px-4 py-3 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-lg border border-eco-leaf/20">
            <p className="text-eco-forest font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>

        {/* Total Points */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-eco-forest font-medium">
            <Trophy className="w-4 h-4 text-eco-leaf" />
            {t('accountInfo.totalPoints')}
          </Label>
          <div className="px-4 py-3 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-lg border border-eco-leaf/20">
            <p className="text-2xl font-bold bg-gradient-to-r from-eco-forest to-eco-leaf bg-clip-text text-transparent">
              {user.totalPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Save Button with Animation */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90 text-white shadow-eco hover:shadow-eco-lg transition-all duration-300 hover:scale-[1.02]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : showSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </span>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-4 bg-eco-leaf/10 border border-eco-leaf/30 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-eco-forest">
              <CheckCircle2 className="w-5 h-5 text-eco-leaf" />
              <p className="font-medium">Profile updated successfully!</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
