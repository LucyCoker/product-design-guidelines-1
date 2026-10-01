# Component mapping: Accordion (CNT-5) update

The Accordion row uses Bootstrap 6’s accordion, small: a grey header while closed and white while open, flush inside cards, with the product’s “Show” / “Hide” label before the chevron. In rare cases the title takes the primary colour (`.fg-primary`) for important information.

## 1. Add or replace the CSS

At the end of the Library `<style>` block in the page’s `<helmet>` (the block that starts “Filmmakers System Library theme layer”), add this. If an “Accordion Show / Hide label” section is already there, replace it with this:

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
```

## 2. Replace the CNT-5 row

Find the row whose badge reads **CNT-5** (in the Content section) and replace that whole row, from its opening `<div style="display:grid…">` to its closing `</div>`, with:

```html
<div style="display:grid;grid-template-columns:76px minmax(150px,0.85fr) minmax(190px,1fr) minmax(280px,1.35fr);gap:20px;align-items:start;padding:var(--row-pad) 24px;border-bottom:1px solid var(--bs-border-subtle)">
<span class="badge theme-secondary badge-subtle" style="justify-self:start">CNT-5</span>
<div><div>expander</div><code style="font-size:12px;color:var(--bs-fg-3)">.collapse / .in</code></div>
<div><div style="font-weight:600"><a href="https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/accordion/" target="_blank" rel="noreferrer" title="https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/accordion/" style="color:inherit;text-decoration:underline;text-decoration-color:var(--bs-border-color);text-underline-offset:2px">Accordion</a></div><code style="font-size:12px;color:var(--bs-fg-3)">details.accordion-item &gt; summary.accordion-header + .fm-accordion-label + .accordion-body</code><div style="font-size:12px;color:var(--bs-fg-3);margin-top:4px">Replace. Hides secondary content behind a header people can open, such as Statistics or Additional information. Bootstrap 6 builds it from native details and summary, so it needs no JavaScript and the open state is announced without ARIA.</div><div style="font-size:12px;margin-top:6px"><a href="https://claude.ai/artifact/FQt7nwgRNVrfmdwb3Psvkg#cnt-5" target="_blank" rel="noreferrer">In the Library<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" style="font-size:10px;margin-inline-start:4px"></i></a><span style="color:var(--bs-fg-3)"></span></div></div>
<div style="min-width:0;overflow-x:auto"><div class="accordion accordion-sm" style="width:100%;max-width:360px"><details class="accordion-item" open="open"><summary class="accordion-header fw-semibold">Statistics<span class="fm-accordion-label" aria-hidden="true"><span class="fm-accordion-show">Show</span><span class="fm-accordion-hide">Hide</span></span><i class="fa-solid fa-chevron-down accordion-icon" aria-hidden="true"></i></summary><div class="accordion-body"><dl class="m-0" style="display:grid;grid-template-columns:1fr auto;gap:4px 16px"><dt class="fw-normal">Profiles</dt><dd class="m-0 text-end">33,622</dd><dt class="fw-normal">Agency</dt><dd class="m-0 text-end">519</dd><dt class="fw-normal">Locations</dt><dd class="m-0 text-end">2,935</dd><dt class="fw-normal">Crew profiles</dt><dd class="m-0 text-end">319</dd><dt class="fw-normal">Companies</dt><dd class="m-0 text-end">29</dd></dl></div></details></div></div>
</div>
```

## What changed

- Bootstrap 6 accordion: `details.accordion-item` > `summary.accordion-header` + `.accordion-body`, small (`.accordion-sm`). No JavaScript.
- Grey header (`bg-1`) while closed, white while open, set through Bootstrap’s own variables.
- Inside a card (for example Additional information): `.accordion-flush` with `.border-top`.
- “Show” / “Hide” before the chevron, switched by the CSS above. Hidden from screen readers, which already announce open and closed.
- Important, rarely: `.fg-primary` on the `summary`, for information that would get lost on a busy page. At most one per page.
