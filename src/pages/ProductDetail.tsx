import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Check, ChevronDown, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { PageRoute, Product } from '../types';
import { PRODUCTS, getProductBySlug } from '../data/products';
import { useCart } from '../context/CartContext';
import { EditableImage } from '../components/EditableImage';
import { ProductReviews } from '../components/ProductReviews';

interface ProductDetailProps {
  slug: string;
  onNavigate: (page: PageRoute) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ slug, onNavigate }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  const product = getProductBySlug(slug) || PRODUCTS[0];
  const relatedProduct = PRODUCTS.find((p) => p.id !== product.id) || PRODUCTS[1];

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handlePackSwitch = (targetSlug: string) => {
    onNavigate(`/product/${targetSlug}`);
    setQuantity(1);
    setAddedNotice(false);
  };

  const handleAddToCart = () => {
    addItem(product.id, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product.id, quantity);
    onNavigate('/checkout');
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen overflow-x-hidden selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[#E5DAC6] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8C6D1F] hover:text-[#142B1A] font-bold font-sans-brand transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: Large Real Product Imagery (6 cols) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#F4EFE6] to-[#EBE2D2] border border-[#DDD1BE] p-8 sm:p-12 shadow-sm flex items-center justify-center min-h-[420px] sm:min-h-[520px] overflow-hidden group">
              {/* Subtle ambient lotus water rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-[#C59B27]/20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-[#C59B27]/10 pointer-events-none" />

              {/* Discount Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-[#142B1A] text-[#E5C778] text-xs font-bold tracking-wider uppercase font-sans-brand shadow-sm">
                  {discountPercent}% OFF
                </span>
              </div>

              {/* Large Product Image */}
              <div className="relative z-10 w-full max-w-[320px] sm:max-w-[400px] flex items-center justify-center">
                <EditableImage
                  src={product.image}
                  alt={`${product.name} ${product.weight}`}
                  storageKey={product.id === 'makhe-100g' || product.id === 'pack-100g' ? 'home-product-100g' : 'home-product-250g'}
                  label="CHANGE PRODUCT IMAGE"
                  objectFit="contain"
                  className="w-full h-auto max-h-[460px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)] group-hover:scale-105 transition-transform duration-500 select-none"
                />
              </div>

              {/* Quality Label Tag */}
              <div className="absolute bottom-6 right-6 z-10 hidden sm:block">
                <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold font-sans-brand bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#DDD1BE]">
                  100% Whole Jumbo
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information (6 cols) */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Header Titles */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[1.5px] bg-[#C59B27]" />
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                  MAKHÉ INDIA · BIHAR ORIGIN
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A] leading-tight">
                APNA MAKHANA
              </h1>

              <div className="flex items-center gap-3">
                <span className="text-sm uppercase tracking-widest font-bold text-[#8C6D1F] font-sans-brand">
                  PACK SIZE: {product.weight}
                </span>
                <span className="text-[#C59B27]">·</span>
                <span className="text-xs text-[#2A6E3B] font-bold font-sans-brand">
                  In Stock
                </span>
                <span className="text-[#C59B27]">·</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#142B1A] font-sans-brand hover:text-[#C59B27] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} className="fill-[#C59B27] text-[#C59B27]" />
                    ))}
                  </div>
                  <span className="font-bold">4.9</span>
                  <span className="text-[#687C6C] group-hover:text-[#142B1A] underline underline-offset-2">
                    (Reviews)
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-6 rounded-2xl bg-white border border-[#DDD1BE] shadow-xs space-y-3">
              <div className="flex items-baseline gap-4">
                <div className="flex items-baseline text-[#142B1A]">
                  <span className="text-2xl font-bold mr-0.5">₹</span>
                  <span className="text-4xl sm:text-5xl font-serif-brand font-bold tracking-tight">
                    {product.price}
                  </span>
                </div>

                <div className="text-lg text-[#829285] line-through font-medium">
                  MRP ₹{product.mrp}
                </div>

                <span className="px-2.5 py-1 rounded-md bg-[#EBF7EE] text-[#1E7535] text-xs font-bold font-sans-brand">
                  Save ₹{product.mrp - product.price} ({discountPercent}%)
                </span>
              </div>

              <p className="text-xs text-[#687C6C] font-sans-brand">
                Inclusive of all taxes
              </p>
            </div>

            {/* Pack Size Switcher */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand">
                CHOOSE YOUR PACK
              </label>

              <div className="grid grid-cols-2 gap-4">
                {PRODUCTS.map((p) => {
                  const isSelected = p.id === product.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePackSwitch(p.slug)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#142B1A] text-[#FAF7F2] border-[#142B1A] shadow-md ring-2 ring-[#C59B27]/40'
                          : 'bg-white text-[#142B1A] border-[#D9CBB3] hover:border-[#142B1A]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm sm:text-base font-serif-brand font-bold ${isSelected ? 'text-[#E5C778]' : 'text-[#142B1A]'}`}>
                          {p.name !== 'Apna Makhana' ? `${p.name} (${p.weight})` : p.weight}
                        </span>
                        {isSelected && <Check size={16} className="text-[#E5C778]" />}
                      </div>
                      <span className={`text-xs block font-sans-brand ${isSelected ? 'text-[#C2D6C6]' : 'text-[#687C6C]'}`}>
                        ₹{p.price?.toLocaleString('en-IN')} <span className="line-through text-[11px] opacity-75">₹{p.mrp?.toLocaleString('en-IN')}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & CTAs */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand">
                  QUANTITY:
                </span>
                <div className="inline-flex items-center border border-[#142B1A]/30 rounded-xl bg-white overflow-hidden shadow-xs h-12 px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-full flex items-center justify-center text-[#142B1A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-base font-bold text-[#142B1A] select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    className="w-9 h-full flex items-center justify-center text-[#142B1A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons: ADD TO CART & BUY NOW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-4 px-6 rounded-full bg-white border-2 border-[#142B1A] text-[#142B1A] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-[#142B1A] hover:text-[#FAF7F2] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <ShoppingBag size={16} />
                  <span>{addedNotice ? 'ADDED TO CART!' : 'ADD TO CART'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-4 px-6 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-[#234A30] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <span>BUY NOW</span>
                  <ArrowRight size={16} className="text-[#E5C778]" />
                </button>
              </div>
            </div>

            {/* Expandable Accordions: Product Details, Ingredients & Nutrition, Shipping & Returns */}
            <div className="pt-6 border-t border-[#DDD1BE] space-y-3">
              
              {/* 1. PRODUCT DETAILS */}
              <div className="border border-[#DDD1BE] rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('details')}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand cursor-pointer hover:bg-[#FAF7F2]"
                >
                  <span>PRODUCT DETAILS</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${openAccordion === 'details' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === 'details' && (
                  <div className="px-4 pb-4 text-sm text-[#4E6152] leading-relaxed border-t border-[#F2ECE1] pt-3 font-sans-brand space-y-2">
                    <p>
                      {product.name} is 100% whole jumbo makhana sourced directly from Bihar. Simple, satisfying and made for everyday snacking.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-[#273B2D]">
                      <li>100% Whole Jumbo Makhana</li>
                      <li>High Fibre Snacking</li>
                      <li>Gluten Free</li>
                      <li>Hygienically Packed</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 2. INGREDIENTS & NUTRITION */}
              <div className="border border-[#DDD1BE] rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('nutrition')}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand cursor-pointer hover:bg-[#FAF7F2]"
                >
                  <span>INGREDIENTS &amp; NUTRITION</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${openAccordion === 'nutrition' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === 'nutrition' && (
                  <div className="px-4 pb-4 text-xs text-[#687C6C] leading-relaxed border-t border-[#F2ECE1] pt-3 font-sans-brand">
                    Product information will be updated before launch.
                  </div>
                )}
              </div>

              {/* 3. SHIPPING & RETURNS */}
              <div className="border border-[#DDD1BE] rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#142B1A] font-sans-brand cursor-pointer hover:bg-[#FAF7F2]"
                >
                  <span>SHIPPING &amp; RETURNS</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="px-4 pb-4 text-xs text-[#687C6C] leading-relaxed border-t border-[#F2ECE1] pt-3 font-sans-brand">
                    Product information will be updated before launch.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION: CUSTOMER REVIEWS & TASTING NOTES
      ================================================== */}
      <ProductReviews
        productId={product.id}
        productName={product.name}
        weight={product.weight}
      />

      {/* ==================================================
          SECTION 6 — RELATED PRODUCT (YOU MAY ALSO LIKE)
          If viewing 100 GM: show 250 GM
          If viewing 250 GM: show 100 GM
      ================================================== */}
      <section className="py-16 sm:py-20 bg-[#F4EFE6] border-t border-[#E5DAC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-2">
              DISCOVER MORE
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif-brand font-bold text-[#142B1A]">
              YOU MAY ALSO LIKE
            </h2>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#DDD1BE] shadow-md hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-[#E5DAC6]">
                  <h3 className="font-serif-brand font-bold text-xl text-[#142B1A]">
                    {relatedProduct.name}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-[#142B1A] text-[#E5C778] font-bold text-xs uppercase tracking-wider font-sans-brand">
                    {relatedProduct.weight}
                  </span>
                </div>

                <div className="py-6 flex items-center justify-center">
                  <EditableImage
                    src={relatedProduct.image}
                    alt={`${relatedProduct.name} ${relatedProduct.weight}`}
                    storageKey={relatedProduct.id === 'makhe-100g' || relatedProduct.id === 'pack-100g' ? 'home-product-100g' : 'home-product-250g'}
                    label="CHANGE PRODUCT IMAGE"
                    objectFit="contain"
                    className="w-full max-h-56 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex items-baseline gap-3 py-3 border-t border-[#E5DAC6]">
                  <span className="text-2xl font-serif-brand font-bold text-[#142B1A]">
                    ₹{relatedProduct.price}
                  </span>
                  <span className="text-sm text-[#829285] line-through">
                    MRP ₹{relatedProduct.mrp}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => handlePackSwitch(relatedProduct.slug)}
                  className="w-full py-3.5 px-6 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.15em] font-sans-brand hover:bg-[#234A30] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>VIEW {relatedProduct.weight} PACK</span>
                  <ArrowRight size={14} className="text-[#E5C778]" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
