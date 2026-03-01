import { useEffect } from 'react';
import { useMapStore, useTemporalStore } from '../store/mapStore';
import { getSiblings, getNextNode, getPrevNode, getVisualTarget, getAllDescendants } from '../algorithms/treeUtils';
import { confirmDelete } from '../utils/confirmUnsaved';

// Persists across renders — tracks the last node that was selected
let lastSelectedId: string | null = null;

export function useKeyboard() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useMapStore.getState();
      const { selectedId, editingId, labelEditingId, notesPanelNodeId, nodes, rootId } = store;

      // Track last selected node so Escape + navigate resumes from it
      if (selectedId) lastSelectedId = selectedId;

      // Navigate to a node: select it and smoothly pan into view if needed
      const navigateTo = (id: string) => {
        store.setSelected(id);
        store.panToNode(id);
      };

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

      // Notes panel mode: only Escape is handled; everything else is blocked
      // (the focused textarea captures typing naturally via the isInput check below,
      //  but this guard covers the case where focus drifts away from the textarea)
      if (notesPanelNodeId) {
        if (e.key === 'Escape') {
          e.preventDefault();
          store.setNotesPanel(null);
        }
        return;
      }

      if (isInput) return;

      // Cmd/Ctrl+L: open label editor
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        if (selectedId) {
          e.preventDefault();
          store.setLabelEditing(selectedId);
        }
        return;
      }

      // Cmd/Ctrl+N: toggle notes panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        if (selectedId) {
          e.preventDefault();
          const current = store.notesPanelNodeId;
          store.setNotesPanel(current === selectedId ? null : selectedId);
        }
        return;
      }

      // Cmd/Ctrl shortcuts are handled by the native OS menu (useNativeMenu)
      if (e.ctrlKey || e.metaKey) return;

      if (!selectedId) {
        const navKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','h','j','k','l','Enter',' ','Tab'];
        if (navKeys.includes(e.key)) {
          e.preventDefault();
          const resumeId = lastSelectedId && nodes[lastSelectedId] ? lastSelectedId : rootId;
          navigateTo(resumeId);
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
        case 'd':
        case 'Delete':
        case 'Backspace': {
          if (selectedId !== rootId) {
            e.preventDefault();
            const node = nodes[selectedId];
            const descendantCount = getAllDescendants(nodes, selectedId).length;
            const prev = getPrevNode(nodes, selectedId);
            confirmDelete(node?.title || 'Node', descendantCount, () => {
              store.deleteNode(selectedId);
              if (prev && prev !== selectedId) navigateTo(prev);
            });
          }
          break;
        }
        case 't': {
          e.preventDefault();
          const node = nodes[selectedId];
          if (node && node.children.length > 0) {
            store.toggleCollapse(selectedId);
          }
          break;
        }
        case 'i': {
          e.preventDefault();
          store.setEditing(selectedId);
          break;
        }
        case 'u': {
          e.preventDefault();
          (useTemporalStore.getState() as any).undo();
          break;
        }
        case 'Escape': {
          store.setSelected(null);
          store.setContextMenu(null);
          break;
        }
        case 'ArrowLeft':
        case 'h': {
          e.preventDefault();
          const target = getVisualTarget(nodes, selectedId, 'left');
          if (target) navigateTo(target);
          break;
        }
        case 'ArrowRight':
        case 'l': {
          e.preventDefault();
          const target = getVisualTarget(nodes, selectedId, 'right');
          if (target) navigateTo(target);
          break;
        }
        case 'ArrowUp':
        case 'k': {
          e.preventDefault();
          const siblings = getSiblings(nodes, selectedId);
          const idx = siblings.indexOf(selectedId);
          if (idx > 0) navigateTo(siblings[idx - 1]);
          break;
        }
        case 'ArrowDown':
        case 'j': {
          e.preventDefault();
          const siblings = getSiblings(nodes, selectedId);
          const idx = siblings.indexOf(selectedId);
          if (idx < siblings.length - 1) navigateTo(siblings[idx + 1]);
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
