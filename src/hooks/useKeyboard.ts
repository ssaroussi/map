import { useEffect } from 'react';
import { useMapStore, useTemporalStore } from '../store/mapStore';
import { getSiblings } from '../algorithms/treeUtils';

export function useKeyboard() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useMapStore.getState();
      const { selectedId, editingId, labelEditingId, nodes, rootId } = store;

      // Always allow typing in inputs/textareas
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';

      if (editingId) {
        if (e.key === 'Escape') {
          e.preventDefault();
          // Revert empty title
          const node = nodes[editingId];
          if (node && !node.title.trim() && editingId !== rootId) {
            store.deleteNode(editingId);
          }
          store.setEditing(null);
        }
        return;
      }

      if (labelEditingId) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          store.setLabelEditing(null);
        }
        return;
      }

      if (isInput) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          (useTemporalStore.getState() as any).undo();
          return;
        }
        if (e.key === 'y') {
          e.preventDefault();
          (useTemporalStore.getState() as any).redo();
          return;
        }
      }

      if (!selectedId) {
        if (e.key === 'Enter' || e.key === ' ') {
          store.setSelected(rootId);
        }
        return;
      }

      switch (e.key) {
        case 'Tab': {
          e.preventDefault();
          store.addChild(selectedId);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const node = nodes[selectedId];
          if (node?.parentId) {
            store.addSibling(selectedId);
          } else {
            store.addChild(selectedId);
          }
          break;
        }
        case 'F2': {
          e.preventDefault();
          store.setEditing(selectedId);
          break;
        }
        case 'F3': {
          e.preventDefault();
          store.setLabelEditing(selectedId);
          break;
        }
        case 'F4': {
          e.preventDefault();
          const current = store.notesPanelNodeId;
          store.setNotesPanel(current === selectedId ? null : selectedId);
          break;
        }
        case ' ': {
          e.preventDefault();
          const node = nodes[selectedId];
          if (node && node.children.length > 0) {
            store.toggleCollapse(selectedId);
          }
          break;
        }
        case 'Delete':
        case 'Backspace': {
          if (selectedId !== rootId) {
            e.preventDefault();
            store.deleteNode(selectedId);
          }
          break;
        }
        case 'Escape': {
          store.setSelected(null);
          store.setContextMenu(null);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const node = nodes[selectedId];
          if (node && node.children.length > 0 && !node.collapsed) {
            store.setSelected(node.children[0]);
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const node = nodes[selectedId];
          if (node?.parentId) store.setSelected(node.parentId);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const siblings = getSiblings(nodes, selectedId);
          const idx = siblings.indexOf(selectedId);
          if (idx > 0) store.setSelected(siblings[idx - 1]);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const siblings = getSiblings(nodes, selectedId);
          const idx = siblings.indexOf(selectedId);
          if (idx < siblings.length - 1) store.setSelected(siblings[idx + 1]);
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
