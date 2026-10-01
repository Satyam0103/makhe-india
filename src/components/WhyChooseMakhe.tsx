import React from 'react';
import { EditableImage } from './EditableImage';

interface WhyChooseCard {
  number: string;
  title: string;
  bullets: string[];
  storageKey: string;
  defaultImage: string;
  alt: string;
  objectPosition?: string;
}

const CARDS: WhyChooseCard[] = [
  {
    number: '01',
    title: 'Native Sourcing',
    bullets: [
      'Direct from trusted Farmer.',
      'Single-Origin Wetland Harvest.',
      'Local-region Ingredients.'
    ],
    storageKey: 'why-makhe-native-sourcing',
    defaultImage: '/images/why-choose/native-sourcing.webp',
    alt: 'Native Makhana Sourcing from Bihar Wetlands',
    objectPosition: 'center 28%'
  },
  {
    number: '02',
    title: 'Traditional Processing',
    bullets: [
      'Naturally Popped. Never Bleached.',
      'Traditional Hand Process.',
      'Minimal-Impact Processing.'
    ],
    storageKey: 'why-makhe-traditional-processing',
    defaultImage: '/images/why-choose/traditional-processing.webp',
    alt: 'Traditional Makhana Roasting and Hand Popping',
    objectPosition: 'center 35%'
  },
  {
    number: '03',
    title: 'Modern Cleaning & Hygienic Packaging',
    bullets: [
      'Impurities Out. Goodness In.',
      'Only the Best & Pure Makhana make the cut.',
      'Pond-to-Pouch Traceability.'
    ],
    storageKey: 'why-makhe-modern-cleaning',
    defaultImage: '/images/why-choose/modern-cleaning.webp',
    alt: 'Hygienic Sorting and Modern Packaging',
    objectPosition: 'center 35%'
  },
  {
    number: '04',
    title: 'Healthy Snacking',
    bullets: [
      'Natural, Healthy & Guilt-free Snacking.',
      'Protein & Fibre Rich.',
      'Loved by Kids. Respected by Elders.'
    ],
    storageKey: 'why-makhe-healthy-snacking',
    defaultImage: '/images/why-choose/healthy-snacking.webp',
    alt: 'Crisp and Healthy Roasted Makhana Snacking',
    objectPosition: 'center 38%'
  }
];

export const WhyChooseMakhe: React.FC = () => {
  return (
    <section id="why-choose" className="py-20 lg:py-28 bg-[#FAF7F2] border-b border-[#E5DAC6] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-b from-[#F2E8D7] to-transparent rounded-full blur-3xl -z-0" />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3 px-2">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
            <span className="text-xs uppercase tracking-[0.28em] font-bold text-[#C59B27] font-sans-brand">
              PURITY &amp; PROMISE
            </span>
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
          </div>

          <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl lg:text-[44px] xl:text-5xl font-serif-brand font-bold text-[#142B1A] tracking-tight leading-tight sm:whitespace-nowrap">
            WHY CHOOSE MAKHÉ INDIA?
          </h2>
        </div>

        {/* 2x2 Editorial Cards Grid — STRICTLY 2x2 ON ALL SCREENS */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-10 items-stretch">
          {CARDS.map((card) => (
            <div
              key={card.number}
              className="relative group rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DFD4C2] shadow-xs sm:shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-end h-[300px] min-[380px]:h-[330px] sm:h-[420px] lg:h-[470px] bg-[#142B1A]"
            >
              {/* Full-bleed background image covering ENTIRE card from top to bottom */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <EditableImage
                  src={card.defaultImage}
                  alt={card.alt}
                  storageKey={card.storageKey}
                  label="CHANGE IMAGE"
                  objectFit="cover"
                  objectPosition={card.objectPosition}
                  overlayPosition="top-right"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out select-none"
                  containerClassName="w-full h-full"
                />
              </div>

              {/* Subtle transparent gradient overlay behind text area for crisp readability while keeping image visible */}
              <div
                className="absolute inset-x-0 bottom-0 h-[65%] sm:h-[58%] bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none z-10"
                aria-hidden="true"
              />

              {/* Card Text Content: Transparent Overlay on lower portion of image */}
              <div className="relative z-20 p-2.5 min-[380px]:p-3 sm:p-5 lg:p-7 flex flex-col justify-end space-y-1.5 sm:space-y-3 pointer-events-none">
                <h3 className="text-xs min-[380px]:text-sm sm:text-lg lg:text-xl xl:text-2xl font-serif-brand font-bold text-[#FAF7F2] tracking-tight leading-snug drop-shadow-sm">
                  {card.title}
                </h3>

                <div className="border-t border-white/25 pt-1.5 sm:pt-2.5">
                  <ul className="space-y-1 sm:space-y-1.5">
                    {card.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-1.5 sm:gap-2 text-[9px] min-[380px]:text-[10px] sm:text-xs lg:text-[13.5px] leading-tight sm:leading-snug text-[#FAF7F2]/95 drop-shadow-xs"
                      >
                        <span className="text-[#E5C778] font-bold text-[9px] sm:text-xs lg:text-sm leading-none select-none mt-0.5 shrink-0">
                          •
                        </span>
                        <span className="font-medium text-[#FAF7F2]">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
