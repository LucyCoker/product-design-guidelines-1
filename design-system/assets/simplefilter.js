// Working Simple search and filter bar for the library, built from the Simple
// filter bar prototype (Simple_filter_bar.dc.html). Each filter is a text
// button reading "Label: value" that opens a menu, so the current value is
// always in the bar and no chip row is needed. Filters apply on change.

const ALL = 'All'
const DEFS = [
  { key: 'permissions', label: 'Permissions', options: ['Admin', 'Limited', 'Read only'] },
  { key: 'status', label: 'Status', options: ['Active', 'Inactive'] },
  { key: 'language', label: 'Language', multi: true, options: ['English', 'German', 'French', 'Spanish', 'Italian', 'Polish', 'Portuguese'] },
  { key: 'twofa', label: '2FA', options: ['Enabled', 'Disabled'] }
]
const SORTS = [
  { label: 'Last created', key: 'created', dir: 'desc' },
  { label: 'Last name', key: 'last' },
  { label: 'First name', key: 'first' }
]
// Twenty invented sample people, built from short lists so the table can page.
const NAMES = [['Alex', 'Martin'], ['Sam', 'Richter'], ['Jo', 'Becker'], ['Mara', 'Feld'], ['Noah', 'Wagner'], ['Lea', 'Hoffmann'], ['Ben', 'Schulz'], ['Ida', 'Keller'], ['Tom', 'Braun'], ['Eva', 'Lang'],
  ['Max', 'Vogel'], ['Zoe', 'Roth'], ['Luca', 'Berg'], ['Nina', 'Frank'], ['Paul', 'Kraus'], ['Ada', 'Winter'], ['Finn', 'Busch'], ['Mia', 'Graf'], ['Ole', 'Hahn'], ['Emma', 'Kuhn']]
