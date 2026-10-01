import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';

const router = Router();

// Handle banner image upload
router.post('/banner/upload', (req: Request, res: Response): void => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ success: false, message: 'Missing imageBase64 payload' });
      return;
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const publicAssetsDir = path.resolve(process.cwd(), 'public/assets');
    const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');

    if (!fs.existsSync(publicAssetsDir)) {
      fs.mkdirSync(publicAssetsDir, { recursive: true });
    }
    if (!fs.existsSync(distAssetsDir)) {
      fs.mkdirSync(distAssetsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicAssetsDir, 'makhe_hero_banner.jpg'), buffer);
    fs.writeFileSync(path.join(distAssetsDir, 'makhe_hero_banner.jpg'), buffer);

    res.json({
      success: true,
      url: '/assets/makhe_hero_banner.jpg',
      message: 'Banner uploaded and saved successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Banner upload failed' });
  }
});

// Check custom banner status
router.get('/banner/status', (_req: Request, res: Response): void => {
  const publicJpg = path.resolve(process.cwd(), 'public/assets/makhe_hero_banner.jpg');
  if (fs.existsSync(publicJpg)) {
    res.json({ success: true, hasCustomBanner: true, url: '/assets/makhe_hero_banner.jpg' });
  } else {
    res.json({ success: true, hasCustomBanner: false, url: '/assets/makhe_hero_banner.svg' });
  }
});

export default router;
