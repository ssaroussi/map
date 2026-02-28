import { useMapStore } from '../../store/mapStore';

interface Props {
  children: React.ReactNode;
}

export function ViewportLayer({ children }: Props) {
  const { x, y, scale } = useMapStore(s => s.viewport);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0, top: 0,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: '0 0',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
