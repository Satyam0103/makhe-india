import React from 'react';
import { Trash2, Minus, Plus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PageRoute } from '../types';

interface CartProps {
  onNavigate: (page: PageRoute) => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { cart, increaseQuantity, decreaseQuantity, removeItem, subtotal, totalItems } = useCart();

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-12 lg:py-20 selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Navigation */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8C6D1F] hover:text-[#142B1A] font-bold font-sans-brand transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>CONTINUE SHOPPING</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="pb-8 border-b border-[#E5DAC6] mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-2">
              SHOPPING BAG
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
              YOUR CART
            </h1>
          </div>
          <span className="text-sm font-sans-brand text-[#687C6C]">
            {totalItems} {totalItems === 1 ? 'pack' : 'packs'} selected
          </span>
        </div>

        {/* Cart Contents or Empty State */}
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-20 bg-white rounded-3xl border border-[#DDD1BE] p-8 sm:p-12 space-y-6 max-w-xl mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#F4EFE6] text-[#142B1A] flex items-center justify-center mx-auto border border-[#E5DAC6]">
              <ShoppingBag size={36} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A]">
                Your cart is feeling a little light.
              </h2>
              <p className="text-sm text-[#4E6152] font-sans-brand max-w-md mx-auto">
                Explore our slow-roasted Bihar jumbo makhana packs and bring everyday crispness home.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="px-8 py-4 bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-[#234A30] transition-colors cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <span>SHOP MAKHÉ</span>
                <ArrowRight size={15} className="text-[#E5C778]" />
              </button>
            </div>
          </div>
        ) : (
          /* Active Cart Items & Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* LEFT: Items List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl border border-[#DDD1BE] p-6 sm:p-8 shadow-xs divide-y divide-[#F2ECE1]">
                {cart.map((item) => {
                  const lineTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                    >
                      {/* Left: Product Image & Metadata */}
                      <div className="flex items-center gap-5">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/product/${item.product.slug}`)}
                          className="w-20 h-24 bg-[#F4EFE6] rounded-2xl p-2.5 flex items-center justify-center shrink-0 border border-[#E5DAC6] cursor-pointer hover:border-[#142B1A] transition-colors"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain drop-shadow-sm"
                          />
                        </button>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/product/${item.product.slug}`)}
                            className="font-serif-brand font-bold text-lg sm:text-xl text-[#142B1A] hover:text-[#C59B27] transition-colors text-left"
                          >
                            {item.product.name}
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider font-bold text-[#8C6D1F] font-sans-brand">
                              {item.product.weight}
                            </span>
                            <span className="text-xs text-[#7B8F80]">
                              · ₹{item.product.price} each
                            </span>
                          </div>
                          <div className="text-xs text-[#4E6152] font-sans-brand pt-0.5">
                            Line Total: <strong className="text-[#142B1A] font-bold">₹{lineTotal}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper & Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#F2ECE1]">
                        {/* Stepper */}
                        <div className="inline-flex items-center border border-[#142B1A]/20 rounded-xl bg-[#FAF7F2] text-xs h-10 px-1.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.product.id)}
                            className="w-8 h-full flex items-center justify-center text-[#142B1A] hover:bg-[#EAE0CD] transition-colors cursor-pointer rounded-lg"
                            aria-label={`Decrease ${item.product.name} quantity`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-[#142B1A] select-none font-sans-brand">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.product.id)}
                            className="w-8 h-full flex items-center justify-center text-[#142B1A] hover:bg-[#EAE0CD] transition-colors cursor-pointer rounded-lg"
                            aria-label={`Increase ${item.product.name} quantity`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="text-[#9CAE9F] hover:text-[#C0392B] transition-colors p-2 cursor-pointer"
                          aria-label={`Remove ${item.product.name} ${item.product.weight}`}
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Order Summary (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-[#DDD1BE] p-6 sm:p-8 shadow-md space-y-6">
                
                <h2 className="text-xl font-serif-brand font-bold text-[#142B1A] pb-4 border-b border-[#E5DAC6]">
                  Order Summary
                </h2>

                {/* Subtotal */}
                <div className="flex justify-between items-baseline text-[#142B1A]">
                  <span className="text-sm font-sans-brand text-[#4E6152]">
                    Subtotal ({totalItems} {totalItems === 1 ? 'pack' : 'packs'})
                  </span>
                  <span className="text-2xl font-serif-brand font-bold text-[#142B1A]">
                    ₹{subtotal}
                  </span>
                </div>

                {/* Specific un-invented shipping notice required by prompt */}
                <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] text-xs text-[#5D6F61] font-sans-brand leading-relaxed">
                  Shipping and applicable charges will be calculated at checkout.
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('/checkout')}
                    className="w-full py-4 px-6 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-[#234A30] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight size={16} className="text-[#E5C778]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('/')}
                    className="w-full py-3.5 px-6 rounded-full bg-white border border-[#142B1A]/20 text-[#142B1A] font-bold text-xs uppercase tracking-[0.15em] font-sans-brand hover:bg-[#FAF7F2] transition-colors cursor-pointer text-center"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
