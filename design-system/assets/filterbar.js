// Working Complex search and filter bar for the library, built from the
// Search and filter prototype (FilterBar.dc.html). It renders the same Bootstrap 6
// markup as the static examples, so it doubles as a reference for behaviour:
// search, three inline filters, More filters, Clear filters, Sort by, and a
// count row, all applied on change. The results are a list of auditions in
// the Production list (CNT-2) layout.

import * as bootstrap from './bootstrap.bundle.min.js'

const ALL = 'All'
const PRODUCTIONS = ['Nordlicht', 'Die Werkstatt', 'Stadt am Fluss', 'Kaltes Wasser', 'Sommerhaus', 'Der letzte Zug', 'Hafenrunde']
const DEFS = [
  { key: 'status', label: 'Status', width: 150, options: ['Open', 'Closed'], default: 'Open' },
  { key: 'production', label: 'Production', width: 190, multi: true, options: PRODUCTIONS },
  { key: 'type', label: 'Type', width: 160, options: ['Self-tape', 'In person'] },
  { key: 'visibility', label: 'Visibility', width: 190, options: ['Public', 'Invitation only'] },
  { key: 'deadline', label: 'Deadline', width: 170, options: ['Upcoming', 'Expired'] },
  { key: 'applications', label: 'New applications', width: 220, options: ['Yes', 'No'] }
]
const MAX_INLINE = 3
// Widths from the prototype, used to decide how many filters fit inline.
const GAP = 12
const SEARCH_W = 240
const MORE_W = 170
const CLEAR_W = 128
const SORT_W = 202

// How many filters fit beside search, Clear filters and Sort by. While any
// filter is left over, the More filters button must fit too.
function fitCount(avail, anyApplied) {
  let used = SEARCH_W + GAP + SORT_W + (anyApplied ? GAP + CLEAR_W : 0)
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
  { label: 'Deadline', key: 'due' },
  { label: 'Title', key: 'title' },
  { label: 'Creation date', key: 'created', dir: 'desc' }
]
// Invented sample auditions. due is YYYY-MM-DD; shown as DD/MM/YYYY.
const AUDITIONS = [
  { title: 'Audition: Round 1', production: 'Nordlicht', status: 'Open', type: 'Self-tape', visibility: 'Invitation only', roles: 2, newApps: 3, invitations: 7, due: '2026-10-21', created: '2026-08-02', image: true },
  { title: 'Lead casting', production: 'Die Werkstatt', status: 'Open', type: 'In person', visibility: 'Public', roles: 4, newApps: 0, invitations: 12, due: '2026-10-08', created: '2026-07-14', image: false },
  { title: 'Supporting roles', production: 'Stadt am Fluss', status: 'Open', type: 'Self-tape', visibility: 'Public', roles: 6, newApps: 11, invitations: 0, due: '2026-11-03', created: '2026-09-01', image: true },
  { title: 'Callback', production: 'Nordlicht', status: 'Open', type: 'In person', visibility: 'Invitation only', roles: 1, newApps: 0, invitations: 4, due: '2026-09-20', created: '2026-08-30', image: true },
  { title: 'Kids casting', production: 'Sommerhaus', status: 'Open', type: 'Self-tape', visibility: 'Public', roles: 3, newApps: 5, invitations: 2, due: '2026-10-15', created: '2026-09-10', image: false },
  { title: 'Day players', production: 'Kaltes Wasser', status: 'Closed', type: 'Self-tape', visibility: 'Public', roles: 8, newApps: 0, invitations: 20, due: '2026-06-30', created: '2026-05-02', image: true },
  { title: 'Audition: Round 2', production: 'Der letzte Zug', status: 'Closed', type: 'In person', visibility: 'Invitation only', roles: 2, newApps: 0, invitations: 6, due: '2026-04-12', created: '2026-03-01', image: false },
  { title: 'Extras', production: 'Hafenrunde', status: 'Open', type: 'Self-tape', visibility: 'Public', roles: 1, newApps: 2, invitations: 0, due: '2026-12-01', created: '2026-09-22', image: true }
]
// The library's fixed "today", so Upcoming and Expired don't drift.
const TODAY = '2026-09-29'
for (const a of AUDITIONS) {
  a.deadline = a.due < TODAY ? 'Expired' : 'Upcoming'
  a.applications = a.newApps ? 'Yes' : 'No'
}
const date = (iso) => iso.split('-').reverse().join('/')
const THUMB = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23334155'/%3E%3Cstop offset='1' stop-color='%23a3b1c2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='16' height='9' fill='url(%23g)'/%3E%3C/svg%3E"
// A stat: icon + value, with a hidden label and a tooltip of the same name.
const stat = (icon, label, value, tip = label) =>
  `<span tabindex="0" data-bs-toggle="tooltip" data-bs-title="${esc(tip)}" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><i class="fa-solid ${icon}" aria-hidden="true"></i><span class="visually-hidden">${esc(label)}</span>${value}</span>`
