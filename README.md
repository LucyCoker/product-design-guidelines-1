# Product design guidelines

> **Status: Early draft** — published for review and expanded as product decisions are made.

Shared guidance for how our products should look, behave, and communicate, together with product-specific values and component choices.

This repository is not a replacement for Bootstrap or the production frontend. It is the product-policy layer that explains which available options we use, when we use them, and why.

## Current scope

The first product covered is [Filmmakers System](products/filmmakers-system/README.md), using Bootstrap 6.

| Area | Current coverage | Status |
|---|---|---|
| Shared patterns | Button hierarchy; destructive actions | Draft |
| Filmmakers System foundations | Colour; typography | Draft |
| Filmmakers System components | Buttons | Draft |
| Other patterns, foundations, and components | Not documented yet; use the product's Bootstrap version as the fallback | Not started |

All detailed guideline pages are currently drafts. Some include **ASK** items, unassigned owners, and review dates that still need to be agreed. The repository should become more complete as decisions are reviewed and recorded.

## How this relates to Bootstrap 6

Use this repository and the Bootstrap 6 design system together:

- The production frontend is authoritative for components and tokens that actually exist.
- Bootstrap 6 defines the available primitives, markup, component behaviour, and defaults.
- These guidelines define which of those options a product permits and how they should be applied.
- A product rule here takes precedence over a generic Bootstrap example. Where this repository is silent, use the Bootstrap default.
- If a guideline conflicts with the production implementation, flag the discrepancy. Do not invent a third approach.

## Who this is for

- **Product managers and designers** use the guidelines when shaping flows and mockups.
- **Developers** use them when implementing and reviewing product UI.
- **AI agents** use the same Markdown as design context; start with [AGENTS.md](AGENTS.md). Claude loads the same instructions through [CLAUDE.md](CLAUDE.md).

A future public site can render these same files so that the human-readable and machine-readable guidance stays in sync.

## Repository structure

```text
.
├── AGENTS.md
├── CLAUDE.md
├── patterns/
│   ├── button-hierarchy.md
│   └── destructive-actions.md
└── products/
    └── filmmakers-system/
        ├── README.md
        ├── foundations/
        │   ├── colour.md
        │   └── typography.md
        └── components/
            └── buttons.md
```

Patterns describe shared behaviour and roles. Each product's foundations and components supply the values and supported Bootstrap combinations for that product.

## Reading the rules

Rules use **MUST**, **SHOULD**, and **MAY** so they can be checked during design and review.

Each detailed page has a status:

| Status | Meaning |
|---|---|
| Draft | Follow the current rule, but expect it to change during review. |
| Approved | Agreed and enforced in review. |
| Banned | Must not be used and should be removed when encountered. |

Where a page says **ASK**, the decision has not been made. Do not infer it. An unresolved ASK is a valid outcome; a guessed answer is not.

## Contributing

Edit the relevant Markdown file and open a pull request. Record the decision and its reasoning, update the page status where appropriate, and keep unresolved questions visible until the page owner decides them.
