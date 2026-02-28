import { useRef, useEffect } from 'react';
import { useMapStore } from '../../store/mapStore';

export function LabelEditor() {
  const labelEditingId = useMapStore(s => s.labelEditingId);
  const nodes = useMapStore(s => s.nodes);
  const updateLabel = useMapStore(s => s.updateLabel);
  const setLabelEditing = useMapStore(s => s.setLabelEditing);
  const viewport = useMapStore(s => s.viewport);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (labelEditingId && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [labelEditingId]);

  if (!labelEditingId) return null;
  const node = nodes[labelEditingId];
  if (!node) return null;

  const screenX = node.x * viewport.scale + viewport.x;
  const screenY = node.y * viewport.scale + viewport.y;

  return (
    <div
      style={{
        position: 'fixed',
        left: screenX - 90,
        top: screenY + 30,
        zIndex: 200,
        background: 'rgba(15,15,25,0.95)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 8,
        padding: '8px 12px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4 }}>Label</div>
      <input
        ref={ref}
        value={node.label}
        onChange={(e) => updateLabel(labelEditingId, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            setLabelEditing(null);
          }
        }}
        onBlur={() => setLabelEditing(null)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#e8e8f0',
          fontSize: 13,
          outline: 'none',
          width: 160,
          fontFamily: 'inherit',
        }}
        placeholder="Add label..."
      />
    </div>
  );
}
