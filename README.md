# Map

A fast, beautiful mind-mapping app for macOS, Windows, and Linux — built with Tauri and React.

---

<!-- SCREENSHOT: full app window showing a mind map with several colorful branches -->
![Map overview](docs/screenshots/overview.png)

---

## A canvas that thinks like you do

Map gives you an infinite dark canvas where ideas connect naturally. Branches flow out from a central topic, each in its own color, linked by smooth animated curves.

<!-- SCREENSHOT: close-up of several nodes and bezier connections, showing the color-coded branches and glow effects -->
![Node connections](docs/screenshots/connections.png)

---

## Keyboard-first. Mouse when you want.

Everything you need is one key away.

| Action | Key |
|--------|-----|
| New child node | `Tab` |
| New sibling | `Enter` |
| Edit title | `F2` or double-click |
| Navigate | `← → ↑ ↓` |
| Add a label tag | `F3` |
| Open notes panel | `F4` |
| Collapse subtree | `Space` |
| Undo / Redo | `⌘Z` / `⌘Y` |

<!-- SCREENSHOT: notes panel open on the right side, showing the description textarea for a selected node -->
![Notes panel](docs/screenshots/notes-panel.png)

---

## Your files, your format

Maps are saved as plain `.map` files — human-readable JSON you can version-control, share, or script against.

```json
{
  "rootId": "abc-123",
  "nodes": {
    "abc-123": { "title": "My Project", "children": ["def-456"], ... }
  }
}
```

Export any map to PNG in one click: **File → Export as PNG…**

<!-- SCREENSHOT: exported PNG of a mind map open in Preview/Photos -->
![PNG export](docs/screenshots/export.png)

---

## Works with Claude

Map ships with a Claude Code skill — describe a mind map in plain English and Claude generates a ready-to-open `.map` file:

```
/mindmap  Create a mind map about React Hooks
```

<!-- SCREENSHOT: terminal showing /mindmap being invoked, alongside the resulting map open in the app -->
![Claude skill](docs/screenshots/claude-skill.png)

---

## Download

Head to the [Releases](../../releases) page and grab the build for your platform:

- **macOS** — `.dmg` (Apple Silicon or Intel)
- **Windows** — `.msi` or `.exe`
- **Linux** — `.deb` or `.AppImage`

---

## Build from source

```bash
# Prerequisites: Node 20+, Rust stable
npm install
npm run tauri dev      # dev mode
npm run tauri build    # production build
```

---

Made by [Amit Saroussi](https://github.com/ssaroussi)
