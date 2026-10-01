import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { PageRoute } from '../types';
import { EditableImage } from '../components/EditableImage';

interface OurStoryProps {
  onNavigate: (page: PageRoute) => void;
}

export const OurStory: React.FC<OurStoryProps> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen overflow-x-hidden selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      
      {/* ==================================================
          SECTION 1 — OUR STORY HERO
          Asymmetric editorial composition:
          large typography on one side, large image on the other.
          Image breaks slightly outside normal grid on desktop.
          Mobile stacks naturally (headline first, image second).
      ================================================== */}
      <section className="relative pt-12 sm:pt-16 lg:pt-24 pb-20 sm:pb-28 lg:pb-36 bg-[#FAF7F2] border-b border-[#E5DAC6] overflow-hidden">
        
        {/* Subtle decorative background water lily / ring watermark */}
        <div className="absolute top-1/2 -right-32 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-[#D9CBB3]/40 pointer-events-none" />
        <div className="absolute top-1/2 -right-48 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#D9CBB3]/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Back to Home Navigation */}
          <div className="mb-10 sm:mb-14">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-[#8C6D1F] hover:text-[#142B1A] font-bold font-sans-brand transition-colors group cursor-pointer"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* TYPOGRAPHY SIDE (7 columns on desktop) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1.5px] bg-[#C59B27]" />
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                  OUR STORY
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-brand font-bold text-[#142B1A] leading-[1.08] tracking-tight">
                “Rooted in Bihar.<br />
                <span className="text-[#C59B27] italic font-normal">Made for Today.”</span>
              </h1>

              {/* Devanagari Cultural Anchor */}
              <div className="font-devanagari text-lg sm:text-xl text-[#8C6D1F] font-semibold border-l-2 border-[#C59B27] pl-4 py-1">
                बिहार की माटी और परंपरा से निकला एक सच्चा भारतीय स्वाद।
              </div>

              {/* Supporting Copy */}
              <div className="space-y-4 max-w-xl text-base sm:text-lg text-[#3D5042] leading-relaxed pt-2">
                <p>
                  Makhé India is our contemporary take on one of Bihar’s most recognised foods — makhana.
                </p>
                <p>
                  A familiar Indian snack, presented with a fresh identity for modern everyday living.
                </p>
              </div>

              {/* Editorial Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-[#E5DAC6]">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold block">
                    ORIGIN
                  </span>
                  <span className="text-base font-serif-brand font-bold text-[#142B1A]">
                    Bihar, India
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#D8CCB5]" />
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold block">
                    SELECTION
                  </span>
                  <span className="text-base font-serif-brand font-bold text-[#142B1A]">
                    100% Whole Jumbo
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#D8CCB5]" />
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold block">
                    CHARACTER
                  </span>
                  <span className="text-base font-serif-brand font-bold text-[#142B1A]">
                    Everyday Snacking
                  </span>
                </div>
              </div>

            </div>

            {/* IMAGE SIDE (5 columns on desktop - asymmetric, breaks out of normal grid) */}
            <div className="lg:col-span-5 relative lg:translate-x-4">
              <div className="relative">
                
                {/* Main Asymmetric Image Container */}
                <div className="relative rounded-3xl overflow-hidden border border-[#D9CBB3] shadow-2xl bg-[#EBE4D5] group">
                  <EditableImage
                    src="/assets/bihar_wetlands.svg"
                    alt="Makhana Harvest in Bihar"
                    storageKey="our-story-hero"
                    label="CHANGE BANNER IMAGE"
                    className="w-full h-80 sm:h-[460px] lg:h-[540px] object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Architectural Badge */}
                <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 bg-[#183321] text-[#FAF7F2] p-5 sm:p-6 rounded-2xl shadow-2xl border border-[#C59B27]/40 max-w-[260px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Compass size={16} className="text-[#E5C778]" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#E5C778]">
                      FROM BIHAR, WITH CARE
                    </span>
                  </div>
                  <p className="text-xs text-[#E3D8C4] leading-snug font-sans-brand">
                    A timeless food reimagined with thoughtful clarity.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 2 — A FOOD WITH ROOTS
          Storytelling section with oversized decorative "BIHAR"
          typography in background with very low contrast.
          Visually driven with supplied Bihar/farm imagery.
      ================================================== */}
      <section className="relative py-24 sm:py-32 lg:py-40 bg-[#F4EFE6] border-b border-[#E5DAC6] overflow-hidden">
        
        {/* Oversized Decorative Background Typography */}
        <div 
          aria-hidden="true" 
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none select-none overflow-hidden"
        >
          <span className="text-[18vw] font-serif-brand font-black text-[#142B1A]/[0.035] tracking-widest leading-none block uppercase">
            BIHAR
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* REAL Bihar Farm/Craft Image */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border border-[#D9CBB3] shadow-xl bg-[#EBE4D5] group">
                <EditableImage
                  src="/assets/bihar_craft.svg"
                  alt="Traditional Bihar Makhana Craft and Grading"
                  storageKey="our-story-craft-image"
                  label="CHANGE IMAGE"
                  className="w-full h-80 sm:h-[420px] object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                
                {/* Image caption badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-[#142B1A]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#C59B27]/30 text-[#FAF7F2]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5C778] block">
                    HARVEST &amp; SELECTION
                  </span>
                  <span className="text-xs text-[#E3D8C4] font-serif-brand italic">
                    Generations of understanding the harvest.
                  </span>
                </div>
              </div>
            </div>

            {/* Narrative Prose */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 lg:pl-6">
              
              {/* Small label */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1.5px] bg-[#C59B27]" />
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                  FROM BIHAR
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A] leading-[1.15]">
                “Some foods carry<br />
                <span className="text-[#C59B27] italic font-normal">a place with them.”</span>
              </h2>

              {/* Copy */}
              <div className="space-y-4 text-base sm:text-lg text-[#3D5042] leading-relaxed max-w-xl">
                <p>
                  Makhana has a strong association with Bihar and has long been part of food traditions across the region.
                </p>
                <p>
                  For Makhé India, that sense of origin is an important part of the brand story.
                </p>
              </div>

              {/* Quote Accent */}
              <div className="pt-4 border-t border-[#DFD3BE] flex items-start gap-4">
                <span className="text-3xl font-serif-brand text-[#C59B27] leading-none">“</span>
                <p className="text-sm sm:text-base font-serif-brand italic text-[#142B1A] leading-snug">
                  A food that belongs to quiet ponds, sunlit fields, and celebratory gatherings — now prepared with fresh precision.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 3 — MAKHANA VISUAL MOMENT
          Full-width visual section focused on the PRODUCT itself.
          Campaign-poster feeling. NOT inside a card.
          Oversized typography: APNA MAKHANA.
          Smaller copy: A familiar favourite. A fresh Makhé identity.
      ================================================== */}
      <section className="relative py-28 sm:py-36 lg:py-44 bg-[#142B1A] text-[#FAF7F2] overflow-hidden border-b border-[#23422C]">
        
        {/* Background Image / Ambient Treatment */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-luminosity">
          <img
            src="/assets/lifestyle_bowl.svg"
            alt="Whole Roasted Makhana in Katori"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ambient Dark Forest Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E1D13] via-[#142B1A]/95 to-[#0E1D13] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Oversized Campaign Typography */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center gap-3">
                <span className="w-10 h-[1.5px] bg-[#E5C778]" />
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#E5C778] font-sans-brand">
                  THE HERO INGREDIENT
                </span>
              </div>

              {/* Oversized Typography */}
              <h2 className="text-5xl sm:text-7xl lg:text-8xl font-serif-brand font-bold tracking-tight text-[#FAF7F2] leading-[0.95]">
                APNA<br />
                <span className="text-[#E5C778] italic font-normal">MAKHANA</span>
              </h2>

              {/* Smaller Copy */}
              <div className="space-y-3 pt-3 max-w-lg">
                <p className="text-xl sm:text-2xl font-serif-brand text-[#FAF7F2]/90 leading-snug">
                  A familiar favourite.<br />
                  A fresh Makhé identity.
                </p>
                <p className="text-sm sm:text-base text-[#D4C3A3] leading-relaxed">
                  Clean, crisp, and 100% whole jumbo kernels. Harvested with patience, selected with care, and packed to preserve genuine crunch.
                </p>
              </div>

              {/* Distinctive Product Attributes */}
              <div className="pt-6 flex flex-wrap gap-3 sm:gap-4">
                {['100% Whole Jumbo', 'High Fibre', 'Gluten Free', 'Hygienically Packed'].map((pill) => (
                  <span
                    key={pill}
                    className="px-4 py-2 rounded-full border border-[#E5C778]/40 bg-[#1E3B25]/60 text-xs uppercase tracking-wider font-semibold text-[#E5C778]"
                  >
                    {pill}
                  </span>
                ))}
              </div>

            </div>

            {/* Direct Product Imagery Spotlight */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-md">
                
                {/* Glowing halo behind packaging/bowl */}
                <div className="absolute inset-0 rounded-full bg-[#E5C778]/10 blur-3xl group-hover:bg-[#E5C778]/20 transition-all duration-700 pointer-events-none" />

                <div className="relative rounded-3xl overflow-hidden border border-[#E5C778]/30 shadow-2xl bg-[#183321]/90 p-4 sm:p-6 backdrop-blur-sm">
                  <EditableImage
                    src="/images/story/our-story-lifestyle.webp"
                    alt="Apna Makhana - Roasted Whole Foxnuts"
                    storageKey="our-story-lifestyle-image"
                    label="CHANGE IMAGE"
                    className="w-full h-72 sm:h-88 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="text-center pt-4 border-t border-[#2A4B33]">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E5C778] block">
                      APNA MAKHANA
                    </span>
                    <span className="text-xs text-[#FAF7F2]/70 font-devanagari">
                      अपना मखाना • शुद्ध कुरकुरा स्वाद
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 4 — BRAND PHILOSOPHY: WHAT MAKHÉ STANDS FOR
          3 Principles:
          01 ROOTED (A brand identity inspired by where makhana comes from.)
          02 SIMPLE (Straightforward food and straightforward communication.)
          03 EVERYDAY (Made to fit naturally into modern snacking moments.)
          Large numbers, editorial typography, 3-column layout on desktop,
          subtle dividers, NO generic cards.
      ================================================== */}
      <section className="py-24 sm:py-32 lg:py-36 bg-[#FAF7F2] border-b border-[#E5DAC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] block font-sans-brand mb-3">
              BRAND PHILOSOPHY
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A] leading-tight">
              What Makhé Stands For
            </h2>
            <div className="w-12 h-[2px] bg-[#C59B27] mx-auto mt-5" />
          </div>

          {/* Three-Column Editorial Layout with Subtle Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5DAC6]">
            
            {/* Principle 01 */}
            <div className="py-10 md:py-4 md:px-8 lg:px-12 flex flex-col justify-between space-y-6 group">
              <div>
                <span className="text-6xl sm:text-7xl font-serif-brand font-light text-[#D9CBB3] group-hover:text-[#C59B27] transition-colors duration-300 block mb-4">
                  01
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] tracking-wide mb-3">
                  ROOTED
                </h3>
                <p className="text-base text-[#3D5042] leading-relaxed">
                  A brand identity inspired by where makhana comes from.
                </p>
              </div>
              <div className="pt-4 border-t border-[#EFE8DA]">
                <span className="text-xs font-devanagari text-[#8C6D1F] font-semibold">
                  माटी से जुड़ा, गर्व से भारतीय
                </span>
              </div>
            </div>

            {/* Principle 02 */}
            <div className="py-10 md:py-4 md:px-8 lg:px-12 flex flex-col justify-between space-y-6 group">
              <div>
                <span className="text-6xl sm:text-7xl font-serif-brand font-light text-[#D9CBB3] group-hover:text-[#C59B27] transition-colors duration-300 block mb-4">
                  02
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] tracking-wide mb-3">
                  SIMPLE
                </h3>
                <p className="text-base text-[#3D5042] leading-relaxed">
                  Straightforward food and straightforward communication.
                </p>
              </div>
              <div className="pt-4 border-t border-[#EFE8DA]">
                <span className="text-xs font-devanagari text-[#8C6D1F] font-semibold">
                  साफ़ बात, साफ़ खाना
                </span>
              </div>
            </div>

            {/* Principle 03 */}
            <div className="py-10 md:py-4 md:px-8 lg:px-12 flex flex-col justify-between space-y-6 group">
              <div>
                <span className="text-6xl sm:text-7xl font-serif-brand font-light text-[#D9CBB3] group-hover:text-[#C59B27] transition-colors duration-300 block mb-4">
                  03
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] tracking-wide mb-3">
                  EVERYDAY
                </h3>
                <p className="text-base text-[#3D5042] leading-relaxed">
                  Made to fit naturally into modern snacking moments.
                </p>
              </div>
              <div className="pt-4 border-t border-[#EFE8DA]">
                <span className="text-xs font-devanagari text-[#8C6D1F] font-semibold">
                  हर दिन, हर पल का साथी
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 5 — OLD FAVOURITE / NEW IDENTITY
          Visually memorable split section.
          Large statement: “An old favourite. A new identity.”
          Official Makhé India logo prominently displayed.
      ================================================== */}
      <section className="py-24 sm:py-32 lg:py-36 bg-[#F4EFE6] border-b border-[#E5DAC6] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Statement & Narrative */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1.5px] bg-[#C59B27]" />
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                  THE IDENTITY
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif-brand font-bold text-[#142B1A] leading-[1.12]">
                “An old favourite.<br />
                <span className="text-[#C59B27] italic font-normal">A new identity.”</span>
              </h2>

              <p className="text-base sm:text-lg text-[#3D5042] leading-relaxed max-w-xl">
                We believe Indian foods don’t need reinventing; they need honouring. Makhé India unites the authentic culinary pride of Bihar with clean, honest presentation crafted for kitchens, desks, and living rooms across the nation.
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-3 bg-[#EAE2D2] px-5 py-3 rounded-xl border border-[#D9CBB3]">
                  <ShieldCheck size={18} className="text-[#142B1A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#142B1A]">
                    Simple Snacking. Honest Intent.
                  </span>
                </div>
              </div>

            </div>

            {/* Right: Official Logo Showcase */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative bg-[#FAF7F2] p-8 sm:p-12 lg:p-14 rounded-3xl border border-[#D9CBB3] shadow-xl w-full max-w-lg text-center space-y-6">
                
                {/* Official Brand Mark */}
                <div className="w-48 sm:w-60 mx-auto">
                  <img
                    src="/images/brand/makhe-india-logo.png"
                    alt="Official Makhé India Emblem and Logo"
                    className="w-full h-auto object-contain drop-shadow-md"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E5DAC6]">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D1F] block">
                    MAKHÉ INDIA
                  </span>
                  <p className="font-devanagari text-base sm:text-lg text-[#142B1A] font-semibold">
                    “जितना साफ़ खाएंगे उतना लंबा जाएंगे”
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 6 — EDITORIAL IMAGE COLLAGE: FROM BIHAR, WITH CARE
          Montage of real supplied assets: Bihar wetlands,
          harvest craft, lifestyle bowl, and pack design.
      ================================================== */}
      <section className="py-24 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DAC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] block font-sans-brand mb-2">
                A VISUAL RECORD
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
                From Bihar, With Care.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#506354] max-w-md font-sans-brand">
              Capturing the serene water ponds, the skilled hands, and the pure crunch that arrives in your pantry.
            </p>
          </div>

          {/* Mosaic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Mosaic Card 1 */}
            <div className="relative rounded-2xl overflow-hidden border border-[#D9CBB3] shadow-md bg-[#EBE4D5] group h-72 sm:h-80">
              <EditableImage
                src="/assets/bihar_wetlands.svg"
                alt="Bihar Makhana Ponds"
                storageKey="our-story-gallery-1"
                label="CHANGE IMAGE"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/80 via-transparent to-transparent flex items-end p-6 pointer-events-none">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C778] block">
                    ORIGIN
                  </span>
                  <p className="text-sm font-serif-brand font-bold text-[#FAF7F2]">
                    Natural wetland waters of Bihar
                  </p>
                </div>
              </div>
            </div>

            {/* Mosaic Card 2 */}
            <div className="relative rounded-2xl overflow-hidden border border-[#D9CBB3] shadow-md bg-[#EBE4D5] group h-72 sm:h-80">
              <EditableImage
                src="/assets/bihar_craft.svg"
                alt="Artisan Grading and Selection"
                storageKey="our-story-gallery-2"
                label="CHANGE IMAGE"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/80 via-transparent to-transparent flex items-end p-6 pointer-events-none">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C778] block">
                    SELECTION
                  </span>
                  <p className="text-sm font-serif-brand font-bold text-[#FAF7F2]">
                    Carefully graded for jumbo kernel puff
                  </p>
                </div>
              </div>
            </div>

            {/* Mosaic Card 3 */}
            <div className="relative rounded-2xl overflow-hidden border border-[#D9CBB3] shadow-md bg-[#EBE4D5] group h-72 sm:h-80 sm:col-span-2 lg:col-span-1">
              <EditableImage
                src="/assets/lifestyle_bowl.svg"
                alt="Crisp roasted foxnuts in traditional katori"
                storageKey="our-story-gallery-3"
                label="CHANGE IMAGE"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/80 via-transparent to-transparent flex items-end p-6 pointer-events-none">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C778] block">
                    EVERYDAY SNACKING
                  </span>
                  <p className="text-sm font-serif-brand font-bold text-[#FAF7F2]">
                    Light, satisfying, and wholesome
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 7 — TRANSITION BACK TO PRODUCT / SHOPPING
          Headline: “Ab Crunch Ka Time Hai.”
          Supporting: “Discover Makhé India’s Apna Makhana.”
          Direct CTA to view powerpacks / shop.
      ================================================== */}
      <section className="py-20 sm:py-28 lg:py-32 bg-[#183321] text-[#FAF7F2] relative overflow-hidden">
        
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-[#C59B27]/20 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-[#C59B27]/20 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6 sm:space-y-8">
          
          <div className="inline-flex items-center gap-2 bg-[#234A30] text-[#E5C778] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-[#C59B27]/30">
            <Sparkles size={14} />
            <span>APNA MAKHANA</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif-brand font-bold text-[#FAF7F2] leading-tight">
            “Ab Crunch Ka Time Hai.”
          </h2>

          <p className="text-lg sm:text-xl text-[#E3D8C4] max-w-xl mx-auto font-sans-brand">
            Discover Makhé India’s Apna Makhana. Available in 100g and 250g powerpacks, packed fresh for everyday snacking.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                onNavigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-5 bg-[#C59B27] text-[#142B1A] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#E5C778] active:scale-[0.98] transition-all shadow-xl group cursor-pointer"
            >
              <span>SHOP APNA MAKHANA</span>
              <ArrowRight size={16} className="text-[#142B1A] group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('/wholesale');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-5 bg-transparent border border-[#FAF7F2]/30 text-[#FAF7F2] font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-[#FAF7F2]/10 transition-all cursor-pointer"
            >
              <span>WHOLESALE ENQUIRIES →</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
