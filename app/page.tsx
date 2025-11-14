"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Leaf, Trophy, Users, Zap, ArrowRight, CheckCircle2, Rocket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Lazy load the WelcomeInfoModal for better performance
const WelcomeInfoModal = dynamic(() => import('@/components/home/WelcomeInfoModal'), {
  ssr: false,
});

// Import TokenDistribution component
import { TokenDistribution } from '@/components/home/TokenDistribution';

interface Stats {
  users: number;
  completedTasks: number;
  distributedPoints: number;
}

export default function Home() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<Stats>({ users: 0, completedTasks: 0, distributedPoints: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/public');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep stats at 0 if fetch fails - no fake data
        setStats({
          users: 0,
          completedTasks: 0,
          distributedPoints: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Leaf,
      title: t('home.features.tasks.title'),
      description: t('home.features.tasks.description'),
    },
    {
      icon: Trophy,
      title: t('home.features.rewards.title'),
      description: t('home.features.rewards.description'),
    },
    {
      icon: Users,
      title: t('home.features.community.title'),
      description: t('home.features.community.description'),
    },
    {
      icon: Zap,
      title: t('home.features.instant.title'),
      description: t('home.features.instant.description'),
    },
  ];

  const benefits = [
    t('home.benefits.item1'),
    t('home.benefits.item2'),
    t('home.benefits.item3'),
    t('home.benefits.item4'),
  ];
  
  return (
    <>
      <Header />
      <WelcomeInfoModal />
      <main className="min-h-screen relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-32 px-4 bg-gradient-to-br from-eco-leaf/20 via-eco-forest/10 to-eco-moss/20 backdrop-blur-sm">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
              <span className="bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-moss bg-clip-text text-transparent animate-gradient">
                {t('hero.home.title')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-delay drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_1px_4px_rgba(255,255,255,0.1)]">
              {t('hero.home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="neon-glow-green bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-forest hover:to-eco-leaf font-bold text-lg px-8 py-6 group shadow-xl w-full sm:w-auto transition-all duration-300"
                >
                  <Rocket className="h-5 w-5" />
                  {t('hero.home.cta')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="neon-border border-eco-leaf/30 hover:bg-eco-leaf/10 font-semibold text-lg px-8 py-6 w-full sm:w-auto transition-all duration-300"
                >
                  {t('common.signIn')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresRef}
          className="py-16 sm:py-24 px-4 bg-gradient-to-b from-background to-eco-sage/10"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  variant="neon"
                  className={`depth-4k-2 transition-all duration-500 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-eco-leaf via-eco-forest to-eco-moss flex items-center justify-center mb-4 shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-eco-sage/10 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Benefits List */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  {t('home.benefits.title')}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {t('home.benefits.subtitle')}
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-eco-leaf flex-shrink-0 mt-0.5" />
                      <span className="text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Platform Stats */}
              <Card variant="neon" className="depth-4k-2 p-8 backdrop-blur-md bg-gradient-to-br from-card to-eco-leaf/5 h-full flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-moss bg-clip-text text-transparent mb-2">
                      {isLoadingStats ? '...' : `${stats.users.toLocaleString()}+`}
                    </div>
                    <div className="text-muted-foreground">{t('home.stats.usersLabel')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-moss bg-clip-text text-transparent mb-2">
                      {isLoadingStats ? '...' : `${stats.completedTasks.toLocaleString()}+`}
                    </div>
                    <div className="text-muted-foreground">{t('home.stats.tasksLabel')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-moss bg-clip-text text-transparent mb-2">
                      {isLoadingStats ? '...' : `${stats.distributedPoints.toLocaleString()}+`}
                    </div>
                    <div className="text-muted-foreground">{t('home.stats.rewardsLabel')}</div>
                  </div>
                </div>
              </Card>

              {/* Token Distribution */}
              <TokenDistribution />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card 
              variant="neon" 
              className="p-8 sm:p-12 shadow-glow-lg bg-gradient-to-br from-eco-leaf via-eco-forest to-eco-moss opacity-90"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                {t('home.cta.title')}
              </h2>
              <p className="text-lg text-white/90 mb-8">
                {t('home.cta.subtitle')}
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-white text-eco-forest hover:bg-white/90 hover:shadow-glow-lg font-bold text-lg px-8 py-6 group shadow-xl transition-all duration-300 neon-glow-green-strong"
              >
                <Link href="/register" className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  {t('home.cta.button')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
