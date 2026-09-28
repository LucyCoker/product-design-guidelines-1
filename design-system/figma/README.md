# Figma

How the component library and Figma stay in sync. The library (this repo) is the source; Figma follows it.

| What | File | How it gets into Figma |
|---|---|---|
| Variables (colour, spacing, radius, type) | `tokens.json` | Tokens Studio plugin, synced with this GitHub repo |
| Component names and variants | `components.json` | Build the Figma library to this list |
| Component → code links | `code-connect/*.figma.ts` | Figma Code Connect (`npx figma connect publish`) |

## 1. Variables

`tokens.json` is generated. Do not edit it by hand.

```sh
npm install --prefix design-system
npm run figma --prefix design-system
```

The script loads `bootstrap.min.css` and `filmmakers.css` in a browser and reads the final value of every token. The colours in Figma are the colours the product renders, including every `color-mix()` primary shade.

It produces these Figma collections:

| Collection | Modes | Contents |
|---|---|---|
| Palette | one | All Bootstrap hues, steps 025–975, white, black |
| Theme | one | Secondary and status roles, surfaces, text, borders, always-blue controls, client zone |
| Primary | Default Blue, Red, Green | The nine primary roles for each preview primary |
| Size | one | Spacing and radius |
| Typography | one | Weights, sizes and text styles h1–caption |

Every variable carries its CSS name as code syntax (for example `var(--bs-primary-bg)`), so Dev Mode shows the same name developers use.

**In Figma:** install Tokens Studio, choose GitHub as the sync provider, and point it at this repo, branch `main`, file `design-system/figma/tokens.json`. Then use *Styles & Variables → Export to Figma*. The Primary modes come from Tokens Studio themes, which may need a Tokens Studio Pro licence; without it, each primary set exports as its own collection. When `tokens.json` changes, pull in Tokens Studio and export again.

Designers can also change a token in Tokens Studio and push. That opens a pull request, which a developer reviews against `filmmakers.css` before merging.

## 2. Component names

`components.json` lists one Figma component for every entry in the library:

- **Figma page:** the library section (Foundations, Components, Organisms, App shell).
- **Component name:** `Group/Entry`, for example `Buttons/Primary` or `Menus/Overflow menu`.
- **Variant property `Version`:** the versions shown on the library page, for example `Label`, `Icon and label`, `Disabled`.

Keep the names exactly as listed. That is what lets the library, Code Connect and anyone searching Figma find the same thing.

## 3. Code Connect

Code Connect makes Dev Mode show our Bootstrap markup for a component. `code-connect/buttons.figma.ts` is a starter for the Buttons page.

1. Copy each component's link from Figma and replace `FILE_KEY` and `NODE_ID`.
2. Give each button component the variant properties `Version` and `Size` from `components.json`, and a text property `Label`.
3. Run `npx figma connect publish` from `design-system/figma/` with a Figma access token.

## Open decisions

- **ASK — Figma plan.** Code Connect needs a Figma Organization or Enterprise plan. Writing variables through Figma's REST API instead of Tokens Studio needs Enterprise.
- **ASK — Font in Figma.** The product uses the system font stack, which Figma cannot use. `tokens.json` uses Roboto as a placeholder. Pick the font designers should use.
- **ASK — Which primaries become modes.** The Primary collection has Default Blue, Red and Green, like the library preview. Add real customer colours if designers need them.
