import { useRef, useState } from 'react';
import { useMapStore, useTemporalStore } from '../../store/mapStore';
import { getFileName } from '../../store/fileManager';

export function Toolbar() {
  const setViewport = useMapStore(s => s.setViewport);
  const viewport = useMapStore(s => s.viewport);
  const fitToScreen = useMapStore(s => s.fitToScreen);
  const resetLayout = useMapStore(s => s.resetLayout);
  const recolorNodes = useMapStore(s => s.recolorNodes);
  const currentFilePath = useMapStore(s => s.currentFilePath);
  const isDirty = useMapStore(s => s.isDirty);
  const recentFiles = useMapStore(s => s.recentFiles);
  const newMap = useMapStore(s => s.newMap);
  const openMap = useMapStore(s => s.openMap);
  const openMapFromPath = useMapStore(s => s.openMapFromPath);
  const saveMap = useMapStore(s => s.saveMap);
  const saveMapAs = useMapStore(s => s.saveMapAs);

  const [showRecent, setShowRecent] = useState(false);

  const undo = () => (useTemporalStore.getState() as any).undo();
  const redo = () => (useTemporalStore.getState() as any).redo();

  const btn = (label: string, onClick: () => void, title?: string, accent?: boolean) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: accent ? 'var(--t-accent)' : 'var(--t-surface)',
        border: `1px solid ${accent ? 'var(--t-accent-border)' : 'var(--t-border)'}`,
        borderRadius: 7,
        color: accent ? 'var(--t-accent-text)' : 'var(--t-text)',
        fontSize: 12,
        padding: '5px 11px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = accent ? 'var(--t-accent-hover)' : 'var(--t-hover)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = accent ? 'var(--t-accent)' : 'var(--t-surface)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
    >
      {label}
    </button>
  );

  const divider = () => (
    <div style={{ width: 1, height: 20, background: 'var(--t-separator)', flexShrink: 0 }} />
  );

  const fileName = currentFilePath ? getFileName(currentFilePath) : 'Untitled';

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
        background: 'var(--t-toolbar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--t-border)',
        borderRadius: 12,
        padding: '8px 14px',
        zIndex: 50,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* File name */}
      <span style={{
        color: isDirty ? 'var(--t-text-muted)' : 'var(--t-text-dim)',
        fontSize: 12,
        maxWidth: 140,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {fileName}{isDirty ? ' ●' : ''}
      </span>

      {divider()}

      {btn('New', newMap, 'New map')}

      {/* Open with recent dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowRecent(v => !v)}
          onBlur={() => setTimeout(() => setShowRecent(false), 150)}
          style={{
            background: 'var(--t-surface)',
            border: '1px solid var(--t-border)',
            borderRadius: 7,
            color: 'var(--t-text)',
            fontSize: 12,
            padding: '5px 11px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Open ▾
        </button>
        {showRecent && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 6,
            background: 'var(--t-popup-bg)',
            border: '1px solid var(--t-border)',
            borderRadius: 10,
            padding: 6,
            minWidth: 220,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            zIndex: 200,
          }}>
            <button
              onClick={() => { openMap(); setShowRecent(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', color: 'var(--t-text)',
                fontSize: 13, padding: '7px 12px', cursor: 'pointer', borderRadius: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--t-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Browse…
            </button>
            {recentFiles.length > 0 && (
              <div style={{ height: 1, background: 'var(--t-separator)', margin: '4px 8px' }} />
            )}
            {recentFiles.map(path => (
              <button
                key={path}
                onClick={() => { openMapFromPath(path); setShowRecent(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', color: 'var(--t-text-muted)',
                  fontSize: 12, padding: '6px 12px', cursor: 'pointer', borderRadius: 6,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--t-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {getFileName(path)}
                <span style={{ color: 'var(--t-text-dim)', fontSize: 10, marginLeft: 6 }}>
                  {path.split('/').slice(-2, -1)[0]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {btn('Save', saveMap, currentFilePath ? `Save to ${fileName}` : 'Choose location to save')}
      {btn('Save As…', saveMapAs, 'Save to a new file')}

      {divider()}

      {btn('↩ Undo', undo, 'Ctrl+Z')}
      {btn('↪ Redo', redo, 'Ctrl+Y')}

      {divider()}

      {btn('−', () => setViewport({ scale: Math.max(0.2, viewport.scale - 0.1) }))}
      <span style={{ color: 'var(--t-text-muted)', fontSize: 12, minWidth: 40, textAlign: 'center' }}>
        {Math.round(viewport.scale * 100)}%
      </span>
      {btn('+', () => setViewport({ scale: Math.min(3, viewport.scale + 0.1) }))}
      {btn('Fit', () => fitToScreen(window.innerWidth, window.innerHeight), 'Fit to screen')}

      {divider()}

      {btn('✦ Magic', resetLayout, 'Re-layout all nodes evenly', true)}

    </div>
  );
}
