// Working Simple search and filter bar for the library, built from the Simple
// filter bar prototype (Simple_filter_bar.dc.html). Each filter is a subtle
// button reading "Label: value" that opens a Bootstrap 6 menu, so the current
// value is always in the bar and no chip row is needed. Filters apply on
// change.
//
// The menus are standard Bootstrap: data-bs-toggle="menu" opens, closes and
// positions them (with keyboard support), data-bs-auto-close="outside" keeps
// multi-value filters open, and .selected with .menu-item-check marks the
// current value. The bar is drawn once; changes update it in place so the
// plugin keeps its menus.

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
  // data-query starts the bar with a search, e.g. to show the no-matches state.
  const state = { query: root.dataset.query || '', values: defaults(), sort: 0, page: 1 }
  // Example frames clip overflow, so menus there use fixed positioning.
  const strategy = root.closest('.lib-examples, .lib-preview') ? ' data-bs-strategy="fixed"' : ''

  const isApplied = (d) => (d.multi ? state.values[d.key].length > 0 : state.values[d.key] !== ALL)
  const valueLabel = (d) => {
    const v = state.values[d.key]
    if (!d.multi) return v
    return v.length === 0 ? ALL : v.length === 1 ? v[0] : `${v.length} selected`
  }
  const isOn = (key, value) => {
    if (key === 'sort') return SORTS[state.sort].label === value
    const d = DEFS.find((x) => x.key === key)
    return d.multi ? state.values[key].includes(value) : state.values[key] === value
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

  // Menu items: the check sits on the right and shows on .selected items.
  const items = (key, values) => values.map((v) =>
    `<button type="button" class="menu-item${isOn(key, v) ? ' selected' : ''}" data-pick="${key}" data-value="${esc(v)}"${isOn(key, v) ? ' aria-current="true"' : ''}>` +
    `${esc(v)}<i class="fa-solid fa-check menu-item-check" aria-hidden="true"></i></button>`).join('')

  // A subtle button (Bootstrap's btn-subtle) reading "Label: value". The
  // value is the link colour, and weight 600 once applied.
  const trigger = (key, label, value, { multi, end } = {}) =>
    `<button type="button" class="btn-subtle theme-secondary btn-sm" data-bs-toggle="menu" data-bs-auto-close="${multi ? 'outside' : 'true'}"${end ? ' data-bs-placement="bottom-end"' : ''}${strategy} aria-expanded="false" style="white-space:nowrap;gap:6px">` +
    `<span style="font-weight:600;color:var(--bs-fg-body)">${esc(label)}:</span>` +
    `<span data-value-of="${key}" style="color:var(--bs-link-color)">${esc(value)}</span>` +
    '<i class="fa-solid fa-chevron-down" aria-hidden="true" style="font-size:12px;color:var(--bs-fg-2)"></i></button>'

  const filter = (d) => {
    const options = d.multi ? d.options : [ALL, ...d.options]
    return `<div style="display:flex">${trigger(d.key, d.label, valueLabel(d), { multi: d.multi })}<div class="menu" data-menu="${d.key}" style="min-width:200px">${items(d.key, options)}</div></div>`
  }

  // The bar: drawn on start and when the width crosses NARROW.
  function render() {
    // Two zones: search, filters and Clear filters wrap on the left; Sort by
    // stays top right. Narrow bars show Sort by as an icon button.
    const narrow = root.clientWidth < NARROW
    const sortLabel = `Sort by: ${SORTS[state.sort].label}`
    const sortTrigger = narrow
      ? `<button type="button" class="btn-subtle theme-secondary btn-sm btn-icon" data-bs-toggle="menu" data-bs-placement="bottom-end"${strategy} aria-expanded="false" data-sort-icon aria-label="${sortLabel}" title="${sortLabel}"><i class="fa-solid fa-arrow-down-wide-short" aria-hidden="true"></i></button>`
      : trigger('sort', 'Sort by', SORTS[state.sort].label, { end: true })
    const bar =
      '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px">' +
      '<div style="display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;flex:1 1 auto;min-width:0">' +
      `<div class="input-group input-group-sm" style="${narrow ? 'flex:1 1 100%' : 'width:240px;flex:0 0 auto'}">` +
      `<input class="form-control form-control-sm" type="search" data-query placeholder="Search name, email" aria-label="Search coworkers" value="${esc(state.query)}">` +
      '<button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Search" title="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button></div>' +
      DEFS.map(filter).join('') +
      '<button type="button" class="btn-text theme-primary btn-sm" data-clear hidden style="white-space:nowrap"><i class="fa-solid fa-xmark" aria-hidden="true"></i>Clear filters</button>' +
      '</div>' +
      `<div style="display:flex;flex:0 0 auto">${sortTrigger}<div class="menu" data-menu="sort" style="min-width:200px">${items('sort', SORTS.map((x) => x.label))}</div></div>` +
      '</div>'
    // No card outline: only the table rows carry lines.
    root.innerHTML = `<div class="card" style="overflow:visible;width:100%;--bs-card-border-width:0">${bar}<div data-results></div></div>`
    update()
  }

  // Everything that changes with a pick, a search or a page: updated in place.
  function update() {
    for (const d of DEFS) {
      const value = root.querySelector(`[data-value-of="${d.key}"]`)
      value.textContent = valueLabel(d)
      value.style.fontWeight = isApplied(d) ? 600 : 400
    }
    const sortValue = root.querySelector('[data-value-of="sort"]')
    if (sortValue) sortValue.textContent = SORTS[state.sort].label
    const sortIcon = root.querySelector('[data-sort-icon]')
    if (sortIcon) for (const a of ['title', 'aria-label']) sortIcon.setAttribute(a, `Sort by: ${SORTS[state.sort].label}`)
    for (const item of root.querySelectorAll('[data-pick]')) {
      const on = isOn(item.dataset.pick, item.dataset.value)
      item.classList.toggle('selected', on)
      if (on) item.setAttribute('aria-current', 'true')
      else item.removeAttribute('aria-current')
    }
    root.querySelector('[data-clear]').hidden = !(state.query.trim() !== '' || DEFS.some(isApplied))

    const list = rows()
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
    state.page = Math.min(state.page, pageCount)
    const from = list.length ? (state.page - 1) * PAGE_SIZE + 1 : 0
    const to = Math.min(state.page * PAGE_SIZE, list.length)
    const range = list.length ? `${from}-${to} of ${list.length} coworkers` : `0 of ${PEOPLE.length} coworkers`
    // The count row is a slim grey band (12px text) with no lines above or below.
    const count = `<div class="fs-xs fw-semibold" style="display:flex;align-items:center;padding:4px 16px;background:var(--bs-bg-1);min-height:28px">${range}</div>`
    // No line between the last row and the footer.
    const page = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE)
    const pageLink = (label, target, { disabled, active, aria } = {}) =>
      `<li class="page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}"><a class="page-link" href="#" data-goto="${target}"${aria ? ` aria-label="${aria}"` : ''}${active ? ' aria-current="page"' : ''}>${label}</a></li>`
    const body = list.length
      ? '<div style="overflow-x:auto"><table class="table" style="margin:0"><thead><tr><th scope="col">Name</th><th scope="col">Permissions</th><th scope="col">Language</th><th scope="col">2FA</th><th scope="col">Profile access</th><th scope="col">Location access</th><th scope="col">Status</th></tr></thead><tbody>' +
        page.map((p, i) => ((row) => i === page.length - 1 ? row.replaceAll('<td>', '<td style="border-bottom-width:0">') : row)(`<tr><td><div class="fw-semibold">${p.first} ${p.last}</div><div class="fs-xs fg-3">${p.email}</div></td><td>${p.permissions}</td><td>${p.language}</td><td>${p.twofa}</td><td>${p.profileAccess}</td><td>${p.locationAccess}</td><td><span class="badge ${p.status === 'Active' ? 'theme-success' : 'theme-secondary'} badge-subtle">${p.status}</span></td></tr>`)).join('') +
        '</tbody></table></div>' +
        '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:10px 16px;background:var(--bs-bg-1)">' +
        `<span class="fs-xs fw-semibold">${range}</span>` +
        '<nav aria-label="Pagination" style="margin-inline-start:auto"><ul class="pagination pagination-sm theme-primary" style="margin:0">' +
        pageLink('<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>', state.page - 1, { disabled: state.page <= 1, aria: 'Previous page' }) +
        Array.from({ length: pageCount }, (_, i) => pageLink(String(i + 1), i + 1, { active: state.page === i + 1 })).join('') +
        pageLink('<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>', state.page + 1, { disabled: state.page >= pageCount, aria: 'Next page' }) +
        '</ul></nav></div>'
      : '<div style="padding:48px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center"><h3 class="fs-md fw-semibold m-0">No matches found</h3><p class="fg-2 m-0" style="max-width:52ch">We couldn\'t find anything matching your search. Try adjusting your keywords, filters, or check for typos.</p></div>'
    root.querySelector('[data-results]').innerHTML = count + body
  }

  root.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-pick]')
    if (pick) {
      const key = pick.dataset.pick
      const value = pick.dataset.value
      if (key === 'sort') state.sort = SORTS.findIndex((x) => x.label === value)
      else {
        const d = DEFS.find((x) => x.key === key)
        const v = state.values[key]
        state.values[key] = d.multi ? (v.includes(value) ? v.filter((x) => x !== value) : [...v, value]) : value
        state.page = 1
      }
      update()
      return
    }
    const go = e.target.closest('[data-goto]')
    if (go) {
      e.preventDefault()
      if (!go.closest('.disabled')) { state.page = Number(go.dataset.goto); update() }
      return
    }
    if (e.target.closest('[data-clear]')) {
      state.query = ''
      state.values = defaults()
      state.page = 1
      root.querySelector('[data-query]').value = ''
      update()
    }
  })
  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-query]')) { state.query = e.target.value; state.page = 1; update() }
  })
  // Redraw the bar when it crosses the narrow width.
  let wasNarrow = null
  new ResizeObserver(() => {
    const now = root.clientWidth < NARROW
    if (now !== wasNarrow) { wasNarrow = now; render() }
  }).observe(root)
  render()
}
