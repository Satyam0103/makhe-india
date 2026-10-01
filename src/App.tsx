/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { EditModeProvider } from './context/EditModeContext';
import { EditImagesToggle } from './components/EditImagesToggle';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { Home } from './pages/Home';
import { OurStory } from './pages/OurStory';
import { Blog } from './pages/Blog';
import { Wholesale } from './pages/Wholesale';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account';
import { ProductDetail } from './pages/ProductDetail';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { isAdminAuthenticated } from './services/adminAuthService';
import { PageRoute } from './types';
import { syncLocalImagesToServer } from './utils/imageStorage';

function normalizeRoute(raw: string): string {
  if (!raw) return '/';
  let str = raw.trim();
  // Strip protocol / domain if full URL was provided
  try {
    if (str.startsWith('http://') || str.startsWith('https://')) {
      const u = new URL(str);
      str = u.pathname + u.search + u.hash;
    }
  } catch {}
  // If hash-based routing is used e.g. #/admin/login
  if (str.startsWith('#')) {
    str = str.replace(/^#\/?/, '/');
  }
  // Strip double slashes at the start to prevent protocol-relative hostname interpretation
  str = str.replace(/^\/+/, '/');
  // Ensure starts with /
  if (!str.startsWith('/')) {
    str = '/' + str;
  }
  return str;
}

function isValidRoute(rawPath: string): boolean {
  const path = normalizeRoute(rawPath);
  if (['/', '/our-story', '/blog', '/wholesale', '/contact', '/cart', '/checkout', '/account'].includes(path)) {
    return true;
  }
  if (path.startsWith('/product/') || path.startsWith('/order-confirmation/') || path.startsWith('/admin')) {
    return true;
  }
  return false;
}

function getInitialRoute(): PageRoute {
  if (typeof window === 'undefined') return '/';

  // Check query parameter ?route=... or ?path=... (used by some iframe wrappers)
  const params = new URLSearchParams(window.location.search);
  const qRoute = params.get('route') || params.get('path') || params.get('page');
  if (qRoute) {
    const norm = normalizeRoute(qRoute);
    if (isValidRoute(norm)) return norm as PageRoute;
  }

  // Check hash e.g. #/admin/login
  const hash = window.location.hash;
  if (hash) {
    const norm = normalizeRoute(hash);
    if (isValidRoute(norm)) return norm as PageRoute;
  }

  // Check pathname
  const path = normalizeRoute(window.location.pathname);
  if (isValidRoute(path)) {
    return path as PageRoute;
  }

  return '/';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>(getInitialRoute);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync browser back/forward buttons & iframe routing
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentPage(route);
    };
    const handleHashChange = () => {
      const route = getInitialRoute();
      setCurrentPage(route);
    };
    const handleAuthFail = () => {
      handleNavigate('/admin/login');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('makhe_admin_auth_failed', handleAuthFail);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('makhe_admin_auth_failed', handleAuthFail);
    };
  }, []);

  // Automatically sweep and sync any local/editor images into permanent server files
  useEffect(() => {
    syncLocalImagesToServer().then((result) => {
      if (result.count > 0) {
        console.log(`[Assets] Permanently synchronized ${result.count} images to server build:`, result.saved);
      }
    }).catch(() => {});
  }, []);

  const handleNavigate = (route: PageRoute) => {
    const cleanRoute = normalizeRoute(route);
    setCurrentPage(cleanRoute as PageRoute);
    try {
      window.history.pushState({}, '', cleanRoute);
    } catch {
      // In restricted iframes, history.pushState might be constrained
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isProductRoute = currentPage.startsWith('/product/');
  const productSlug = isProductRoute ? currentPage.replace('/product/', '') : '';

  const isOrderConfirmationRoute = currentPage.startsWith('/order-confirmation/');
  const rawConfirmationParam = isOrderConfirmationRoute ? currentPage.replace('/order-confirmation/', '') : '';
  const [orderNumber, rawQuery] = rawConfirmationParam.split('?');
  const orderToken = new URLSearchParams(rawQuery || window.location.search).get('token') || undefined;

  const isAdminRoute = currentPage.startsWith('/admin');
  const isAdminLogin = currentPage === '/admin/login';
  const isAdminOrders = currentPage.startsWith('/admin/orders/');
  const adminOrderId = isAdminOrders ? currentPage.replace('/admin/orders/', '') : undefined;

  // Dedicated Private Admin Area (No public header/footer or marketing elements)
  if (isAdminRoute) {
    if (isAdminLogin) {
      return <AdminLogin onNavigate={handleNavigate} />;
    }
    // Protected admin route: if not authenticated, render AdminLogin directly
    if (!isAdminAuthenticated()) {
      return <AdminLogin onNavigate={handleNavigate} />;
    }
    return <AdminDashboard onNavigate={handleNavigate} selectedOrderId={adminOrderId} />;
  }

  return (
    <EditModeProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#142B1A] font-sans-brand selection:bg-[#183321] selection:text-[#FAF7F2] w-full max-w-full overflow-x-hidden">
          
          {/* Responsive Header */}
          <Header
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Dynamic Page Router */}
          <div className="flex-1">
            {currentPage === '/' && <Home onNavigate={handleNavigate} />}
            {currentPage === '/our-story' && <OurStory onNavigate={handleNavigate} />}
            {currentPage === '/blog' && <Blog onNavigate={handleNavigate} />}
            {currentPage === '/wholesale' && <Wholesale onNavigate={handleNavigate} />}
            {currentPage === '/contact' && <Contact onNavigate={handleNavigate} />}
            {currentPage === '/cart' && <Cart onNavigate={handleNavigate} />}
            {currentPage === '/checkout' && <Checkout onNavigate={handleNavigate} />}
            {currentPage === '/account' && <Account onNavigate={handleNavigate} />}
            {isProductRoute && <ProductDetail slug={productSlug} onNavigate={handleNavigate} />}
            {isOrderConfirmationRoute && (
              <OrderConfirmation
                orderNumber={orderNumber}
                orderToken={orderToken}
                onNavigate={handleNavigate}
              />
            )}
          </div>

          {/* Footer */}
          <Footer onNavigate={handleNavigate} />

          {/* Cart Drawer */}
          <CartDrawer onNavigate={handleNavigate} />

          {/* Search Modal */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onNavigate={handleNavigate}
          />

          {/* Edit Images Floating Button */}
          <EditImagesToggle />

        </div>
      </CartProvider>
    </EditModeProvider>
  );
}
