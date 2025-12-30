/**
 * Browser Compatibility Utilities
 * Provides safe access to browser APIs with fallbacks
 */

// Check if localStorage is available
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Safe localStorage getter
export const safeGetLocalStorage = (key: string, defaultValue: string | null = null): string | null => {
  if (!isLocalStorageAvailable()) return defaultValue;
  
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn(`Failed to read from localStorage: ${key}`, e);
    return defaultValue;
  }
};

// Safe localStorage setter
export const safeSetLocalStorage = (key: string, value: string): boolean => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`Failed to write to localStorage: ${key}`, e);
    return false;
  }
};

// Safe localStorage remover
export const safeRemoveLocalStorage = (key: string): boolean => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`Failed to remove from localStorage: ${key}`, e);
    return false;
  }
};

// Check if sessionStorage is available
export const isSessionStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Safe sessionStorage getter
export const safeGetSessionStorage = (key: string, defaultValue: string | null = null): string | null => {
  if (!isSessionStorageAvailable()) return defaultValue;
  
  try {
    return sessionStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn(`Failed to read from sessionStorage: ${key}`, e);
    return defaultValue;
  }
};

// Safe sessionStorage setter
export const safeSetSessionStorage = (key: string, value: string): boolean => {
  if (!isSessionStorageAvailable()) return false;
  
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`Failed to write to sessionStorage: ${key}`, e);
    return false;
  }
};

// Check if video is supported
export const isVideoSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const video = document.createElement('video');
  return !!(
    video.canPlayType &&
    (video.canPlayType('video/mp4') !== '' || video.canPlayType('video/webm') !== '')
  );
};

// Check if IntersectionObserver is supported (for framer-motion viewport)
export const isIntersectionObserverSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'IntersectionObserver' in window;
};

// Check if CSS animations are supported
export const isCSSAnimationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const style = document.documentElement.style;
  return 'animation' in style || 'webkitAnimation' in style || 'mozAnimation' in style;
};

// Check if the browser supports modern features
export const getBrowserCompatibility = () => {
  return {
    localStorage: isLocalStorageAvailable(),
    sessionStorage: isSessionStorageAvailable(),
    video: isVideoSupported(),
    intersectionObserver: isIntersectionObserverSupported(),
    cssAnimations: isCSSAnimationSupported(),
    // Check for common browser features
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined',
    // Check for required APIs
    hasWindow: typeof window !== 'undefined',
    hasDocument: typeof document !== 'undefined',
  };
};

// Check if device supports touch
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile user agents
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  
  // Also check screen width for responsiveness
  const isSmallScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent.toLowerCase()) || isSmallScreen;
};

// Check if device is iOS
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Check if device is Android
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /android/i.test(navigator.userAgent);
};

// Check if browser is Safari
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Check if browser is Safari on iOS
export const isIOSSafari = (): boolean => {
  return isIOS() && isSafari();
};

// Get safe viewport dimensions (handles mobile quirks)
export const getViewportDimensions = (): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
};

// Check if media queries are supported
export const isMediaQuerySupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.matchMedia !== 'undefined';
};

// Safe matchMedia wrapper
export const safeMatchMedia = (query: string): boolean => {
  if (!isMediaQuerySupported()) return false;
  
  try {
    return window.matchMedia(query).matches;
  } catch (e) {
    console.warn(`Failed to match media query: ${query}`, e);
    return false;
  }
};

// Check if prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return safeMatchMedia('(prefers-reduced-motion: reduce)');
};

// Check if prefers dark mode
export const prefersDarkMode = (): boolean => {
  return safeMatchMedia('(prefers-color-scheme: dark)');
};

// Log browser compatibility (useful for debugging)
export const logBrowserCompatibility = () => {
  if (typeof window === 'undefined') return;
  
  const compat = getBrowserCompatibility();
  const deviceInfo = {
    isMobile: isMobileDevice(),
    isTouch: isTouchDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isSafari: isSafari(),
    viewport: getViewportDimensions(),
    prefersReducedMotion: prefersReducedMotion(),
  };
  
  console.log('Browser Compatibility:', compat);
  console.log('Device Info:', deviceInfo);
  
  // Warn about critical missing features
  if (!compat.localStorage) {
    console.warn('⚠️ localStorage is not available. Some features may not work correctly.');
  }
  if (!compat.video) {
    console.warn('⚠️ Video playback is not supported. Videos may not display.');
  }
  if (!compat.intersectionObserver) {
    console.warn('⚠️ IntersectionObserver is not supported. Animations may not work correctly.');
  }
};

