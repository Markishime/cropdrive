'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { Send, FileText, Loader2, AlertCircle, User, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';

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
  language: 'en' | 'ms';
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
  const [loadingChat, setLoadingChat] = useState(false);
  const isMountedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load reports
  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

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
      {/* Report Selector */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <button
          onClick={() => setShowReports(!showReports)}
          className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 transition"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
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
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingChat ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  {message.metadata?.escalated && (
                    <div className="mt-2 flex items-center gap-1 text-xs opacity-75">
                      <AlertCircle className="w-3 h-3" />
                      {language === 'ms'
                        ? 'Ditandakan untuk susulan'
                        : 'Flagged for follow-up'}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
