import React from 'react';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PageRoute } from '../types';

interface CartDrawerProps {
  onNavigate: (page: PageRoute) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isDrawerOpen,
    setIsDrawerOpen,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    subtotal,
    totalItems
  } = useCart();

  if (!isDrawerOpen) return null;

  const handleViewCart = () => {
    setIsDrawerOpen(false);
    onNavigate('/cart');
  };

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    onNavigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col border-l border-[#E2D6C3]">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E2D6C3] flex items-center justify-between bg-[#F4EFE6]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-[#183321]" />
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#183321] font-sans-brand">
                CART ({totalItems})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-[#5A6D5E] hover:text-[#183321] transition-colors rounded-lg hover:bg-[#EAE0CD] cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EAE0CD] text-[#183321] flex items-center justify-center mx-auto">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-lg font-serif-brand font-bold text-[#142B1A]">
                  Your cart is feeling a little light
                </h3>
                <p className="text-xs text-[#5D7060] max-w-xs mx-auto">
                  Pick your favorite Makhé India pack to begin.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('/');
                  }}
                  className="px-6 py-2.5 bg-[#183321] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#234A30] transition-colors cursor-pointer"
                >
                  SHOP MAKHÉ
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const lineTotal = item.product.price * item.quantity;
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 rounded-xl border border-[#E2D7C5] bg-white shadow-xs items-center"
                  >
                    {/* Product Image */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        onNavigate(`/product/${item.product.slug}`);
                      }}
                      className="w-20 h-24 bg-[#F4EFE6] rounded-lg p-2 flex items-center justify-center shrink-0 border border-[#E8DFC8] cursor-pointer hover:border-[#183321] transition-colors"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain drop-shadow-sm"
                      />
                    </button>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between self-stretch">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDrawerOpen(false);
                                onNavigate(`/product/${item.product.slug}`);
                              }}
                              className="font-serif-brand font-bold text-base text-[#142B1A] hover:text-[#C59B27] transition-colors text-left"
                            >
                              {item.product.name}
                            </button>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#8C6420] font-bold uppercase tracking-wider">
                                {item.product.weight}
                              </span>
                              <span className="text-xs text-[#6B8071]">
                                (₹{item.product.price} each)
                              </span>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="text-[#9CAE9F] hover:text-[#B34024] transition-colors p-1 cursor-pointer"
                            aria-label={`Remove ${item.product.name} ${item.product.weight}`}
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F2EAE0]">
                        {/* Line Total */}
                        <div className="flex items-baseline">
                          <span className="text-sm font-bold text-[#183321]">
                            ₹{lineTotal}
                          </span>
                        </div>

                        {/* Quantity Selector (- qty +) */}
                        <div className="inline-flex items-center border border-[#CFDFD3] rounded-lg bg-[#FAF7F2] text-xs">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.product.id)}
                            className="w-7 h-7 flex items-center justify-center text-[#183321] hover:bg-[#EAE0CD] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center font-bold text-[#183321] select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.product.id)}
                            className="w-7 h-7 flex items-center justify-center text-[#183321] hover:bg-[#EAE0CD] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer: SUBTOTAL + VIEW CART + CHECKOUT */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E2D6C3] bg-[#F4EFE6] space-y-4">
              {/* SUBTOTAL */}
              <div className="flex justify-between items-baseline text-[#142B1A] pt-1">
                <span className="text-xs uppercase tracking-widest font-bold text-[#627766]">
                  SUBTOTAL
                </span>
                <span className="text-2xl font-serif-brand font-extrabold text-[#183321]">
                  ₹{subtotal}
                </span>
              </div>

              {/* Action Buttons: VIEW CART and CHECKOUT */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleViewCart}
                  className="w-full py-3.5 px-4 bg-white border border-[#183321] text-[#183321] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#FAF7F2] transition-colors text-center cursor-pointer"
                >
                  VIEW CART
                </button>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 bg-[#183321] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#234A30] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>CHECKOUT</span>
                  <ArrowRight size={14} className="text-[#E5C778]" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
