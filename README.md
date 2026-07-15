# Arcade Agents — Landing Page

The static landing page for **Arcade Agents** — watch every AI coding agent you run, see what each one is doing, and approve or stop what it wants, right from your MacBook notch. Works with Claude Code, Codex, Grok Build, and Kiro CLI.

## Contents

| File | Description |
| --- | --- |
| `index.html` | The single-page site (self-contained HTML/CSS/JS). |
| `ArcadeAgents-1.0.0.dmg` | macOS installer, linked from the Download button. |
| `ArcadeAgents-Intro-720p.mp4` | Intro / demo video. |

## Run locally

It's a static page — open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy with GitHub Pages

The site lives at the repository root, so it's ready for GitHub Pages:

1. **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` / `root`

It will be served at `https://neuralarc-ai.github.io/arcadeagents/`.
