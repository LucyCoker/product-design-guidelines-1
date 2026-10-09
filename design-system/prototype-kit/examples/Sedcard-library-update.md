# Sedcard (Summary view): align with the Library

This file updates the Sedcard (Summary view) prototype to match the Filmmakers System Library (https://claude.ai/artifact/FQt7nwgRNVrfmdwb3Psvkg). Each section below is one component the Sedcard uses: what was decided, then the markup to use. Codes match the Component mapping page.

## How to apply it in Claude Design

1. Open **Sedcard (Summary view).dc.html** in the project and attach this file to the chat.
2. Ask: “Update Sedcard (Summary view).dc.html so every component listed in this file uses the markup, CSS and script given here. Keep the page’s content, data and layout; only replace the components.”
3. Add the CSS below to the page’s `<style>` in `<helmet>` (or to the shared Library style block if the page already has one).
4. Check: the tabs overflow into More, the accordion opens and shows Hide, and the star rating responds to clicks and arrow keys.

## Decisions made in the Library

- **Profile header (CNT-18):** square 160px picture (production’s col-sm-2), placeholder with a person icon when there is no picture. Videos and Pictures are medium outline icon buttons under the picture. The name is the page `h1` at the page title size (`.fs-2xl`). Important information sits in the Important accordion.
- **Accordion (CNT-5):** Bootstrap’s details/summary accordion, small, grey header when closed and white when open, “Show” / “Hide” before the chevron. Important version: `.fg-primary` on the header, rarely.
- **Overflow tabs (NAV-11):** Bootstrap Nav overflow; More sits right after the last visible tab (done in CSS, no script after init).
- **Section toggle bar (FRM-12):** checkboxes that apply at once, no Save button.
- **Definition list (CNT-15):** one component for attributes and activity. Labels are `.fg-3`. Activity “Show N more” uses the Row action style.
- **Section heading (CNT-17):** `h2` at 16px (`.fs-md`), line underneath.
- **Star rating (CNT-19):** a radio group from Bootstrap toggle buttons: 24px targets, body-text stars, hover preview, arrow keys (Home 0, End 5), value text “4 stars”, Clear rating. Read-only at 14px, or 12px in dense lists, in `.fg-3`.
- **Icon-only buttons:** minimum target 24×24px. Outline style when the button stands on its own.

## Components

### CNT-18 Profile header
The top of a profile (Sedcard): picture, name, status, meta line, important information and the profile actions. Used on Sedcard (Summary view).

**Rules**
- Picture on the left: a square (1:1), 160px wide, matching production (a col-sm-2 column, about 165px in the 1170px container). The image fills it with object-fit: cover. With no picture, the placeholder: a --bs-bg-2 box with a .fg-3 person icon, as in the Profile tile. Under it, two icon-only buttons for the profile’s Videos and Pictures (btn-outline theme-secondary btn-icon (outline, so they stand out under the picture) at the medium size (no size class), matching production’s btn-md, each with an aria-label and a tooltip). This is a decided exception to the button sizes (medium is otherwise for empty states and roomy screens): under a large picture, small icon buttons get lost.
- The name is the page’s h1 at the page title size (.fs-2xl, 28–32px, close to production’s 30px), weight 600, never in capitals. A status Badge follows it.
- The meta line (ID, profile type) is .fg-2.
- Important information sits in an Accordion, the Important version.
- Actions are stacked, full width: one primary (Add profile, with its menu), the rest Secondary (btn-outline theme-secondary btn-sm).

**Profile header**

```html
<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;width:100%;max-width:880px"><div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:160px;flex:0 0 160px"><img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23cfe3f5'/%3E%3Cstop offset='1' stop-color='%239fc2e6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='160' height='160' fill='url(%23bg)'/%3E%3Cpath d='M18 160 C22 122 52 112 80 112 C108 112 138 122 142 160 Z' fill='%233d5a80'/%3E%3Cpath d='M64 112 L80 132 L96 112 Z' fill='%23f2d4c2'/%3E%3Crect x='69' y='92' width='22' height='26' rx='8' fill='%23e8bfa6'/%3E%3Cpath d='M44 70 C40 30 66 18 82 18 C104 18 122 34 118 72 C116 92 112 104 106 110 L54 110 C48 102 45 88 44 70 Z' fill='%235b3a29'/%3E%3Cellipse cx='80' cy='66' rx='26' ry='31' fill='%23f2d4c2'/%3E%3Cpath d='M54 58 C56 36 70 30 84 31 C98 32 108 42 106 58 C96 46 80 42 64 50 C60 52 57 55 54 58 Z' fill='%235b3a29'/%3E%3Ccircle cx='70' cy='66' r='2.6' fill='%232b2d42'/%3E%3Ccircle cx='90' cy='66' r='2.6' fill='%232b2d42'/%3E%3Cpath d='M64 58 Q70 55 75 58 M85 58 Q90 55 96 58' stroke='%235b3a29' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3Cpath d='M72 80 Q80 86 88 80' stroke='%23b5655b' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3Cellipse cx='64' cy='76' rx='5' ry='3' fill='%23f0a8a0' opacity='.45'/%3E%3Cellipse cx='96' cy='76' rx='5' ry='3' fill='%23f0a8a0' opacity='.45'/%3E%3C/svg%3E" alt="Helga Bellinghausen" style="display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--bs-radius-5);border:1px solid var(--bs-border-subtle)"><div class="d-flex gap-1"><button type="button" class="btn-outline theme-secondary btn-icon" aria-label="Videos" data-bs-toggle="tooltip" data-bs-title="Videos"><i class="fa-solid fa-video" aria-hidden="true"></i></button><button type="button" class="btn-outline theme-secondary btn-icon" aria-label="Pictures" data-bs-toggle="tooltip" data-bs-title="Pictures"><i class="fa-solid fa-images" aria-hidden="true"></i></button></div></div><div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:200px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h1 class="fs-2xl fw-semibold m-0">Helga Bellinghausen</h1><span class="badge theme-warning badge-subtle"><i class="fa-solid fa-circle-question" aria-hidden="true"></i>In discussion</span></div><div class="fg-2">ID: 1114 | (E) Professional Actor</div><div class="accordion accordion-sm" style="max-width:420px"><details class="accordion-item"><summary class="accordion-header fw-semibold fg-primary">Important information<span class="fm-accordion-label" aria-hidden="true"><span class="fm-accordion-show">Show</span><span class="fm-accordion-hide">Hide</span></span><i class="fa-solid fa-chevron-down accordion-icon" aria-hidden="true"></i></summary><div class="accordion-body">Not available 12 to 14 November.</div></details></div></div><div style="display:flex;flex-direction:column;gap:6px;min-width:140px"><button type="button" class="btn-solid theme-primary btn-sm" style="justify-content:center">Add profile<i class="fa-solid fa-caret-down" aria-hidden="true"></i></button><button type="button" class="btn-outline theme-secondary btn-sm" style="justify-content:center">Send message</button></div></div>
```

**No picture**

```html
<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;width:100%;max-width:880px"><div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:160px;flex:0 0 160px"><div style="width:100%;aspect-ratio:1;background:var(--bs-bg-2);border:1px solid var(--bs-border-subtle);border-radius:var(--bs-radius-5);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user fg-3" aria-hidden="true" style="font-size:3rem"></i></div><div class="d-flex gap-1"><button type="button" class="btn-outline theme-secondary btn-icon" aria-label="Videos" data-bs-toggle="tooltip" data-bs-title="Videos"><i class="fa-solid fa-video" aria-hidden="true"></i></button><button type="button" class="btn-outline theme-secondary btn-icon" aria-label="Pictures" data-bs-toggle="tooltip" data-bs-title="Pictures"><i class="fa-solid fa-images" aria-hidden="true"></i></button></div></div><div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:200px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h1 class="fs-2xl fw-semibold m-0">Helga Bellinghausen</h1><span class="badge theme-warning badge-subtle"><i class="fa-solid fa-circle-question" aria-hidden="true"></i>In discussion</span></div><div class="fg-2">ID: 1114 | (E) Professional Actor</div><div class="accordion accordion-sm" style="max-width:420px"><details class="accordion-item"><summary class="accordion-header fw-semibold fg-primary">Important information<span class="fm-accordion-label" aria-hidden="true"><span class="fm-accordion-show">Show</span><span class="fm-accordion-hide">Hide</span></span><i class="fa-solid fa-chevron-down accordion-icon" aria-hidden="true"></i></summary><div class="accordion-body">Not available 12 to 14 November.</div></details></div></div><div style="display:flex;flex-direction:column;gap:6px;min-width:140px"><button type="button" class="btn-solid theme-primary btn-sm" style="justify-content:center">Add profile<i class="fa-solid fa-caret-down" aria-hidden="true"></i></button><button type="button" class="btn-outline theme-secondary btn-sm" style="justify-content:center">Send message</button></div></div>
```

### CNT-5 Accordion
Hides secondary content behind a header people can open, such as Statistics or Additional information. Bootstrap 6 builds it from native details and summary, so it needs no JavaScript and the open state is announced without ARIA.

**Rules**
- Use Bootstrap’s accordion markup: .accordion.accordion-sm &gt; details.accordion-item &gt; summary.accordion-header + .accordion-body. Add open to start expanded.
- The header is grey (bg-1) while closed and white while open. filmmakers.css sets this through Bootstrap’s own variables (--bs-accordion-btn-bg, --bs-accordion-active-bg), so no extra class is needed. No theme classes.
- .accordion-sm on every accordion, to match the 14px body text and small controls.
- The header is the title, weight 600, then “Show” or “Hide” and a chevron (fa-chevron-down with .accordion-icon) that turns when open. The label is .fm-accordion-label with both words inside; CSS shows the right one, so no script is needed. It is aria-hidden, because the browser already announces open and closed.
- Standalone, for example Statistics, use the accordion as it is. Inside a card, for example Additional information, use .accordion-flush with .border-top, so it runs edge to edge under the card’s content with a line above it.
- Important, rarely: add .fg-primary to the summary so the title and chevron take the primary colour, for information that would get lost on a busy page (for example Important information). At most one per page, and never to decorate.
- Several accordions in a row that should open one at a time share a name on their details.

**Standalone**

```html
<div class="accordion accordion-sm" style="width:100%;max-width:360px"><details class="accordion-item" open="open"><summary class="accordion-header fw-semibold">Statistics<span class="fm-accordion-label" aria-hidden="true"><span class="fm-accordion-show">Show</span><span class="fm-accordion-hide">Hide</span></span><i class="fa-solid fa-chevron-down accordion-icon" aria-hidden="true"></i></summary><div class="accordion-body"><dl class="m-0" style="display:grid;grid-template-columns:1fr auto;gap:4px 16px"><dt class="fw-normal">Profiles</dt><dd class="m-0 text-end">33,622</dd><dt class="fw-normal">Agency</dt><dd class="m-0 text-end">519</dd><dt class="fw-normal">Locations</dt><dd class="m-0 text-end">2,935</dd><dt class="fw-normal">Crew profiles</dt><dd class="m-0 text-end">319</dd><dt class="fw-normal">Companies</dt><dd class="m-0 text-end">29</dd></dl></div></details></div>
```

**Inside a card**

```html
<div class="card" style="width:100%;max-width:640px;overflow:hidden"><div class="card-body"><div class="fs-md fw-semibold">Audition: Round 1</div><div class="fg-3">Self-tape · Invitation only · Deadline 21/10/2023</div></div><div class="accordion accordion-sm accordion-flush border-top"><details class="accordion-item"><summary class="accordion-header fw-semibold">Additional information<span class="fm-accordion-label" aria-hidden="true"><span class="fm-accordion-show">Show</span><span class="fm-accordion-hide">Hide</span></span><i class="fa-solid fa-chevron-down accordion-icon" aria-hidden="true"></i></summary><div class="accordion-body"><div class="fw-semibold mb-1">Upload requirements</div><ul class="mb-3 ps-3"><li>Picture: Face, Profile (required)</li><li>Video: no requirements</li></ul><div class="fw-semibold mb-1">Description of the Audition</div><p class="m-0 fg-2">Production company: Gorilla Guts · Direction: Sam Johnson · Genre: Horror</p></div></details></div></div>
```

**Important**

```html
<div class="accordion accordion-sm" style="width:100%;max-width:360px"><details class="accordion-item"><summary class="accordion-header fw-semibold fg-primary">Important information<span class="fm-accordion-label" aria-hidden="true"><span class="fm-accordion-show">Show</span><span class="fm-accordion-hide">Hide</span></span><i class="fa-solid fa-chevron-down accordion-icon" aria-hidden="true"></i></summary><div class="accordion-body"><p class="m-0">Applicants must be available for all three shooting days, 12 to 14 November, in Berlin.</p></div></details></div>
```

### NAV-11 Overflow tabs
Tabs that do not fit move into a More menu, so every tab stays reachable without scrolling sideways. Bootstrap 6 Nav overflow; it watches the width of its wrapper, not the window. Used on Sedcard (Summary view).

**Rules**
- Wrap the .nav.nav-tabs in .nav-overflow with data-bs-toggle="nav-overflow". Bootstrap moves the tabs that do not fit into a More menu (Menu) and keeps the active tab’s state.
- The toggle reads “More” with the ellipsis after the text: data-bs-icon-placement="end" and an &lt;i class="fa-solid fa-ellipsis" data-bs-overflow-icon&gt; in the wrapper.
- More sits right after the last visible tab, not at the far end. filmmakers.css sets .nav-overflow-item { margin-inline-start: 0 }, overriding Bootstrap’s auto, so no script is needed after init.

**Overflow tabs**

```html
<div class="nav-overflow" data-bs-toggle="nav-overflow" data-bs-icon-placement="end" style="max-width:420px"><i class="fa-solid fa-ellipsis" data-bs-overflow-icon aria-hidden="true"></i><ul class="nav nav-tabs"><li class="nav-item"><a class="nav-link active" href="#" aria-current="page">Summary</a></li><li class="nav-item"><a class="nav-link" href="#">Input</a></li><li class="nav-item"><a class="nav-link" href="#">Media</a></li><li class="nav-item"><a class="nav-link" href="#">Agencies</a></li><li class="nav-item"><a class="nav-link" href="#">Assignments</a></li><li class="nav-item"><a class="nav-link" href="#">Reviews</a></li><li class="nav-item"><a class="nav-link" href="#">History</a></li></ul></div>
```

### FRM-12 Section toggle bar
Shows and hides the sections of a page. It applies at once, so it never sits in a form with a Save button. Used on Sedcard (Summary view).

**Rules**
- A fieldset on --bs-bg-1 with a hairline border and --bs-radius-5. The legend is visually hidden (“Sections shown on this page”).
- Each section is a Checkbox in a .form-field, in a grid of repeat(auto-fill, minmax(140px, 1fr)), so it wraps.
- Ticking or unticking applies straight away. No Save or Apply button.

**Section toggle bar**

```html
<fieldset style="margin:0;border:1px solid var(--bs-border-subtle);border-radius:var(--bs-radius-5);background:var(--bs-bg-1);padding:10px 16px;width:100%;max-width:640px"><legend class="visually-hidden">Sections shown on this page</legend><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px 16px"><div class="form-field"><input type="checkbox" class="check check-sm" id="sec-1" checked="checked"><label for="sec-1">Contact</label></div><div class="form-field"><input type="checkbox" class="check check-sm" id="sec-2" checked="checked"><label for="sec-2">Assignments</label></div><div class="form-field"><input type="checkbox" class="check check-sm" id="sec-3"><label for="sec-3">Reviews</label></div><div class="form-field"><input type="checkbox" class="check check-sm" id="sec-4" checked="checked"><label for="sec-4">Agencies</label></div><div class="form-field"><input type="checkbox" class="check check-sm" id="sec-5"><label for="sec-5">History</label></div></div></fieldset>
```

### CNT-15 Definition list
Label and value pairs in two columns: attributes, details, or a dated log of activity. Replaces CNT-8, which was removed in review, and the activity list (CNT-16). Used on Sedcard (Summary view).

**Rules**
- A dl in a two-column grid: labels minmax(120px, 180px), values minmax(0, 1fr). Show only rows that have a value.
- Labels (dt) are weight 400 in .fg-3; values (dd) are body text, the same size. De-emphasis is colour only. .fg-3 is for every label and value list; it passes WCAG AA on white and grey (5.9:1 on white, 5.2:1 on bg-2).
- For activity, the label is the timestamp and author in 12px .fs-xs .fg-3, newest first. Long lists show the first 5 and a “Show N more” toggle in the Row action style (btn-text theme-primary btn-xs) with a caret.

**Attributes**

```html
<dl class="m-0" style="display:grid;grid-template-columns:minmax(120px,180px) minmax(0,1fr);gap:8px 16px;max-width:560px"><dt class="fw-normal fg-3">Eye color</dt><dd class="m-0">blue-green</dd><dt class="fw-normal fg-3">Height (cm)</dt><dd class="m-0">167</dd><dt class="fw-normal fg-3">Stature</dt><dd class="m-0">slim</dd></dl>
```

**Activity**

```html
<div style="display:flex;flex-direction:column;gap:8px;max-width:560px"><dl class="m-0" style="display:grid;grid-template-columns:minmax(120px,180px) minmax(0,1fr);gap:8px 16px;max-width:560px"><dt class="fw-normal fs-xs fg-3">26/04/2023, 12:26 CEST<br>by Constantine Coker</dt><dd class="m-0">Added 5 star Rating</dd><dt class="fw-normal fs-xs fg-3">26/04/2023, 12:26 CEST<br>by Constantine Coker</dt><dd class="m-0">Rating removed</dd></dl><div><button type="button" class="btn-text theme-primary btn-xs">Show 17 more events<i class="fa-solid fa-caret-down" aria-hidden="true"></i></button></div></div>
```

### CNT-17 Section heading
One heading per page section, with an optional action on the same line. Used on Sedcard (Summary view).

**Rules**
- An h2 at 16px (.fs-md), weight 600, with a 1px --bs-border-color line under the row. 16px is enough above 14px content. Other sizes can be added as separate Section heading versions if a page needs them.
- A trailing icon action (Tertiary, icon only, with a tooltip) or a filter (Simple bar) sits on the same line, right aligned.

**Section heading**

```html
<div style="display:flex;align-items:center;gap:8px;padding-bottom:4px;border-bottom:1px solid var(--bs-border-color);width:100%;max-width:640px"><h2 class="fs-md fw-semibold m-0" style="flex:1">Agencies</h2><button type="button" class="btn-text theme-secondary btn-xs btn-icon" aria-label="Add agency" data-bs-toggle="tooltip" data-bs-title="Add agency"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></div>
```

### CNT-19 Star rating
A rating from 1 to 5. Editable on a profile, read-only in lists and summaries. Used on Sedcard (Summary view).

**Rules**
- Editable: a radio group built from Bootstrap’s toggle buttons. The stars sit in a role="radiogroup" with aria-labelledby pointing at a visible label that says what is rated (for example “Text fluency”). Each star is a label.btn-check.btn-text.theme-secondary.btn-xs.btn-icon holding a radio with aria-label="n out of 5 stars".
- Keyboard: Tab moves into the group and out to the next field. Right and Up add one star, Left and Down remove one (down to 0), Home sets 0 and End sets 5. The rating applies as it changes; no confirm step. Bootstrap’s focus ring shows on the focused star.
- The current value shows as text after the stars (“4 stars”, “1 star”, “0 stars” when cleared; .fg-2) in an aria-live="polite" region, so screen readers announce each change. The radios keep their full names (“4 out of 5 stars”), so the scale is still announced. No tooltips on the stars: each radio already has its name, and tooltips only appear on mouse hover.
- Fill shows the state: every star up to the chosen one is filled (fa-solid), the rest are outline (fa-regular), and hovering previews a rating. filmmakers.css does this with CSS only (.fm-rating). Never colour alone. Stars are --bs-fg-body, the body text colour (filmmakers.css sets it on .fm-rating), which passes 15:1 on white and grey.
- Stars use btn-xs, a 24px target with no gap between stars. That meets the WCAG 2.2 AA minimum (2.5.8, 24 by 24px) and keeps the control compact for desktop, where most people use it. Do not go smaller. The star icons are the body text size (14px), as in production, in both the editable and the read-only rating.
- When a rating is set, Clear rating follows the value (Tertiary, btn-text theme-secondary btn-sm); it hides when there is no rating.
- In a form: help text and errors are linked with aria-describedby, an error sets aria-invalid="true", and a required rating sets aria-required="true" on the radiogroup (see Validation).
- Read-only: the label, then star icons in a span.fg-3 (lighter than the editable stars, so a read-only rating does not look clickable; 5.2:1 or more on white and grey) with a title and a visually hidden “n out of 5 stars”. Two sizes: 14px (body text) by default, and 12px (.fs-xs on the whole rating, label included) in dense lists and tables. Keep it on one line (.text-nowrap).
- Left aligned in its row, so nothing moves when the value text or Clear rating changes.

**Editable**

```html
<div style="width:100%"><div class="fm-rating d-flex align-items-center gap-2"><span id="rating-demo-label">Rating</span><div class="d-flex" role="radiogroup" aria-labelledby="rating-demo-label"><label class="btn-check btn-text theme-secondary btn-xs btn-icon"><input type="radio" name="rating-demo" value="1" aria-label="1 out of 5 stars" autocomplete="off"><i class="fa-regular fa-star" aria-hidden="true"></i></label><label class="btn-check btn-text theme-secondary btn-xs btn-icon"><input type="radio" name="rating-demo" value="2" aria-label="2 out of 5 stars" autocomplete="off"><i class="fa-regular fa-star" aria-hidden="true"></i></label><label class="btn-check btn-text theme-secondary btn-xs btn-icon"><input type="radio" name="rating-demo" value="3" aria-label="3 out of 5 stars" autocomplete="off"><i class="fa-regular fa-star" aria-hidden="true"></i></label><label class="btn-check btn-text theme-secondary btn-xs btn-icon"><input type="radio" name="rating-demo" value="4" aria-label="4 out of 5 stars" autocomplete="off" checked="checked"><i class="fa-regular fa-star" aria-hidden="true"></i></label><label class="btn-check btn-text theme-secondary btn-xs btn-icon"><input type="radio" name="rating-demo" value="5" aria-label="5 out of 5 stars" autocomplete="off"><i class="fa-regular fa-star" aria-hidden="true"></i></label></div><span class="fg-2" data-rating-value aria-live="polite">4 stars</span><button type="button" class="btn-text theme-secondary btn-sm" data-rating-clear>Clear rating</button></div></div>
```

**Read-only**

```html
<div style="width:100%"><span class="d-inline-flex align-items-center gap-2 text-nowrap">Briefing aptitude:<span class="fg-3" title="4 out of 5 stars" style="display:inline-flex;gap:2px"><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-regular fa-star" aria-hidden="true"></i></span><span class="visually-hidden">4 out of 5 stars</span></span></div>
```

**Read-only, small**

```html
<div style="width:100%"><span class="d-inline-flex align-items-center gap-2 text-nowrap fs-xs">Briefing aptitude:<span class="fg-3" title="4 out of 5 stars" style="display:inline-flex;gap:2px"><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-solid fa-star" aria-hidden="true"></i><i class="fa-regular fa-star" aria-hidden="true"></i></span><span class="visually-hidden">4 out of 5 stars</span></span></div>
```

## CSS to add

These come from the Library’s theme layer (`design-system/assets/filmmakers.css`).

```css
/* ---------------------------------------------------------------------------
 * Accordion colours (CNT-5)
 *
 * Grey (bg-1) header while closed, white while open, through Bootstrap's own
 * accordion variables.
 * ------------------------------------------------------------------------ */
.accordion {
  --bs-accordion-btn-bg: var(--bs-bg-1);
  --bs-accordion-active-bg: var(--bs-bg-body);
}

/* ---------------------------------------------------------------------------
 * Accordion Show / Hide label
 *
 * Bootstrap's accordion (details/summary) with the product's "Show" or
 * "Hide" text before the chevron. CSS only: the label follows the native
 * open state, so no script is needed. The label is aria-hidden because the
 * browser already announces whether the details element is open.
 * ------------------------------------------------------------------------ */
.accordion-header .fm-accordion-label {
  margin-inline-start: auto;
  padding-inline-end: .5rem;
  font-weight: var(--bs-font-weight-normal);
  color: var(--bs-fg-2);
}
.accordion-header .fm-accordion-label + .accordion-icon { margin-inline-start: 0; }
.accordion-item[open] > .accordion-header .fm-accordion-show,
.accordion-item:not([open]) > .accordion-header .fm-accordion-hide { display: none; }

/* ---------------------------------------------------------------------------
 * Overflow tabs (NAV-11)
 *
 * Bootstrap pushes the More item to the far end (margin-inline-start: auto).
 * The product keeps it right after the last visible tab.
 * ------------------------------------------------------------------------ */
.nav-overflow-item { margin-inline-start: 0; }

/* ---------------------------------------------------------------------------
 * Star rating (CNT-19)
 *
 * A radio group built from Bootstrap's .btn-check toggle buttons, so the
 * keyboard (arrow keys) and screen readers get one choice out of five. CSS
 * fills every star up to the checked one (Font Awesome solid is weight 900,
 * regular 400) and previews on hover. The checked star gets no background
 * or border; the focus ring still shows for keyboard users.
 * ------------------------------------------------------------------------ */
.fm-rating .btn-check { --bs-btn-color: var(--bs-fg-body); --bs-btn-hover-color: var(--bs-fg-body); --bs-btn-hover-bg: transparent; --bs-btn-active-bg: transparent; --bs-btn-active-border-color: transparent; --bs-btn-active-color: var(--bs-fg-body); }
.fm-rating :where(.btn-check) > i { font-weight: 400; font-size: var(--bs-body-font-size); }
/* :where() keeps the chosen fill weaker than the hover preview below. */
.fm-rating :where(.btn-check:has(input:checked), .btn-check:has(~ .btn-check > input:checked)) > i { font-weight: 900; }
.fm-rating:hover .btn-check > i { font-weight: 400; }
.fm-rating .btn-check:hover > i,
.fm-rating .btn-check:has(~ .btn-check:hover) > i { font-weight: 900; }
.fm-rating [data-rating-clear][hidden] { display: none; }
```

## Script

Nav overflow and tooltips start from Bootstrap’s data attributes. If the page draws its content after Bootstrap loads, start them once it has rendered:

```js
document.querySelectorAll('[data-bs-toggle="nav-overflow"]').forEach((el) => bootstrap.NavOverflow.getOrCreateInstance(el))
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getOrCreateInstance(el))
```

Star rating: the value text, arrow keys and Clear rating (from the Library’s `app.js`; `$$` is `document.querySelectorAll` as an array):

```js
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
// Star rating (CNT-19): the stars are radios, filled by CSS. Arrow keys step
// one star without wrapping (Left at 1 goes to 0), Home is 0, End is 5. The
// value text is a polite live region; Clear rating unchecks the radios.
function setupRatingDemo() {
  $$('.fm-rating').forEach((root) => {
    const radios = [...root.querySelectorAll('input[type="radio"]')]
    const value = root.querySelector('[data-rating-value]')
    const current = () => Number(radios.find((r) => r.checked)?.value || 0)
    const show = () => {
      const n = current()
      if (value) value.textContent = `${n} ${n === 1 ? 'star' : 'stars'}`
      const clear = root.querySelector('[data-rating-clear]')
      if (clear) clear.hidden = n === 0
    }
    const set = (n) => {
      radios.forEach((r) => { r.checked = Number(r.value) === n })
      ;(radios[Math.max(n, 1) - 1]).focus()
      show()
    }
    root.addEventListener('change', show)
    root.addEventListener('keydown', (e) => {
      if (!e.target.matches('input[type="radio"]')) return
      const n = current()
      const keys = { ArrowRight: n + 1, ArrowUp: n + 1, ArrowLeft: n - 1, ArrowDown: n - 1, Home: 0, End: radios.length }
      if (!(e.key in keys)) return
      e.preventDefault()
      set(Math.min(radios.length, Math.max(0, keys[e.key])))
    })
    root.querySelector('[data-rating-clear]')?.addEventListener('click', () => set(0))
    show()
  })
}
setupRatingDemo()
```
