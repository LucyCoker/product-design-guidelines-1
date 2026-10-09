---
layout: default
title: Design system platform
description: Proposal for a single design system site that production, Figma, AI prototyping, and designers all work from.
section: Proposal
permalink: /proposals/design-system-platform/
---

# Proposal — Filmmakers design system platform

`Status: Draft` · `Owner: [name]`

How to turn these guidelines into one design system that production code, Figma, and AI prototyping tools all use as their source of truth.

---

## What it must do

| # | Requirement | How this proposal meets it |
|---|---|---|
| 1 | Production repos link to it and use the same code | Published npm package plus an agent skill that production repos install |
| 2 | Exports to Figma, linked to variables and components | Tokens sync to Figma Variables; Code Connect links Figma components to real markup |
| 3 | Starting point for AI prototypes, Claude Design first | One machine-readable bundle: tokens, component markup, and these rules |
| 4 | Bootstrap 6 underneath, our style, tokens, and UX rules on top | A thin theme layer that configures Bootstrap. No forked components |
| 5 | Preview any customer's primary colour | A primary switcher that re-derives every primary token at runtime and reports contrast |
| 6 | Shows where production misuses components | Lint rules generated from these guidelines, plus scheduled accessibility scans |
| 7 | Designers change things and push to GitHub | Every change is a pull request with a preview deploy and a visual diff |

## Recommended architecture

```text
                      ┌────────────────────────────────────────────┐
                      │  product-design-guidelines (this repo)      │
                      │                                             │
                      │  guidelines/*.md   ← rules (as today)       │
                      │  tokens/*.json     ← DTCG design tokens     │
                      │  stories/          ← component examples     │
                      │  rules/*.json      ← lintable MUST/MUST NOT │
                      └──────┬─────────────┬──────────────┬─────────┘
                        build│         sync│          audit│
             ┌───────────────┘             │              └──────────────┐
             ▼                             ▼                             ▼
  @denkungsart/filmmakers-ds     Figma (Variables +          Production repos
  ├─ tokens.css / _tokens.scss    Code Connect)               ├─ CI lint + a11y report
  ├─ bootstrap theme config       ▲    │                      └─ AGENTS.md → skill
  ├─ agent skill + llms.txt       │    │ designers edit
  └─ Storybook site  ──────────── ┘    ▼
     (the "design system page")   Pull request → preview → merge → release
```

Three decisions carry the rest.

### 1. Tokens are files in Git, in W3C DTCG format

