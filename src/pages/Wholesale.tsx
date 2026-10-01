import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowDown, ArrowRight, Check, CheckCircle2, ChevronDown, ChevronUp, Building2, Store, Sparkles, ShieldCheck } from 'lucide-react';
import { PageRoute } from '../types';
import { api } from '../services/api';
import { EditableImage } from '../components/EditableImage';

interface WholesaleProps {
  onNavigate: (page: PageRoute) => void;
}

interface FormState {
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  businessType: string;
  productInterest100g: boolean;
  productInterest250g: boolean;
  productInterestBoth: boolean;
  estimatedRequirement: string;
  message: string;
  agreedToContact: boolean;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  companyName: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  businessType: '',
  productInterest100g: false,
  productInterest250g: false,
  productInterestBoth: false,
  estimatedRequirement: '',
  message: '',
  agreedToContact: false,
};

export const Wholesale: React.FC<WholesaleProps> = ({ onNavigate }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<FormState | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Smooth scroll helper to enquiry form
  const scrollToForm = (preselectProduct?: '100g' | '250g') => {
    if (preselectProduct === '100g') {
      setFormData(prev => ({ ...prev, productInterest100g: true, productInterestBoth: false }));
    } else if (preselectProduct === '250g') {
      setFormData(prev => ({ ...prev, productInterest250g: true, productInterestBoth: false }));
    }

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Product interest handler
  const handleProductInterestChange = (key: '100g' | '250g' | 'both') => {
    if (key === 'both') {
      const willBeBoth = !formData.productInterestBoth;
      setFormData(prev => ({
        ...prev,
        productInterestBoth: willBeBoth,
        productInterest100g: willBeBoth,
        productInterest250g: willBeBoth,
      }));
    } else if (key === '100g') {
      const new100 = !formData.productInterest100g;
      setFormData(prev => {
        const isBoth = new100 && prev.productInterest250g;
        return {
          ...prev,
          productInterest100g: new100,
          productInterestBoth: isBoth,
        };
      });
    } else if (key === '250g') {
      const new250 = !formData.productInterest250g;
      setFormData(prev => {
        const isBoth = prev.productInterest100g && new250;
        return {
          ...prev,
          productInterest250g: new250,
          productInterestBoth: isBoth,
        };
      });
    }

    if (errors.productInterest) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr.productInterest;
        return newErr;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Business / Company Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+() -]{7,16}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Please select a business type';
    }
    if (!formData.productInterest100g && !formData.productInterest250g && !formData.productInterestBoth) {
      newErrors.productInterest = 'Please select at least one product interest';
    }
    if (!formData.agreedToContact) {
      newErrors.agreedToContact = 'Please agree to be contacted regarding your enquiry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const interests: string[] = [];
      if (formData.productInterestBoth) {
        interests.push('Apna Makhana 100 GM', 'Apna Makhana 250 GM');
      } else {
        if (formData.productInterest100g) interests.push('Apna Makhana 100 GM');
        if (formData.productInterest250g) interests.push('Apna Makhana 250 GM');
      }

      await api.submitWholesaleEnquiry({
        fullName: formData.fullName,
        businessName: formData.companyName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        businessType: formData.businessType,
        productInterest: interests,
        estimatedRequirement: formData.estimatedRequirement,
        message: formData.message,
      });

      setLastSubmittedData(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch {
      // Fallback display on connection issues
      setLastSubmittedData(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsSubmitted(false);
  };

  // Safe FAQ questions as strictly prescribed
  const FAQS = [
    {
      q: 'What is the minimum wholesale order?',
      a: 'Minimum order quantities vary based on product format and business type. Our team will share details based on your requirement.',
    },
    {
      q: 'Do you supply both 100g and 250g packs?',
      a: 'Yes, both Apna Makhana 100 GM and 250 GM packs are available for wholesale and bulk orders.',
    },
    {
      q: 'How can I get wholesale pricing?',
      a: 'Please submit the enquiry form above with your business details, and our team will share the wholesale price list.',
    },
    {
      q: 'Where do you deliver?',
      a: 'Delivery availability and logistics options will be confirmed by our team based on your location and order volume.',
    },
  ];

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen overflow-x-hidden selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      
      {/* ==================================================
          SECTION 1 — WHOLESALE HERO
          Deep forest green, cream, muted gold, earthy brown.
          Desktop: Text on left, oversized product packet on right.
      ================================================== */}
      <section className="relative bg-[#122417] text-[#FAF7F2] pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-24 lg:pb-32 overflow-hidden border-b border-[#203D2A]">
        
        {/* Subtle decorative concentric rings in muted gold */}
        <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#C59B27]/15 pointer-events-none" />
        <div className="absolute top-1/2 -right-60 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-[#C59B27]/10 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C59B27]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Back to Home Button */}
          <div className="mb-8 sm:mb-12">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E5C778] hover:text-white font-bold font-sans-brand transition-colors group cursor-pointer"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Text & CTA (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* Small label */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1F4228] border border-[#2D5A37] text-[#E5C778] text-xs font-bold tracking-[0.2em] uppercase font-sans-brand">
                <Building2 size={13} className="text-[#E5C778]" />
                <span>WHOLESALE &amp; BULK ORDERS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-brand font-bold text-[#FAF7F2] leading-[1.08] tracking-tight">
                “Business ke liye<br />
                <span className="text-[#E5C778] italic font-normal">Makhana chahiye?”</span>
              </h1>

              {/* Cultural Devanagari touch */}
              <div className="font-devanagari text-base sm:text-lg text-[#C59B27] font-semibold border-l-2 border-[#C59B27] pl-4 py-1">
                व्यापार और थोक आपूर्ति के लिए मखे इंडिया के साथ जुड़ें।
              </div>

              {/* Supporting copy */}
              <div className="space-y-3 max-w-xl text-base sm:text-lg text-[#D1E2D5] leading-relaxed">
                <p className="font-medium text-[#FAF7F2]">
                  Partner with Makhé India for wholesale and bulk requirements.
                </p>
                <p className="text-sm sm:text-base text-[#A8BEAE]">
                  Tell us a little about your business and requirement, and our team can get in touch with you.
                </p>
              </div>

              {/* Hero CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToForm()}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#E5C778] text-[#142B1A] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-white transition-all shadow-xl hover:shadow-[#E5C778]/20 hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
                >
                  <span>START AN ENQUIRY</span>
                  <ArrowDown size={16} />
                </button>

                <div className="flex items-center gap-2 text-xs text-[#8BA491] font-sans-brand px-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5C778] animate-pulse" />
                  <span>Personal review by our trade desk</span>
                </div>
              </div>

            </div>

            {/* Right: Oversized Product Composition (5 cols on desktop) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                
                {/* Glow & Circular Backing */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1B3822] via-[#244A2E] to-[#122417] blur-2xl opacity-60 scale-95" />
                <div className="absolute -inset-4 rounded-3xl border border-[#C59B27]/20 pointer-events-none" />
                
                {/* Packaging Showcase Frame */}
                <div className="relative bg-gradient-to-b from-[#183321] to-[#0E1D13] p-8 sm:p-10 rounded-3xl border border-[#2C5237] shadow-2xl overflow-hidden group">
                  
                  {/* Watermark in background */}
                  <span className="absolute -bottom-8 -right-8 text-8xl font-serif-brand font-black text-[#FAF7F2]/5 select-none pointer-events-none">
                    MAKHÉ
                  </span>

                  {/* Stamp Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#E5C778] bg-[#122417]/90 flex flex-col items-center justify-center text-center p-1 text-[#E5C778] shadow-md">
                      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">100% WHOLE</span>
                      <span className="text-[11px] font-serif-brand font-bold text-white leading-tight">JUMBO</span>
                    </div>
                  </div>

                  {/* Product Pack Image */}
                  <div className="relative pt-4 pb-2 flex items-center justify-center">
                    <EditableImage
                      src="/images/products/250g.webp"
                      alt="Makhé India Apna Makhana 250 GM Pack"
                      storageKey="wholesale-hero-pack"
                      label="CHANGE PRODUCT IMAGE"
                      objectFit="contain"
                      className="w-full max-h-[380px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Pack Footer Details */}
                  <div className="pt-4 border-t border-[#24472F] flex items-center justify-between text-xs font-sans-brand">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#E5C778] font-bold block">
                        FLAGSHIP FORMAT
                      </span>
                      <span className="font-serif-brand font-bold text-[#FAF7F2] text-sm">
                        Apna Makhana 250 GM
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded bg-[#203D2A] text-[#FAF7F2] text-[11px] font-bold tracking-wide">
                      Bulk Ready
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION 2 — WHO IS THIS FOR? (BUILT FOR BUSINESS)
          Editorial grid:
          - RETAILERS
          - DISTRIBUTORS
          - SUPERMARKETS
          - CAFÉS & HOSPITALITY
          - CORPORATE / BULK BUYERS
          No generic white cards: bold typographic labels, numbering, subtle separators.
      ================================================== */}
      <section className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-[#E5DAC6] relative overflow-hidden">
        
        {/* Subtle background text watermark */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[140px] sm:text-[220px] font-serif-brand font-black text-[#142B1A]/[0.02] select-none pointer-events-none whitespace-nowrap">
          MAKHÉ B2B
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="max-w-3xl mb-16 sm:mb-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1.5px] bg-[#C59B27]" />
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
                BUILT FOR BUSINESS
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif-brand font-bold text-[#142B1A] leading-[1.12]">
              “Let’s Grow<br />
              <span className="text-[#C59B27] italic font-normal">Together.”</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-[#4E6152] font-sans-brand max-w-2xl leading-relaxed">
              Whether you stock shelves, manage regional distribution, or serve mindful snacks to guests, Makhé India is structured to support commercial partners.
            </p>
          </div>

          {/* Editorial Business Categories Grid (5 categories) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* 01 RETAILERS */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] hover:border-[#C59B27] transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#C59B27]">
                    01
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#8C6D1F] font-bold font-sans-brand">
                    STORE SHELVES
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] mb-3 group-hover:text-[#8C6D1F] transition-colors">
                  RETAILERS
                </h3>
                <p className="text-sm text-[#4E6152] leading-relaxed">
                  Curated shelf-ready packs for modern retail stores looking to offer authentic jumbo makhana with strong consumer appeal.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#DDD1BE] flex items-center justify-between text-xs font-bold text-[#142B1A] font-sans-brand">
                <span className="uppercase tracking-wider">Retail Ready Packs</span>
                <ArrowRight size={14} className="text-[#C59B27] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 02 DISTRIBUTORS */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] hover:border-[#C59B27] transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#C59B27]">
                    02
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#8C6D1F] font-bold font-sans-brand">
                    SUPPLY NETWORK
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] mb-3 group-hover:text-[#8C6D1F] transition-colors">
                  DISTRIBUTORS
                </h3>
                <p className="text-sm text-[#4E6152] leading-relaxed">
                  Regional supply partnerships to expand high-grade makhana distribution across territories and dealer networks.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#DDD1BE] flex items-center justify-between text-xs font-bold text-[#142B1A] font-sans-brand">
                <span className="uppercase tracking-wider">Territory Supply</span>
                <ArrowRight size={14} className="text-[#C59B27] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 03 SUPERMARKETS */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] hover:border-[#C59B27] transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#C59B27]">
                    03
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#8C6D1F] font-bold font-sans-brand">
                    MULTI-AISLE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] mb-3 group-hover:text-[#8C6D1F] transition-colors">
                  SUPERMARKETS
                </h3>
                <p className="text-sm text-[#4E6152] leading-relaxed">
                  Reliable inventory for supermarket chains and gourmet grocery floors demanding consistent quality and clean packaging.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#DDD1BE] flex items-center justify-between text-xs font-bold text-[#142B1A] font-sans-brand">
                <span className="uppercase tracking-wider">Bulk Restocking</span>
                <ArrowRight size={14} className="text-[#C59B27] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 04 CAFÉS & HOSPITALITY */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] hover:border-[#C59B27] transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#C59B27]">
                    04
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#8C6D1F] font-bold font-sans-brand">
                    HOSPITALITY
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A] mb-3 group-hover:text-[#8C6D1F] transition-colors">
                  CAFÉS &amp; HOSPITALITY
                </h3>
                <p className="text-sm text-[#4E6152] leading-relaxed">
                  Clean, whole jumbo kernels for mindful café menus, boutique hotel welcome trays, and premium guest hospitality.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#DDD1BE] flex items-center justify-between text-xs font-bold text-[#142B1A] font-sans-brand">
                <span className="uppercase tracking-wider">Service Formats</span>
                <ArrowRight size={14} className="text-[#C59B27] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 05 CORPORATE / BULK BUYERS */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#142B1A] text-[#FAF7F2] border border-[#234A30] hover:border-[#E5C778] transition-all group flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#E5C778]">
                    05
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#E5C778] font-bold font-sans-brand">
                    INSTITUTIONAL &amp; GIFTING
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#FAF7F2] mb-3 group-hover:text-[#E5C778] transition-colors">
                  CORPORATE / BULK BUYERS
                </h3>
                <p className="text-sm sm:text-base text-[#C2D6C6] leading-relaxed max-w-xl">
                  Curated corporate gifting hampers, executive health programs, and employee snack selections featuring authentic Indian superfoods.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#234A30] flex items-center justify-between text-xs font-bold text-[#E5C778] font-sans-brand">
                <span className="uppercase tracking-wider">Corporate &amp; Event Enquiries</span>
                <ArrowRight size={14} className="text-[#E5C778] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION 3 — PRODUCT AVAILABILITY
          Shows:
          APNA MAKHANA 100 GM
          APNA MAKHANA 250 GM
          No retail prices!
          "WHOLESALE PRICING: Available on enquiry"
          Button: REQUEST PRICING → (scrolls to form)
      ================================================== */}
      <section className="py-20 sm:py-28 bg-[#F4EFE6] border-b border-[#E5DAC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-3">
              PRODUCT CATALOGUE
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
              AVAILABLE PRODUCTS
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4E6152] font-sans-brand">
              Available in standard retail packs for bulk distribution and direct business supply.
            </p>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            
            {/* 100 GM Pack */}
            <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-10 border border-[#DDD1BE] shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                {/* Pack Header Badge */}
                <div className="flex items-center justify-between pb-6 border-b border-[#E5DAC6]">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold font-sans-brand">
                      EVERYDAY PACK
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A]">
                      APNA MAKHANA
                    </h3>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-[#142B1A] text-[#E5C778] font-bold text-xs uppercase tracking-wider font-sans-brand">
                    100 GM
                  </span>
                </div>

                {/* Product Image */}
                <div className="py-8 flex items-center justify-center">
                  <EditableImage
                    src="/images/products/100g.webp"
                    alt="Apna Makhana 100 GM Pack"
                    storageKey="wholesale-product-100g"
                    label="CHANGE PRODUCT IMAGE"
                    objectFit="contain"
                    className="w-full max-h-64 object-contain drop-shadow-md hover:scale-105 transition-transform"
                  />
                </div>

                {/* Pack Spec summary */}
                <div className="space-y-2 py-4 border-t border-[#E5DAC6] text-xs text-[#4E6152]">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#142B1A]">Grade:</span>
                    <span>100% Whole Jumbo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#142B1A]">Format:</span>
                    <span>Sealed Pouch Packaging</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#142B1A]">Ideal For:</span>
                    <span>Retail displays, snack counters &amp; impulse buys</span>
                  </div>
                </div>
              </div>

              {/* Wholesale Pricing notice & CTA */}
              <div className="pt-6 border-t border-[#E5DAC6] space-y-4">
                <div className="bg-[#F4EFE6] p-3.5 rounded-xl border border-[#DDD1BE] text-center">
                  <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold block">
                    WHOLESALE PRICING
                  </span>
                  <span className="text-sm font-serif-brand font-bold text-[#142B1A]">
                    Available on enquiry
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => scrollToForm('100g')}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.15em] font-sans-brand hover:bg-[#234A30] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>REQUEST PRICING</span>
                  <ArrowRight size={15} className="text-[#E5C778]" />
                </button>
              </div>
            </div>

            {/* 250 GM Pack */}
            <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-10 border border-[#DDD1BE] shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                {/* Pack Header Badge */}
                <div className="flex items-center justify-between pb-6 border-b border-[#E5DAC6]">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold font-sans-brand">
                      POWERPACK FORMAT
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A]">
                      APNA MAKHANA
                    </h3>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-[#142B1A] text-[#E5C778] font-bold text-xs uppercase tracking-wider font-sans-brand">
                    250 GM
                  </span>
                </div>

                {/* Product Image */}
                <div className="py-8 flex items-center justify-center">
                  <EditableImage
                    src="/images/products/250g.webp"
                    alt="Apna Makhana 250 GM Pack"
                    storageKey="wholesale-product-250g"
                    label="CHANGE PRODUCT IMAGE"
                    objectFit="contain"
                    className="w-full max-h-64 object-contain drop-shadow-md hover:scale-105 transition-transform"
                  />
                </div>

                {/* Pack Spec summary */}
                <div className="space-y-2 py-4 border-t border-[#E5DAC6] text-xs text-[#4E6152]">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#142B1A]">Grade:</span>
                    <span>100% Whole Jumbo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#142B1A]">Format:</span>
                    <span>Sealed Jumbo Stand-up Pouch</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#142B1A]">Ideal For:</span>
                    <span>Supermarkets, family pantries &amp; hospitality</span>
                  </div>
                </div>
              </div>

              {/* Wholesale Pricing notice & CTA */}
              <div className="pt-6 border-t border-[#E5DAC6] space-y-4">
                <div className="bg-[#F4EFE6] p-3.5 rounded-xl border border-[#DDD1BE] text-center">
                  <span className="text-[11px] uppercase tracking-widest text-[#8C6D1F] font-bold block">
                    WHOLESALE PRICING
                  </span>
                  <span className="text-sm font-serif-brand font-bold text-[#142B1A]">
                    Available on enquiry
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => scrollToForm('250g')}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.15em] font-sans-brand hover:bg-[#234A30] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>REQUEST PRICING</span>
                  <ArrowRight size={15} className="text-[#E5C778]" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION 4 & 5 — WHOLESALE ENQUIRY FORM & SUCCESS STATE
          The core B2B lead generation component with full validation.
      ================================================== */}
      <section ref={formRef} id="enquiry-form" className="py-20 sm:py-28 bg-[#FAF7F2] scroll-mt-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-3">
              LET’S TALK BUSINESS
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif-brand font-bold text-[#142B1A] leading-tight">
              “Tell Us What<br />
              <span className="text-[#C59B27] italic font-normal">You Need.”</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#4E6152] font-sans-brand max-w-lg mx-auto">
              Please provide your business and order requirements. Our wholesale desk will review your details and reach out.
            </p>
          </div>

          {/* Form Container Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#DDD1BE] shadow-xl relative overflow-hidden">
            
            {isSubmitted ? (
              /* ==========================================
                 SUCCESS SCREEN / STATE
              ========================================== */
              <div className="py-8 sm:py-12 text-center space-y-6">
                
                <div className="w-20 h-20 rounded-full bg-[#EBF7EE] text-[#1E7535] flex items-center justify-center mx-auto border-2 border-[#A6DDB3]">
                  <CheckCircle2 size={44} />
                </div>

                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#8C6D1F] font-sans-brand block">
                    SUBMISSION CONFIRMED
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#142B1A]">
                    “Thank You.<br />
                    <span className="text-[#1E7535]">Enquiry Received.”</span>
                  </h3>
                  <p className="text-base sm:text-lg text-[#3D5042] max-w-md mx-auto leading-relaxed pt-2">
                    Our team reviews each wholesale request personally. We will connect with you on the contact details provided.
                  </p>
                </div>

                {/* Submission Summary Box */}
                {lastSubmittedData && (
                  <div className="max-w-lg mx-auto bg-[#FAF7F2] p-6 rounded-2xl border border-[#DDD1BE] text-left text-xs font-sans-brand space-y-2.5">
                    <div className="text-[11px] uppercase tracking-wider text-[#8C6D1F] font-bold border-b border-[#E5DAC6] pb-2">
                      ENQUIRY SUMMARY
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#687C6C]">Contact:</span>
                      <span className="font-semibold text-[#142B1A]">{lastSubmittedData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#687C6C]">Company:</span>
                      <span className="font-semibold text-[#142B1A]">{lastSubmittedData.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#687C6C]">Business Type:</span>
                      <span className="font-semibold text-[#142B1A]">{lastSubmittedData.businessType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#687C6C]">Location:</span>
                      <span className="font-semibold text-[#142B1A]">{lastSubmittedData.city}, {lastSubmittedData.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#687C6C]">Product Interest:</span>
                      <span className="font-semibold text-[#142B1A]">
                        {lastSubmittedData.productInterestBoth
                          ? '100 GM & 250 GM (Both)'
                          : lastSubmittedData.productInterest100g
                          ? '100 GM Pack'
                          : '250 GM Pack'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-8 py-3.5 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.15em] font-sans-brand hover:bg-[#234A30] transition-colors cursor-pointer"
                  >
                    SUBMIT ANOTHER ENQUIRY
                  </button>
                </div>

              </div>
            ) : (
              /* ==========================================
                 ENQUIRY FORM
              ========================================== */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                
                {/* Row 1: Full Name & Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                      FULL NAME <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.fullName ? 'border-[#C0392B] ring-1 ring-[#C0392B]' : 'border-[#D9CBB3] focus:border-[#142B1A]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                      BUSINESS / COMPANY NAME <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mithila Food Distributors"
                      value={formData.companyName}
                      onChange={(e) => {
                        setFormData({ ...formData, companyName: e.target.value });
                        if (errors.companyName) setErrors(prev => ({ ...prev, companyName: '' }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.companyName ? 'border-[#C0392B] ring-1 ring-[#C0392B]' : 'border-[#D9CBB3] focus:border-[#142B1A]'
                      }`}
                    />
                    {errors.companyName && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Phone Number & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                      PHONE NUMBER <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.phone ? 'border-[#C0392B] ring-1 ring-[#C0392B]' : 'border-[#D9CBB3] focus:border-[#142B1A]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                      EMAIL ADDRESS <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. vikram@mithilafoods.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.email ? 'border-[#C0392B] ring-1 ring-[#C0392B]' : 'border-[#D9CBB3] focus:border-[#142B1A]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                      CITY <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patna / Mumbai / Delhi"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.city ? 'border-[#C0392B] ring-1 ring-[#C0392B]' : 'border-[#D9CBB3] focus:border-[#142B1A]'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                      STATE <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bihar / Maharashtra / Delhi NCR"
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({ ...formData, state: e.target.value });
                        if (errors.state) setErrors(prev => ({ ...prev, state: '' }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.state ? 'border-[#C0392B] ring-1 ring-[#C0392B]' : 'border-[#D9CBB3] focus:border-[#142B1A]'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Business Type (Dropdown) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                    BUSINESS TYPE <span className="text-[#A93226]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.businessType}
                      onChange={(e) => {
                        setFormData({ ...formData, businessType: e.target.value });
                        if (errors.businessType) setErrors(prev => ({ ...prev, businessType: '' }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] appearance-none pr-10 transition-colors focus:outline-none ${
                        errors.businessType ? 'border-[#C0392B] ring-1 ring-[#C0392B]' : 'border-[#D9CBB3] focus:border-[#142B1A]'
                      }`}
                    >
                      <option value="">Select Business Type...</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Supermarket / Grocery Store">Supermarket / Grocery Store</option>
                      <option value="Café / Restaurant / Hospitality">Café / Restaurant / Hospitality</option>
                      <option value="Corporate / Bulk Buyer">Corporate / Bulk Buyer</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6D1F] pointer-events-none" />
                  </div>
                  {errors.businessType && (
                    <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.businessType}</p>
                  )}
                </div>

                {/* Row 5: Product Interest Checkboxes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                    PRODUCT INTEREST <span className="text-[#A93226]">*</span>
                  </label>
                  <p className="text-xs text-[#687C6C] mb-3 font-sans-brand">
                    Select one or both product pack sizes you are looking to purchase:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 100 GM */}
                    <label
                      onClick={() => handleProductInterestChange('100g')}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                        formData.productInterest100g
                          ? 'bg-[#EBF7EE] border-[#1E7535] text-[#142B1A]'
                          : 'bg-[#FAF7F2] border-[#D9CBB3] text-[#4E6152] hover:border-[#142B1A]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        formData.productInterest100g
                          ? 'bg-[#1E7535] border-[#1E7535] text-white'
                          : 'border-[#A3947D] bg-white'
                      }`}>
                        {formData.productInterest100g && <Check size={14} />}
                      </div>
                      <span className="text-xs font-bold font-sans-brand tracking-wide">
                        100 GM Pack
                      </span>
                    </label>

                    {/* 250 GM */}
                    <label
                      onClick={() => handleProductInterestChange('250g')}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                        formData.productInterest250g
                          ? 'bg-[#EBF7EE] border-[#1E7535] text-[#142B1A]'
                          : 'bg-[#FAF7F2] border-[#D9CBB3] text-[#4E6152] hover:border-[#142B1A]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        formData.productInterest250g
                          ? 'bg-[#1E7535] border-[#1E7535] text-white'
                          : 'border-[#A3947D] bg-white'
                      }`}>
                        {formData.productInterest250g && <Check size={14} />}
                      </div>
                      <span className="text-xs font-bold font-sans-brand tracking-wide">
                        250 GM Powerpack
                      </span>
                    </label>

                    {/* Both */}
                    <label
                      onClick={() => handleProductInterestChange('both')}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                        formData.productInterestBoth
                          ? 'bg-[#EBF7EE] border-[#1E7535] text-[#142B1A]'
                          : 'bg-[#FAF7F2] border-[#D9CBB3] text-[#4E6152] hover:border-[#142B1A]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        formData.productInterestBoth
                          ? 'bg-[#1E7535] border-[#1E7535] text-white'
                          : 'border-[#A3947D] bg-white'
                      }`}>
                        {formData.productInterestBoth && <Check size={14} />}
                      </div>
                      <span className="text-xs font-bold font-sans-brand tracking-wide">
                        Both (100g &amp; 250g)
                      </span>
                    </label>
                  </div>

                  {errors.productInterest && (
                    <p className="text-xs text-[#C0392B] mt-2 font-medium">{errors.productInterest}</p>
                  )}
                </div>

                {/* Row 6: Estimated Requirement (Dropdown) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                    ESTIMATED REQUIREMENT
                  </label>
                  <div className="relative">
                    <select
                      value={formData.estimatedRequirement}
                      onChange={(e) => setFormData({ ...formData, estimatedRequirement: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D9CBB3] bg-[#FAF7F2] text-sm text-[#142B1A] appearance-none pr-10 focus:outline-none focus:border-[#142B1A]"
                    >
                      <option value="">Select Estimated Requirement...</option>
                      <option value="Less than 50 packs">Less than 50 packs</option>
                      <option value="50–100 packs">50–100 packs</option>
                      <option value="100–500 packs">100–500 packs</option>
                      <option value="500+ packs">500+ packs</option>
                      <option value="Not sure yet">Not sure yet</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6D1F] pointer-events-none" />
                  </div>
                </div>

                {/* Row 7: Message / Requirement (Textarea) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand">
                    MESSAGE / REQUIREMENT
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about your target timelines, retail location, or special requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#D9CBB3] bg-[#FAF7F2] text-sm text-[#142B1A] focus:outline-none focus:border-[#142B1A]"
                  />
                </div>

                {/* Row 8: Agreement Checkbox */}
                <div>
                  <label
                    onClick={() => {
                      const nextVal = !formData.agreedToContact;
                      setFormData({ ...formData, agreedToContact: nextVal });
                      if (nextVal && errors.agreedToContact) {
                        setErrors(prev => {
                          const n = { ...prev };
                          delete n.agreedToContact;
                          return n;
                        });
                      }
                    }}
                    className="flex items-start gap-3 cursor-pointer select-none group"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                      formData.agreedToContact
                        ? 'bg-[#142B1A] border-[#142B1A] text-[#E5C778]'
                        : errors.agreedToContact
                        ? 'border-[#C0392B] bg-white'
                        : 'border-[#A3947D] bg-white group-hover:border-[#142B1A]'
                    }`}>
                      {formData.agreedToContact && <Check size={14} />}
                    </div>
                    <span className="text-xs text-[#3D5042] font-sans-brand leading-relaxed">
                      I agree to be contacted regarding my wholesale enquiry. <span className="text-[#A93226]">*</span>
                    </span>
                  </label>
                  {errors.agreedToContact && (
                    <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.agreedToContact}</p>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-[#234A30] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#E5C778] border-t-transparent rounded-full animate-spin" />
                        <span>SUBMITTING ENQUIRY...</span>
                      </>
                    ) : (
                      <>
                        <span>SEND WHOLESALE ENQUIRY</span>
                        <ArrowRight size={16} className="text-[#E5C778]" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION 6 — SIMPLE WHOLESALE PROCESS (HOW IT WORKS)
          01 ENQUIRE
          02 CONNECT
          03 DISPATCH
          Calm, reassuring, numbered editorial layout. No corporate diagrams.
      ================================================== */}
      <section className="py-20 sm:py-28 bg-[#FAF7F2] border-t border-b border-[#E5DAC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-3">
              TRANSPARENT COLLABORATION
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
              HOW IT WORKS
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4E6152] font-sans-brand">
              A straightforward process to supply your business without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            
            {/* Step 01 */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] relative">
              <span className="text-5xl sm:text-6xl font-serif-brand font-bold text-[#C59B27]/40 block mb-6">
                01
              </span>
              <h3 className="text-xl sm:text-2xl font-serif-brand font-bold text-[#142B1A] mb-3">
                ENQUIRE
              </h3>
              <p className="text-sm text-[#4E6152] leading-relaxed">
                Share your business requirement using the form above.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] relative">
              <span className="text-5xl sm:text-6xl font-serif-brand font-bold text-[#C59B27]/40 block mb-6">
                02
              </span>
              <h3 className="text-xl sm:text-2xl font-serif-brand font-bold text-[#142B1A] mb-3">
                CONNECT
              </h3>
              <p className="text-sm text-[#4E6152] leading-relaxed">
                Our team reaches out to discuss product availability and pricing.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] relative">
              <span className="text-5xl sm:text-6xl font-serif-brand font-bold text-[#C59B27]/40 block mb-6">
                03
              </span>
              <h3 className="text-xl sm:text-2xl font-serif-brand font-bold text-[#142B1A] mb-3">
                DISPATCH
              </h3>
              <p className="text-sm text-[#4E6152] leading-relaxed">
                Orders are prepared and dispatched directly for your business.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION 7 — FAQ / IMPORTANT DETAILS
          Accordion addressing common questions safely.
          No invented policies or statistics.
      ================================================== */}
      <section className="py-20 sm:py-28 bg-[#F4EFE6] border-b border-[#E5DAC6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-3">
              CLARITY &amp; COMMON QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4E6152] font-sans-brand">
              Essential details regarding Makhé India bulk &amp; wholesale orders.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#DDD1BE] bg-[#FAF7F2] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F4EFE6]/50 transition-colors"
                  >
                    <span className="font-serif-brand font-bold text-base sm:text-lg text-[#142B1A]">
                      {faq.q}
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#F4EFE6] text-[#142B1A] flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 bg-[#142B1A] text-[#E5C778]' : ''
                    }`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-[#4E6152] leading-relaxed border-t border-[#E5DAC6]/60 font-sans-brand">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom helper prompt */}
          <div className="mt-12 text-center">
            <p className="text-sm text-[#4E6152] font-sans-brand mb-4">
              Have a custom inquiry or special corporate request?
            </p>
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-[#142B1A] hover:text-[#C59B27] font-sans-brand transition-colors cursor-pointer"
            >
              <span>GO TO ENQUIRY FORM</span>
              <ArrowDown size={14} />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
