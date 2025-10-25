'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';

export default function AssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
    setCurrentLang(lang);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const language = currentLang;

  const handleRefresh = () => {
    setLoading(true);
    // Trigger iframe reload
    const iframe = document.getElementById('ags-assistant-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'ms' ? 'Pembantu AI AGS' : 'AGS AI Assistant'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'ms' 
                    ? 'Analisis laporan makmal anda dengan AI yang canggih' 
                    : 'Analyze your lab reports with advanced AI'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                title={language === 'ms' ? 'Muat Semula' : 'Refresh'}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {language === 'ms' ? 'Muat Semula' : 'Refresh'}
                </span>
              </button>

              <a
                href="https://ags-ai-assistant.streamlit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {language === 'ms' ? 'Buka Tab Baharu' : 'Open in New Tab'}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Assistant Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                {language === 'ms' 
                  ? '💡 Muat naik laporan makmal tanah atau daun anda dalam format PDF untuk mendapatkan analisis dan cadangan AI yang terperinci.'
                  : '💡 Upload your soil or leaf lab reports in PDF format to get detailed AI analysis and recommendations.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded AI Assistant */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">
                {language === 'ms' ? 'Memuatkan Pembantu AI...' : 'Loading AI Assistant...'}
              </p>
            </div>
          </div>
        )}
        
        <iframe
          id="ags-assistant-iframe"
          src="https://ags-ai-assistant.streamlit.app/"
          className="w-full h-full border-0"
          title="AGS AI Assistant"
          onLoad={() => setLoading(false)}
          allow="camera; microphone; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>

      {/* Footer Tips */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">1.</span>
              <p className="text-gray-600">
                {language === 'ms' 
                  ? 'Muat naik fail PDF laporan makmal anda'
                  : 'Upload your lab report PDF file'
                }
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">2.</span>
              <p className="text-gray-600">
                {language === 'ms' 
                  ? 'Tunggu AI menganalisis laporan (30 saat)'
                  : 'Wait for AI to analyze report (30 seconds)'
                }
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">3.</span>
              <p className="text-gray-600">
                {language === 'ms' 
                  ? 'Dapatkan cadangan baja dan tindakan'
                  : 'Get fertilizer recommendations and actions'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

