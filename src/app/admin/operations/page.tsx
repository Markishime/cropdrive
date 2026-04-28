'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faComments, faFile, faChartBar, faChevronDown, faChevronRight,
  faSpinner, faRefresh, faEye, faDownload, faSearch, faTimes,
} from '@fortawesome/free-solid-svg-icons';

interface UploadedFile {
  id: string; userId: string; userName: string; userEmail: string;
  countryRegion: string; fileName: string; fileType: string;
  storagePath: string; downloadUrl: string; createdAt: string | null;
}

interface InternalReport {
  id: string; reportId: string; userId: string; userName: string;
  userEmail: string; countryRegion: string; title: string; type: string;
  fileUrl: string; createdAt: string | null;
}

interface ChatLog {
  id: string; userId: string; userName: string; userEmail: string;
  countryRegion: string; title: string; updatedAt: string | null;
  createdAt: string | null; escalated: boolean;
}

interface ChatMessage {
  id: string; role: string; content: string;
  timestamp: string | null; fileUrls: string[]; fileName: string | null;
}

interface OperationsData {
  uploadedFiles: UploadedFile[];
  internalReports: InternalReport[];
  chatLogs: ChatLog[];
}

interface UserSummary {
  userId: string;
  userName: string;
  userEmail: string;
  countryRegion: string;
  uploads: UploadedFile[];
  reports: InternalReport[];
  chats: ChatLog[];
}

function groupByUser(data: OperationsData): UserSummary[] {
  const map = new Map<string, UserSummary>();

  const ensure = (userId: string, userName: string, userEmail: string, countryRegion: string) => {
    if (!map.has(userId)) {
      map.set(userId, { userId, userName, userEmail, countryRegion, uploads: [], reports: [], chats: [] });
    }
    return map.get(userId)!;
  };

  data.uploadedFiles.forEach((f) => {
    ensure(f.userId, f.userName, f.userEmail, f.countryRegion).uploads.push(f);
  });
  data.internalReports.forEach((r) => {
    ensure(r.userId, r.userName, r.userEmail, r.countryRegion).reports.push(r);
  });
  data.chatLogs.forEach((c) => {
    ensure(c.userId, c.userName, c.userEmail, c.countryRegion).chats.push(c);
  });

  return Array.from(map.values()).sort((a, b) => a.userName.localeCompare(b.userName));
}

