import { toPng } from 'html-to-image';
import { useMapStore } from '../store/mapStore';
import { showSavePngDialog, writeBinaryFile } from '../store/fileManager';

let canvasEl: HTMLElement | null = null;

export function setCanvasElement(el: HTMLElement) {
  canvasEl = el;
}

export async function exportToPng(): Promise<void> {
  if (!canvasEl) {
    console.error('Canvas element not registered');
    return;
  }

  // Fit the whole graph into view before capturing
  useMapStore.getState().fitToScreen(window.innerWidth, window.innerHeight);
  // Wait one frame for the viewport transition to settle
  await new Promise(r => setTimeout(r, 300));

  // html-to-image uses SVG foreignObject which WebKit clips box-shadow blurs
  // at element boundaries, making glows look bad. Replace them with a clean
  // drop-shadow filter on the cloned DOM so shadows render correctly.
  const style = document.createElement('style');
  style.id = 'export-shadow-fix';
  style.textContent = `
    [data-node="true"] {
      box-shadow: none !important;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.55)) !important;
    }
  `;
  document.head.appendChild(style);

  try {
    const dataUrl = await toPng(canvasEl, { pixelRatio: 2, cacheBust: true });

    // Decode base64 to bytes
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const path = await showSavePngDialog('export.png');
    if (!path) return;

    await writeBinaryFile(path, bytes);
  } finally {
    document.head.removeChild(style);
  }
}
