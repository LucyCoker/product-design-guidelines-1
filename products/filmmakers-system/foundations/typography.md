---
layout: default
title: Typography
description: The typography scale and usage rules for Filmmakers System.
section: Foundation
permalink: /products/filmmakers-system/foundations/typography/
---

# Typography

`Status: Draft` · `Owner: [name]`

Filmmakers System uses Bootstrap's typography and its type tokens. Sizes, line heights and the naming convention come from Bootstrap — this page does not repeat them.

---

## Families

We use Bootstrap's native font stack unmodified — the OS picks the best available face.

---

## Weights

A system stack gives no control over which weights are installed, so the scale uses two.

| Weight | Class | Use |
|---|---|---|
| 400 | `.fw-normal` | Body copy, table cells, descriptions, input values — the default |
| 600 | `.fw-semibold` | Headings, buttons, form labels, table column headers, active nav, emphasis |

**MUST NOT use `.fw-medium` / `font-weight: 500`.** Segoe UI on Windows 10 ships no Medium face,
so 500 falls back to Regular and renders identically to body text. Any hierarchy built on it
disappears on Windows without any visible error.

**MUST NOT express de-emphasis with weight.** Use colour instead. Lighter-than-body weights are not
reliably available. Use `--bs-secondary-color` at 400.

---

## The scale

| Headings | Size | Weight |
|---|---|---|
| h1 | 1.875rem / 30px | 600 |
| h2 | 1.5rem / 24px | 600 |
| h3 | 1.25rem / 20px | 600 |
| h4 | 1.125rem / 18px | 600 |
| h5 | 1rem / 16px | 600 |
| h6 | 0.875rem / 14px | 600 |
| lead | 1.125rem / 18px | 400 |

| Body | Size | Weight |
|---|---|---|
| body large | 1rem / 16px | 400 |
| **body** | **0.875rem / 14px** | **400** |
| body small | 0.8125rem / 13px | 400 |
| caption | 0.75rem / 12px | 400 |


**12px is the floor.** Use it only for fine print — timestamps, legal, helper text under inputs.
MUST NOT use it for anything the user must read to complete a task.

**Express secondary importance with colour, not size.** Dropping from 14px to 12px to signal
"less important" is the most common way this scale gets broken. Use `--bs-secondary-color`
at the same size instead.

MUST NOT use italics for emphasis; use weight 600.

---

## Three body sizes — how to choose

This system has **three** body sizes.

- **`body small` (13px)** — tooltips, dense cards or tables.
- **`body` (14px)** — the default. Anything the user *scans, operates, or fills in*:
- **`body large` (16px)** — anything the user *reads in paragraphs*:

---

## Accessibility

- **Critical:** 14px for `body` is achieved by setting `$font-size-base: .875rem`, *not* by shrinking the root. `1rem` must always equal the user's browser default so that browser font-size preferences and 200% text zoom (WCAG 2.1 AA, SC 1.4.4) work correctly.
- Body copy MUST NOT be justified. Uneven word spacing makes it harder to read for users with dyslexia.
- All-caps MUST NOT be used for anything longer than a short label.
- Line length limit: MUST NOT exceed 80 characters per WCAG advisory guidelines (Guideline 1.4.8).

## Unresolved

### Open decisions

*None yet.*

### Watching

*None yet.*

## Sources

- [Bootstrap 6 typography](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/content/typography/)
- [WCAG 2.1 — Resize Text 1.4.4](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
- [WCAG 2.1 — Images of Text 1.4.5](https://www.w3.org/WAI/WCAG21/Understanding/images-of-text.html)
- [Typography in design systems](https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e) — EightShapes
- [Typography guides](https://www.designsystems.com/typography-guides/) — Design Systems
- [System UI fonts vs custom fonts](https://holidu.design/system-ui-fonts-vs-custom-fonts-which-path-to-follow/) — Holidu
- [system-ui: browser support, stack, limitations](https://www.testmuai.com/learning-hub/system-ui-font/)
