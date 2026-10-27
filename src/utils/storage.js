// Real-life Local Project Persistence & High-Capacity Storage Management
// Utilizes native browser/Electron IndexedDB for unlimited project & image layer storage
// Combined with lightweight LocalStorage thumbnails for instant home screen loading

const DB_NAME = 'bard_photo_editor_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SESSION = 'session';
const STORAGE_KEY = 'bard_photo_editor_recent_projects';

/**
 * Open or upgrade native IndexedDB instance
 */
export function openStorageDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SESSION)) {
        db.createObjectStore(STORE_SESSION, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Generate a compressed, lightweight thumbnail dataUrl (< 25KB)
 * for fast instant rendering in the Recent Projects grid
 */
export async function createThumbnailDataUrl(src, maxDim = 240) {
  if (!src) return '';
  // If it's already a tiny string (e.g. svg or color), return as is
  if (typeof src === 'string' && src.length < 500) return src;

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = img.naturalWidth || img.width || maxDim;
          let h = img.naturalHeight || img.height || maxDim;

          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.65));
          } else {
            resolve('');
          }
        } catch {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = src;
    } catch {
      resolve('');
    }
  });
}

/**
 * Synchronous read of lightweight project previews from LocalStorage
 * for instant, zero-flicker UI render on app startup
 */
export function loadRecentProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(p => p && typeof p === 'object' && p.id && typeof p.name === 'string');
  } catch (err) {
    console.warn('Failed to load recent projects from localStorage:', err);
    return [];
  }
}

/**
 * Save project to native IndexedDB with full-resolution layers, images, shapes & text.
 * Also saves a tiny preview card to LocalStorage for instant UI listings.
 */
export async function saveProjectToDB(project) {
  if (!project || !project.id) return loadRecentProjects();

  const timestamp = project.timestamp || Date.now();
  const time = project.time || 'Just now';

  // 1. Persist the FULL project with ALL uploaded images and layers in IndexedDB
  try {
    const db = await openStorageDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_SESSION], 'readwrite');
      const projStore = tx.objectStore(STORE_PROJECTS);
      const sessionStore = tx.objectStore(STORE_SESSION);

      projStore.put({
        ...project,
        timestamp,
        time
      });

      sessionStore.put({
        key: 'last_active_project',
        projectId: project.id,
        name: project.name,
        timestamp
      });

      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
      tx.onabort = (e) => reject(e.target.error);
    });
  } catch (dbErr) {
    console.warn('Failed to save full project to IndexedDB:', dbErr);
  }

  // 2. Determine best image source for thumbnail
  let bestThumbSource = project.url;
  if (!bestThumbSource && Array.isArray(project.layers)) {
    const firstImg = project.layers.find(l => l.type === 'image' && l.src);
    if (firstImg) bestThumbSource = firstImg.src;
  }

  let compressedThumb = '';
  if (bestThumbSource) {
    try {
      compressedThumb = await createThumbnailDataUrl(bestThumbSource, 240);
    } catch {
      compressedThumb = '';
    }
  }

  // 3. Build a lightweight metadata record for LocalStorage (< 15KB)
  const existing = loadRecentProjects();
  const filtered = existing.filter(p => p.id !== project.id && p.name !== project.name);

  const previewItem = {
    id: project.id,
    name: project.name,
    time,
    size: project.size || `${project.docDimensions?.width || 1920} × ${project.docDimensions?.height || 1080}`,
    url: compressedThumb || '',
    type: project.type || 'image/png',
    docDimensions: project.docDimensions,
    canvasBgColor: project.canvasBgColor,
    layersCount: project.layers ? project.layers.length : 1,
    hasImages: project.layers ? project.layers.some(l => l.type === 'image') : false,
    timestamp
  };

  const updatedRecents = [previewItem, ...filtered].slice(0, 16);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecents));
  } catch {
    // If quota exceeded, store without thumbnails
    try {
      const stripped = updatedRecents.map(item => ({
        ...item,
        url: ''
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch {
      // Ignore if localStorage completely full
    }
  }

  return updatedRecents;
}

/**
 * Retrieve the full project with all layers and full-resolution images from IndexedDB
 */
export async function getProjectFromDB(projectId) {
  if (!projectId) return null;

  try {
    const db = await openStorageDB();
    const project = await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS], 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.get(projectId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });

    if (project) return project;
  } catch (err) {
    console.warn('Could not read project from IndexedDB:', err);
  }

  // Fallback to localStorage preview
  const recents = loadRecentProjects();
  return recents.find(p => p.id === projectId) || null;
}

/**
 * Retrieve all full projects from IndexedDB sorted by newest first
 */
export async function getAllProjectsFromDB() {
  try {
    const db = await openStorageDB();
    const projects = await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS], 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });

    if (Array.isArray(projects) && projects.length > 0) {
      return projects.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
  } catch (err) {
    console.warn('Could not query all projects from IndexedDB:', err);
  }

  return loadRecentProjects();
}

/**
 * Delete project from both IndexedDB and LocalStorage
 */
export async function deleteProjectFromDB(projectId) {
  try {
    const db = await openStorageDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS], 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      store.delete(projectId);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Failed to delete project from IndexedDB:', err);
  }

  const existing = loadRecentProjects();
  const updated = existing.filter(p => p.id !== projectId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

/**
 * Clear all projects from both IndexedDB and LocalStorage
 */
export async function clearAllProjectsFromDB() {
  try {
    const db = await openStorageDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_SESSION], 'readwrite');
      tx.objectStore(STORE_PROJECTS).clear();
      tx.objectStore(STORE_SESSION).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Failed to clear IndexedDB:', err);
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return [];
}

/**
 * Backward-compatible synchronous wrapper
 */
export function saveRecentProject(project) {
  // Trigger async IndexedDB save in background
  saveProjectToDB(project).catch(err => {
    console.warn('Async background save error:', err);
  });

  // Maintain synchronous LocalStorage state for instant return
  const existing = loadRecentProjects();
  const filtered = existing.filter(p => p.id !== project.id && p.name !== project.name);
  const previewItem = {
    id: project.id,
    name: project.name,
    time: project.time || 'Just now',
    size: project.size || `${project.docDimensions?.width || 1920} × ${project.docDimensions?.height || 1080}`,
    url: typeof project.url === 'string' && project.url.length < 50000 ? project.url : '',
    timestamp: project.timestamp || Date.now()
  };
  const updated = [previewItem, ...filtered].slice(0, 16);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

/**
 * Backward-compatible synchronous wrapper for delete
 */
export function deleteRecentProject(projectId) {
  deleteProjectFromDB(projectId).catch(() => {});
  const existing = loadRecentProjects();
  const updated = existing.filter(p => p.id !== projectId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

/**
 * Backward-compatible synchronous wrapper for clear
 */
export function clearAllRecentProjects() {
  clearAllProjectsFromDB().catch(() => {});
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return [];
}
