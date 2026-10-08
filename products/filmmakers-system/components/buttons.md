---
layout: default
title: Buttons
description: Permitted Bootstrap 6 button combinations for Filmmakers System.
section: Component
permalink: /products/filmmakers-system/components/buttons/
---

# Buttons

`Status: Draft` · `Owner: [name]`

These are the decisions on which Bootstrap button combinations we use for Filmmakers System and how.

## Variant and theme

Bootstrap 6 buttons have two independent axes:

- **Variant** — `btn-solid`, `btn-outline`, `btn-text` — sets **how much emphasis**
- **Theme** — `theme-primary`, `theme-danger`, and so on — sets **what it means**

**Never use theme to create emphasis.** Variant answers *how loud?* Theme answers *what kind?* Don't answer the first question with the second.

For example: `Publish` feels positive, so `theme-success` is tempting. But green means "this is in a good state" — using it on an action suggests the button is reporting a status rather than doing something. And once green means two things, it reliably means neither. `Publish` is an important, non-destructive action, so it takes emphasis from the variant and keeps a neutral meaning: `btn-solid theme-primary`.

The same logic in reverse: a destructive action that isn't the focus of the screen is `btn-text theme-danger` — red because of what it does, quiet because it isn't the main event.

## Permitted combinations

All Buttons MUST use the "Default" rounded option for corner radius. The "styled" style MUST NOT be used.

| Purpose | Class | Notes |
|---|---|---|
| The one primary action | `btn-solid theme-primary` | Max one per screen |
| Secondary action | `btn-outline theme-secondary` | Cancel, Export, Save draft |
| Tertiary, inline, or in-menu action | `btn-text theme-secondary` | Discard, Learn more |
| Row action on one item in a list, table, or row gutter | `btn-text theme-primary btn-xs` | Edit, Duplicate, View as applicant. See Row actions below |
| Icon-only action | `btn-text theme-secondary` | See icon-only buttons below |
| Confirming a destructive action | `btn-solid theme-danger` | Confirmation dialogs only |
| Destructive action inside an overflow menu, or standalone on a detail page | `btn-text theme-danger` | Never as a bare control in a table row. See [Destructive actions](../../../patterns/destructive-actions.md) |
| Any action on a dark or brand-coloured surface | `btn-solid theme-inverse` | Primary on inverse |
| Secondary on a dark or brand-coloured surface | `btn-outline theme-inverse` | |
| Client zone signal | `btn-outline theme-secondary fm-client-zone` | Custom - See below |

Anything outside this table is a deviation and MUST be proposed, not improvised.

## Button sizes

**Small is the default.** Filmmakers System is dense; small suits it.

| Size | Use for |
|---|---|
| Extra small | Table rows, inline row actions, compact toolbars |
| **Small** | Default. Everything else |
| Medium | Empty states, and screens with room to breathe |
| Large | Marketing surfaces only. Not used in the application |



## Banned combinations

| Banned | Why |
|---|---|
| `theme-success`, `theme-warning`, `theme-info` on any button | Success is a state, not an action. Warning duplicates danger. Info is indistinguishable from secondary. |
| `btn-solid theme-secondary` | Primary emphasis without primary meaning. |
| `btn-outline theme-primary`, `btn-subtle theme-primary` | Becomes a de facto second primary. If an action needs more than secondary but is not the primary, the hierarchy is wrong. |
| `btn-subtle` anywhere except Search and filter | Only the Simple search and filter bar uses it, for its filter and Sort by buttons. See below. |
| The "styled" button style | "Default" rounded corner radius only. |

## Solid is reserved

`btn-solid` MUST be used only with `theme-primary`, `theme-danger`, and `theme-inverse`

This is the rule that prevents a row of competing buttons. Combined with one primary per screen, a logged-in screen contains at most one `btn-solid theme-primary`, and a solid danger button only inside a confirmation dialog.

## Custom Accent button - Client zone signal

`btn-outline theme-secondary fm-client-zone` is a secondary button whose icon carries the client zone accent (`--fm-accent-client-zone`) while the label stays secondary.

The client zone accent signals an area where clients or other users may have access to the content. It is a visibility cue, not branding. It is not limited to buttons: it can also be a background colour for client areas, on avatars and elsewhere. There are no usage rules for it yet.

