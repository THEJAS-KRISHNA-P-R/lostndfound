const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function mergeLogos() {
  try {
    const iconPath = path.join(__dirname, 'public/logos/android-chrome-192x192.png');
    const textPath = path.join(__dirname, 'public/logos/lofo.png');
    const outputPath = path.join(__dirname, 'public/logos/lofo-merged.png');

    // Get metadata
    const iconMeta = await sharp(iconPath).metadata();
    const textMeta = await sharp(textPath).metadata();

    // In Navbar, Icon is 48x48, Text is height 40. 
    // We'll scale up by 4x to maintain high resolution (Icon: 192x192, Text: height 160)
    const targetIconSize = 192;
    const targetTextHeight = 160;

    // We'll resize the text image to height 160.
    const resizedTextBuffer = await sharp(textPath)
      .resize({ height: targetTextHeight })
      .toBuffer();

    const resizedTextMeta = await sharp(resizedTextBuffer).metadata();

    // Gap reduced for tighter branding
    const gap = -5;

    // Total width canvas
    const totalWidth = targetIconSize + gap + resizedTextMeta.width;
    const totalHeight = 192; // max height is the icon

    // Calculate Y offset for the text to vertically center it against the icon
    const textYOffset = Math.floor((totalHeight - targetTextHeight) / 2);

    // Create a blank transparent canvas
    const baseCanvas = await sharp({
      create: {
        width: totalWidth,
        height: totalHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([
        { input: iconPath, top: 0, left: 0 },
        { input: resizedTextBuffer, top: textYOffset, left: targetIconSize + gap }
      ])
      .png()
      .toFile(outputPath);

    console.log('Successfully created', outputPath);
  } catch (err) {
    console.error('Error merging logos:', err);
  }
}

mergeLogos();
