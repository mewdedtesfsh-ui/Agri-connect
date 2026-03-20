import { useState, useEffect } from 'react';
import axios from 'axios';
import FarmerLayout from '../components/FarmerLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../components/ConfirmDialog';

const Forum = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/forum/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/forum/posts', formData);
      setShowForm(false);
      setFormData({ title: '', content: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(t('messages.failedToCreatePost'));
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/forum/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: response.data.likes_count }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handlePin = async (postId, isPinned) => {
    try {
      await axios.patch(`/api/forum/posts/${postId}/pin`, { is_pinned: !isPinned });
      fetchPosts();
    } catch (error) {
      console.error('Error pinning post:', error);
      toast.error(t('messages.failedToPinPost'));
    }
  };

  const handleDelete = async (postId) => {
    setConfirmDialog({
      isOpen: true,
      title: t('forum.deletePost'),
      message: t('forum.confirmDeletePost'),
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/forum/posts/${postId}`);
          fetchPosts();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Error deleting post:', error);
          toast.error(t('messages.failedToDeletePost'));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      farmer: 'bg-green-100 text-green-800',
      extension_officer: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800'
    };
    const labels = {
      farmer: t('dynamic.roles.farmer'),
      extension_officer: t('dynamic.roles.extension_officer'),
      admin: t('dynamic.roles.admin')
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const canModerate = ['extension_officer', 'admin'].includes(user?.role);

  const filteredPosts = posts.filter(post => {
    if (searchTerm === '') return true;
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.author_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('forum.title')}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            {showForm ? t('common.cancel') : t('forum.newPost')}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t('common.search') + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{t('forum.createPost')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('forum.postTitle')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder={t('forum.postTitle')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('forum.postContent')}</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="5"
                  placeholder={t('forum.postContent')}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                {t('common.submit')}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.is_pinned && (
                      <span className="text-yellow-500">📌</span>
                    )}
                    <h3 
                      className="text-xl font-bold cursor-pointer hover:text-green-600"
                      onClick={() => navigate(`/forum/${post.id}`)}
                    >
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>{post.author_name}</span>
                    {getRoleBadge(post.author_role)}
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 hover:text-blue-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {post.likes_count}
                </button>
                <button
                  onClick={() => navigate(`/forum/${post.id}`)}
                  className="flex items-center gap-1 hover:text-blue-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l.917-3.917A6.982 6.982 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  {post.comments_count}
                </button>
                
                {canModerate && (
                  <button
                    onClick={() => handlePin(post.id, post.is_pinned)}
                    className="flex items-center gap-1 hover:text-yellow-600"
                  >
                    {post.is_pinned ? t('forum.unpin') : t('forum.pin')}
                  </button>
                )}
                
                {(user.id === post.user_id || canModerate) && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex items-center gap-1 hover:text-red-600 ml-auto"
                  >
                    {t('common.delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm ? t('forum.noSearchResults') : t('forum.noPosts')}
            </p>
            <p className="text-gray-400">
              {searchTerm ? t('forum.tryDifferentSearch') : t('forum.beFirstToPost')}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </FarmerLayout>
  );
};

export default Forum;