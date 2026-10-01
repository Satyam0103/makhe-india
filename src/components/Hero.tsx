import React from 'react';
import { PageRoute } from '../types';
import { EditableImage } from './EditableImage';
import { useEditMode } from '../context/EditModeContext';

interface HeroProps {
  onNavigate?: (page: PageRoute) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { isEditMode } = useEditMode();

  const handleScrollToShop = () => {
    if (isEditMode) return;
    const el = document.getElementById('powerpacks');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigate) {
      onNavigate('/');
    }
  };

  return (
    <section className="relative w-full bg-[#160E09] overflow-hidden select-none">
      {/* 
        Official Makhé India Hero Banner
        Contains the authentic brand campaign:
        “जितना साफ़ खाएंगे उतना लंबा जाएंगे”
        Responsive across desktop, tablet and mobile without ugly stretching.
      */}
      <div
        className="w-full flex items-center justify-center bg-[#160E09] cursor-pointer relative"
        onClick={handleScrollToShop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleScrollToShop();
          }
        }}
        aria-label="Makhé India — जितना साफ़ खाएंगे उतना लंबा जाएंगे. Click to shop premium jumbo makhana."
      >
        <EditableImage
          src="/images/hero/makhe-hero.webp"
          alt="Makhé India — जितना साफ़ खाएंगे उतना लंबा जाएंगे • 100% Whole Jumbo Makhana"
          storageKey="home-hero-banner"
          label="CHANGE BANNER IMAGE"
          objectFit="contain"
          className="w-full h-auto max-w-full block select-none object-contain transition-opacity duration-300"
          loading="eager"
          fetchPriority="high"
          containerClassName="w-full flex items-center justify-center overflow-hidden"
        />
      </div>
    </section>
  );
};
