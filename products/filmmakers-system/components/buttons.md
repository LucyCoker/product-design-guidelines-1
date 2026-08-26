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
| Icon-only action | `btn-text theme-secondary` | See icon-only buttons below |
| Confirming a destructive action | `btn-solid theme-danger` | Confirmation dialogs only |
| Destructive action inside an overflow menu, or standalone on a detail page | `btn-text theme-danger` | Never as a bare control in a table row. See [Destructive actions](../../../patterns/destructive-actions.md) |
| Any action on a dark or brand-coloured surface | `btn-solid theme-inverse` | Primary on inverse |
| Secondary on a dark or brand-coloured surface | `btn-outline theme-inverse` | |
| Client zone signal | `btn-outline theme-secondary has-client-zone-icon` | Custom - See below |

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
| `btn-subtle` (all themes) | Not yet in use. See Unresolved. |
| The "styled" button style | "Default" rounded corner radius only. |

## Solid is reserved

`btn-solid` MUST be used only with `theme-primary`, `theme-danger`, and `theme-inverse`

This is the rule that prevents a row of competing buttons. Combined with one primary per screen, a logged-in screen contains at most one `btn-solid theme-primary`, and a solid danger button only inside a confirmation dialog.

## Custom Accent button - Client zone signal

`btn-outline theme-secondary has-client-zone-icon` is a secondary button whose icon carries an accent colour while the label stays secondary.

It signals that the user is in a client zone — an area where clients or other users may have access to the content. It is a visibility cue, not branding.

- It MUST be used consistently within a client zone. An inconsistent client zone signal is worse than none, because its absence then means nothing.
- It MUST NOT be used outside client zones.
- The accent icon MUST NOT be added to solid or text buttons, as this will compete with other actions on the page.
- It MUST NOT be the only signal that content is externally visible. Zone context must also be carried by the surrounding page.

## Icon-only buttons

- Icon-only buttons MUST use `btn-text theme-secondary`.
- They are permitted only for: overflow menus, close controls, and toolbar actions whose icon is universally understood (search, filter).
- Every icon-only button MUST have an accessible name and a tooltip shown on hover *and* keyboard focus.
- The hit target MUST be at least 44×44px regardless of icon size.
- Icon-only buttons MUST NOT be used for destructive actions.


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

**Sizes** — need to research how they are used and potentially come up with stricter guidelines.
*Review by: [date]*

**Other button types** — button groups, toggle buttons and loading buttons are not yet covered here.
*Review by: [date]*

**`has-client-zone-icon` naming and scope** — the class name and whether the client zone signal should extend beyond buttons to other components. Needs team review before adoption.
*Review by: [date]*

**`btn-subtle`** — deliberately not in use. Adding a fourth emphasis tier requires evidence that outline and text cannot cover the case, and all effort should first go into improving the UI so the tier is unnecessary.
*Review by: [date]*

### Watching

*None yet.*


## Sources

- [Button States: Communicate Interaction](https://www.nngroup.com/articles/button-states-communicate-interaction/) — NN/g
- [Bootstrap 6 buttons](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/button/)
