# Filmmakers System — prototype brief

Paste this into Claude Design, Claude Code, Lovable, v0, Bolt or any other tool before you ask for a screen.

## Build with the real design system

Filmmakers System runs on Bootstrap 6 with the Filmmakers layer on top. Load these files and nothing else for styling:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/LucyCoker/product-design-guidelines-1@main/design-system/assets/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/LucyCoker/product-design-guidelines-1@main/design-system/assets/fontawesome.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/LucyCoker/product-design-guidelines-1@main/design-system/assets/filmmakers.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/LucyCoker/product-design-guidelines-1@main/design-system/assets/bootstrap.bundle.min.js"></script>
```

Start from `design-system/prototype-kit/starter.html`. It already has the header and subheader band.

- MUST use Bootstrap 6 markup and classes only. Copy component markup from `design-system/data/components.json`.
- MUST NOT use Tailwind, shadcn, Material or any other UI kit, and MUST NOT write CSS for colours, fonts, spacing or components.
- MUST NOT use hex, rgb or named colours. Colour comes from theme classes (`theme-primary`, `theme-secondary`, `theme-danger`…) and tokens (`var(--bs-…)`).
- To preview a customer's colour, set `:root { --fm-primary: #hex; }`. Nothing else.
- Icons are Font Awesome 7: `<i class="fa-solid fa-…">` or `fa-regular`.

## Rules

**Actions**
- At most one `btn-solid theme-primary` per screen. Everything else is secondary.
- Secondary `btn-outline theme-secondary` · Tertiary `btn-text theme-secondary` · Row action on a list item `btn-text theme-primary btn-xs` · Destructive `btn-text theme-danger`, or `btn-solid theme-danger` only in a confirmation dialog.
- Small (`btn-sm`) is the default size; `btn-xs` in table rows.
- Never `btn-solid theme-secondary`, `btn-outline theme-primary`, `btn-subtle`, or `theme-success` / `theme-warning` / `theme-info` on a button.
- Icon-only buttons are `btn-text theme-secondary btn-icon` with `aria-label` and a tooltip.
- Four or more actions on one item: show up to three, then a **More** row action that opens a menu. Destructive items go last in the menu, after a divider.
- Buttons name the outcome: "Save changes", never "Submit" or "OK".

**Colour**
- Primary marks where people act. It never means new, recommended or important, and is never decoration.
- Status colours (success, danger, warning, info) report state only.
- Meaning is never carried by colour alone: pair it with an icon or text.

**Type**
- Body 14px. Page title `.fs-2xl`, section heading `.fs-lg`, card or group heading `.fs-md`, all `fw-semibold`. Heading tags follow the page structure.
- Weights 400 and 600 only. Never `fw-medium`, never italics for emphasis. De-emphasise with `.fg-2` / `.fg-3`. 12px (`.fs-xs`) is the floor.

**Layout and messages**
- Modal: one short decision or about six fields. Anything longer, or multi-step, is a page.
- Toast for events, banner (`alert`) for conditions that are still true. No "successfully", no exclamation marks.
- Reversible destructive actions act at once and offer Undo. Irreversible ones confirm, naming the object.

## Open decisions

Where the guidelines say **ASK**, the decision has not been made. Do not choose. Leave it visibly unresolved in the prototype, and say so.

## Sources

- Component markup: `design-system/data/components.json` · Library: `design-system/index.html`
- One-line rules: `patterns/Patterns overview` · Full rules: `products/filmmakers-system/`, `patterns/`
- Agent rules: `AGENTS.md`
