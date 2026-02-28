import { useEffect, useRef } from 'react';
import { useMapStore } from '../../store/mapStore';

interface Props {
  nodeId: string;
}

export function NodeEditor({ nodeId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const title = useMapStore.getState().nodes[nodeId]?.title ?? '';
  const updateTitle = useMapStore(s => s.updateTitle);
  const setEditing = useMapStore(s => s.setEditing);
  const deleteNode = useMapStore(s => s.deleteNode);
  const rootId = useMapStore(s => s.rootId);

  useEffect(() => {
    if (ref.current) {
      // Set content imperatively — never via React children — so re-renders
      // don't reset the DOM and push the cursor back to position 0.
      ref.current.textContent = title;
      ref.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    if (ref.current) {
      updateTitle(nodeId, ref.current.textContent || '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const currentTitle = ref.current?.textContent?.trim() || '';
      if (!currentTitle && nodeId !== rootId) {
        deleteNode(nodeId);
      }
      setEditing(null);
    }
  };

  return (
    <div
      ref={ref}
      data-node
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        const currentTitle = ref.current?.textContent?.trim() || '';
        if (!currentTitle && nodeId !== rootId) {
          deleteNode(nodeId);
        }
        setEditing(null);
      }}
      style={{
        outline: 'none',
        minWidth: '40px',
        maxWidth: '160px',
        wordBreak: 'break-word',
        cursor: 'text',
        color: 'inherit',
      }}
    />
  );
}
