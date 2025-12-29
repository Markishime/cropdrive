/**
 * Test Utility for AI Assistant Integration
 * 
 * This file provides utilities to test the AI Assistant integration
 * from the browser console. Use this to verify messages are being
 * sent and received correctly.
 */

/**
 * Simulate an ANALYSIS_COMPLETE message from the AI Assistant
 * This can be called from the browser console to test the integration
 */
export function simulateAnalysisComplete(data?: Partial<{
  title: string;
  analysisType: 'soil' | 'leaf';
  summary: string;
  recommendationsCount: number;
  fileUrl: string | null;
  analysisData: any;
}>) {
  const defaultData = {
    type: 'ANALYSIS_COMPLETE',
    title: `Test Analysis Report - ${new Date().toLocaleDateString()}`,
    analysisType: 'soil' as const,
    summary: 'This is a test analysis summary. The integration is working correctly.',
    recommendationsCount: 5,
    fileUrl: null,
    analysisData: {
      ph: 6.5,
      nitrogen: 2.3,
      phosphorus: 1.8,
      potassium: 2.1,
    },
  };

  const message = { ...defaultData, ...data };

  console.log('🧪 Simulating ANALYSIS_COMPLETE message:', message);

  // Dispatch as if it came from the iframe
  window.postMessage(message, '*');

  // Also try sending directly to parent (if we're in an iframe)
  if (window.parent !== window) {
    window.parent.postMessage(message, '*');
  }

  return message;
}

/**
 * Listen for all messages and log them
 * Useful for debugging what messages are being received
 */
export function startMessageListener() {
  const listener = (event: MessageEvent) => {
    console.log('📨 Message received:', {
      origin: event.origin,
      type: event.data?.type,
      data: event.data,
      timestamp: new Date().toISOString(),
    });
  };

  window.addEventListener('message', listener);
  console.log('✅ Message listener started. All messages will be logged to console.');

  return () => {
    window.removeEventListener('message', listener);
    console.log('❌ Message listener stopped.');
  };
}

/**
 * Check if the current page is ready to receive messages
 */
export function checkIntegrationStatus() {
  const status = {
    isInIframe: window.parent !== window,
    hasMessageListener: true, // We can't directly check, but assume it's set up
    currentOrigin: window.location.origin,
    parentOrigin: window.parent !== window ? window.parent.location.origin : 'N/A (not in iframe)',
    timestamp: new Date().toISOString(),
  };

  console.log('📊 Integration Status:', status);
  return status;
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).testAIIntegration = {
    simulateAnalysisComplete,
    startMessageListener,
    checkIntegrationStatus,
  };
  
  console.log('🧪 AI Integration test utilities loaded!');
  console.log('   Use window.testAIIntegration.simulateAnalysisComplete() to test');
  console.log('   Use window.testAIIntegration.startMessageListener() to debug messages');
  console.log('   Use window.testAIIntegration.checkIntegrationStatus() to check status');
}

