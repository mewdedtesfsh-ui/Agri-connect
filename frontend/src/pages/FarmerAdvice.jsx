import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import FarmerLayout from '../components/FarmerLayout';
import InlineRating from '../components/InlineRating';
import RatingDisplay from '../components/RatingDisplay';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const FarmerAdvice = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const articleRefs = useRef({});
  const [expandedArticles, setExpandedArticles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    // Scroll to specific article if article ID is in URL
    const articleId = searchParams.get('article');
    if (articleId && articleRefs.current[articleId]) {
      setTimeout(() => {
        articleRefs.current[articleId].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Add highlight effect
        articleRefs.current[articleId].classList.add('ring-4', 'ring-green-400', 'ring-opacity-50');
        setTimeout(() => {
          articleRefs.current[articleId]?.classList.remove('ring-4', 'ring-green-400', 'ring-opacity-50');
        }, 3000);
      }, 500);
    }
  }, [articles, searchParams]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/farmers/advice');
      const articlesData = response.data;
      
      // Fetch ratings for each article
      const articlesWithRatings = await Promise.all(
        articlesData.map(async (article) => {
          try {
            const ratingsRes = await axios.get(`/api/ratings/article/${article.id}`);
            const userRatingRes = await axios.get(`/api/ratings/article/${article.id}/user`);
            return {
              ...article,
              averageRating: ratingsRes.data.averageRating || 0,
              reviewCount: ratingsRes.data.reviewCount || 0,
              reviews: ratingsRes.data.reviews || [],
              userRating: userRatingRes.data.rating || null,
              userReview: userRatingRes.data.review || null
            };
          } catch (error) {
            // If ratings fetch fails, return article without ratings
            return {
              ...article,
              averageRating: 0,
              reviewCount: 0,
              reviews: [],
              userRating: null,
              userReview: null
            };
          }
        })
      );
      
      setArticles(articlesWithRatings);
    } catch (error) {
      console.error('Error fetching articles:', error);
      if (toast) {
        toast.error(t('messages.errorOccurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleArticleExpansion = (articleId) => {
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const handleRatingSubmit = async (articleId, rating, review) => {
    try {
      // Check if user already has a rating for this article
      const article = articles.find(a => a.id === articleId);
      const hasExistingRating = article && article.userRating;
      
      if (hasExistingRating) {
        // Update existing rating
        await axios.put(`/api/ratings/article/${articleId}/user`, {
          rating,
          review
        });
        
        if (toast) {
          toast.success(t('messages.updateSuccess'));
        }
      } else {
        // Create new rating
        await axios.post('/api/ratings', {
          articleId,
          rating,
          review
        });
        
        if (toast) {
          toast.success(t('messages.submitSuccess'));
        }
      }
      
      // Refresh articles to get updated ratings
      fetchArticles();
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (toast) {
        toast.error(error.response?.data?.message || t('messages.errorOccurred'));
      }
    }
  };

  const handleEditReview = (review, articleId) => {
    setEditingReview({ ...review, articleId });
    // Find the article and trigger edit mode in InlineRating
    const article = articles.find(a => a.id === articleId);
    if (article) {
      // We'll need to trigger the edit mode in the InlineRating component
      // This will be handled by updating the article's userRating and userReview
      // and then triggering the edit mode
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMedia = (article) => {
    if (!article.media_url || article.media_type === 'none') return null;

    const mediaUrl = article.media_url;

    if (article.media_type === 'image') {
      return (
        <div className="mt-6 space-y-3">
          <div className="relative inline-block">
            <img 
              src={mediaUrl} 
              alt={article.title} 
              className="max-w-md w-full rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
          <button
            onClick={() => handleDownload(mediaUrl, `${article.title}-image.jpg`)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('advice.downloadImage')}
          </button>
        </div>
      );
    } else if (article.media_type === 'video') {
      return (
        <div className="mt-6 space-y-3">
          <div className="relative">
            <video controls className="max-w-md w-full rounded-lg border border-gray-200 shadow-sm">
              <source src={mediaUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
          <button
            onClick={() => handleDownload(mediaUrl, `${article.title}-video.mp4`)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('advice.downloadVideo')}
          </button>
        </div>
      );
    } else if (article.media_type === 'audio') {
      return (
        <div className="mt-6 space-y-3">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <audio controls className="w-full max-w-md">
              <source src={mediaUrl} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
          </div>
          <button
            onClick={() => handleDownload(mediaUrl, `${article.title}-audio.mp3`)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('advice.downloadAudio')}
          </button>
        </div>
      );
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (article.category && article.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">{t('common.loading')}</div>
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('advice.expertAdvice')}</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('advice.expertAdviceDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {t('advice.searchArticles')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={t('advice.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  {t('advice.filterByCategory')}
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
          </div>

        {/* Articles */}
        <div className="max-w-4xl space-y-6">
            {filteredArticles.map((article) => (
              <article 
                key={article.id} 
                ref={el => articleRefs.current[article.id] = el}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
              >
                {/* Article Header */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {article.category && (
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded mb-3">
                          {article.category}
                        </span>
                      )}
                      <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{article.title}</h2>
                    </div>
                    
                    {/* Author Info */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                        {article.author_photo ? (
                          <img 
                            src={`/api/uploads/profiles/${article.author_photo}`} 
                            alt={article.author_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{article.author_name}</p>
                        <p className="text-xs text-gray-500">{new Date(article.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="px-6 py-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{article.content}</p>
                  {renderMedia(article)}
                </div>

                {/* Rating & Interaction Bar */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <InlineRating
                    averageRating={article.averageRating}
                    reviewCount={article.reviewCount}
                    userRating={article.userRating}
                    userReview={article.userReview}
                    onSubmit={(rating, review) => handleRatingSubmit(article.id, rating, review)}
                    onToggleReviews={() => toggleArticleExpansion(article.id)}
                  />
                </div>

                {/* Expandable Reviews Section */}
                {expandedArticles[article.id] && article.reviews && article.reviews.length > 0 && (
                  <div className="px-6 py-6 bg-white border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {t('advice.reviews')} ({article.reviewCount})
                      </h3>
                      <button
                        onClick={() => toggleArticleExpansion(article.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <RatingDisplay 
                      averageRating={article.averageRating}
                      reviewCount={article.reviewCount}
                      reviews={article.reviews}
                      showReviews={true}
                      compact={false}
                      onEditReview={(review) => handleEditReview(review, article.id)}
                    />
                  </div>
                )}
              </article>
            ))}

            {filteredArticles.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 max-w-2xl">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || selectedCategory !== 'all' 
                      ? t('advice.noMatchingArticles') 
                      : t('advice.noArticles')}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedCategory !== 'all' 
                      ? t('advice.adjustSearch') 
                      : t('advice.checkBackLater')}
                  </p>
                </div>
              </div>
            )}
        </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default FarmerAdvice;
