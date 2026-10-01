import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'makhe-100g',
    slug: 'apna-makhana-100g',
    name: 'Apna Makhana',
    shortName: 'Apna Makhana 100g',
    hindiName: '१०० ग्राम पैक',
    weight: '100 GM',
    weightNumber: 100,
    price: 179,
    mrp: 245,
    image: '/images/products/100g.webp',
    images: ['/images/products/100g.webp'],
    description: '100% Whole Jumbo Makhana. Simple, satisfying and made for everyday snacking.',
    inStock: true,
    badge: '100 GM Pack',
    tagline: 'Apna Makhana. Apna Pack.',
    servings: '100g Pack',
    features: [
      '100% Whole Jumbo',
      'High Fibre',
      'Gluten Free',
      'Hygienically Packed'
    ]
  },
  {
    id: 'makhe-250g',
    slug: 'apna-makhana-250g',
    name: 'Apna Makhana',
    shortName: 'Apna Makhana 250g',
    hindiName: '२५० ग्राम पावरपैक',
    weight: '250 GM',
    weightNumber: 250,
    price: 399,
    mrp: 595,
    image: '/images/products/250g.webp',
    images: ['/images/products/250g.webp'],
    description: '100% Whole Jumbo Makhana. Simple, satisfying and made for everyday snacking.',
    inStock: true,
    badge: '250 GM Pack',
    tagline: 'Apna Makhana. Apna Pack.',
    servings: '250g Pack',
    features: [
      '100% Whole Jumbo',
      'High Fibre',
      'Gluten Free',
      'Hygienically Packed'
    ]
  },
  {
    id: 'makhe-9kg-og',
    slug: 'og-makhana-9kg',
    name: 'OG Makhana',
    shortName: 'OG Makhana 9kg',
    hindiName: '९ कि.ग्रा. OG मखाना',
    weight: '9kg',
    weightNumber: 9000,
    price: 12800,
    mrp: 22050,
    image: '/images/products/og-9kg.webp',
    images: ['/images/products/og-9kg.webp'],
    description: '100% Whole Jumbo Makhana Bulk Pack (OG Grade). Pure, unpolished, directly sourced from Mithila, Bihar.',
    inStock: true,
    badge: '9kg Pack',
    tagline: 'Premium Jumbo Grade',
    servings: '9kg Bulk Pack',
    features: [
      '100% Whole Jumbo',
      'Bulk 9kg Pack',
      'Direct from Farm',
      'Zero Broken Pieces'
    ]
  },
  {
    id: 'makhe-9kg-ashoka',
    slug: 'ashoka-makhana-9kg',
    name: 'Ashoka Makhana',
    shortName: 'Ashoka Makhana 9kg',
    hindiName: '९ कि.ग्रा. अशोका मखाना',
    weight: '9kg',
    weightNumber: 9000,
    price: 7395,
    mrp: 12735,
    image: '/images/products/ashoka-9kg.webp',
    images: ['/images/products/ashoka-9kg.webp'],
    description: '100% Pure Natural Makhana Bulk Pack (Ashoka Grade). Ideal for wholesome family snacking and culinary use.',
    inStock: true,
    badge: '9kg Pack',
    tagline: 'Pure & Wholesome',
    servings: '9kg Bulk Pack',
    features: [
      '100% Pure Natural',
      'Bulk 9kg Pack',
      'Direct from Bihar',
      'Hygienically Processed'
    ]
  }
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
