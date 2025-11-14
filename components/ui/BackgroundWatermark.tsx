"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

const HERO_IMAGES = [
  '/assets/images/heroes/syla.jpg',
  '/assets/images/heroes/sylbo.jpg',
  '/assets/images/heroes/sylens.jpg',
  '/assets/images/heroes/sylervus.jpg',
  '/assets/images/heroes/sylmica.jpg',
  '/assets/images/heroes/sylor.jpg',
  '/assets/images/heroes/sylphinus.jpg',
  '/assets/images/heroes/sylpis.jpg',
  '/assets/images/heroes/sylsto.jpg',
  '/assets/images/heroes/syltrox.jpg',
  '/assets/images/heroes/sylurs.jpg',
  '/assets/images/heroes/sylves.jpg',
  '/assets/images/heroes/sylvus.jpg',
];

// Session-based random image selection
const getSessionImage = (): string => {
  if (typeof window === 'undefined') return HERO_IMAGES[0];
  
  // Check if we already have a session image
  let sessionImage = sessionStorage.getItem('hero-watermark');
  
  if (!sessionImage) {
    // Select random image for this session
    const randomIndex = Math.floor(Math.random() * HERO_IMAGES.length);
    sessionImage = HERO_IMAGES[randomIndex];
    sessionStorage.setItem('hero-watermark', sessionImage);
  }
  
  return sessionImage;
};

export function BackgroundWatermark() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set the session image on mount
    setHeroImage(getSessionImage());
  }, []);

  if (!heroImage) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`relative w-[600px] h-[600px] transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={heroImage}
            alt="Hero Watermark"
            fill
            className="object-contain select-none"
            style={{
              opacity: 0.03,
              filter: 'grayscale(100%)',
              mixBlendMode: 'multiply',
            }}
            priority={false}
            quality={50}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
