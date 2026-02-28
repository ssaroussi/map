import { useRef, useCallback } from 'react';
import { useMapStore } from '../store/mapStore';

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;

export function useCanvasGestures() {
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const setViewport = useMapStore(s => s.setViewport);
  const viewport = useMapStore(s => s.viewport);
  const setSelected = useMapStore(s => s.setSelected);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Only pan on canvas background (not nodes)
    if (target.closest('[data-node]')) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setViewport({ x: useMapStore.getState().viewport.x + dx, y: useMapStore.getState().viewport.y + dy });
  }, [setViewport]);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const { scale, x, y } = useMapStore.getState().viewport;
    if (e.ctrlKey || e.metaKey) {
      // Pinch-to-zoom or Ctrl+scroll → zoom
      const delta = -e.deltaY * 0.005;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (1 + delta)));
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const newX = cx - (cx - x) * (newScale / scale);
      const newY = cy - (cy - y) * (newScale / scale);
      setViewport({ scale: newScale, x: newX, y: newY });
    } else if (e.shiftKey) {
      // Shift + scroll → zoom centered on cursor
      const delta = -e.deltaY * 0.005;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (1 + delta)));
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const newX = cx - (cx - x) * (newScale / scale);
      const newY = cy - (cy - y) * (newScale / scale);
      setViewport({ scale: newScale, x: newX, y: newY });
    } else {
      // Two-finger trackpad swipe → pan
      setViewport({ x: x - e.deltaX, y: y - e.deltaY });
    }
  }, [setViewport]);

  const onCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-node]')) {
      setSelected(null);
      useMapStore.getState().setContextMenu(null);
    }
  }, [setSelected]);

  return { onMouseDown, onMouseMove, onMouseUp, onWheel, onCanvasClick };
}
