import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '../../store/mapStore';

export function NotesPanel() {
  const nodeId = useMapStore(s => s.notesPanelNodeId);
  const nodes = useMapStore(s => s.nodes);
  const updateDescription = useMapStore(s => s.updateDescription);
  const setNotesPanel = useMapStore(s => s.setNotesPanel);

  const node = nodeId ? nodes[nodeId] : null;

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 340 }}
          animate={{ x: 0 }}
          exit={{ x: 340 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: 320,
            background: 'rgba(15,15,25,0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: '#e8e8f0', fontWeight: 600, fontSize: 15 }}>Notes</span>
            <button
              onClick={() => setNotesPanel(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}
            >×</button>
          </div>
          <div style={{ color: node.color, fontSize: 13, marginBottom: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.title || 'Untitled'}
          </div>
          <textarea
            value={node.description}
            onChange={(e) => updateDescription(nodeId!, e.target.value)}
            placeholder="Add notes..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: '#e8e8f0',
              fontSize: 13,
              padding: 12,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
