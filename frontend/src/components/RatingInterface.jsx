import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const RatingInterface = ({ articleId, currentRating = null, currentReview = null, onRatingSubmit, disabled = false }) => {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(currentReview || '');
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentRating) setRating(currentRating);
    if (currentReview) { setReview(currentReview); setShowReviewInput(true); }
  }, [currentRating, currentReview]);

  const handleStarClick = (value) => { if (disabled) return; setRating(value); setError(''); };

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating'); return; }
    if (review.trim().length > 1000) { setError('Review must be 1000 characters or less'); return; }
    setIsSubmitting(true); setError('');
    try { await onRatingSubmit(rating, review.trim()); setShowReviewInput(false); } 
    catch (err) { setError(err.message || 'Failed to submit rating'); } 
    finally { setIsSubmitting(false); }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoverRating || rating);
      stars.push(<button key={i} type="button" onClick={() => handleStarClick(i)} onMouseEnter={() => !disabled && setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} disabled={disabled} className={`text-2xl transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'} ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>);
    }
    return stars;
  };

  return (<div className="space-y-3"><div><label className="block text-sm font-medium text-gray-700 mb-2">{currentRating ? 'Your Rating' : 'Rate this advice'}</label><div className="flex items-center gap-1">{renderStars()}{rating > 0 && <span className="ml-2 text-sm text-gray-600">{rating} {rating === 1 ? 'star' : 'stars'}</span>}</div></div>{!showReviewInput && rating > 0 && <button onClick={() => setShowReviewInput(true)} className="text-sm text-green-600 hover:text-green-700 font-medium">+ Add a review (optional)</button>}{showReviewInput && <div><label className="block text-sm font-medium text-gray-700 mb-2">Your Review (optional)</label><textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Share your experience with this advice..." disabled={disabled || isSubmitting} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" rows={3} maxLength={1000} /><div className="flex justify-between items-center mt-1"><span className="text-xs text-gray-500">{review.length}/1000 characters</span><button onClick={() => { setShowReviewInput(false); setReview(''); }} className="text-xs text-gray-500 hover:text-gray-700">Remove review</button></div></div>}{error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}{rating > 0 && <button onClick={handleSubmit} disabled={disabled || isSubmitting} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${disabled || isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'}`}>{isSubmitting ? 'Submitting...' : currentRating ? 'Update Rating' : 'Submit Rating'}</button>}</div>);
};

RatingInterface.propTypes = { articleId: PropTypes.number.isRequired, currentRating: PropTypes.number, currentReview: PropTypes.string, onRatingSubmit: PropTypes.func.isRequired, disabled: PropTypes.bool };

export default RatingInterface;
