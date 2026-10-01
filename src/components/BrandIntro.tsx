import React from 'react';
import { ArrowRight } from 'lucide-react';
import { EditableImage } from './EditableImage';

interface BrandIntroProps {
  onDiscoverStory?: () => void;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ onDiscoverStory }) => {
  return (
    <section className="relative py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] overflow-hidden border-b border-[#E8DFCE]">
      {/* Subtle Lotus Botanical Watermark in Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-5 pointer-events-none select-none">
        <svg viewBox="0 0 200 200" fill="none" stroke="#183321" strokeWidth="1">
          <circle cx="100" cy="100" r="80" strokeDasharray="4 4" />
          <path d="M100 20 C85 60, 40 85, 20 100 C60 115, 85 160, 100 180 C115 160, 160 115, 180 100 C160 85, 115 60, 100 20 Z" />
          <circle cx="100" cy="100" r="25" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Editorial & Spacious Typography (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Small Label */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1.5px] bg-[#C59B27]" />
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                FROM BIHAR, WITH CARE
              </span>
            </div>

            {/* Large Editorial Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif-brand font-bold text-[#142B1A] leading-[1.14] text-balance">
              “Har Crunch Mein<br />
              <span className="text-[#C59B27] italic font-normal">Bihar Ki Kahaani.”</span>
            </h2>

            {/* Simplified Editorial Copy */}
            <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-[#3D5042] leading-relaxed max-w-xl pt-1 sm:pt-2">
              <p className="font-serif-brand text-lg sm:text-xl text-[#183321] leading-relaxed">
                “Makhé India celebrates one of Bihar’s most loved foods — makhana — with a fresh identity made for today.”
              </p>
              <p className="text-[#45574A] text-sm sm:text-base leading-relaxed">
                “Simple, satisfying and made for everyday snacking, our aim is to bring the taste and story of Bihar to homes across India.”
              </p>
            </div>

            {/* CTA Button to Our Story */}
            {onDiscoverStory && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onDiscoverStory}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-[#183321] hover:text-[#C59B27] transition-colors font-sans-brand cursor-pointer group"
                >
                  <span>READ OUR STORY</span>
                  <ArrowRight size={14} className="text-[#C59B27] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Three Simple Subtle Brand Labels */}
            <div className="pt-5 sm:pt-6 border-t border-[#E5DAC6] flex flex-wrap items-center gap-y-2 gap-x-5 sm:gap-x-6 text-xs tracking-widest uppercase font-semibold text-[#667A6B]">
              <span className="text-[#183321]">FROM BIHAR</span>
              <span className="text-[#C59B27]" aria-hidden="true">·</span>
              <span className="text-[#183321]">PREMIUM MAKHANA</span>
              <span className="text-[#C59B27]" aria-hidden="true">·</span>
              <span className="text-[#183321]">MADE FOR EVERYDAY</span>
            </div>

          </div>

          {/* RIGHT COLUMN: Real Visual Framing (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D9CDB8] shadow-lg bg-[#FAF7F2] group">
              <EditableImage
                src="/assets/bihar_wetlands.svg"
                alt="Bihar Makhana Farming & Heritage"
                storageKey="home-story-image"
                label="CHANGE IMAGE"
                className="w-full aspect-[4/3] sm:aspect-auto sm:h-96 lg:h-[420px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/40 to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
