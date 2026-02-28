import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { MapState, MindNode } from '../types';
import { computeLayout } from '../algorithms/layout';
import { ROOT_COLOR } from '../constants/colors';
import { getAllDescendants } from '../algorithms/treeUtils';
import {
  readFile,
  writeFile,
  showOpenDialog,
  showSaveDialog,
  getFileName,
  getRecentFiles,
} from './fileManager';

// --- Helpers ---

function makeRootId() { return uuidv4(); }

function createInitialState(): MapState & FileState {
  const rootId = makeRootId();
  return {
    nodes: {
      [rootId]: {
        id: rootId,
        title: 'Central Topic',
        label: '',
        description: '',
        children: [],
        parentId: null,
        x: 0, y: 0,
        color: ROOT_COLOR,
        collapsed: false,
        manuallyPositioned: false,
      },
    },
    rootId,
    selectedId: null,
    editingId: null,
    labelEditingId: null,
    notesPanelNodeId: null,
    viewport: { x: 0, y: 0, scale: 1 },
    contextMenu: null,
    // file state
    currentFilePath: null,
    isDirty: false,
    recentFiles: getRecentFiles(),
  };
}

interface FileState {
  currentFilePath: string | null;
  isDirty: boolean;
  recentFiles: string[];
}

interface MapActions {
  // node actions
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
  resetLayout: () => void;
  fitToScreen: (width: number, height: number) => void;
  panToNode: (nodeId: string) => void;
  // file actions
  newMap: () => void;
  openMap: () => Promise<void>;
  openMapFromPath: (path: string) => Promise<void>;
  saveMap: () => Promise<void>;
  saveMapAs: () => Promise<void>;
  serializeMap: () => string;
  loadMapFromJSON: (json: string, filePath?: string) => void;
}

type FullStore = MapState & FileState & MapActions;

// Debounced auto-save
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(get: () => FullStore) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const { currentFilePath, saveMap } = get();
    if (currentFilePath) await saveMap();
  }, 1000);
}

