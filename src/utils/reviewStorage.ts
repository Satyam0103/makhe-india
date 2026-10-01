import { ProductReview, CreateReviewPayload } from '../types';
import { INITIAL_REVIEWS } from '../data/initialReviews';

const STORAGE_KEY = 'makhe_product_reviews_v1';
const VOTED_KEY = 'makhe_reviewed_helpful_v1';

/**
 * Retrieves all stored reviews, initializing with INITIAL_REVIEWS if empty.
 */
export function getStoredReviews(): ProductReview[] {
  if (typeof window === 'undefined') {
    return INITIAL_REVIEWS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  } catch (err) {
    console.error('Failed to read reviews from localStorage:', err);
    return INITIAL_REVIEWS;
  }
}

/**
 * Get reviews filtered by a specific product ID.
 */
export function getProductReviews(productId: string): ProductReview[] {
  const all = getStoredReviews();
  return all.filter((r) => r.productId === productId);
}

/**
 * Appends a new review to localStorage.
 */
export function saveNewReview(payload: CreateReviewPayload): ProductReview {
  const all = getStoredReviews();
  
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-IN', options);

  const newReview: ProductReview = {
    id: `rev-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId: payload.productId,
    userName: payload.userName.trim(),
    location: payload.location ? payload.location.trim() : 'India',
    rating: Math.max(1, Math.min(5, Math.round(payload.rating))),
    title: payload.title.trim(),
    comment: payload.comment.trim(),
    verifiedPurchase: payload.verifiedPurchase ?? true,
    helpfulCount: 0,
    date: formattedDate,
    createdAt: Date.now(),
  };

  const updated = [newReview, ...all];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist review to localStorage:', err);
  }

  return newReview;
}

/**
 * Increments or decrements helpful count with deduplication in localStorage.
 */
export function toggleHelpfulReview(reviewId: string): { helpfulCount: number; hasVoted: boolean } {
  const all = getStoredReviews();
  let votedIds: string[] = [];

  try {
    const rawVoted = localStorage.getItem(VOTED_KEY);
    if (rawVoted) {
      votedIds = JSON.parse(rawVoted);
    }
  } catch {
    votedIds = [];
  }

  const alreadyVoted = votedIds.includes(reviewId);
  let newCount = 0;
  let hasVoted = false;

  const updatedReviews = all.map((r) => {
    if (r.id === reviewId) {
      if (alreadyVoted) {
        newCount = Math.max(0, r.helpfulCount - 1);
        hasVoted = false;
        return { ...r, helpfulCount: newCount };
      } else {
        newCount = r.helpfulCount + 1;
        hasVoted = true;
        return { ...r, helpfulCount: newCount };
      }
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
    const newVoted = alreadyVoted
      ? votedIds.filter((id) => id !== reviewId)
      : [...votedIds, reviewId];
    localStorage.setItem(VOTED_KEY, JSON.stringify(newVoted));
  } catch (err) {
    console.error('Failed to update review helpful count:', err);
  }

  return { helpfulCount: newCount, hasVoted };
}

/**
 * Checks if current user has already marked this review as helpful.
 */
export function hasUserVotedHelpful(reviewId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const rawVoted = localStorage.getItem(VOTED_KEY);
    if (!rawVoted) return false;
    const votedIds: string[] = JSON.parse(rawVoted);
    return votedIds.includes(reviewId);
  } catch {
    return false;
  }
}
