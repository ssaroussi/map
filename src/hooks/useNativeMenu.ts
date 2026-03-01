import { useEffect } from 'react';
import { useMapStore, useTemporalStore } from '../store/mapStore';
import { useThemeStore } from '../store/themeStore';
import { exportToPng } from '../utils/exportImage';
import { exportToMarkdown } from '../utils/exportMarkdown';
import { confirmIfUnsaved } from '../utils/confirmUnsaved';

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
          case 'new':       confirmIfUnsaved(() => store.newMap()); break;
          case 'open':      confirmIfUnsaved(() => store.openMap()); break;
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
          case 'export_md':
            exportToMarkdown();
            break;
          case 'theme_default':
          case 'theme_hacker': {
            const id = payload.replace('theme_', '') as 'default' | 'hacker';
            useThemeStore.getState().setTheme(id);
            setTimeout(() => store.recolorNodes(), 0);
            break;
          }
          case 'close_window':
            getCurrentWindow().close();
            break;
          case 'about':
            showAbout();
            break;
        }
      });

      // Close-requested: show DOM modal if unsaved, then exit via Rust command
      unlistenClose = await listen('close-requested', () => {
        confirmIfUnsaved(doClose);
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

async function doClose() {
  const { invoke } = await import('@tauri-apps/api/core');
  invoke('close_app');
}


function showAbout() {
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
      background: var(--t-popup-bg); border: 1px solid var(--t-border);
      border-radius: 14px; padding: 32px 40px; text-align: center;
      color: var(--t-text); font-family: system-ui, sans-serif; min-width: 280px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    ">
      <div style="font-size: 48px; margin-bottom: 12px;">🗺️</div>
      <h2 style="margin: 0 0 4px; font-size: 22px; font-weight: 700;">Map</h2>
      <p style="margin: 0 0 16px; color: var(--t-text-muted); font-size: 13px;">Version ${APP_VERSION}</p>
      <p style="margin: 0 0 24px; font-size: 14px; color: var(--t-text-muted);">
        Created by <strong style="color: var(--t-text);">${APP_AUTHOR}</strong>
      </p>
      <button id="about-close" style="
        background: var(--t-surface); border: 1px solid var(--t-border);
        color: var(--t-text); border-radius: 8px; padding: 8px 28px;
        font-size: 14px; cursor: pointer; font-family: system-ui, sans-serif;
      ">Close</button>
    </div>
  `;

  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#about-close')!.addEventListener('click', close);
}
