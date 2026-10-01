import React from 'react';
import { EditableImage } from './EditableImage';

interface CravingPanel {
  step: string;
  title: string;
  storageKey: string;
  defaultImage: string;
  alt: string;
}

const PANELS: CravingPanel[] = [
  {
    step: 'STEP 1',
    title: 'Bhookh Ne Sataya',
    storageKey: 'four-pm-craving-step-1',
    defaultImage: '/images/craving/step-1.webp',
    alt: 'Step 1: Bhookh Ne Sataya'
  },
  {
    step: 'STEP 2',
    title: 'Makhé Mangaya',
    storageKey: 'four-pm-craving-step-2',
    defaultImage: '/images/craving/step-2.webp',
    alt: 'Step 2: Makhé Mangaya'
  },
  {
    step: 'STEP 3',
    title: 'Guilt-Free Khaya!',
    storageKey: 'four-pm-craving-step-3',
    defaultImage: '/images/craving/step-3.webp',
    alt: 'Step 3: Guilt-Free Khaya!'
  }
];

export const FourPmCraving: React.FC = () => {
  return (
    <section className="py-14 sm:py-24 lg:py-28 bg-[#FAF7F2] border-b border-[#E3D8C4] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#F2E8D7] to-transparent rounded-full blur-3xl -z-0" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Intro */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
            <span className="text-xs uppercase tracking-[0.28em] font-bold text-[#C59B27] font-sans-brand">
              THE CRAVING ANGLE
            </span>
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif-brand font-bold text-[#142B1A] tracking-tight leading-[1.12]">
            From craving to <span className="text-[#C59B27] italic font-normal">guilt-free crunch.</span>
          </h2>
        </div>

        {/* 
          3 Individual Storytelling Cards:
          - Small spacing between cards (16px–24px on desktop, smaller on mobile)
          - Sharp rectangular cards with individual visual boundaries
          - Text positioned at TOP-LEFT of each card, left-aligned
          - Reduced title size so imagery remains dominant
          - Only STEP + MAIN TITLE
        */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6 w-full">
          {PANELS.map((panel) => (
            <div
              key={panel.storageKey}
              className="relative w-full h-[250px] min-[380px]:h-[300px] sm:h-[420px] md:h-[480px] lg:h-[540px] rounded-none overflow-hidden group flex flex-col justify-start border border-[#DFD4C2] shadow-xs sm:shadow-sm hover:shadow-md transition-shadow bg-[#142B1A]"
            >
              {/* Full-bleed background image with sharp corners */}
              <div className="absolute inset-0 w-full h-full overflow-hidden rounded-none">
                <EditableImage
                  src={panel.defaultImage}
                  alt={panel.alt}
                  storageKey={panel.storageKey}
                  label="CHANGE IMAGE"
                  objectFit="cover"
                  containerClassName="w-full h-full rounded-none"
                  className="w-full h-full object-cover object-center rounded-none group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Minimal localized top gradient for crisp top-left text readability without darkening image */}
              <div
                className="absolute inset-x-0 top-0 h-24 sm:h-32 lg:h-36 bg-gradient-to-b from-black/65 via-black/20 to-transparent pointer-events-none z-10 rounded-none"
                aria-hidden="true"
              />

              {/* Text Overlay Content: positioned at TOP-LEFT, left-aligned, balanced size */}
              <div className="absolute top-2.5 left-2.5 sm:top-5 sm:left-5 lg:top-6 lg:left-6 z-20 text-left flex flex-col items-start pointer-events-none max-w-[92%]">
                {/* STEP label */}
                <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs lg:text-xs font-sans-brand font-bold tracking-[0.18em] sm:tracking-[0.25em] text-[#E5C778] uppercase drop-shadow-sm mb-0.5 sm:mb-1">
                  {panel.step}
                </span>

                {/* Main title: balanced & reduced font size */}
                <h3 className="text-xs min-[380px]:text-sm sm:text-lg lg:text-xl font-serif-brand font-bold text-[#FAF7F2] leading-tight sm:leading-snug [text-shadow:_0_2px_8px_rgba(0,0,0,0.95),_0_1px_3px_rgba(0,0,0,0.95)]">
                  {panel.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
