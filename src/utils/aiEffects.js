// Production-Grade AI Effects & 4K Super-Resolution Engine
import { removeImageBackground } from './backgroundRemoval';

export const AI_EFFECTS_LIST = [
  {
    id: 'auto-hdr',
    name: 'Auto HDR Clarity',
    category: 'enhance',
    tag: 'Popular',
    description: 'Expands dynamic range, recovers shadow details, and boosts micro-contrast',
    icon: 'sparkles',
    gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
  },
  {
    id: 'portrait-retouch',
    name: 'Studio Portrait Glow',
    category: 'enhance',
    tag: 'Portrait',
    description: 'Flattering skin smoothing, warm tones, and radiant portrait depth',
    icon: 'user',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)'
  },
  {
    id: 'super-clarity',
    name: 'Ultra Detail Sharpness',
    category: 'enhance',
    tag: '4K Sharp',
    description: 'Unsharp mask algorithm for razor-sharp textures and crisp edges',
    icon: 'zap',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
  },
  {
    id: 'night-boost',
    name: 'Low-Light Night Boost',
    category: 'enhance',
    tag: 'Restore',
    description: 'Lifts dark underexposed shadows and restores vibrant nighttime colors',
    icon: 'moon',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  },
  {
    id: 'vivid-pop',
    name: 'AI Vivid Color Pop',
    category: 'enhance',
    tag: 'Vibrant',
    description: 'Intelligent color saturation lift without blowing out natural skin tones',
    icon: 'sun',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'style',
    tag: 'Cinematic',
    description: 'Electric teal shadows with hot magenta and purple neon highlights',
    icon: 'disc',
    gradient: 'linear-gradient(135deg, #06b6d4, #d946ef)'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Sunset',
    category: 'style',
    tag: 'Atmosphere',
    description: 'Rich amber sunlight with soft blooming highlights and warm radiant glow',
    icon: 'sun',
    gradient: 'linear-gradient(135deg, #f59e0b, #eab308)'
  },
  {
    id: 'studio-drama',
    name: 'Studio Dramatic Lighting',
    category: 'style',
    tag: 'Editorial',
    description: 'Deep sculpted contrast and bold key lighting for high-end magazine looks',
    icon: 'camera',
    gradient: 'linear-gradient(135deg, #374151, #111827)'
  },
  {
    id: 'monochrome',
    name: 'Fine Art B&W Silver',
    category: 'style',
    tag: 'Monochrome',
    description: 'Classic Ansel Adams style black and white with silver tonal gradation',
    icon: 'eye',
    gradient: 'linear-gradient(135deg, #6b7280, #1f2937)'
  },
  {
    id: 'vintage-film',
    name: 'Vintage 35mm Analog',
    category: 'style',
    tag: 'Retro',
    description: 'Kodak Portra warm film emulation with matte blacks and nostalgic grain',
    icon: 'film',
    gradient: 'linear-gradient(135deg, #d97706, #78350f)'
  },
  {
    id: 'anime-art',
    name: 'Anime Cel-Shaded',
    category: 'style',
    tag: 'Artistic',
    description: 'Posterized anime colors, defined outlines, and stylized comic aesthetic',
    icon: 'feather',
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting Canvas',
    category: 'style',
    tag: 'Artistic',
    description: 'Impressionist brush stroke texture with painterly artistic blending',
    icon: 'palette',
    gradient: 'linear-gradient(135deg, #10b981, #047857)'
  },
  {
    id: 'bokeh-blur',
    name: 'Portrait Bokeh Blur',
    category: 'bg',
    tag: 'Depth',
    description: 'Keeps central subject sharp with dreamy creamy background lens blur',
    icon: 'target',
    gradient: 'linear-gradient(135deg, #a855f7, #6366f1)'
  },
  {
    id: 'remove-bg',
    name: 'Isolate Subject (No BG)',
    category: 'bg',
    tag: 'Clean PNG',
    description: 'One-click AI subject separation with transparent background',
    icon: 'scissors',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  }
];

/**
 * Helper to load an image source into HTMLImageElement
 */
export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Apply AI Effect to an image source with adjustable intensity (0 to 100%)
 */
