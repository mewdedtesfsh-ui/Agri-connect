import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const InlineRating = ({ 
  averageRating = 0, 
  reviewCount = 0,
  userRating = null,
  userReview = null,
  onSubmit,
  onToggleReviews
}) => {
  const { t } = useTranslation();
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(userRating || 0);
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [review, setReview] = useState(userReview || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    setShowReviewBox(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowReviewBox(true);
    setSelectedRating(userRating || 0);
    setReview(userReview || '');
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating, review.trim());
      setShowReviewBox(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowReviewBox(false);
    setIsEditing(false);
    setSelectedRating(userRating || 0);
    setReview(userReview || '');
  };

  const getStarColor = (rating) => {
    if (rating === 0) return 'text-gray-300';
    if (rating <= 2) return 'text-red-500';
    if (rating === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTextColor = (rating) => {
    if (rating <= 2) return 'text-red-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || selectedRating || averageRating;
    const starColor = getStarColor(displayRating);
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayRating;
      const isInteractive = !showReviewBox;
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => isInteractive && handleStarClick(i)}
          onMouseEnter={() => isInteractive && setHoverRating(i)}
          onMouseLeave={() => isInteractive && setHoverRating(0)}
          disabled={showReviewBox}
          className={`text-lg transition-all ${
            isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${isFilled ? starColor : 'text-gray-300'}`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-4">
      {/* Stars */}
      <div className="flex items-center gap-1">
        <div className="flex">
          {renderStars()}
        </div>
        {!showReviewBox && reviewCount > 0 && (
          <span className={`text-sm font-semibold ml-1 ${getTextColor(averageRating)}`}>
            {averageRating.toFixed(1)} <span className="text-gray-500 font-normal">({reviewCount})</span>
          </span>
        )}
      </div>

      {/* User's Rating Display & Edit Button */}
      {!showReviewBox && userRating && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {t('rating.yourRatingLabel')}: <span className={`font-semibold ${getTextColor(userRating)}`}>{userRating} ★</span>
            {userReview && <span className="ml-1">{t('rating.withReview')}</span>}
          </span>
          <button
            onClick={handleEditClick}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('rating.edit')}
          </button>
        </div>
      )}

      {/* Reviews Button */}
      {!showReviewBox && reviewCount > 0 && (
        <button
          onClick={onToggleReviews}
          className="text-xs text-gray-600 hover:text-green-600 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {t('rating.reviews')}
        </button>
      )}

      {/* Review Box - Appears after clicking stars or edit */}
      {showReviewBox && (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={isEditing ? t('rating.updateReview') : t('rating.writeReview')}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            maxLength={1000}
            disabled={isSubmitting}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedRating === 0}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? t('rating.saving') : (isEditing ? t('rating.update') : t('rating.submit'))}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
          >
            {t('rating.cancel')}
          </button>
        </div>
      )}
    </div>
  );
};

InlineRating.propTypes = {
  averageRating: PropTypes.number,
  reviewCount: PropTypes.number,
  userRating: PropTypes.number,
  userReview: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onToggleReviews: PropTypes.func.isRequired
};

export default InlineRating;
