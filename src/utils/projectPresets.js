// Real-life Design & Canvas Presets, Filter Matrices, and Procedural Canvas Generators

export const CANVAS_PRESETS = [
  {
    id: "yt-thumb",
    title: "YouTube Thumbnail",
    category: "YouTube",
    width: 1280,
    height: 720,
    aspect: "16:9",
    dimensions: "1280 × 720",
    badge: "16:9",
    desc: "Optimized for video covers and HD displays",
    bgColor: "#1e1b2e"
  },
  {
    id: "insta-post",
    title: "Instagram Square Post",
    category: "Social Media",
    width: 1080,
    height: 1080,
    aspect: "1:1",
    dimensions: "1080 × 1080",
    badge: "1:1",
    desc: "Standard square feed post",
    bgColor: "#241933"
  },
  {
    id: "insta-story",
    title: "Story / Reel / Shorts",
    category: "Social Media",
    width: 1080,
    height: 1920,
    aspect: "9:16",
    dimensions: "1080 × 1920",
    badge: "9:16",
    desc: "Vertical mobile full-screen format",
    bgColor: "#191629"
  },
  {
    id: "fb-cover",
    title: "Facebook Cover Banner",
    category: "Banners",
    width: 1640,
    height: 924,
    aspect: "16:9",
    dimensions: "1640 × 924",
    badge: "Cover",
    desc: "Standard page banner dimensions",
    bgColor: "#121b2d"
  },
  {
    id: "flyer-port",
    title: "Marketing Flyer / Poster",
    category: "Posters",
    width: 1080,
    height: 1350,
    aspect: "4:5",
    dimensions: "1080 × 1350",
    badge: "4:5",
    desc: "Portrait layout for social and digital flyers",
    bgColor: "#2d1624"
  },
  {
    id: "full-hd",
    title: "Full HD Canvas",
    category: "Photography",
    width: 1920,
    height: 1080,
    aspect: "16:9",
    dimensions: "1920 × 1080",
    badge: "1080p",
    desc: "Standard high-definition photo canvas",
    bgColor: "#14141d"
  },
  {
    id: "uhd-4k",
    title: "4K Ultra HD Canvas",
    category: "Photography",
    width: 3840,
    height: 2160,
    aspect: "16:9",
    dimensions: "3840 × 2160",
    badge: "4K UHD",
    desc: "Maximum resolution for print and fine art",
    bgColor: "#0f0e18"
  },
  {
    id: "biz-card",
    title: "Business Card",
    category: "Business",
    width: 1050,
    height: 600,
    aspect: "7:4",
    dimensions: "1050 × 600",
    badge: "Print",
    desc: "Standard 3.5\" x 2\" card format (300 DPI equivalent)",
    bgColor: "#19222c"
  }
];

export const POPULAR_TOOLS = [
  { id: "crop", name: "Crop", icon: "Crop", action: "crop" },
  { id: "resize", name: "Resize", icon: "Maximize", action: "resize" },
  { id: "filters", name: "Filters", icon: "Palette", action: "filters" },
  { id: "adjust", name: "Adjust", icon: "Sliders", action: "adjust" },
  { id: "text", name: "Text", icon: "Type", action: "text" },
  { id: "stickers", name: "Brush", icon: "Brush", action: "brush" },
  { id: "shapes", name: "Shapes", icon: "Square", action: "shapes" },
  { id: "ai", name: "AI Tools", icon: "Sparkles", action: "ai-tools" }
];

export const FILTERS_DATA = [
  { id: "none", name: "None", category: "All", css: "none" },
  { id: "vivid", name: "Vivid", category: "Portrait", css: "contrast(115%) saturate(140%) brightness(105%)" },
  { id: "warm", name: "Warm", category: "Portrait", css: "sepia(25%) saturate(120%) brightness(105%) hue-rotate(-5deg)" },
  { id: "cool", name: "Cool", category: "Landscape", css: "hue-rotate(15deg) saturate(110%) contrast(105%)" },
  { id: "cinematic", name: "Cinematic", category: "Landscape", css: "contrast(125%) saturate(85%) brightness(95%) sepia(10%)" },
  { id: "sunset", name: "Sunset", category: "Landscape", css: "sepia(35%) saturate(135%) brightness(105%) hue-rotate(-15deg)" },
  { id: "moody", name: "Moody", category: "Portrait", css: "contrast(130%) brightness(85%) saturate(90%)" },
  { id: "bw", name: "B&W", category: "B&W", css: "grayscale(100%) contrast(120%) brightness(100%)" },
  { id: "film", name: "Film", category: "Vintage", css: "sepia(20%) contrast(110%) brightness(102%) saturate(90%)" },
  { id: "retro", name: "Retro", category: "Vintage", css: "sepia(40%) saturate(115%) contrast(105%) hue-rotate(10deg)" },
  { id: "urban", name: "Urban", category: "Portrait", css: "contrast(120%) saturate(75%) brightness(100%)" },
  { id: "soft", name: "Soft", category: "Portrait", css: "contrast(90%) brightness(108%) saturate(110%) blur(0.3px)" }
];

export const INITIAL_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  saturation: 0,
  vibrance: 0,
  temperature: 0,
  tint: 0
};

/**
 * Generate a clean real blank canvas with chosen background
 */
export function createBlankCanvasDataUrl(width = 1920, height = 1080, background = 'white') {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(10, width);
  canvas.height = Math.max(10, height);
  const ctx = canvas.getContext('2d');

  if (background === 'transparent') {
    // Checkerboard pattern for transparent canvas preview
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if (background === 'dark') {
    ctx.fillStyle = '#12101c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (background.startsWith('#') || background.startsWith('rgb')) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Default crisp white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/png');
}

