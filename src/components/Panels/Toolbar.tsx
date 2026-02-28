import { useRef } from 'react';
import { useMapStore, useTemporalStore } from '../../store/mapStore';

export function Toolbar() {
  const setViewport = useMapStore(s => s.setViewport);
  const viewport = useMapStore(s => s.viewport);
  const exportJSON = useMapStore(s => s.exportJSON);
  const importJSON = useMapStore(s => s.importJSON);
  const fitToScreen = useMapStore(s => s.fitToScreen);
  const fileRef = useRef<HTMLInputElement>(null);

  const undo = () => (useTemporalStore.getState() as any).undo();
  const redo = () => (useTemporalStore.getState() as any).redo();

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importJSON(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const btn = (label: string, onClick: () => void, title?: string) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 7,
        color: '#e8e8f0',
        fontSize: 12,
        padding: '5px 11px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: 'rgba(15,15,25,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '8px 14px',
        zIndex: 50,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {btn('↩ Undo', undo, 'Ctrl+Z')}
      {btn('↪ Redo', redo, 'Ctrl+Y')}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
      {btn('− Zoom', () => {
        const s = Math.max(0.2, viewport.scale - 0.1);
        setViewport({ scale: s });
      })}
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, minWidth: 40, textAlign: 'center' }}>
        {Math.round(viewport.scale * 100)}%
      </span>
      {btn('+ Zoom', () => {
        const s = Math.min(3, viewport.scale + 0.1);
        setViewport({ scale: s });
      })}
      {btn('Fit', () => fitToScreen(window.innerWidth, window.innerHeight), 'Fit to screen')}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
      {btn('Export JSON', handleExport)}
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 7,
          color: '#e8e8f0',
          fontSize: 12,
          padding: '5px 11px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Import JSON
      </button>
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
    </div>
  );
}