Store tokens as [Design Tokens Community Group](https://www.designtokens.org/) JSON in `tokens/`. Build them with [Style Dictionary](https://styledictionary.com/) into every format the consumers need:

| Output | Consumer |
|---|---|
| `tokens.css` (CSS custom properties) | Production, Storybook, prototypes |
| `_filmmakers.scss` (`@use "bootstrap/scss/bootstrap" with (...)` overrides) | Production builds that compile Bootstrap from Sass |
| Figma Variables JSON | Figma, through Tokens Studio or the Variables API |
| `design-system.json` + `llms.txt` | AI tools, including Claude Design and Claude Code |

Layer the token files so that each layer only states what it changes:

1. `tokens/bootstrap/` — generated from `bootstrap-v6-dev` (`$colors`, `$theme-colors`). Never hand-edited.
2. `tokens/filmmakers/` — our decisions. Example: primary `bg` is `blue-600`, not Bootstrap's `blue-500`.
3. `tokens/brands/` — sample customer primaries for the switcher and for tests.

This keeps the rule "these guidelines MUST NOT invent unsupported Bootstrap APIs" checkable: every Filmmakers token must reference a Bootstrap token or a Bootstrap role.

### 2. Storybook is the design system page

Use [Storybook](https://storybook.js.org/) with the `html-vite` framework. Bootstrap 6 is plain HTML, CSS, and TypeScript, so the stories stay framework-free and match production markup one to one.

Storybook covers most requirements out of the box:

| Need | Storybook feature |
|---|---|
| Component gallery with live markup | Stories and the Docs tab ("Show code") |
| Guidelines next to components | MDX pages that import the existing Markdown files, so AGENTS.md and the site read the same source |
| Primary switcher | A toolbar global (see below) |
| Accessibility checks on every component | `@storybook/addon-a11y` (axe-core), run in CI with the test runner |
| Visual diffs for design changes | Chromatic, or Playwright screenshot tests if we want to stay free |
| Link from Figma | Storybook Connect plugin for Figma |
| AI access | Storybook's MCP addon exposes stories and docs to agents |

The current Jekyll site can stay online while Storybook grows, then redirect to it. Alternatively, keep Jekyll for long-form guidance and link each page to its Storybook component. **ASK** — one site or two.

### 3. Rules become data as well as prose

Each component page keeps its prose. Add a small `rules/<component>.json` next to it that states the machine-checkable parts. Example from [Buttons](../products/filmmakers-system/components/buttons.md):

```json
{
  "component": "button",
  "status": "draft",
  "banned": [
    { "classes": ["btn-solid", "theme-secondary"], "reason": "Primary emphasis without primary meaning" },
    { "classes": ["btn-subtle"], "reason": "Not yet in use" },
    { "classes": ["btn", "theme-success"], "reason": "Success is a state, not an action" },
    { "classes": ["btn-styled"], "reason": "Default rounded corners only" }
  ],
  "maxPerScreen": [{ "classes": ["btn-solid", "theme-primary"], "max": 1 }],
  "requireAccessibleName": ["btn:icon-only"]
}
```

One file then drives three things: lint rules in production, the "Do / Don't" blocks in Storybook, and the context given to AI tools.

## Requirement by requirement

### Production repos link to it

- Publish `@denkungsart/filmmakers-ds` to GitHub Packages. It contains the token CSS, the Bootstrap Sass config, the small set of custom classes (for example `has-client-zone-icon`), and the rules JSON.
- Production depends on Bootstrap 6 **and** this package. Renovate opens a pull request in each production repo when a new version is released.
- Add one line to each production repo's `AGENTS.md` / `CLAUDE.md` that points to the guidelines. Better, ship them as a Claude Code plugin from this repo, so agents in any repo load the rules and the token list without copying them.
- Storybook stories link to the production file that implements each component. Production components link back to the story in a code comment.

The source precedence in [AGENTS.md](../AGENTS.md) says production is authoritative for tokens that exist. To start, generate `tokens/filmmakers/` **from** production. Only flip the direction (production consumes the package) once the team agrees. **ASK** — who owns the token values long term.

### Export to Figma

Two links are needed. They use different tools.

| Link | Tool | Direction |
|---|---|---|
| Tokens ↔ Figma Variables | [Tokens Studio](https://tokens.studio/) with GitHub sync | Two-way. Designers edit in Figma, Tokens Studio opens a pull request |
| Figma components ↔ real markup | [Figma Code Connect](https://www.figma.com/developers/code-connect) | Code to Figma. Dev Mode shows our Bootstrap markup, not generated CSS |
| Figma → agents | Figma MCP server | Figma to code. Claude reads the file, the variables it uses, and the Code Connect snippets |

Build the Figma component library to mirror Bootstrap 6 variants as properties (`variant = solid | outline | text`, `theme = primary | secondary | danger | inverse`). Only expose the permitted combinations, so a designer cannot pick a banned one.

The Figma Variables REST API can write variables only on an Enterprise plan. Tokens Studio works on any plan. **ASK** — which Figma plan we have.

### Starting point for AI prototypes (Claude Design first)

Give every AI tool the same bundle, generated on each release:

- `design-system.json` — tokens, component list, permitted class combinations, banned combinations.
- `llms.txt` — an index of the guideline Markdown, in reading order from [AGENTS.md](../AGENTS.md).
- `starter.html` — one page that loads Bootstrap 6 and `tokens.css`, with a sample layout that follows the rules.

For Claude Design, connect it to this repository so it builds its design system from the tokens, stories, and guidelines, then prototypes from that. For Claude Code and other agents, the Claude Code plugin and the Storybook MCP addon give the same context. Prototypes that use only these classes can move into production with little rework, because the markup is already production markup.

### Bootstrap 6 underneath, our layer on top

Do not fork Bootstrap components. The `bootstrap-v6-dev` repo shows that Bootstrap 6 exposes everything we need to theme:

- `$colors` and `$theme-colors` accept merges through `defaults()`, so our layer only lists what changes.
- Components read `--theme-*` tokens, and `.theme-<name>` classes remap them. Our overrides live in the `custom` CSS layer.
- Component tokens (for example `$button-styled-tokens`) change a component without new selectors.

Our layer is therefore: token overrides, a short list of custom classes, and rules. Anything else is a proposal, as the guidelines already require.

### Preview a customer's primary colour

Add a toolbar control to Storybook with preset primaries (real customer colours, anonymised) and a free colour picker. Choosing a colour sets one value, and CSS derives the rest:

```css
:root[data-preview-primary] {
  --primary-base: var(--preview-primary);
  --primary-bg: var(--preview-primary);
  --primary-fg: light-dark(
    color-mix(in oklch, var(--preview-primary), black 20%),
    color-mix(in oklch, var(--preview-primary), white 30%));
  --primary-bg-subtle: light-dark(
    color-mix(in oklch, var(--preview-primary) 12%, white),
    color-mix(in oklch, var(--preview-primary) 25%, black));
  /* ...the other primary roles from scss/_theme.scss */
}
```

The mix ratios above are placeholders. They MUST match whatever production does with a customer's colour. **ASK** — how production turns the stored colour into tokens today.

Next to the control, show a contrast panel: `bg` against `contrast`, `fg` against the body background, and the focus ring against its surround, each marked pass or fail against WCAG AA. Bootstrap's `color-contrast()` runs only at compile time, so this check needs a small JavaScript function (or CSS `contrast-color()` where browsers support it).

The panel MUST report a failure, not fix it. [Colour](../products/filmmakers-system/foundations/colour.md) says the fix for a failing primary is an **ASK**. A "compare" view that renders the same screen with four primaries side by side makes red and orange primaries next to `danger` and `warning` easy to review.

### Show where production is wrong

Three checks, from cheapest to richest:

1. **Lint in pull requests.** Stylelint (no hex values, no raw colours) and an HTML/template linter plugin generated from `rules/*.json`. It runs in each production repo's CI and annotates the pull request.
2. **Scheduled scan.** A nightly GitHub Action in this repo checks out production, counts component usage, and lists every rule violation. It publishes the result as a "Health" page in Storybook: usage per component, violations per rule, trend over time.
3. **Rendered checks.** Playwright visits key production screens on staging, runs axe-core, and repeats with three sample primaries. Failures link to the rule they break.

Claude Code review can then use the same guidelines for the judgement calls a linter cannot make ("is this really the one primary action?").

### Designers change things and push to GitHub

| Change | Where the designer works | What reaches GitHub |
|---|---|---|
| Token value | Figma, through Tokens Studio | A pull request on `tokens/` |
| Guideline wording or a rule | GitHub web editor, or Claude Code on the web | A pull request on the Markdown and `rules/` |
| New example or component state | Claude Code on the web ("add a loading state to the Buttons story") | A pull request on `stories/` |

Every pull request gets a Storybook preview deploy and a visual diff, so a designer reviews the result in a browser, not a diff. Code owners on `tokens/` and `rules/` stop a change from merging without the right reviewer. On merge, Changesets releases a new package version and Renovate carries it to production.

## Phased plan

| Phase | Scope | Outcome |
|---|---|---|
| 0 — Decide | Answer the ASK items below | Agreed ownership and tools |
| 1 — Tokens | `tokens/` in DTCG, extracted from production and Bootstrap; Style Dictionary build; primary `bg` = `blue-600` | One token source, CSS and Sass outputs |
| 2 — Storybook | Storybook with Bootstrap 6, Buttons stories, the colour and type pages, the primary switcher and contrast panel, a11y addon, GitHub Pages deploy | The design system page exists |
| 3 — Rules | `rules/buttons.json`, the lint plugin, CI in one production repo | Misuse shows up in pull requests |
| 4 — Figma | Tokens Studio sync, component library, Code Connect for Buttons | Figma and code share names and values |
| 5 — AI | `design-system.json`, `llms.txt`, Claude Code plugin, Claude Design connection | Prototypes start from our system |
| 6 — Health | Nightly scan and rendered checks, Health page | We can see drift in production |

Each phase is useful on its own. Phase 2 already answers the primary-colour question for the whole team.

## Unresolved

### Open decisions

**ASK — Token ownership.** Production is authoritative today. Do we keep extracting tokens from production, or move ownership to this repo so production consumes the package?
*Review by: [date]*

**ASK — Customer primary pipeline.** How does production store a customer's primary, and how does it derive the other primary roles (`fg`, `bg-subtle`, `border`, `focus-ring`, `contrast`)? The switcher must copy this exactly.
*Review by: [date]*

**ASK — Production stack.** Which frontend stack and template language does production use? This decides which lint plugin to build (for example ERB, Twig, JSX).
*Review by: [date]*

**ASK — Figma plan.** Enterprise (Variables REST API available) or not (Tokens Studio only)?
*Review by: [date]*

**ASK — Hosting and visibility.** Can the design system site be public on GitHub Pages, or must it be private because it shows customer colours or production screens?
*Review by: [date]*

**ASK — One site or two.** Move the guideline pages into Storybook, or keep this Jekyll site and link to Storybook?
*Review by: [date]*

**ASK — "Accent" name clash.** Bootstrap 6 has a theme colour called `accent` (indigo, with `.theme-accent`). Our [Colour](../products/filmmakers-system/foundations/colour.md) page uses "Accent" for area colours such as the orange client zone. Tokens and Figma variables need one meaning per name. Do we rename our role, or map it onto Bootstrap's `accent`?
*Review by: [date]*

### Watching

**Bootstrap 6 is alpha** (`6.0.0-alpha1` in `bootstrap-v6-dev`). Token names can change between releases. Generating `tokens/bootstrap/` from the Bootstrap source, not copying it by hand, keeps upgrades to a regenerate and a diff.
*Review by: [date]*
*Log:* —

## Sources

- [Bootstrap 6 colour](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/customize/color/) · [Bootstrap 6 theme](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/customize/theme/)
- `denkungsart/bootstrap-v6-dev` — `scss/_theme.scss`, `scss/_colors.scss`, `scss/buttons/_button.scss`, `skills/bootstrap-color-system/SKILL.md`
- [Design Tokens Community Group format](https://www.designtokens.org/)
- [Style Dictionary](https://styledictionary.com/) · [Tokens Studio](https://tokens.studio/)
- [Storybook](https://storybook.js.org/) · [Figma Code Connect](https://www.figma.com/developers/code-connect)
