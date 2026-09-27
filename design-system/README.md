# Filmmakers Design System (example build)

A static site that shows Bootstrap 6 with the Filmmakers System layer on top. It needs no build step, so GitHub Pages serves it as it is at `/design-system/`.

## What is here

| Path | What it is |
|---|---|
| `index.html` | The design system page |
| `assets/bootstrap.min.css` | Bootstrap 6.0.0-alpha1, copied from `denkungsart/bootstrap-v6-dev@bc4bcb4`. Do not edit. |
| `assets/filmmakers.css` | Our token overrides and custom classes. Production loads this after Bootstrap. |
| `assets/rules-engine.js` | Checks markup against `data/rules.json`. Runs in the browser and in Node. |
| `data/tokens.json` | Design tokens (DTCG layout) |
| `data/rules.json` | The machine-checkable parts of the guidelines |
| `data/brands.json` | Invented sample customer primaries |
| `data/health.example.json` | Sample production scan. Not real data. |
| `scripts/check-markup.mjs` | CLI for production CI. Prints GitHub annotations. |

## Run it locally

```sh
python3 -m http.server 8000   # from the repo root
# open http://localhost:8000/design-system/
```

The page loads its data with `fetch`, so it must be served over HTTP, not opened as a file.

## Check production markup

```sh
node design-system/scripts/check-markup.mjs path/to/templates/*.html
```

It exits with 1 when it finds an error.

## Open decisions

The page marks them **ASK**. The main ones: how production derives customer primary roles, the focus ring and client zone contrast failures, and the Bootstrap `accent` name clash.
