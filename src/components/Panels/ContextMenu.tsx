import { useMapStore } from '../../store/mapStore';

export function ContextMenu() {
  const menu = useMapStore(s => s.contextMenu);
  const setContextMenu = useMapStore(s => s.setContextMenu);
  const addChild = useMapStore(s => s.addChild);
  const addSibling = useMapStore(s => s.addSibling);
  const deleteNode = useMapStore(s => s.deleteNode);
  const setEditing = useMapStore(s => s.setEditing);
  const setLabelEditing = useMapStore(s => s.setLabelEditing);
  const setNotesPanel = useMapStore(s => s.setNotesPanel);
  const rootId = useMapStore(s => s.rootId);

  if (!menu) return null;

  const isRoot = menu.nodeId === rootId;

  const item = (label: string, action: () => void) => (
    <button
      key={label}
      onClick={() => { action(); setContextMenu(null); }}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: 'none', border: 'none',
        color: 'var(--t-text)',
        fontSize: 13, padding: '7px 14px', cursor: 'pointer', borderRadius: 6,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--t-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {label}
    </button>
  );

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setContextMenu(null)} />
      <div
        style={{
          position: 'fixed',
          left: menu.x, top: menu.y,
          zIndex: 200,
          background: 'var(--t-popup-bg)',
          border: '1px solid var(--t-border)',
          borderRadius: 10,
          padding: '6px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          minWidth: 180,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {item('Add Child (Tab)', () => addChild(menu.nodeId))}
        {!isRoot && item('Add Sibling (Enter)', () => addSibling(menu.nodeId))}
        {item('Edit Title (F2)', () => setEditing(menu.nodeId))}
        {item('Edit Label (F3)', () => setLabelEditing(menu.nodeId))}
        {item('Notes (F4)', () => setNotesPanel(menu.nodeId))}
        {!isRoot && (
          <>
            <div style={{ height: 1, background: 'var(--t-separator)', margin: '4px 8px' }} />
            {item('Delete', () => deleteNode(menu.nodeId))}
          </>
        )}
      </div>
    </>
  );
}
