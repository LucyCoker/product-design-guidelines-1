// Working Complex search and filter bar for the library, built from the
// Search and filter prototype (FilterBar.dc.html). It renders the same Bootstrap 6
// markup as the static examples, so it doubles as a reference for behaviour:
// search, three inline filters, More filters, Clear filters, Sort by, and a
// count row, all applied on change. More filters expands a row of filters
// inside the card, as the production actor search does, not a popover.
// The results are Profile tiles (CNT-10).

import * as bootstrap from './bootstrap.bundle.min.js'

const ALL = 'All'
const LANGUAGES = ['English', 'German', 'French', 'Spanish', 'Italian', 'Polish', 'Portuguese']
const ROLES = ['Lead: Georgie (Adult)', 'Lead: Georgie (Teen)', 'Supporting: Mira', 'Day player: Officer']
const DEFS = [
  { key: 'role', label: 'Role', width: 230, options: ROLES },
  { key: 'language', label: 'Language', width: 190, multi: true, options: LANGUAGES },
  { key: 'age', label: 'Playing age', width: 180, options: ['16–20', '21–35', '36–50', '51–65'] },
  { key: 'location', label: 'Location', width: 170, options: ['Berlin', 'Hamburg', 'Munich', 'Cologne'] },
  { key: 'agency', label: 'Agency', width: 200, options: ['Represented', 'Not represented'] },
  { key: 'showreel', label: 'Showreel', width: 160, options: ['Yes', 'No'] }
]
const MAX_INLINE = 3
// Widths from the prototype, used to decide how many filters fit inline.
const GAP = 12
const SEARCH_W = 240
const MORE_W = 170
const SORT_W = 202

// How many filters fit beside search and Sort by. While any filter is left
// over, the More filters button must fit too. Clear filters sits in the chips
// row, so it never takes bar space.
function fitCount(avail) {
  let used = SEARCH_W + GAP + SORT_W
  let n = 0
  for (let i = 0; i < DEFS.length && i < MAX_INLINE; i++) {
    const withThis = used + GAP + DEFS[i].width
    const moreLeft = i + 1 < DEFS.length ? GAP + MORE_W : 0
    if (withThis + moreLeft > avail) break
    used = withThis
    n = i + 1
  }
  return n
}
const SORTS = [
  { label: 'Last name', key: 'last' },
  { label: 'First name', key: 'first' },
  { label: 'Date applied', key: 'applied', dir: 'desc' }
]
// Invented sample profiles. photo: false shows the placeholder.
const PROFILES = [
  ['Markus', 'John', 0, 'German', '51–65', 'Berlin', 'Represented', 'Yes', true],
  ['Helga', 'Bellinghausen', 0, 'German', '51–65', 'Hamburg', 'Not represented', 'No', false],
  ['Lena', 'Brandt', 1, 'English', '16–20', 'Berlin', 'Represented', 'Yes', true],
  ['Jonas', 'Weber', 2, 'German', '21–35', 'Munich', 'Represented', 'Yes', true],
  ['Aylin', 'Kaya', 2, 'English', '21–35', 'Cologne', 'Not represented', 'Yes', true],
  ['Pierre', 'Martin', 3, 'French', '36–50', 'Berlin', 'Represented', 'No', true],
  ['Sofia', 'Russo', 0, 'Italian', '36–50', 'Munich', 'Represented', 'Yes', false],
  ['Tomasz', 'Nowak', 3, 'Polish', '36–50', 'Hamburg', 'Not represented', 'No', true],
  ['Clara', 'Vogt', 1, 'German', '16–20', 'Cologne', 'Represented', 'Yes', true],
  ['Diego', 'Santos', 2, 'Spanish', '21–35', 'Berlin', 'Not represented', 'Yes', true],
  ['Ines', 'Costa', 3, 'Portuguese', '51–65', 'Munich', 'Represented', 'No', false],
  ['Karl', 'Richter', 0, 'German', '51–65', 'Berlin', 'Represented', 'Yes', true]
].map(([first, last, role, language, age, location, agency, showreel, photo], i) => ({
  first, last, role: ROLES[role], language, age, location, agency, showreel, photo,
  applied: `2026-09-${String(28 - i * 2).padStart(2, '0')}`
}))
const PHOTO = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 160'%3E%3Cdefs%3E%3Cpattern id='p' width='16' height='16' patternUnits='userSpaceOnUse'%3E%3Crect width='16' height='16' fill='%239bb7ff'/%3E%3Crect width='8' height='8' fill='%2382a3f7'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%2382a3f7'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='120' height='160' fill='url(%23p)'/%3E%3Cg transform='translate(60.0 80.0) scale(1.33)'%3E%3Cg%3E%3Ccircle cx='-14' cy='-16' r='7' fill='%23fff8e7'/%3E%3Ccircle cx='-4' cy='-22' r='7' fill='%23fff8e7'/%3E%3Ccircle cx='8' cy='-20' r='7' fill='%23fff8e7'/%3E%3Ccircle cx='16' cy='-12' r='7' fill='%23fff8e7'/%3E%3Ccircle cx='-18' cy='-6' r='7' fill='%23fff8e7'/%3E%3Ccircle cx='2' cy='-12' r='7' fill='%23fff8e7'/%3E%3Cpath d='M-22 -8 L22 -8 L16 30 L-16 30 Z' fill='%23e63946'/%3E%3Cpath d='M-11 -8 L-8 30 L-2 30 L-4 -8 Z M4 -8 L2 30 L8 30 L11 -8 Z' fill='%23fff8e7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
// One Profile tile (CNT-10), the same markup as the library examples.
const tile = (p) => {
  const name = `${p.first} ${p.last}`
  return '<div class="card" role="listitem" style="overflow:hidden">' +
    '<div style="position:relative">' +
    (p.photo
      ? `<img class="card-img-top" src="${PHOTO}" alt="${esc(name)}" style="display:block;width:100%;aspect-ratio:3/4;object-fit:cover">`
      : '<div style="aspect-ratio:3/4;background:var(--bs-bg-2);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user fg-3" aria-hidden="true" style="font-size:2rem"></i></div>') +
    '<span class="badge badge-solid theme-inverse" style="position:absolute;top:8px;inset-inline-start:8px">A</span>' +
    '</div>' +
    '<div style="display:flex;align-items:flex-start;gap:4px;padding:8px 8px 10px 12px">' +
    `<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><a href="#" class="fw-semibold">${esc(name)}</a><span class="fs-xs fg-2">${esc(p.role)}</span></div>` +
    `<a class="btn-text theme-secondary btn-xs btn-icon" href="#" target="_blank" rel="noopener" aria-label="Open ${esc(name)}’s profile in a new tab" data-bs-toggle="tooltip" data-bs-title="Open profile in a new tab"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` +
    '</div></div>'
}
const RESET = 'style="--bs-theme-bg:initial;--bs-theme-contrast:initial"'
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

