// Production-ready Canvas Engine: Pixel processing, adjustments, filters, and history

/**
 * Apply real pixel-level adjustments to an ImageData object
 */
export function processImageAdjustments(imageData, adjustments) {
  const data = imageData.data;
  const len = data.length;

  const {
    brightness = 0,    // -100 to 100
    contrast = 0,      // -100 to 100
    exposure = 0,      // -100 to 100
    highlights = 0,    // -100 to 100
    shadows = 0,       // -100 to 100
    saturation = 0,    // -100 to 100
    vibrance = 0,      // -100 to 100
    temperature = 0,   // -100 to 100 (warm/cool)
    tint = 0           // -100 to 100 (magenta/green)
  } = adjustments;

  // Pre-calculate factor constants
  const bFactor = (brightness + exposure * 1.2) * 2.55;
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const sFactor = (saturation + 100) / 100;
  const vFactor = vibrance / 100;
  const tempFactor = temperature * 0.8;
  const tintFactor = tint * 0.8;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure & Brightness
    r += bFactor;
    g += bFactor;
    b += bFactor;

    // 2. Contrast
    if (contrast !== 0) {
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;
    }

    // 3. Highlights & Shadows
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (highlights !== 0 && lum > 128) {
      const hScale = (lum - 128) / 128 * (highlights * 0.5);
      r += hScale;
      g += hScale;
      b += hScale;
    }
    if (shadows !== 0 && lum < 128) {
      const sScale = (128 - lum) / 128 * (shadows * 0.5);
      r += sScale;
      g += sScale;
      b += sScale;
    }

    // 4. Temperature (Red vs Blue) & Tint (Green vs Magenta)
    if (tempFactor !== 0) {
      r += tempFactor;
      b -= tempFactor;
    }
    if (tintFactor !== 0) {
      g -= tintFactor;
      r += tintFactor * 0.5;
      b += tintFactor * 0.5;
    }

    // 5. Saturation & Vibrance
    if (sFactor !== 1 || vFactor !== 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxRGB = Math.max(r, g, b);
      const minRGB = Math.min(r, g, b);
      const sat = (maxRGB === 0) ? 0 : (maxRGB - minRGB) / maxRGB;
      const effectiveVibrance = vFactor * (1 - sat); // boost less-saturated colors more

      r = gray + (r - gray) * sFactor * (1 + effectiveVibrance);
      g = gray + (g - gray) * sFactor * (1 + effectiveVibrance);
      b = gray + (b - gray) * sFactor * (1 + effectiveVibrance);
    }

    // Clamp values 0 - 255
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  return imageData;
}

/**
 * Apply AI Auto Enhancement to an image buffer
 */
export function applyAutoEnhance(imageData) {
  const data = imageData.data;
  const len = data.length;

  let minL = 255, maxL = 0;

  // 1. Find min and max luminance for histogram stretch
  for (let i = 0; i < len; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < minL) minL = lum;
    if (lum > maxL) maxL = lum;
  }

  const range = Math.max(1, maxL - minL);

  // 2. Stretch levels and boost vibrancy
  for (let i = 0; i < len; i += 4) {
    let r = (data[i] - minL) * (255 / range);
    let g = (data[i + 1] - minL) * (255 / range);
    let b = (data[i + 2] - minL) * (255 / range);

    // Subtle skin tone & vibrancy lift
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * 1.15;
    g = gray + (g - gray) * 1.12;
    b = gray + (b - gray) * 1.10;

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  return imageData;
}

/**
 * Apply AI Edge-Aware Background Removal Simulation
 */
export function applyBackgroundRemoval(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Sample corner background colors (top-left, top-right)
  const bgR = (data[0] + data[(width - 1) * 4]) / 2;
  const bgG = (data[1] + data[(width - 1) * 4 + 1]) / 2;
  const bgB = (data[2] + data[(width - 1) * 4 + 2]) / 2;

  const threshold = 65;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const diff = Math.sqrt(
        (r - bgR) ** 2 +
        (g - bgG) ** 2 +
        (b - bgB) ** 2
      );

      // Distance from center weight (portrait subject usually centered)
      const distFromCenter = Math.hypot((x - width / 2) / (width / 2), (y - height / 2) / (height / 2));

      if (diff < threshold && distFromCenter > 0.45) {
        data[idx + 3] = 0; // Transparent
      } else if (diff < threshold + 25 && distFromCenter > 0.55) {
        data[idx + 3] = Math.round(((diff - threshold) / 25) * 255); // Smooth edge alpha
      }
    }
  }

  return imageData;
}

/**
 * Create a procedural starter image on canvas if offline
 */
export function generateStarterPortraitDataUrl() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // Sunset mountain sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 800);
  skyGrad.addColorStop(0, '#1e1136');
  skyGrad.addColorStop(0.35, '#582458');
  skyGrad.addColorStop(0.65, '#a44256');
  skyGrad.addColorStop(0.85, '#d97d54');
  skyGrad.addColorStop(1, '#f7b05b');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1200, 800);

  // Sun glow
  const sunGrad = ctx.createRadialGradient(850, 450, 10, 850, 450, 320);
  sunGrad.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
  sunGrad.addColorStop(0.4, 'rgba(247, 176, 91, 0.4)');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(850, 450, 320, 0, Math.PI * 2);
  ctx.fill();

  // Distant mountain silhouettes
  ctx.fillStyle = 'rgba(50, 25, 60, 0.6)';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.lineTo(250, 420);
  ctx.lineTo(500, 490);
  ctx.lineTo(750, 380);
  ctx.lineTo(1050, 510);
  ctx.lineTo(1200, 460);
  ctx.lineTo(1200, 800);
  ctx.lineTo(0, 800);
  ctx.closePath();
  ctx.fill();

  // Foreground mountain ridge
  ctx.fillStyle = '#1c1024';
  ctx.beginPath();
  ctx.moveTo(0, 600);
  ctx.lineTo(350, 510);
  ctx.lineTo(650, 590);
  ctx.lineTo(950, 480);
  ctx.lineTo(1200, 560);
  ctx.lineTo(1200, 800);
  ctx.lineTo(0, 800);
  ctx.closePath();
  ctx.fill();

  // Portrait Subject Silhouette with golden rim lighting
  ctx.save();
  ctx.shadowColor = 'rgba(255, 200, 120, 0.8)';
  ctx.shadowBlur = 35;
  ctx.fillStyle = '#181220';

  // Body
  ctx.beginPath();
  ctx.ellipse(450, 720, 190, 220, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(450, 420, 95, 125, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair waves
  ctx.beginPath();
  ctx.ellipse(420, 430, 115, 145, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}