## Icon-only buttons

- Icon-only buttons MAY be used on their own or in a button group. On their own they MUST use `btn-text theme-secondary` by default, and MAY use `btn-outline theme-secondary` when they need a visible edge (for example on a grey or busy surface). Inside a button group or input group they take the group's style, `btn-outline theme-secondary`.
- They are permitted only for: overflow menus, close controls, and toolbar actions whose icon is universally understood (search, filter).
- Every icon-only button MUST have an accessible name and a tooltip shown on hover *and* keyboard focus.
- The hit target MUST be at least 24×24px regardless of icon size (WCAG 2.2 AA, 2.5.8 Target size). `btn-xs` (24px) is the smallest allowed size.
- Icon-only buttons MUST NOT be used for destructive actions.


## Row actions

`btn-text theme-primary btn-xs` is a text button in the primary colour. It marks the actions people take on one item in a dense list — Edit, Duplicate, View as applicant, Copy/Move, Messages — so they can be found at a glance in every row.

It is quiet in emphasis (text, extra small) and carries primary meaning (this is where you act on the item). It does not compete with the one `btn-solid theme-primary` on the screen.

- Row actions MUST sit on an item: a table cell, a list row, or a row gutter. Page-level quiet actions stay `btn-text theme-secondary`.
- Exception: **Clear filters** in a filter bar (Search and filter, Complex and Simple) uses `btn-text theme-primary btn-sm`, even though it is not on an item.
- Row actions MUST have a text label. An icon beside the label is optional.
- The same set MUST appear in the same order on every row, so people learn it once.
- Row actions MUST be always visible, never revealed on hover alone.
- Row actions MUST be non-destructive. Destructive actions follow [Destructive actions](../../../patterns/destructive-actions.md).
- Remove MUST go in the **More** overflow menu, even when it is reversible. It is never a bare control in a row or row gutter.
- Show at most three row actions. Put the rest in an overflow menu opened by a last row action labelled **More**, with the ellipsis icon.
- Each page chooses which row actions stay visible, up to three. The choice MUST be the same on every row of that page.
- The label MUST meet 4.5:1 against the row background for every customer primary. Where a customer primary fails, **ASK** — see [Colour](../foundations/colour.md).

### Icon action sets in rows

A repeating set of icon actions on every row of a list is permitted, but only under all of the following:

- The set MUST be identical on every row, so the user learns it once.
- The set MUST contain at most three icons.
- Each icon MUST have an accessible name and a tooltip on hover *and* keyboard focus.
- Every action in the set MUST be safe and reversible. Destructive actions MUST go in the overflow menu, labelled with text.
- The set MUST NOT be revealed on hover alone. It MUST be reachable by keyboard and present on touch.

Where any of these cannot be met, **ASK**.


## Do this / not this

**Emphasis**
✅ `btn-solid theme-primary` Publish · `btn-outline theme-secondary` Save draft · `btn-text theme-secondary` Discard
❌ Three solid buttons in a row

**Icon-only**
✅ Three icon buttons — archive, mark unread, snooze — each with an accessible name and a tooltip, the same set on every row
✅ Overflow `btn-text theme-secondary` with `aria-label="More actions"` and a tooltip
❌ An icon button with no accessible name and no tooltip
❌ Five icon buttons in a row, none with an accessible name or tooltip, with nothing moved to overflow


## Unresolved

### Open decisions

**Row action name** — "Row action" is a working name for `btn-text theme-primary btn-xs`. Confirm the name before it goes into code or Figma.
*Review by: [date]*

**Sizes** — need to research how they are used and potentially come up with stricter guidelines.
*Review by: [date]*

**Other button types** — button groups, toggle buttons and loading buttons are not yet covered here.
*Review by: [date]*

**`btn-subtle`** — decided for one use only: the filter and Sort by buttons in the Simple search and filter bar (`btn-subtle theme-secondary btn-sm`), where the grey fill marks each filter as a control. Anywhere else it stays out: adding it more widely needs evidence that outline and text cannot cover the case.
*Review by: [date]*

### Watching

*None yet.*


## Sources

- [Button States: Communicate Interaction](https://www.nngroup.com/articles/button-states-communicate-interaction/) — NN/g
- [Bootstrap 6 buttons](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/button/)
