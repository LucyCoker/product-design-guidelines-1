---
layout: default
title: Typography
description: The typography scale and usage rules for Filmmakers System.
section: Foundation
permalink: /products/filmmakers-system/foundations/typography/
---

# Typography

`Status: Draft` · `Owner: [name]`

Filmmakers System uses Bootstrap's typography and its type tokens. Anything not defined on this page follows sizes, line heights and the naming conventions from Bootstrap — this page does not repeat them.

---

## Families

We use Bootstrap's native font stack unmodified — the OS picks the best available face.

---

## Scale

This is adjusted from Bootstrap v6 headings scale to be closer to the 14px default body size.

| Headings | Size | Weight |
|---|---|---|
| h1 | 1.875rem / 30px | 600 |
| h2 | 1.5rem / 24px | 600 |
| h3 | 1.25rem / 20px | 600 |
| h4 | 1.125rem / 18px | 600 |
| h5 | 1rem / 16px | 600 |
| h6 | 0.875rem / 14px | 600 |

---

| Body | Size | Weight | Usage |
|---|---|---|---|
| body large | 1rem / 16px | 400 | Anything the user reads in paragraphs, however not for user-entered reference descriptions (e.g. project or role descriptions within a caster's own project)|
| **body** | **0.875rem / 14px** | **400** | **Default. Anything the user scans, operates, or fills in** |
| caption | 0.75rem / 12px | 400 | Tooltips, timestamps, legal | 

**12px is the floor**. MUST NOT use it for anything the user must read to complete a task.

**Express secondary importance with colour, not size.** Dropping from 14px to 12px to signal
"less important" is the most common way this scale gets broken. Use `--bs-secondary-color`
at the same size instead.

MUST NOT use italics for emphasis; use weight 600.

---

## Weights

A system stack gives no control over which weights are installed, so the scale uses two.

| Weight | Class | Use |
|---|---|---|
| 400 | `.fw-normal` | Body copy, table cells, descriptions, input values — the default |
| 600 | `.fw-semibold` | Headings, buttons, form labels, table column headers, active nav, emphasis |

**MUST NOT use `.fw-medium` / `font-weight: 500`.** Segoe UI on Windows 10 ships no Medium face,
so 500 falls back to Regular and renders identically to body text. Where existing code or designs use `.fw-medium` / `font-weight: 500` replace it with `.fw-semibold` / `font-weight: 600` to ensure the emphasis remains.

**MUST NOT express de-emphasis with weight.** Use colour instead. Lighter-than-body weights are not
reliably available. Use `--bs-secondary-color` at 400.

---

## Accessibility

- **Critical:** Set `--bs-body-font-size: var(--bs-font-size-sm)` in the central Bootstrap adapter to select the 14px `body` default. Do not shrink the document root to achieve this. Changing the body default does not rescale Bootstrap's independent named sizes or headings. Browser font-size preferences and 200% text zoom (WCAG 2.1 AA, SC 1.4.4) MUST remain supported.
- Body copy MUST NOT be justified. Uneven word spacing makes it harder to read for users with dyslexia.
- All-caps MUST NOT be used for anything longer than a short label.
- Line length limit: MUST NOT exceed 80 characters per WCAG advisory guidelines (Guideline 1.4.8).

## Unresolved

### Open decisions

- When the base font size is changed to 14px, does Bootstrap v6 automatically adjust the typogrpahy scale? If so, do those sizes work for our system and should we change our guidelines to match the auto generated scale rather than making it custom?

### Watching

- Do we need to add an option for **`body small` (13px)** — to be used for dense cards (e.g. Suggestions) or tables.
- Do we need to add an option for `.fw-bold` / `font-weight: 700`

## Sources

- [Bootstrap 6 typography](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/content/typography/)
- [WCAG 2.1 — Resize Text 1.4.4](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
