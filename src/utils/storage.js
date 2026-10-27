// Real-life Local Project Persistence & Storage Management

const STORAGE_KEY = 'bard_photo_editor_recent_projects';

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

export function saveRecentProject(project) {
  try {
    const existing = loadRecentProjects();
    // Filter out duplicate by name or id
    const filtered = existing.filter(p => p.id !== project.id && p.name !== project.name);
    const updated = [project, ...filtered].slice(0, 12); // Keep last 12
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // If quota exceeded, try keeping smaller list
      try {
        const smaller = [project, ...filtered].slice(0, 4);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(smaller));
      } catch {
        // If still exceeds quota, strip heavy image data from list
        try {
          const lightweight = [
            {
              id: project.id,
              name: project.name,
              time: project.time,
              size: project.size,
              timestamp: project.timestamp
            },
            ...filtered.slice(0, 3)
          ];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
        } catch {}
      }
    }
    return updated;
  } catch (err) {
    console.warn('Failed to save project to localStorage:', err);
    return loadRecentProjects();
  }
}

export function deleteRecentProject(projectId) {
  try {
    const existing = loadRecentProjects();
    const updated = existing.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete recent project:', err);
    return loadRecentProjects();
  }
}

export function clearAllRecentProjects() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.warn('Failed to clear recent projects:', err);
    return [];
  }
}

