export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  hindiName?: string;
  weight: string;
  weightNumber?: number;
  price: number;
  mrp: number;
  image: string;
  images: string[];
  description: string;
  inStock: boolean;
  badge?: string;
  tagline?: string;
  servings?: string;
  features?: string[];
}

export interface CartItemStored {
  productId: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  location?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  date: string;
  createdAt: number;
}

export interface CreateReviewPayload {
  productId: string;
  userName: string;
  location?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase?: boolean;
}

export type PageRoute =
  | '/'
  | '/our-story'
  | '/blog'
  | '/wholesale'
  | '/contact'
  | '/cart'
  | '/checkout'
  | '/account'
  | '/product/apna-makhana-100g'
  | '/product/apna-makhana-250g'
  | string;
