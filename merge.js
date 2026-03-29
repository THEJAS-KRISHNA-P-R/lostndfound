import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function mergeLogos() {
  try {
    const iconPath = path.join(__dirname, 'public/logos/android-chrome-192x192.png');
    const textPath = path.join(__dirname, 'public/logos/lofo.png');
    const outputPath = path.join(__dirname, 'public/logos/lofo-merged.png');

    const iconResized = await sharp(iconPath).resize({ width: 192, height: 192 }).toBuffer();
    const textResized = await sharp(textPath).resize({ height: 160 }).toBuffer();

    // Create a blank transparent canvas
    const combinedCanvas = sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 13, g: 15, b: 20, alpha: 1 }
      }
    });

    // Composite them
    await combinedCanvas
      .composite([
        { input: iconResized, top: 219, left: 350 }, 
        { input: textResized, top: 235, left: 560 }
      ])
      .png()
      .toFile(outputPath);

    console.log('Successfully created', outputPath);
  } catch {
    console.error('Migration merge failed');
    process.exit(1);
  }
}

mergeLogos();
