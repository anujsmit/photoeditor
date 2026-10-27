/**
 * High-Quality Background Removal Engine for BARD Photo Editor
 * Features:
 * 1. Dominant background color detection via color histogram binning (resilient to subjects touching borders)
 * 2. Multi-seed border flood fill (BFS) with fast Int32Array queue
 * 3. Edge alpha matting & feathering for clean, natural contours
 * 4. Safety threshold bounds preventing accidental subject wipeout
 * 5. Maximum dimension guard for real-time responsiveness
 */

/**
 * Remove background from an image source data URL or HTMLImageElement
 * @param {string} imageSrc - base64 or object URL of the image
 * @param {object} options - configuration options
 * @returns {Promise<string>} - transparent PNG data URL
 */
export function removeImageBackground(imageSrc, options = {}) {
  const {
    tolerance = 42,
    feather = 2,
    mode = 'border',
    customColor = null
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Downscale oversized images (max 1920) for responsive processing
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const totalPixels = width * height;

        // 1. Determine Dominant Background Color
        let bgR = 255;
        let bgG = 255;
        let bgB = 255;

        if (customColor && Array.isArray(customColor)) {
          [bgR, bgG, bgB] = customColor;
        } else {
          // Sample border pixels (sample from top, left, right borders and corner regions)
          const samples = [];
          const stepX = Math.max(1, Math.floor(width / 40));
          const stepY = Math.max(1, Math.floor(height / 40));

          // Top edge (most reliable for portraits & products)
          for (let x = 0; x < width; x += stepX) {
            const idx = x * 4;
            if (data[idx + 3] > 20) samples.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
          // Left and right edges
          for (let y = 0; y < height; y += stepY) {
            const lIdx = (y * width) * 4;
            const rIdx = (y * width + (width - 1)) * 4;
            if (data[lIdx + 3] > 20) samples.push([data[lIdx], data[lIdx + 1], data[lIdx + 2]]);
            if (data[rIdx + 3] > 20) samples.push([data[rIdx], data[rIdx + 1], data[rIdx + 2]]);
          }
          // Bottom edge (only sample corners of bottom, avoiding center subject)
          const btmCornerCount = Math.floor(width * 0.25);
          for (let x = 0; x < btmCornerCount; x += stepX) {
            const bIdx1 = ((height - 1) * width + x) * 4;
            const bIdx2 = ((height - 1) * width + (width - 1 - x)) * 4;
            if (data[bIdx1 + 3] > 20) samples.push([data[bIdx1], data[bIdx1 + 1], data[bIdx1 + 2]]);
            if (data[bIdx2 + 3] > 20) samples.push([data[bIdx2], data[bIdx2 + 1], data[bIdx2 + 2]]);
          }

          if (samples.length > 0) {
            // Find DOMINANT color bucket via 16-step quantization
            const bins = new Map();
            samples.forEach(([r, g, b]) => {
              const key = (Math.floor(r / 16) << 8) | (Math.floor(g / 16) << 4) | Math.floor(b / 16);
              if (!bins.has(key)) bins.set(key, { count: 0, sumR: 0, sumG: 0, sumB: 0 });
              const entry = bins.get(key);
              entry.count++;
              entry.sumR += r;
              entry.sumG += g;
              entry.sumB += b;
            });

            let bestEntry = null;
            let maxCount = -1;
            for (const entry of bins.values()) {
              if (entry.count > maxCount) {
                maxCount = entry.count;
                bestEntry = entry;
              }
            }

            if (bestEntry && bestEntry.count > 0) {
              bgR = Math.round(bestEntry.sumR / bestEntry.count);
              bgG = Math.round(bestEntry.sumG / bestEntry.count);
              bgB = Math.round(bestEntry.sumB / bestEntry.count);
            }
          }
        }

        // Perceptual color distance function
        const colorDiff = (r, g, b) => {
          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          return Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
        };

        // Threshold calibrated to 0-100 slider
        const tolThreshold = (tolerance / 100) * 160;
        const featherBand = Math.max(8, feather * 6);

        const isBg = new Uint8Array(totalPixels); // 0 = fg, 1 = bg, 2 = edge

        if (mode === 'border') {
          const queue = new Int32Array(totalPixels);
          let head = 0;
          let tail = 0;
          const visited = new Uint8Array(totalPixels);

          const testAndEnqueue = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            const idx = y * width + x;
            if (visited[idx]) return;
            visited[idx] = 1;

            const p = idx * 4;
            // Transparent pixels are already background
            if (data[p + 3] <= 15) {
              isBg[idx] = 1;
              queue[tail++] = idx;
              return;
            }

            const diff = colorDiff(data[p], data[p + 1], data[p + 2]);
            if (diff <= tolThreshold) {
              isBg[idx] = 1;
              queue[tail++] = idx;
            } else if (diff <= tolThreshold + featherBand) {
              isBg[idx] = 2; // Transition edge
            }
          };

          // Seed top, left, right, and bottom corners
          for (let x = 0; x < width; x++) {
            testAndEnqueue(x, 0);
          }
          for (let y = 0; y < height; y++) {
            testAndEnqueue(0, y);
            testAndEnqueue(width - 1, y);
          }
          const btmCornerCount = Math.floor(width * 0.25);
          for (let x = 0; x < btmCornerCount; x++) {
            testAndEnqueue(x, height - 1);
            testAndEnqueue(width - 1 - x, height - 1);
          }

          // Flood fill queue processing
          while (head < tail) {
            const curr = queue[head++];
            const cx = curr % width;
            const cy = (curr / width) | 0;

            if (cx > 0) testAndEnqueue(cx - 1, cy);
            if (cx < width - 1) testAndEnqueue(cx + 1, cy);
            if (cy > 0) testAndEnqueue(cx, cy - 1);
            if (cy < height - 1) testAndEnqueue(cx, cy + 1);
          }

          // Safety check: if flood fill swallowed > 95% of image, fall back to stricter threshold
          if (tail > totalPixels * 0.95) {
            isBg.fill(0);
            for (let i = 0; i < totalPixels; i++) {
              const p = i * 4;
              const diff = colorDiff(data[p], data[p + 1], data[p + 2]);
              if (diff <= tolThreshold * 0.6) {
                isBg[i] = 1;
              } else if (diff <= tolThreshold * 0.6 + featherBand) {
                isBg[i] = 2;
              }
            }
          }
        } else {
          // Global mode
          for (let i = 0; i < totalPixels; i++) {
            const p = i * 4;
            const diff = colorDiff(data[p], data[p + 1], data[p + 2]);
            if (diff <= tolThreshold) {
              isBg[i] = 1;
            } else if (diff <= tolThreshold + featherBand) {
              isBg[i] = 2;
            }
          }
        }

        // Apply alpha matting and defringing
        for (let i = 0; i < totalPixels; i++) {
          const p = i * 4;
          if (isBg[i] === 1) {
            data[p + 3] = 0;
          } else if (isBg[i] === 2 && feather > 0) {
            const diff = colorDiff(data[p], data[p + 1], data[p + 2]);
            const alphaFrac = Math.max(0, Math.min(1, (diff - tolThreshold) / featherBand));
            data[p + 3] = Math.round(data[p + 3] * alphaFrac);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}

/**
 * Remove pixels matching a specific target color (eyedropper / chroma key removal)
 * @param {string} imageSrc - base64 or object URL of image
 * @param {number[]} targetColor - [r, g, b] color to remove
 * @param {object} options - configuration options (tolerance, feather, contiguous, seedPoint)
 * @returns {Promise<string>} - transparent PNG data URL
 */
export function removeImageByColor(imageSrc, targetColor, options = {}) {
  const {
    tolerance = 30,
    feather = 2,
    contiguous = true,
    seedPoint = null
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const totalPixels = width * height;

        const [tr, tg, tb] = targetColor;

        const colorDiff = (r, g, b) => {
          const dr = r - tr;
          const dg = g - tg;
          const db = b - tb;
          return Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
        };

        const tolThreshold = (tolerance / 100) * 160;
        const featherBand = Math.max(6, feather * 5);
        const isBg = new Uint8Array(totalPixels);

        if (contiguous) {
          const queue = new Int32Array(totalPixels);
          let head = 0;
          let tail = 0;
          const visited = new Uint8Array(totalPixels);

          const testAndEnqueue = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            const idx = y * width + x;
            if (visited[idx]) return;
            visited[idx] = 1;

            const p = idx * 4;
            if (data[p + 3] <= 10) {
              isBg[idx] = 1;
              queue[tail++] = idx;
              return;
            }

            const diff = colorDiff(data[p], data[p + 1], data[p + 2]);
            if (diff <= tolThreshold) {
              isBg[idx] = 1;
              queue[tail++] = idx;
            } else if (diff <= tolThreshold + featherBand) {
              isBg[idx] = 2;
            }
          };

          if (seedPoint && typeof seedPoint.x === 'number' && typeof seedPoint.y === 'number') {
            const sx = Math.max(0, Math.min(width - 1, Math.round(seedPoint.x)));
            const sy = Math.max(0, Math.min(height - 1, Math.round(seedPoint.y)));
            testAndEnqueue(sx, sy);
          } else {
            // Seed all borders that match target color
            for (let x = 0; x < width; x++) {
              testAndEnqueue(x, 0);
              testAndEnqueue(x, height - 1);
            }
            for (let y = 0; y < height; y++) {
              testAndEnqueue(0, y);
              testAndEnqueue(width - 1, y);
            }
          }

          while (head < tail) {
            const curr = queue[head++];
            const cx = curr % width;
            const cy = (curr / width) | 0;

            if (cx > 0) testAndEnqueue(cx - 1, cy);
            if (cx < width - 1) testAndEnqueue(cx + 1, cy);
            if (cy > 0) testAndEnqueue(cx, cy - 1);
            if (cy < height - 1) testAndEnqueue(cx, cy + 1);
          }
        } else {
          // Global mode: remove everywhere
          for (let i = 0; i < totalPixels; i++) {
            const p = i * 4;
            const diff = colorDiff(data[p], data[p + 1], data[p + 2]);
            if (diff <= tolThreshold) {
              isBg[i] = 1;
            } else if (diff <= tolThreshold + featherBand) {
              isBg[i] = 2;
            }
          }
        }

        // Apply transparency
        for (let i = 0; i < totalPixels; i++) {
          const p = i * 4;
          if (isBg[i] === 1) {
            data[p + 3] = 0;
          } else if (isBg[i] === 2 && feather > 0) {
            const diff = colorDiff(data[p], data[p + 1], data[p + 2]);
            const alphaFrac = Math.max(0, Math.min(1, (diff - tolThreshold) / featherBand));
            data[p + 3] = Math.round(data[p + 3] * alphaFrac);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}

/**
 * Sample a pixel RGB color from an image at relative or coordinate position
 */
export function samplePixelColor(imageSrc, xRatio, yRatio) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const px = Math.max(0, Math.min(canvas.width - 1, Math.round(xRatio * canvas.width)));
      const py = Math.max(0, Math.min(canvas.height - 1, Math.round(yRatio * canvas.height)));
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      resolve([pixel[0], pixel[1], pixel[2]]);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}
