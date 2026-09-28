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

Tokens Studio shows the code syntax but does not write it into Figma variables. After each export, run the **Filmmakers code syntax** plugin in `code-syntax-plugin/`:

1. In the Figma desktop app: *Plugins → Development → Import plugin from manifest…* and pick `design-system/figma/code-syntax-plugin/manifest.json`. You do this once.
2. After each Tokens Studio export: *Plugins → Development → Filmmakers code syntax*. It reports how many variables it updated.

The plugin's list of names is generated with `tokens.json`, so rerun `npm run figma` before pulling a new version.

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

## Pilot: test the sync before building everything

Build one slice end to end, in a blank Figma file, before building the full library. The slice is the Primary collection and `Buttons/Primary`. Each step has a pass check. Stop at the first failure and fix it before going on.

**Before you start**
- The branch with `design-system/figma/` must be on GitHub. Tokens Studio reads it from there.
- Know your Figma plan (Code Connect needs Organization or Enterprise) and whether you have Tokens Studio Pro (needed for modes).

| Step | Do | Pass when |
|---|---|---|
| 1. Variables in | Tokens Studio → Settings → Add sync provider → GitHub. Repo `denkungsart/product-design-guidelines`, the pilot branch, path `design-system/figma/tokens.json`. Pull, then *Export to Figma* (variables and text styles). | Figma has Palette, Theme, Primary, Size and Typography collections. `primary/bg` is `#006ac9` in Default Blue and `#b61e35` in Red. After running the code syntax plugin, code syntax on `primary/bg` reads `var(--bs-primary-bg)`. |
| 2. One component | On a page named Components, build `Buttons/Primary` as a component set with variant properties `Version` (Label, Icon and label, Disabled, On a brand surface) and `Size` (Small, Extra small, Medium), and a text property `Label`. Bind fill to `primary/bg`, text to `primary/contrast`, radius to `radius/4`. | Switching the frame's Primary mode to Red recolours the button. It matches the library page with the Red preview side by side. |
| 3. Code Connect | Paste the component's link into `code-connect/buttons.figma.ts`, then `npx figma connect publish` from `design-system/figma/`. | Dev Mode on the button shows `<button type="button" class="btn-solid theme-primary btn-sm">…</button>`. |
| 4. Change in Figma | In Tokens Studio, change one value (for example `radius/4` to 8). Push to a new branch and open a pull request. | The pull request changes only that value in `tokens.json`. A developer can see which CSS token (`--bs-radius-4`) it maps to. |
| 5. Change in code | Change one value in `filmmakers.css` (for example the Green preview primary). Run `npm run figma`, commit, push. Pull in Tokens Studio and export again. | Figma updates the variable in place. Components bound to it update, and nothing breaks or duplicates. |
| 6. Names line up | Compare the Figma component names with `components.json`. | Every name matches exactly, including the `Group/Entry` path. |

**What the pilot decides**
- If step 4 is the way designers will want to work, decide who owns token values. Today the CSS is the source and `tokens.json` is generated from it, so a Figma change is a request that a developer applies by hand. To make Figma edits flow straight into code, flip it: make a token file the source and generate `filmmakers.css` from it.
- If steps 1–3 need a plan you do not have, choose between upgrading and keeping Figma read-only (variables in, no Code Connect).

## Open decisions

- **ASK — Figma plan.** Code Connect needs a Figma Organization or Enterprise plan. Writing variables through Figma's REST API instead of Tokens Studio needs Enterprise.
- **ASK — Font in Figma.** The product uses the system font stack, which Figma cannot use. `tokens.json` uses Roboto as a placeholder. Pick the font designers should use.
- **ASK — Which primaries become modes.** The Primary collection has Default Blue, Red and Green, like the library preview. Add real customer colours if designers need them.