export const useMapStore = create<FullStore>()(
  temporal(
    immer((set, get) => ({
      ...createInitialState(),

      // --- Node actions ---

      addChild: (parentId: string) => {
        const newId = uuidv4();
        set((state) => {
          const parent = state.nodes[parentId];
          if (!parent) return;
          const newNode: MindNode = {
            id: newId, title: '', label: '', description: '',
            children: [], parentId,
            x: parent.x + 220, y: parent.y,
            color: parent.color, collapsed: false, manuallyPositioned: false,
          };
          state.nodes[newId] = newNode;
          parent.children.push(newId);
          computeLayout(state.nodes, state.rootId);
          state.selectedId = newId;
          state.editingId = newId;
          state.isDirty = true;
        });
        setTimeout(() => get().panToNode(newId), 50);
        scheduleSave(get);
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
            id: newId, title: '', label: '', description: '',
            children: [], parentId: node.parentId,
            x: node.x, y: node.y + 60,
            color: node.color, collapsed: false, manuallyPositioned: false,
          };
          state.nodes[newId] = newNode;
          parent.children.splice(idx + 1, 0, newId);
          computeLayout(state.nodes, state.rootId);
          state.selectedId = newId;
          state.editingId = newId;
          state.isDirty = true;
        });
        setTimeout(() => get().panToNode(newId), 50);
        scheduleSave(get);
        return newId;
      },

      deleteNode: (nodeId: string) => {
        set((state) => {
          if (nodeId === state.rootId) return;
          const node = state.nodes[nodeId];
          if (!node) return;
          for (const id of [...getAllDescendants(state.nodes, nodeId), nodeId]) {
            delete state.nodes[id];
          }
          if (node.parentId) {
            const parent = state.nodes[node.parentId];
            if (parent) parent.children = parent.children.filter(id => id !== nodeId);
          }
          computeLayout(state.nodes, state.rootId);
          if (state.selectedId === nodeId) state.selectedId = null;
          if (state.editingId === nodeId) state.editingId = null;
          if (state.notesPanelNodeId === nodeId) state.notesPanelNodeId = null;
          state.isDirty = true;
        });
        scheduleSave(get);
      },

      updateTitle: (nodeId, title) => {
        set((state) => { if (state.nodes[nodeId]) state.nodes[nodeId].title = title; state.isDirty = true; });
        scheduleSave(get);
      },

      updateDescription: (nodeId, description) => {
        set((state) => { if (state.nodes[nodeId]) state.nodes[nodeId].description = description; state.isDirty = true; });
        scheduleSave(get);
      },

      updateLabel: (nodeId, label) => {
        set((state) => { if (state.nodes[nodeId]) state.nodes[nodeId].label = label; state.isDirty = true; });
        scheduleSave(get);
      },

      setSelected: (id) => { set((state) => { state.selectedId = id; }); },
      setEditing: (id) => { set((state) => { state.editingId = id; }); },
      setLabelEditing: (id) => { set((state) => { state.labelEditingId = id; }); },
      setNotesPanel: (id) => { set((state) => { state.notesPanelNodeId = id; }); },
      setContextMenu: (menu) => { set((state) => { state.contextMenu = menu; }); },

      toggleCollapse: (nodeId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (node) node.collapsed = !node.collapsed;
          computeLayout(state.nodes, state.rootId);
          state.isDirty = true;
        });
        scheduleSave(get);
      },

      setViewport: (viewport) => {
        set((state) => { Object.assign(state.viewport, viewport); });
      },

      moveNode: (nodeId, x, y) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return;
          const dx = x - node.x;
          const dy = y - node.y;
          // Move the node and all descendants by the same delta
          const toMove = [nodeId, ...getAllDescendants(state.nodes, nodeId)];
          for (const id of toMove) {
            const n = state.nodes[id];
            if (n) { n.x += dx; n.y += dy; n.manuallyPositioned = true; }
          }
          state.isDirty = true;
        });
        scheduleSave(get);
      },

      reorderChild: (parentId, fromIndex, toIndex) => {
        set((state) => {
          const parent = state.nodes[parentId];
          if (!parent) return;
          const [removed] = parent.children.splice(fromIndex, 1);
          parent.children.splice(toIndex, 0, removed);
          computeLayout(state.nodes, state.rootId);
          state.isDirty = true;
        });
        scheduleSave(get);
      },

      resetLayout: () => {
        set((state) => {
          for (const node of Object.values(state.nodes)) node.manuallyPositioned = false;
          computeLayout(state.nodes, state.rootId);
          state.isDirty = true;
        });
        setTimeout(() => get().fitToScreen(window.innerWidth, window.innerHeight), 50);
        scheduleSave(get);
      },

      panToNode: (nodeId) => {
        const state = get();
        const node = state.nodes[nodeId];
        if (!node) return;
        const { scale, x: vx, y: vy } = state.viewport;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const margin = 80;
        const screenX = node.x * scale + vx;
        const screenY = node.y * scale + vy;
        const hw = 100 * scale;
        const hh = 30 * scale;
        const outOfBounds =
          screenX - hw < margin || screenX + hw > w - margin ||
          screenY - hh < margin || screenY + hh > h - margin;
        if (!outOfBounds) return;
        const targetX = w / 2 - node.x * scale;
        const targetY = h / 2 - node.y * scale;
        const startX = vx;
        const startY = vy;
        const duration = 350;
        const startTime = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const animate = (now: number) => {
          const t = Math.min((now - startTime) / duration, 1);
          const e = ease(t);
          set((s) => { s.viewport.x = startX + (targetX - startX) * e; s.viewport.y = startY + (targetY - startY) * e; });
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      },

      fitToScreen: (width, height) => {
        const state = get();
        const nodeList = Object.values(state.nodes);
        if (nodeList.length === 0) return;
        const xs = nodeList.map(n => n.x);
        const ys = nodeList.map(n => n.y);
        const minX = Math.min(...xs) - 120;
        const maxX = Math.max(...xs) + 120;
        const minY = Math.min(...ys) - 60;
        const maxY = Math.max(...ys) + 60;
        const scale = Math.min(width / (maxX - minX), height / (maxY - minY), 1.2) * 0.9;
        set((s) => {
          s.viewport.scale = scale;
          s.viewport.x = width / 2 - ((minX + maxX) / 2) * scale;
          s.viewport.y = height / 2 - ((minY + maxY) / 2) * scale;
        });
      },

      // --- File actions ---

      serializeMap: () => {
        const { nodes, rootId, viewport } = get();
        return JSON.stringify({ nodes, rootId, viewport }, null, 2);
      },

      loadMapFromJSON: (json, filePath) => {
        try {
          const data = JSON.parse(json);
          set((state) => {
            state.nodes = data.nodes;
            state.rootId = data.rootId;
            if (data.viewport) Object.assign(state.viewport, data.viewport);
            state.selectedId = null;
            state.editingId = null;
            state.notesPanelNodeId = null;
            state.currentFilePath = filePath ?? null;
            state.isDirty = false;
            state.recentFiles = getRecentFiles();
          });
        } catch {
          console.error('Invalid map file');
        }
      },

      newMap: () => {
        const fresh = createInitialState();
        set((state) => {
          Object.assign(state, fresh);
          state.isDirty = false;
          state.currentFilePath = null;
        });
      },

      openMap: async () => {
        const path = await showOpenDialog();
        if (!path) return;
        await get().openMapFromPath(path);
      },

      openMapFromPath: async (path: string) => {
        const json = await readFile(path);
        get().loadMapFromJSON(json, path);
      },

      saveMap: async () => {
        const { currentFilePath, serializeMap, saveMapAs } = get();
        if (!currentFilePath) {
          await saveMapAs();
          return;
        }
        await writeFile(currentFilePath, serializeMap());
        set((state) => { state.isDirty = false; state.recentFiles = getRecentFiles(); });
      },

      saveMapAs: async () => {
        const { currentFilePath, serializeMap } = get();
        const defaultName = currentFilePath
          ? currentFilePath.split('/').pop()
          : 'untitled.map';
        const path = await showSaveDialog(defaultName);
        if (!path) return;
        await writeFile(path, serializeMap());
        set((state) => {
          state.currentFilePath = path;
          state.isDirty = false;
          state.recentFiles = getRecentFiles();
        });
      },
    })),
    {
      // Only track node/tree changes for undo — viewport is view-only state
      partialize: (state) => ({
        nodes: state.nodes,
        rootId: state.rootId,
      }),
    }
  )
);

export const useTemporalStore = (useMapStore as any).temporal;
