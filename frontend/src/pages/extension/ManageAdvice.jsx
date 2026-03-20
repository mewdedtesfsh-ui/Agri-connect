import { useState, useEffect } from 'react';
import axios from 'axios';
import ExtensionLayout from '../../components/ExtensionLayout';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useTranslation } from 'react-i18next';

const ManageAdvice = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/extension/advice');
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setRemoveMedia(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ url: reader.result, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setRemoveMedia(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      
      if (mediaFile) {
        formDataToSend.append('media', mediaFile);
      }
      
      if (removeMedia) {
        formDataToSend.append('removeMedia', 'true');
      }

      if (editingArticle) {
        await axios.patch(`/api/extension/advice/${editingArticle.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t('messages.updateSuccess'));
      } else {
        await axios.post('/api/extension/advice', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t('messages.publishSuccess'));
      }
      
      fetchArticles();
      setShowForm(false);
      setEditingArticle(null);
      setFormData({ title: '', content: '', category: '' });
      setMediaFile(null);
      setMediaPreview(null);
      setRemoveMedia(false);
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.errorOccurred'));
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({ title: article.title, content: article.content, category: article.category });
    setShowForm(true);
    setMediaFile(null);
    setRemoveMedia(false);
    
    // Set preview for existing media
    if (article.media_url && article.media_type !== 'none') {
      setMediaPreview({ 
        url: article.media_url, 
        type: article.media_type === 'image' ? 'image/jpeg' : 
              article.media_type === 'video' ? 'video/mp4' : 'audio/mpeg'
      });
    } else {
      setMediaPreview(null);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: t('advice.deleteArticle'),
      message: t('advice.deleteArticleConfirm'),
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/extension/advice/${id}`);
          setArticles(articles.filter(a => a.id !== id));
          toast.success(t('messages.deleteSuccess'));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.error || t('messages.errorOccurred'));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const renderMediaPreview = () => {
    if (!mediaPreview) return null;

    if (mediaPreview.type.startsWith('image/')) {
      return (
        <div className="mt-4">
          <img src={mediaPreview.url} alt="Preview" className="max-w-md rounded-lg shadow-md" />
        </div>
      );
    } else if (mediaPreview.type.startsWith('video/')) {
      return (
        <div className="mt-4">
          <video controls className="max-w-md rounded-lg shadow-md">
            <source src={mediaPreview.url} type={mediaPreview.type} />
          </video>
        </div>
      );
    } else if (mediaPreview.type.startsWith('audio/')) {
      return (
        <div className="mt-4">
          <audio controls className="w-full max-w-md">
            <source src={mediaPreview.url} type={mediaPreview.type} />
          </audio>
        </div>
      );
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (article.category && article.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  if (loading) {
    return (
      <ExtensionLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </ExtensionLayout>
    );
  }

  return (
    <ExtensionLayout>
      <div className="px-8 py-8">
        <div className="max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('extension.manageAdviceArticles')}</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingArticle(null);
                setFormData({ title: '', content: '', category: '' });
                setMediaFile(null);
                setMediaPreview(null);
                setRemoveMedia(false);
              }
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {showForm ? t('common.cancel') : t('extension.newArticle')}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingArticle ? t('extension.editArticle') : t('extension.newArticle')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">{t('advice.title')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">{t('advice.category')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={t('advice.categoryPlaceholder')}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">{t('advice.content')}</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="10"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">{t('advice.media')}</label>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleMediaChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">{t('advice.mediaSupported')}</p>
                
                {renderMediaPreview()}
                
                {mediaPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    {t('advice.removeMedia')}
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {editingArticle ? t('common.update') : t('common.publish')}
              </button>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">{t('advice.searchArticles')}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('advice.searchPlaceholder2')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">{t('advice.filterByCategory')}</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t('advice.allCategories')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 font-medium">
                {searchTerm || selectedCategory !== 'all' 
                  ? t('advice.noMatchingArticles') 
                  : t('advice.noArticlesFound')}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || selectedCategory !== 'all' 
                  ? t('advice.adjustSearchFilter') 
                  : t('advice.createFirstArticle')}
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Article Header */}
              <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{article.title}</h2>
                    {article.category && (
                      <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Article Content */}
              <div className="px-6 py-5">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{article.content}</p>
              </div>
              
              {/* Article Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('advice.publishedOn')} {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </article>
          )))}
        </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </ExtensionLayout>
  );
};

export default ManageAdvice;
