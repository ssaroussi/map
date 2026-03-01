#!/usr/bin/env npx ts-node
/**
 * map-cli.ts — lightweight CLI for reading/writing .map files
 *
 * Commands:
 *   read <file>                         Print a summary of nodes
 *   write <file> <json-string>          Write a full map state as JSON
 *   add-node <file> <parentId> <title>  Append a child node
 *   set-title <file> <nodeId> <title>   Rename a node
 *   delete-node <file> <nodeId>         Remove a node and its subtree
 *
 * The .map format:
 *   { nodes: Record<string, MindNode>, rootId: string, viewport: {x,y,scale} }
 *
 * MindNode:
 *   id, title, label, description, children[], parentId, x, y, color,
 *   collapsed, manuallyPositioned
 *
 * Layout conventions:
 *   root at (0,0); depth-1 at x=260, stacked y ~80px per sibling;
 *   each deeper level adds x+=200; children inherit parent color.
 *
 * Colors (cycle for depth-1 branches):
 *   ["#7c5cfc","#fc5c7d","#43e97b","#fa8231","#00b4d8","#f7d794"]
 */

import * as fs from 'fs';
import * as crypto from 'crypto';

const COLORS = ['#7c5cfc', '#fc5c7d', '#43e97b', '#fa8231', '#00b4d8', '#f7d794'];

interface MindNode {
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

interface MapFile {
  nodes: Record<string, MindNode>;
  rootId: string;
  viewport: { x: number; y: number; scale: number };
}

function uid() {
  return crypto.randomUUID();
}

function loadMap(file: string): MapFile {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveMap(file: string, map: MapFile) {
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
}

function depth(map: MapFile, id: string): number {
  let d = 0;
  let cur: string | null = id;
  while (cur && map.nodes[cur]?.parentId) {
    cur = map.nodes[cur].parentId;
    d++;
  }
  return d;
}

function branchColor(map: MapFile, id: string): string {
  // Walk up to depth-1 ancestor
  let cur = id;
  while (map.nodes[cur]?.parentId && map.nodes[map.nodes[cur].parentId!]?.parentId !== null) {
    cur = map.nodes[cur].parentId!;
  }
  const siblings = map.nodes[map.rootId]?.children ?? [];
  const idx = siblings.indexOf(cur);
  return COLORS[idx >= 0 ? idx % COLORS.length : 0];
}

function computePosition(map: MapFile, parentId: string): { x: number; y: number } {
  const parent = map.nodes[parentId];
  const d = depth(map, parentId) + 1;
  const siblings = parent.children;
  const x = d === 1 ? 260 : parent.x + 200;
  const totalHeight = siblings.length * 80;
  const y = parent.y - totalHeight / 2 + siblings.length * 80;
  return { x, y };
}

const [,, cmd, ...args] = process.argv;

if (cmd === 'read') {
  const map = loadMap(args[0]);
  const print = (id: string, indent = 0) => {
    const n = map.nodes[id];
    if (!n) return;
    console.log(' '.repeat(indent * 2) + `[${id.slice(0, 8)}] ${n.title}${n.label ? ` (${n.label})` : ''}`);
    n.children.forEach(c => print(c, indent + 1));
  };
  print(map.rootId);

} else if (cmd === 'write') {
  const [file, json] = args;
  const map: MapFile = JSON.parse(json);
  saveMap(file, map);
  console.log(`Written ${Object.keys(map.nodes).length} nodes to ${file}`);

} else if (cmd === 'add-node') {
  const [file, parentId, title] = args;
  const map = loadMap(file);
  const id = uid();
  const pos = computePosition(map, parentId);
  const color = branchColor(map, parentId) || COLORS[0];
  map.nodes[id] = { id, title, label: '', description: '', children: [], parentId, ...pos, color, collapsed: false, manuallyPositioned: false };
  map.nodes[parentId].children.push(id);
  saveMap(file, map);
  console.log(`Added node ${id} ("${title}") under ${parentId}`);

} else if (cmd === 'set-title') {
  const [file, nodeId, title] = args;
  const map = loadMap(file);
  map.nodes[nodeId].title = title;
  saveMap(file, map);
  console.log(`Updated title of ${nodeId} to "${title}"`);

} else if (cmd === 'delete-node') {
  const [file, nodeId] = args;
  const map = loadMap(file);
  const toDelete: string[] = [];
  const collect = (id: string) => {
    toDelete.push(id);
    map.nodes[id]?.children.forEach(collect);
  };
  collect(nodeId);
  const parentId = map.nodes[nodeId]?.parentId;
  if (parentId) {
    map.nodes[parentId].children = map.nodes[parentId].children.filter(c => c !== nodeId);
  }
  toDelete.forEach(id => delete map.nodes[id]);
  saveMap(file, map);
  console.log(`Deleted ${toDelete.length} node(s)`);

} else {
  console.log('Usage: map-cli <read|write|add-node|set-title|delete-node> <file> [...args]');
  process.exit(1);
}
