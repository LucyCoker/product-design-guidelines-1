# Filmmakers System — Colour

`Status: Draft` · `Owner: [name]`

Foundational page for Filmmakers System. How colour carries meaning in this product, and how much of it to use.

---

## We use the Bootstrap 6 colour system

Filmmakers System uses the Bootstrap 6 colour system and its theme token naming. Values, scales and the naming convention come from Bootstrap — this page does not repeat them.

What this means in practice:

- Colour MUST be applied via theme tokens. Hex values MUST NOT appear in component or page CSS.
- Semantic values MUST NOT be overridden.
- A colour that isn't in the theme doesn't exist. Adding one requires a proposal.

## The per-user primary

Primary is not one value in Filmmakers System. Each user's primary comes from their own configuration. Where none is set, it falls back to the Bootstrap default.

Everything below is written so it holds whatever primary resolves to:

- Primary MUST NOT be relied on to mean *safe*, *go*, or *confirm*. It means *most important thing here*, nothing more.
- Where a user's primary sits close to a semantic colour — a red or orange primary — danger and warning MUST carry a second signal (icon, weight, or placement), not hue alone.
- Contrast MUST hold for every primary a user can end up with, not just the default. With a fixed primary you check once at design time; with a per-user primary there is no single value to check, so the check has to happen wherever the value is set.

## Colour roles

Four roles in use. Each does a different job. The final row is listed for reference only.


| Colour           | Description                                                                                                   | Usage                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Primary**      | Set per user. If not set, defaults to the Bootstrap primary                                                   | Main brand colour, for primary actions                                                                      |
| **Secondary**    | Bootstrap default secondary palette                                                                           | The bulk of the user interface                                                                              |
| **Status**       | Bootstrap semantic palette — danger, warning, success, info                                                   | States only. Never actions or decoration                                                                    |
| **Accent**       | A Bootstrap palette colour assigned to a specific area — e.g. orange for the client area                      | Marks a distinct area. Rarely, adds meaning where the other roles cannot. Chrome and context, never actions |
| *Brand personas* | *Used by other Filmmakers products and marketing surfaces. Four personas: actor, agencies, casting, crew* | *Not used in Filmmakers System. Listed here for reference only*                                           |


### Primary

Primary marks where the user acts. Its power comes entirely from scarcity.

**Use the smallest amount of primary that still makes the next action obvious.**

As a direction of travel, the 60–30–10 rule puts the emphasis colour at around 10% of an interface. Our screens are denser than that today, so treat 10% as where we are heading rather than a threshold to pass. On any screen you are working on, the question is whether primary could be doing less.

- A screen MUST have at most one primary-emphasis action. Where two compete, either pick the one most users take, or make both secondary.
- Primary MUST NOT be used to mean *new*, *recommended*, or *important* on anything that isn't an action.
- Primary MUST NOT be used decoratively — not on section headings, borders, or dividers.
- A dense screen with many actions is a hierarchy problem, not a colour problem. Fix the screen.

The test: **if you removed all the primary from a screen, would it still be obvious what to do next?** If yes, there was too much. If no, it's doing its job.

### Secondary

Secondary is the product. Text, borders, surfaces, backgrounds, and the great majority of controls are secondary.

This feels counterintuitive — a mostly-neutral interface can look unfinished next to a colourful one. It isn't. Secondary is what makes the coloured things visible. A screen where everything is coloured is a screen with no hierarchy.

### Status

Status colour reports state: danger, warning, success, info. Bootstrap calls these the semantic colours.

Its value is that it lets a user think about the situation rather than the colour — *is this a success, a warning, or an error?* That only holds if each colour keeps one meaning.

- Status colour MUST NOT be used decoratively. A coloured element implies a state, and users will read it as one.
- Status colour MUST NOT be used for emphasis. Red because something feels important is how red stops meaning dangerous.
- Status meanings are fixed. They MUST NOT vary by area, persona, or user.
- Success reports a state. It MUST NOT be used to make an action feel positive.

### Accent

Accent adds meaning to something where secondary, status and primary are not enough. This MUST be very rare.

- Accent MUST be a Bootstrap palette colour. Custom values MUST NOT be introduced.
- Accent MUST be applied consistently to the same kind of element or area across the product. Applied once on one screen it is decoration, not meaning.
- Accent is **chrome and context** — headers, edges, area furniture. It MUST NOT be applied to actions. Buttons inside an accented area follow the normal roles.
- Accent MUST NOT be the only signal of what it means. It must also be stated in text.
- Where an accent sits close to a status colour — orange against warning — that status MUST carry a second signal.
- Focus indicators MUST remain visible against accented backgrounds.

#### Filmmakers System accents


| Accent      | Colour           | Usage                                                                                       |
| ----------- | ---------------- | ------------------------------------------------------------------------------------------- |
| Client zone | Bootstrap orange | Marks areas of Selections where clients or other users outside the team can see the content |


### Brand personas

**Brand persona colours MUST NOT be used in Filmmakers System.** They compete with the per-user primary and with area accents.

## Accessibility

Filmmakers System meets **WCAG 2.1 Level AA**.

### Colour is never the only signal

Meaning MUST be carried by at least two of: colour, icon, and text.

This is a requirement, not a preference — and it protects the product for everyone, since a colour-only signal also fails on a poor monitor, in sunlight, and for the roughly 1 in 12 men with a colour vision deficiency.

### Contrast


| What                                                        | Minimum |
| ----------------------------------------------------------- | ------- |
| Body and UI text                                            | 4.5:1   |
| Large text (18pt+, or 14pt bold)                            | 3:1     |
| Interactive controls, focus indicators, meaningful graphics | 3:1     |


- Contrast MUST be verified against the actual background, including accented areas.
- A primary that fails contrast as a button background MUST NOT be used as-is. **ASK** — the fix is a decision, not an automatic substitution.
- Not every Bootstrap status default passes as text on white. Use the text variants where the docs provide them.

## Where colour usage is decided

This page defines roles and proportion. How each role is applied to a given situation lives in the Patterns — which variant carries primary, where semantic colour appears in messaging, how states are signalled in lists. See specific component documents for product markup.

## Unresolved

### Open decisions

none

### Watching

**How little primary is enough** — we are reducing primary over time rather than hitting a number today. Note screens where cutting it back helped or hurt, so we can set a realistic target from our own product.
*Review by: [date]*
*Log:* —

## Sources

- [Bootstrap colour](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/customize/color/) · [Bootstrap theme](https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/customize/theme/)
- [WCAG 2.1 — Contrast (Minimum) 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WCAG 2.1 — Use of Colour 1.4.1](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)
- [Using colour to enhance design](https://www.nngroup.com/articles/color-enhance-design/) — NN/g
- [Types of colour palettes](https://www.figma.com/resource-library/types-of-color-palettes/#step-3-use-the-60-30-10-rule) — Figma
- [UI colour palette](https://ixdf.org/literature/article/ui-color-palette#2_follow_the_60-30-10_rule-5) — Interaction Design Foundation
- [The 60-30-10 rule in UI](https://hype4.academy/articles/design/60-30-10-rule-in-ui)