const PICK = (list, i) => list[i % list.length]
const PEOPLE = NAMES.map(([first, last], i) => ({
  first,
  last,
  email: `${first}.${last}@example.com`.toLowerCase(),
  permissions: PICK(['Admin', 'Limited', 'Limited', 'Read only'], i),
  language: PICK(['English', 'German', 'English', 'French', 'Spanish', 'German', 'Italian'], i),
  twofa: PICK(['Enabled', 'Disabled', 'Disabled'], i),
  profileAccess: PICK(['All profiles', 'No profiles', 'No profiles'], i),
  locationAccess: PICK(['All locations', 'No locations', 'No locations'], i),
  status: i % 5 === 3 ? 'Inactive' : 'Active',
  created: `202${2 + (i % 3)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + ((i * 7) % 28)).padStart(2, '0')}`
}))
const PAGE_SIZE = 5
// Below this width Sort by becomes an icon button beside the search field.
const NARROW = 560
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function initSimpleFilter(root) {
  const defaults = () => Object.fromEntries(DEFS.map((d) => [d.key, d.multi ? [] : ALL]))
  const state = { query: '', values: defaults(), sort: 0, page: 1, open: null }
  // The menu that was open at the last render. Re-rendering it skips
  // Bootstrap's fade-in, so picking several values does not flicker.
  let shown = null

  const isApplied = (d) => (d.multi ? state.values[d.key].length > 0 : state.values[d.key] !== ALL)
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

  // A text button reading "Label: value". The value is the link colour, and
  // weight 600 once applied.
  const trigger = (key, label, value, applied) =>
    `<button type="button" class="btn-text theme-secondary btn-sm" data-toggle="${key}" aria-haspopup="menu" aria-expanded="${state.open === key}" style="white-space:nowrap;gap:6px">` +
    `<span style="font-weight:600;color:var(--bs-fg-body)">${esc(label)}:</span>` +
    `<span style="color:var(--bs-link-color);font-weight:${applied ? 600 : 400}">${esc(value)}</span>` +
    '<i class="fa-solid fa-chevron-down" aria-hidden="true" style="font-size:12px;color:var(--bs-fg-2)"></i></button>'

  // Selected items carry a check, so the state is not colour alone.
  const menu = (key, items, end) =>
    `<div class="menu show" role="menu" style="position:absolute;${end ? 'inset-inline-end:0' : 'inset-inline-start:0'};top:calc(100% + 4px);z-index:1060;display:block;min-width:200px${shown === key ? ';transition:none' : ''}">` +
    items.map((it) => `<button type="button" class="menu-item" role="${it.multi ? 'menuitemcheckbox' : 'menuitemradio'}" aria-checked="${it.on}" data-pick="${key}" data-value="${esc(it.value)}">` +
      `<i class="fa-solid fa-check" aria-hidden="true" style="width:16px;visibility:${it.on ? 'visible' : 'hidden'}"></i>${esc(it.value)}</button>`).join('') +
    '</div>'

  const filter = (d) => {
    const v = state.values[d.key]
    const options = d.multi ? d.options : [ALL, ...d.options]
    const items = options.map((o) => ({ value: o, on: d.multi ? v.includes(o) : v === o, multi: d.multi }))
    return `<div style="position:relative;display:flex">${trigger(d.key, d.label, valueLabel(d), isApplied(d))}${state.open === d.key ? menu(d.key, items) : ''}</div>`
  }

  function render() {
    const list = rows()
    const anyApplied = state.query.trim() !== '' || DEFS.some(isApplied)
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
    state.page = Math.min(state.page, pageCount)
    const from = list.length ? (state.page - 1) * PAGE_SIZE + 1 : 0
    const to = Math.min(state.page * PAGE_SIZE, list.length)
    const sortItems = SORTS.map((s, i) => ({ value: s.label, on: state.sort === i }))

    // Two zones: search, filters and Clear filters wrap on the left; Sort by
    // stays top right. Narrow bars show Sort by as an icon button.
    const narrow = root.clientWidth < NARROW
    const sortLabel = `Sort by: ${SORTS[state.sort].label}`
    const sortTrigger = narrow
      ? `<button type="button" class="btn-text theme-secondary btn-sm btn-icon" data-toggle="sort" aria-haspopup="menu" aria-expanded="${state.open === 'sort'}" aria-label="${sortLabel}" title="${sortLabel}"><i class="fa-solid fa-arrow-down-wide-short" aria-hidden="true"></i></button>`
      : trigger('sort', 'Sort by', SORTS[state.sort].label, false)
    const bar =
      '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-bottom:1px solid var(--bs-border-color)">' +
      '<div style="display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;flex:1 1 auto;min-width:0">' +
      `<div class="input-group input-group-sm" style="${narrow ? 'flex:1 1 100%' : 'width:240px;flex:0 0 auto'}">` +
      `<input class="form-control form-control-sm" type="search" data-query placeholder="Search name, email" aria-label="Search coworkers" value="${esc(state.query)}">` +
      '<button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Search" title="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button></div>' +
      DEFS.map(filter).join('') +
      (anyApplied ? '<button type="button" class="btn-text theme-primary btn-sm" data-clear style="white-space:nowrap"><i class="fa-solid fa-xmark" aria-hidden="true"></i>Clear filters</button>' : '') +
      '</div>' +
      `<div style="position:relative;display:flex;flex:0 0 auto">${sortTrigger}${state.open === 'sort' ? menu('sort', sortItems, true) : ''}</div>` +
      '</div>'
    const range = list.length ? `${from}-${to} of ${list.length} coworkers` : `0 of ${PEOPLE.length} coworkers`
    const count = `<div style="display:flex;align-items:center;padding:8px 16px;border-bottom:1px solid var(--bs-border-subtle);font-size:14px;font-weight:600;min-height:40px">${range}</div>`

    const page = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE)
    const pageLink = (label, target, { disabled, active, aria } = {}) =>
      `<li class="page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}"><a class="page-link" href="#" data-goto="${target}"${aria ? ` aria-label="${aria}"` : ''}${active ? ' aria-current="page"' : ''}>${label}</a></li>`
    const body = list.length
      ? '<div style="overflow-x:auto"><table class="table" style="margin:0"><thead><tr><th scope="col">Name</th><th scope="col">Permissions</th><th scope="col">Language</th><th scope="col">2FA</th><th scope="col">Profile access</th><th scope="col">Location access</th><th scope="col">Status</th></tr></thead><tbody>' +
        page.map((p) => `<tr><td><div class="fw-semibold">${p.first} ${p.last}</div><div class="fs-xs fg-3">${p.email}</div></td><td>${p.permissions}</td><td>${p.language}</td><td>${p.twofa}</td><td>${p.profileAccess}</td><td>${p.locationAccess}</td><td><span class="badge ${p.status === 'Active' ? 'theme-success' : 'theme-secondary'} badge-subtle">${p.status}</span></td></tr>`).join('') +
        '</tbody></table></div>' +
        '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:10px 16px;background:var(--bs-bg-1);border-top:1px solid var(--bs-border-subtle)">' +
        `<span style="font-size:14px;font-weight:600">${range}</span>` +
        '<nav aria-label="Pagination" style="margin-inline-start:auto"><ul class="pagination pagination-sm theme-primary" style="margin:0">' +
        pageLink('<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>', state.page - 1, { disabled: state.page <= 1, aria: 'Previous page' }) +
        Array.from({ length: pageCount }, (_, i) => pageLink(String(i + 1), i + 1, { active: state.page === i + 1 })).join('') +
        pageLink('<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>', state.page + 1, { disabled: state.page >= pageCount, aria: 'Next page' }) +
        '</ul></nav></div>'
      : '<div style="padding:48px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center"><h3 class="fs-md fw-semibold m-0">No matches found</h3><p class="fg-2 m-0" style="max-width:52ch">We couldn\'t find anything matching your search. Try adjusting your keywords, filters, or check for typos.</p></div>'

    // Keep focus and caret in the search field across re-renders.
    const active = document.activeElement
    const typing = active && root.contains(active) && active.matches('[data-query]')
    const caret = typing ? active.selectionStart : null
    root.innerHTML = `<div class="card" style="overflow:visible;width:100%">${bar}${count}${body}</div>`
    shown = state.open
    if (typing) {
      const el = root.querySelector('[data-query]')
      el.focus()
      try { el.setSelectionRange(caret, caret) } catch {}
    }
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle]')
    if (t) { state.open = state.open === t.dataset.toggle ? null : t.dataset.toggle; render(); return }
    const pick = e.target.closest('[data-pick]')
    if (pick) {
      const key = pick.dataset.pick
      const value = pick.dataset.value
      if (key === 'sort') {
        state.sort = SORTS.findIndex((s) => s.label === value)
        state.open = null
      } else {
        const d = DEFS.find((x) => x.key === key)
        const v = state.values[key]
        // Multi-value filters stay open so several values can be picked.
        if (d.multi) state.values[key] = v.includes(value) ? v.filter((x) => x !== value) : [...v, value]
        else { state.values[key] = value; state.open = null }
        state.page = 1
      }
      render()
      return
    }
    const go = e.target.closest('[data-goto]')
    if (go) {
      e.preventDefault()
      state.open = null
      if (!go.closest('.disabled')) state.page = Number(go.dataset.goto)
      render()
      return
    }
    if (e.target.closest('[data-clear]')) {
      state.query = ''
      state.values = defaults()
      state.page = 1
      state.open = null
      render()
      return
    }
    // Any other click outside the open menu closes it, inside the bar too.
    if (state.open && !e.target.closest('.menu')) { state.open = null; render() }
  })
  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-query]')) { state.query = e.target.value; state.page = 1; render() }
  })
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.open) { state.open = null; render() }
  })
  document.addEventListener('click', (e) => {
    if (state.open && !e.composedPath().includes(root)) { state.open = null; render() }
  })
  // Re-render when the bar crosses the narrow width.
  let wasNarrow = null
  new ResizeObserver(() => {
    const now = root.clientWidth < NARROW
    if (now !== wasNarrow) { wasNarrow = now; render() }
  }).observe(root)
  render()
}
