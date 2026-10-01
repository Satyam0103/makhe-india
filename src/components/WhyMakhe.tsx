import React from 'react';

interface StampData {
  id: string;
  title: string;
  subline: string;
  tagline: string;
  rotateHover: string;
  renderStamp: () => React.ReactNode;
}

export const WhyMakhe: React.FC = () => {
  const STAMPS: StampData[] = [
    {
      id: 'stamp-jumbo',
      title: '100% WHOLE JUMBO',
      subline: 'SUPERIOR GRADE',
      tagline: 'Hand-inspected large whole kernels',
      rotateHover: 'group-hover:rotate-6',
      renderStamp: () => (
        <svg viewBox="0 0 240 240" className="w-full h-full" fill="none">
          {/* Outer notched decorative ring */}
          <circle cx="120" cy="120" r="110" stroke="#C59B27" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="120" cy="120" r="102" stroke="#183321" strokeWidth="2.5" />
          <circle cx="120" cy="120" r="92" stroke="#C59B27" strokeWidth="1" />
          
          {/* Top & Bottom Stars */}
          <g fill="#C59B27">
            <polygon points="120,32 122,38 128,38 123,42 125,48 120,44 115,48 117,42 112,38 118,38" />
            <polygon points="120,192 122,198 128,198 123,202 125,208 120,204 115,208 117,202 112,198 118,198" />
          </g>

          {/* Arched text paths */}
          <path id="arch-top-1" d="M 40,120 A 80,80 0 0,1 200,120" fill="none" />
          <text fill="#183321" fontSize="11" fontWeight="700" letterSpacing="2.5" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-top-1" startOffset="50%" textAnchor="middle">
              100% WHOLE JUMBO
            </textPath>
          </text>

          <path id="arch-bot-1" d="M 200,120 A 80,80 0 0,1 40,120" fill="none" />
          <text fill="#7A6538" fontSize="9.5" fontWeight="600" letterSpacing="3" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-bot-1" startOffset="50%" textAnchor="middle">
              BIHAR HARVEST
            </textPath>
          </text>

          {/* Center makhana silhouette */}
          <g transform="translate(120, 120)">
            <ellipse cx="0" cy="0" rx="26" ry="24" fill="#F4EFE6" stroke="#C59B27" strokeWidth="1.5" />
            <circle cx="-6" cy="-4" r="16" fill="#FFFFFF" />
            <circle cx="6" cy="4" r="14" fill="#EFE8DA" />
            <path d="M -8 -2 Q 0 -6, 8 -3 Q 4 6, -6 5 Z" fill="#D8C7AA" opacity="0.6" />
          </g>
        </svg>
      )
    },
    {
      id: 'stamp-fibre',
      title: 'HIGH FIBRE',
      subline: 'EVERYDAY GOODNESS',
      tagline: 'Wholesome nutrition for daily routine',
      rotateHover: 'group-hover:-rotate-6',
      renderStamp: () => (
        <svg viewBox="0 0 240 240" className="w-full h-full" fill="none">
          {/* Fine gear / sunburst edge */}
          <circle cx="120" cy="120" r="110" stroke="#183321" strokeWidth="1" strokeDasharray="1.5 3" />
          <circle cx="120" cy="120" r="102" stroke="#C59B27" strokeWidth="2" />
          <circle cx="120" cy="120" r="94" stroke="#183321" strokeWidth="1" />

          {/* Side decorative diamond flourishes */}
          <g fill="#C59B27">
            <polygon points="32,120 36,116 40,120 36,124" />
            <polygon points="200,120 204,116 208,120 204,124" />
          </g>

          {/* Arched text paths */}
          <path id="arch-top-2" d="M 42,120 A 78,78 0 0,1 198,120" fill="none" />
          <text fill="#183321" fontSize="12" fontWeight="800" letterSpacing="3.5" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-top-2" startOffset="50%" textAnchor="middle">
              HIGH FIBRE
            </textPath>
          </text>

          <path id="arch-bot-2" d="M 198,120 A 78,78 0 0,1 42,120" fill="none" />
          <text fill="#7A6538" fontSize="9.5" fontWeight="600" letterSpacing="2.5" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-bot-2" startOffset="50%" textAnchor="middle">
              PURE NOURISHMENT
            </textPath>
          </text>

          {/* Center Botanical Flourish */}
          <g transform="translate(120, 120)">
            <circle cx="0" cy="0" r="28" fill="#F4EFE6" stroke="#183321" strokeWidth="1.2" />
            {/* Elegant leaf / sprout */}
            <path d="M 0 16 C 0 0, 14 -12, 14 -16 C 6 -14, 0 -6, 0 16 Z" fill="#3D5C44" />
            <path d="M 0 16 C 0 2, -12 -8, -12 -12 C -6 -10, 0 -4, 0 16 Z" fill="#C59B27" />
          </g>
        </svg>
      )
    },
    {
      id: 'stamp-gluten',
      title: 'GLUTEN FREE',
      subline: 'NATURAL PURITY',
      tagline: 'Naturally free from gluten for easy digestion',
      rotateHover: 'group-hover:rotate-4',
      renderStamp: () => (
        <svg viewBox="0 0 240 240" className="w-full h-full" fill="none">
          {/* Dual concentric heavy/light rings */}
          <circle cx="120" cy="120" r="110" stroke="#C59B27" strokeWidth="2.5" />
          <circle cx="120" cy="120" r="100" stroke="#183321" strokeWidth="1" />
          <circle cx="120" cy="120" r="92" stroke="#C59B27" strokeWidth="1" strokeDasharray="4 2" />

          {/* Micro dots perimeter */}
          <g fill="#183321" opacity="0.6">
            <circle cx="120" cy="20" r="2" />
            <circle cx="120" cy="220" r="2" />
            <circle cx="20" cy="120" r="2" />
            <circle cx="220" cy="120" r="2" />
          </g>

          {/* Arched text paths */}
          <path id="arch-top-3" d="M 44,120 A 76,76 0 0,1 196,120" fill="none" />
          <text fill="#183321" fontSize="12" fontWeight="800" letterSpacing="3" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-top-3" startOffset="50%" textAnchor="middle">
              GLUTEN FREE
            </textPath>
          </text>

          <path id="arch-bot-3" d="M 196,120 A 76,76 0 0,1 44,120" fill="none" />
          <text fill="#7A6538" fontSize="9.5" fontWeight="600" letterSpacing="3" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-bot-3" startOffset="50%" textAnchor="middle">
              CRISP &amp; LIGHT
            </textPath>
          </text>

          {/* Center Shield / Wheat Motif */}
          <g transform="translate(120, 120)">
            <circle cx="0" cy="0" r="28" fill="#F4EFE6" stroke="#C59B27" strokeWidth="1.2" />
            {/* Natural Wheat Grain Shield */}
            <path d="M 0 -16 L 8 -4 L 0 8 L -8 -4 Z" fill="#C59B27" />
            <path d="M 0 0 L 7 12 L 0 20 L -7 12 Z" fill="#3D5C44" />
          </g>
        </svg>
      )
    },
    {
      id: 'stamp-hygienic',
      title: 'HYGIENICALLY PACKED',
      subline: 'SEALED INTEGRITY',
      tagline: 'Sealed to preserve crunch and natural aroma',
      rotateHover: 'group-hover:-rotate-4',
      renderStamp: () => (
        <svg viewBox="0 0 240 240" className="w-full h-full" fill="none">
          {/* Classic scalloped / decorative seal edge */}
          <circle cx="120" cy="120" r="110" stroke="#183321" strokeWidth="2" />
          <circle cx="120" cy="120" r="102" stroke="#C59B27" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="120" cy="120" r="92" stroke="#183321" strokeWidth="1.5" />

          {/* Top & Bottom Star Clusters */}
          <g fill="#C59B27">
            <polygon points="120,32 122,37 127,37 123,40 125,45 120,42 115,45 117,40 113,37 118,37" />
            <circle cx="106" cy="38" r="1.5" />
            <circle cx="134" cy="38" r="1.5" />
          </g>

          {/* Arched text paths */}
          <path id="arch-top-4" d="M 44,120 A 76,76 0 0,1 196,120" fill="none" />
          <text fill="#183321" fontSize="10" fontWeight="800" letterSpacing="2" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-top-4" startOffset="50%" textAnchor="middle">
              HYGIENICALLY PACKED
            </textPath>
          </text>

          <path id="arch-bot-4" d="M 196,120 A 76,76 0 0,1 44,120" fill="none" />
          <text fill="#7A6538" fontSize="9" fontWeight="600" letterSpacing="2.5" fontFamily="'Plus Jakarta Sans', sans-serif">
            <textPath href="#arch-bot-4" startOffset="50%" textAnchor="middle">
              LOCKED CRUNCH
            </textPath>
          </text>

          {/* Center Lotus Emblem Stamp */}
          <g transform="translate(120, 120)">
            <circle cx="0" cy="0" r="28" fill="#F4EFE6" stroke="#183321" strokeWidth="1.2" />
            {/* Stylized Lotus Petals */}
            <path d="M 0 -12 C 6 -4, 12 4, 0 14 C -12 4, -6 -4, 0 -12 Z" fill="#C59B27" />
            <path d="M 0 0 C 8 2, 14 10, 0 16 C -14 10, -8 2, 0 0 Z" fill="#3D5C44" opacity="0.7" />
          </g>
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-[#FAF7F2] border-b border-[#E8DFCE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center gap-3">
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
              THE MAKHÉ WAY
            </span>
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif-brand font-bold text-[#142B1A] leading-[1.14] text-balance">
            “Simple Snack.<br />
            <span className="text-[#C59B27] italic font-normal">Strong Character.”</span>
          </h2>
        </div>

        {/* 4 Oversized Quality Stamps / Seals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 items-center justify-items-center">
          {STAMPS.map((stamp) => (
            <div
              key={stamp.id}
              className="group flex flex-col items-center text-center w-full max-w-[260px] p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADBCA] shadow-xs hover:shadow-xl transition-all duration-300"
            >
              {/* Oversized Quality Seal */}
              <div
                className={`w-44 h-44 sm:w-48 sm:h-48 relative transition-transform duration-500 ease-out group-hover:scale-105 ${stamp.rotateHover}`}
              >
                {stamp.renderStamp()}
              </div>

              {/* Title & Tagline under stamp */}
              <div className="mt-6 space-y-1.5">
                <span className="text-xs uppercase tracking-widest font-bold text-[#C59B27] font-sans-brand block">
                  {stamp.subline}
                </span>
                <h3 className="text-lg font-serif-brand font-bold text-[#142B1A]">
                  {stamp.title}
                </h3>
                <p className="text-xs text-[#5C7161] leading-relaxed pt-1">
                  {stamp.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
