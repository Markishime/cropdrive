/**
 * Script to create circular favicon files from CropDrive logo
 * Run with: node scripts/create-circular-favicon.js
 * 
 * Requires: sharp (npm install sharp --save-dev)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/images/Cropdrive Logo.png');
const outputDir = path.join(__dirname, '../public');

// Sizes for different favicon files
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon.ico', isIco: true },
];

async function createCircularFavicon(size, outputName, isIco = false) {
  try {
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo file not found: ${logoPath}`);
    }

    const metadata = await sharp(logoPath).metadata();
    if (!isIco) {
      console.log(`📷 Processing ${outputName}: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
    }

    // Resize the logo to fill 85% of the circle to ensure it's visible
    const logoSize = Math.floor(size * 0.85);
    const padding = Math.floor((size - logoSize) / 2);
    
    // Resize the logo maintaining aspect ratio
    const resizedLogo = await sharp(logoPath)
      .ensureAlpha()
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Create square canvas and center the logo
    const logoCanvas = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: resizedLogo,
          top: padding,
          left: padding,
        },
      ])
      .png()
      .toBuffer();

    // Create circular mask using SVG
    const svgMask = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `);

    // Apply circular mask to create perfect circle
    const circularImage = await sharp(logoCanvas)
      .composite([
        {
          input: svgMask,
          blend: 'dest-in', // Keep only the circular area
        },
      ])
      .png()
      .toBuffer();

    // Save the file
    const outputPath = path.join(outputDir, outputName);
    
    if (isIco) {
      // For ICO, save as PNG (browsers accept PNG data in .ico files)
      // Vercel and browsers will handle it correctly
      await sharp(circularImage)
        .png()
        .toFile(outputPath);
      console.log(`✅ Created ${outputName} (${size}x${size}) - Circular PNG format`);
    } else {
      await sharp(circularImage)
        .png()
        .toFile(outputPath);
      console.log(`✅ Created ${outputName} (${size}x${size})`);
    }
  } catch (error) {
    console.error(`❌ Error creating ${outputName}:`, error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

async function createAllFavicons() {
  console.log('🎨 Creating circular favicon files...\n');

  if (!fs.existsSync(logoPath)) {
    console.error(`❌ Logo not found at: ${logoPath}`);
    console.error(`   Please ensure the file exists at: ${path.resolve(logoPath)}`);
    return;
  }

  try {
    const metadata = await sharp(logoPath).metadata();
    console.log(`✅ Logo file found: ${metadata.width}x${metadata.height}, format: ${metadata.format}\n`);
  } catch (error) {
    console.error(`❌ Cannot read logo file: ${error.message}`);
    return;
  }

  for (const { size, name, isIco } of sizes) {
    await createCircularFavicon(size, name, isIco);
  }

  console.log('\n✨ Done! Circular favicon files created in /public/');
  console.log('📝 Clear browser cache or hard refresh (Ctrl+Shift+R / Cmd+Shift+R)');
  console.log('📝 The favicon should now appear as a circular logo in browser tabs');
  console.log('📝 Vercel should now properly render the favicon');
}

createAllFavicons();
