# Filmmakers component library

A simple component library for Filmmakers System: Bootstrap 6 with our tokens, styles and guidelines on top. It needs no build step, so GitHub Pages serves it as it is at `/design-system/`.

Sections: Foundations, Components (including Organisms), Templates (empty for now) and Guidelines.

## Where the content comes from

- **Components:** the Bootstrap 6 column of the Component mapping document (Selection and Manage Audition prototypes). Codes such as `BTN-2` match that document.
- **Rules:** the guideline pages in this repo.
- **Bootstrap:** `denkungsart/bootstrap-v6-dev@bc4bcb4` (6.0.0-alpha1).

## Files

| Path | What it is |
|---|---|
| `index.html` | The library page |
| `data/components.json` | Every component: group, name, classes, notes, open questions and example markup |
| `data/tokens.json` | Design tokens (DTCG layout) |
| `assets/filmmakers.css` | Our token overrides and product layer. Load after Bootstrap. |
| `assets/bootstrap.min.css`, `assets/bootstrap.bundle.min.js` | Bootstrap 6, copied from the build above. Do not edit. |
| `assets/fontawesome.css` | Font Awesome Free 7.0.1, solid and regular, fonts inlined |
| `assets/app.js`, `assets/site.css` | The library page itself |

| `figma/` | Figma hand-off: variables (`tokens.json`), component names (`components.json`), Code Connect. See `figma/README.md`. |
| `scripts/build-figma.mjs` | Regenerates the `figma/` files: `npm run figma --prefix design-system` |
| `scripts/build-claude.mjs`, `claude.config.json` | Builds the Claude Design System from the library: `npm run claude --prefix design-system`. See below. |

To add or change a component, edit `data/components.json`, then rerun the Figma build.

## Claude Design System

The "Filmmakers System" Design System on claude.ai (link in `claude.config.json`) is what Claude uses as the starting point for prototypes and designs. It is generated from this library and read-only on claude.ai: never edit it there.

- **What goes in:** the light-mode tokens resolved from `bootstrap.min.css` and `filmmakers.css`; one card per library group, with its live examples, rules, flags and markup; the brief from `prototype-kit/PROTOTYPE.md` as the brand book; the colour, typography, buttons and pattern pages as sections; the logo. Component candidates are left out. ASK flags and the decisions backlog are listed.
- **Rebuild:** `npm run claude --prefix design-system` writes `design-system/claude/project/` (not committed). Set `CHROMIUM_PATH` if Playwright cannot find Chromium.
- **Publish:** ask Claude Code, in this repository, to publish `design-system/claude/project/` to the artifact in `claude.config.json` (one Artifact publish with `root: design-system/claude`). Do this after each merge to main that changes the library or the guidelines.
- **Logo:** uploaded once to the artifact; its id is in `claude.config.json`. Upload again only if the logo changes.

## Run it locally

```sh
python3 -m http.server 8000   # from the repo root
# open http://localhost:8000/design-system/
```

## Open questions

Marked **ASK** on the page: the text-button theme (BTN-3), the client zone colour (MSG-5), and the focus ring contrast. The Header, Search and filter bar and Row actions examples, and the logo, were not shared yet.
