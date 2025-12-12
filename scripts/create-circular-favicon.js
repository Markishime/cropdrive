/**
 * Script to create circular favicon files from CropDrive logo
 * Run with: node scripts/create-circular-favicon.js
 * 
 * Requires: sharp (npm install sharp --save-dev)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/images/CropDrive.png');
const outputDir = path.join(__dirname, '../public');

// Sizes for different favicon files
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function createCircularFavicon(size, outputName) {
  try {
    // Create a circular mask SVG
    const svgMask = `
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `;

    // Load the logo and resize it to fit within the circle (with padding)
    const logoSize = Math.floor(size * 0.8); // 80% of the circle size for padding
    const padding = (size - logoSize) / 2;

    // Create circular favicon
    await sharp(logoPath)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .composite([
        {
          input: Buffer.from(svgMask),
          top: 0,
          left: 0,
        },
      ])
      .extract({
        left: 0,
        top: 0,
        width: size,
        height: size,
      })
      .png()
      .toFile(path.join(outputDir, outputName));

    console.log(`✅ Created ${outputName} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Error creating ${outputName}:`, error.message);
  }
}

async function createAllFavicons() {
  console.log('🎨 Creating circular favicon files...\n');

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error(`❌ Logo not found at: ${logoPath}`);
    return;
  }

  // Create all favicon sizes
  for (const { size, name } of sizes) {
    await createCircularFavicon(size, name);
  }

  console.log('\n✨ Done! Circular favicon files created in /public/');
  console.log('📝 Note: You may need to create favicon.ico manually using an online converter');
}

createAllFavicons();