let uid = 0

export function initFilterBar(root) {
  const id = 'fb' + (++uid)
  const defaults = () => Object.fromEntries(DEFS.map((d) => [d.key, d.multi ? [] : (d.default ?? ALL)]))
  const state = { query: '', values: defaults(), sort: 0, open: null, find: '', more: false }
  // The bar-only widths start with two languages applied, so each width shows
  // its chips and Clear filters.
  if (root.dataset.variant === 'bar') state.values.language = ['English', 'German']

  const isApplied = (d) => {
    const v = state.values[d.key]
    return d.multi ? v.length > 0 : v !== (d.default ?? ALL)
  }
  const valueLabel = (d) => {
    const v = state.values[d.key]
    if (!d.multi) return v
    return v.length === 0 ? ALL : v.length === 1 ? v[0] : `${v.length} selected`
  }
  const rows = () => {
    const q = state.query.trim().toLowerCase()
    const out = PROFILES.filter((p) => {
      if (q && !`${p.first} ${p.last}`.toLowerCase().includes(q)) return false
      for (const d of DEFS) {
        const v = state.values[d.key]
        if (d.multi ? v.length && !v.includes(p[d.key]) : v !== ALL && p[d.key] !== v) return false
      }
      return true
    })
    const sort = SORTS[state.sort]
    return out.sort((a, b) => (sort.dir === 'desc' ? -1 : 1) * String(a[sort.key]).localeCompare(String(b[sort.key])))
  }

  const toggle = (key, text, width, applied, full) =>
    `<button type="button" class="combobox-toggle form-control form-control-sm${state.open === key ? ' show' : ''}" data-toggle="${key}" aria-expanded="${state.open === key}" style="${full ? 'width:100%' : `width:${width}px`}${applied ? ';font-weight:600' : ''}">` +
    `<span class="combobox-value" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(text)}</span>` +
    '<i class="fa-solid fa-caret-down combobox-caret" aria-hidden="true"></i></button>'

  const menu = (d, full) => {
    const options = d.multi ? d.options : [ALL, ...d.options]
    const searchable = options.length > 6
    const q = state.find.trim().toLowerCase()
    const shown = searchable ? options.filter((o) => o.toLowerCase().includes(q)) : options
    const v = state.values[d.key]
    const items = shown.map((o) => {
      const checked = d.multi ? v.includes(o) : v === o
      return `<label class="menu-item" style="cursor:pointer"><span class="menu-item-icon"><input class="${d.multi ? 'check check-sm' : 'radio radio-sm'}" type="${d.multi ? 'checkbox' : 'radio'}" name="${id}-${d.key}" data-pick="${d.key}" value="${esc(o)}"${checked ? ' checked' : ''} aria-label="${esc(o)}" ${RESET}></span><span class="menu-item-content">${esc(o)}</span></label>`
    }).join('')
    const find = searchable ? `<div class="combobox-search"><input class="form-control form-control-sm combobox-search-input" type="search" data-find placeholder="Find ${d.label.toLowerCase()}" aria-label="Find ${d.label.toLowerCase()}" value="${esc(state.find)}"></div>` : ''
    const none = searchable && shown.length === 0 ? `<div class="combobox-no-results">No ${d.label.toLowerCase()} matches</div>` : ''
    const side = full ? 'inset-inline:0;min-width:0' : 'inset-inline-start:0;min-width:220px'
    return `<div class="menu show" style="position:absolute;${side};top:calc(100% + 4px);z-index:1060;display:block">${find}${items}${none}</div>`
  }

  const filter = (d, full) =>
    `<div style="position:relative;display:flex;align-items:center${full ? ';width:100%' : ''}">${toggle(d.key, `${d.label}: ${valueLabel(d)}`, d.width, isApplied(d), full)}${state.open === d.key ? menu(d, full) : ''}</div>`

  let inlineCount = MAX_INLINE
  let chipsState = []

  function render() {
    inlineCount = fitCount(root.clientWidth - 32)
    const inline = DEFS.slice(0, inlineCount)
    const overflow = DEFS.slice(inlineCount)
    const moreCount = overflow.filter(isApplied).length
    const list = rows()
    const sortMenu = state.open === 'sort'
      ? `<div class="menu show" style="position:absolute;inset-inline-end:0;top:calc(100% + 4px);z-index:1060;display:block;min-width:200px">${SORTS.map((s, i) => `<label class="menu-item" style="cursor:pointer"><span class="menu-item-icon"><input class="radio radio-sm" type="radio" name="${id}-sort" data-sort="${i}"${state.sort === i ? ' checked' : ''} aria-label="${s.label}" ${RESET}></span><span class="menu-item-content">${s.label}</span></label>`).join('')}</div>`
      : ''
    const moreOpen = state.more
    const panelId = `${id}-more`
    // Compact: once More filters and Sort by no longer fit beside search as
    // text buttons, both become icon buttons in one Button group.
    const compact = inlineCount === 0 &&
      root.clientWidth - 32 < SEARCH_W + GAP + MORE_W + GAP + SORT_W
    const clearBtn = '<button type="button" class="btn-text theme-primary btn-sm" data-clear style="white-space:nowrap"><i class="fa-solid fa-xmark" aria-hidden="true"></i>Clear filters</button>'
    const search = `<div class="input-group input-group-sm" style="${compact ? 'flex:1 1 auto;min-width:0;max-width:240px' : 'flex:0 0 auto;width:min(240px,100%)'}"><input class="form-control form-control-sm" type="search" data-query placeholder="Search name" aria-label="Search profiles by name" value="${esc(state.query)}"><button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Search" title="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button></div>`
    let bar
    if (compact) {
      const applied = DEFS.filter(isApplied).length
      const moreName = applied ? `More filters, ${applied} applied` : 'More filters'
      const sortPop = sortMenu
        .replace('inset-inline-end:0;top:calc(100% + 4px)', 'inset-inline:8px;top:calc(100% - 4px)')
        .replace('min-width:200px', 'min-width:0')
      bar =
        '<div style="position:relative;display:flex;align-items:center;gap:8px;flex-wrap:nowrap;padding:12px 16px;background:var(--bs-bg-1)">' +
        search +
        // One Button group (icon buttons). The buttons sit directly in the
        // group, so their borders overlap by 1px; the group is static so the
        // Sort by menu anchors to the whole bar.
        '<div class="btn-group btn-group-sm" role="group" aria-label="Filter and sort" style="position:static;margin-inline-start:auto;flex:0 0 auto">' +
        `<button type="button" class="btn-outline theme-secondary btn-sm btn-icon" data-toggle="more" aria-expanded="${moreOpen}" aria-controls="${panelId}" aria-label="${moreName}" title="${moreName}"><i class="fa-solid fa-filter" aria-hidden="true"></i></button>` +
        `<button type="button" class="btn-outline theme-secondary btn-sm btn-icon" data-toggle="sort" aria-expanded="${state.open === 'sort'}" aria-label="Sort by: ${SORTS[state.sort].label}" title="Sort by: ${SORTS[state.sort].label}"><i class="fa-solid fa-arrow-down-wide-short" aria-hidden="true"></i></button>${sortPop}` +
        '</div>' +
        '</div>'
    } else {
      bar =
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;padding:12px 16px;background:var(--bs-bg-1)">' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;flex:1 0 auto">' +
        search +
        inline.map((d) => filter(d)).join('') +
        `<button type="button" class="btn-outline theme-secondary btn-sm" data-toggle="more" aria-expanded="${moreOpen}" aria-controls="${panelId}" style="white-space:nowrap"><i class="fa-solid fa-filter" aria-hidden="true"></i>More filters${moreCount ? `<span style="font-variant-numeric:tabular-nums"> (${moreCount})</span>` : ''}<i class="fa-solid fa-caret-${moreOpen ? 'up' : 'down'}" aria-hidden="true"></i></button>` +
        '</div>' +
        `<div style="position:relative;margin-inline-start:auto;flex:0 0 auto">${toggle('sort', `Sort by: ${SORTS[state.sort].label}`, 190, false)}${sortMenu}</div>` +
        '</div>'
    }
    // More filters: a row inside the card, below the bar, that wraps like the
    // production search criteria. It stays open until More filters is pressed
    // again. On compact widths each filter takes the full width. Not .collapse:
    // this Bootstrap build clips it (overflow-y: clip), which would cut off the
    // filter menus.
    let panel = moreOpen
      ? `<div id="${panelId}" role="group" aria-label="More filters"><div style="display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;padding:0 16px 12px;background:var(--bs-bg-1)">` +
        overflow.map((d) => filter(d, compact)).join('') +
        // On compact widths the row can fill the screen, so View results
        // closes it and takes the person to the results. Filters still apply
        // on change; this button only closes the row.
        (compact ? '<button type="button" class="btn-solid theme-primary btn-sm" data-view-results style="width:100%">View results</button>' : '') +
        '</div></div>'
      : ''
    // Applied chips: one per search term and per applied value. Always shown.
    const chipList = []
    if (state.query.trim()) chipList.push({ label: `Search: “${state.query.trim()}”`, remove: 'Remove the search term', clear: { query: true } })
    for (const d of DEFS) {
      if (!isApplied(d)) continue
      const v = state.values[d.key]
      if (d.multi) v.forEach((item) => chipList.push({ label: `${d.label}: ${item}`, remove: `Remove ${d.label} ${item}`, clear: { key: d.key, item } }))
      else chipList.push({ label: `${d.label}: ${v}`, remove: `Remove the ${d.label} filter`, clear: { key: d.key } })
    }
    chipsState = chipList
    const chips = chipList.length
      ? // Compact row: 24px chips on the primary muted tone (--bs-primary-bg-muted,
      // one step darker than bg-subtle), with body text.
      '<div role="group" aria-label="Applied filters" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:0 16px 8px;border-bottom:1px solid var(--bs-border-color);background:var(--bs-bg-1)">' +
        chipList.map((c, i) => `<span class="chip theme-primary" style="--bs-chip-bg:var(--bs-primary-bg-muted);--bs-chip-color:var(--bs-fg-body);--bs-chip-height:1.5rem;--bs-chip-padding-x:.5rem;--bs-chip-gap:.25rem"><span>${esc(c.label)}</span><button type="button" class="chip-dismiss" data-chip="${i}" aria-label="${esc(c.remove)}" title="${esc(c.remove)}"><i class="fa-solid fa-xmark" aria-hidden="true" style="font-size:11px"></i></button></span>`).join('') +
        // Clear filters follows the last chip.
        clearBtn + '</div>'
      : ''
    const count = `<div style="display:flex;align-items:center;gap:12px;padding:4px 16px;border-bottom:1px solid var(--bs-border-subtle);min-height:28px" class="fs-xs fw-semibold" data-count tabindex="-1">${list.length} of ${PROFILES.length} profiles</div>`
    const table = list.length
      ? `<div role="list" aria-label="Profiles" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;padding:16px">${list.map(tile).join('')}</div>`
      : '<div style="padding:48px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center"><h3 class="fs-md fw-semibold m-0">No matches found</h3><p class="fg-2 m-0" style="max-width:52ch">We couldn\'t find anything matching your search. Try adjusting your keywords, filters, or check for typos.</p></div>'

    // Keep focus and caret in the field being typed in across re-renders.
    const active = document.activeElement
    const focusKey = active && root.contains(active) ? (active.matches('[data-query]') ? '[data-query]' : active.matches('[data-find]') ? '[data-find]' : active.dataset.toggle ? `[data-toggle="${active.dataset.toggle}"]` : null) : null
    const caret = focusKey && active.matches('input') ? active.selectionStart : null
    // With chips showing, the bar and the chips row read as one block.
    if (chips) {
      if (panel) panel = panel.replace('padding:0 16px 12px;', 'padding:0 16px 6px;')
      else bar = bar.replace('padding:12px 16px;', 'padding:12px 16px 6px;')
    }
    // Tooltips belong to the old rows: remove them before redrawing.
    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getInstance(el)?.dispose())
    // data-results="none" leaves the results area blank: the bar, chips and
    // count only, for when the results are shown elsewhere. The bar-only
    // widths leave it out too.
    const results = root.dataset.results === 'none' || root.dataset.variant === 'bar' ? '' : table
    root.innerHTML = `<div class="card" style="overflow:visible;width:100%">${bar}${panel}${chips}${count}${results}</div>`
    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getOrCreateInstance(el))
    if (focusKey) {
      const el = root.querySelector(focusKey)
      if (el) { el.focus(); if (caret !== null) try { el.setSelectionRange(caret, caret) } catch {} }
    }
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle]')
    if (t) {
      const key = t.dataset.toggle
      if (key === 'more') { state.more = !state.more; state.open = null } else state.open = state.open === key ? null : key
      state.find = ''
      render()
      return
    }
    const chip = e.target.closest('[data-chip]')
    if (chip) {
      const c = chipsState[Number(chip.dataset.chip)].clear
      if (c.query) state.query = ''
      else {
        const d = DEFS.find((x) => x.key === c.key)
        state.values[d.key] = d.multi ? state.values[d.key].filter((x) => x !== c.item) : (d.default ?? ALL)
      }
      render()
      return
    }
    if (e.target.closest('[data-view-results]')) {
      state.more = false
      state.open = null
      render()
      // Focus the count so screen readers hear how many results there are.
      const c = root.querySelector('[data-count]')
      c.focus({ preventScroll: true })
      c.scrollIntoView({ block: 'start', behavior: 'smooth' })
      return
    }
    if (e.target.closest('[data-clear]')) {
      state.query = ''
      state.values = defaults()
      state.open = null
      render()
    }
  })
  root.addEventListener('change', (e) => {
    const pick = e.target.closest('[data-pick]')
    if (pick) {
      const d = DEFS.find((x) => x.key === pick.dataset.pick)
      if (d.multi) {
        const v = state.values[d.key]
        state.values[d.key] = pick.checked ? [...v, pick.value] : v.filter((x) => x !== pick.value)
      } else {
        state.values[d.key] = pick.value
        state.open = null
      }
      render()
      return
    }
    const sort = e.target.closest('[data-sort]')
    if (sort) { state.sort = Number(sort.dataset.sort); state.open = null; render() }
  })
  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-query]')) { state.query = e.target.value; render() }
    if (e.target.matches('[data-find]')) { state.find = e.target.value; render() }
  })
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.open) { state.open = null; render() }
  })
  document.addEventListener('click', (e) => {
    // The click may have re-rendered the bar, so check the recorded path.
    if (state.open && !e.composedPath().includes(root)) { state.open = null; render() }
  })
  // Re-fit when the space changes, as the product bar does.
  let lastWidth = 0
  new ResizeObserver(([entry]) => {
    const w = Math.round(entry.contentRect.width)
    if (Math.abs(w - lastWidth) >= 8) { lastWidth = w; render() }
  }).observe(root)
  render()
}
