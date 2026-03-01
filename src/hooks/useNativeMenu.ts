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
          case 'close_window':
            // Trigger same flow as clicking ✕ — Rust will re-emit close-requested
            getCurrentWindow().close();
            break;
          case 'about':
            showAbout();
            break;
        }
      });

      // Close-requested: show DOM modal if unsaved, then exit via Rust command
      unlistenClose = await listen('close-requested', () => {
        const { isDirty, currentFilePath } = useMapStore.getState();
        const hasUnsavedWork = isDirty || !currentFilePath;

        if (hasUnsavedWork) {
          showSaveConfirmation();
        } else {
          doClose();
        }
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

function showSaveConfirmation() {
  if (document.getElementById('save-confirm-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'save-confirm-modal';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  `;

  overlay.innerHTML = `
    <div style="
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px; padding: 28px 32px; text-align: center;
      color: #e8e8f0; font-family: system-ui, sans-serif; min-width: 300px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    ">
      <h2 style="margin: 0 0 8px; font-size: 17px; font-weight: 600;">Unsaved Changes</h2>
      <p style="margin: 0 0 24px; font-size: 14px; color: rgba(255,255,255,0.6);">
        Do you want to save your changes before closing?
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="save-confirm-cancel" style="
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          color: #e8e8f0; border-radius: 8px; padding: 8px 20px;
          font-size: 14px; cursor: pointer;
        ">Cancel</button>
        <button id="save-confirm-discard" style="
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          color: #e8e8f0; border-radius: 8px; padding: 8px 20px;
          font-size: 14px; cursor: pointer;
        ">Don't Save</button>
        <button id="save-confirm-save" style="
          background: #7c5cfc; border: none;
          color: #fff; border-radius: 8px; padding: 8px 20px;
          font-size: 14px; cursor: pointer; font-weight: 600;
        ">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const dismiss = () => overlay.remove();

  overlay.querySelector('#save-confirm-cancel')!.addEventListener('click', dismiss);

  overlay.querySelector('#save-confirm-discard')!.addEventListener('click', () => {
    dismiss();
    doClose();
  });

  overlay.querySelector('#save-confirm-save')!.addEventListener('click', async () => {
    dismiss();
    await useMapStore.getState().saveMap();
    // If the file-picker was cancelled, isDirty is still true — abort close
    if (useMapStore.getState().isDirty) return;
    doClose();
  });
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
