/**
 * Browser Detection and Compatibility Utilities
 * Detects browser capabilities and provides fallbacks for unsupported features
 */

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  os: string;
  isMobile: boolean;
  isTablet: boolean;
}

export interface BrowserCapabilities {
  webp: boolean;
  avif: boolean;
  backdropFilter: boolean;
  cssGrid: boolean;
  flexbox: boolean;
  customProperties: boolean;
  intersectionObserver: boolean;
  serviceWorker: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  touchEvents: boolean;
}

/**
 * Detect browser information from user agent
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      version: '0',
      engine: 'unknown',
      os: 'unknown',
      isMobile: false,
      isTablet: false,
    };
  }

  const ua = window.navigator.userAgent;
  const info: BrowserInfo = {
    name: 'unknown',
    version: '0',
    engine: 'unknown',
    os: 'unknown',
    isMobile: false,
    isTablet: false,
  };

  // Detect OS
  if (/Windows/.test(ua)) info.os = 'Windows';
  else if (/Mac OS X/.test(ua)) info.os = 'macOS';
  else if (/Linux/.test(ua)) info.os = 'Linux';
  else if (/Android/.test(ua)) info.os = 'Android';
  else if (/iOS|iPhone|iPad|iPod/.test(ua)) info.os = 'iOS';

  // Detect mobile/tablet
  info.isMobile = /Mobile|Android|iPhone|iPod/.test(ua);
  info.isTablet = /iPad|Android(?!.*Mobile)/.test(ua);

  // Detect browser
  if (/Edg\//.test(ua)) {
    info.name = 'Edge';
    info.engine = 'Blink';
    const match = ua.match(/Edg\/(\d+)/);
    info.version = match ? match[1] : '0';
  } else if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
    info.name = 'Chrome';
    info.engine = 'Blink';
    const match = ua.match(/Chrome\/(\d+)/);
    info.version = match ? match[1] : '0';
  } else if (/Firefox/.test(ua)) {
    info.name = 'Firefox';
    info.engine = 'Gecko';
    const match = ua.match(/Firefox\/(\d+)/);
    info.version = match ? match[1] : '0';
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    info.name = 'Safari';
    info.engine = 'WebKit';
    const match = ua.match(/Version\/(\d+)/);
    info.version = match ? match[1] : '0';
  }

  return info;
}

/**
 * Check browser capabilities
 */
export function checkBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === 'undefined') {
    return {
      webp: false,
      avif: false,
      backdropFilter: false,
      cssGrid: false,
      flexbox: false,
      customProperties: false,
      intersectionObserver: false,
      serviceWorker: false,
      localStorage: false,
      sessionStorage: false,
      touchEvents: false,
    };
  }

  return {
    webp: checkWebPSupport(),
    avif: checkAVIFSupport(),
    backdropFilter: checkBackdropFilterSupport(),
    cssGrid: checkCSSGridSupport(),
    flexbox: checkFlexboxSupport(),
    customProperties: checkCustomPropertiesSupport(),
    intersectionObserver: 'IntersectionObserver' in window,
    serviceWorker: 'serviceWorker' in navigator,
    localStorage: checkLocalStorageSupport(),
    sessionStorage: checkSessionStorageSupport(),
    touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}

/**
 * Check WebP support
 */
function checkWebPSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Check AVIF support (async check, returns promise)
 */
function checkAVIFSupport(): boolean {
  // Synchronous check - actual support needs async test
  // This is a simplified version
  return CSS.supports('image-rendering', 'crisp-edges');
}

/**
 * Check backdrop-filter support
 */
function checkBackdropFilterSupport(): boolean {
  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
}

/**
 * Check CSS Grid support
 */
function checkCSSGridSupport(): boolean {
  return CSS.supports('display', 'grid');
}

/**
 * Check Flexbox support
 */
function checkFlexboxSupport(): boolean {
  return CSS.supports('display', 'flex');
}

/**
 * Check CSS Custom Properties support
 */
function checkCustomPropertiesSupport(): boolean {
  return CSS.supports('--test', '0');
}

/**
 * Check localStorage support
 */
