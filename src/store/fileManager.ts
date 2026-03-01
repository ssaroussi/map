/**
 * File manager for multi-map support.
 *
 * In Tauri: uses native file open/save dialogs + fs plugin.
 * In browser (dev): falls back to localStorage for a single unnamed map.
 */

const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const RECENT_FILES_KEY = 'map-recent-files';
const MAX_RECENT = 8;

// --- Recent files (stored in localStorage in both envs for simplicity) ---

export function getRecentFiles(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_FILES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function pushRecentFile(path: string): void {
  const recent = getRecentFiles().filter(p => p !== path);
  recent.unshift(path);
  localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

// --- Core file operations ---

export async function readFile(path: string): Promise<string> {
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  return readTextFile(path);
}

export async function writeFile(path: string, content: string): Promise<void> {
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');
  await writeTextFile(path, content);
  pushRecentFile(path);
}

/** Opens a native file picker and returns the chosen path, or null if cancelled. */
export async function showOpenDialog(): Promise<string | null> {
  if (!isTauri()) return null;
  const { open } = await import('@tauri-apps/plugin-dialog');
  const result = await open({
    title: 'Open Map',
    filters: [{ name: 'Map files', extensions: ['map', 'json'] }],
    multiple: false,
  });
  return typeof result === 'string' ? result : null;
}

/** Opens a native save dialog and returns the chosen path, or null if cancelled. */
export async function showSaveDialog(defaultName = 'untitled.map'): Promise<string | null> {
  if (!isTauri()) return null;
  const { save } = await import('@tauri-apps/plugin-dialog');
  const result = await save({
    title: 'Save Map',
    defaultPath: defaultName,
    filters: [{ name: 'Map files', extensions: ['map', 'json'] }],
  });
  return result ?? null;
}

/** Opens a native save dialog for PNG and returns the chosen path, or null if cancelled. */
export async function showSavePngDialog(defaultName = 'export.png'): Promise<string | null> {
  if (!isTauri()) return null;
  const { save } = await import('@tauri-apps/plugin-dialog');
  const result = await save({
    title: 'Export as PNG',
    defaultPath: defaultName,
    filters: [{ name: 'PNG Image', extensions: ['png'] }],
  });
  return result ?? null;
}

export async function writeBinaryFile(path: string, data: Uint8Array): Promise<void> {
  const { writeFile } = await import('@tauri-apps/plugin-fs');
  await writeFile(path, data);
}

export function getFileName(path: string): string {
  return path.split('/').pop()?.replace(/\.(map|json)$/, '') ?? path;
}
