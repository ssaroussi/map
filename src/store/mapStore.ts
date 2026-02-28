import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { MapState, MindNode } from '../types';
import { computeLayout } from '../algorithms/layout';
import { ROOT_COLOR, BRANCH_COLORS } from '../constants/colors';
import { getAllDescendants } from '../algorithms/treeUtils';

const ROOT_ID = uuidv4();

function createRootNode(): MindNode {
  return {
    id: ROOT_ID,
    title: 'Central Topic',
    label: '',
    description: '',
    children: [],
    parentId: null,
    x: 0,
    y: 0,
    color: ROOT_COLOR,
    collapsed: false,
    manuallyPositioned: false,
  };
}

interface MapActions {
  addChild: (parentId: string) => string;
  addSibling: (nodeId: string) => string;
  deleteNode: (nodeId: string) => void;
  updateTitle: (nodeId: string, title: string) => void;
  updateDescription: (nodeId: string, description: string) => void;
  updateLabel: (nodeId: string, label: string) => void;
  setSelected: (id: string | null) => void;
  setEditing: (id: string | null) => void;
  setLabelEditing: (id: string | null) => void;
  setNotesPanel: (id: string | null) => void;
  toggleCollapse: (nodeId: string) => void;
  setViewport: (viewport: Partial<MapState['viewport']>) => void;
  setContextMenu: (menu: MapState['contextMenu']) => void;
  moveNode: (nodeId: string, x: number, y: number) => void;
  reorderChild: (parentId: string, fromIndex: number, toIndex: number) => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
  fitToScreen: (width: number, height: number) => void;
  panToNode: (nodeId: string) => void;
  resetLayout: () => void;
}

type FullStore = MapState & MapActions;

const initialRoot = createRootNode();

const initialState: MapState = {
  nodes: { [ROOT_ID]: initialRoot },
  rootId: ROOT_ID,
  selectedId: null,
  editingId: null,
  labelEditingId: null,
  notesPanelNodeId: null,
  viewport: { x: 0, y: 0, scale: 1 },
  contextMenu: null,
};