function checkLocalStorageSupport(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check sessionStorage support
 */
function checkSessionStorageSupport(): boolean {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  const capabilities = checkBrowserCapabilities();
  
  if (capabilities.avif) return 'avif';
  if (capabilities.webp) return 'webp';
  return 'jpeg';
}

/**
 * Check if browser needs polyfills
 */
export function needsPolyfills(): {
  intersectionObserver: boolean;
  customProperties: boolean;
} {
  const capabilities = checkBrowserCapabilities();
  
  return {
    intersectionObserver: !capabilities.intersectionObserver,
    customProperties: !capabilities.customProperties,
  };
}

/**
 * Get browser-specific CSS class for body element
 */
export function getBrowserClass(): string {
  const browser = detectBrowser();
  const classes: string[] = [];
  
  classes.push(`browser-${browser.name.toLowerCase()}`);
  classes.push(`engine-${browser.engine.toLowerCase()}`);
  classes.push(`os-${browser.os.toLowerCase()}`);
  
  if (browser.isMobile) classes.push('is-mobile');
  if (browser.isTablet) classes.push('is-tablet');
  
  const capabilities = checkBrowserCapabilities();
  if (!capabilities.backdropFilter) classes.push('no-backdrop-filter');
  if (!capabilities.webp) classes.push('no-webp');
  if (!capabilities.avif) classes.push('no-avif');
  
  return classes.join(' ');
}

/**
 * Log browser information to console (development only)
 */
export function logBrowserInfo(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const browser = detectBrowser();
  const capabilities = checkBrowserCapabilities();
  
  console.group('🌐 Browser Information');
  console.log('Browser:', browser.name, browser.version);
  console.log('Engine:', browser.engine);
  console.log('OS:', browser.os);
  console.log('Mobile:', browser.isMobile);
  console.log('Tablet:', browser.isTablet);
  console.groupEnd();
  
  console.group('✨ Browser Capabilities');
  console.log('WebP:', capabilities.webp ? '✅' : '❌');
  console.log('AVIF:', capabilities.avif ? '✅' : '❌');
  console.log('Backdrop Filter:', capabilities.backdropFilter ? '✅' : '❌');
  console.log('CSS Grid:', capabilities.cssGrid ? '✅' : '❌');
  console.log('Flexbox:', capabilities.flexbox ? '✅' : '❌');
  console.log('Custom Properties:', capabilities.customProperties ? '✅' : '❌');
  console.log('IntersectionObserver:', capabilities.intersectionObserver ? '✅' : '❌');
  console.log('Service Worker:', capabilities.serviceWorker ? '✅' : '❌');
  console.log('LocalStorage:', capabilities.localStorage ? '✅' : '❌');
  console.log('SessionStorage:', capabilities.sessionStorage ? '✅' : '❌');
  console.log('Touch Events:', capabilities.touchEvents ? '✅' : '❌');
  console.groupEnd();
}

/**
 * Apply browser-specific fixes
 */
export function applyBrowserFixes(): void {
  if (typeof window === 'undefined') return;
  
  const browser = detectBrowser();
  const capabilities = checkBrowserCapabilities();
  
  // Add browser classes to body
  document.body.className += ` ${getBrowserClass()}`;
  
  // Safari-specific fixes
  if (browser.name === 'Safari') {
    // Fix 100vh issue on mobile Safari
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
  }
  
  // Backdrop filter fallback
  if (!capabilities.backdropFilter) {
    document.documentElement.style.setProperty('--backdrop-blur', 'none');
    document.documentElement.style.setProperty('--backdrop-opacity', '0.95');
  }
  
  // Touch event optimization
  if (capabilities.touchEvents) {
    document.body.classList.add('touch-device');
  }
}

/**
 * Check if browser is supported
 */
export function isBrowserSupported(): {
  supported: boolean;
  reason?: string;
} {
  const browser = detectBrowser();
  const capabilities = checkBrowserCapabilities();
  
  // Check for IE11
  if (browser.name === 'unknown' && /Trident/.test(navigator.userAgent)) {
    return {
      supported: false,
      reason: 'Internet Explorer is not supported. Please use a modern browser like Chrome, Firefox, Safari, or Edge.',
    };
  }
  
  // Check for essential features
  if (!capabilities.flexbox || !capabilities.customProperties) {
    return {
      supported: false,
      reason: 'Your browser does not support essential CSS features. Please update to the latest version.',
    };
  }
  
  if (!capabilities.localStorage) {
    return {
      supported: false,
      reason: 'Your browser does not support localStorage. Please enable cookies and storage.',
    };
  }
  
  return { supported: true };
}
