// Working Complex search and filter bar for the library, built from the
// Search and filter prototype (FilterBar.dc.html). It renders the same Bootstrap 6
// markup as the static examples, so it doubles as a reference for behaviour:
// search, three inline filters, More filters, Clear filters, Sort by, and a
// count row, all applied on change.

const ALL = 'All'
const LANGUAGES = ['English', 'German', 'French', 'Spanish', 'Italian', 'Polish', 'Portuguese']
const DEFS = [
  { key: 'permissions', label: 'Permissions', width: 170, options: ['Admin', 'Limited', 'Read only'] },
  { key: 'status', label: 'Status', width: 150, options: ['Active', 'Inactive'], default: 'Active' },
  { key: 'language', label: 'Language', width: 190, multi: true, options: LANGUAGES },
  { key: 'twofa', label: '2FA', width: 140, options: ['Enabled', 'Disabled'] },
  { key: 'profileAccess', label: 'Profile access', width: 210, options: ['All profiles', 'No profiles'] },
  { key: 'locationAccess', label: 'Location access', width: 220, options: ['All locations', 'No locations'] }
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
  { label: 'Last name', key: 'last' },
  { label: 'First name', key: 'first' },
  { label: 'Creation date', key: 'created', dir: 'desc' }
]
// Invented sample people.
const PEOPLE = [
  { first: 'Alex', last: 'Martin', email: 'alex.martin@example.com', permissions: 'Admin', language: 'English', twofa: 'Enabled', profileAccess: 'All profiles', locationAccess: 'All locations', status: 'Active', created: '2022-02-01' },
  { first: 'Sam', last: 'Richter', email: 'sam.richter@example.com', permissions: 'Limited', language: 'English', twofa: 'Disabled', profileAccess: 'No profiles', locationAccess: 'No locations', status: 'Active', created: '2022-07-19' },
  { first: 'Jo', last: 'Becker', email: 'jo.becker@example.com', permissions: 'Limited', language: 'German', twofa: 'Disabled', profileAccess: 'No profiles', locationAccess: 'No locations', status: 'Active', created: '2022-11-21' },
  { first: 'Mara', last: 'Feld', email: 'mara.feld@example.com', permissions: 'Read only', language: 'French', twofa: 'Disabled', profileAccess: 'No profiles', locationAccess: 'No locations', status: 'Inactive', created: '2023-03-04' }
]
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
    const out = PEOPLE.filter((p) => {
      if (q && !`${p.first} ${p.last} ${p.email}`.toLowerCase().includes(q)) return false
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
    const search = `<div class="input-group input-group-sm" style="${compact ? 'flex:1 1 auto;min-width:0;max-width:240px' : 'flex:0 0 auto;width:min(240px,100%)'}"><input class="form-control form-control-sm" type="search" data-query placeholder="Search name, email, phone" aria-label="Search name, email, phone" value="${esc(state.query)}"><button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Search" title="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button></div>`
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
    const count = `<div style="display:flex;align-items:center;gap:12px;padding:4px 16px;border-bottom:1px solid var(--bs-border-subtle);min-height:28px" class="fs-xs fw-semibold">${list.length} of ${PEOPLE.length} coworkers</div>`
    const table = list.length
      ? '<table class="table" style="margin:0"><thead><tr><th scope="col">Name</th><th scope="col">Permissions</th><th scope="col">Language</th><th scope="col">2FA</th><th scope="col">Profile access</th><th scope="col">Location access</th><th scope="col">Status</th></tr></thead><tbody>' +
        list.map((p) => `<tr><td><div class="fw-semibold">${p.first} ${p.last}</div><div class="fs-xs fg-3">${p.email}</div></td><td>${p.permissions}</td><td>${p.language}</td><td>${p.twofa}</td><td>${p.profileAccess}</td><td>${p.locationAccess}</td><td><span class="badge ${p.status === 'Active' ? 'theme-success' : 'theme-secondary'} badge-subtle">${p.status}</span></td></tr>`).join('') +
        '</tbody></table>'
      : '<div style="padding:48px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center"><h3 class="fs-md fw-semibold m-0">No matches found</h3><p class="fg-2 m-0" style="max-width:52ch">We couldn\'t find anything matching your search. Try adjusting your keywords, filters, or check for typos.</p></div>'

    // Keep focus and caret in the field being typed in across re-renders.
    const active = document.activeElement
    const focusKey = active && root.contains(active) ? (active.matches('[data-query]') ? '[data-query]' : active.matches('[data-find]') ? '[data-find]' : null) : null
    const caret = focusKey ? active.selectionStart : null
    const barOnly = root.dataset.variant === 'bar'
    // With chips showing, the bar and the chips row read as one block.
    if (chips) bar = bar.replace('padding:12px 16px;', 'padding:12px 16px 6px;')
    root.innerHTML = barOnly
      ? `<div class="card" style="overflow:visible;width:100%">${bar}${count}</div>`
      : `<div class="card" style="overflow:visible;width:100%">${bar}${chips}${count}${table}</div>`
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
