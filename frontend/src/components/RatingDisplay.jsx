import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../i18n/formatters';

const RatingDisplay = ({ 
  rating,
  averageRating = 0, 
  reviewCount = 0, 
  reviews = [], 
  showReviews = true,
  showValue = true,
  compact = false,
  size = 'md',
  onEditReview = null
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  // Use rating prop if provided, otherwise fall back to averageRating
  const displayRating = rating !== undefined ? rating : averageRating;
  const [showAllReviews, setShowAllReviews] = useState(false);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  // Render star icons based on rating
  const renderStars = (rating, starSize = 'text-xl') => {
    // Determine star size based on size prop
    let starSizeClass = starSize;
    if (size === 'sm') starSizeClass = 'text-sm';
    else if (size === 'md') starSizeClass = 'text-base';
    else if (size === 'lg') starSizeClass = 'text-xl';
    
    // Determine star color based on rating value
    const getStarColor = (rating) => {
      if (rating >= 4.0) return 'text-green-500';
      else if (rating >= 3.0) return 'text-yellow-400';
      else return 'text-red-500';
    };
    
    const starColor = getStarColor(rating);
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className={`${starSizeClass} ${starColor}`}>★</span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className={`${starSizeClass} ${starColor}`}>★</span>
        );
      } else {
        stars.push(
          <span key={i} className={`${starSizeClass} text-gray-300`}>★</span>
        );
      }
    }
    return stars;
  };

  const isUserReview = (review) => {
    return user && review.farmer_name === user.name;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {renderStars(displayRating)}
        </div>
        {showValue && reviewCount > 0 ? (
          <span className="text-sm font-semibold text-gray-800">
            {displayRating.toFixed(1)} <span className="text-gray-500 font-normal">({reviewCount})</span>
          </span>
        ) : showValue ? (
          <span className="text-sm text-gray-400">
            0.0 <span className="text-gray-400">(0)</span>
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Average Rating Summary */}
      <div className="flex items-center gap-3">
        <div className="flex">
          {renderStars(displayRating)}
        </div>
        <div className="text-sm">
          {reviewCount > 0 ? (
            <>
              <span className="font-semibold text-gray-800">{displayRating.toFixed(1)}</span>
              <span className="text-gray-600"> ({reviewCount} {reviewCount === 1 ? t('rating.review') : t('rating.reviews')})</span>
            </>
          ) : (
            <span className="text-gray-400">0.0 (0 {t('rating.reviews')})</span>
          )}
        </div>
      </div>

      {/* Individual Reviews */}
      {showReviews && reviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">{t('rating.reviews')}</h4>
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-3 last:border-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isUserReview(review) ? 'text-blue-600' : 'text-gray-800'}`}>
                    {review.farmer_name}
                    {isUserReview(review) && <span className="text-xs text-blue-500 ml-1">({t('rating.you')})</span>}
                  </span>
                  <div className="flex">
                    {renderStars(review.rating, 'text-sm')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isUserReview(review) && onEditReview && (
                    <button
                      onClick={() => onEditReview(review)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      title={t('rating.edit')}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t('rating.edit')}
                    </button>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
              {review.review_text && (
                <p className="text-sm text-gray-600 mt-1">{review.review_text}</p>
              )}
            </div>
          ))}
          
          {reviews.length > 5 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {showAllReviews ? t('rating.showLess') : t('rating.showAll', { count: reviews.length })}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

RatingDisplay.propTypes = {
  rating: PropTypes.number,
  averageRating: PropTypes.number,
  reviewCount: PropTypes.number,
  reviews: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    farmer_name: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    review_text: PropTypes.string,
    created_at: PropTypes.string.isRequired
  })),
  showReviews: PropTypes.bool,
  showValue: PropTypes.bool,
  compact: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onEditReview: PropTypes.func
};

export default RatingDisplay;
