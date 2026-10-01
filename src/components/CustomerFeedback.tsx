import React from 'react';
import { Star, Quote } from 'lucide-react';

interface FeedbackCardData {
  id: number;
  name: string;
  city: string;
  rating: number;
  review: string;
}

const PLACEHOLDER_REVIEWS: FeedbackCardData[] = [
  {
    id: 1,
    name: 'Ananya Sharma',
    city: 'Delhi',
    rating: 5,
    review:
      'The makhana tastes really fresh and crunchy. It has become my go-to evening snack, especially when I want something light.'
  },
  {
    id: 2,
    name: 'Rohan Verma',
    city: 'Gurugram',
    rating: 5,
    review:
      'Really liked the quality and freshness. The makhana is crisp, clean and tastes great without feeling like a heavy snack.'
  },
  {
    id: 3,
    name: 'Priya Singh',
    city: 'Patna',
    rating: 5,
    review:
      'Simple, fresh and delicious. My family enjoys it a lot and I especially like the natural taste and crunch.'
  },
  {
    id: 4,
    name: 'Aman Gupta',
    city: 'Noida',
    rating: 5,
    review:
      'Great option for everyday snacking. The quality feels premium and the makhana stays crunchy and fresh.'
  }
];

export const CustomerFeedback: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] border-b border-[#E3D8C4] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-25" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#F2E8D7] to-transparent rounded-full blur-3xl -z-0" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-2 sm:space-y-3 px-2">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
            <span className="text-xs uppercase tracking-[0.28em] font-bold text-[#C59B27] font-sans-brand">
              PURE EXPERIENCES. REAL STORIES.
            </span>
            <span className="w-8 h-[1.5px] bg-[#C59B27]" />
          </div>

          <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl lg:text-[42px] font-sans-brand font-bold text-[#142B1A] tracking-tight leading-tight">
            What people say about Makhé?
          </h2>
        </div>

        {/* 4 Feedback Cards: 2x2 on Mobile & Tablet, 4 in 1 Row on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8 items-stretch">
          {PLACEHOLDER_REVIEWS.map((card) => (
            <div
              key={card.id}
              className="relative bg-white/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 border border-[#E5DAC8] shadow-xs hover:shadow-lg hover:border-[#C59B27]/60 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Subtle Decorative Quotation Mark */}
              <Quote
                className="absolute top-3 right-3 sm:top-5 sm:right-5 w-4 h-4 sm:w-6 sm:h-6 text-[#C59B27]/15 group-hover:text-[#C59B27]/30 transition-colors pointer-events-none select-none"
              />

              {/* Card Top: 5 Stars + Review */}
              <div className="space-y-2 sm:space-y-3 relative z-10">
                <div className="flex items-center gap-0.5 sm:gap-1 text-[#C59B27]" aria-label="5 stars rating">
                  {[...Array(card.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[#C59B27] text-[#C59B27] w-3 h-3 min-[380px]:w-3.5 min-[380px]:h-3.5 sm:w-4 sm:h-4"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[11.5px] min-[380px]:text-[13px] sm:text-[15px] lg:text-base font-serif-brand italic text-[#263C2E] leading-snug sm:leading-relaxed pt-1">
                  “{card.review}”
                </p>
              </div>

              {/* Card Bottom: Reviewer Name & City */}
              <div className="pt-3 sm:pt-4 mt-3 sm:mt-5 border-t border-[#EFE8DC] relative z-10">
                <h3 className="text-xs min-[380px]:text-sm sm:text-base font-bold text-[#142B1A] font-sans-brand tracking-wide">
                  {card.name}
                </h3>
                <p className="text-[10px] min-[380px]:text-[11px] sm:text-xs text-[#8C6420] font-medium tracking-wide mt-0.5 font-sans-brand">
                  {card.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
