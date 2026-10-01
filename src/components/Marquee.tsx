import React from 'react';

export const Marquee: React.FC = () => {
  const marqueeItems = [
    'Protein Powerhouse',
    'Guilt Free Snacking',
    'Natural & Pure',
    'No Broken Piece',
    'Handpicked Makhana',
    'FSSAI Approved',
    'Direct from Farm'
  ];

  // Repeat items in each half to ensure seamless loop on wide displays
  const halfItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="w-full bg-[#112417] border-y border-[#C59B27]/30 py-3.5 sm:py-4 overflow-hidden select-none">
      <div className="animate-marquee-infinite flex items-center whitespace-nowrap">
        {/* Half 1 */}
        <div className="flex items-center space-x-6 sm:space-x-8 pr-6 sm:pr-8">
          {halfItems.map((text, idx) => (
            <div key={`half1-${idx}`} className="flex items-center space-x-6 sm:space-x-8">
              <span className="text-[#C59B27] text-xs sm:text-sm font-bold select-none">•</span>
              <span className="text-[#FAF7F2] font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase font-sans-brand">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Half 2 (exact duplicate for seamless -50% translateX loop) */}
        <div className="flex items-center space-x-6 sm:space-x-8 pr-6 sm:pr-8" aria-hidden="true">
          {halfItems.map((text, idx) => (
            <div key={`half2-${idx}`} className="flex items-center space-x-6 sm:space-x-8">
              <span className="text-[#C59B27] text-xs sm:text-sm font-bold select-none">•</span>
              <span className="text-[#FAF7F2] font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase font-sans-brand">
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
