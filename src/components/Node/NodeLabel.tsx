interface Props {
  label: string;
  color: string;
}

export function NodeLabel({ label, color }: Props) {
  if (!label) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '10px',
      color: color,
      background: `${color}22`,
      border: `1px solid ${color}44`,
      borderRadius: '4px',
      padding: '1px 6px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {label}
    </div>
  );
}
