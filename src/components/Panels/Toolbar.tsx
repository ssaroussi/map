import { useRef, useState } from 'react';
import { useMapStore, useTemporalStore } from '../../store/mapStore';
import { getFileName } from '../../store/fileManager';

export function Toolbar() {
  const setViewport = useMapStore(s => s.setViewport);
  const viewport = useMapStore(s => s.viewport);
  const fitToScreen = useMapStore(s => s.fitToScreen);
  const resetLayout = useMapStore(s => s.resetLayout);
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
        background: accent
          ? 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(0,180,216,0.25))'
          : 'rgba(255,255,255,0.06)',
        border: `1px solid ${accent ? 'rgba(124,92,252,0.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 7,
        color: accent ? '#c4b0ff' : '#e8e8f0',
        fontSize: 12,
        padding: '5px 11px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = accent
          ? 'linear-gradient(135deg, rgba(124,92,252,0.45), rgba(0,180,216,0.45))'
          : 'rgba(255,255,255,0.12)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = accent
          ? 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(0,180,216,0.25))'
          : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
    >
      {label}
    </button>
  );

  const divider = () => (
    <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
  );

  const fileName = currentFilePath
    ? getFileName(currentFilePath)
    : 'Untitled';

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
      {/* File name */}
      <span style={{
        color: isDirty ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
        fontSize: 12,
        maxWidth: 140,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {fileName}{isDirty ? ' ●' : ''}
      </span>

      {divider()}

      {/* File operations */}
      {btn('New', newMap, 'New map')}

      {/* Open with recent dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowRecent(v => !v)}
          onBlur={() => setTimeout(() => setShowRecent(false), 150)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 7,
            color: '#e8e8f0',
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
            background: 'rgba(18,18,28,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
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
                background: 'none', border: 'none', color: '#e8e8f0',
                fontSize: 13, padding: '7px 12px', cursor: 'pointer', borderRadius: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Browse…
            </button>
            {recentFiles.length > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 8px' }} />
            )}
            {recentFiles.map(path => (
              <button
                key={path}
                onClick={() => { openMapFromPath(path); setShowRecent(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                  fontSize: 12, padding: '6px 12px', cursor: 'pointer', borderRadius: 6,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {getFileName(path)}
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginLeft: 6 }}>
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

      {/* Undo / Redo */}
      {btn('↩ Undo', undo, 'Ctrl+Z')}
      {btn('↪ Redo', redo, 'Ctrl+Y')}

      {divider()}

      {/* Zoom */}
      {btn('−', () => setViewport({ scale: Math.max(0.2, viewport.scale - 0.1) }))}
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, minWidth: 40, textAlign: 'center' }}>
        {Math.round(viewport.scale * 100)}%
      </span>
      {btn('+', () => setViewport({ scale: Math.min(3, viewport.scale + 0.1) }))}
      {btn('Fit', () => fitToScreen(window.innerWidth, window.innerHeight), 'Fit to screen')}

      {divider()}

      {btn('✦ Magic', resetLayout, 'Re-layout all nodes evenly', true)}
    </div>
  );
}
