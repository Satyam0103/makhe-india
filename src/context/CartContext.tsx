import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem, CartItemStored } from '../types';
import { PRODUCTS, getProductById } from '../data/products';

interface CartContextType {
  // Stored state items
  items: CartItemStored[];
  // Derived rich items with full product details looked up from products.ts
  cart: CartItem[];
  // Cart Actions
  addItem: (productId: string, quantity?: number) => void;
  addToCart: (productOrId: Product | string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setExactQuantity: (productId: string, quantity: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  // Derived statistics
  totalItems: number; // TOTAL QUANTITY across all items (e.g. 2 + 3 = 5)
  subtotal: number;
  totalSavings: number;
  // Drawer visibility
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'makhe_cart_items_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize stored items from localStorage with validation
  const [items, setItems] = useState<CartItemStored[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Validate: item must have a valid productId that exists in PRODUCTS and quantity > 0
          return parsed.filter(
            (it): it is CartItemStored =>
              typeof it === 'object' &&
              it !== null &&
              typeof it.productId === 'string' &&
              typeof it.quantity === 'number' &&
              it.quantity > 0 &&
              PRODUCTS.some((p) => p.id === it.productId)
          );
        }
      }
    } catch (e) {
      console.error('Failed to parse cart items from localStorage', e);
    }
    return [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Persist only { productId, quantity } to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart items to localStorage', e);
    }
  }, [items]);

  // Derived rich cart items with product details looked up from products.ts
  const cart = useMemo<CartItem[]>(() => {
    const list: CartItem[] = [];
    for (const item of items) {
      const product = getProductById(item.productId);
      if (product) {
        list.push({ product, quantity: item.quantity });
      }
    }
    return list;
  }, [items]);

  // Derived Total Quantity across all items
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Derived Subtotal calculated from trusted product prices
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Derived Total Savings
  const totalSavings = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.mrp - item.product.price) * item.quantity, 0);
  }, [cart]);

  // Core Actions
  const addItem = (productId: string, quantity = 1) => {
    if (quantity <= 0) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.productId === productId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { productId, quantity }];
    });
    setIsDrawerOpen(true);
  };

  const addToCart = (productOrId: Product | string, quantity = 1) => {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id;
    addItem(id, quantity);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const removeFromCart = (productId: string) => {
    removeItem(productId);
  };

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, quantity } : it))
    );
  };

  const setExactQuantity = (productId: string, quantity: number) => {
    setQuantity(productId, quantity);
  };

  const increaseQuantity = (productId: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId ? { ...it, quantity: it.quantity + 1 } : it
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.productId === productId) {
            const nextQty = it.quantity - 1;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter((it): it is CartItemStored => it !== null)
    );
  };

  const updateQuantity = (productId: string, delta: number) => {
    if (delta > 0) {
      increaseQuantity(productId);
    } else if (delta < 0) {
      decreaseQuantity(productId);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cart,
        addItem,
        addToCart,
        removeItem,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        setQuantity,
        setExactQuantity,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        totalSavings,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
