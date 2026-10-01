/**
 * Permanent image asset management & synchronization.
 * Bridges browser-selected images directly to the permanent server filesystem (/public/images/)
 * ensuring that every real image is permanently part of the build and visible on all devices.
 */

const DB_NAME = 'MakheImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_images';

// In-memory cache for ultra-fast zero-latency reads across component lifecycle
const memoryCache = new Map<string, string>();

// Server permanent assets manifest cache
let serverAssetsManifest: Record<string, string> | null = null;
let manifestFetchPromise: Promise<Record<string, string>> | null = null;

export const KEY_TO_ASSET_FILE: Record<string, string> = {
  // Hero
  'home-hero-banner': 'hero-banner.webp',

  // Products
  'product-listing-250gm': 'product-250g.webp',
  'home-product-250g': 'product-250g.webp',
  'product-listing-100gm': 'product-100g.webp',
  'home-product-100g': 'product-100g.webp',
  'product-listing-og-9kg': 'product-9kg-og.webp',
  'product-listing-ashoka-9kg': 'product-9kg-ashoka.webp',

  // Why Choose
  'why-makhe-native-sourcing': 'why-choose-1.webp',
  'why-makhe-traditional-processing': 'why-choose-2.webp',
  'why-makhe-modern-cleaning': 'why-choose-3.webp',
  'why-makhe-healthy-snacking': 'why-choose-4.webp',

  // 4 PM Craving
  'four-pm-craving-step-1': 'craving-step-1.webp',
  'four-pm-craving-step-2': 'craving-step-2.webp',
  'four-pm-craving-step-3': 'craving-step-3.webp',

  // Story & Lifestyle
  'home-story-image': 'home-story.webp',
  'home-lifestyle-image': 'lifestyle-bowl.webp',
  'home-story-teaser-image': 'story-teaser.webp',

  // Journey
  'home-journey-stage-1': 'journey-1.webp',
  'home-journey-stage-2': 'journey-2.webp',
  'home-journey-stage-3': 'journey-3.webp',
  'home-journey-stage-4': 'journey-4.webp',

  // Logo
  'makhe-logo': 'brand/makhe-india-logo.png',
  'makhe-header-logo': 'brand/makhe-india-logo.png',

  // Our Story Page
  'our-story-hero': 'our-story-hero.webp',
  'our-story-craft-image': 'our-story-craft.webp',
  'our-story-lifestyle-image': 'our-story-lifestyle.webp',
  'our-story-gallery-1': 'our-story-gallery-1.webp',
  'our-story-gallery-2': 'our-story-gallery-2.webp',
  'our-story-gallery-3': 'our-story-gallery-3.webp',

  // Wholesale
  'wholesale-hero-pack': 'wholesale-hero.webp',
  'wholesale-product-100g': 'product-100g.webp',
  'wholesale-product-250g': 'product-250g.webp',

  // Official UPI QR
  'makhe-upi-qr': 'upi/makhe-upi-qr.jpeg',
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDB(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          }
        } catch {
          // ignore upgrade errors
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

export interface StoredImageData {
  key: string;
  dataUrl: string;
  updatedAt: number;
}

/**
 * Resizes and optimizes an image DataURL using HTMLCanvasElement.
 */
export function optimizeImage(
  dataUrl: string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve) => {
    if (dataUrl.startsWith('data:image/svg+xml')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(dataUrl);
        return;
      }

      if (width <= maxWidth && height <= maxHeight && dataUrl.length < 500000) {
        resolve(dataUrl);
        return;
      }

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mime = dataUrl.startsWith('data:image/png') && dataUrl.length < 1500000
          ? 'image/png'
          : 'image/webp';

        const optimized = canvas.toDataURL(mime, quality);
        resolve(optimized);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Fetches the permanent asset manifest from the server backend.
 */
export async function fetchServerManifest(): Promise<Record<string, string>> {
  if (serverAssetsManifest) return serverAssetsManifest;
  if (manifestFetchPromise) return manifestFetchPromise;

  manifestFetchPromise = fetch('/api/assets/manifest')
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.assets) {
        serverAssetsManifest = data.assets;
        return data.assets;
      }
      serverAssetsManifest = {};
      return {};
    })
    .catch(() => {
      serverAssetsManifest = {};
      return {};
    })
    .finally(() => {
      manifestFetchPromise = null;
    });

  return manifestFetchPromise;
}

/**
 * Get permanent image URL or data URL by storageKey.
 * Resolution hierarchy:
 * 1. Server permanent asset manifest (/images/<name>)
 * 2. In-memory cache
 * 3. LocalStorage
 * 4. IndexedDB
 */
