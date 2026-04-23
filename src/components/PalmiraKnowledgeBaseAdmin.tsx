'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { PalmiraKnowledgeBaseDocument } from '@/types';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Save, 
  XCircle,
  CheckCircle,
  Globe,
  FileText,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PalmiraKnowledgeBaseAdmin() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('en');
  const [documents, setDocuments] = useState<PalmiraKnowledgeBaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterLanguage, setFilterLanguage] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PalmiraKnowledgeBaseDocument | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    language: 'both' as 'en' | 'ms' | 'id' | 'both',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const { t } = useTranslation(language);

  useEffect(() => {
    const lang = getCurrentLanguage();
    setLanguage(lang);
    checkAdminStatus();
    loadDocuments();
  }, []);

  const checkAdminStatus = async () => {
    if (!auth.currentUser) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
        if (!data.isAdmin) {
          setError('You do not have admin access');
        }
      } else {
        setIsAdmin(false);
        setError('You do not have admin access');
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    }
  };

  const loadDocuments = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await auth.currentUser.getIdToken();
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterLanguage) params.append('language', filterLanguage);
      if (filterActive) params.append('isActive', filterActive);
      
      const response = await fetch(`/api/palmira/admin/knowledge-base?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      
      const result = await response.json();
      setDocuments(result.data || []);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDocuments();
    }
  }, [filterCategory, filterLanguage, filterActive, isAdmin]);

  const handleOpenModal = (doc?: PalmiraKnowledgeBaseDocument) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        title: doc.title,
        content: doc.content,
        category: doc.category,
        tags: doc.tags.join(', '),
        language: doc.language,
        isActive: doc.isActive,
      });
    } else {
      setEditingDoc(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: '',
        language: 'both',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoc(null);
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: '',
      language: 'both',
      isActive: true,
    });
  };

  const handleSave = async () => {
    if (!auth.currentUser || !formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const token = await auth.currentUser.getIdToken();
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category.trim() || 'general',
        tags: tagsArray,
        language: formData.language,
        isActive: formData.isActive,
      };
      
      const url = editingDoc
        ? `/api/palmira/admin/knowledge-base/${editingDoc.id}`
        : '/api/palmira/admin/knowledge-base';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save document');
      }
      
      handleCloseModal();
      loadDocuments();
    } catch (err: any) {
      console.error('Error saving document:', err);
      setError(err.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!auth.currentUser || !confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/palmira/admin/knowledge-base/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      loadDocuments();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = doc.title.toLowerCase().includes(query);
      const matchesContent = doc.content.toLowerCase().includes(query);
      const matchesTags = doc.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesContent && !matchesTags) return false;
    }
    return true;
  });

  // Get unique categories and tags
  const categories = Array.from(new Set(documents.map(doc => doc.category).filter(Boolean))).sort();
  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags))).sort();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'ms' ? 'Akses Ditolak' : 'Access Denied'}
            </h2>
            <p className="text-gray-600">
              {language === 'ms' 
                ? 'Anda tidak mempunyai akses pentadbir untuk halaman ini.'
                : 'You do not have admin access to this page.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-green-900 mb-2">
                {language === 'ms' ? 'Pengurusan Pangkalan Pengetahuan Palmira' : 'Palmira Knowledge Base Management'}
              </h1>
              <p className="text-gray-600">
                {language === 'ms' 
                  ? 'Urus dokumen pangkalan pengetahuan untuk Palmira'
                  : 'Manage knowledge base documents for Palmira'}
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {language === 'ms' ? 'Tambah Dokumen' : 'Add Document'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
              title={language === 'ms' ? 'Tutup' : 'Close'}
              aria-label={language === 'ms' ? 'Tutup mesej ralat' : 'Close error message'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ms' ? 'Cari...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              title={language === 'ms' ? 'Tapis mengikut kategori' : 'Filter by category'}
              aria-label={language === 'ms' ? 'Tapis mengikut kategori' : 'Filter by category'}
            >
              <option value="">{language === 'ms' ? 'Semua Kategori' : 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              title={language === 'ms' ? 'Tapis mengikut bahasa' : 'Filter by language'}
              aria-label={language === 'ms' ? 'Tapis mengikut bahasa' : 'Filter by language'}
            >
              <option value="">{language === 'ms' ? 'Semua Bahasa' : 'All Languages'}</option>
              <option value="en">English</option>
              <option value="ms">Bahasa Malaysia</option>
              <option value="both">{language === 'ms' ? 'Kedua-dua' : 'Both'}</option>
            </select>

            {/* Active Filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              title={language === 'ms' ? 'Tapis mengikut status' : 'Filter by status'}
              aria-label={language === 'ms' ? 'Tapis mengikut status' : 'Filter by status'}
            >
              <option value="">{language === 'ms' ? 'Semua Status' : 'All Status'}</option>
              <option value="true">{language === 'ms' ? 'Aktif' : 'Active'}</option>
              <option value="false">{language === 'ms' ? 'Tidak Aktif' : 'Inactive'}</option>
            </select>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">
              {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
            </p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {language === 'ms' ? 'Tiada dokumen dijumpai' : 'No documents found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-green-900">{doc.title}</h3>
                      {doc.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {doc.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {doc.language === 'both' ? (language === 'ms' ? 'Kedua-dua' : 'Both') : doc.language.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(doc)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={language === 'ms' ? 'Edit' : 'Edit'}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={language === 'ms' ? 'Padam' : 'Delete'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{doc.content}</p>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-500">
                  {language === 'ms' ? 'Dikemaskini:' : 'Updated:'} {doc.updatedAt 
                    ? new Date(doc.updatedAt).toLocaleDateString()
                    : 'N/A'}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit/Create Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 sm:inset-8 lg:inset-16 z-50 overflow-y-auto"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-green-900">
                      {editingDoc 
                        ? (language === 'ms' ? 'Edit Dokumen' : 'Edit Document')
                        : (language === 'ms' ? 'Tambah Dokumen Baru' : 'Add New Document')}
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      title={language === 'ms' ? 'Tutup' : 'Close'}
                      aria-label={language === 'ms' ? 'Tutup modal' : 'Close modal'}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {language === 'ms' ? 'Tajuk' : 'Title'} *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={language === 'ms' ? 'Masukkan tajuk...' : 'Enter title...'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {language === 'ms' ? 'Kandungan' : 'Content'} *
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={10}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={language === 'ms' ? 'Masukkan kandungan...' : 'Enter content...'}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {language === 'ms' ? 'Kategori' : 'Category'}
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder={language === 'ms' ? 'cth: am' : 'e.g., general'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {language === 'ms' ? 'Bahasa' : 'Language'}
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'ms' | 'id' | 'both' })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          title={language === 'ms' ? 'Pilih bahasa' : 'Select language'}
                          aria-label={language === 'ms' ? 'Pilih bahasa' : 'Select language'}
                        >
                          <option value="both">{language === 'ms' ? 'Kedua-dua' : 'Both'}</option>
                          <option value="en">English</option>
                          <option value="ms">Bahasa Malaysia</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {language === 'ms' ? 'Tag (pisahkan dengan koma)' : 'Tags (comma-separated)'}
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={language === 'ms' ? 'cth: tanah, baja, tanaman' : 'e.g., soil, fertilizer, crop'}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                        {language === 'ms' ? 'Aktif' : 'Active'}
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {language === 'ms' ? 'Batal' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !formData.title.trim() || !formData.content.trim()}
                      className="px-6 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {language === 'ms' ? 'Menyimpan...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          {language === 'ms' ? 'Simpan' : 'Save'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
