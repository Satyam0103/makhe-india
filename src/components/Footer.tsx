import React from "react";
import { Instagram, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { PageRoute } from "../types";
import { useCart } from "../context/CartContext";

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { setIsDrawerOpen } = useCart();

  const handleNavClick = (route: PageRoute) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#0D1C12] text-[#FAF7F2] pt-14 pb-10 overflow-hidden border-t border-[#1C3624]">
      {/* Subtle background brand typography */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none select-none text-[80px] sm:text-[140px] lg:text-[180px] font-serif-brand font-black text-[#FAF7F2]/[0.02] whitespace-nowrap tracking-wider"
        aria-hidden="true"
      >
        MAKHÉ INDIA
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#1A3323]">
          {/* Col 1: Brand Wordmark & Vision (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block bg-[#FAF7F2] p-3 rounded-xl shadow-xs">
              <img
                src="/images/brand/makhe-india-logo-transparent.png"
                alt="Makhé India"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>

            <p className="text-sm text-[#A8BFA9] max-w-md leading-relaxed">
              Makhé India is here to end the era of mixed, low quality makhana.
              We are manufacturer and wholesaler of 100% unmixed, top grade
              Makhana.
            </p>

            <p className="text-sm font-sans-brand font-semibold text-[#E5C778]">
              Superfood for the SUPER YOU.
            </p>

            {/* Social links */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-widest text-[#C59B27] font-bold block mb-2 font-sans-brand">
                COMMUNITY
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/makheindia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#152B1C] border border-[#23472E] flex items-center justify-center text-[#E5C778] hover:bg-[#C59B27] hover:text-[#0D1C12] transition-colors"
                  aria-label="Instagram profile @makheindia"
                  title="Instagram @makheindia"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.instagram.com/makheindia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8EA693] hover:text-[#FAF7F2] transition-colors"
                >
                  @makheindia
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#E5C778] font-sans-brand">
              EXPLORE
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C4D9C8]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/")}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/our-story")}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/blog")}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/wholesale")}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Wholesale
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/contact")}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
            <div className="space-y-3 pt-4">
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#E5C778] font-sans-brand">
                POLICIES
              </h4>
              <ul className="space-y-2.5 text-sm text-[#C4D9C8]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick("/shipping-policy")}
                    className="hover:text-[#FAF7F2] hover:underline transition-colors"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick("/return-refund-policy")}
                    className="hover:text-[#FAF7F2] hover:underline transition-colors"
                  >
                    Return &amp; Refund Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Quick Links & Shopping (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#E5C778] font-sans-brand">
              SHOPPING
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C4D9C8]">
              <li>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Cart
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/account")}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/checkout")}
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  Checkout
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Origin & Enquiries (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#E5C778] font-sans-brand">
              ORIGIN &amp; ENQUIRIES
            </h4>
            <div className="space-y-3 text-xs text-[#A8BFA9]">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#C59B27] shrink-0 mt-0.5" />
                <span>
                  Bihar, India
                  <br />
                  <span className="text-[10px] text-[#78937E]">
                    Makhé India
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#C59B27] shrink-0" />
                <a
                  href="mailto:wecare@makheindia.com"
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  wecare@makheindia.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#C59B27] shrink-0" />
                <a
                  href="tel:+918409118082"
                  className="hover:text-[#FAF7F2] hover:underline transition-colors"
                >
                  +91 8409118082
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Clean Brand Values (No unsupported claims) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7B9582] gap-4">
          <p>© 2026 Makhé India. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6 text-[#A0B7A5]">
            <span>From Bihar, With Care</span>
            <span aria-hidden="true">·</span>
            <span>Apna Makhana</span>
            <span aria-hidden="true">·</span>
            <span>Made For Everyday</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
