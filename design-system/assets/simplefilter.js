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
// Invented sample people.
const PEOPLE = [
  { first: 'Alex', last: 'Martin', email: 'alex.martin@example.com', permissions: 'Admin', language: 'English', twofa: 'Enabled', profileAccess: 'All profiles', locationAccess: 'All locations', status: 'Active', created: '2022-02-01' },
  { first: 'Sam', last: 'Richter', email: 'sam.richter@example.com', permissions: 'Limited', language: 'English', twofa: 'Disabled', profileAccess: 'No profiles', locationAccess: 'No locations', status: 'Active', created: '2022-07-19' },
  { first: 'Jo', last: 'Becker', email: 'jo.becker@example.com', permissions: 'Limited', language: 'German', twofa: 'Disabled', profileAccess: 'No profiles', locationAccess: 'No locations', status: 'Active', created: '2022-11-21' },
  { first: 'Mara', last: 'Feld', email: 'mara.feld@example.com', permissions: 'Read only', language: 'French', twofa: 'Disabled', profileAccess: 'No profiles', locationAccess: 'No locations', status: 'Inactive', created: '2023-03-04' }
]
const PAGE_SIZE = 3
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
    `<button type="button" class="btn-text theme-secondary btn-sm" data-toggle="${key}" aria-haspopup="menu" aria-expanded="${state.open === key}" style="white-space:nowrap;gap:6px;--bs-btn-bg:var(--bs-bg-2)">` +
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

    const bar =
      '<div style="display:flex;align-items:center;gap:8px 20px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--bs-border-color)">' +
      '<div class="input-group input-group-sm" style="width:min(240px,100%);flex:0 0 auto">' +
      `<input class="form-control form-control-sm" type="search" data-query placeholder="Search name, email" aria-label="Search coworkers" value="${esc(state.query)}">` +
      '<button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Search" title="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button></div>' +
      DEFS.map(filter).join('') +
      (anyApplied ? '<button type="button" class="btn-text theme-primary btn-sm" data-clear style="white-space:nowrap"><i class="fa-solid fa-xmark" aria-hidden="true"></i>Clear filters</button>' : '') +
      `<div style="position:relative;display:flex;margin-inline-start:auto">${trigger('sort', 'Sort by', SORTS[state.sort].label, false)}${state.open === 'sort' ? menu('sort', sortItems, true) : ''}</div>` +
      '</div>'

    const page = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE)
    const pageLink = (label, target, { disabled, active, aria } = {}) =>
      `<li class="page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}"><a class="page-link" href="#" data-goto="${target}"${aria ? ` aria-label="${aria}"` : ''}${active ? ' aria-current="page"' : ''}>${label}</a></li>`
    const body = list.length
      ? '<table class="table" style="margin:0"><thead><tr><th scope="col">Name</th><th scope="col">Permissions</th><th scope="col">Language</th><th scope="col">2FA</th><th scope="col">Profile access</th><th scope="col">Location access</th><th scope="col">Status</th></tr></thead><tbody>' +
        page.map((p) => `<tr><td><div class="fw-semibold">${p.first} ${p.last}</div><div class="fs-xs fg-3">${p.email}</div></td><td>${p.permissions}</td><td>${p.language}</td><td>${p.twofa}</td><td>${p.profileAccess}</td><td>${p.locationAccess}</td><td><span class="badge ${p.status === 'Active' ? 'theme-success' : 'theme-secondary'} badge-subtle">${p.status}</span></td></tr>`).join('') +
        '</tbody></table>' +
        '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:10px 16px;background:var(--bs-bg-1);border-top:1px solid var(--bs-border-subtle)">' +
        `<span style="font-size:14px;font-weight:600">${from}-${to} of ${list.length} coworkers</span>` +
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
    root.innerHTML = `<div class="card" style="overflow:visible;width:100%">${bar}${body}</div>`
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
      if (!go.closest('.disabled')) { state.page = Number(go.dataset.goto); render() }
      return
    }
    if (e.target.closest('[data-clear]')) {
      state.query = ''
      state.values = defaults()
      state.page = 1
      state.open = null
      render()
    }
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
  render()
}
