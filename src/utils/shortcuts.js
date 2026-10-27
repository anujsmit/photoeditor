/**
 * Keyboard Shortcuts Manager & Configuration
 * Provides customizable shortcut key mappings with localStorage persistence.
 */

const SHORTCUTS_STORAGE_KEY = 'bard_keyboard_shortcuts_v1';

export const DEFAULT_SHORTCUTS = {
  deleteText: {
    id: 'deleteText',
    name: 'Delete Text / Active Layer',
    category: 'Editing',
    key: 't',
    ctrl: true,
    shift: false,
    alt: false,
    display: 'Ctrl + T',
    description: 'Delete selected text layer or active layer from the canvas'
  },
  deleteLayer: {
    id: 'deleteLayer',
    name: 'Delete Layer',
    category: 'Layers',
    key: 'delete',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'Delete / Backspace',
    description: 'Delete currently selected layer'
  },
  saveProject: {
    id: 'saveProject',
    name: 'Save Project Changes',
    category: 'File',
    key: 's',
    ctrl: true,
    shift: false,
    alt: false,
    display: 'Ctrl + S',
    description: 'Save all canvas layers and changes'
  },
  exportImage: {
    id: 'exportImage',
    name: 'Export Image',
    category: 'File',
    key: 'e',
    ctrl: true,
    shift: false,
    alt: false,
    display: 'Ctrl + E',
    description: 'Open the Export Rendering dialog'
  },
  undo: {
    id: 'undo',
    name: 'Undo',
    category: 'Editing',
    key: 'z',
    ctrl: true,
    shift: false,
    alt: false,
    display: 'Ctrl + Z',
    description: 'Undo previous canvas action'
  },
  redo: {
    id: 'redo',
    name: 'Redo',
    category: 'Editing',
    key: 'y',
    ctrl: true,
    shift: false,
    alt: false,
    display: 'Ctrl + Y',
    description: 'Redo previously undone action'
  },
  moveTool: {
    id: 'moveTool',
    name: 'Move Tool',
    category: 'Tools',
    key: 'v',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'V',
    description: 'Switch to layer selection and move tool'
  },
  cropTool: {
    id: 'cropTool',
    name: 'Crop Tool',
    category: 'Tools',
    key: 'c',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'C',
    description: 'Switch to crop tool and open crop options'
  },
  textTool: {
    id: 'textTool',
    name: 'Text Tool',
    category: 'Tools',
    key: 't',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'T',
    description: 'Switch to text tool and open text options'
  },
  brushTool: {
    id: 'brushTool',
    name: 'Brush Tool',
    category: 'Tools',
    key: 'b',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'B',
    description: 'Switch to brush drawing tool'
  },
  eraserTool: {
    id: 'eraserTool',
    name: 'Eraser Tool',
    category: 'Tools',
    key: 'e',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'E',
    description: 'Switch to eraser tool'
  },
  shapesTool: {
    id: 'shapesTool',
    name: 'Rectangle & Shapes Tool',
    category: 'Tools',
    key: 'u',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'U',
    description: 'Switch to rectangle and shapes tool'
  },
  eyedropperTool: {
    id: 'eyedropperTool',
    name: 'Eyedropper Tool',
    category: 'Tools',
    key: 'i',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'I',
    description: 'Sample color from canvas'
  },
  bucketTool: {
    id: 'bucketTool',
    name: 'Paint Bucket Tool',
    category: 'Tools',
    key: 'g',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'G',
    description: 'Fill active layer or background with foreground color'
  },
  lassoTool: {
    id: 'lassoTool',
    name: 'Lasso Selection Tool',
    category: 'Tools',
    key: 'l',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'L',
    description: 'Freehand selection tool'
  },
  stampTool: {
    id: 'stampTool',
    name: 'Clone Stamp Tool',
    category: 'Tools',
    key: 's',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'S',
    description: 'Clone stamp retouching tool'
  },
  handTool: {
    id: 'handTool',
    name: 'Hand / Pan Tool',
    category: 'Tools',
    key: 'h',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'H',
    description: 'Pan workspace with mouse'
  },
  zoomTool: {
    id: 'zoomTool',
    name: 'Zoom Tool',
    category: 'Tools',
    key: 'z',
    ctrl: false,
    shift: false,
    alt: false,
    display: 'Z',
    description: 'Switch to zoom tool'
  },
  toggleClip: {
    id: 'toggleClip',
    name: 'Toggle Canvas Overflow Clipping',
    category: 'View',
    key: '\\',
    ctrl: true,
    shift: false,
    alt: false,
    display: 'Ctrl + \\',
    description: 'Toggle hiding content that overflows canvas artboard'
  }
};

/**
 * Format a shortcut definition into human-readable string (e.g., "Ctrl + Shift + T")
 */
export function formatShortcutDisplay(shortcut) {
  if (!shortcut) return '';
  const parts = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');

  let keyDisplay = shortcut.key;
  if (shortcut.key === ' ') keyDisplay = 'Space';
  else if (shortcut.key === 'delete') keyDisplay = 'Delete';
  else if (shortcut.key === 'backspace') keyDisplay = 'Backspace';
  else if (shortcut.key === 'escape') keyDisplay = 'Esc';
  else if (shortcut.key) keyDisplay = shortcut.key.toUpperCase();

  parts.push(keyDisplay);
  return parts.join(' + ');
}

/**
 * Load user shortcuts from localStorage, merging with defaults
 */
export function loadUserShortcuts() {
  try {
    const raw = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SHORTCUTS };
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_SHORTCUTS };
    Object.keys(DEFAULT_SHORTCUTS).forEach((id) => {
      if (parsed[id]) {
        merged[id] = {
          ...DEFAULT_SHORTCUTS[id],
          ...parsed[id],
          display: formatShortcutDisplay(parsed[id])
        };
      }
    });
    return merged;
  } catch {
    return { ...DEFAULT_SHORTCUTS };
  }
}

/**
 * Save user shortcuts to localStorage
 */
export function saveUserShortcuts(shortcuts) {
  try {
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (err) {
    console.error('Failed to save shortcuts:', err);
  }
}

/**
 * Match a KeyboardEvent against a shortcut definition
 */
export function matchesShortcut(e, shortcut) {
  if (!e || !shortcut) return false;

  const wantCtrl = !!shortcut.ctrl;
  const wantAlt = !!shortcut.alt;
  const wantShift = !!shortcut.shift;

  const hasCtrl = !!(e.ctrlKey || e.metaKey);
  const hasAlt = !!e.altKey;
  const hasShift = !!e.shiftKey;

  if (wantCtrl !== hasCtrl) return false;
  if (wantAlt !== hasAlt) return false;
  if (wantShift !== hasShift) return false;

  const eventKey = e.key.toLowerCase();
  const shortcutKey = (shortcut.key || '').toLowerCase();

  // Allow Delete or Backspace for deleteLayer
  if (shortcut.id === 'deleteLayer') {
    return eventKey === 'delete' || eventKey === 'backspace';
  }

  return eventKey === shortcutKey;
}

