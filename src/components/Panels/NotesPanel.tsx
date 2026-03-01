import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '../../store/mapStore';

export function NotesPanel() {
  const nodeId = useMapStore(s => s.notesPanelNodeId);
  const nodes = useMapStore(s => s.nodes);
  const updateDescription = useMapStore(s => s.updateDescription);
  const setNotesPanel = useMapStore(s => s.setNotesPanel);

  const node = nodeId ? nodes[nodeId] : null;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea whenever the panel opens for a node
  useEffect(() => {
    if (nodeId) {
      // Wait one frame for the slide-in animation to start, then focus
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [nodeId]);

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
            right: 0, top: 0, bottom: 0,
            width: 320,
            background: 'var(--t-panel-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderLeft: '1px solid var(--t-border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <span style={{ color: 'var(--t-text)', fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
              {node.title || 'Untitled'}
            </span>
            <button
              onClick={() => setNotesPanel(null)}
              style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}
            >×</button>
          </div>
          <div style={{ color: node.color, fontSize: 11, marginBottom: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Notes
          </div>
          <textarea
            ref={textareaRef}
            value={node.description}
            onChange={(e) => updateDescription(nodeId!, e.target.value)}
            placeholder="Add notes..."
            style={{
              flex: 1,
              background: 'var(--t-surface)',
              border: '1px solid var(--t-border)',
              borderRadius: 8,
              color: 'var(--t-text)',
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
