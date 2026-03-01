import { MindNode } from '../types';
import { useMapStore } from '../store/mapStore';
import { showSaveMarkdownDialog, writeFile } from '../store/fileManager';

// Headings used for the first 4 depth levels; beyond that → list items
const HEADING_LEVELS = 4;

function renderNode(
  nodes: Record<string, MindNode>,
  nodeId: string,
  depth: number,        // 0 = root
  listIndent: number,   // -1 means we haven't switched to list mode yet
): string {
  const node = nodes[nodeId];
  if (!node) return '';

  const lines: string[] = [];

  if (depth <= HEADING_LEVELS) {
    // --- Heading mode ---
    const level = Math.min(depth + 1, HEADING_LEVELS); // root → h1, depth-1 → h2 … depth-3+ → h4
    const hashes = '#'.repeat(level);
    const labelSuffix = node.label ? `  \`${node.label}\`` : '';
    const noteSuffix = node.description?.trim()
      ? ` — ${node.description.trim().replace(/\n+/g, ' ')}`
      : '';
    lines.push(`${hashes} ${node.title}${labelSuffix}${noteSuffix}`);
    if (node.children.length > 0) {
      lines.push('');
      for (const childId of node.children) {
        lines.push(renderNode(nodes, childId, depth + 1, -1));
      }
    }
  } else {
    // --- List mode ---
    const indent = '  '.repeat(listIndent);
    const labelSuffix = node.label ? ` \`${node.label}\`` : '';
    const noteSuffix = node.description?.trim()
      ? ` — ${node.description.trim().replace(/\n+/g, ' ')}`
      : '';
    lines.push(`${indent}- **${node.title}**${labelSuffix}${noteSuffix}`);
    for (const childId of node.children) {
      lines.push(renderNode(nodes, childId, depth + 1, listIndent + 1));
    }
  }

  return lines.join('\n');
}

export async function exportToMarkdown(): Promise<void> {
  const { nodes, rootId, currentFilePath } = useMapStore.getState();

  const md = renderNode(nodes, rootId, 0, 0).trim() + '\n';

  const defaultName = currentFilePath
    ? currentFilePath.split('/').pop()!.replace(/\.(map|json)$/, '.md')
    : 'export.md';

  const path = await showSaveMarkdownDialog(defaultName);
  if (!path) return;

  await writeFile(path, md);
}
