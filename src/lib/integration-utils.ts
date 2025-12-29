/**
 * Integration Utilities for AI Assistant & Website Communication
 * 
 * This module provides utilities for debugging and testing the integration
 * between the AI Assistant (iframe) and the CropDrive website.
 */

/**
 * Debug helper to log all messages received from iframe
 */
export function setupMessageDebugger() {
  if (typeof window === 'undefined') return;

  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(
    type: string,
    listener: EventListener | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'message') {
      const wrappedListener = (event: Event) => {
        const messageEvent = event as MessageEvent;
        console.log('🔍 [Integration Debug] Message received:', {
          origin: messageEvent.origin,
          data: messageEvent.data,
          type: messageEvent.data?.type,
          timestamp: new Date().toISOString(),
        });
        
        if (typeof listener === 'function') {
          listener(event);
        } else if (listener && 'handleEvent' in listener) {
          listener.handleEvent(event);
        }
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
}

/**
 * Test function to simulate ANALYSIS_COMPLETE message
 * Useful for testing the integration without the AI Assistant
 */
export function simulateAnalysisComplete(data?: Partial<{
  title: string;
  analysisType: 'soil' | 'leaf';
  summary: string;
  recommendationsCount: number;
  fileUrl: string | null;
  analysisData: any;
}>) {
  const testData = {
    type: 'ANALYSIS_COMPLETE',
    title: data?.title || `Test Analysis Report - ${new Date().toLocaleDateString()}`,
    analysisType: data?.analysisType || 'soil',
    summary: data?.summary || 'This is a test analysis summary for integration testing.',
    recommendationsCount: data?.recommendationsCount || 5,
    fileUrl: data?.fileUrl || null,
    analysisData: data?.analysisData || {
      ph: 6.5,
      nitrogen: 2.3,
      phosphorus: 1.8,
      potassium: 2.1,
    },
  };

  console.log('🧪 [Integration Test] Simulating ANALYSIS_COMPLETE message:', testData);
  
  // Dispatch as if it came from iframe
  window.dispatchEvent(new MessageEvent('message', {
    data: testData,
    origin: window.location.origin,
  }));

  return testData;
}

/**
 * Check if integration is working properly
 */
export async function checkIntegrationHealth(): Promise<{
  messageListener: boolean;
  apiEndpoint: boolean;
  firestore: boolean;
  eventSystem: boolean;
}> {
  const health = {
    messageListener: false,
    apiEndpoint: false,
    firestore: false,
    eventSystem: false,
  };

  // Check message listener
  try {
    const testEvent = new MessageEvent('message', {
      data: { type: 'TEST' },
      origin: window.location.origin,
    });
    window.dispatchEvent(testEvent);
    health.messageListener = true;
  } catch (e) {
    console.error('Message listener check failed:', e);
  }

  // Check API endpoint
  try {
    const response = await fetch('/api/save-analysis-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    });
    // Even if it fails with 401/403, the endpoint exists
    health.apiEndpoint = response.status !== 404;
  } catch (e) {
    console.error('API endpoint check failed:', e);
  }

  // Check Firestore (if available)
  try {
    const { db } = await import('@/lib/firebase');
    health.firestore = !!db;
  } catch (e) {
    console.error('Firestore check failed:', e);
  }

  // Check event system
  try {
    let eventReceived = false;
    const handler = () => { eventReceived = true; };
    window.addEventListener('analysisReportSaved', handler);
    window.dispatchEvent(new CustomEvent('analysisReportSaved', { detail: {} }));
    setTimeout(() => {
      window.removeEventListener('analysisReportSaved', handler);
      health.eventSystem = eventReceived;
    }, 100);
  } catch (e) {
    console.error('Event system check failed:', e);
  }

  return health;
}

/**
 * Get integration status for debugging
 */
export function getIntegrationStatus() {
  return {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    hasWindow: typeof window !== 'undefined',
    hasDocument: typeof document !== 'undefined',
  };
}