export async function getCustomImage(key: string): Promise<string | null> {
  // 1. Check server permanent asset manifest first
  const manifest = await fetchServerManifest();
  if (manifest && manifest[key]) {
    return manifest[key];
  }

  // 2. Check in-memory cache
  if (memoryCache.has(key)) {
    return memoryCache.get(key) || null;
  }

  // 3. Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(`makhe_img_${key}`);
      if (local) {
        memoryCache.set(key, local);
        // Asynchronously persist to server if not in manifest
        saveImageToServer(key, local).catch(() => {});
        return local;
      }
    } catch {
      // ignore
    }
  }

  // 4. Fallback to IndexedDB
  try {
    const db = await Promise.race([
      getDB(),
      new Promise<null>((r) => setTimeout(() => r(null), 600)),
    ]);
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const result = req.result as StoredImageData | undefined;
          if (result?.dataUrl) {
            memoryCache.set(key, result.dataUrl);
            saveImageToServer(key, result.dataUrl).catch(() => {});
            resolve(result.dataUrl);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Writes image data to the backend server to store permanently in /public/images/
 */
export async function saveImageToServer(key: string, dataUrl: string): Promise<string | null> {
  try {
    const filename = KEY_TO_ASSET_FILE[key];
    const res = await fetch('/api/assets/save-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, dataUrl, filename }),
    });
    const data = await res.json();
    if (data.success && data.url) {
      if (!serverAssetsManifest) serverAssetsManifest = {};
      serverAssetsManifest[key] = data.url;
      return data.url;
    }
  } catch (err) {
    console.warn('[AssetSync] Failed to save asset to server:', err);
  }
  return null;
}

/**
 * Save custom image data URL into Memory, localStorage, IndexedDB, AND server filesystem.
 */
export async function setCustomImage(key: string, dataUrl: string): Promise<string> {
  // 1. In-memory cache update
  memoryCache.set(key, dataUrl);

  // 2. localStorage update & event dispatch immediately (0ms delay)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`makhe_img_${key}`, dataUrl);
    } catch {
      // ignore
    }

    try {
      window.dispatchEvent(
        new CustomEvent('makhe_image_updated', {
          detail: { key, dataUrl },
        })
      );
    } catch {
      // ignore
    }
  }

  // 3. Asynchronously persist into IndexedDB
  try {
    const db = await Promise.race([
      getDB(),
      new Promise<null>((r) => setTimeout(() => r(null), 600)),
    ]);
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        key,
        dataUrl,
        updatedAt: Date.now(),
      });
    }
  } catch {
    // ignore
  }

  // 4. PERMANENT SERVER PERSISTENCE: Save directly to /public/images/
  const serverUrl = await saveImageToServer(key, dataUrl);
  return serverUrl || dataUrl;
}

/**
 * Remove custom image from memory, localStorage, and IndexedDB.
 */
export async function removeCustomImage(key: string): Promise<void> {
  memoryCache.delete(key);
  if (serverAssetsManifest) {
    delete serverAssetsManifest[key];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`makhe_img_${key}`);
    } catch {
      // ignore
    }

    try {
      window.dispatchEvent(
        new CustomEvent('makhe_image_updated', {
          detail: { key, dataUrl: null },
        })
      );
    } catch {
      // ignore
    }
  }

  try {
    const db = await getDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
    }
  } catch {
    // ignore
  }
}

/**
 * Automatically synchronizes all images from browser's localStorage & IndexedDB to the server disk.
 * Run once on client boot.
 */
export async function syncLocalImagesToServer(): Promise<{ count: number; saved: string[] }> {
  const itemsToSync: Array<{ key: string; dataUrl: string; filename?: string }> = [];

  // 1. Gather all localStorage images
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (fullKey && fullKey.startsWith('makhe_img_')) {
          const key = fullKey.replace('makhe_img_', '');
          const dataUrl = localStorage.getItem(fullKey);
          if (dataUrl && (dataUrl.startsWith('data:image/') || dataUrl.startsWith('/images/'))) {
            itemsToSync.push({
              key,
              dataUrl,
              filename: KEY_TO_ASSET_FILE[key],
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Gather any IndexedDB images
  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => {
            const records = (req.result || []) as StoredImageData[];
            for (const r of records) {
              if (r.key && r.dataUrl && !itemsToSync.some((it) => it.key === r.key)) {
                itemsToSync.push({
                  key: r.key,
                  dataUrl: r.dataUrl,
                  filename: KEY_TO_ASSET_FILE[r.key],
                });
              }
            }
            resolve();
          };
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  } catch {
    // ignore
  }

  if (itemsToSync.length === 0) {
    return { count: 0, saved: [] };
  }

  try {
    const res = await fetch('/api/assets/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToSync }),
    });
    const data = await res.json();
    if (data.success && data.assets) {
      serverAssetsManifest = data.assets;
      return {
        count: data.savedCount || itemsToSync.length,
        saved: Object.keys(data.assets),
      };
    }
  } catch (err) {
    console.warn('[AssetSync] Batch sync to server failed:', err);
  }

  return { count: 0, saved: [] };
}
