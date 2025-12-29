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

// Log browser compatibility (useful for debugging)
export const logBrowserCompatibility = () => {
  if (typeof window === 'undefined') return;
  
  const compat = getBrowserCompatibility();
  console.log('Browser Compatibility:', compat);
  
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

