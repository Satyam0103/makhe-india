import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { PageRoute } from '../types';

interface BlogProps {
  onNavigate: (page: PageRoute) => void;
}

export const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[#FAF7F2] min-h-[70vh] flex flex-col justify-between">
      {/* Editorial Header Section */}
      <section className="pt-12 sm:pt-16 pb-12 sm:pb-20 border-b border-[#E8DFCE] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb / Back button */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#687C6C] hover:text-[#183321] transition-colors mb-8 cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5">
              <span className="w-8 h-[1.5px] bg-[#C59B27]" />
              <span className="text-xs uppercase tracking-[0.28em] font-bold text-[#C59B27] font-sans-brand">
                THE EDITORIAL JOURNAL
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-brand font-bold text-[#142B1A] tracking-tight leading-[1.15]">
              Stories from Makhé
            </h1>

            <p className="text-base sm:text-lg text-[#3D5042] font-sans-brand max-w-2xl leading-relaxed pt-1">
              Discover stories about makhana, Bihar, mindful snacking, nutrition, sourcing and the journey behind Makhé India.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area: Minimal Clean Empty State */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center justify-center">
        <div className="text-center py-12 px-6 sm:px-12 rounded-3xl bg-[#F6F1E8] border border-[#DFD4C2] max-w-xl mx-auto w-full shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#ECE2D0] border border-[#DECDB3] flex items-center justify-center text-[#8C6420]">
            <BookOpen size={24} strokeWidth={1.8} />
          </div>

          <h2 className="text-xl sm:text-2xl font-serif-brand font-bold text-[#142B1A]">
            Fresh stories are coming soon.
          </h2>

          <p className="text-sm text-[#55695A] font-sans-brand max-w-md mx-auto leading-relaxed">
            We are curating deeply researched field dispatches, traditional harvesting folklore, and seasonal recipe ideas directly from Mithila.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="w-full sm:w-auto px-7 py-3 bg-[#183321] hover:bg-[#24492E] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] rounded-full transition-colors cursor-pointer shadow-sm"
            >
              Explore Products
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/our-story')}
              className="w-full sm:w-auto px-7 py-3 border border-[#183321] hover:bg-[#183321]/5 text-[#183321] font-bold text-xs uppercase tracking-[0.15em] rounded-full transition-colors cursor-pointer"
            >
              Read Our Story
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
