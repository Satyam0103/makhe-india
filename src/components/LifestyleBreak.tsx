import React from 'react';
import { EditableImage } from './EditableImage';

export const LifestyleBreak: React.FC = () => {
  return (
    <section className="relative w-full bg-[#1A0D07] overflow-hidden">
      {/* 
        VISUAL / LIFESTYLE BREAK:
        Large, immersive visual break featuring slow-roasted crisp jumbo makhana 
        in a traditional Indian hammered brass bowl. 
        Creates visual breathing space between dense information sections.
      */}
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[580px]">
        <EditableImage
          src="/assets/lifestyle_bowl.svg"
          alt="Golden roasted crisp jumbo makhana in antique Indian brass katori bowl"
          storageKey="home-lifestyle-image"
          label="CHANGE IMAGE"
          className="w-full h-full object-cover object-center"
          containerClassName="w-full h-full"
          loading="lazy"
        />

        {/* Minimal Editorial Overlay with measured scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140B06]/85 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#E5C778]">
              MINDFUL RITUALS
            </span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold text-[#FAF7F2] mt-2 leading-tight">
              Crunch That Speaks Purity.
            </h3>
            <p className="font-devanagari text-base sm:text-lg text-[#D4B36A] mt-1">
              हर दाने में प्रकृति का संपूर्ण पोषण।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
