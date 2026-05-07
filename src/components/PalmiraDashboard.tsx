'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMessage,
  faPlus,
  faHome,
  faCog,
  faSearch,
  faMapMarkerAlt,
  faFileAlt,
  faDownload,
  faExclamationTriangle,
  faUser,
  faRobot,
  faPaperPlane,
  faPaperclip,
  faTimes,
  faCopy,
  faThumbsUp,
  faThumbsDown,
  faRedo,
  faChevronDown,
  faTrash,
  faBook,
  faSeedling,
  faChevronLeft,
  faChevronRight,
  faBars,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import type { Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';

function stripMarkdownHeadingsOutsideCodeBlocks(text: string): string {
  if (!text) return text;
  const parts = text.split(/```[\s\S]*?```/g);
  const fences = text.match(/```[\s\S]*?```/g) || [];
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    out.push(parts[i].replace(/^#{1,6}\s+/gm, ''));
    if (i < fences.length) out.push(fences[i]);
  }
  return out.join('');
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  pdfFileName?: string | null;
  metadata?: {
    reportId?: string;
    sectionId?: string;
    knowledgeBaseRefs?: string[];
    escalated?: boolean;
  };
}

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  createdAt: Date;
}

interface Report {
  id: string;
  title: string;
  type: 'soil' | 'leaf' | 'other';
  uploadedAt: Date;
}

interface Farm {
  id: string;
  name: string;
  location?: string;
}

const CONVERSATION_STYLES = [
  { id: 'short_direct', labelEn: 'Short', labelMs: 'Ringkas', descEn: 'Brief answers', descMs: 'Jawapan ringkas' },
  { id: 'checklist_only', labelEn: 'Checklist only', labelMs: 'Senarai semak sahaja', descEn: 'Structured checklist', descMs: 'Senarai semak berstruktur' },
  { id: 'diagnostic_interview', labelEn: 'Diagnostic', labelMs: 'Diagnostik', descEn: 'Questions then checklist', descMs: 'Soalan kemudian senarai semak' },
] as const;

interface PalmiraDashboardProps {
  language: Language;
}

export default function PalmiraDashboard({ language }: PalmiraDashboardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [showHomepage, setShowHomepage] = useState(true);
  const [canAccessAI, setCanAccessAI] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFarmDropdown, setShowFarmDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [showFarmProfile, setShowFarmProfile] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canPerformAnalysis, setCanPerformAnalysis] = useState(true);
  const [hasReachedUploadLimit, setHasReachedUploadLimit] = useState(false);
  const [uploadsUsedThisMonth, setUploadsUsedThisMonth] = useState(0);
  const [uploadLimit, setUploadLimit] = useState(2);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [farmProfileLoading, setFarmProfileLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [extractingPDF, setExtractingPDF] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [pdfUploadId, setPdfUploadId] = useState<string | null>(null);
  const [pdfExtractionInfo, setPdfExtractionInfo] = useState<{
    method: string;
    pages: number;
    charCount: number;
  } | null>(null);
  const [conversationStyle, setConversationStyle] = useState<string>('short_direct');
  const [savingConversationStyle, setSavingConversationStyle] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice input using Web Speech API
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(language === 'id' ? 'Browser tidak mendukung input suara' : language === 'ms' ? 'Pelayar tidak menyokong input suara' : 'Browser does not support voice input');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'id' ? 'id-ID' : language === 'ms' ? 'ms-MY' : 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(prev => prev + transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Load chats, reports, farms, and Palmira conversation style
  useEffect(() => {
    if (user) {
      loadChats();
      loadReports();
      loadFarms();
      loadPalmiraSettings();
      checkAIAccess();
      checkAdminStatus();
    }
  }, [user]);

  const loadPalmiraSettings = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/palmira/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data?.conversationStyle) {
        setConversationStyle(result.data.conversationStyle);
      }
    } catch (e) {
      console.error('Error loading Palmira settings:', e);
    }
  };

  const saveConversationStyle = async (styleId: string, assistantMessageId?: string) => {
    if (savingConversationStyle || styleId === conversationStyle) return;
    setSavingConversationStyle(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/palmira/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationStyle: styleId }),
      });
      const result = await res.json();
      if (result.success) {
        setConversationStyle(styleId);
        setOnboardingData((prev: any) => (prev ? { ...prev, conversationStyle: styleId } : prev));
        setSavingConversationStyle(false);
        if (assistantMessageId) {
          toast.success(
            language === 'id' ? toIndonesianText('Menjana semula respons dengan gaya baru…') : language === 'ms' ? 'Menjana semula respons dengan gaya baru…' : 'Regenerating response with new style…'
          );
          handleRegenerate(assistantMessageId);
        } else {
          toast.success(
            language === 'id' ? toIndonesianText('Gaya jawapan dikemas kini') : language === 'ms' ? 'Gaya jawapan dikemas kini' : 'Answer style updated'
          );
        }
      } else throw new Error(result.error);
    } catch (err: any) {
      console.error('Error saving conversation style:', err);
      toast.error(
        language === 'id' ? toIndonesianText('Ralat menyimpan gaya') : language === 'ms' ? 'Ralat menyimpan gaya' : 'Error saving style'
      );
    } finally {
      setSavingConversationStyle(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch('/api/admin/check', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setIsAdmin(result.isAdmin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadFarmProfile = async () => {
    try {
      setFarmProfileLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch('/api/palmira/onboarding', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setOnboardingData(result.data);
        setShowFarmProfile(true);
      }
    } catch (error) {
      console.error('Error loading farm profile:', error);
      toast.error(language === 'id' ? toIndonesianText('Ralat memuatkan profil ladang') : language === 'ms' ? 'Ralat memuatkan profil ladang' : 'Error loading farm profile');
    } finally {
      setFarmProfileLoading(false);
    }
  };

  const checkAIAccess = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setCanAccessAI(false);
        setCanPerformAnalysis(false);
        return;
      }

      // All features are free - grant access to all logged-in users
      setCanAccessAI(true);
      setCanPerformAnalysis(true);
      setHasReachedUploadLimit(false);
    } catch (error) {
      console.error('Error checking AI access:', error);
      // Default to allowing access since all features are free
      setCanAccessAI(true);
      setCanPerformAnalysis(true);
    }
  };

  // Load current chat messages
  useEffect(() => {
    if (currentChatId && user) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      // Ctrl/Cmd + F: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Esc: Close modals
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadChats = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/chats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setChats(result.data || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadReports = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setReports(result.data || []);
        if (result.data && result.data.length > 0 && !selectedReport) {
          let preferred: string | null = null;
          try {
            preferred = localStorage.getItem('palmira_selected_report_id');
          } catch {}
          const exists = preferred && result.data.some((r: any) => r.id === preferred);
          setSelectedReport(exists ? preferred : result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadFarms = async () => {
    // Load farms from user profile or farm profiles collection
    if (user?.farmName) {
      setFarms([
        {
          id: 'default',
          name: user.farmName,
          location: user.farmLocation,
        },
      ]);
      setSelectedFarm('default');
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/palmira/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setMessages(result.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewChat = async () => {
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
          title: language === 'id' ? 'Chat Baru' : language === 'ms' ? 'Sembang Baharu' : 'New Chat',
          reportId: selectedReport,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCurrentChatId(result.data.id);
        setShowHomepage(false);
        setMessages([]);
        loadChats();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const sendMessageToPalmira = async (content: string, options?: { skipUserBubble?: boolean }) => {
    if (!content.trim() || loading) return;

    const tempId = `temp-${Date.now()}`;

    // Capture PDF payload for THIS message only (no carry-over).
    const outgoingPdfContext = pdfContext || undefined;
    const outgoingPdfUploadId = pdfUploadId || undefined;
    const outgoingPdfFileName = attachedFile?.name || undefined;

    // Keep user message content clean for UI display
    const userMessage: Message = {
      id: tempId,
      role: 'user',
      content: content, // Only show user's question in UI
      createdAt: new Date(),
      pdfFileName: attachedFile?.name || null, // Store PDF filename for display
    };

    if (!options?.skipUserBubble) {
      setMessages(prev => [...prev, userMessage]);
    }

    setInput('');
    // Clear PDF state so the next message won't reuse it unless a new PDF is attached.
    setPdfContext(null);
    setPdfUploadId(null);
    setAttachedFile(null);
    setPdfExtractionInfo(null);
    setLoading(true);

    // Do not create the chat client-side (extra round-trip).
    // The `/api/palmira/chat` endpoint will create a chat when `chatId` is undefined.
    if (showHomepage) {
      setShowHomepage(false);
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content, // Only send user's question
          // PDF applies only when explicitly attached for this message.
          pdfContext: outgoingPdfContext,
          pdfFileName: outgoingPdfFileName,
          pdfUploadId: outgoingPdfUploadId,
          chatId: currentChatId || undefined,
          reportId: selectedReport || undefined,
          language,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      if (result.data.chatId && !currentChatId) {
        setCurrentChatId(result.data.chatId);
      }

      const assistantMessage: Message = {
        id: result.data.messageId,
        role: 'assistant',
        content: result.data.message,
        createdAt: new Date(),
        metadata: result.data.metadata,
      };

      setMessages(prev => {
        const withoutTemp = options?.skipUserBubble
          ? prev
          : prev.filter(m => m.id !== userMessage.id);
        return [...withoutTemp, ...(options?.skipUserBubble ? [] : [userMessage]), assistantMessage];
      });

      loadChats();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(
        language === 'id' ? toIndonesianText('Palmira menghadapi ralat semasa memproses soalan anda. Sila cuba lagi dalam beberapa saat.') : language === 'ms' ? 'Palmira menghadapi ralat semasa memproses soalan anda. Sila cuba lagi dalam beberapa saat.' : 'Palmira ran into an error while processing your question. Please try again in a moment.'
      );

      if (!options?.skipUserBubble) {
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      }
    } finally {
      setLoading(false);
      setRegeneratingMessageId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    await sendMessageToPalmira(input);
  };

  const handleLikeMessage = (messageId: string) => {
    setFeedback(prev => ({ ...prev, [messageId]: prev[messageId] === 'like' ? null : 'like' }));
    toast.success(
      language === 'id' ? 'Terima kasih atas masukan Anda!' : language === 'ms' ? 'Terima kasih atas maklum balas anda!' : 'Thanks for your feedback!'
    );
  };

  const handleDislikeMessage = (messageId: string) => {
    setFeedback(prev => ({ ...prev, [messageId]: prev[messageId] === 'dislike' ? null : 'dislike' }));
    toast.success(
      language === 'id' ? toIndonesianText('Maklum balas diterima. Kami akan gunakan ini untuk menambah baik Palmira.') : language === 'ms' ? 'Maklum balas diterima. Kami akan gunakan ini untuk menambah baik Palmira.' : 'Feedback recorded. We’ll use this to improve Palmira.'
    );
  };

  const handleRegenerate = async (assistantMessageId: string) => {
    if (loading || regeneratingMessageId) return;

    const index = messages.findIndex(m => m.id === assistantMessageId);
    if (index === -1) return;

    // Find the last user message before this assistant message
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        const previousUserMessage = messages[i];
        setRegeneratingMessageId(assistantMessageId);
        setLoading(true);
        
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) return;
          const token = await currentUser.getIdToken();

          const response = await fetch('/api/palmira/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              message: previousUserMessage.content,
              chatId: currentChatId || undefined,
              reportId: selectedReport || undefined,
              language,
            }),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to regenerate message');
          }

          const assistantMessage: Message = {
            id: result.data.messageId,
            role: 'assistant',
            content: result.data.message,
            createdAt: new Date(),
            metadata: result.data.metadata,
          };

          // Replace the existing assistant message instead of adding new one
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== assistantMessageId);
            return [...filtered, assistantMessage];
          });

          loadChats();
        } catch (error: any) {
          console.error('Error regenerating message:', error);
          toast.error(
            language === 'id' ? toIndonesianText('Ralat menjana semula mesej. Sila cuba lagi.') : language === 'ms' ? 'Ralat menjana semula mesej. Sila cuba lagi.' : 'Error regenerating message. Please try again.'
          );
        } finally {
          setLoading(false);
          setRegeneratingMessageId(null);
        }
        return;
      }
    }

    toast.error(
      language === 'id' ? toIndonesianText('Tiada mesej pengguna untuk dijana semula.') : language === 'ms' ? 'Tiada mesej pengguna untuk dijana semula.' : 'No previous user message found to regenerate.'
    );
  };

  const handleExportTranscript = () => {
    if (messages.length === 0) {
      toast.error(
        language === 'id' ? 'Tidak ada pesan untuk diekspor' : language === 'ms' ? 'Tiada mesej untuk dieksport' : 'No messages to export'
      );
      return;
    }

    const transcript = messages
      .map(msg => {
        const role = msg.role === 'user' ? 'User' : 'Palmira';
        const time = new Date(msg.createdAt).toLocaleString();
        return `[${time}] ${role}: ${msg.content}`;
      })
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palmira-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(
      language === 'id' ? toIndonesianText('Transkrip telah dieksport') : language === 'ms' ? 'Transkrip telah dieksport' : 'Transcript exported'
    );
  };

  const handleEscalate = async () => {
    if (!currentChatId) {
      toast.error(
        language === 'id' ? toIndonesianText('Sila mulakan sembang terlebih dahulu') : language === 'ms' ? 'Sila mulakan sembang terlebih dahulu' : 'Please start a chat first'
      );
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      // Mark chat as escalated
      const response = await fetch(`/api/palmira/chats/${currentChatId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          language === 'id' ? 'Percakapan Anda telah ditandakan untuk tindak lanjut manusia' : language === 'ms' ? 'Perbualan anda telah ditandakan untuk susulan manusia' : 'Your conversation has been flagged for human follow-up'
        );
      }
    } catch (error) {
      console.error('Error escalating:', error);
      toast.error(
        language === 'id' ? toIndonesianText('Ralat menandakan perbualan') : language === 'ms' ? 'Ralat menandakan perbualan' : 'Error flagging conversation'
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: loading ? 'auto' : 'smooth' });
  }, [messages, loading]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFarmDropdown || showReportDropdown) {
        setShowFarmDropdown(false);
        setShowReportDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showFarmDropdown, showReportDropdown]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ];
    const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];

    const isValidType = validTypes.includes(file.type) ||
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      toast.error(
        language === 'id' ? toIndonesianText('Jenis fail tidak disokong. Sila pilih PDF, Word, Excel, atau imej.') : language === 'ms' ? 'Jenis fail tidak disokong. Sila pilih PDF, Word, Excel, atau imej.' : 'File type not supported. Please select PDF, Word, Excel, or image.'
      );
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setAttachedFile(file);

    // If it's a PDF, extract content with enhanced OCR support
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setExtractingPDF(true);

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error(language === 'id' ? toIndonesianText('Sila log masuk terlebih dahulu') : language === 'ms' ? 'Sila log masuk terlebih dahulu' : 'Please log in first');
          return;
        }

        const token = await currentUser.getIdToken();
        const formData = new FormData();
        formData.append('file', file);

        const pollExtraction = async (uploadId: string) => {
          const start = Date.now();
          const timeoutMs = 10 * 60 * 1000; // 10 minutes
          while (Date.now() - start < timeoutMs) {
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch(`/api/palmira/extract-pdf?uploadId=${encodeURIComponent(uploadId)}`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (res.ok && json?.success && !json?.pending) return json;
            if (!res.ok && json?.error) throw new Error(json.error);
          }
          throw new Error('PDF processing timed out');
        };

        const response = await fetch('/api/palmira/extract-pdf', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to extract PDF');
        }

        // If batch processing was started, poll until completed.
        const resolved =
          result?.pending && (result?.uploadId || result?.data?.metadata?.uploadId)
            ? await pollExtraction(String(result.uploadId || result.data?.metadata?.uploadId))
            : result;

        // Store PDF content and show success message based on extraction method
        if (resolved.data?.fullText && resolved.data.fullText.trim().length > 0) {
          const extractedText = resolved.data.fullText.trim();
          const extractionMethod = resolved.data.metadata?.extractionMethod;
          const pages = resolved.data.pages || 1;
          const uploadId = resolved.data.metadata?.uploadId || resolved.data.uploadId;

          // Validate that we got meaningful content (at least 50 characters)
          if (extractedText.length >= 50) {
            setPdfContext(extractedText);
            if (uploadId) setPdfUploadId(uploadId);
            setPdfExtractionInfo({
              method: extractionMethod || 'unknown',
              pages,
              // Keep charCount internally, but don't display/toast it.
              charCount: extractedText.length,
            });

            // No success toast (keep upload/extraction silent).
          } else {
            console.warn('PDF extraction returned very short content');
            toast.error(
              language === 'id' ? toIndonesianText('PDF dipproses tetapi kandungan terlalu pendek. Kandungan mungkin tidak boleh dibaca.') : language === 'ms' ? 'PDF dipproses tetapi kandungan terlalu pendek. Kandungan mungkin tidak boleh dibaca.' : 'PDF processed but content is too short. Content may be unreadable.'
            );
            setPdfContext(null);
            setPdfExtractionInfo(null);
          }
        } else {
          console.warn('PDF extraction returned no content');
          toast.error(
            language === 'id' ? toIndonesianText('Tidak dapat mengekstrak kandungan PDF. PDF mungkin rosak atau tidak mengandungi teks.') : language === 'ms' ? 'Tidak dapat mengekstrak kandungan PDF. PDF mungkin rosak atau tidak mengandungi teks.' : 'Could not extract PDF content. PDF may be corrupted or contain no text.'
          );
          setPdfContext(null);
          setPdfExtractionInfo(null);
        }
      } catch (error: any) {
        console.error('Error extracting PDF:', error);
        toast.error(
          language === 'id' ? toIndonesianText('Ralat memproses PDF. Fail akan dihantar tanpa kandungan diekstrak.') : language === 'ms' ? 'Ralat memproses PDF. Fail akan dihantar tanpa kandungan diekstrak.' : 'Error processing PDF. File will be sent without extracted content.'
        );
      } finally {
        setExtractingPDF(false);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = messages.filter(message =>
        message.content.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const currentChat = chats.find(c => c.id === currentChatId);

  return (
    <div className="flex h-screen bg-white font-body w-full overflow-hidden">
      {/* Left Sidebar */}
      <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: sidebarCollapsed ? 80 : 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col bg-gray-50 border-r border-gray-200 relative h-screen overflow-hidden"
            >
              {/* Logo and Branding */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                      <Image
                        src="/images/Palmira.png"
                        alt="Palmira"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <span className="font-black text-green-900 text-lg font-heading">Palmira</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto overflow-hidden">
                    <Image
                      src="/images/Palmira.png"
                      alt="Palmira"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
                  title={sidebarCollapsed ? (language === 'id' ? toIndonesianText('Kembangkan') : language === 'ms' ? 'Kembangkan' : 'Expand') : (language === 'id' ? toIndonesianText('Runtuhkan') : language === 'ms' ? 'Runtuhkan' : 'Collapse')}
                  aria-label={sidebarCollapsed ? (language === 'id' ? toIndonesianText('Kembangkan') : language === 'ms' ? 'Kembangkan' : 'Expand') : (language === 'id' ? toIndonesianText('Runtuhkan') : language === 'ms' ? 'Runtuhkan' : 'Collapse')}
                >
                  <FontAwesomeIcon 
                    icon={sidebarCollapsed ? faChevronRight : faChevronLeft} 
                    className="w-4 h-4 text-gray-600" 
                  />
                </button>
              </div>

            {/* New Chat Button */}
            <motion.button
              onClick={handleNewChat}
              className={`m-4 ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} bg-green-800 hover:bg-green-900 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-heading`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
              title={sidebarCollapsed ? (language === 'id' ? 'Chat Baru' : language === 'ms' ? 'Sembang Baharu' : 'New Chat') : undefined}
            >
              <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
              </motion.div>
              {!sidebarCollapsed && (language === 'id' ? 'Chat Baru' : language === 'ms' ? 'Sembang Baharu' : 'New Chat')}
            </motion.button>

            {/* Home Button */}
            <motion.button
              onClick={() => setShowHomepage(!showHomepage)}
              className={`m-4 ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-xl font-bold flex items-center gap-2 transition-all font-heading ${
                showHomepage
                  ? 'bg-green-100 text-green-900 shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
              title={sidebarCollapsed ? (language === 'id' ? toIndonesianText('Laman Utama') : language === 'ms' ? 'Laman Utama' : 'Home') : undefined}
            >
              <motion.div
                animate={{ rotate: showHomepage ? 360 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
              </motion.div>
              {!sidebarCollapsed && (language === 'id' ? toIndonesianText('Laman Utama') : language === 'ms' ? 'Laman Utama' : 'Home')}
            </motion.button>


            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 min-h-0">
              {!sidebarCollapsed && (
                <div className="text-xs font-bold text-gray-500 uppercase mb-2 font-heading">
                  {language === 'id' ? toIndonesianText('Sejarah') : language === 'ms' ? 'Sejarah' : 'History'}
                </div>
              )}
              <div className="space-y-1">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        setCurrentChatId(chat.id);
                        setShowHomepage(false);
                      }}
                      className={`w-full ${sidebarCollapsed ? 'px-2 py-2 justify-center' : 'px-4 py-2'} text-left rounded-lg transition flex items-center gap-2 ${
                        currentChatId === chat.id
                          ? 'bg-amber-100 text-amber-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      title={chat.title}
                      aria-label={`${language === 'id' ? 'Buka chat' : language === 'ms' ? 'Buka sembang' : 'Open chat'}: ${chat.title}`}
                    >
                      <FontAwesomeIcon icon={faMessage} className="w-4 h-4 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <div className="font-medium text-sm truncate flex-1">{chat.title}</div>
                          {chat.lastMessage && (
                            <div className="text-xs text-gray-500 truncate mt-1 w-full">
                              {chat.lastMessage}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete(chat.id);
                        setShowDeleteModal(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                      title={language === 'id' ? 'Hapus chat' : language === 'ms' ? 'Padam sembang' : 'Delete chat'}
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="p-4 border-t border-gray-200 space-y-1">
              <button
                onClick={loadFarmProfile}
                disabled={farmProfileLoading}
                className={`w-full ${sidebarCollapsed ? 'px-2 py-2 justify-center' : 'px-4 py-2'} text-left rounded-lg hover:bg-gray-100 flex items-center gap-3 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                title={language === 'id' ? toIndonesianText('Profil Ladang') : language === 'ms' ? 'Profil Ladang' : 'Farm Profile'}
                aria-label={language === 'id' ? toIndonesianText('Profil Ladang') : language === 'ms' ? 'Profil Ladang' : 'Farm Profile'}
              >
                <FontAwesomeIcon icon={faSeedling} className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (language === 'id' ? toIndonesianText('Profil Ladang') : language === 'ms' ? 'Profil Ladang' : 'Farm Profile')}
              </button>
              {/* Knowledge base removed (per product decision) */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full">
        {/* Top Bar */}
        <div className="h-14 sm:h-16 border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title={language === 'id' ? 'Buka menu samping' : language === 'ms' ? 'Buka menu sisi' : 'Open sidebar'}
                aria-label={language === 'id' ? 'Buka menu samping' : language === 'ms' ? 'Buka menu sisi' : 'Open sidebar'}
              >
                <FontAwesomeIcon icon={faMessage} className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="font-bold text-gray-900 font-heading">
              {currentChat?.title || (language === 'id' ? 'Chat Baru' : language === 'ms' ? 'Sembang Baharu' : 'New Chat')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title={language === 'id' ? toIndonesianText('Cari') : language === 'ms' ? 'Cari' : 'Search'}
              aria-label={language === 'id' ? toIndonesianText('Cari') : language === 'ms' ? 'Cari' : 'Search'}
            >
              <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title={language === 'id' ? 'Pintasan Keyboard' : language === 'ms' ? 'Pintasan Papan Kekunci' : 'Keyboard Shortcuts'}
              aria-label={language === 'id' ? 'Pintasan Keyboard' : language === 'ms' ? 'Pintasan Papan Kekunci' : 'Keyboard Shortcuts'}
            >
              <FontAwesomeIcon icon={faBars} className="w-5 h-5 text-gray-600" />
            </button>

            {/* Select Farm Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFarmDropdown(!showFarmDropdown);
                  setShowReportDropdown(false);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                {selectedFarm
                  ? farms.find(f => f.id === selectedFarm)?.name || (language === 'id' ? toIndonesianText('Pilih Ladang') : language === 'ms' ? 'Pilih Ladang' : 'Select Farm')
                  : language === 'id' ? toIndonesianText('Pilih Ladang') : language === 'ms' ? 'Pilih Ladang' : 'Select Farm'}
                <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4" />
              </button>
              {showFarmDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  {farms.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      {language === 'id' ? 'Tidak ada kebun tersedia' : language === 'ms' ? 'Tiada ladang tersedia' : 'No farms available'}
                    </div>
                  ) : (
                    farms.map(farm => (
                      <button
                        key={farm.id}
                        onClick={() => {
                          setSelectedFarm(farm.id);
                          setShowFarmDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                          selectedFarm === farm.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{farm.name}</div>
                        {farm.location && (
                          <div className="text-xs text-gray-500">{farm.location}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Select Report Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowReportDropdown(!showReportDropdown);
                  setShowFarmDropdown(false);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />
                {selectedReport
                  ? reports.find(r => r.id === selectedReport)?.title || (language === 'id' ? toIndonesianText('Pilih Laporan') : language === 'ms' ? 'Pilih Laporan' : 'Select Report')
                  : language === 'id' ? toIndonesianText('Pilih Laporan') : language === 'ms' ? 'Pilih Laporan' : 'Select Report'}
                <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4" />
              </button>
              {showReportDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  {reports.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      {language === 'id' ? 'Tidak ada laporan tersedia' : language === 'ms' ? 'Tiada laporan tersedia' : 'No reports available'}
                    </div>
                  ) : (
                    reports.map(report => (
                      <button
                        key={report.id}
                        onClick={() => {
                          setSelectedReport(report.id);
                          try {
                            localStorage.setItem('palmira_selected_report_id', report.id);
                          } catch {}
                          setShowReportDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                          selectedReport === report.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
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
              )}
            </div>

            <button
              onClick={handleExportTranscript}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title={language === 'id' ? toIndonesianText('Eksport Transkrip') : language === 'ms' ? 'Eksport Transkrip' : 'Export Transcript'}
            >
              <FontAwesomeIcon icon={faDownload} className="w-5 h-5 text-gray-600" />
            </button>


            <button
              onClick={handleEscalate}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
              {language === 'id' ? toIndonesianText('Eskalasi') : language === 'ms' ? 'Eskalasi' : 'Escalate'}
            </button>

          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-0 w-full palmira-scrollbar">
          {showHomepage ? (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="text-center max-w-2xl mx-auto">
                <motion.div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden bg-gradient-to-br from-green-100 to-green-200 border-2 border-white ring-2 ring-green-200"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user?.displayName || 'You'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-green-600" />
                  )}
                </motion.div>
                <motion.h1
                  className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 font-heading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {language === 'id' ? toIndonesianText('Selamat Datang,') : language === 'ms' ? 'Selamat Datang,' : 'Welcome back,'} {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                </motion.h1>
                <motion.p
                  className="text-base text-green-700 font-medium mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  {language === 'id' ? toIndonesianText('Palmira sedia membantu anda.') : language === 'ms' ? 'Palmira sedia membantu anda.' : 'Palmira is ready to help.'}
                </motion.p>
                <motion.p
                  className="text-lg text-gray-600 mb-8 max-w-lg mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {canAccessAI
                    ? (language === 'id' ? toIndonesianText('Dapatkan pandangan segera tentang laporan tanah dan daun anda, nasihat baja, dan tip praktikal untuk ladang kelapa sawit—semua dalam satu tempat.') : language === 'ms' ? 'Dapatkan pandangan segera tentang laporan tanah dan daun anda, nasihat baja, dan tip praktikal untuk ladang kelapa sawit—semua dalam satu tempat.' : 'Get instant insights on your soil and leaf reports, fertilizer recommendations, and practical tips for your oil palm farm—all in one place.')
                    : (language === 'id' ? toIndonesianText('Anda boleh melihat laporan dan sejarah sembang anda. Keahlian diperlukan untuk menggunakan Palmira.') : language === 'ms' ? 'Anda boleh melihat laporan dan sejarah sembang anda. Keahlian diperlukan untuk menggunakan Palmira.' : 'You can view your reports and chat history. Membership is required to use Palmira.')}
                </motion.p>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {canAccessAI ? (
                    <motion.button
                      onClick={async () => {
                        setShowHomepage(false);
                        // Start a new chat automatically
                        await handleNewChat();
                      }}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <FontAwesomeIcon icon={faMessage} className="w-8 h-8 text-green-600 mx-auto mb-3 group-hover:text-green-700" />
                      </motion.div>
                      <h3 className="font-bold text-gray-900 mb-2 font-heading">
                        {language === 'id' ? toIndonesianText('Mulakan Sembang') : language === 'ms' ? 'Mulakan Sembang' : 'Start a Chat'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'id' ? toIndonesianText('Tanya Palmira tentang nutrien, cadangan baja, atau langkah seterusnya—dapatkan jawapan serta-merta.') : language === 'ms' ? 'Tanya Palmira tentang nutrien, cadangan baja, atau langkah seterusnya—dapatkan jawapan serta-merta.' : 'Ask Palmira about nutrients, fertilizer advice, or next steps—get answers in seconds.'}
                      </p>
                    </motion.button>
                  ) : (
                    <motion.div
                      className="bg-gray-100 p-6 rounded-xl shadow-sm border border-gray-200 opacity-60"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0.6 }}
                    >
                      <FontAwesomeIcon icon={faMessage} className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-500 mb-2 font-heading">
                        {language === 'id' ? 'Chat AI Terbatas' : language === 'ms' ? 'Sembang AI Terhad' : 'AI Chat Restricted'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {language === 'id' ? toIndonesianText('Memerlukan keahlian aktif') : language === 'ms' ? 'Memerlukan keahlian aktif' : 'Requires active membership'}
                      </p>
                    </motion.div>
                  )}
                  <motion.button
                    onClick={() => {
                      // Redirect to Reports/History page
                      router.push('/reports');
                    }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: -5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="w-8 h-8 text-green-600 mx-auto mb-3 group-hover:text-green-700" />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2 font-heading">
                      {language === 'id' ? toIndonesianText('Lihat Laporan') : language === 'ms' ? 'Lihat Laporan' : 'View Reports'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'id' ? toIndonesianText('Semak dan bandingkan analisis tanah dan daun anda—semua dalam satu tempat.') : language === 'ms' ? 'Semak dan bandingkan analisis tanah dan daun anda—semua dalam satu tempat.' : 'Review and compare your soil and leaf analyses—all in one place.'}
                    </p>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col h-full">
              {messages.length === 0 ? (
                <motion.div
                  className="flex items-center justify-center flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
                >
                  <div className="text-center text-gray-500 max-w-md mx-auto flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mb-6 flex justify-center"
                    >
                      <Image
                        src="/images/Palmira.png"
                        alt="Palmira"
                        width={128}
                        height={128}
                        className="rounded-full"
                      />
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-black mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-heading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {language === 'id' ? toIndonesianText('Selamat datang ke Palmira!') : language === 'ms' ? 'Selamat datang ke Palmira!' : 'Welcome to Palmira!'}
                    </motion.h2>
                    <motion.p
                      className="text-base text-gray-600 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {language === 'id' ? toIndonesianText('Mula perbualan dengan menaip mesej di bawah') : language === 'ms' ? 'Mula perbualan dengan menaip mesej di bawah' : 'Start a conversation by typing a message below'}
                    </motion.p>
                    <motion.div
                      className="flex justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.div
                        className="w-3 h-3 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    delay: index * 0.1
                  }}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <motion.div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Image
                        src="/images/Palmira.png"
                        alt="Palmira"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </motion.div>
                  )}
                  <motion.div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-green-700 to-green-800 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  >
                    {message.role === 'user' && message.pdfFileName && (
                      <div className="mb-2 pb-2 border-b border-green-600/30">
                        <div className="flex items-center gap-2 text-green-100 text-sm">
                          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4" />
                          <span className="truncate">{message.pdfFileName}</span>
                        </div>
                      </div>
                    )}
                    <div className={`whitespace-pre-wrap break-words font-body text-base leading-relaxed ${
                      message.role === 'user' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {message.content
                        .replace(/\\u00A0/g, '') // Remove \u00A0 characters
                        .replace(/\u00A0/g, '') // Remove actual non-breaking spaces
                        .split('\n')
                        .map((line, idx) => {
                          const trimmed = line.trim();
                          // Preserve blank lines as vertical spacing (e.g. between checklist items)
                          if (trimmed.length === 0) {
                            return <div key={idx} className="h-2 shrink-0" aria-hidden />;
                          }
                          // Clean up asterisks and number signs
                          let cleanedLine = line
                            .replace(/\*\*/g, '') // Remove bold markers
                            .replace(/\*/g, '') // Remove asterisks
                            .replace(/^\d+\.\s*/g, '') // Remove numbered list format (1. 2. 3.)
                            .trim();
                          if (cleanedLine.startsWith('-')) {
                            return <div key={idx} className="ml-4 my-1">{cleanedLine}</div>;
                          }
                          return <div key={idx} className="my-1">{cleanedLine}</div>;
                        })
                      }
                    </div>
                    {message.role === 'assistant' && !String(message.id).startsWith('intro-') && (
                      <>
                        <motion.div
                          className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={language === 'id' ? toIndonesianText('Salin') : language === 'ms' ? 'Salin' : 'Copy'}
                            aria-label={language === 'id' ? toIndonesianText('Salin') : language === 'ms' ? 'Salin' : 'Copy'}
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast.success(language === 'id' ? toIndonesianText('Disalin ke papan keratan') : language === 'ms' ? 'Disalin ke papan keratan' : 'Copied to clipboard');
                            }}
                          >
                            <FontAwesomeIcon icon={faCopy} className="w-4 h-4 text-gray-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#dcfce7' }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2 rounded-lg transition-colors ${
                              feedback[message.id] === 'like' ? 'bg-green-100' : 'hover:bg-green-100'
                            }`}
                            title={language === 'id' ? toIndonesianText('Suka') : language === 'ms' ? 'Suka' : 'Like'}
                            aria-label={language === 'id' ? toIndonesianText('Suka') : language === 'ms' ? 'Suka' : 'Like'}
                            onClick={() => handleLikeMessage(message.id)}
                          >
                            <FontAwesomeIcon
                              icon={faThumbsUp}
                              className={`w-4 h-4 ${
                                feedback[message.id] === 'like' ? 'text-green-700' : 'text-green-600'
                              }`}
                            />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2 rounded-lg transition-colors ${
                              feedback[message.id] === 'dislike'
                                ? 'bg-red-100'
                                : 'hover:bg-red-100'
                            }`}
                            title={language === 'id' ? toIndonesianText('Tidak suka') : language === 'ms' ? 'Tidak suka' : 'Dislike'}
                            aria-label={language === 'id' ? toIndonesianText('Tidak suka') : language === 'ms' ? 'Tidak suka' : 'Dislike'}
                            onClick={() => handleDislikeMessage(message.id)}
                          >
                            <FontAwesomeIcon
                              icon={faThumbsDown}
                              className={`w-4 h-4 ${
                                feedback[message.id] === 'dislike' ? 'text-red-700' : 'text-red-600'
                              }`}
                            />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#e0f2fe' }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'id' ? 'Buat Ulang' : language === 'ms' ? 'Muat semula' : 'Regenerate'}
                            aria-label={language === 'id' ? 'Buat Ulang' : language === 'ms' ? 'Muat semula' : 'Regenerate'}
                            disabled={loading && regeneratingMessageId === message.id}
                            onClick={() => handleRegenerate(message.id)}
                          >
                            <FontAwesomeIcon
                              icon={faRedo}
                              className={`w-4 h-4 ${
                                regeneratingMessageId === message.id ? 'text-blue-800' : 'text-blue-600'
                              }`}
                            />
                          </motion.button>
                        </motion.div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1.5">
                            {language === 'id' ? 'Gaya jawaban:' : language === 'ms' ? 'Gaya jawapan:' : 'Answer style:'}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {CONVERSATION_STYLES.map((style) => (
                              <motion.button
                                key={style.id}
                                type="button"
                                disabled={savingConversationStyle || (loading && regeneratingMessageId === message.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => saveConversationStyle(style.id, message.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  conversationStyle === style.id
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } disabled:opacity-60`}
                                title={language === 'id' ? toIndonesianText(style.descMs) : language === 'ms' ? style.descMs : style.descEn}
                              >
                                {language === 'id' ? toIndonesianText(style.labelMs) : language === 'ms' ? style.labelMs : style.labelEn}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 flex items-center justify-center">
                      {user?.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={user.displayName || 'You'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  className="flex gap-4 justify-start items-start"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Image
                      src="/images/Palmira.png"
                      alt="Palmira"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </motion.div>
                  <motion.div
                    className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm"
                    animate={{ y: [0, -2, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-amber-500 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area - Only show when not on homepage */}
        {!showHomepage && (
          <motion.div
            className="border-t border-gray-200 p-2 sm:p-4 bg-white shadow-lg flex-shrink-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="max-w-4xl mx-auto">
              {canAccessAI && canPerformAnalysis ? (
              <>
                <motion.div
                  className="flex items-end gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-200"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 hover:bg-gray-200 rounded-xl transition-colors"
                    title={language === 'id' ? toIndonesianText('Lampirkan fail') : language === 'ms' ? 'Lampirkan fail' : 'Attach file'}
                    aria-label={language === 'id' ? toIndonesianText('Lampirkan fail') : language === 'ms' ? 'Lampirkan fail' : 'Attach file'}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FontAwesomeIcon icon={faPaperclip} className="w-5 h-5 text-gray-600" />
                  </motion.button>
                  <label className="hidden">
                    {language === 'id' ? toIndonesianText('Lampirkan fail') : language === 'ms' ? 'Lampirkan fail' : 'Attach file'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="application/pdf,.pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,image/jpeg,image/png"
                      aria-label={language === 'id' ? toIndonesianText('Lampirkan fail') : language === 'ms' ? 'Lampirkan fail' : 'Attach file'}
                      onChange={handleFileSelect}
                    />
                  </label>
                  {attachedFile && (
                    <div className="flex flex-col gap-1 px-3 py-2 bg-green-50 rounded-lg min-w-[250px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-700 font-medium font-body truncate max-w-[200px]">
                          {attachedFile.name}
                        </span>
                        <button
                          onClick={() => {
                            setAttachedFile(null);
                            setPdfContext(null);
                            setPdfExtractionInfo(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-green-700 hover:text-green-900"
                          title={language === 'id' ? toIndonesianText('Buang fail') : language === 'ms' ? 'Buang fail' : 'Remove file'}
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                        </button>
                      </div>
                      {pdfExtractionInfo && (
                        <div className="text-xs text-green-600 font-body">
                      {pdfExtractionInfo.method === 'ocr_image_pdf' ? (
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faRobot} className="w-3 h-3" />
                              {language === 'ms'
                                ? `OCR: ${pdfExtractionInfo.pages} halaman`
                                : `OCR: ${pdfExtractionInfo.pages} pages`}
                            </span>
                          ) : pdfExtractionInfo.method === 'text_pdf' ? (
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faFilePdf} className="w-3 h-3" />
                              {language === 'ms'
                                ? `Teks: ${pdfExtractionInfo.pages} halaman`
                                : `Text: ${pdfExtractionInfo.pages} pages`}
                            </span>
                          ) : (
                            <span>
                              {language === 'ms'
                                ? `Diproses`
                                : `Processed`}
                            </span>
                          )}
                        </div>
                      )}
                      {extractingPDF && (
                        <div className="text-xs text-green-600 font-body flex items-center gap-1">
                          <div className="animate-spin w-3 h-3 border border-green-600 border-t-transparent rounded-full"></div>
                          {language === 'id' ? toIndonesianText('Memproses...') : language === 'ms' ? 'Memproses...' : 'Processing...'}
                        </div>
                      )}
                    </div>
                  )}
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      language === 'id' ? toIndonesianText('Taip mesej anda di sini...') : language === 'ms' ? 'Taip mesej anda di sini...' : 'Type your message here...'
                    }
                    className="flex-1 px-4 py-3 bg-transparent focus:outline-none resize-none min-h-[52px] max-h-32 placeholder-gray-400 font-body"
                    rows={1}
                    disabled={loading}
                  />
                  {/* Voice Input Button */}
                  <motion.button
                    onClick={toggleVoiceInput}
                    className={`p-3 rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title={isListening 
                      ? (language === 'id' ? 'Berhenti mendengarkan' : language === 'ms' ? 'Berhenti mendengar' : 'Stop listening')
                      : (language === 'id' ? 'Input suara' : language === 'ms' ? 'Input suara' : 'Voice input')
                    }
                    aria-label={isListening ? 'Stop' : 'Voice input'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    className={`p-3 rounded-xl transition-all ${
                      input.trim() && !loading
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={language === 'id' ? 'Kirim pesan' : language === 'ms' ? 'Hantar mesej' : 'Send message'}
                    aria-label={language === 'id' ? 'Kirim pesan' : language === 'ms' ? 'Hantar mesej' : 'Send message'}
                    whileHover={input.trim() && !loading ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && !loading ? { scale: 0.95 } : {}}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />
                  </motion.button>
                </motion.div>
                <motion.div
                  className="flex items-center justify-between mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faRobot} className="w-4 h-4" />
                    {language === 'id' ? toIndonesianText('Palmira boleh membuat kesilapan. Sila semak maklumat penting.') : language === 'ms' ? 'Palmira boleh membuat kesilapan. Sila semak maklumat penting.' : 'Palmira can make mistakes. Please check important information.'}
                  </p>
                </motion.div>
              </>
            ) : canAccessAI && hasReachedUploadLimit ? (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-bold text-blue-800 mb-3 text-lg font-heading">
                    {language === 'id' ? toIndonesianText('Had Muat Naik Dicapai') : language === 'ms' ? 'Had Muat Naik Dicapai' : 'Upload Limit Reached'}
                  </h3>
                  <p className="text-sm text-blue-700 leading-relaxed mb-3">
                    {language === 'ms'
                      ? `Anda telah menggunakan ${uploadsUsedThisMonth} daripada ${uploadLimit === -1 ? 'tanpa had' : uploadLimit} muat naik. Had maksimum ialah 2 laporan setiap pengguna. Anda masih boleh melihat sejarah analisis dan sembang anda.`
                      : `You have used ${uploadsUsedThisMonth} of ${uploadLimit === -1 ? 'unlimited' : uploadLimit} uploads. The maximum is 2 reports per user. You can still view your analysis history and chats.`}
                  </p>
                  <button
                    onClick={() => router.push('/reports')}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {language === 'id' ? toIndonesianText('Lihat Laporan') : language === 'ms' ? 'Lihat Laporan' : 'View Reports'}
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                  </motion.div>
                <h3 className="font-bold text-amber-800 mb-3 text-lg font-heading">
                  {language === 'id' ? 'Akses AI Terbatas' : language === 'ms' ? 'Akses AI Terhad' : 'AI Access Restricted'}
                </h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    {language === 'id' ? toIndonesianText('Anda memerlukan keahlian aktif untuk menggunakan Palmira. Anda masih boleh melihat laporan dan sejarah sembang anda.') : language === 'ms' ? 'Anda memerlukan keahlian aktif untuk menggunakan Palmira. Anda masih boleh melihat laporan dan sejarah sembang anda.' : 'You need an active membership to use Palmira. You can still view your reports and chat history.'}
                  </p>
                  <motion.div
                    className="mt-4 flex justify-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
        )}
      </div>


      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-hidden border border-gray-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'id' ? 'Cari dalam Chat' : language === 'ms' ? 'Cari dalam Sembang' : 'Search in Chat'}
                </h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title={language === 'id' ? toIndonesianText('Tutup') : language === 'ms' ? 'Tutup' : 'Close'}
                  aria-label={language === 'id' ? toIndonesianText('Tutup') : language === 'ms' ? 'Tutup' : 'Close'}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder={language === 'id' ? toIndonesianText('Cari mesej...') : language === 'ms' ? 'Cari mesej...' : 'Search messages...'}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
              </div>

              <div className="overflow-y-auto max-h-96">
                {searchQuery && searchResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {language === 'id' ? 'Tidak ada hasil' : language === 'ms' ? 'Tiada hasil dijumpai' : 'No results found'}
                  </p>
                ) : searchResults.length > 0 ? (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {searchResults.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300
                        }}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                          message.role === 'user'
                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-medium ${
                            message.role === 'user' ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {message.role === 'user' ? (language === 'id' ? toIndonesianText('Anda') : language === 'ms' ? 'Anda' : 'You') : 'Palmira'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{stripMarkdownHeadingsOutsideCodeBlocks(message.content)}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : searchQuery === '' ? (
                  <p className="text-gray-500 text-center py-8">
                    {language === 'id' ? 'Ketik untuk mencari pesan' : language === 'ms' ? 'Taip untuk mencari mesej' : 'Type to search messages'}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-8 h-8 text-red-500" />
                </motion.div>
                <h3 className="text-xl font-black text-gray-900 mb-2 font-heading">
                  {language === 'id' ? 'Hapus chat' : language === 'ms' ? 'Padam Sembang' : 'Delete Chat'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'id' ? toIndonesianText('Adakah anda pasti mahu memadam sembang ini? Tindakan ini tidak boleh dibuat asal.') : language === 'ms' ? 'Adakah anda pasti mahu memadam sembang ini? Tindakan ini tidak boleh dibuat asal.' : 'Are you sure you want to delete this chat? This action cannot be undone.'
                  }
                </p>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {language === 'id' ? toIndonesianText('Batal') : language === 'ms' ? 'Batal' : 'Cancel'}
                  </motion.button>
                  <motion.button
                    onClick={async () => {
                      if (!chatToDelete) return;

                      try {
                        const currentUser = auth.currentUser;
                        if (!currentUser) return;

                        const token = await currentUser.getIdToken();
                        const response = await fetch(`/api/palmira/chats/${chatToDelete}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` },
                        });

                        if (response.ok) {
                          // Remove from local state
                          setChats(prev => prev.filter(c => c.id !== chatToDelete));
                          // If this was the current chat, clear it
                          if (currentChatId === chatToDelete) {
                            setCurrentChatId(null);
                            setMessages([]);
                          }
                          setShowDeleteModal(false);
                          setChatToDelete(null);
                          toast.success(language === 'id' ? 'Chat berhasil dihapus' : language === 'ms' ? 'Sembang berjaya dipadam' : 'Chat deleted successfully');
                        } else {
                          toast.error(language === 'id' ? 'Gagal menghapus chat' : language === 'ms' ? 'Gagal memadam sembang' : 'Failed to delete chat');
                        }
                      } catch (error) {
                        console.error('Error deleting chat:', error);
                        toast.error(language === 'id' ? 'Kesalahan menghapus chat' : language === 'ms' ? 'Ralat memadam sembang' : 'Error deleting chat');
                      }
                    }}
                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {language === 'id' ? toIndonesianText('Padam') : language === 'ms' ? 'Padam' : 'Delete'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Farm Profile Modal */}
      <AnimatePresence>
        {showFarmProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowFarmProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 font-heading">
                  <FontAwesomeIcon icon={faSeedling} className="w-6 h-6 text-green-600" />
                  {language === 'id' ? toIndonesianText('Profil Ladang') : language === 'ms' ? 'Profil Ladang' : 'Farm Profile'}
                </h2>
                <button
                  onClick={() => setShowFarmProfile(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={language === 'id' ? toIndonesianText('Tutup') : language === 'ms' ? 'Tutup' : 'Close'}
                  aria-label={language === 'id' ? toIndonesianText('Tutup') : language === 'ms' ? 'Tutup' : 'Close'}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {farmProfileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : onboardingData && onboardingData.completed ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'id' ? toIndonesianText('Jenis Pengguna') : language === 'ms' ? 'Jenis Pengguna' : 'User Type'}
                      </label>
                      <p className="text-gray-900 font-bold capitalize font-body">
                        {onboardingData.userType?.replace('_', ' ') || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'id' ? toIndonesianText('Bahasa') : language === 'ms' ? 'Bahasa' : 'Language'}
                      </label>
                      <p className="text-gray-900 font-bold uppercase font-body">
                        {onboardingData.language || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'id' ? 'Gaya Percakapan' : language === 'ms' ? 'Gaya Perbualan' : 'Conversation Style'}
                      </label>
                      <p className="text-gray-900 font-bold capitalize font-body">
                        {onboardingData.conversationStyle?.replace('_', ' ') || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'id' ? toIndonesianText('Status') : language === 'ms' ? 'Status' : 'Status'}
                      </label>
                      <p className="text-gray-900 font-bold font-body">
                        {onboardingData.completed ? (language === 'id' ? toIndonesianText('Lengkap') : language === 'ms' ? 'Lengkap' : 'Completed') : (language === 'id' ? toIndonesianText('Tidak Lengkap') : language === 'ms' ? 'Tidak Lengkap' : 'Incomplete')}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 font-heading">
                      {language === 'id' ? toIndonesianText('Kebenaran') : language === 'ms' ? 'Kebenaran' : 'Consents'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon 
                          icon={onboardingData.consentTranscripts ? faThumbsUp : faTimes} 
                          className={`w-5 h-5 ${onboardingData.consentTranscripts ? 'text-green-600' : 'text-gray-400'}`} 
                        />
                        <span className="text-gray-700">
                          {language === 'id' ? 'Persetujuan Transkrip' : language === 'ms' ? 'Kebenaran Transkrip' : 'Transcript Consent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon 
                          icon={onboardingData.consentFarmProfile ? faThumbsUp : faTimes} 
                          className={`w-5 h-5 ${onboardingData.consentFarmProfile ? 'text-green-600' : 'text-gray-400'}`} 
                        />
                        <span className="text-gray-700">
                          {language === 'id' ? 'Persetujuan Profil Kebun' : language === 'ms' ? 'Kebenaran Profil Ladang' : 'Farm Profile Consent'}
                        </span>
                      </div>
                      {onboardingData.consentAnonymized !== undefined && (
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon 
                            icon={onboardingData.consentAnonymized ? faThumbsUp : faTimes} 
                            className={`w-5 h-5 ${onboardingData.consentAnonymized ? 'text-green-600' : 'text-gray-400'}`} 
                          />
                          <span className="text-gray-700">
                            {language === 'id' ? 'Persetujuan Data Anonim' : language === 'ms' ? 'Kebenaran Data Tanpa Nama' : 'Anonymized Data Consent'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {onboardingData.completedAt && (() => {
                    try {
                      const dateStr = onboardingData.completedAt;
                      const date = new Date(dateStr);
                      
                      if (!isNaN(date.getTime())) {
                        return (
                          <div className="text-sm text-gray-500 font-body">
                            {language === 'id' ? 'Diselesaikan pada' : language === 'ms' ? 'Selesai pada' : 'Completed on'}: {date.toLocaleString(language === 'id' ? 'id-ID' : language === 'ms' ? 'ms-MY' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        );
                      }
                    } catch (error) {
                      console.error('Error parsing date:', error);
                    }
                    
                    return null;
                  })()}

                  {/* Knowledge base removed (per product decision) */}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'id' ? toIndonesianText('Profil ladang belum lengkap. Sila lengkapkan onboarding terlebih dahulu.') : language === 'ms' ? 'Profil ladang belum lengkap. Sila lengkapkan onboarding terlebih dahulu.' : 'Farm profile is not complete. Please complete onboarding first.'}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Tutorial Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowKeyboardShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 font-heading">
                  {language === 'id' ? 'Pintasan Keyboard' : language === 'ms' ? 'Pintasan Papan Kekunci' : 'Keyboard Shortcuts'}
                </h2>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={language === 'id' ? toIndonesianText('Tutup') : language === 'ms' ? 'Tutup' : 'Close'}
                  aria-label={language === 'id' ? toIndonesianText('Tutup') : language === 'ms' ? 'Tutup' : 'Close'}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-4 font-body">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {language === 'id' ? 'Chat Baru' : language === 'ms' ? 'Sembang Baharu' : 'New Chat'}
                  </span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono font-semibold">
                    {typeof window !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + N
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {language === 'id' ? toIndonesianText('Cari') : language === 'ms' ? 'Cari' : 'Search'}
                  </span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono font-semibold">
                    {typeof window !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + F
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {language === 'id' ? 'Kirim pesan' : language === 'ms' ? 'Hantar Mesej' : 'Send Message'}
                  </span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono font-semibold">
                    Enter
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {language === 'id' ? 'Baris Baru' : language === 'ms' ? 'Baris Baharu' : 'New Line'}
                  </span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono font-semibold">
                    Shift + Enter
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {language === 'id' ? toIndonesianText('Tutup Modal') : language === 'ms' ? 'Tutup Modal' : 'Close Modal'}
                  </span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono font-semibold">
                    Esc
                  </kbd>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center font-body">
                  {language === 'id' ? toIndonesianText('Tip: Gunakan pintasan ini untuk navigasi yang lebih pantas!') : language === 'ms' ? 'Tip: Gunakan pintasan ini untuk navigasi yang lebih pantas!' : 'Tip: Use these shortcuts for faster navigation!'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