export const useMapStore = create<FullStore>()(
  persist(
    temporal(
      immer((set, get) => ({
        ...initialState,

        addChild: (parentId: string) => {
          const newId = uuidv4();
          set((state) => {
            const parent = state.nodes[parentId];
            if (!parent) return;
            const newNode: MindNode = {
              id: newId,
              title: '',
              label: '',
              description: '',
              children: [],
              parentId,
              x: parent.x + 220,
              y: parent.y,
              color: parent.color,
              collapsed: false,
              manuallyPositioned: false,
            };
            state.nodes[newId] = newNode;
            parent.children.push(newId);
            computeLayout(state.nodes, state.rootId);
            state.selectedId = newId;
            state.editingId = newId;
          });
          // Pan viewport to show the new node
          setTimeout(() => get().panToNode(newId), 50);
          return newId;
        },

        addSibling: (nodeId: string) => {
          const newId = uuidv4();
          set((state) => {
            const node = state.nodes[nodeId];
            if (!node || !node.parentId) return;
            const parent = state.nodes[node.parentId];
            if (!parent) return;
            const idx = parent.children.indexOf(nodeId);
            const newNode: MindNode = {
              id: newId,
              title: '',
              label: '',
              description: '',
              children: [],
              parentId: node.parentId,
              x: node.x,
              y: node.y + 60,
              color: node.color,
              collapsed: false,
              manuallyPositioned: false,
            };
            state.nodes[newId] = newNode;
            parent.children.splice(idx + 1, 0, newId);
            computeLayout(state.nodes, state.rootId);
            state.selectedId = newId;
            state.editingId = newId;
          });
          // Pan viewport to show the new node
          setTimeout(() => get().panToNode(newId), 50);
          return newId;
        },

        deleteNode: (nodeId: string) => {
          set((state) => {
            if (nodeId === state.rootId) return;
            const node = state.nodes[nodeId];
            if (!node) return;
            const descendants = getAllDescendants(state.nodes, nodeId);
            for (const id of [...descendants, nodeId]) {
              delete state.nodes[id];
            }
            if (node.parentId) {
              const parent = state.nodes[node.parentId];
              if (parent) {
                parent.children = parent.children.filter(id => id !== nodeId);
              }
            }
            computeLayout(state.nodes, state.rootId);
            if (state.selectedId === nodeId) state.selectedId = null;
            if (state.editingId === nodeId) state.editingId = null;
            if (state.notesPanelNodeId === nodeId) state.notesPanelNodeId = null;
          });
        },

        updateTitle: (nodeId: string, title: string) => {
          set((state) => {
            if (state.nodes[nodeId]) state.nodes[nodeId].title = title;
          });
        },

        updateDescription: (nodeId: string, description: string) => {
          set((state) => {
            if (state.nodes[nodeId]) state.nodes[nodeId].description = description;
          });
        },

        updateLabel: (nodeId: string, label: string) => {
          set((state) => {
            if (state.nodes[nodeId]) state.nodes[nodeId].label = label;
          });
        },

        setSelected: (id: string | null) => {
          set((state) => { state.selectedId = id; });
        },

        setEditing: (id: string | null) => {
          set((state) => { state.editingId = id; });
        },

        setLabelEditing: (id: string | null) => {
          set((state) => { state.labelEditingId = id; });
        },

        setNotesPanel: (id: string | null) => {
          set((state) => { state.notesPanelNodeId = id; });
        },

        toggleCollapse: (nodeId: string) => {
          set((state) => {
            const node = state.nodes[nodeId];
            if (node) node.collapsed = !node.collapsed;
            computeLayout(state.nodes, state.rootId);
          });
        },

        setViewport: (viewport) => {
          set((state) => {
            Object.assign(state.viewport, viewport);
          });
        },

        setContextMenu: (menu) => {
          set((state) => { state.contextMenu = menu; });
        },

        moveNode: (nodeId: string, x: number, y: number) => {
          set((state) => {
            const node = state.nodes[nodeId];
            if (node) {
              node.x = x;
              node.y = y;
              node.manuallyPositioned = true;
            }
          });
        },

        reorderChild: (parentId: string, fromIndex: number, toIndex: number) => {
          set((state) => {
            const parent = state.nodes[parentId];
            if (!parent) return;
            const [removed] = parent.children.splice(fromIndex, 1);
            parent.children.splice(toIndex, 0, removed);
            computeLayout(state.nodes, state.rootId);
          });
        },

        exportJSON: () => {
          const state = get();
          return JSON.stringify({ nodes: state.nodes, rootId: state.rootId }, null, 2);
        },

        importJSON: (json: string) => {
          try {
            const data = JSON.parse(json);
            set((state) => {
              state.nodes = data.nodes;
              state.rootId = data.rootId;
              state.selectedId = null;
              state.editingId = null;
              state.notesPanelNodeId = null;
            });
          } catch {
            console.error('Invalid JSON');
          }
        },

        resetLayout: () => {
          set((state) => {
            for (const node of Object.values(state.nodes)) {
              node.manuallyPositioned = false;
            }
            computeLayout(state.nodes, state.rootId);
          });
          setTimeout(() => get().fitToScreen(window.innerWidth, window.innerHeight), 50);
        },

        panToNode: (nodeId: string) => {
          const state = get();
          const node = state.nodes[nodeId];
          if (!node) return;
          const { scale, x: vx, y: vy } = state.viewport;
          const w = window.innerWidth;
          const h = window.innerHeight;
          const margin = 80;
          // Convert node canvas coords to screen coords
          const screenX = node.x * scale + vx;
          const screenY = node.y * scale + vy;
          const hw = 100 * scale; // approx half node width
          const hh = 30 * scale;  // approx half node height
          const outOfBounds =
            screenX - hw < margin ||
            screenX + hw > w - margin ||
            screenY - hh < margin ||
            screenY + hh > h - margin;
          if (!outOfBounds) return;
          const targetX = w / 2 - node.x * scale;
          const targetY = h / 2 - node.y * scale;
          const startX = vx;
          const startY = vy;
          const duration = 350;
          const startTime = performance.now();
          const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic
          const animate = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1);
            const e = ease(t);
            set((s) => {
              s.viewport.x = startX + (targetX - startX) * e;
              s.viewport.y = startY + (targetY - startY) * e;
            });
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        },

        fitToScreen: (width: number, height: number) => {
          const state = get();
          // Find bounding box of all nodes
          const nodeList = Object.values(state.nodes);
          if (nodeList.length === 0) return;
          const xs = nodeList.map(n => n.x);
          const ys = nodeList.map(n => n.y);
          const minX = Math.min(...xs) - 120;
          const maxX = Math.max(...xs) + 120;
          const minY = Math.min(...ys) - 60;
          const maxY = Math.max(...ys) + 60;
          const contentW = maxX - minX;
          const contentH = maxY - minY;
          const scale = Math.min(
            width / contentW,
            height / contentH,
            1.2
          ) * 0.9;
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          set((s) => {
            s.viewport.scale = scale;
            s.viewport.x = width / 2 - centerX * scale;
            s.viewport.y = height / 2 - centerY * scale;
          });
        },
      })),
      {
        partialize: (state) => ({
          nodes: state.nodes,
          rootId: state.rootId,
          viewport: state.viewport,
        }),
      }
    ),
    {
      name: 'map-state',
      partialize: (state) => ({
        nodes: state.nodes,
        rootId: state.rootId,
        viewport: state.viewport,
      }),
    }
  )
);

export const useTemporalStore = (useMapStore as any).temporal;
