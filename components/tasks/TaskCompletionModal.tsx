"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, Leaf, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  pointsEarned: number;
}

export function TaskCompletionModal({
  isOpen,
  onClose,
  taskTitle,
  pointsEarned,
}: TaskCompletionModalProps) {
  const t = useTranslations("tasks");
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 9999,
        colors: ['#10b981', '#14b8a6', '#22c55e', '#84cc16', '#a3e635']
      };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Shoot confetti from two sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950 border-2 border-eco-leaf">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className={`
              relative w-20 h-20 rounded-full 
              bg-gradient-to-br from-emerald-500 to-teal-500 
              flex items-center justify-center
              shadow-2xl shadow-emerald-500/50
              ${showAnimation ? 'animate-in zoom-in-50 spin-in-180 duration-700' : ''}
            `}>
              <CheckCircle className="w-10 h-10 text-white" />
              
              {/* Floating leaves animation */}
              <div className="absolute -top-2 -left-2 animate-float">
                <Leaf className="w-6 h-6 text-eco-leaf opacity-80" />
              </div>
              <div className="absolute -bottom-2 -right-2 animate-float-delayed">
                <Leaf className="w-5 h-5 text-eco-forest opacity-70" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-center text-2xl font-bold text-gradient-eco">
            {t("completion.success")}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t("completion.taskCompleted", { task: taskTitle })}
          </DialogDescription>
        </DialogHeader>

        {/* Points Display */}
        <div className={`
          my-6 p-6 rounded-xl 
          bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40
          border-2 border-emerald-300 dark:border-emerald-700
          ${showAnimation ? 'animate-in slide-in-from-bottom-4 fade-in-50 duration-500 delay-300' : ''}
        `}>
          <div className="flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <div className="text-center">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                {t("completion.pointsEarned")}
              </p>
              <p className="text-4xl font-bold text-gradient-eco flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                {pointsEarned}
                <Sparkles className="w-6 h-6" />
              </p>
            </div>
          </div>
        </div>

        {/* Nature metaphor message */}
        <div className={`
          text-center text-sm text-muted-foreground italic mb-4
          ${showAnimation ? 'animate-in fade-in-50 duration-500 delay-500' : ''}
        `}>
          <Leaf className="w-4 h-4 inline-block mr-1 text-eco-leaf" />
          {t("completion.growthMessage")}
          <Leaf className="w-4 h-4 inline-block ml-1 text-eco-leaf" />
        </div>

        {/* Action Button */}
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
        >
          {t("completion.continue")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
