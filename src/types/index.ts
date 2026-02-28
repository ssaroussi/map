export interface MindNode {
  id: string;
  title: string;
  label: string;
  description: string;
  children: string[];
  parentId: string | null;
  x: number;
  y: number;
  color: string;
  collapsed: boolean;
  manuallyPositioned: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string;
}

export interface MapState {
  nodes: Record<string, MindNode>;
  rootId: string;
  selectedId: string | null;
  editingId: string | null;
  labelEditingId: string | null;
  notesPanelNodeId: string | null;
  viewport: Viewport;
  contextMenu: ContextMenuState | null;
}
