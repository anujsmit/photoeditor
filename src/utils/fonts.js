/**
 * BARD Photo Editor - Font Registry & Manager
 * Includes Top 10 Google Fonts (Online) and Complete Desktop / System Fonts.
 * Supports window.queryLocalFonts() for dynamic desktop font discovery.
 */

export const TOP_GOOGLE_FONTS = [
  { name: 'Roboto', category: 'Sans-Serif', style: 'Modern & Clean', weight: '400, 500, 700' },
  { name: 'Open Sans', category: 'Sans-Serif', style: 'Neutral & Friendly', weight: '400, 600, 700' },
  { name: 'Montserrat', category: 'Sans-Serif', style: 'Geometric & Bold', weight: '400, 600, 800' },
  { name: 'Poppins', category: 'Sans-Serif', style: 'Geometric & Playful', weight: '400, 600, 800' },
  { name: 'Lato', category: 'Sans-Serif', style: 'Warm & Professional', weight: '400, 700' },
  { name: 'Inter', category: 'Sans-Serif', style: 'Modern UI Standard', weight: '400, 600, 700' },
  { name: 'Oswald', category: 'Display', style: 'Bold Condensed Headline', weight: '400, 600, 700' },
  { name: 'Raleway', category: 'Sans-Serif', style: 'Elegant & Refined', weight: '400, 600, 700' },
  { name: 'Playfair Display', category: 'Serif', style: 'High-Fashion Editorial', weight: '400, 700' },
  { name: 'Merriweather', category: 'Serif', style: 'High-Legibility Editorial', weight: '400, 700' },
  { name: 'Bebas Neue', category: 'Display', style: 'Poster & Title Heavy', weight: '400' },
  { name: 'Pacifico', category: 'Handwriting', style: 'Casual Brush Script', weight: '400' },
  { name: 'Dancing Script', category: 'Handwriting', style: 'Flowing Cursive', weight: '500, 700' },
  { name: 'Lora', category: 'Serif', style: 'Contemporary Literary', weight: '400, 700' }
];

export const DESKTOP_SYSTEM_FONTS = [
  { name: 'Arial', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Arial Black', category: 'Display', fallback: 'sans-serif' },
  { name: 'Calibri', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Cambria', category: 'Serif', fallback: 'serif' },
  { name: 'Candara', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Comic Sans MS', category: 'Casual', fallback: 'cursive' },
  { name: 'Consolas', category: 'Monospace', fallback: 'monospace' },
  { name: 'Courier New', category: 'Monospace', fallback: 'monospace' },
  { name: 'Franklin Gothic Medium', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Georgia', category: 'Serif', fallback: 'serif' },
  { name: 'Impact', category: 'Display', fallback: 'sans-serif' },
  { name: 'Lucida Console', category: 'Monospace', fallback: 'monospace' },
  { name: 'Lucida Sans Unicode', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Microsoft Sans Serif', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Palatino Linotype', category: 'Serif', fallback: 'serif' },
  { name: 'Segoe UI', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Tahoma', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Times New Roman', category: 'Serif', fallback: 'serif' },
  { name: 'Trebuchet MS', category: 'Sans-Serif', fallback: 'sans-serif' },
  { name: 'Verdana', category: 'Sans-Serif', fallback: 'sans-serif' }
];

// Cache of loaded Google Fonts to prevent duplicate <link> elements
const loadedGoogleFonts = new Set(['Poppins', 'Inter']);

/**
 * Dynamically ensure a Google Font stylesheet is injected into the head
 */
export function ensureGoogleFont(fontFamily) {
  if (!fontFamily || loadedGoogleFonts.has(fontFamily)) return;

  const match = TOP_GOOGLE_FONTS.find(
    (f) => f.name.toLowerCase() === fontFamily.toLowerCase()
  );
  if (!match) return;

  const fontNameUrl = match.name.replace(/ /g, '+');
  const linkId = `gfont-${match.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontNameUrl}:wght@400;600;700;800&display=swap`;
    document.head.appendChild(link);
    loadedGoogleFonts.add(match.name);
  }
}

/**
 * Query actual desktop system fonts via the Local Font Access API if supported
 */
export async function queryDesktopFonts() {
  if (typeof window !== 'undefined' && 'queryLocalFonts' in window) {
    try {
      // User may be prompted to allow local font access
      const localFonts = await window.queryLocalFonts();
      const uniqueFamilies = new Map();

      localFonts.forEach((f) => {
        if (!uniqueFamilies.has(f.family)) {
          uniqueFamilies.set(f.family, {
            name: f.family,
            category: 'Desktop Installed',
            isLocal: true
          });
        }
      });

      // Merge with default system fonts
      DESKTOP_SYSTEM_FONTS.forEach((f) => {
        if (!uniqueFamilies.has(f.name)) {
          uniqueFamilies.set(f.name, f);
        }
      });

      return Array.from(uniqueFamilies.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    } catch {
      // Fallback silently if user dismisses or blocks permission
      return [...DESKTOP_SYSTEM_FONTS];
    }
  }

  return [...DESKTOP_SYSTEM_FONTS];
}

