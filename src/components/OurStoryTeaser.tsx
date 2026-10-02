import React from "react";
import { ArrowRight } from "lucide-react";
import { PageRoute } from "../types";
import { EditableImage } from "./EditableImage";

interface OurStoryTeaserProps {
  onNavigate: (page: PageRoute) => void;
}

export const OurStoryTeaser: React.FC<OurStoryTeaserProps> = ({
  onNavigate,
}) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F2] border-b border-[#E3D8C4] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetrical Magazine Layout: Image occupies roughly half */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* IMAGE SIDE (6 cols - half visual composition) */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D9CDB8] shadow-xl bg-[#F0EBE0] group">
              <EditableImage
                src="/images/story/from-bihar-with-care.webp"
                alt="Bihar Makhana Craft & Heritage"
                storageKey="home-story-teaser-image"
                label="CHANGE IMAGE"
                className="w-full aspect-[4/3] sm:aspect-auto sm:h-[440px] lg:h-[480px] object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Asymmetrical Offset Magazine Label */}
            <div className="absolute -bottom-4 sm:-bottom-6 right-4 sm:right-10 bg-[#183321] text-[#FAF7F2] px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl shadow-xl border border-[#C59B27]/40">
              <span className="text-[11px] font-bold tracking-widest text-[#E5C778] uppercase block">
                ROOTED IN BIHAR
              </span>
              <span className="text-xs font-serif-brand italic text-[#FAF7F2]">
                Everyday Snacking
              </span>
            </div>
          </div>

          {/* EDITORIAL PROSE SIDE (6 cols) */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 lg:pl-4">
            {/* Small Label */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1.5px] bg-[#C59B27]" />
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                OUR STORY
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-brand font-bold text-[#142B1A] leading-[1.14]">
              “Rooted in Bihar.
              <br />
              <span className="text-[#C59B27] italic font-normal">
                Made for Today.”
              </span>
            </h2>

            {/* Short copy (exact text specified) */}
            <p className="text-base sm:text-lg text-[#3D5042] leading-relaxed max-w-xl pt-1 sm:pt-2">
              Makhé India brings a contemporary identity to one of Bihar’s most
              recognised foods — creating a brand built around origin,
              simplicity and everyday snacking.
            </p>

            {/* Subtle Brand Slogan */}
            <div className="pt-1 sm:pt-2 text-sm font-devanagari text-[#8C6D1F]">
              “जितना साफ़ खाएंगे उतना लंबा जाएंगे”
            </div>

            {/* CTA Button */}
            <div className="pt-3 sm:pt-4">
              <button
                type="button"
                onClick={() => {
                  onNavigate("/our-story");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-5 bg-[#183321] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#234A30] active:scale-[0.98] transition-all shadow-md group focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
              >
                <span>DISCOVER OUR STORY</span>
                <ArrowRight
                  size={16}
                  className="text-[#E5C778] group-hover:translate-x-1.5 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