// One row in the Production list (CNT-2) layout.
const auditionRow = (a) =>
  '<div class="list-group-item" role="listitem" style="padding:0"><div class="fm-production-row" style="--fm-row-cols:132px minmax(200px,1fr) minmax(0,2fr) 140px;--fm-row-align:center">' +
  '<div class="fm-row-media" style="padding:.75rem 1rem;min-width:0">' +
  (a.image
    ? `<img src="${THUMB}" alt="${esc(a.title)}" style="display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:var(--bs-radius-5);border:1px solid var(--bs-border-subtle)">`
    : '<div style="aspect-ratio:16/9;border-radius:var(--bs-radius-5);border:1px solid var(--bs-border-subtle);background:var(--bs-bg-2);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-display fg-3" aria-hidden="true"></i></div>') +
  '</div>' +
  `<div style="padding:.75rem 1rem;min-width:0;display:flex;flex-direction:column;gap:2px"><span><a href="#" class="fw-semibold">${esc(a.title)}</a> <span class="fg-3">(${a.status.toLowerCase()})</span></span><span class="fg-3">${esc(a.production)}</span></div>` +
  '<div style="padding:.75rem 1rem;min-width:0"><span style="display:flex;align-items:center;flex-wrap:wrap;gap:.5rem 1.25rem">' +
  `<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><i class="fa-solid ${a.type === 'Self-tape' ? 'fa-mobile-screen-button' : 'fa-location-dot'}" aria-hidden="true"></i><span class="fw-semibold">${a.type}</span></span>` +
  (a.visibility === 'Invitation only'
    ? '<span tabindex="0" data-bs-toggle="tooltip" data-bs-title="Only invited actors/agents can see this Audition" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><i class="fa-solid fa-user-lock" aria-hidden="true"></i>Invitation only</span>'
    : '<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><i class="fa-solid fa-globe" aria-hidden="true"></i>Public</span>') +
  stat('fa-scroll', 'Roles', a.roles) +
  (a.newApps ? `<a href="#" class="fw-semibold" style="display:inline-flex">${stat('fa-user-plus', 'New applications', a.newApps, `${a.newApps} new applications`)}</a>` : stat('fa-user-plus', 'New applications', 0)) +
  stat('fa-envelope', 'Invitations', a.invitations) +
  (a.deadline === 'Expired'
    ? stat('fa-hourglass', 'Deadline', 'Deadline expired', date(a.due)).replace('<span class="visually-hidden">Deadline</span>', '')
    : stat('fa-hourglass', 'Deadline', date(a.due))) +
  '</span></div>' +
  '<div class="fm-action-gutter"><a class="btn-text theme-primary btn-xs" href="#"><i class="fa-solid fa-pencil" aria-hidden="true"></i>Edit</a><a class="btn-text theme-primary btn-xs" href="#"><i class="fa-solid fa-clone" aria-hidden="true"></i>Duplicate</a>' +
  `<div><button type="button" class="btn-text theme-primary btn-xs" data-bs-toggle="menu" data-bs-placement="bottom-end" data-bs-strategy="fixed" aria-expanded="false" aria-label="More actions for ${esc(a.title)}"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i>More</button><div class="menu"><button type="button" class="menu-item">Archive Audition</button><hr class="menu-divider"><button type="button" class="menu-item theme-danger">Delete Audition</button></div></div>` +
  '</div></div></div>'
const RESET = 'style="--bs-theme-bg:initial;--bs-theme-contrast:initial"'
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

let uid = 0

