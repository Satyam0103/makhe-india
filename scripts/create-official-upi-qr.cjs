const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { Resvg } = require('@resvg/resvg-js');
const jpeg = require('jpeg-js');

async function generateOfficialUpiQr() {
  const width = 540;
  const height = 960;

  // Generate QR Code with Error Correction Level H (high redundancy so logo in center is scannable)
  // UPI link configured for Abhinayan Kumar
  const upiPayload = 'upi://pay?pa=abhinayan.kumar@phonepe&pn=ABHINAYAN%20KUMAR&cu=INR&tn=Makhe%20India%20Order';
  
  const qrSvgRaw = await QRCode.toString(upiPayload, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#FFFFFF',
      light: '#000000'
    }
  });

  // Extract inner path or svg contents
  const pathMatch = qrSvgRaw.match(/<path[^>]+d="([^"]+)"/);
  const pathData = pathMatch ? pathMatch[1] : '';

  // Get viewBox to properly scale the QR code
  const viewBoxMatch = qrSvgRaw.match(/viewBox="0 0 (\d+) (\d+)"/);
  const qrDim = viewBoxMatch ? parseInt(viewBoxMatch[1], 10) : 45;

  const qrDisplaySize = 340;
  const qrX = (width - qrDisplaySize) / 2;
  const qrY = 320;
  const scale = qrDisplaySize / qrDim;

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid Black Background -->
  <rect width="${width}" height="${height}" fill="#0A0A0A" />

  <!-- TOP HEADER: PhonePe Logo & Wordmark -->
  <g transform="translate(195, 100)">
    <!-- PhonePe Purple Circular Icon -->
    <circle cx="24" cy="24" r="24" fill="#5F259F" />
    <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#FFFFFF" text-anchor="middle">पे</text>
    
    <!-- PhonePe Wordmark -->
    <text x="60" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="30" fill="#FFFFFF">PhonePe</text>
  </g>

  <!-- ACCEPTED HERE (Purple) -->
  <text x="270" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="19" fill="#9345FF" text-anchor="middle" letter-spacing="1.5">ACCEPTED HERE</text>

  <!-- Scan any QR using PhonePe App -->
  <text x="270" y="285" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="15" fill="#E2E8F0" text-anchor="middle">Scan any QR using PhonePe App</text>

  <!-- CENTER: QR Code (White modules on Black background) -->
  <g transform="translate(${qrX}, ${qrY}) scale(${scale})">
    <path d="${pathData}" fill="#FFFFFF" />
  </g>

  <!-- PhonePe Logo at center of QR code with dark outline -->
  <circle cx="270" cy="${qrY + qrDisplaySize / 2}" r="34" fill="#0A0A0A" />
  <circle cx="270" cy="${qrY + qrDisplaySize / 2}" r="30" fill="#5F259F" />
  <text x="270" y="${qrY + qrDisplaySize / 2 + 10}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="30" fill="#FFFFFF" text-anchor="middle">पे</text>

  <!-- ABHINAYAN KUMAR -->
  <text x="270" y="715" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="17" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">ABHINAYAN KUMAR</text>

  <!-- FOOTER -->
  <text x="270" y="915" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="400" font-size="11" fill="#71717A" text-anchor="middle">©2026, All rights reserved, PhonePe Internet Pvt. Ltd.</text>
</svg>
`;

  // Render SVG to raw RGBA pixels
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'sans-serif'
    }
  });
  const pngData = resvg.render();
  const rawPixels = pngData.pixels;

  // Encode to true JPEG format (quality 92)
  const jpegResult = jpeg.encode({
    data: rawPixels,
    width: pngData.width,
    height: pngData.height
  }, 92);

  const targetDir = path.resolve(process.cwd(), 'public/images/upi');
  const distDir = path.resolve(process.cwd(), 'dist/images/upi');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(distDir, { recursive: true });

  const targetPath = path.join(targetDir, 'makhe-upi-qr.jpeg');
  const distPath = path.join(distDir, 'makhe-upi-qr.jpeg');

  fs.writeFileSync(targetPath, jpegResult.data);
  try {
    fs.writeFileSync(distPath, jpegResult.data);
  } catch {}

  console.log(`[Success] Official UPI QR created at: ${targetPath} (${jpegResult.data.length} bytes)`);
}

generateOfficialUpiQr().catch(console.error);
