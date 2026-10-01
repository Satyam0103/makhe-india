/**
 * Official Razorpay Checkout Script Loader
 * Dynamically loads https://checkout.razorpay.com/v1/checkout.js
 * Caches the script promise to prevent redundant DOM injections.
 */

let loadPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // Check if Razorpay constructor is already attached to window
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  // Re-use in-flight load request
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      if ((window as any).Razorpay) {
        resolve(true);
      } else {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => {
          loadPromise = null;
          resolve(false);
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}
