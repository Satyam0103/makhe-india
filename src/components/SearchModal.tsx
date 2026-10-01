import React, { useState } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { PageRoute } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: PageRoute) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { addToCart } = useCart();

  if (!isOpen) return null;

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.hindiName && p.hindiName.includes(query)) ||
      (p.tagline && p.tagline.toLowerCase().includes(query.toLowerCase())) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleProductClick = (slug: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(`/product/${slug}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="relative bg-[#FAF7F2] rounded-xl border border-[#D9CDB8] shadow-2xl max-w-xl w-full p-6 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-[#E2D6C3]">
            <div className="flex items-center gap-3 flex-1 mr-4">
              <Search size={22} className="text-[#183321]" />
              <input
                type="text"
                autoFocus
                placeholder="Search jumbo makhana, powerpacks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-base text-[#183321] placeholder-[#8A9C8E] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#5A6D5E] hover:text-[#183321] rounded cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Results */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider font-bold text-[#C59B27]">
              {query ? `RESULTS FOR "${query}"` : 'RECOMMENDED POWERPACKS'}
            </span>

            {filteredProducts.length === 0 ? (
              <p className="text-sm text-[#5D6F61] py-6 text-center">
                No products found matching your search.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#E8DEC9] bg-white hover:bg-[#F9F5EC] transition-colors"
                  >
                    <div
                      onClick={() => handleProductClick(p.slug)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-12 h-14 bg-[#F4EFE6] rounded p-1 flex items-center justify-center border border-[#E8DEC9]">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#142B1A] font-serif-brand group-hover:text-[#C59B27] transition-colors">
                          {p.name} <span className="text-xs text-[#8C6D1F]">({p.weight})</span>
                        </h4>
                        <div className="flex items-baseline gap-2 text-xs">
                          <span className="font-bold text-[#183321]">₹{p.price}</span>
                          <span className="text-[#899C8D] line-through">₹{p.mrp}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(p, 1);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#183321] text-[#FAF7F2] text-xs font-bold uppercase rounded-lg hover:bg-[#234A30] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShoppingBag size={13} className="text-[#E5C778]" />
                      <span>ADD</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
