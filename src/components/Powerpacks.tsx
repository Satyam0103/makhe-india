import React, { useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { PageRoute, Product } from "../types";
import { PRODUCTS } from "../data/products";
import { EditableImage } from "./EditableImage";

interface PackItem {
  id: string;
  slug?: string;
  name: string;
  weight: string;
  badge: string;
  badgeRight?: string;
  price?: number;
  mrp?: number;
  image: string;
  storageKey: string;
  isWholesale?: boolean;
  productRef?: Product;
  qualityTag?: string;
}

const PACK_ITEMS: PackItem[] = [
  {
    id: "makhe-250g",
    slug: "apna-makhana-250g",
    name: "Apna Makhana",
    weight: "250 GM",
    badge: "250 GM PACK",
    price: 399,
    mrp: 595,
    image: "/images/products/250g.webp",
    storageKey: "product-listing-250gm",
    isWholesale: false,
    productRef: PRODUCTS[1],
  },
  {
    id: "makhe-100g",
    slug: "apna-makhana-100g",
    name: "Apna Makhana",
    weight: "100 GM",
    badge: "100 GM PACK",
    price: 179,
    mrp: 245,
    image: "/images/products/100g.webp",
    storageKey: "product-listing-100gm",
    isWholesale: false,
    productRef: PRODUCTS[0],
  },
  {
    id: "makhe-9kg-og",
    slug: "og-makhana-9kg",
    name: "OG Makhana",
    weight: "9kg",
    badge: "9kg PACK",
    price: 12800,
    mrp: 22050,
    image: "/images/products/og-9kg.webp",
    storageKey: "product-listing-og-9kg",
    isWholesale: false,
    productRef: PRODUCTS[2],
    qualityTag: "Premium Handpicked",
  },
  {
    id: "makhe-9kg-ashoka",
    slug: "ashoka-makhana-9kg",
    name: "Ashoka Makhana",
    weight: "9kg",
    badge: "9kg PACK",
    price: 7395,
    mrp: 12735,
    image: "/images/products/ashoka-9kg.webp",
    storageKey: "product-listing-ashoka-9kg",
    isWholesale: false,
    productRef: PRODUCTS[3],
    qualityTag: "Superior Quality",
  },
];

interface PowerpacksProps {
  onNavigate?: (page: PageRoute) => void;
}

export const Powerpacks: React.FC<PowerpacksProps> = ({ onNavigate }) => {
  const { addItem } = useCart();

  const [quantities, setQuantities] = useState<Record<string, number>>({
    "makhe-100g": 1,
    "makhe-250g": 1,
    "makhe-9kg-og": 1,
    "makhe-9kg-ashoka": 1,
  });
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [bulkOpenMap, setBulkOpenMap] = useState<Record<string, boolean>>({});

  const toggleBulk = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBulkOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const cur = prev[id] || 1;
      const next = Math.max(1, Math.min(50, cur + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleAdd = (item: Product) => {
    const qty = quantities[item.id] || 1;
    addItem(item.id, qty);
    setAddedMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  const handleBuyNow = (item: Product) => {
    const qty = quantities[item.id] || 1;
    addItem(item.id, qty);
    if (onNavigate) {
      onNavigate("/checkout");
    }
  };

  const handleProductClick = (slug: string) => {
    if (onNavigate) {
      onNavigate(`/product/${slug}`);
    }
  };

  const handleEnquireWholesale = () => {
    if (onNavigate) {
      onNavigate("/wholesale");
      setTimeout(() => {
        const el = document.getElementById("enquiry-form");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }
  };

  const handleVisualClick = (item: PackItem) => {
    if (item.isWholesale) {
      handleEnquireWholesale();
    } else if (item.slug) {
      handleProductClick(item.slug);
    }
  };

  const handleTitleClick = (item: PackItem) => {
    if (item.isWholesale) {
      handleEnquireWholesale();
    } else if (item.slug) {
      handleProductClick(item.slug);
    }
  };

  return (
    <section
      id="powerpacks"
      className="py-14 sm:py-16 lg:py-20 bg-[#F4EFE6] border-b border-[#DFD3BE] relative overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#EAE1D1] to-transparent rounded-full blur-3xl -z-0" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3 px-2">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
            <span className="text-xs uppercase tracking-[0.28em] font-bold text-[#C59B27] font-sans-brand">
              SHOP MAKHÉ
            </span>
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
          </div>

          <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl lg:text-[46px] xl:text-5xl font-serif-brand font-bold text-[#142B1A] tracking-tight leading-tight">
            Pick Your Powerpack
          </h2>

          <p className="text-sm min-[380px]:text-base sm:text-lg text-[#6E5936] font-sans-brand font-medium">
            You are one step closer to purity
          </p>
        </div>

        {/* COMBINED PRODUCT LISTINGS: 100g, 250g, OG Makhana (9kg), Ashoka Makhana (9kg) — STRICTLY 2x2 ON ALL SCREENS */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-10 max-w-5xl mx-auto items-stretch">
          {PACK_ITEMS.map((item) => {
            const qty = quantities[item.id] || 1;
            const isAdded = addedMap[item.id];
            const hasPrice =
              typeof item.price === "number" && typeof item.mrp === "number";
            const discountPercent = hasPrice
              ? Math.round(((item.mrp! - item.price!) / item.mrp!) * 100)
              : 0;
            const savings = hasPrice ? item.mrp! - item.price! : 0;
            const is9kg =
              item.weight.toLowerCase().includes("9kg") ||
              item.id === "makhe-9kg-og" ||
              item.id === "makhe-9kg-ashoka";
            const isBulkOpen = Boolean(bulkOpenMap[item.id]);

            return (
              <div
                key={item.id}
                className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-3 sm:p-7 lg:p-12 transition-all duration-300 group"
              >
                {/* Subtle Organic Background Shape Behind Packet */}
                <div className="absolute inset-0 bg-[#FAF7F2] rounded-2xl sm:rounded-3xl border border-[#DFD4C2] shadow-xs sm:shadow-md group-hover:shadow-xl sm:group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Organic Warm Blob */}
                  <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#EFE6D5] rounded-full blur-2xl opacity-60 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#EADCC5] rounded-full blur-2xl opacity-50" />
                </div>

                {/* Top Badge: Discount Callout or Clean Pack Badge */}
                <div className="relative z-10 flex items-center justify-between mb-1.5 sm:mb-2 gap-1">
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#183321] text-[#E5C778] text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-bold tracking-wider uppercase font-sans-brand shadow-xs">
                    {hasPrice ? `${discountPercent}% OFF` : item.badge}
                  </span>
                  {hasPrice && (
                    <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs font-bold text-[#8C6420] uppercase tracking-wider font-sans-brand truncate">
                      Save ₹{savings.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Packet Visual (Visually Dominant & Large & Clickable) */}
                <div
                  onClick={() => handleVisualClick(item)}
                  className="relative z-10 flex flex-col items-center justify-center pt-1 pb-2 sm:pt-2 sm:pb-6 min-h-[140px] min-[380px]:min-h-[170px] sm:min-h-[260px] lg:min-h-[380px] cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVisualClick(item);
                  }}
                  aria-label={`View ${item.name} ${item.weight} details`}
                >
                  <div className="w-full max-w-[130px] min-[380px]:max-w-[170px] sm:max-w-[260px] lg:max-w-[380px] h-[130px] min-[380px]:h-[170px] sm:h-[260px] lg:h-[380px] flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-300 ease-out drop-shadow-lg sm:drop-shadow-2xl">
                    <EditableImage
                      src={item.image}
                      alt={`${item.name} ${item.weight} - Makhé India`}
                      storageKey={item.storageKey}
                      label="CHANGE PRODUCT IMAGE"
                      objectFit="contain"
                      containerClassName="w-full h-full flex items-center justify-center"
                      className="w-full h-full max-h-[130px] min-[380px]:max-h-[170px] sm:max-h-[260px] lg:max-h-[380px] object-contain select-none"
                    />
                  </div>
                </div>

                {/* Product Information & Purchasing Moment */}
                <div className="relative z-10 space-y-2 sm:space-y-4 pt-2.5 sm:pt-6 border-t border-[#E8DEC9]">
                  {/* Title & Quality Label & Weight */}
                  <div>
                    <h3
                      onClick={() => handleTitleClick(item)}
                      className="text-sm min-[380px]:text-base sm:text-2xl lg:text-3xl font-serif-brand font-bold text-[#142B1A] tracking-wide inline-block transition-colors cursor-pointer hover:text-[#C59B27] leading-tight"
                    >
                      {item.name}
                    </h3>

                    {/* Quality Label (only on 9kg products) */}
                    {item.qualityTag && (
                      <div className="mt-1 mb-1">
                        <span className="inline-block bg-[#F5EFE4] text-[#142B1A] border border-[#DDCFBC] text-[9px] min-[380px]:text-[10px] sm:text-xs font-semibold font-sans-brand px-2 py-0.5 rounded shadow-2xs">
                          {item.qualityTag}
                        </span>
                      </div>
                    )}

                    {/* Weight & Bulk Order Toggle (only on 9kg) */}
                    <div className="flex items-center justify-between gap-1.5 mt-0.5 min-h-[24px]">
                      <p className="text-[10px] sm:text-sm lg:text-base font-bold text-[#8C6420] tracking-wider uppercase">
                        {item.weight}
                      </p>

                      {is9kg && (
                        <button
                          type="button"
                          onClick={(e) => toggleBulk(item.id, e)}
                          aria-expanded={isBulkOpen}
                          className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] min-[380px]:text-[10px] sm:text-xs font-bold font-sans-brand text-[#183321] hover:text-[#8C6420] bg-[#FAF3E7] hover:bg-[#F3EAD7] px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-[#D8C7AF] transition-all shadow-2xs cursor-pointer select-none"
                        >
                          <span>Bulk Order</span>
                          {isBulkOpen ? (
                            <ChevronUp
                              size={11}
                              className="text-[#8C6420] shrink-0"
                            />
                          ) : (
                            <ChevronDown
                              size={11}
                              className="text-[#8C6420] shrink-0"
                            />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expandable Bulk Order Information Panel (Only for 9kg products) */}
                    {is9kg && (
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isBulkOpen
                            ? "max-h-60 opacity-100 mt-2"
                            : "max-h-0 opacity-0 mt-0 pointer-events-none"
                        }`}
                      >
                        <div className="bg-[#FAF6EE] border border-[#D8C9B0] rounded-lg p-2 sm:p-2.5 text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs text-[#183321] leading-relaxed shadow-2xs">
                          For retailers, corporates &amp; businesses. Please
                          reach out at{" "}
                          <a
                            href="tel:+918409118082"
                            className="font-bold text-[#8C6420] hover:text-[#183321] underline underline-offset-2 transition-colors whitespace-nowrap"
                          >
                            +91 - 8409118082
                          </a>{" "}
                          or email us at{" "}
                          <a
                            href="mailto:wecare@makheindia.com"
                            className="font-bold text-[#8C6420] hover:text-[#183321] underline underline-offset-2 transition-colors break-all"
                          >
                            wecare@makheindia.com
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing or Enquire for Price */}
                  {hasPrice ? (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-3 min-h-[32px] sm:min-h-[48px] sm:min-h-[52px]">
                      <div className="flex items-baseline text-[#183321]">
                        <span className="text-xs sm:text-xl font-bold mr-0.5">
                          ₹
                        </span>
                        <span className="text-base min-[380px]:text-lg sm:text-4xl lg:text-5xl font-serif-brand font-extrabold tracking-tight">
                          {item.price?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="text-[10px] sm:text-base lg:text-lg text-[#829285] line-through font-medium">
                        MRP ₹{item.mrp?.toLocaleString("en-IN")}
                      </div>

                      <span className="text-[8px] sm:text-xs font-bold text-[#1E7335] bg-[#E8F3EB] px-1 sm:px-2 py-0.5 rounded leading-none">
                        Incl. taxes
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5 sm:gap-3 min-h-[32px] sm:min-h-[48px] sm:min-h-[52px] items-center">
                      <div className="text-[#183321]">
                        <span className="text-xs min-[380px]:text-sm sm:text-3xl lg:text-4xl font-serif-brand font-bold tracking-tight">
                          Enquire for Price
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions: Retail Cart & Buy Now vs Simple Enquiry CTA */}
                  {!item.isWholesale && item.productRef ? (
                    <div className="pt-1 sm:pt-2 flex flex-col gap-1.5 sm:gap-3">
                      <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-1.5 sm:gap-3">
                        {/* Stepper (- 1 +) */}
                        <div className="inline-flex self-center min-[380px]:self-auto items-center justify-between border border-[#183321]/30 rounded-lg sm:rounded-xl bg-white overflow-hidden shadow-xs h-8 sm:h-12 px-1 sm:px-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQty(item.id, -1)}
                            className="w-5 sm:w-9 h-full flex items-center justify-center text-[#183321] hover:bg-[#FAF7F2] transition-colors focus:outline-none cursor-pointer"
                            aria-label={`Decrease ${item.weight} quantity`}
                          >
                            <Minus size={12} className="sm:hidden" />
                            <Minus size={16} className="hidden sm:block" />
                          </button>
                          <span className="w-5 sm:w-10 text-center text-xs sm:text-base font-bold text-[#183321] select-none font-sans-brand">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQty(item.id, 1)}
                            className="w-5 sm:w-9 h-full flex items-center justify-center text-[#183321] hover:bg-[#FAF7F2] transition-colors focus:outline-none cursor-pointer"
                            aria-label={`Increase ${item.weight} quantity`}
                          >
                            <Plus size={12} className="sm:hidden" />
                            <Plus size={16} className="hidden sm:block" />
                          </button>
                        </div>

                        {/* Visually Strong ADD TO CART Button */}
                        <button
                          type="button"
                          onClick={() => handleAdd(item.productRef!)}
                          className={`w-full min-[380px]:w-auto min-w-0 min-[380px]:flex-1 h-8 sm:h-12 px-1 sm:px-5 rounded-lg sm:rounded-xl font-bold text-[8px] min-[380px]:text-[10px] sm:text-sm uppercase tracking-tight sm:tracking-wider flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap transition-all shadow-xs sm:shadow-md focus:outline-none cursor-pointer ${
                            isAdded
                              ? "bg-[#2E6B3D] text-[#FAF7F2]"
                              : "bg-white border sm:border-2 border-[#183321] text-[#183321] hover:bg-[#FAF7F2] active:scale-[0.98]"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check
                                size={12}
                                className="sm:hidden text-[#E5C778]"
                              />
                              <Check
                                size={18}
                                className="hidden sm:block text-[#E5C778]"
                              />
                              <span>ADDED</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag
                                size={12}
                                className="hidden sm:block text-[#C59B27]"
                              />
                              <ShoppingBag
                                size={18}
                                className="hidden sm:block text-[#C59B27]"
                              />
                              <span className="whitespace-nowrap">
                                ADD TO CART
                              </span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* BUY NOW Button */}
                      <button
                        type="button"
                        onClick={() => handleBuyNow(item.productRef!)}
                        className="w-full h-8 sm:h-12 px-2 sm:px-6 rounded-lg sm:rounded-xl font-bold text-[9px] min-[380px]:text-[10px] sm:text-sm uppercase tracking-wider sm:tracking-widest flex items-center justify-center gap-1 sm:gap-2 transition-all shadow-xs sm:shadow-md focus:outline-none cursor-pointer bg-[#183321] text-[#FAF7F2] hover:bg-[#234A30] active:scale-[0.98]"
                      >
                        <span>BUY NOW</span>
                        <ArrowRight
                          size={12}
                          className="sm:hidden text-[#E5C778]"
                        />
                        <ArrowRight
                          size={16}
                          className="hidden sm:block text-[#E5C778]"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1 sm:pt-2 flex flex-col gap-1.5 sm:gap-3">
                      {/* Primary CTA: Enquire Now */}
                      <button
                        type="button"
                        onClick={handleEnquireWholesale}
                        className="w-full h-8 sm:h-12 px-2 sm:px-6 rounded-lg sm:rounded-xl font-bold text-[9px] min-[380px]:text-[10px] sm:text-sm uppercase tracking-wider sm:tracking-widest flex items-center justify-center gap-1 sm:gap-2 transition-all shadow-xs sm:shadow-md focus:outline-none cursor-pointer bg-[#183321] text-[#FAF7F2] hover:bg-[#234A30] active:scale-[0.98]"
                      >
                        <span>ENQUIRE NOW</span>
                        <ArrowRight
                          size={12}
                          className="sm:hidden text-[#E5C778]"
                        />
                        <ArrowRight
                          size={16}
                          className="hidden sm:block text-[#E5C778]"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
