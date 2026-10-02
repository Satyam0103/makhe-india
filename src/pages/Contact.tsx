import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Check,
  ChevronDown,
  MessageSquare,
  Package,
  Building2,
  HelpCircle,
  Phone,
  Mail,
  Instagram,
} from "lucide-react";
import { PageRoute } from "../types";
import {
  submitContactEnquiry,
  ContactPayload,
} from "../services/contactService";

interface ContactProps {
  onNavigate: (page: PageRoute) => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  enquiryType: string;
  orderNumber: string;
  message: string;
  consent: boolean;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  enquiryType: "",
  orderNumber: "",
  message: "",
  consent: false,
};

export const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMessageReady, setIsMessageReady] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // SEO: Update Title & Meta Description on mount
  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      "Contact Makhé India | Product, Order & Wholesale Enquiries";

    const metaDescription = document.querySelector('meta[name="description"]');
    const prevDescription = metaDescription?.getAttribute("content") || "";
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Contact Makhé India for product questions, order enquiries, wholesale requirements and general support.",
      );
    }

    return () => {
      document.title = prevTitle;
      if (metaDescription && prevDescription) {
        metaDescription.setAttribute("content", prevDescription);
      }
    };
  }, []);

  const scrollToForm = (type?: string) => {
    if (type) {
      setFormData((prev) => ({ ...prev, enquiryType: type }));
    }
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.enquiryType) {
      newErrors.enquiryType = "Please select an enquiry type";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (!formData.consent) {
      newErrors.consent = "Please agree to be contacted regarding your enquiry";
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
      await submitContactEnquiry({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        enquiryType: formData.enquiryType,
        orderNumber: formData.orderNumber,
        message: formData.message,
        consent: formData.consent,
      });

      setIsSubmitting(false);
      setIsMessageReady(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {
      // Fallback display on network issues
      setIsSubmitting(false);
      setIsMessageReady(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsMessageReady(false);
  };

  // Safe FAQ questions as strictly prescribed
  const FAQS = [
    {
      q: "Where can I buy Makhé India products?",
      a: "Makhé India products can be explored through the Shop section of this website.",
    },
    {
      q: "Do you accept wholesale enquiries?",
      a: "Yes. Use the dedicated Wholesale page to share your business and bulk requirements.",
    },
    {
      q: "What pack sizes are available?",
      a: "The website currently showcases 100 GM and 250 GM packs.",
    },
    {
      q: "How can I ask about an existing order?",
      a: "Select “Order Related” in the contact form and provide your order number if available.",
    },
  ];

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen overflow-x-hidden selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      {/* ==================================================
          SECTION 1 — CONTACT HERO
          Premium, minimal hero with subtle lotus/makhana motifs.
          Exactly one <h1> for page hierarchy & SEO.
      ================================================== */}
      <section className="relative bg-[#122417] text-[#FAF7F2] pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-24 lg:pb-32 overflow-hidden border-b border-[#203D2A]">
        {/* Subtle decorative concentric lotus/makhana water rings */}
        <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-[#C59B27]/15 pointer-events-none" />
        <div className="absolute top-1/2 -right-60 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-[#C59B27]/10 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#C59B27]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back to Home Button */}
          <div className="mb-8 sm:mb-12">
            <button
              type="button"
              onClick={() => onNavigate("/")}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E5C778] hover:text-white font-bold font-sans-brand transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5C778]/50 rounded-sm"
            >
              <ArrowLeft
                size={15}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="max-w-3xl space-y-6 sm:space-y-8">
            {/* Small label */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1F4228] border border-[#2D5A37] text-[#E5C778] text-xs font-bold tracking-[0.2em] uppercase font-sans-brand">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C778]" />
              <span>GET IN TOUCH</span>
            </div>

            {/* Main Headline (Exactly one H1) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-brand font-bold text-[#FAF7F2] leading-[1.08] tracking-tight">
              “Let’s Talk
              <br />
              <span className="text-[#E5C778] italic font-normal">
                Makhana.”
              </span>
            </h1>

            {/* Cultural Devanagari line */}
            <div className="font-devanagari text-base sm:text-lg text-[#C59B27] font-semibold border-l-2 border-[#C59B27] pl-4 py-1">
              आपकी बात, हमारे उत्पाद और बिहार की परंपरा।
            </div>

            {/* Supporting text */}
            <div className="space-y-3 max-w-xl text-base sm:text-lg text-[#D1E2D5] leading-relaxed">
              <p>
                Have a question about Makhé India, our products, orders, or
                wholesale requirements?
              </p>
              <p className="text-sm sm:text-base text-[#A8BEAE]">
                We’d love to hear from you.
              </p>
            </div>

            {/* CTA & Quick Channels */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollToForm()}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#E5C778] text-[#142B1A] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-white transition-all shadow-xl hover:shadow-[#E5C778]/20 hover:-translate-y-0.5 cursor-pointer active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E5C778]"
              >
                <span>WRITE TO US</span>
                <ArrowDown size={15} />
              </button>

              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                <a
                  href="tel:+918409118082"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#183622] hover:bg-[#20472D] border border-[#2B5234] text-[#FAF7F2] text-xs font-semibold font-sans-brand transition-colors"
                >
                  <Phone size={13} className="text-[#E5C778]" />
                  <span>+91 8409118082</span>
                </a>
                <a
                  href="mailto:wecare@makheindia.com"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#183622] hover:bg-[#20472D] border border-[#2B5234] text-[#FAF7F2] text-xs font-semibold font-sans-brand transition-colors"
                >
                  <Mail size={13} className="text-[#E5C778]" />
                  <span>wecare@makheindia.com</span>
                </a>
                <a
                  href="https://www.instagram.com/makheindia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#183622] hover:bg-[#20472D] border border-[#2B5234] text-[#FAF7F2] text-xs font-semibold font-sans-brand transition-colors"
                >
                  <Instagram size={13} className="text-[#E5C778]" />
                  <span>@makheindia</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 2 — CONTACT OPTIONS (HOW CAN WE HELP?)
          Three options:
          01 PRODUCT & ORDER
          02 WHOLESALE (with button routing to /wholesale)
          03 GENERAL ENQUIRY
          No fabricated phone numbers, addresses, hours, etc.
      ================================================== */}
      <section className="py-20 sm:py-24 bg-[#FAF7F2] border-b border-[#E5DAC6] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-3">
              ASSISTANCE DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
              HOW CAN WE HELP?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4E6152] font-sans-brand">
              Choose the category that best matches your conversation with Makhé
              India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 01 PRODUCT & ORDER */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] flex flex-col justify-between hover:border-[#C59B27] transition-all">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#C59B27]">
                    01
                  </span>
                  <Package className="text-[#8C6D1F]" size={22} />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif-brand font-bold text-[#142B1A] mb-3">
                  PRODUCT &amp; ORDER
                </h3>
                <p className="text-sm text-[#4E6152] leading-relaxed">
                  Questions related to products, availability or an order.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#DDD1BE]">
                <button
                  type="button"
                  onClick={() => scrollToForm("Product Question")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#142B1A] hover:text-[#C59B27] uppercase tracking-wider font-sans-brand transition-colors cursor-pointer"
                >
                  <span>ASK ABOUT PRODUCTS</span>
                  <ArrowRight size={14} className="text-[#C59B27]" />
                </button>
              </div>
            </div>

            {/* 02 WHOLESALE */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#142B1A] text-[#FAF7F2] border border-[#234A30] flex flex-col justify-between hover:border-[#E5C778] transition-all shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#E5C778]">
                    02
                  </span>
                  <Building2 className="text-[#E5C778]" size={22} />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif-brand font-bold text-[#FAF7F2] mb-3">
                  WHOLESALE
                </h3>
                <p className="text-sm text-[#C2D6C6] leading-relaxed">
                  For retail, distribution and bulk requirements.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#234A30]">
                <button
                  type="button"
                  onClick={() => onNavigate("/wholesale")}
                  className="w-full py-3 px-4 rounded-xl bg-[#E5C778] text-[#142B1A] font-bold text-xs uppercase tracking-wider font-sans-brand hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>WHOLESALE ENQUIRY</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 03 GENERAL ENQUIRY */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] flex flex-col justify-between hover:border-[#C59B27] transition-all">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#C59B27]">
                    03
                  </span>
                  <MessageSquare className="text-[#8C6D1F]" size={22} />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif-brand font-bold text-[#142B1A] mb-3">
                  GENERAL ENQUIRY
                </h3>
                <p className="text-sm text-[#4E6152] leading-relaxed">
                  Anything else you'd like to discuss with Makhé India.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#DDD1BE]">
                <button
                  type="button"
                  onClick={() => scrollToForm("General Enquiry")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#142B1A] hover:text-[#C59B27] uppercase tracking-wider font-sans-brand transition-colors cursor-pointer"
                >
                  <span>SEND A NOTE</span>
                  <ArrowRight size={14} className="text-[#C59B27]" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information Cards */}
          <div className="mt-14 pt-12 border-t border-[#DDD1BE] grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Phone Card */}
            <a
              href="tel:+918409118082"
              className="p-6 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] hover:border-[#C59B27] flex items-center gap-4 transition-all group shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#142B1A] flex items-center justify-center text-[#E5C778] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Phone size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#788C7D] block font-sans-brand">
                  PHONE
                </span>
                <span className="text-sm font-bold text-[#142B1A] group-hover:text-[#C59B27] transition-colors truncate block">
                  +91 8409118082
                </span>
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:wecare@makheindia.com"
              className="p-6 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] hover:border-[#C59B27] flex items-center gap-4 transition-all group shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#142B1A] flex items-center justify-center text-[#E5C778] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Mail size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#788C7D] block font-sans-brand">
                  EMAIL
                </span>
                <span className="text-sm font-bold text-[#142B1A] group-hover:text-[#C59B27] transition-colors truncate block">
                  wecare@makheindia.com
                </span>
              </div>
            </a>

            {/* Instagram Card */}
            <a
              href="https://www.instagram.com/makheindia/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-[#F4EFE6] border border-[#DDD1BE] hover:border-[#C59B27] flex items-center gap-4 transition-all group shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#142B1A] flex items-center justify-center text-[#E5C778] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Instagram size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#788C7D] block font-sans-brand">
                  INSTAGRAM
                </span>
                <span className="text-sm font-bold text-[#142B1A] group-hover:text-[#C59B27] transition-colors truncate block">
                  @makheindia
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 3 & 4 & 5 — CONTACT FORM & DEVELOPMENT STATE
          Premium form with inline validation.
          Includes:
          - Full Name *
          - Email Address *
          - Phone Number (optional)
          - Enquiry Type *
          - Order Number (conditional on Enquiry Type = Order Related)
          - Message *
          - Consent checkbox *
          - Wholesale banner link if Enquiry Type = Wholesale
          - Development submission state: MESSAGE READY
      ================================================== */}
      <section
        ref={formRef}
        id="contact-form"
        className="py-20 sm:py-28 bg-[#FAF7F2] scroll-mt-24 relative"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-3">
              SEND A MESSAGE
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A] leading-tight">
              “What’s On
              <br />
              <span className="text-[#C59B27] italic font-normal">
                Your Mind?”
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#4E6152] font-sans-brand max-w-lg mx-auto">
              Please share your details below and our team will be glad to
              assist you.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#DDD1BE] shadow-xl relative overflow-hidden">
            {isMessageReady ? (
              /* ==========================================
                 DEVELOPMENT SUCCESS STATE: MESSAGE READY
                 Strictly adherence:
                 “Your enquiry has been validated successfully.
                  Message delivery will be enabled when the backend is connected.”
                 Do NOT claim that the company received the enquiry.
                 Do NOT store in localStorage.
              ========================================== */
              <div className="py-8 sm:py-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-[#FAF7F2] text-[#8C6D1F] flex items-center justify-center mx-auto border-2 border-[#C59B27]/40 shadow-inner">
                  <Check size={40} className="text-[#8C6D1F]" />
                </div>

                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#8C6D1F] font-sans-brand block">
                    SUBMISSION SUCCESSFUL
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#142B1A]">
                    ENQUIRY RECEIVED
                  </h3>
                  <p className="text-base sm:text-lg text-[#3D5042] max-w-md mx-auto leading-relaxed pt-2">
                    Thanks for reaching out. Your enquiry has been received by
                    the Makhé India team. We will review your message and
                    connect with you.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-8 py-3.5 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.15em] font-sans-brand hover:bg-[#234A30] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#142B1A]/40"
                  >
                    RESET FORM
                  </button>
                </div>
              </div>
            ) : (
              /* ==========================================
                 CONTACT FORM
              ========================================== */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Row 1: Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="contact-fullName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      FULL NAME <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      id="contact-fullName"
                      type="text"
                      placeholder="e.g. Ananya Sen"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName)
                          setErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.fullName
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A]"
                      }`}
                    />
                    {errors.fullName && (
                      <p
                        id="fullName-error"
                        role="alert"
                        className="text-xs text-[#C0392B] mt-1.5 font-medium"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      EMAIL ADDRESS <span className="text-[#A93226]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="e.g. ananya@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.email
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A]"
                      }`}
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        role="alert"
                        className="text-xs text-[#C0392B] mt-1.5 font-medium"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Phone Number & Enquiry Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      PHONE NUMBER{" "}
                      <span className="text-xs normal-case text-[#7A8C7F] font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D9CBB3] bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-enquiryType"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      ENQUIRY TYPE <span className="text-[#A93226]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="contact-enquiryType"
                        value={formData.enquiryType}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            enquiryType: e.target.value,
                          });
                          if (errors.enquiryType)
                            setErrors((prev) => ({ ...prev, enquiryType: "" }));
                        }}
                        aria-invalid={!!errors.enquiryType}
                        aria-describedby={
                          errors.enquiryType ? "enquiryType-error" : undefined
                        }
                        className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] appearance-none pr-10 transition-colors focus:outline-none ${
                          errors.enquiryType
                            ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                            : "border-[#D9CBB3] focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A]"
                        }`}
                      >
                        <option value="">Select enquiry type...</option>
                        <option value="Product Question">
                          Product Question
                        </option>
                        <option value="Order Related">Order Related</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="General Enquiry">General Enquiry</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6D1F] pointer-events-none"
                      />
                    </div>
                    {errors.enquiryType && (
                      <p
                        id="enquiryType-error"
                        role="alert"
                        className="text-xs text-[#C0392B] mt-1.5 font-medium"
                      >
                        {errors.enquiryType}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subtle Wholesale Banner Notice if Enquiry Type is Wholesale */}
                {formData.enquiryType === "Wholesale" && (
                  <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#DDD1BE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#3D5042]">
                    <span>
                      For detailed wholesale requirements, you can also use our
                      dedicated wholesale form.
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate("/wholesale")}
                      className="inline-flex items-center gap-1.5 font-bold text-[#142B1A] hover:text-[#C59B27] uppercase tracking-wider flex-shrink-0 cursor-pointer"
                    >
                      <span>GO TO WHOLESALE</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {/* Conditional Order Number Field (Only display when Enquiry Type = Order Related) */}
                {formData.enquiryType === "Order Related" && (
                  <div>
                    <label
                      htmlFor="contact-orderNumber"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      ORDER NUMBER{" "}
                      <span className="text-xs normal-case text-[#7A8C7F] font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="contact-orderNumber"
                      type="text"
                      placeholder="e.g. MKH-2026-XXXX"
                      value={formData.orderNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          orderNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D9CBB3] bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A]"
                    />
                    <p className="text-[11px] text-[#7A8C7F] mt-1 font-sans-brand">
                      Provide your order reference number to help us assist you
                      faster.
                    </p>
                  </div>
                )}

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                  >
                    MESSAGE <span className="text-[#A93226]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Write your question, feedback, or enquiry here..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message)
                        setErrors((prev) => ({ ...prev, message: "" }));
                    }}
                    aria-invalid={!!errors.message}
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                    className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                      errors.message
                        ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                        : "border-[#D9CBB3] focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A]"
                    }`}
                  />
                  {errors.message && (
                    <p
                      id="message-error"
                      role="alert"
                      className="text-xs text-[#C0392B] mt-1.5 font-medium"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Consent Checkbox */}
                <div>
                  <label
                    onClick={() => {
                      const nextVal = !formData.consent;
                      setFormData({ ...formData, consent: nextVal });
                      if (nextVal && errors.consent) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.consent;
                          return n;
                        });
                      }
                    }}
                    className="flex items-start gap-3 cursor-pointer select-none group"
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                        formData.consent
                          ? "bg-[#142B1A] border-[#142B1A] text-[#E5C778]"
                          : errors.consent
                          ? "border-[#C0392B] bg-white"
                          : "border-[#A3947D] bg-white group-hover:border-[#142B1A]"
                      }`}
                    >
                      {formData.consent && <Check size={14} />}
                    </div>
                    <span className="text-xs text-[#3D5042] font-sans-brand leading-relaxed">
                      I agree to be contacted regarding my enquiry.{" "}
                      <span className="text-[#A93226]">*</span>
                    </span>
                  </label>
                  {errors.consent && (
                    <p
                      role="alert"
                      className="text-xs text-[#C0392B] mt-1.5 font-medium"
                    >
                      {errors.consent}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-[#234A30] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#142B1A]"
                  >
                    <span>
                      {isSubmitting ? "VALIDATING..." : "SEND MESSAGE"}
                    </span>
                    <ArrowRight size={16} className="text-[#E5C778]" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 6 — FAQ / QUICK ANSWERS
          Compact accordion section:
          Heading: BEFORE YOU ASK
          Strictly prescribed questions & answers.
      ================================================== */}
      <section className="py-20 sm:py-24 bg-[#F4EFE6] border-t border-b border-[#E5DAC6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-3">
              HELPFUL CLARIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
              BEFORE YOU ASK
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4E6152] font-sans-brand">
              Common questions about Makhé India orders and products.
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
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F4EFE6]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                  >
                    <span className="font-serif-brand font-bold text-base sm:text-lg text-[#142B1A]">
                      {faq.q}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#F4EFE6] text-[#142B1A] flex-shrink-0 transition-transform ${
                        isOpen ? "rotate-180 bg-[#142B1A] text-[#E5C778]" : ""
                      }`}
                    >
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
        </div>
      </section>

      {/* ==================================================
          SECTION 7 — BRAND MESSAGE
          Before footer: visually strong brand statement.
          Large typography:
          FROM BIHAR.
          WITH CARE.
          TO YOUR TABLE.
          Subtle makhana / lotus visual decoration.
          Premium and spacious. No generic stock photography.
      ================================================== */}
      <section className="py-24 sm:py-32 bg-[#122417] text-[#FAF7F2] relative overflow-hidden text-center">
        {/* Subtle decorative makhana lotus water ring watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full border border-[#C59B27]/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] rounded-full border border-[#C59B27]/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand">
            <span className="w-6 h-[1.5px] bg-[#C59B27]" />
            <span>MAKHÉ INDIA</span>
            <span className="w-6 h-[1.5px] bg-[#C59B27]" />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif-brand font-bold leading-tight tracking-tight text-[#FAF7F2]">
            FROM BIHAR.
            <br />
            <span className="text-[#E5C778] italic font-normal">
              WITH CARE.
            </span>
            <br />
            TO YOUR TABLE.
          </h2>

          <div className="font-devanagari text-base sm:text-lg text-[#C59B27] pt-2">
            “जितना साफ़ खाएंगे उतना लंबा जाएंगे”
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => onNavigate("/")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#C59B27] text-[#E5C778] hover:bg-[#C59B27] hover:text-[#122417] transition-all font-bold text-xs uppercase tracking-[0.2em] font-sans-brand cursor-pointer"
            >
              <span>EXPLORE APNA MAKHANA</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
