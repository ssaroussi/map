---
name: mindmap
description: Create or edit a mind map file (.map) for the map desktop app. Use when asked to generate a mind map, convert an outline to a mind map, or modify an existing map.
context: fork
agent: general-purpose
allowed-tools: Read, Write, Bash
---

You are generating or editing a `.map` file for the **map** desktop app (Tauri + React mind map).

## File format

```json
{
  "nodes": { "<id>": <MindNode>, ... },
  "rootId": "<id>",
  "viewport": { "x": 0, "y": 0, "scale": 1 }
}
```

## MindNode schema

```typescript
{
  id: string;           // unique, uuidv4-style
  title: string;        // display text shown on the node
  label: string;        // small tag badge shown below the title (use "" if none)
  description: string;  // multi-line notes shown in the notes panel (use "" if none)
  children: string[];   // ordered child IDs
  parentId: string | null; // null for root only
  x: number; y: number; // canvas center position
  color: string;        // hex, inherited from depth-1 ancestor
  collapsed: boolean;
  manuallyPositioned: boolean; // false for generated layouts
}
```

## label vs description

- **label** — a short tag (1–3 words) that appears as a pill badge below the node title on the canvas. Use it for status, type, or category (e.g. `"done"`, `"API"`, `"v2"`).
- **description** — free-form notes (multi-line text) shown in the notes side panel when the user presses F4 or Cmd+N. Nodes with notes show a sketchy pen-stroke background on the canvas as a visual indicator. Use it for context, details, or explanation.

## Layout conventions

- Root node: `(0, 0)`
- Depth-1 nodes: `x = 260`, distribute vertically centered at y=0 with ~80px per sibling
- Depth 2+: each level adds `x += 200`; children stack vertically centered on parent
- Colors for depth-1 branches (cycle): `["#7c5cfc","#fc5c7d","#43e97b","#fa8231","#00b4d8","#f7d794"]`
- All descendants of a depth-1 node share its color

## Markdown export format

The app can export a map to Markdown (File → Export as Markdown…). Understanding this helps you generate maps that produce clean docs:

- Root → `# Title`
- Depth 1 → `## Title`
- Depth 2 → `### Title`
- Depth 3 → `#### Title`
- Depth 4+ → nested bullet list (`- **Title**`)
- Labels appear inline as backtick code: `# Title \`label\``
- Notes (description) appear as a paragraph directly under their heading or indented under their list item

## CLI tool (preferred for edits)

For **editing an existing map** (to avoid reading/rewriting large JSON):

```bash
npx ts-node .claude/skills/mindmap/map-cli.ts <command> <file> [...args]
```

Commands:
| Command | Args | Description |
|---------|------|-------------|
| `read` | `<file>` | Print tree summary with IDs, labels, and note presence |
| `write` | `<file> <json-string>` | Overwrite full map |
| `add-node` | `<file> <parentId> <title>` | Add a child node |
| `set-title` | `<file> <nodeId> <title>` | Rename a node |
| `delete-node` | `<file> <nodeId>` | Remove node + subtree |

Use `read` first to inspect node IDs, then use targeted commands instead of rewriting the whole file.

## Workflow

1. **New map**: build the full JSON object and write it with the `Write` tool (or `write` command).
2. **Edit existing map**: use `read` to inspect → use `add-node` / `set-title` / `delete-node` as needed.
3. Tell the user the file path and that they can open it with **File → Open** in the app.
