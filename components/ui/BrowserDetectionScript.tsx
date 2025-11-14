/**
 * Browser Detection Script
 * Runs early to detect browser and apply fixes before page renders
 */
export function BrowserDetectionScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Detect Safari and fix 100vh issue
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (isSafari) {
              function setVH() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
              }
              setVH();
              window.addEventListener('resize', setVH);
              window.addEventListener('orientationchange', setVH);
            }
            
            // Detect touch device
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isTouch) {
              document.documentElement.classList.add('touch-device');
            }
            
            // Detect backdrop-filter support
            const supportsBackdrop = CSS.supports('backdrop-filter', 'blur(10px)') || 
                                    CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
            if (!supportsBackdrop) {
              document.documentElement.classList.add('no-backdrop-filter');
              document.documentElement.style.setProperty('--backdrop-blur', 'none');
              document.documentElement.style.setProperty('--backdrop-opacity', '0.95');
            }
            
            // Detect browser
            const ua = navigator.userAgent;
            let browserClass = '';
            if (/Edg\\//.test(ua)) browserClass = 'browser-edge';
            else if (/Chrome/.test(ua) && !/Edg/.test(ua)) browserClass = 'browser-chrome';
            else if (/Firefox/.test(ua)) browserClass = 'browser-firefox';
            else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browserClass = 'browser-safari';
            
            if (browserClass) {
              document.documentElement.classList.add(browserClass);
            }
            
            // Detect mobile
            if (/Mobile|Android|iPhone|iPod/.test(ua)) {
              document.documentElement.classList.add('is-mobile');
            }
            if (/iPad|Android(?!.*Mobile)/.test(ua)) {
              document.documentElement.classList.add('is-tablet');
            }
          })();
        `,
      }}
    />
  );
}
