'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faFileAlt,
  faSpinner,
  faCircleExclamation,
  faUser,
  faChevronDown,
  faChevronUp,
  faGear,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import Button from './ui/Button';
import Image from 'next/image';
import toast from 'react-hot-toast';
import type { Language } from '@/i18n';

const CONVERSATION_STYLES = [
  {
    id: 'diagnostic_interview',
    label: 'Diagnostic Interview',
    labelMs: 'Temu Bual Diagnostik',
    description: 'Asks questions first, then gives checklists',
    descriptionMs: 'Bertanya soalan dahulu, kemudian memberikan senarai semak',
  },
  {
    id: 'checklist_only',
    label: 'Checklist Only',
    labelMs: 'Senarai Semak Sahaja',
    description: 'Direct checklist output',
    descriptionMs: 'Output senarai semak langsung',
  },
  {
    id: 'short_direct',
    label: 'Short Direct',
    labelMs: 'Ringkas & Langsung',
    description: 'Brief 2-3 sentence answers',
    descriptionMs: 'Jawapan ringkas 2-3 ayat',
  },
];

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  metadata?: {
    reportId?: string;
    sectionId?: string;
    knowledgeBaseRefs?: string[];
    escalated?: boolean;
  };
}

interface Report {
  id: string;
  title: string;
  type: 'soil' | 'leaf' | 'other';
  uploadedAt: Date;
}

interface PalmiraChatProps {
  chatId?: string;
  reportId?: string;
  language: Language;
  onReportSelect?: (reportId: string) => void;
}

