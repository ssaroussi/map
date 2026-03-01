import { useRef, useEffect } from 'react';
import { BackgroundGrid } from './BackgroundGrid';
import { ViewportLayer } from './ViewportLayer';
import { ConnectionLayer } from '../Connections/ConnectionLayer';
import { NodeTree } from '../Node/NodeTree';
import { ContextMenu } from '../Panels/ContextMenu';
import { useMapStore } from '../../store/mapStore';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { useKeyboard } from '../../hooks/useKeyboard';
import { setCanvasElement } from '../../utils/exportImage';

export function Canvas() {
  const ref = useRef<HTMLDivElement>(null);
  const rootId = useMapStore(s => s.rootId);
  const viewport = useMapStore(s => s.viewport);
  const setViewport = useMapStore(s => s.setViewport);
  const fitToScreen = useMapStore(s => s.fitToScreen);
  const { onMouseDown, onMouseMove, onMouseUp, onWheel, onCanvasClick } = useCanvasGestures();

  useKeyboard();

  // Center viewport on load if default
  useEffect(() => {
    if (ref.current) {
      setCanvasElement(ref.current);
      const { width, height } = ref.current.getBoundingClientRect();
      // Center at (0,0) in canvas coords
      if (viewport.x === 0 && viewport.y === 0) {
        setViewport({ x: width / 2, y: height / 2 });
      }
    }
  }, []);

  return (
    <div
      ref={ref}
      className="canvas-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0a0a0f',
        cursor: 'default',
        userSelect: 'none',
        outline: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onClick={onCanvasClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <BackgroundGrid />
      <ViewportLayer>
        <ConnectionLayer />
        <NodeTree nodeId={rootId} isRoot />
      </ViewportLayer>
      <ContextMenu />
    </div>
  );
}
