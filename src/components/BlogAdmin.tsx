'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Save, 
  XCircle,
  CheckCircle,
  FileText,
  Tag,
  Calendar,
  User,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  titleMs: string;
  excerpt: string;
  excerptMs: string;
  content: string;
  contentMs: string;
  author: string;
  authorMs: string;
  date: string;
  readTime: string;
  readTimeMs: string;
  category: string;
  categoryMs: string;
  tags: string[];
  tagsMs: string[];
  image: string;
  featured?: boolean;
  published?: boolean;
}

export default function BlogAdmin() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('en');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPublished, setFilterPublished] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleMs: '',
    excerpt: '',
    excerptMs: '',
    content: '',
    contentMs: '',
    author: '',
    authorMs: '',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    readTimeMs: '5 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: '',
    tagsMs: '',
    image: '/images/blog/default.jpg',
    featured: false,
    published: true,
  });
  const [saving, setSaving] = useState(false);

  const { t } = useTranslation(language);

  useEffect(() => {
    const lang = getCurrentLanguage();
    setLanguage(lang);
    checkAdminStatus();
    loadPosts();
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

  const loadPosts = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/blog/admin/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized: Admin access required');
        }
        throw new Error('Failed to load blog posts');
      }
      
      const result = await response.json();
      setPosts(result.posts || []);
    } catch (err: any) {
      console.error('Error loading blog posts:', err);
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPosts();
    }
  }, [filterCategory, filterPublished, isAdmin]);

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title || '',
        titleMs: post.titleMs || '',
        excerpt: post.excerpt || '',
        excerptMs: post.excerptMs || '',
        content: post.content || '',
        contentMs: post.contentMs || '',
        author: post.author || '',
        authorMs: post.authorMs || '',
        date: post.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        readTime: post.readTime || '5 min read',
        readTimeMs: post.readTimeMs || '5 minit bacaan',
        category: post.category || 'Technology',
        categoryMs: post.categoryMs || 'Teknologi',
        tags: post.tags?.join(', ') || '',
        tagsMs: post.tagsMs?.join(', ') || '',
        image: post.image || '/images/blog/default.jpg',
        featured: post.featured || false,
        published: post.published !== false,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        titleMs: '',
        excerpt: '',
        excerptMs: '',
        content: '',
        contentMs: '',
        author: '',
        authorMs: '',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        readTimeMs: '5 minit bacaan',
        category: 'Technology',
        categoryMs: 'Teknologi',
        tags: '',
        tagsMs: '',
        image: '/images/blog/default.jpg',
        featured: false,
        published: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    
    if (!formData.title.trim() || !formData.titleMs.trim() || 
        !formData.excerpt.trim() || !formData.excerptMs.trim() ||
        !formData.content.trim() || !formData.contentMs.trim()) {
      setError('All title, excerpt, and content fields (both English and Malay) are required');
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
      const tagsMsArray = formData.tagsMs
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      
      const payload = {
        title: formData.title.trim(),
        titleMs: formData.titleMs.trim(),
        excerpt: formData.excerpt.trim(),
        excerptMs: formData.excerptMs.trim(),
        content: formData.content.trim(),
        contentMs: formData.contentMs.trim(),
        author: formData.author.trim() || 'CropDrive Team',
        authorMs: formData.authorMs.trim() || 'Pasukan CropDrive',
        date: formData.date,
        readTime: formData.readTime.trim(),
        readTimeMs: formData.readTimeMs.trim(),
        category: formData.category.trim(),
        categoryMs: formData.categoryMs.trim(),
        tags: tagsArray,
        tagsMs: tagsMsArray,
        image: formData.image.trim(),
        featured: formData.featured,
        published: formData.published,
      };
      
      const url = editingPost
        ? `/api/blog/admin/posts/${editingPost.id}`
        : '/api/blog/admin/posts';
      
      const method = editingPost ? 'PUT' : 'POST';
      
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
        throw new Error(result.error || 'Failed to save blog post');
      }
      
      handleCloseModal();
      loadPosts();
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      setError(err.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!auth.currentUser || !confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/blog/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }
      
      loadPosts();
    } catch (err: any) {
      console.error('Error deleting blog post:', err);
      setError(err.message || 'Failed to delete blog post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = post.title?.toLowerCase().includes(query) || 
                          post.titleMs?.toLowerCase().includes(query);
      const matchesExcerpt = post.excerpt?.toLowerCase().includes(query) || 
                            post.excerptMs?.toLowerCase().includes(query);
      const matchesTags = post.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                         post.tagsMs?.some(tag => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesExcerpt && !matchesTags) return false;
    }
    if (filterCategory && post.category !== filterCategory) return false;
    if (filterPublished === 'published' && post.published !== true) return false;
    if (filterPublished === 'draft' && post.published !== false) return false;
    return true;
  });

  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean))).sort();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'ms' ? 'Log Masuk Diperlukan' : 'Login Required'}
            </h2>
            <p className="text-gray-600">
              {language === 'ms' 
                ? 'Sila log masuk untuk mengakses panel pentadbir.'
                : 'Please login to access the admin panel.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                {language === 'ms' ? 'Pengurusan Blog' : 'Blog Management'}
              </h1>
              <p className="text-gray-600">
                {language === 'ms' 
                  ? 'Urus artikel blog untuk CropDrive'
                  : 'Manage blog articles for CropDrive'}
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {language === 'ms' ? 'Tambah Artikel' : 'Add Post'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
              aria-label={language === 'ms' ? 'Tutup' : 'Close'}
              title={language === 'ms' ? 'Tutup' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                placeholder={language === 'ms' ? 'Cari artikel...' : 'Search posts...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label={language === 'ms' ? 'Cari artikel' : 'Search posts'}
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label={language === 'ms' ? 'Filter mengikut kategori' : 'Filter by category'}
              title={language === 'ms' ? 'Filter mengikut kategori' : 'Filter by category'}
            >
              <option value="">{language === 'ms' ? 'Semua Kategori' : 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Published Filter */}
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label={language === 'ms' ? 'Filter mengikut status' : 'Filter by status'}
              title={language === 'ms' ? 'Filter mengikut status' : 'Filter by status'}
            >
              <option value="">{language === 'ms' ? 'Semua Status' : 'All Status'}</option>
              <option value="published">{language === 'ms' ? 'Diterbitkan' : 'Published'}</option>
              <option value="draft">{language === 'ms' ? 'Draf' : 'Draft'}</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{language === 'ms' ? 'Memuatkan...' : 'Loading...'}</p>
          </div>
        ) : (
          /* Posts List */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {language === 'ms' ? 'Tiada artikel ditemui' : 'No posts found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 flex-1">
                            {language === 'ms' ? post.titleMs : post.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {post.featured && (
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            )}
                            {post.published ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {language === 'ms' ? post.excerptMs : post.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {language === 'ms' ? post.authorMs : post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {post.image}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(post)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={language === 'ms' ? 'Edit' : 'Edit'}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={language === 'ms' ? 'Padam' : 'Delete'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              key="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-800 to-green-700 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingPost 
                      ? (language === 'ms' ? 'Edit Artikel' : 'Edit Post')
                      : (language === 'ms' ? 'Tambah Artikel Baru' : 'Add New Post')}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                    title={language === 'ms' ? 'Tutup' : 'Close'}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* English Section */}
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">English Content</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter title..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
                          <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter excerpt..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                          <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter full content..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                          <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Author name..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Malay Section */}
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Malay Content</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk *</label>
                          <input
                            type="text"
                            value={formData.titleMs}
                            onChange={(e) => setFormData({ ...formData, titleMs: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Masukkan tajuk..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Penerangan Ringkas *</label>
                          <textarea
                            value={formData.excerptMs}
                            onChange={(e) => setFormData({ ...formData, excerptMs: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Masukkan penerangan ringkas..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kandungan *</label>
                          <textarea
                            value={formData.contentMs}
                            onChange={(e) => setFormData({ ...formData, contentMs: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Masukkan kandungan penuh..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
                          <input
                            type="text"
                            value={formData.authorMs}
                            onChange={(e) => setFormData({ ...formData, authorMs: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Nama pengarang..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="post-date" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          id="post-date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          aria-label={language === 'ms' ? 'Tarikh' : 'Date'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                        <input
                          type="text"
                          value={formData.readTime}
                          onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="5 min read"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Read Time (Malay)</label>
                        <input
                          type="text"
                          value={formData.readTimeMs}
                          onChange={(e) => setFormData({ ...formData, readTimeMs: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="5 minit bacaan"
                        />
                      </div>
                      <div>
                        <label htmlFor="post-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          id="post-category"
                          value={formData.category}
                          onChange={(e) => {
                            const categoryMap: Record<string, string> = {
                              'Technology': 'Teknologi',
                              'Agriculture': 'Pertanian',
                              'Sustainability': 'Kelestarian',
                              'Farming': 'Pertanian',
                              'Innovation': 'Inovasi',
                            };
                            setFormData({ 
                              ...formData, 
                              category: e.target.value,
                              categoryMs: categoryMap[e.target.value] || formData.categoryMs
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="Technology">Technology</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Sustainability">Sustainability</option>
                          <option value="Farming">Farming</option>
                          <option value="Innovation">Innovation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category (Malay)</label>
                        <input
                          type="text"
                          value={formData.categoryMs}
                          onChange={(e) => setFormData({ ...formData, categoryMs: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Teknologi"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image Path</label>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="/images/blog/image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Tag1, Tag2, Tag3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Malay, comma-separated)</label>
                        <input
                          type="text"
                          value={formData.tagsMs}
                          onChange={(e) => setFormData({ ...formData, tagsMs: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Tag1, Tag2, Tag3"
                        />
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'ms' ? 'Artikel Pilihan' : 'Featured Post'}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.published}
                          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'ms' ? 'Diterbitkan' : 'Published'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-6 flex items-center justify-end gap-4">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {language === 'ms' ? 'Batal' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {language === 'ms' ? 'Menyimpan...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {language === 'ms' ? 'Simpan' : 'Save'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