export default function AdminOperationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<OperationsData>({ uploadedFiles: [], internalReports: [], chatLogs: [] });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'uploads' | 'reports'>('chats');
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loadingMessages, setLoadingMessages] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Always get a fresh token — Firebase SDK auto-refreshes before expiry
  const getFreshToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  }, []);

  const fetchData = useCallback(async () => {
    const authToken = await getFreshToken();
    if (!authToken) return;
    const opsRes = await fetch('/api/admin/operations', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const opsJson = await opsRes.json();
    if (opsJson?.success) {
      setData(opsJson.data);
    }
  }, [getFreshToken]);;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }

    const run = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const authToken = await currentUser.getIdToken();

        const adminRes = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${authToken}` } });
        const adminJson = await adminRes.json();
        if (!adminJson?.isAdmin) { router.replace('/dashboard'); return; }
        setIsAdmin(true);

        await fetchData();
      } finally {
        setLoadingData(false);
      }
    };
    run();
  }, [user, loading, router, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleExpandChat = async (chatId: string) => {
    if (expandedChatId === chatId) {
      setExpandedChatId(null);
      return;
    }
    setExpandedChatId(chatId);
    if (chatMessages[chatId]) return;

    const authToken = await getFreshToken();
    if (!authToken) return;
    setLoadingMessages(chatId);
    try {
      const res = await fetch(`/api/admin/chat-messages?chatId=${chatId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (json?.success) {
        setChatMessages((prev) => ({ ...prev, [chatId]: json.messages }));
      }
    } finally {
      setLoadingMessages(null);
    }
  };

  const users = groupByUser(data);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.userName.toLowerCase().includes(q) ||
      u.userEmail.toLowerCase().includes(q) ||
      u.countryRegion.toLowerCase().includes(q)
    );
  });

  const selectedUser = users.find((u) => u.userId === selectedUserId) || null;

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading admin operations...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black">Operations Access</h1>
            <p className="text-green-200 mt-1">
              {users.length} users · {data.uploadedFiles.length} uploads · {data.chatLogs.length} chats · {data.internalReports.length} reports
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRefresh} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left: User List */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No users found</div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.userId}
                    onClick={() => { setSelectedUserId(u.userId); setExpandedChatId(null); setActiveTab('chats'); }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${selectedUserId === u.userId ? 'bg-green-50 border-r-4 border-green-600' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                        {u.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{u.userName}</p>
                        <p className="text-xs text-gray-500 truncate">{u.userEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">{u.countryRegion || '—'}</p>
                        <div className="flex gap-2 mt-1.5">
                          {u.chats.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                              {u.chats.length} chat{u.chats.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {u.uploads.length > 0 && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                              {u.uploads.length} file{u.uploads.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {u.reports.length > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                              {u.reports.length} report{u.reports.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: User Detail */}
        <div className="flex-1 min-w-0">
          {!selectedUser ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
              <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Select a user to view their activity</p>
              <p className="text-gray-400 text-sm mt-1">Choose from the user list on the left</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {selectedUser.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">{selectedUser.userName}</h2>
                      <p className="text-gray-600">{selectedUser.userEmail}</p>
                      <p className="text-sm text-gray-400 mt-1">{selectedUser.countryRegion || 'Location unknown'} · ID: {selectedUser.userId.slice(0, 12)}…</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-black text-blue-700">{selectedUser.chats.length}</p>
                      <p className="text-xs text-blue-600">Chats</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-yellow-50 rounded-xl">
                      <p className="text-2xl font-black text-yellow-700">{selectedUser.uploads.length}</p>
                      <p className="text-xs text-yellow-600">Files</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-purple-50 rounded-xl">
                      <p className="text-2xl font-black text-purple-700">{selectedUser.reports.length}</p>
                      <p className="text-xs text-purple-600">Reports</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {([
                    { key: 'chats', label: 'Palmira Conversations', icon: faComments, count: selectedUser.chats.length, color: 'blue' },
                    { key: 'uploads', label: 'Uploaded Files', icon: faFile, count: selectedUser.uploads.length, color: 'yellow' },
                    { key: 'reports', label: 'Analysis Reports', icon: faChartBar, count: selectedUser.reports.length, color: 'purple' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 lg:px-6 py-4 text-sm font-semibold transition border-b-2 ${
                        activeTab === tab.key
                          ? 'border-green-600 text-green-700 bg-green-50'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.count}</span>
                      <span className="hidden sm:inline bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 lg:p-6">
                  {/* Palmira Conversations Tab */}
                  {activeTab === 'chats' && (
                    <div className="space-y-3">
                      {selectedUser.chats.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <FontAwesomeIcon icon={faComments} className="w-10 h-10 mb-3 opacity-30" />
                          <p>No Palmira conversations yet</p>
                        </div>
                      ) : (
                        selectedUser.chats.map((chat) => (
                          <div key={chat.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleExpandChat(chat.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
                            >
                              <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faComments} className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{chat.title || 'Palmira Chat'}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {chat.updatedAt ? new Date(chat.updatedAt).toLocaleString() : 'Unknown date'}
                                    {chat.escalated && <span className="ml-2 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-semibold">Escalated</span>}
                                  </p>
                                </div>
                              </div>
                              {loadingMessages === chat.id ? (
                                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 text-gray-400 animate-spin" />
                              ) : (
                                <FontAwesomeIcon
                                  icon={expandedChatId === chat.id ? faChevronDown : faChevronRight}
                                  className="w-4 h-4 text-gray-400"
                                />
                              )}
                            </button>

                            {expandedChatId === chat.id && (
                              <div className="border-t border-gray-200 bg-gray-50 p-4 max-h-96 overflow-y-auto">
                                {!chatMessages[chat.id] ? (
                                  <div className="text-center py-6 text-gray-400">
                                    <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin mb-2" />
                                    <p className="text-sm">Loading messages...</p>
                                  </div>
                                ) : chatMessages[chat.id].length === 0 ? (
                                  <p className="text-center text-gray-400 text-sm py-4">No messages in this chat</p>
                                ) : (
                                  <div className="space-y-3">
                                    {chatMessages[chat.id].map((msg) => (
                                      <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div
                                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                            msg.role === 'user'
                                              ? 'bg-green-600 text-white rounded-br-none'
                                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-semibold ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                                              {msg.role === 'user' ? selectedUser.userName : 'Palmira AI'}
                                            </span>
                                            {msg.timestamp && (
                                              <span className={`text-xs ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                            )}
                                          </div>
                                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                          {msg.fileName && (
                                            <p className={`text-xs mt-1 flex items-center gap-1 ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                                              <FontAwesomeIcon icon={faFile} className="w-3 h-3" />
                                              {msg.fileName}
                                            </p>
                                          )}
                                          {msg.fileUrls && msg.fileUrls.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                              {msg.fileUrls.map((url, i) => (
                                                <a
                                                  key={i}
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className={`flex items-center gap-1 text-xs underline ${msg.role === 'user' ? 'text-green-200' : 'text-blue-600'}`}
                                                >
                                                  <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                                                  View attachment {i + 1}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Uploaded Files Tab */}
                  {activeTab === 'uploads' && (
                    <div className="space-y-3">
                      {selectedUser.uploads.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <FontAwesomeIcon icon={faFile} className="w-10 h-10 mb-3 opacity-30" />
                          <p>No files uploaded yet</p>
                        </div>
                      ) : (
                        selectedUser.uploads.map((file) => (
                          <div key={file.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                              <FontAwesomeIcon icon={faFile} className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{file.fileName || 'Unknown file'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{file.fileType || 'Unknown type'}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {file.createdAt ? new Date(file.createdAt).toLocaleString() : 'Date unknown'}
                              </p>
                            </div>
                            {file.downloadUrl && (
                              <a
                                href={file.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                              >
                                <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                                View
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Analysis Reports Tab */}
                  {activeTab === 'reports' && (
                    <div className="space-y-3">
                      {selectedUser.reports.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <FontAwesomeIcon icon={faChartBar} className="w-10 h-10 mb-3 opacity-30" />
                          <p>No analysis reports yet</p>
                        </div>
                      ) : (
                        selectedUser.reports.map((report) => (
                          <div key={report.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{report.title || 'Untitled Report'}</p>
                              <p className="text-xs text-gray-500 mt-0.5 capitalize">{report.type || 'Analysis'}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Date unknown'}
                              </p>
                            </div>
                            {report.fileUrl && (
                              <a
                                href={report.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition flex-shrink-0"
                              >
                                <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                                View
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

