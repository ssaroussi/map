interface Props {
  description: string;
  color: string;
  width: number;
  height: number;
  hovered: boolean;
}

const MAX_PREVIEW = 220;

export function NotesIndicator({ description, color, width, height, hovered }: Props) {
  if (!description?.trim()) return null;

  const preview = description.length > MAX_PREVIEW
    ? description.slice(0, MAX_PREVIEW).trimEnd() + '…'
    : description;

  return (
    <>
      {/* Soft diagonal color wash — signals "this node has notes" */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        borderRadius: 'inherit',
        background: `linear-gradient(135deg, ${color}60 0%, ${color}18 50%, transparent 75%)`,
        pointerEvents: 'none',
      }} />

      {/* Notes popover on node hover */}
      {hovered && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 230,
          background: 'var(--t-popup-bg)',
          border: `1px solid ${color}55`,
          borderRadius: 10,
          padding: '10px 12px',
          boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px ${color}22`,
          pointerEvents: 'none',
          zIndex: 999,
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Notes
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--t-text)',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {preview}
          </div>
        </div>
      )}
    </>
  );
}
