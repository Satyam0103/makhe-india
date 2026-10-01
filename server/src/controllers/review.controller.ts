import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ReviewModel } from '../models/review.model';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

// In-memory seed reviews for when MongoDB is not connected
const inMemoryReviews: any[] = [
  {
    _id: 'rev-1',
    productId: 'makhe-250g',
    userName: 'Vikramaditya Singhania',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    title: 'The cleanest, biggest foxnuts I have encountered',
    comment:
      'We have tried almost every premium brand in Mumbai, but Makhé India is in a different league altogether. The foxnuts are truly jumbo sized, completely free of that bitter residual black grit or unpopped hardness. Roasted them lightly in A2 desi ghee with just a pinch of rock salt—spectacular crunch.',
    verifiedPurchase: true,
    helpfulCount: 28,
    createdAt: new Date(Date.now() - 14 * 86400000),
  },
  {
    _id: 'rev-2',
    productId: 'makhe-250g',
    userName: 'Dr. Radhika Sen',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    title: 'Flawless 4 PM guilt-free desk fuel',
    comment:
      'As an endocrinologist, I am constantly advising patients to switch out ultra-processed evening snacks for high-fibre, low-glycemic alternatives. Makhé India Apna Makhana is genuinely pure. The vacuum-sealed bag retained fresh harvest crispness right out of the box. Ordered the 250g value pack twice already.',
    verifiedPurchase: true,
    helpfulCount: 19,
    createdAt: new Date(Date.now() - 20 * 86400000),
  },
  {
    _id: 'rev-3',
    productId: 'makhe-250g',
    userName: 'Aakash Mishra',
    location: 'Patna, Bihar',
    rating: 5,
    title: 'Authentic Mithila grading done right',
    comment:
      'Coming from Bihar myself, I know real makhana from inferior commercial lots. The sorting here is meticulous—all uniform size, bright ivory colour, and pure neutral sweetness. Happy to see authentic Bihar harvest represented with this level of luxury packaging.',
    verifiedPurchase: true,
    helpfulCount: 34,
    createdAt: new Date(Date.now() - 31 * 86400000),
  },
  {
    _id: 'rev-4',
    productId: 'makhe-250g',
    userName: 'Meera Chawla',
    location: 'New Delhi, Delhi NCR',
    rating: 4,
    title: 'Delicious texture and great resealable packaging',
    comment:
      'Crisp and light. You can tell they source top-tier grades because each puff is airy rather than chewy. The price is slightly higher than loose local markets, but the cleanliness and time saved from sorting out bad seeds makes it well worth the difference.',
    verifiedPurchase: true,
    helpfulCount: 11,
    createdAt: new Date(Date.now() - 40 * 86400000),
  },
  {
    _id: 'rev-5',
    productId: 'makhe-100g',
    userName: 'Ananya Deshmukh',
    location: 'Pune, Maharashtra',
    rating: 5,
    title: 'Perfect portion for trial and gifting',
    comment:
      'Picked up the 100g pack first to test the quality before buying wholesale. Outstanding! Even straight from the pack before roasting, they had great crunch and zero oily odor. Ideal size for packing in travel carry-on or work bag.',
    verifiedPurchase: true,
    helpfulCount: 22,
    createdAt: new Date(Date.now() - 16 * 86400000),
  },
  {
    _id: 'rev-6',
    productId: 'makhe-100g',
    userName: 'Karthik Ramanathan',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    title: 'Far superior to local organic store options',
    comment:
      'Remarkably uniform size and very fresh. Tossed with cold-pressed olive oil, cracked black pepper, and chaat masala. My kids finished the entire bowl within ten minutes. Moving up to the 250g pack on my next order.',
    verifiedPurchase: true,
    helpfulCount: 15,
    createdAt: new Date(Date.now() - 26 * 86400000),
  },
  {
    _id: 'rev-7',
    productId: 'makhe-100g',
    userName: 'Pooja Bhatia',
    location: 'Gurugram, Haryana',
    rating: 4,
    title: 'Wonderful crunch and clean harvest',
    comment:
      'Very clean and fluffy makhana. Appreciate that there are no artificial preservatives or anti-caking agents added. Delivered within 3 days in sturdy packaging.',
    verifiedPurchase: true,
    helpfulCount: 8,
    createdAt: new Date(Date.now() - 37 * 86400000),
  },
];

export async function getReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = productId ? { productId: String(productId) } : {};
      const docs = await ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
      return sendSuccess(res, docs, 'Reviews retrieved successfully.');
    }

    // In-memory fallback
    const filtered = productId
      ? inMemoryReviews.filter((r) => r.productId === String(productId))
      : inMemoryReviews;

    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sendSuccess(res, sorted, 'Reviews retrieved successfully.');
  } catch (error: any) {
    next(error);
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, userName, location, rating, title, comment, verifiedPurchase } = req.body;

    if (!productId || !userName || !rating || !title || !comment) {
      return sendError(res, 'All required review fields must be provided.', 400);
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return sendError(res, 'Rating must be an integer between 1 and 5.', 400);
    }

    const reviewData = {
      productId: String(productId).trim(),
      userName: String(userName).trim(),
      location: location ? String(location).trim() : 'India',
      rating: Math.round(numRating),
      title: String(title).trim(),
      comment: String(comment).trim(),
      verifiedPurchase: verifiedPurchase !== false,
      helpfulCount: 0,
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const doc = await ReviewModel.create(reviewData);
      logger.info(`[Review] New review submitted for ${productId} by ${userName} (${rating} stars)`);
      return sendSuccess(res, doc, 'Review submitted successfully.', 201);
    }

    // In-memory fallback
    const mockId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdItem = {
      _id: mockId,
      ...reviewData,
    };
    inMemoryReviews.unshift(createdItem);
    logger.info(`[Review] New review created in-memory for ${productId} by ${userName}`);

    return sendSuccess(res, createdItem, 'Review submitted successfully.', 201);
  } catch (error: any) {
    next(error);
  }
}
