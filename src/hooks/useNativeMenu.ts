import { useEffect } from 'react';
import { useMapStore, useTemporalStore } from '../store/mapStore';
import { exportToPng } from '../utils/exportImage';

const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export function useNativeMenu() {
  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | null = null;

    (async () => {
      const { listen } = await import('@tauri-apps/api/event');
      const { getCurrentWindow } = await import('@tauri-apps/api/window');

      unlisten = await listen<string>('menu-event', ({ payload }) => {
        const store = useMapStore.getState();
        const temporal = (useTemporalStore.getState() as any);

        switch (payload) {
          case 'new':      store.newMap(); break;
          case 'open':     store.openMap(); break;
          case 'save':     store.saveMap(); break;
          case 'save_as':  store.saveMapAs(); break;
          case 'undo':     temporal.undo(); break;
          case 'redo':     temporal.redo(); break;
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

    return () => { unlisten?.(); };
  }, []);
}
