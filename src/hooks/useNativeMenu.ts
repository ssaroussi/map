import { useEffect } from 'react';
import { useMapStore, useTemporalStore } from '../store/mapStore';
import { exportToPng } from '../utils/exportImage';

const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const APP_VERSION = '0.1.0';
const APP_AUTHOR = 'Amit Saroussi';

export function useNativeMenu() {
  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | null = null;
    let unlistenClose: (() => void) | null = null;

    (async () => {
      const { listen } = await import('@tauri-apps/api/event');
      const { getCurrentWindow } = await import('@tauri-apps/api/window');

      unlisten = await listen<string>('menu-event', ({ payload }) => {
        const store = useMapStore.getState();
        const temporal = (useTemporalStore.getState() as any);

        switch (payload) {
          case 'new':       store.newMap(); break;
          case 'open':      store.openMap(); break;
          case 'save':      store.saveMap(); break;
          case 'save_as':   store.saveMapAs(); break;
          case 'undo':      temporal.undo(); break;
          case 'redo':      temporal.redo(); break;
          case 'zoom_in':
            store.setViewport({ scale: Math.min(3, store.viewport.scale + 0.1) });
            break;
          case 'zoom_out':
            store.setViewport({ scale: Math.max(0.2, store.viewport.scale - 0.1) });
            break;
          case 'fit':
            store.fitToScreen(window.innerWidth, window.innerHeight);
            break;
          case 'magic':
            store.resetLayout();
            break;
          case 'export_png':
            exportToPng();
            break;
          case 'about':
            showAbout();
            break;
        }
      });

      // Close-requested: ask to save if dirty
      unlistenClose = await listen('close-requested', async () => {
        const { isDirty, saveMap } = useMapStore.getState();
        if (isDirty) {
          const { ask } = await import('@tauri-apps/plugin-dialog');
          const save = await ask('You have unsaved changes. Save before closing?', {
            title: 'Unsaved Changes',
            kind: 'warning',
            okLabel: 'Save',
            cancelLabel: 'Discard',
          });
          if (save) await saveMap();
        }
        getCurrentWindow().destroy();
      });

      // Keep window title in sync with current file + dirty state
      const syncTitle = () => {
        const { currentFilePath, isDirty } = useMapStore.getState();
        const name = currentFilePath
          ? currentFilePath.split('/').pop() ?? 'Untitled'
          : 'Untitled';
        getCurrentWindow().setTitle(`${name}${isDirty ? ' ●' : ''}`);
      };

      syncTitle();
      const unsub = useMapStore.subscribe(syncTitle);
      return () => unsub();
    })();

    return () => {
      unlisten?.();
      unlistenClose?.();
    };
  }, []);
}

function showAbout() {
  // Render a lightweight modal via DOM — avoids adding a React modal dependency
  if (document.getElementById('about-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'about-modal';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  `;

  overlay.innerHTML = `
    <div style="
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px; padding: 32px 40px; text-align: center;
      color: #e8e8f0; font-family: system-ui, sans-serif; min-width: 280px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    ">
      <div style="font-size: 48px; margin-bottom: 12px;">🗺️</div>
      <h2 style="margin: 0 0 4px; font-size: 22px; font-weight: 700;">Map</h2>
      <p style="margin: 0 0 16px; color: rgba(255,255,255,0.45); font-size: 13px;">Version ${APP_VERSION}</p>
      <p style="margin: 0 0 24px; font-size: 14px; color: rgba(255,255,255,0.7);">
        Created by <strong style="color:#e8e8f0;">${APP_AUTHOR}</strong>
      </p>
      <button id="about-close" style="
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
        color: #e8e8f0; border-radius: 8px; padding: 8px 28px;
        font-size: 14px; cursor: pointer;
      ">Close</button>
    </div>
  `;

  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#about-close')!.addEventListener('click', close);
}
