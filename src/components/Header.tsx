import React, { useState } from 'react';
import { Search, User, ShoppingCart, Menu, X, Phone, Mail, Instagram } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PageRoute } from '../types';
import { EditableImage } from './EditableImage';

interface HeaderProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenSearch
}) => {
  const { totalItems, setIsDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; route: PageRoute }[] = [
    { label: 'Home', route: '/' },
    { label: 'Our Story', route: '/our-story' },
    { label: 'Blog', route: '/blog' },
    { label: 'Contact', route: '/contact' }
  ];

  const handleNavClick = (route: PageRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFCE] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          
          {/* MOBILE LEFT: Hamburger Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#183321] hover:text-[#C59B27] transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* DESKTOP LEFT: Exactly Home, Our Story, Wholesale, Contact */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navItems.map((item) => {
              const isActive = currentPage === item.route;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`relative py-1 text-sm tracking-wider uppercase transition-colors font-medium ${
                    isActive
                      ? 'text-[#183321] font-semibold'
                      : 'text-[#4A5D4E] hover:text-[#183321]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C59B27] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* CENTER: Official Makhé India Logo (Clean Transparent Vector) */}
          <div className="flex-1 md:flex-initial flex justify-center items-center">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleNavClick('/')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNavClick('/');
                }
              }}
              className="inline-block transition-transform hover:scale-[1.02] focus:outline-none cursor-pointer bg-transparent border-0 shadow-none p-0"
              aria-label="Makhé India Homepage"
            >
              <img
                src="/images/brand/makhe-india-logo.png"
                alt="Makhé India"
                className="h-10 sm:h-12 md:h-16 w-auto object-contain py-0.5 sm:py-1 transition-all bg-transparent border-0 shadow-none"
              />
            </div>
          </div>

          {/* DESKTOP & MOBILE RIGHT: Search, Account, Cart */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Search icon */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 text-[#183321] hover:text-[#C59B27] transition-colors"
              aria-label="Search"
              title="Search products"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>

            {/* Account icon (hidden on small mobile, visible on desktop) */}
            <button
              type="button"
              onClick={() => handleNavClick('/account')}
              className="hidden sm:inline-flex p-2 text-[#183321] hover:text-[#C59B27] transition-colors"
              aria-label="Account"
              title="Account"
            >
              <User size={20} strokeWidth={1.8} />
            </button>

            {/* Shopping Cart button - Specifically says and uses CART */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#183321] text-[#FAF7F2] rounded-md hover:bg-[#23472F] transition-all shadow-sm group focus:outline-none"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingCart size={18} strokeWidth={1.9} className="text-[#E5C778] group-hover:scale-105 transition-transform" />
              <span className="text-xs font-semibold tracking-wider uppercase">CART</span>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-[#C59B27] text-[#0C1D13] rounded-full">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8DFCE] bg-[#FAF7F2] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`text-left text-base uppercase tracking-wider py-2 transition-colors ${
                    currentPage === item.route
                      ? 'text-[#183321] font-bold border-l-2 border-[#C59B27] pl-3'
                      : 'text-[#4A5D4E] hover:text-[#183321] pl-3'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleNavClick('/account')}
                className="text-left text-base uppercase tracking-wider py-2 text-[#4A5D4E] hover:text-[#183321] pl-3 flex items-center gap-2 pt-2 border-t border-[#E8DFCE]"
              >
                <User size={18} />
                <span>Account</span>
              </button>
            </div>

            {/* Direct Contact Channels in Mobile Drawer */}
            <div className="pt-4 border-t border-[#E8DFCE] space-y-2 text-xs font-sans-brand text-[#556A5B]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C59B27] block">
                Direct Contact
              </span>
              <div className="flex flex-col space-y-2 pt-1">
                <a
                  href="tel:+918409118082"
                  className="flex items-center gap-2.5 text-[#183321] font-semibold hover:text-[#C59B27] transition-colors"
                >
                  <Phone size={14} className="text-[#C59B27]" />
                  <span>+91 8409118082</span>
                </a>
                <a
                  href="mailto:makheagro@gmail.com"
                  className="flex items-center gap-2.5 text-[#183321] font-semibold hover:text-[#C59B27] transition-colors"
                >
                  <Mail size={14} className="text-[#C59B27]" />
                  <span>makheagro@gmail.com</span>
                </a>
                <a
                  href="https://www.instagram.com/makheindia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[#183321] font-semibold hover:text-[#C59B27] transition-colors"
                >
                  <Instagram size={14} className="text-[#C59B27]" />
                  <span>@makheindia</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
