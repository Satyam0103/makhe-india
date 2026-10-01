import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger';

const router = Router();

const PUBLIC_IMAGES_DIR = path.resolve(process.cwd(), 'public/images');
const DIST_IMAGES_DIR = path.resolve(process.cwd(), 'dist/images');
const MANIFEST_PATH = path.join(PUBLIC_IMAGES_DIR, 'asset-manifest.json');

// Ensure image directories exist
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(DIST_IMAGES_DIR)) {
  fs.mkdirSync(DIST_IMAGES_DIR, { recursive: true });
}

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
  'makhe-logo': 'logo.svg',
  'makhe-header-logo': 'logo.svg',

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

export const ASSET_ALIASES: Record<string, string[]> = {
  'makhe-upi-qr.jpeg': ['upi/makhe-upi-qr.jpeg'],
  'hero-banner.webp': ['hero/makhe-hero.webp'],
  'product-250g.webp': ['products/250g.webp'],
  'product-100g.webp': ['products/100g.webp'],
  'product-9kg-og.webp': ['products/og-9kg.webp'],
  'product-9kg-ashoka.webp': ['products/ashoka-9kg.webp'],
  'why-choose-1.webp': ['why-choose/native-sourcing.webp'],
  'why-choose-2.webp': ['why-choose/traditional-processing.webp'],
  'why-choose-3.webp': ['why-choose/modern-cleaning.webp'],
  'why-choose-4.webp': ['why-choose/healthy-snacking.webp'],
  'craving-step-1.webp': ['craving/step-1.webp'],
  'craving-step-2.webp': ['craving/step-2.webp'],
  'craving-step-3.webp': ['craving/step-3.webp'],
  'story-teaser.webp': ['story/from-bihar-with-care.webp'],
  'our-story-lifestyle.webp': ['story/our-story-lifestyle.webp'],
  'logo.svg': ['logo/logo.svg'],
};

function readManifest(): Record<string, string> {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return {};
}

function writeManifest(manifest: Record<string, string>) {
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    const distManifest = path.join(DIST_IMAGES_DIR, 'asset-manifest.json');
    fs.writeFileSync(distManifest, JSON.stringify(manifest, null, 2), 'utf8');
  } catch (err: any) {
    logger.warn('[Asset] Failed to write manifest:', err?.message);
  }
}

function saveSingleImageFile(key: string, dataUrl: string, requestedFilename?: string): string | null {
  try {
    let filename = requestedFilename || KEY_TO_ASSET_FILE[key];
    if (!filename) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      filename = `${sanitizedKey}.webp`;
    }

    // Determine extension from dataUrl if necessary
    if (dataUrl.startsWith('data:image/svg+xml')) {
      filename = filename.replace(/\.(webp|jpg|jpeg|png)$/, '.svg');
    } else if (dataUrl.startsWith('data:image/png') && !filename.endsWith('.png')) {
      filename = filename.replace(/\.(webp|jpg|jpeg)$/, '.png');
    }

    const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const publicPath = path.join(PUBLIC_IMAGES_DIR, filename);
    const distPath = path.join(DIST_IMAGES_DIR, filename);

    fs.writeFileSync(publicPath, buffer);
    try {
      fs.writeFileSync(distPath, buffer);
    } catch {
      // dist may not exist yet in dev
    }

    // Mirror to structured subfolder aliases if present
    const aliases = ASSET_ALIASES[filename] || [];
    for (const alias of aliases) {
      try {
        const aliasPublic = path.join(PUBLIC_IMAGES_DIR, alias);
        const aliasDist = path.join(DIST_IMAGES_DIR, alias);
        fs.mkdirSync(path.dirname(aliasPublic), { recursive: true });
        fs.mkdirSync(path.dirname(aliasDist), { recursive: true });
        fs.writeFileSync(aliasPublic, buffer);
        fs.writeFileSync(aliasDist, buffer);
      } catch {
        // ignore mirror error
      }
    }

    const publicUrl = `/images/${filename}`;
    logger.info(`[Asset] Permanently stored asset '${key}' at '${publicUrl}' (${buffer.length} bytes)`);
    return publicUrl;
  } catch (err: any) {
    logger.warn(`[Asset] Failed to save asset '${key}':`, err?.message);
    return null;
  }
}

/**
 * GET /api/assets/manifest
 * Returns all active permanent assets
 */
router.get('/assets/manifest', (_req: Request, res: Response): void => {
  const manifest = readManifest();

  // Also check disk for mapped files
  for (const [key, filename] of Object.entries(KEY_TO_ASSET_FILE)) {
    const filePath = path.join(PUBLIC_IMAGES_DIR, filename);
    if (fs.existsSync(filePath) && !manifest[key]) {
      manifest[key] = `/images/${filename}`;
    }
  }

  res.json({
    success: true,
    assets: manifest,
  });
});

/**
 * POST /api/assets/save-image
 * Saves a single image into /public/images/
 */
router.post('/assets/save-image', (req: Request, res: Response): void => {
  try {
    const { key, dataUrl, filename } = req.body;
    if (!key || !dataUrl) {
      res.status(400).json({ success: false, message: 'Missing key or dataUrl payload' });
      return;
    }

    const publicUrl = saveSingleImageFile(key, dataUrl, filename);
    if (!publicUrl) {
      res.status(500).json({ success: false, message: 'Failed to write image file to disk' });
      return;
    }

    const manifest = readManifest();
    manifest[key] = publicUrl;
    writeManifest(manifest);

    res.json({
      success: true,
      key,
      url: publicUrl,
      message: `Asset successfully saved as permanent asset at ${publicUrl}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to save asset' });
  }
});

/**
 * POST /api/assets/sync-all
 * Batch sync of multiple images from browser to server disk
 */
router.post('/assets/sync-all', (req: Request, res: Response): void => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'No items provided for sync' });
      return;
    }

    const manifest = readManifest();
    let savedCount = 0;

    for (const item of items) {
      if (item.key && item.dataUrl) {
        const publicUrl = saveSingleImageFile(item.key, item.dataUrl, item.filename);
        if (publicUrl) {
          manifest[item.key] = publicUrl;
          savedCount++;
        }
      }
    }

    writeManifest(manifest);

    res.json({
      success: true,
      savedCount,
      assets: manifest,
      message: `Successfully synchronized and stored ${savedCount} assets permanently on server`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Sync failed' });
  }
});

export default router;
