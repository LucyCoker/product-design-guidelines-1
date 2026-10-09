---
layout: default
title: Help text
description: Where help lives, and what to use instead of help behind an icon.
section: Shared pattern
permalink: /patterns/help-text/
---

# Help text

`Status: Draft` · `Owner: [name]`

## What it is

Any text that helps someone understand a screen, a field or a choice: descriptions, hints, explanations and examples.

The Forms pattern says help needed to complete a field is always visible, never behind an icon. Filmmakers System often puts help in popovers and tooltips opened from an info icon. This page collects those cases and the alternatives, so each one can be fixed on purpose.

## Alternatives to help behind an icon

Suggestions to try before a popover or tooltip. None of them hides the help.

| Instead of | Try | When |
|---|---|---|
| Info icon beside a field | Description under the field (`.form-text`, wired with `aria-describedby`) | The help is needed to fill in the field |
| Info icon beside a card or section heading | Note (`.alert.theme-info` with `role="note"`) or one line of intro text under the heading | The help explains a whole card or section |
| Long help in a popover | Link to a help article, or an Accordion ("How does this work?") | The help is long, rarely needed, or needs examples |
| Tooltip explaining an option | Description under the option (checkbox, radio or switch with `.form-field-content`) | People compare options before choosing |
| Help on an empty screen | Empty state that says what this is for and how to start | Nothing has been added yet |
| Placeholder text as a hint | Description under the field | Always: placeholders disappear when you type and are never labels |

## Use cases

Where help is behind an icon today, and what it becomes.

| Screen | Current help | Proposed fix |
|---|---|---|
| | | |

## Unresolved

**Help in popovers** — the system uses popovers for help text a lot. Decide which cases keep a popover and which move to one of the alternatives above. **ASK**
*Review by: [date]*

### Watching

*None yet.*
