// Image Processing Utilities: CSS Filters, Canvas composite export, and download

/**
 * Convert adjustments and filter presets to a valid CSS filter string
 */
export function getCombinedFilterStyle(adjustments, activeFilterCss = "none") {
  const {
    brightness = 0,
    contrast = 0,
    exposure = 0,
    saturation = 0,
    vibrance = 0,
    temperature = 0,
    tint = 0,
    highlights = 0,
    shadows = 0,
    whites = 0,
    blacks = 0
  } = adjustments;

  const bVal = Math.max(0, 100 + brightness * 0.8 + exposure * 1.2 + (whites - blacks) * 0.3);
  const cVal = Math.max(0, 100 + contrast * 0.9 + (highlights - shadows) * 0.2);
  const sVal = Math.max(0, 100 + saturation * 1.0 + vibrance * 0.6);
  
  const hueVal = tint * 0.5 + (temperature > 0 ? -temperature * 0.3 : -temperature * 0.4);
  const sepiaVal = temperature > 0 ? Math.min(100, temperature * 0.5) : 0;

  const adjParts = [];
  if (bVal !== 100) adjParts.push(`brightness(${bVal.toFixed(1)}%)`);
  if (cVal !== 100) adjParts.push(`contrast(${cVal.toFixed(1)}%)`);
  if (sVal !== 100) adjParts.push(`saturate(${sVal.toFixed(1)}%)`);
  if (sepiaVal > 0) adjParts.push(`sepia(${sepiaVal.toFixed(1)}%)`);
  if (hueVal !== 0) adjParts.push(`hue-rotate(${hueVal.toFixed(1)}deg)`);

  const adjFilter = adjParts.join(" ");

  if (activeFilterCss && activeFilterCss !== "none") {
    return adjFilter ? `${activeFilterCss} ${adjFilter}` : activeFilterCss;
  }
  return adjFilter || "none";
}

/**
 * Render the multi-layer composite to a hidden canvas and trigger download
 */
export async function exportCanvasImage({
  imageSrc,
  layers = [],
  canvasBgColor = '#ffffff',
  docDimensions = { width: 1920, height: 1080 },
  format = "png",
  quality = 95,
  width = 1920,
  height = 1080,
  filterStyle = "none",
  textLayer = null,
  transparentBg = false,
  fileName = "bard-photo-export"
}) {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      const exportWidth = parseInt(width) || docDimensions.width || 1920;
      const exportHeight = parseInt(height) || docDimensions.height || 1080;

      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext("2d");

      // 1. Canvas Background
      if (!transparentBg) {
        ctx.fillStyle = canvasBgColor === 'transparent' ? '#ffffff' : canvasBgColor;
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      }

      const scaleX = exportWidth / (docDimensions.width || exportWidth);
      const scaleY = exportHeight / (docDimensions.height || exportHeight);

      // Helper to load image
      const loadImage = (src) => {
        return new Promise((res) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => res(img);
          img.onerror = () => res(null);
          img.src = src;
        });
      };

      // 2. Render visible layers from bottom to top
      const renderLayers = async () => {
        if (layers && layers.length > 0) {
          const reversed = layers.slice().reverse();
          for (const layer of reversed) {
            if (!layer.visible) continue;

            if (layer.type === 'background' && !transparentBg) {
              ctx.fillStyle = layer.fill || canvasBgColor;
              ctx.fillRect(0, 0, exportWidth, exportHeight);
            } else if (layer.type === 'image' && layer.src) {
              const img = await loadImage(layer.src);
              if (img) {
                ctx.save();
                ctx.globalAlpha = (layer.opacity ?? 100) / 100;
                if (filterStyle && filterStyle !== 'none') {
                  ctx.filter = filterStyle;
                }
                const lx = (layer.x ?? 0) * scaleX;
                const ly = (layer.y ?? 0) * scaleY;
                const lw = (layer.width ?? docDimensions.width) * scaleX;
                const lh = (layer.height ?? docDimensions.height) * scaleY;

                ctx.drawImage(img, lx, ly, lw, lh);
                ctx.restore();
              }
            } else if (layer.type === 'text' && layer.text) {
              ctx.save();
              ctx.globalAlpha = (layer.opacity ?? 100) / 100;
              const fontSize = Math.round((layer.size || 120) * (exportWidth / 1920));
              ctx.font = `${layer.weight === 'Bold' ? 'bold' : layer.weight === 'Semi-Bold' ? '600' : 'normal'} ${fontSize}px ${layer.font || "Poppins, sans-serif"}`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const tx = (exportWidth * (layer.x ?? 50)) / 100;
              const ty = (exportHeight * (layer.y ?? 50)) / 100;

              if (layer.glow) {
                ctx.shadowColor = layer.glowColor || "#c084fc";
                ctx.shadowBlur = 30;
              }

              if (layer.shadow) {
                ctx.shadowColor = "rgba(0,0,0,0.85)";
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 4;
                ctx.shadowBlur = 12;
              }

              if (layer.outline) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.05));
                ctx.strokeText(layer.text, tx, ty);
              }

              ctx.fillStyle = layer.color || "#ffffff";
              ctx.fillText(layer.text, tx, ty);
              ctx.restore();
            }
          }
        } else if (imageSrc) {
          // Fallback single image
          const img = await loadImage(imageSrc);
          if (img) {
            ctx.save();
            if (filterStyle && filterStyle !== 'none') {
              ctx.filter = filterStyle;
            }
            ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
            ctx.restore();
          }
        }

        // 3. Render Fallback Text Overlay if not already in layers stack
        const hasTextInStack = layers && layers.some(l => l.type === 'text');
        if (!hasTextInStack && textLayer && textLayer.visible && textLayer.text) {
          ctx.save();
          const fontSize = Math.round((textLayer.size || 120) * (exportWidth / 1920));
          ctx.font = `${textLayer.weight === 'Bold' ? 'bold' : 'normal'} ${fontSize}px ${textLayer.font || "Poppins, sans-serif"}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const tx = (exportWidth * (textLayer.x ?? 50)) / 100;
          const ty = (exportHeight * (textLayer.y ?? 50)) / 100;

          if (textLayer.glow) {
            ctx.shadowColor = textLayer.glowColor || "#c084fc";
            ctx.shadowBlur = 30;
          }

          if (textLayer.shadow) {
            ctx.shadowColor = "rgba(0,0,0,0.85)";
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowBlur = 12;
          }

          if (textLayer.outline) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.05));
            ctx.strokeText(textLayer.text, tx, ty);
          }

          ctx.fillStyle = textLayer.color || "#ffffff";
          ctx.fillText(textLayer.text, tx, ty);
          ctx.restore();
        }

        // 4. Download Trigger
        let mimeType = "image/png";
        let ext = "png";
        if (format.toLowerCase() === "jpeg" || format.toLowerCase() === "jpg") {
          mimeType = "image/jpeg";
          ext = "jpg";
        } else if (format.toLowerCase() === "webp") {
          mimeType = "image/webp";
          ext = "webp";
        }

        const dataUrl = canvas.toDataURL(mimeType, quality / 100);
        const link = document.createElement("a");
        link.download = `${fileName}.${ext}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve({ success: true, fileName: `${fileName}.${ext}` });
      };

      renderLayers();
    } catch (err) {
      console.error("Canvas export failed:", err);
      resolve({ success: false, error: err });
    }
  });
}