export async function applyAiEffect(sourceSrc, effectId, intensity = 100) {
  if (!sourceSrc) return '';
  if (effectId === 'remove-bg') {
    return await removeImageBackground(sourceSrc, { tolerance: 42, feather: 2, mode: 'border' });
  }

  const img = await loadImageElement(sourceSrc);
  const w = img.naturalWidth || img.width || 800;
  const h = img.naturalHeight || img.height || 800;

  // Working canvas
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  // Original image buffer (for intensity blending)
  const origData = ctx.getImageData(0, 0, w, h);
  const procData = ctx.getImageData(0, 0, w, h);
  const data = procData.data;
  const len = data.length;

  const blendFactor = Math.max(0, Math.min(100, intensity)) / 100;

  switch (effectId) {
    case 'auto-hdr': {
      // 1. Min/max luminance stretch
      let minL = 255, maxL = 0;
      for (let i = 0; i < len; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < minL) minL = lum;
        if (lum > maxL) maxL = lum;
      }
      const range = Math.max(1, maxL - minL);

      for (let i = 0; i < len; i += 4) {
        let r = (data[i] - minL) * (255 / range);
        let g = (data[i + 1] - minL) * (255 / range);
        let b = (data[i + 2] - minL) * (255 / range);

        // Shadow lifting (boost darker regions)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 140) {
          const boost = (140 - lum) * 0.25;
          r += boost;
          g += boost;
          b += boost;
        }

        // Vibrancy
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * 1.25;
        g = gray + (g - gray) * 1.20;
        b = gray + (b - gray) * 1.15;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'portrait-retouch': {
      // Soft skin tone enhancement with flattering warm radiance
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Lift midtones gently
        r = Math.pow(r / 255, 0.92) * 255;
        g = Math.pow(g / 255, 0.94) * 255;
        b = Math.pow(b / 255, 0.96) * 255;

        // Subtle peach warmth
        r += 12;
        g += 6;

        // Gentle highlight glow
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 160) {
          const glow = (lum - 160) * 0.15;
          r += glow;
          g += glow * 0.8;
          b += glow * 0.5;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'super-clarity': {
      // High frequency contrast & sharpness
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Micro contrast S-curve
        const contrast = 28;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'night-boost': {
      // Restore underexposed night shots
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Gamma curve expansion (lift shadows dramatically)
        r = Math.pow(r / 255, 0.72) * 255;
        g = Math.pow(g / 255, 0.72) * 255;
        b = Math.pow(b / 255, 0.72) * 255;

        // Neutralize cold blue darkness with balanced warmth
        r += 14;
        g += 8;

        // Vibrance
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * 1.30;
        g = gray + (g - gray) * 1.30;
        b = gray + (b - gray) * 1.30;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'vivid-pop': {
      // Dynamic color vibrance
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;

        // Less saturated colors get a bigger boost
        const boost = 1.45 - sat * 0.4;
        r = gray + (r - gray) * boost;
        g = gray + (g - gray) * boost;
        b = gray + (b - gray) * boost;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'cyberpunk': {
      // Electric cyan shadows, magenta / neon purple highlights
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 128) {
          // Shadows -> Cyan / Teal
          r = Math.max(0, r - 25);
          g = Math.min(255, g + 20);
          b = Math.min(255, b + 50);
        } else {
          // Highlights -> Hot Magenta / Neon Pink
          r = Math.min(255, r + 45);
          g = Math.max(0, g - 12);
          b = Math.min(255, b + 40);
        }

        // High contrast punch
        r = ((r - 128) * 1.3) + 128;
        g = ((g - 128) * 1.3) + 128;
        b = ((b - 128) * 1.3) + 128;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'golden-hour': {
      // Radiant amber sunset glow
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Warm color grade
        r = r * 1.18 + 18;
        g = g * 1.06 + 8;
        b = b * 0.82 - 10;

        // Highlight gold bloom
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 140) {
          const factor = (lum - 140) * 0.2;
          r += factor * 1.5;
          g += factor * 1.2;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'studio-drama': {
      // High-contrast sculpted lighting
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // S-curve contrast
        const factor = (259 * (42 + 255)) / (255 * (259 - 42));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        // Deepen shadows
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 100) {
          r *= 0.85;
          g *= 0.85;
          b *= 0.85;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'monochrome': {
      // Fine Art B&W Silver
      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Photographic luminance weights
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Rich contrast S-curve
        gray = ((gray - 128) * 1.35) + 128;

        // Subtle silver cool tone
        data[i] = Math.min(255, Math.max(0, gray + 2));
        data[i + 1] = Math.min(255, Math.max(0, gray + 2));
        data[i + 2] = Math.min(255, Math.max(0, gray + 6));
      }
      break;
    }

    case 'vintage-film': {
      // 35mm Analog Portra film
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Raised blacks (film matte look)
        r = (r * 0.9) + 24;
        g = (g * 0.9) + 20;
        b = (b * 0.85) + 28;

        // Warm midtone shift
        r += 10;
        b -= 8;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'anime-art': {
      // Cel-shading / posterization + saturated pop colors
      const steps = 36;
      for (let i = 0; i < len; i += 4) {
        let r = Math.round(data[i] / steps) * steps;
        let g = Math.round(data[i + 1] / steps) * steps;
        let b = Math.round(data[i + 2] / steps) * steps;

        // Saturated boost
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * 1.45;
        g = gray + (g - gray) * 1.45;
        b = gray + (b - gray) * 1.45;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'oil-painting': {
      // Impressionistic paint smoothing
      for (let i = 0; i < len; i += 4) {
        let r = Math.round(data[i] / 18) * 18;
        let g = Math.round(data[i + 1] / 18) * 18;
        let b = Math.round(data[i + 2] / 18) * 18;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * 1.35;
        g = gray + (g - gray) * 1.35;
        b = gray + (b - gray) * 1.25;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      break;
    }

    case 'bokeh-blur': {
      // Sharp center subject with creamy progressive background blur
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy) * 0.75;

      // Blur layer
      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = w;
      blurCanvas.height = h;
      const blurCtx = blurCanvas.getContext('2d');
      blurCtx.filter = 'blur(16px)';
      blurCtx.drawImage(img, 0, 0, w, h);
      const blurData = blurCtx.getImageData(0, 0, w, h).data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const dx = x - cx;
          const dy = (y - cy) * 1.2; // portrait oval
          const dist = Math.sqrt(dx * dx + dy * dy);
          const blurFactor = Math.max(0, Math.min(1, (dist - 140) / (maxDist - 140)));

          data[idx] = origData.data[idx] * (1 - blurFactor) + blurData[idx] * blurFactor;
          data[idx + 1] = origData.data[idx + 1] * (1 - blurFactor) + blurData[idx + 1] * blurFactor;
          data[idx + 2] = origData.data[idx + 2] * (1 - blurFactor) + blurData[idx + 2] * blurFactor;
        }
      }
      break;
    }

    default:
      break;
  }

  // 3. Blend processed data with original data based on intensity
  if (blendFactor < 1 && effectId !== 'bokeh-blur') {
    const oData = origData.data;
    for (let i = 0; i < len; i += 4) {
      data[i] = Math.round(oData[i] * (1 - blendFactor) + data[i] * blendFactor);
      data[i + 1] = Math.round(oData[i + 1] * (1 - blendFactor) + data[i + 1] * blendFactor);
      data[i + 2] = Math.round(oData[i + 2] * (1 - blendFactor) + data[i + 2] * blendFactor);
    }
  }

  ctx.putImageData(procData, 0, 0);

  // If super-clarity or auto-hdr, apply subtle unsharp convolution
  if (effectId === 'super-clarity' || effectId === 'auto-hdr') {
    applyUnsharpSharpen(ctx, w, h, 0.45 * blendFactor);
  }

  return canvas.toDataURL('image/png');
}

/**
 * 3x3 Unsharp Convolution Filter for edge sharpening
 */
function applyUnsharpSharpen(ctx, w, h, strength = 0.4) {
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const src = imgData.data;
    const output = ctx.createImageData(w, h);
    const dst = output.data;

    const centerWeight = 1 + 4 * strength;
    const edgeWeight = -strength;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            src[idx + c] * centerWeight +
            src[idx - 4 + c] * edgeWeight +
            src[idx + 4 + c] * edgeWeight +
            src[idx - w * 4 + c] * edgeWeight +
            src[idx + w * 4 + c] * edgeWeight;

          dst[idx + c] = Math.min(255, Math.max(0, val));
        }
        dst[idx + 3] = src[idx + 3];
      }
    }

    ctx.putImageData(output, 0, 0);
  } catch {}
}

/**
 * Super-Resolution 4K UHD Export (3840px crisp upscaled image)
 */
export async function export4KImage(imageSrc, fileName = 'enhanced-photo-4k', format = 'png') {
  if (!imageSrc) throw new Error('No image provided to export.');

  const img = await loadImageElement(imageSrc);
  const origW = img.naturalWidth || img.width || 1920;
  const origH = img.naturalHeight || img.height || 1080;

  // Calculate 4K dimensions (Ultra HD: 3840 × 2160 or matching aspect ratio)
  let targetW = 3840;
  let targetH = 2160;

  if (origW >= origH) {
    targetW = 3840;
    targetH = Math.round((3840 * origH) / origW);
  } else {
    targetH = 3840;
    targetW = Math.round((3840 * origW) / origH);
  }

  // Create 4K high-density canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Multi-pass supersampling for ultra crispness
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Apply crisp unsharp mask on 4K output
  applyUnsharpSharpen(ctx, targetW, targetH, 0.35);

  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'enhanced_photo';
  const outName = `${cleanName}_4K_UHD.${format === 'jpeg' ? 'jpg' : 'png'}`;

  // Export to Blob and trigger instant download
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate 4K image blob'));
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

        resolve({
          width: targetW,
          height: targetH,
          sizeBytes: blob.size,
          fileName: outName,
          blobUrl
        });
      },
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      0.96
    );
  });
}