export function initFilterBar(root) {
  const id = 'fb' + (++uid)
  const defaults = () => Object.fromEntries(DEFS.map((d) => [d.key, d.multi ? [] : (d.default ?? ALL)]))
  const state = { query: '', values: defaults(), sort: 0, open: null, find: '' }

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
    const out = AUDITIONS.filter((p) => {
      if (q && !`${p.title} ${p.production}`.toLowerCase().includes(q)) return false
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

  const menu = (d, end) => {
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
    const side = end ? 'inset-inline-end:0' : 'inset-inline-start:0'
    return `<div class="menu show" style="position:absolute;${side};top:calc(100% + 4px);z-index:1060;display:block;min-width:220px">${find}${items}${none}</div>`
  }

  const filter = (d, full) =>
    `<div style="position:relative;display:flex;align-items:center${full ? ';width:100%' : ''}">${toggle(d.key, `${d.label}: ${valueLabel(d)}`, d.width, isApplied(d), full)}${state.open === d.key ? menu(d) : ''}</div>`

  let inlineCount = MAX_INLINE
  let chipsState = []
  const inPopover = (key) => DEFS.slice(inlineCount).some((d) => d.key === key)

  function render() {
    const anyApplied = state.query.trim() !== '' || DEFS.some(isApplied)
    inlineCount = fitCount(root.clientWidth - 32, anyApplied)
    const inline = DEFS.slice(0, inlineCount)
    const overflow = DEFS.slice(inlineCount)
    const moreCount = overflow.filter(isApplied).length
    const list = rows()
    const sortMenu = state.open === 'sort'
      ? `<div class="menu show" style="position:absolute;inset-inline-end:0;top:calc(100% + 4px);z-index:1060;display:block;min-width:200px">${SORTS.map((s, i) => `<label class="menu-item" style="cursor:pointer"><span class="menu-item-icon"><input class="radio radio-sm" type="radio" name="${id}-sort" data-sort="${i}"${state.sort === i ? ' checked' : ''} aria-label="${s.label}" ${RESET}></span><span class="menu-item-content">${s.label}</span></label>`).join('')}</div>`
      : ''
    const popover = state.open === 'more' || overflow.some((d) => state.open === d.key)
      ? `<div class="popover bs-popover-bottom show" role="dialog" aria-label="More filters" style="position:absolute;inset-inline-start:0;top:calc(100% + 6px);z-index:1050;display:block;max-width:none;width:300px"><div class="popover-body" style="display:flex;flex-direction:column;gap:10px">${overflow.map((d) => filter(d, true)).join('')}</div></div>`
      : ''
    const moreOpen = !!popover
    // Compact: once More filters and Sort by no longer fit beside search as
    // text buttons, both become icon buttons in one Button group, and Clear filters
    // moves to the bottom of the More filters popover.
    const compact = inlineCount === 0 &&
      root.clientWidth - 32 < SEARCH_W + GAP + MORE_W + (anyApplied ? GAP + CLEAR_W : 0) + GAP + SORT_W
    const clearBtn = '<button type="button" class="btn-text theme-primary btn-sm" data-clear style="white-space:nowrap"><i class="fa-solid fa-xmark" aria-hidden="true"></i>Clear filters</button>'
    const search = `<div class="input-group input-group-sm" style="${compact ? 'flex:1 1 auto;min-width:0;max-width:240px' : 'flex:0 0 auto;width:min(240px,100%)'}"><input class="form-control form-control-sm" type="search" data-query placeholder="Search title, production" aria-label="Search auditions" value="${esc(state.query)}"><button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Search" title="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button></div>`
    let bar
    if (compact) {
      const applied = DEFS.filter(isApplied).length
      const moreName = applied ? `More filters, ${applied} applied` : 'More filters'
      // On small screens the popover and menus fill the bar's width, and each
      // filter's menu fills the popover.
      const pop = moreOpen
        ? popover
          .replace('inset-inline-start:0;top:calc(100% + 6px)', 'inset-inline:8px;top:calc(100% - 4px)')
          .replace('width:300px', 'width:auto')
          .replaceAll('min-width:220px', 'min-width:0;inset-inline-end:0')
          .replace(/<\/div><\/div>$/, `${anyApplied ? `<div>${clearBtn}</div>` : ''}</div></div>`)
        : ''
      const sortPop = sortMenu
        .replace('inset-inline-end:0;top:calc(100% + 4px)', 'inset-inline:8px;top:calc(100% - 4px)')
        .replace('min-width:200px', 'min-width:0')
      bar =
        '<div style="position:relative;display:flex;align-items:center;gap:8px;flex-wrap:nowrap;padding:12px 16px;background:var(--bs-bg-1)">' +
        search +
        // One Button group (icon buttons). The nested groups are static so
        // the popover and menu anchor to the whole bar.
        '<div class="btn-group btn-group-sm" role="group" aria-label="Filter and sort" style="position:static;margin-inline-start:auto;flex:0 0 auto">' +
        `<div class="btn-group btn-group-sm" style="position:static"><button type="button" class="btn-outline theme-secondary btn-sm btn-icon" data-toggle="more" aria-expanded="${moreOpen}" aria-label="${moreName}" title="${moreName}"><i class="fa-solid fa-filter" aria-hidden="true"></i></button>${pop}</div>` +
        `<div class="btn-group btn-group-sm" style="position:static"><button type="button" class="btn-outline theme-secondary btn-sm btn-icon" data-toggle="sort" aria-expanded="${state.open === 'sort'}" aria-label="Sort by: ${SORTS[state.sort].label}" title="Sort by: ${SORTS[state.sort].label}"><i class="fa-solid fa-arrow-down-wide-short" aria-hidden="true"></i></button>${sortPop}</div>` +
        '</div>' +
        '</div>'
    } else {
      bar =
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;padding:12px 16px;background:var(--bs-bg-1)">' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;flex:1 0 auto">' +
        search +
        inline.map((d) => filter(d)).join('') +
        `<div style="position:relative"><button type="button" class="btn-outline theme-secondary btn-sm" data-toggle="more" aria-expanded="${moreOpen}" style="white-space:nowrap"><i class="fa-solid fa-filter" aria-hidden="true"></i>More filters${moreCount ? `<span style="font-variant-numeric:tabular-nums"> (${moreCount})</span>` : ''}<i class="fa-solid fa-caret-down" aria-hidden="true"></i></button>${popover}</div>` +
        (anyApplied ? clearBtn : '') +
        '</div>' +
        `<div style="position:relative;margin-inline-start:auto;flex:0 0 auto">${toggle('sort', `Sort by: ${SORTS[state.sort].label}`, 190, false)}${sortMenu}</div>` +
        '</div>'
    }
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
        chipList.map((c, i) => `<span class="chip theme-primary" style="--bs-chip-bg:var(--bs-primary-bg-muted);--bs-chip-color:var(--bs-fg-body);--bs-chip-height:1.5rem;--bs-chip-padding-x:.5rem;--bs-chip-gap:.25rem"><span>${esc(c.label)}</span><button type="button" class="chip-dismiss" data-chip="${i}" aria-label="${esc(c.remove)}" title="${esc(c.remove)}"><i class="fa-solid fa-xmark" aria-hidden="true" style="font-size:11px"></i></button></span>`).join('') + '</div>'
      : ''
    const count = `<div style="display:flex;align-items:center;gap:12px;padding:4px 16px;border-bottom:1px solid var(--bs-border-subtle);min-height:28px" class="fs-xs fw-semibold">${list.length} of ${AUDITIONS.length} auditions</div>`
    const table = list.length
      ? `<div class="list-group list-group-flush" role="list" aria-label="Auditions">${list.map(auditionRow).join('')}</div>`
      : '<div style="padding:48px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center"><h3 class="fs-md fw-semibold m-0">No matches found</h3><p class="fg-2 m-0" style="max-width:52ch">We couldn\'t find anything matching your search. Try adjusting your keywords, filters, or check for typos.</p></div>'

    // Keep focus and caret in the field being typed in across re-renders.
    const active = document.activeElement
    const focusKey = active && root.contains(active) ? (active.matches('[data-query]') ? '[data-query]' : active.matches('[data-find]') ? '[data-find]' : null) : null
    const caret = focusKey ? active.selectionStart : null
    const barOnly = root.dataset.variant === 'bar'
    // With chips showing, the bar and the chips row read as one block.
    if (chips) bar = bar.replace('padding:12px 16px;', 'padding:12px 16px 6px;')
    // Tooltips belong to the old rows: remove them before redrawing.
    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getInstance(el)?.dispose())
    root.innerHTML = barOnly
      ? `<div class="card" style="overflow:visible;width:100%">${bar}${count}</div>`
      : `<div class="card" style="overflow:visible;width:100%">${bar}${chips}${count}${table}</div>`
    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getOrCreateInstance(el))
    if (focusKey) {
      const el = root.querySelector(focusKey)
      if (el) { el.focus(); try { el.setSelectionRange(caret, caret) } catch {} }
    }
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle]')
    if (t) {
      const key = t.dataset.toggle
      // Opening a filter inside More filters keeps the popover open.
      state.open = state.open === key ? (inPopover(key) ? 'more' : null) : key
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
        state.open = inPopover(d.key) ? 'more' : null
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
