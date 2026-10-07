import React from "react";
import { PageRoute } from "../types";

interface HeroProps {
  onNavigate?: (page: PageRoute) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const handleScrollToShop = () => {
    const el = document.getElementById("powerpacks");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else if (onNavigate) {
      onNavigate("/");
    }
  };

  return (
    <section className="relative w-full bg-[#160E09] overflow-hidden select-none">
      <div
        className="w-full flex items-center justify-center bg-[#160E09] cursor-pointer relative"
        onClick={handleScrollToShop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleScrollToShop();
          }
        }}
        aria-label="Makhé India — जितना साफ़ खाएंगे उतना लंबा जाएंगे. Click to shop premium jumbo makhana."
      >
        <img
          src="/images/hero/makhe-hero-banner.jpg"
          alt="Makhé India — जितना साफ़ खाएंगे उतना लंबा जाएंगे • 100% Whole Jumbo Makhana"
          className="block w-full h-auto max-w-full select-none object-contain transition-opacity duration-300"
          loading="eager"
          fetchPriority="high"
        />
      </div>
    </section>
  );
};
