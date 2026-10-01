import React, { useState, useEffect, useMemo } from 'react';
import { Star, CheckCircle2, ThumbsUp, MessageSquare, PenLine, X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { ProductReview, CreateReviewPayload } from '../types';
import { getProductReviews, saveNewReview, toggleHelpfulReview, hasUserVotedHelpful } from '../utils/reviewStorage';
import { api } from '../services/api';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  weight: string;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: 'Exceptional Quality & Freshness',
  4: 'Great Crunch & Texture',
  3: 'Good Everyday Quality',
  2: 'Fair · Average Experience',
  1: 'Needs Improvement',
};

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  weight,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formVerified, setFormVerified] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load reviews on mount and when productId changes
  useEffect(() => {
    // 1. Immediately read from localStorage for instant, offline-first rendering
    const local = getProductReviews(productId);
    setReviews(local);

    // 2. Fetch from backend API to ensure server synchronization
    api.getReviews(productId)
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge server data with any existing client additions
          const serverMapped: ProductReview[] = res.data.map((item) => ({
            id: item._id || item.id,
            productId: item.productId,
            userName: item.userName,
            location: item.location || 'India',
            rating: item.rating,
            title: item.title,
            comment: item.comment,
            verifiedPurchase: item.verifiedPurchase !== false,
            helpfulCount: item.helpfulCount || 0,
            date: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Recent',
            createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
          }));

          // Deduplicate by id or title+userName
          setReviews((prev) => {
            const map = new Map<string, ProductReview>();
            serverMapped.forEach((r) => map.set(r.id, r));
            prev.forEach((r) => map.set(r.id, r));
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => {
        console.warn('Backend review fetch failed, relying on local storage:', err);
      });
  }, [productId]);

  // Rating Statistics Calculations
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        average: 5.0,
        total: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendedPercent: 100,
      };
    }

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    let positiveCount = 0;

    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
      sum += r.rating;
      if (r.rating >= 4) positiveCount++;
    });

    const average = Number((sum / total).toFixed(1));
    const percentages: Record<number, number> = {
      5: Math.round(((counts[5] || 0) / total) * 100),
      4: Math.round(((counts[4] || 0) / total) * 100),
      3: Math.round(((counts[3] || 0) / total) * 100),
      2: Math.round(((counts[2] || 0) / total) * 100),
      1: Math.round(((counts[1] || 0) / total) * 100),
    };

    const recommendedPercent = Math.round((positiveCount / total) * 100);

    return {
      average,
      total,
      counts,
      percentages,
      recommendedPercent,
    };
  }, [reviews]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Star rating filter
    if (selectedRatingFilter !== 'all') {
      result = result.filter((r) => Math.round(r.rating) === selectedRatingFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          (r.location && r.location.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      return b.createdAt - a.createdAt; // 'recent'
    });

    return result;
  }, [reviews, selectedRatingFilter, sortBy, searchQuery]);

  // Form Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formRating || formRating < 1 || formRating > 5) {
      errors.rating = 'Please choose a rating between 1 and 5 stars.';
    }
    if (!formName.trim()) {
      errors.name = 'Please provide your full name.';
    }
    if (!formTitle.trim()) {
      errors.title = 'Please enter a brief headline for your review.';
    }
    if (!formComment.trim() || formComment.trim().length < 15) {
      errors.comment = 'Please provide at least 15 characters describing your tasting experience.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const payload: CreateReviewPayload = {
      productId,
      userName: formName.trim(),
      location: formLocation.trim() || 'Verified Buyer',
      rating: formRating,
      title: formTitle.trim(),
      comment: formComment.trim(),
      verifiedPurchase: formVerified,
    };

    try {
      // 1. Save to local storage for immediate persistence
      const createdReview = saveNewReview(payload);
      setReviews((prev) => [createdReview, ...prev]);

      // 2. Dispatch to backend API
      await api.submitReview(payload);

      // Reset form
      setFormTitle('');
      setFormComment('');
      setFormRating(5);
      setSubmitSuccess(true);
      setIsFormOpen(false);

      // Select 'all' filter so the user immediately sees their review
      setSelectedRatingFilter('all');
      setSortBy('recent');

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error('Failed submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle helpful status for a review
  const handleToggleHelpful = (reviewId: string) => {
    const { helpfulCount } = toggleHelpfulReview(reviewId);
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount } : r))
    );
  };

  return (
    <section id="reviews-section" className="py-16 sm:py-24 bg-[#FAF7F2] border-t border-[#E5DAC6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E5DAC6] gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[1.5px] bg-[#C59B27]" />
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                AUTHENTIC EXPERIENCES · VERIFIED TASTING NOTES
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold text-[#142B1A] leading-tight">
              Customer Reviews &amp; Ratings
            </h2>
            <p className="mt-2 text-sm text-[#4E6152] font-sans-brand max-w-2xl">
              Honest impressions from mindful snackers and culinary connoisseurs enjoying {productName} {weight}.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen((prev) => !prev);
                setSubmitSuccess(false);
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#142B1A] text-[#FAF7F2] hover:bg-[#234A30] font-bold text-xs uppercase tracking-[0.18em] font-sans-brand transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <PenLine size={15} className="text-[#E5C778]" />
              <span>{isFormOpen ? 'CLOSE REVIEW FORM' : 'WRITE A REVIEW'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#EBF7EE] border border-[#2A6E3B]/30 text-[#1E7535] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-[#1E7535] shrink-0" />
              <div>
                <p className="text-sm font-bold font-sans-brand">Thank you for your tasting notes!</p>
                <p className="text-xs text-[#2A6E3B]">Your review for {productName} {weight} has been published successfully.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="text-[#1E7535] hover:opacity-75 p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Write Review Collapsible Container */}
        {isFormOpen && (
          <div className="mb-14 rounded-3xl bg-white border border-[#DDD1BE] shadow-xl p-6 sm:p-10 transition-all">
            <div className="flex items-center justify-between pb-6 border-b border-[#F2ECE1] mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8C6D1F] font-sans-brand block">
                  SHARE YOUR THOUGHTS
                </span>
                <h3 className="text-2xl font-serif-brand font-bold text-[#142B1A] mt-1">
                  Write a Review for {productName} ({weight})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#DDD1BE] flex items-center justify-center text-[#142B1A] hover:bg-[#EBE2D2] transition-colors cursor-pointer"
                aria-label="Close review form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand mb-2">
                  OVERALL RATING <span className="text-[#8C6D1F]">*</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating || formRating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setFormRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-[#C59B27] hover:scale-110 transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]"
                        aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={28}
                          className={`${
                            isFilled
                              ? 'fill-[#C59B27] text-[#C59B27]'
                              : 'fill-transparent text-[#D4C3A3]'
                          } transition-colors`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-3 text-sm font-medium font-sans-brand text-[#142B1A]">
                    {RATING_DESCRIPTIONS[hoverRating || formRating]}
                  </span>
                </div>
                {formErrors.rating && (
                  <p className="mt-1 text-xs text-red-600 font-sans-brand">{formErrors.rating}</p>
                )}
              </div>

              {/* Name & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="review-name"
                    className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand mb-1.5"
                  >
                    YOUR NAME <span className="text-[#8C6D1F]">*</span>
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Anandita Verma"
                    className="w-full px-4 py-3 rounded-xl border border-[#DDD1BE] bg-[#FAF7F2] text-[#142B1A] text-sm focus:outline-none focus:border-[#142B1A] focus:bg-white transition-colors"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-600 font-sans-brand">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="review-location"
                    className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand mb-1.5"
                  >
                    CITY / REGION (OPTIONAL)
                  </label>
                  <input
                    id="review-location"
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full px-4 py-3 rounded-xl border border-[#DDD1BE] bg-[#FAF7F2] text-[#142B1A] text-sm focus:outline-none focus:border-[#142B1A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Headline / Title */}
              <div>
                <label
                  htmlFor="review-title"
                  className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand mb-1.5"
                >
                  REVIEW HEADLINE <span className="text-[#8C6D1F]">*</span>
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Incomparable crunch and uniform jumbo size"
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD1BE] bg-[#FAF7F2] text-[#142B1A] text-sm focus:outline-none focus:border-[#142B1A] focus:bg-white transition-colors"
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-600 font-sans-brand">{formErrors.title}</p>
                )}
              </div>

              {/* Detailed Feedback Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="review-comment"
                    className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand"
                  >
                    TASTING NOTES &amp; FEEDBACK <span className="text-[#8C6D1F]">*</span>
                  </label>
                  <span className="text-xs text-[#829285] font-sans-brand">
                    {formComment.length} characters
                  </span>
                </div>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Describe the crunch, aroma, lightness, roasting results, or how you enjoy eating your Apna Makhana..."
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD1BE] bg-[#FAF7F2] text-[#142B1A] text-sm focus:outline-none focus:border-[#142B1A] focus:bg-white transition-colors leading-relaxed"
                />
                {formErrors.comment && (
                  <p className="mt-1 text-xs text-red-600 font-sans-brand">{formErrors.comment}</p>
                )}
              </div>

              {/* Verified Purchase Check */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  id="review-verified"
                  type="checkbox"
                  checked={formVerified}
                  onChange={(e) => setFormVerified(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DDD1BE] text-[#142B1A] focus:ring-[#C59B27] cursor-pointer"
                />
                <label
                  htmlFor="review-verified"
                  className="text-xs text-[#4E6152] font-sans-brand cursor-pointer select-none"
                >
                  I have tasted this product and verify this review reflects genuine personal experience.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3.5 px-8 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-[#234A30] transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'PUBLISHING...' : 'SUBMIT REVIEW'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-3.5 px-6 rounded-full border border-[#DDD1BE] text-[#142B1A] font-bold text-xs uppercase tracking-[0.15em] font-sans-brand hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Rating Scoreboard / Breakdown Card */}
        <div className="rounded-3xl bg-white border border-[#DDD1BE] shadow-sm p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT: Overall Score (4 cols) */}
            <div className="lg:col-span-4 text-center lg:text-left lg:border-r lg:border-[#F2ECE1] lg:pr-8">
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8C6D1F] font-sans-brand block mb-1">
                OVERALL RATING
              </span>
              
              <div className="flex items-baseline justify-center lg:justify-start gap-2">
                <span className="text-5xl sm:text-6xl font-serif-brand font-bold text-[#142B1A] tracking-tight">
                  {stats.average}
                </span>
                <span className="text-xl text-[#829285] font-serif-brand">/ 5.0</span>
              </div>

              {/* Star visuals */}
              <div className="flex items-center justify-center lg:justify-start gap-1 my-3">
                {[1, 2, 3, 4, 5].map((i) => {
                  const isFull = i <= Math.floor(stats.average);
                  return (
                    <Star
                      key={i}
                      size={20}
                      className={
                        isFull
                          ? 'fill-[#C59B27] text-[#C59B27]'
                          : 'fill-[#C59B27]/20 text-[#C59B27]'
                      }
                    />
                  );
                })}
              </div>

              <p className="text-xs text-[#4E6152] font-sans-brand">
                Based on <strong className="text-[#142B1A]">{stats.total} verified reviews</strong>
              </p>

              <div className="mt-4 pt-4 border-t border-[#F2ECE1] flex items-center justify-center lg:justify-start gap-2 text-xs text-[#2A6E3B] font-bold font-sans-brand">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{stats.recommendedPercent}% of customers recommend this pack</span>
              </div>
            </div>

            {/* MIDDLE: Star Distribution Bars (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.counts[star] || 0;
                const percentage = stats.percentages[star] || 0;
                const isSelected = selectedRatingFilter === star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setSelectedRatingFilter(selectedRatingFilter === star ? 'all' : star)
                    }
                    className={`w-full group flex items-center gap-3 text-xs font-sans-brand py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#FAF7F2] font-bold ring-1 ring-[#C59B27]/40' : 'hover:bg-[#FAF7F2]/60'
                    }`}
                  >
                    <span className="w-12 text-left flex items-center gap-1 text-[#142B1A] font-medium shrink-0">
                      <span>{star}</span>
                      <Star size={12} className="fill-[#C59B27] text-[#C59B27]" />
                    </span>

                    {/* Progress Track */}
                    <div className="flex-1 h-2.5 bg-[#F2ECE1] rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-[#C59B27] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="w-10 text-right text-[#687C6C] group-hover:text-[#142B1A] shrink-0 font-medium">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* RIGHT: Quick Summary Highlight (3 cols) */}
            <div className="lg:col-span-3 bg-[#FAF7F2] rounded-2xl p-5 border border-[#DDD1BE] text-center lg:text-left space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C6D1F] font-sans-brand block">
                OUR COMMITMENT
              </span>
              <h4 className="text-base font-serif-brand font-bold text-[#142B1A]">
                100% Verified Community Feedback
              </h4>
              <p className="text-xs text-[#4E6152] leading-relaxed font-sans-brand">
                Every review on Makhé India is submitted by genuine buyers. We never filter or alter consumer opinions.
              </p>
            </div>

          </div>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          
          {/* Segmented Filter Buttons (Clean Typography Buttons) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedRatingFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans-brand uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                selectedRatingFilter === 'all'
                  ? 'bg-[#142B1A] text-[#FAF7F2] shadow-xs'
                  : 'bg-white text-[#4E6152] hover:text-[#142B1A] border border-[#DDD1BE]'
              }`}
            >
              All ({reviews.length})
            </button>

            {[5, 4, 3, 2, 1].map((s) => {
              const count = stats.counts[s] || 0;
              const isActive = selectedRatingFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedRatingFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans-brand uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#142B1A] text-[#FAF7F2] shadow-xs'
                      : 'bg-white text-[#4E6152] hover:text-[#142B1A] border border-[#DDD1BE]'
                  }`}
                >
                  <span>{s}★</span>
                  <span className="opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs uppercase tracking-wider text-[#687C6C] font-bold font-sans-brand shrink-0">
              SORT BY:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-[#DDD1BE] rounded-xl px-4 py-2 pr-9 text-xs font-bold text-[#142B1A] font-sans-brand uppercase tracking-wider focus:outline-none focus:border-[#142B1A] cursor-pointer shadow-xs"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#142B1A] pointer-events-none"
              />
            </div>
          </div>

        </div>

        {/* Reviews Listing */}
        {filteredReviews.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#DDD1BE] p-12 text-center max-w-xl mx-auto space-y-4">
            <MessageSquare size={36} className="mx-auto text-[#C59B27]" />
            <h4 className="text-xl font-serif-brand font-bold text-[#142B1A]">
              No Reviews Found
            </h4>
            <p className="text-xs text-[#4E6152] font-sans-brand">
              There are no reviews matching your currently selected filter ({selectedRatingFilter} stars).
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedRatingFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider font-sans-brand hover:bg-[#234A30] cursor-pointer"
            >
              SHOW ALL REVIEWS
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const hasVoted = hasUserVotedHelpful(review.id);
              const initialLetter = review.userName ? review.userName.trim().charAt(0).toUpperCase() : 'M';

              return (
                <div
                  key={review.id}
                  className="rounded-2xl bg-white border border-[#DDD1BE] p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#F2ECE1]">
                    {/* Reviewer Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#142B1A] text-[#E5C778] font-serif-brand font-bold flex items-center justify-center text-base shrink-0 shadow-xs">
                        {initialLetter}
                      </div>
                      <div>
                        <h4 className="text-base font-serif-brand font-bold text-[#142B1A]">
                          {review.userName}
                        </h4>
                        
                        {/* Unboxed Metadata (Zero-Pill discipline) */}
                        <div className="flex items-center flex-wrap gap-2 text-xs text-[#687C6C] font-sans-brand mt-0.5">
                          {review.location && (
                            <>
                              <span>{review.location}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span>{review.date}</span>
                          {review.verifiedPurchase && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-[#2A6E3B] font-bold">
                                <Check size={12} className="text-[#2A6E3B]" />
                                <span>Verified Buyer</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i <= review.rating
                              ? 'fill-[#C59B27] text-[#C59B27]'
                              : 'fill-transparent text-[#DDD1BE]'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="pt-4 space-y-2">
                    <h5 className="text-lg font-serif-brand font-bold text-[#142B1A]">
                      {review.title}
                    </h5>
                    <p className="text-sm text-[#3D4F41] font-sans-brand leading-relaxed">
                      {review.comment}
                    </p>
                  </div>

                  {/* Review Footer / Helpful Vote */}
                  <div className="mt-5 pt-3 border-t border-[#F7F3EB] flex items-center justify-between text-xs text-[#687C6C] font-sans-brand">
                    <span className="text-[11px] uppercase tracking-wider text-[#8C6D1F] font-bold">
                      Apna Makhana · {weight}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleHelpful(review.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        hasVoted
                          ? 'border-[#2A6E3B] text-[#2A6E3B] bg-[#EBF7EE]'
                          : 'border-[#DDD1BE] text-[#687C6C] hover:text-[#142B1A] hover:bg-[#FAF7F2]'
                      }`}
                      aria-label="Mark review as helpful"
                    >
                      <ThumbsUp size={13} className={hasVoted ? 'fill-[#2A6E3B]' : ''} />
                      <span>Helpful ({review.helpfulCount})</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