export default function PalmiraChat({
  chatId: initialChatId,
  reportId: initialReportId,
  language,
  onReportSelect,
}: PalmiraChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [activeReportId, setActiveReportId] = useState<string | null>(initialReportId || null);
  const [reports, setReports] = useState<Report[]>([]);
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationStyle, setConversationStyle] = useState<string>('short_direct');
  const [loadingChat, setLoadingChat] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const isMountedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load reports and settings
  useEffect(() => {
    if (user) {
      loadReports();
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data?.conversationStyle) {
        if (isMountedRef.current) {
          setConversationStyle(result.data.conversationStyle);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newStyle: string) => {
    setSavingSettings(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationStyle: newStyle,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setConversationStyle(newStyle);
        toast.success(
          language === 'ms'
            ? 'Tetapan disimpan'
            : 'Settings saved'
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(
        language === 'ms'
          ? 'Ralat menyimpan tetapan'
          : 'Error saving settings'
      );
    } finally {
      setSavingSettings(false);
    }
  };

  // Load chat if chatId is provided
  useEffect(() => {
    if (chatId && user) {
      loadChat(chatId);
    }
  }, [chatId, user]);

  const loadReports = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/reports', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        if (!isMountedRef.current) return;
        setReports(result.data || []);
        // Set most recent report as default if no report selected
        if (!activeReportId && result.data && result.data.length > 0) {
          setActiveReportId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadChat = async (id: string) => {
    if (isMountedRef.current) setLoadingChat(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/palmira/chats/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        if (!isMountedRef.current) return;
        setMessages(result.data.messages || []);
        setActiveReportId(result.data.activeReportId || null);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error(
        language === 'ms'
          ? 'Ralat memuatkan perbualan'
          : 'Error loading chat'
      );
    } finally {
      if (isMountedRef.current) setLoadingChat(false);
    }
  };

  const createNewChat = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'New Chat',
          reportId: activeReportId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setChatId(result.data.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          // Let the API create a chat when chatId is undefined (faster: avoids extra round-trip).
          chatId: chatId || undefined,
          reportId: activeReportId || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Update chatId if it was a new chat
      if (!chatId && result.data.chatId) {
        setChatId(result.data.chatId);
      }

      const assistantMessage: Message = {
        id: result.data.messageId,
        role: 'assistant',
        content: result.data.message,
        createdAt: new Date(),
        metadata: result.data.metadata,
      };

      setMessages(prev => {
        // Replace temp message with real one
        const filtered = prev.filter(m => m.id !== userMessage.id);
        return [...filtered, userMessage, assistantMessage];
      });

      // Show escalation notice if needed
      if (result.data.metadata?.escalated) {
        toast.success(
          language === 'ms'
            ? 'Perbualan anda telah ditandakan untuk susulan manusia'
            : 'Your conversation has been flagged for human follow-up'
        );
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(
        language === 'ms'
          ? 'Ralat menghantar mesej. Sila cuba lagi.'
          : 'Error sending message. Please try again.'
      );
      
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Report Selector and Settings */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReports(!showReports)}
            className="flex-1 flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 transition"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {activeReportId
                  ? reports.find(r => r.id === activeReportId)?.title ||
                    (language === 'ms' ? 'Laporan Dipilih' : 'Report Selected')
                  : language === 'ms'
                  ? 'Pilih Laporan'
                  : 'Select Report'}
              </span>
            </div>
            {showReports ? (
              <FontAwesomeIcon icon={faChevronUp} className="w-4 h-4 text-gray-600" />
            ) : (
              <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-lg border transition ${
              showSettings
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 hover:border-green-500 text-gray-600'
            }`}
            title={language === 'ms' ? 'Tetapan' : 'Settings'}
          >
            <FontAwesomeIcon icon={faGear} className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showReports && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 max-h-60 overflow-y-auto"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-2 space-y-1">
                {reports.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    {language === 'ms'
                      ? 'Tiada laporan tersedia'
                      : 'No reports available'}
                  </div>
                ) : (
                  reports.map(report => (
                    <button
                      key={report.id}
                      onClick={() => {
                        setActiveReportId(report.id);
                        setShowReports(false);
                        onReportSelect?.(report.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        activeReportId === report.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{report.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(report.uploadedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {language === 'ms' ? 'Gaya Jawapan' : 'Response Style'}
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={language === 'ms' ? 'Tutup' : 'Close'}
                    aria-label={language === 'ms' ? 'Tutup tetapan' : 'Close settings'}
                  >
                    <FontAwesomeIcon icon={faXmark} className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {CONVERSATION_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => saveSettings(style.id)}
                      disabled={savingSettings}
                      className={`w-full text-left p-3 rounded-lg transition border ${
                        conversationStyle === style.id
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      } ${savingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-medium text-sm">
                        {language === 'ms' ? style.labelMs : style.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {language === 'ms' ? style.descriptionMs : style.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingChat ? (
          <div className="flex items-center justify-center h-full">
            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin text-green-600" spin />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="/images/Palmira.png"
                  alt="Palmira"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-lg font-medium">
                {language === 'ms'
                  ? 'Selamat datang ke Palmira!'
                  : 'Welcome to Palmira!'}
              </p>
              <p className="text-sm mt-2">
                {language === 'ms'
                  ? 'Mula perbualan dengan menaip mesej di bawah'
                  : 'Start a conversation by typing a message below'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/Palmira.png"
                      alt="Palmira"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'glass-bubble-user text-white'
                      : 'glass-bubble-ai text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  {message.metadata?.escalated && (
                    <div className="mt-2 flex items-center gap-1 text-xs opacity-75">
                      <FontAwesomeIcon icon={faCircleExclamation} className="w-3 h-3" />
                      {language === 'ms'
                        ? 'Ditandakan untuk susulan'
                        : 'Flagged for follow-up'}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/Palmira.png"
                    alt="Palmira"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="ai-thinking-dot"></div>
                    <div className="ai-thinking-dot"></div>
                    <div className="ai-thinking-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              language === 'ms'
                ? 'Taip mesej anda di sini...'
                : 'Type your message here...'
            }
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={1}
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-green-600 hover:bg-green-700 px-6"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" spin />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
