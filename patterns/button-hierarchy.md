---
layout: default
title: Button hierarchy
description: Decide which action on a screen receives emphasis.
section: Shared pattern
permalink: /patterns/button-hierarchy/
---

# Button hierarchy

`Status: Draft` · `Owner: [name]`

## What it is

How we decide which action on a screen gets emphasis, and what to do when a screen has several actions competing for it. A list of primary buttons is not a styling problem — it is an unresolved hierarchy.

For the classes that express these decisions, see the product's Components.

## When to use / when not to

| Situation | Pattern |
|---|---|
| One clear main action | One primary button. Everything else secondary or text. |
| Two or three peer actions | Either one primary with the rest secondary, or all secondary. Decide deliberately — do not default. |
| Variants of one action (Save / Save and new / Save and close) | Split button. Default segment is the most common variant. |
| Four or more peer actions | All secondary, with less-used actions in an overflow menu. Promote one to primary only if it genuinely dominates. |
| No dominant action (a settings page, a dashboard) | No primary. All secondary. |

Zero primary actions is a valid answer. Two is not.

Four or more peer actions is usually a signal that the screen needs design attention rather than a styling decision. **ASK** — do not resolve it in code.

## Bootstrap default

Use the standard Bootstrap button, button group and dropdown components. Check the product's Bootstrap version.

## Our rules

**Emphasis**

- A screen MUST have at most one primary-emphasis action.
- Where two actions both feel primary, either pick the one most users take most often, or make both secondary. Both are valid; leaving two primaries is not.
- Primary emphasis MUST NOT be used to signal "new", "recommended", or "important" on anything that is not an action.
- Destructive actions MUST NOT take primary emphasis.

**Placement**

- Page-level actions MUST sit in a consistent position on every page of the same type.
- Actions MUST NOT be duplicated top and bottom unless the form is longer than two screens.
- Related actions MUST be grouped; unrelated actions MUST be separated visually.

**Overflow menus**

- The overflow control MUST have an accessible name and a tooltip, not a bare glyph.
- The most frequent action MUST NOT live in overflow.
- Overflow MUST NOT contain fewer than two items. One item is just a hidden button.
- **Exception:** an overflow menu MAY contain a single destructive action. The distance from the benign actions is the point, and it outweighs the cost of an extra click.

**Split buttons**

- The default segment MUST be the most common variant, not the most powerful.

**Labels**

- Buttons MUST use a verb naming the outcome: `Save changes`, not `Submit` or `OK`.
- Two buttons on the same screen MUST NOT use the same verb for different outcomes.

## Do this / not this

**Competing primaries**
✅ One primary `Publish`; `Save draft` secondary; `Discard` as a text action
❌ Three actions of equal weight in a row

**Variants of one action**
✅ Split button: `Save` with a menu containing `Save and new`, `Save and close`
❌ Three separate primary Save buttons

**Overflow**
✅ `Edit` visible; overflow menu containing Duplicate, Export, Archive
❌ The most frequent action hidden in overflow while a rare one sits in the open

**No dominant action**
✅ A settings page with all-secondary buttons
❌ An arbitrary button promoted to primary so the page "has one"

## Unresolved

### Open decisions

**Action placement per page type** — the rule says actions sit in a consistent position for each page type, but the actual positions are not yet defined. Needs research into what our platform currently does before we set them.
*Review by: [date]*

### Watching

*None yet.*


## Sources

- [Button States: Communicate Interaction](https://www.nngroup.com/articles/button-states-communicate-interaction/) — NN/g
- [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) — NN/g
