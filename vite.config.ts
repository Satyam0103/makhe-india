import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function imageUploadPlugin(): Plugin {
  return {
    name: 'image-upload-handler',
    configureServer(server) {
      server.middlewares.use('/api/upload-hero', (req, res) => {
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              let imageBuffer: Buffer;
              const str = buffer.toString('utf-8');
              if (str.startsWith('{') && str.includes('image')) {
                const parsed = JSON.parse(str);
                const base64Data = parsed.image.replace(/^data:image\/\w+;base64,/, '');
                imageBuffer = Buffer.from(base64Data, 'base64');
              } else {
                imageBuffer = buffer;
              }
              const assetsDir = path.resolve(__dirname, 'public/assets');
              if (!fs.existsSync(assetsDir)) {
                fs.mkdirSync(assetsDir, {recursive: true});
              }
              fs.writeFileSync(path.join(assetsDir, 'hero_banner.jpg'), imageBuffer);
              fs.writeFileSync(path.join(assetsDir, 'hero_banner.jpeg'), imageBuffer);
              fs.writeFileSync(path.join(assetsDir, 'makhe_hero_banner.jpg'), imageBuffer);
              fs.writeFileSync(path.join(assetsDir, 'makhe_hero_banner.jpeg'), imageBuffer);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({success: true, path: '/assets/hero_banner.jpg'}));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: err?.message || 'Upload failed'}));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), imageUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist/client',
      emptyOutDir: true,
    },
  };
});
