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

- MUST use Bootstrap 6 markup and classes, plus the documented Filmmakers classes (`fm-`, in `filmmakers.css`) where a component uses them. Copy component markup from `design-system/data/components.json`. Never invent a class.
- MUST NOT use Tailwind, shadcn, Material or any other UI kit, and MUST NOT write CSS for colours, fonts, spacing or components.
- MUST NOT use hex, rgb or named colours. Colour comes from theme classes (`theme-primary`, `theme-secondary`, `theme-danger`…) and tokens (`var(--bs-…)`).
- To preview a customer's colour, set `:root { --fm-primary: #hex; }`. Nothing else.
- Light mode is the default: keep `data-bs-theme="light"` on `<html>`. Every token has a dark value too (`data-bs-theme="dark"` switches them), so colour that comes from tokens works in both. Do not add a dark mode switch to the product: whether it ships is an open decision.
- Pictures of people are illustrations or placeholders, never real photos.
- Icons are Font Awesome 7: `<i class="fa-solid fa-…">` or `fa-regular`.

## Rules

**Actions**
- At most one `btn-solid theme-primary` per screen. Everything else is secondary.
- Secondary `btn-outline theme-secondary` · Tertiary `btn-text theme-secondary` · Row action on a list item `btn-text theme-primary btn-xs` · Destructive `btn-text theme-danger`, or `btn-solid theme-danger` only in a confirmation dialog.
- Small (`btn-sm`) is the default size; `btn-xs` in table rows.
- Never `btn-solid theme-secondary`, `btn-outline theme-primary`, or `theme-success` / `theme-warning` / `theme-info` on a button. `btn-subtle theme-secondary` only for the filter and Sort by buttons of the Simple search and filter bar.
- Icon-only buttons are `btn-text theme-secondary btn-icon`, or `btn-outline theme-secondary btn-icon` when they stand alone or sit in a Button group. Each has `aria-label` and a tooltip, and a target of at least 24×24px. Only for overflow (ellipsis), close and well-known toolbar icons; never destructive.
- Row actions always have a text label and are the same set, in the same order, on every row. Four or more actions on one item: show up to three, then a **More** row action that opens a menu. Destructive items go last in the menu, after a divider.
- Buttons name the outcome: "Save changes", never "Submit" or "OK".

**Colour**
- Primary marks where people act. It never means new, recommended or important, and is never decoration.
- Status colours (success, danger, warning, info) report state only.
- Meaning is never carried by colour alone: pair it with an icon or text.

**Type**
- Body 14px. Page title `.fs-2xl`, section heading `.fs-lg`, card or group heading `.fs-md`, all `fw-semibold`. Heading tags follow the page structure.
- Weights 400 and 600 only. Never `fw-medium`, never italics for emphasis. De-emphasise with `.fg-2` / `.fg-3`. 12px (`.fs-xs`) is the floor.

**Layout and messages**
- Dialogs are Bootstrap 6's `dialog.dialog` (`data-bs-toggle="dialog"`, `data-bs-dismiss="dialog"`), not modals: one short decision or about six fields. They may scroll: add `.dialog-scrollable` so the header and footer stay put. Multi-step, or anything that needs its own URL, is a page.
- Toast for events, banner (`alert`) for conditions that are still true. A toast takes the status theme of the outcome with an icon. No "successfully", no exclamation marks.
- Reversible destructive actions act at once and offer Undo. Irreversible ones confirm, naming the object.

**Component candidates**
- Entries in the Library's Component candidates section (the Production list, the Profile tile: Auditions and the Profile tile: search results) are waiting for a decision. Do not use them in new work.

**Search and filter**
- Large sets (actors, crew, locations): the Complex bar. Search, up to three filters, More filters (opens a row of extra filters in the bar), then Sort by. Applied filters show as chips with Clear filters after the last one.
- Short, familiar lists (coworkers, projects): the Simple bar. A few subtle filter buttons, each showing its value.
- Filters are a Combobox reading "Label: value". One value: plain menu items, the current one `.selected` with a check. Several values: checkboxes. Filters apply on change.
- The Profile tile: search results is a Component candidate. Until it is decided, build profile search results only to match it as it stands, with the view switcher (Small tiles, Large tiles, List view) as one Button group.

## Rules

Each entry's `rules` are objects with a `kind`:

- **do**: a guideline to follow. **dont**: something not allowed (the Not allowed lists).
- **code**: a code note: markup, ARIA and CSS details. Follow them when building; designers can skip them.
- **a11y**: accessibility: accessible names, ARIA, keyboard, focus, contrast and target sizes. Always follow these.
- **other**: cross-references and parked notes.
- `devReview: true`: a developer still has to confirm it. Follow it, but it may change.

## Open decisions and flags

Each entry in `components.json` can carry flags:

- **ask**: the decision has not been made. Do not choose. Leave it visibly unresolved in the prototype, and say so.
- **exception**: a decided break from the guidelines, kept to match production (for example the Profile tile's name over the photo). Build it as the entry says.
- **review** (a field, shown as a badge such as “Needs review · Not finished”): the entry is not finished. Use it, but say in the prototype that it may change.

## Sources

- Component markup: `design-system/data/components.json` · Library: `design-system/index.html`
- One-line rules: `patterns/Patterns overview` · Full rules: `products/filmmakers-system/`, `patterns/`
- Agent rules: `AGENTS.md`
