import React from 'react';
import { EditableImage } from './EditableImage';

interface Stage {
  number: string;
  title: string;
  tagline: string;
  image: string;
  alt: string;
  accent: string;
}

const STAGES: Stage[] = [
  {
    number: '01',
    title: 'BIHAR',
    tagline: 'Where the story begins.',
    image: '/assets/bihar_wetlands.svg',
    alt: 'Serene Bihar wetland waters where makhana harvest begins',
    accent: '#C59B27'
  },
  {
    number: '02',
    title: 'MAKHANA',
    tagline: 'A food deeply associated with Bihar.',
    image: '/images/why-choose/traditional-processing.webp',
    alt: 'Traditional harvesting and sun-dried jumbo makhana selection',
    accent: '#3E5C44'
  },
  {
    number: '03',
    title: 'MAKHÉ INDIA',
    tagline: 'A modern identity for an Indian favourite.',
    image: '/images/products/250g.webp',
    alt: 'Makhé India Apna Makhana 250g packaging',
    accent: '#C59B27'
  },
  {
    number: '04',
    title: 'YOUR HOME',
    tagline: 'Made for everyday snacking.',
    image: '/assets/lifestyle_bowl.svg',
    alt: 'Crisp roasted makhana served for mindful everyday snacking at home',
    accent: '#3E5C44'
  }
];

export const JourneySection: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 bg-[#F6F2E9] overflow-hidden border-b border-[#E5DAC6]">
      {/* Decorative organic lotus stem background path */}
      <div className="absolute inset-0 pointer-events-none opacity-20 hidden lg:block overflow-hidden" aria-hidden="true">
        <svg
          viewBox="0 0 1440 600"
          fill="none"
          stroke="#C59B27"
          strokeWidth="1.5"
          className="w-full h-full object-cover"
        >
          <path
            d="M -100 320 C 260 200, 480 440, 720 280 C 960 120, 1200 380, 1540 240"
            strokeDasharray="6 6"
          />
          <circle cx="280" cy="245" r="5" fill="#C59B27" />
          <circle cx="720" cy="280" r="5" fill="#C59B27" />
          <circle cx="1160" cy="305" r="5" fill="#C59B27" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Block */}
        <div className="max-w-3xl space-y-4 mb-16 sm:mb-20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
              THE JOURNEY OF MAKHÉ
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif-brand font-bold text-[#142B1A] leading-[1.12] text-balance">
            “Bihar Se,<br />
            <span className="text-[#C59B27] italic font-normal">Aapke Ghar Tak.”</span>
          </h2>

          <p className="text-base sm:text-lg text-[#4A5D4F] max-w-2xl leading-relaxed pt-2">
            A simple visual journey celebrating where Makhé begins and how it becomes part of everyday snacking.
          </p>
        </div>

        {/* 4 Stages: Immersive Desktop Horizontal Rhythm / Mobile Vertical Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 items-stretch">
          {STAGES.map((stage, idx) => {
            // Slight vertical stagger on desktop for editorial rhythm
            const staggerClass =
              idx === 1
                ? 'lg:translate-y-8'
                : idx === 3
                ? 'lg:translate-y-8'
                : '';

            return (
              <div
                key={stage.number}
                className={`relative flex flex-col justify-between rounded-2xl bg-[#FAF7F2] p-6 sm:p-7 border border-[#E3D7C3] shadow-xs hover:shadow-lg transition-all duration-300 group ${staggerClass}`}
              >
                {/* Large architectural stage number sitting partially behind */}
                <div
                  className="absolute top-2 right-4 text-7xl sm:text-8xl font-serif-brand font-black text-[#E8DFCF] select-none pointer-events-none group-hover:text-[#DFD0BA] transition-colors leading-none"
                  aria-hidden="true"
                >
                  {stage.number}
                </div>

                {/* Top content */}
                <div className="relative z-10 space-y-3 pt-2">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C59B27]" />
                    <span className="text-[11px] uppercase tracking-widest font-bold text-[#C59B27] font-sans-brand">
                      STAGE {stage.number}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] tracking-tight">
                    {stage.title}
                  </h3>

                  <p className="text-sm text-[#4A5E4F] leading-relaxed min-h-[44px]">
                    {stage.tagline}
                  </p>
                </div>

                {/* Image showcase */}
                <div className="relative z-10 mt-6 pt-2">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F0EBE0] border border-[#DECFB8]">
                    <EditableImage
                      src={stage.image}
                      alt={stage.alt}
                      storageKey={`home-journey-stage-${stage.number}`}
                      label="CHANGE IMAGE"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Bottom subtle connector dot */}
                <div className="mt-4 pt-3 border-t border-[#EDE4D5] flex items-center justify-between text-[11px] text-[#788C7E] font-medium">
                  <span className="tracking-wider uppercase">Makhé Origin</span>
                  <span className="text-[#C59B27] font-serif-brand italic font-semibold">
                    0{idx + 1} / 04
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quiet connecting summary line below */}
        <div className="mt-20 lg:mt-24 text-center">
          <div className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.2em] font-semibold text-[#6E8072]">
            <span className="w-12 h-px bg-[#D6C7AE]" />
            <span>ROOTED IN ORIGIN · PACKED WITH CARE · SERVED AT HOME</span>
            <span className="w-12 h-px bg-[#D6C7AE]" />
          </div>
        </div>
      </div>
    </section>
  );
};
