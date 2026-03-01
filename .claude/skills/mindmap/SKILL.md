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
  title: string;        // display text
  label: string;        // small tag shown below title (can be "")
  description: string;  // notes panel content (can be "")
  children: string[];   // ordered child IDs
  parentId: string | null; // null for root only
  x: number; y: number; // canvas center position
  color: string;        // hex, inherited from depth-1 ancestor
  collapsed: boolean;
  manuallyPositioned: boolean; // false for generated layouts
}
```

## Layout conventions

- Root node: `(0, 0)`
- Depth-1 nodes: `x = 260`, distribute vertically centered at y=0 with ~80px per sibling
- Depth 2+: each level adds `x += 200`; children stack vertically centered on parent
- Colors for depth-1 branches (cycle): `["#7c5cfc","#fc5c7d","#43e97b","#fa8231","#00b4d8","#f7d794"]`
- All descendants of a depth-1 node share its color

## CLI tool (preferred for edits)

For **editing an existing map** (to avoid reading/rewriting large JSON):

```bash
npx ts-node .claude/skills/mindmap/map-cli.ts <command> <file> [...args]
```

Commands:
| Command | Args | Description |
|---------|------|-------------|
| `read` | `<file>` | Print tree summary |
| `write` | `<file> <json-string>` | Overwrite full map |
| `add-node` | `<file> <parentId> <title>` | Add a child node |
| `set-title` | `<file> <nodeId> <title>` | Rename a node |
| `delete-node` | `<file> <nodeId>` | Remove node + subtree |

Use `read` first to inspect node IDs, then use targeted commands instead of rewriting the whole file.

## Workflow

1. **New map**: build the full JSON object and write it with the `Write` tool (or `write` command).
2. **Edit existing map**: use `read` to inspect → use `add-node` / `set-title` / `delete-node` as needed.
3. Tell the user the file path and that they can open it with **File → Open** in the app.
