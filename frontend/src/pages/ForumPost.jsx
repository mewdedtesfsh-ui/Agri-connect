import { useState, useEffect } from 'react';
import axios from 'axios';
import FarmerLayout from '../components/FarmerLayout';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const ForumPost = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/forum/posts/${id}`);
      setPost(response.data.post);
      setComments(response.data.comments);
      setLikes(response.data.likes);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/forum/comments', {
        post_id: id,
        comment
      });
      setComment('');
      fetchPost();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(t('messages.failedToPostComment'));
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/forum/posts/${id}/like`);
      setPost({ ...post, likes_count: response.data.likes_count });
      if (likes.includes(user.id)) {
        setLikes(likes.filter(userId => userId !== user.id));
      } else {
        setLikes([...likes, user.id]);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
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

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </FarmerLayout>
    );
  }

  if (!post) {
    return (
      <FarmerLayout>
        <div className="container mx-auto px-4 py-8">
          <p>{t('forum.postNotFound')}</p>
        </div>
      </FarmerLayout>
    );
  }

  const isLiked = likes.includes(user.id);

  return (
    <FarmerLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/forum')}
          className="mb-6 text-green-600 hover:text-green-700 flex items-center gap-2"
        >
          ← {t('forum.backToForum')}
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.is_pinned && (
              <span className="text-yellow-500 text-2xl">📌</span>
            )}
            <h1 className="text-3xl font-bold">{post.title}</h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <span className="font-medium">{post.author_name}</span>
            {getRoleBadge(post.author_role)}
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isLiked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {post.likes_count} {post.likes_count === 1 ? t('forum.like') : t('forum.likes')}
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l.917-3.917A6.982 6.982 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {comments.length} {comments.length === 1 ? t('forum.comment') : t('forum.comments')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t('forum.addComment')}</h2>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              rows="3"
              placeholder={t('forum.writeReply')}
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {t('forum.postComment')}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t('forum.comments')}</h2>
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="font-medium">{comment.author_name}</span>
                {getRoleBadge(comment.author_role)}
                <span>•</span>
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              {t('forum.noComments')}
            </div>
          )}
        </div>
      </div>
    </FarmerLayout>
  );
};

export default ForumPost;