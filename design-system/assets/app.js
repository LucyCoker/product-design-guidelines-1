// Filmmakers component library. Renders data/components.json.
import * as bootstrap from './bootstrap.bundle.min.js'

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const slug = (item) => item.code.toLowerCase()

// Examples are HTML on one line. Put each tag on its own line for reading.
function formatMarkup(html) {
  let depth = 0
  return html
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map((line) => {
      if (/^<\//.test(line)) depth = Math.max(depth - 1, 0)
      const out = '  '.repeat(depth) + line
      if (/^<[a-z][^>]*[^/]>$/i.test(line) && !/^<(input|img|hr|br)\b/i.test(line) && !/<\/[a-z]+>$/i.test(line)) depth++
      return out
    })
    .join('\n')
}

function flagHtml(flag) {
  const badge = flag.type === 'ask'
    ? '<span class="badge theme-warning badge-subtle">ASK</span>'
    : '<i class="fa-solid fa-circle-info fg-3" aria-hidden="true"></i>'
  return `<p class="lib-flag">${badge}<span>${escapeHtml(flag.text)}</span></p>`
}

const GUIDE_BASE = 'https://denkungsart.github.io/product-design-guidelines/'
const guideUrl = (path) => /^https?:/.test(path) ? path : GUIDE_BASE + path.replace(/\.md$/, '/')
const itemId = (item) => item.id || slug(item)

// One allowed version: live example, name, optional class badge and caption.
function exampleHtml(example) {
  return `<figure class="lib-example${example.wide ? ' lib-example-wide' : ''}">
    <div class="lib-example-stage">${example.html}</div>
    <figcaption><b>${escapeHtml(example.label)}</b>${example.badge ? `<span class="badge ${example.badge === 'Default' ? 'theme-primary' : 'theme-secondary'} badge-subtle">${escapeHtml(example.badge)}</span>` : ''}
      ${example.caption ? `<span>${escapeHtml(example.caption)}</span>` : ''}</figcaption>
  </figure>`
}

function itemHtml(item) {
  const chips = [
    item.code ? `<span class="badge theme-secondary badge-subtle">${item.code}</span>` : '',
    item.status === 'Custom' ? '<span class="badge theme-secondary">Custom</span>' : '',
    item.unresolved ? '<span class="badge theme-warning badge-subtle">Unresolved</span>' : ''
  ].join('')
  const meta = [
    item.classes ? `<span>Classes <code>${escapeHtml(item.classes)}</code></span>` : '',
    item.docs ? `<a href="${item.docs}" target="_blank" rel="noopener">Bootstrap 6 docs</a>` : '',
    item.guide ? `<a href="${guideUrl(item.guide)}" target="_blank" rel="noopener">Guideline</a>` : '',
    item.replaces && item.replaces !== '(none)' ? `<span>Replaces ${escapeHtml(item.replaces)}</span>` : ''
  ].join('')

  let preview = ''
  let markup = item.example || ''
  if (item.examples) {
    markup = item.examples.map((e) => `<!-- ${e.label} -->\n${formatMarkup(e.html)}`).join('\n\n')
    preview = item.examples.length ? `<div class="lib-examples">${item.examples.map(exampleHtml).join('')}</div>` : ''
  } else if (item.example) {
    markup = formatMarkup(item.example)
    preview = `<div class="lib-preview" data-layout="${item.layout}">${item.example}</div>`
  } else {
    preview = '<div class="lib-preview-missing"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>Example not shared yet.</span></div>'
  }
  const code = markup
    ? `<details class="lib-code"><summary><i class="fa-solid fa-chevron-right fs-xs" aria-hidden="true"></i>Code</summary>
        <div class="lib-code-box"><button type="button" class="btn-text theme-secondary btn-xs lib-copy">Copy</button><pre><code>${escapeHtml(markup)}</code></pre></div></details>`
    : ''
  // Rules are written in this repo and may carry inline markup.
  const rules = item.rules?.length ? `<ul class="lib-rules">${item.rules.map((r) => `<li>${r}</li>`).join('')}</ul>` : ''
  return `<article class="lib-item" id="${itemId(item)}">
    <div class="lib-item-head"><h3>${escapeHtml(item.name)}</h3>${chips}</div>
    ${meta ? `<div class="lib-item-meta">${meta}</div>` : ''}
    ${item.note ? `<p class="lib-note">${escapeHtml(item.note)}</p>` : ''}
    ${preview}
    ${rules}
    ${item.flags.map(flagHtml).join('')}
    ${code}
  </article>`
}

function pageHtml(group, parent) {
  const crumbs = parent
    ? `<nav class="lib-crumbs" aria-label="Breadcrumb"><a href="#${parent.id}">${parent.title}</a><span aria-hidden="true">/</span><span>${escapeHtml(group.title)}</span></nav>`
    : ''
  return `<section class="lib-page" data-page="${group.id}"${parent ? ` data-parent="${parent.id}"` : ''} data-title="${escapeHtml(group.title)}" hidden>
    ${crumbs}
    <div class="lib-page-head"><h1>${escapeHtml(group.title)}</h1><p>${escapeHtml(group.intro)}</p></div>
    <div>${group.items.map(itemHtml).join('')}</div>
  </section>`
}

const sideLinks = (groups) => groups.map((g) =>
  `<a href="#${g.id}" class="lib-sub">${escapeHtml(g.title)}<span class="lib-count">${g.items.length}</span></a>`).join('')

function render(data) {
  const icons = data.groups.find((g) => g.id === 'icons')
  $('#icons-items').innerHTML = icons.items.map(itemHtml).join('')

  const inSection = (name) => data.groups.filter((g) => g.section === name)
  const components = inSection('components')
  const organisms = inSection('organisms')
  $('#component-pages').outerHTML = components.map((g) => pageHtml(g, { id: 'components', title: 'Components' })).join('')
  $('#organism-pages').outerHTML = organisms.map((g) => pageHtml(g, { id: 'organisms', title: 'Organisms' })).join('')
  $('#shell-page').outerHTML = inSection('app-shell').map((g) => pageHtml(g, null)).join('')
  $('#side-components').insertAdjacentHTML('beforeend', sideLinks(components))
  $('#side-organisms').insertAdjacentHTML('beforeend', sideLinks(organisms))

  $('#components-excluded').innerHTML =
    `<div class="lib-page-head"><h2 class="h5">Not included</h2><p>Retired in the mapping, with no Bootstrap 6 component.</p></div>
     <ul class="lib-rules">${data.excluded.map((e) => `<li><b>${e.code}</b> ${escapeHtml(e.replaces)}: ${escapeHtml(e.reason)}</li>`).join('')}</ul>`

  // Overview pages list their child pages as cards.
  for (const overview of $$('[data-overview]')) {
    const parent = overview.dataset.overview
    overview.innerHTML = $$(`.lib-page[data-parent="${parent}"]`).map((page) => {
      const count = $$('.lib-item', page).length
      const intro = $('.lib-page-head p', page)?.textContent || ''
      return `<a class="card" href="#${page.dataset.page}"><div class="card-body">
        <small>${count ? `${count} ${count === 1 ? 'item' : 'items'}` : 'Foundation'}</small>
        <b>${escapeHtml(page.dataset.title)}</b><p>${escapeHtml(intro)}</p></div></a>`
    }).join('')
  }
}

// Pages -------------------------------------------------------------------
// One page shows at a time. The hash names a page (#buttons) or a
// component (#btn-2), which opens its page and scrolls to it.
function pagerHtml(page, order) {
  const i = order.indexOf(page.dataset.page)
  const link = (id, dir) => {
    const target = $(`.lib-page[data-page="${id}"]`)
    if (!target) return '<span></span>'
    return `<a class="lib-pager-${dir}" href="#${id}"><small>${dir === 'prev' ? 'Previous' : 'Next'}</small><b>${escapeHtml(target.dataset.title)}</b></a>`
  }
  return `<nav class="lib-pager" aria-label="Pages">${link(order[i - 1], 'prev')}${link(order[i + 1], 'next')}</nav>`
}

function setupPages() {
  const order = $$('.lib-side a').map((a) => a.hash.slice(1))
  for (const page of $$('.lib-page')) page.insertAdjacentHTML('beforeend', pagerHtml(page, order))

  const show = () => {
    const id = location.hash.slice(1) || 'foundations'
    const target = document.getElementById(id)
    const page = $(`.lib-page[data-page="${id}"]`) || target?.closest('.lib-page') || $('.lib-page[data-page="foundations"]')
    $$('.lib-page').forEach((p) => { p.hidden = p !== page })
    const current = page.dataset.page
    $$('.lib-side a').forEach((a) => {
      const hit = a.hash === '#' + current
      a.setAttribute('aria-current', hit ? 'page' : 'false')
    })
    document.title = `${page.dataset.title} · Filmmakers Component Library`
    if (target && !target.matches('.lib-page')) target.scrollIntoView({ block: 'start' })
    else window.scrollTo(0, 0)
  }
  addEventListener('hashchange', show)
  show()
}

// Examples are specimens. Stop their links from jumping the page.
function quietExamples() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.lib-preview a[href="#"]')
    if (link) e.preventDefault()
  })
}

// Example frames clip overflow, so menus inside them open with fixed
// positioning. Set at runtime so the copied code stays clean.
function freeMenus() {
  $$('.lib-examples [data-bs-toggle="menu"], .lib-preview [data-bs-toggle="menu"]').forEach((el) => el.setAttribute('data-bs-strategy', 'fixed'))
}

function setupTooltips() {
  $$('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getOrCreateInstance(el))
}

// Progress example: simulate an upload.
function setupUploadDemo() {
  document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-demo-upload]')
    if (!button) return
    const box = button.closest('.lib-preview')
    const bar = $('.progress', box)
    const label = $('[data-demo-label]', box)
    let pct = 0
    button.disabled = true
    const timer = setInterval(() => {
      pct = Math.min(pct + 12, 100)
      bar.setAttribute('aria-valuenow', pct)
      $('.progress-bar', bar).style.width = pct + '%'
      label.textContent = pct + '%'
      if (pct === 100) { clearInterval(timer); button.disabled = false }
    }, 180)
  })
}

function setupCopy() {
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('.lib-copy')
    if (!button) return
    const pre = button.parentElement.querySelector('pre')
    try {
      await navigator.clipboard.writeText(pre.textContent)
      button.textContent = 'Copied'
    } catch {
      getSelection().selectAllChildren(pre)
      button.textContent = 'Selected'
    }
    setTimeout(() => { button.textContent = 'Copy' }, 1500)
  })
}

// Search -------------------------------------------------------------------
// Searches every page and component: names, codes, classes and notes.
function buildIndex() {
  const entries = []
  for (const page of $$('.lib-page')) {
    const parent = page.dataset.parent ? $(`.lib-page[data-page="${page.dataset.parent}"]`)?.dataset.title : ''
    entries.push({
      title: page.dataset.title,
      where: parent || 'Section',
      href: '#' + page.dataset.page,
      text: ($('.lib-page-head p', page)?.textContent || '').toLowerCase()
    })
    for (const item of $$('.lib-item', page)) {
      const code = $('.lib-item-head .badge', item)?.textContent || ''
      entries.push({
        title: $('h3', item).textContent,
        where: page.dataset.title + (code && /^[A-Z]+-\d+$/.test(code) ? ` · ${code}` : ''),
        href: '#' + item.id,
        text: [code, $('.lib-item-meta code', item)?.textContent, $('.lib-note', item)?.textContent, $$('.lib-example figcaption b', item).map((b) => b.textContent).join(' ')].join(' ').toLowerCase()
      })
    }
  }
  return entries
}

function search(entries, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase()
      if (!words.every((w) => title.includes(w) || entry.text.includes(w) || entry.where.toLowerCase().includes(w))) return null
      const score = (title.startsWith(words[0]) ? 0 : title.includes(words[0]) ? 1 : 2) + (entry.where === 'Section' ? 0 : 0.5)
      return { entry, score }
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
    .map((r) => r.entry)
}

function highlight(text, query) {
  const safe = escapeHtml(text)
  const words = query.split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return words.length ? safe.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>') : safe
}

function setupSearch() {
  const input = $('#lib-search')
  const list = $('#lib-search-results')
  const entries = buildIndex()
  let results = []
  let active = -1

  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1 }
  const select = (i) => {
    active = i
    $$('[role="option"]', list).forEach((el, n) => el.setAttribute('aria-selected', String(n === i)))
    const el = $(`#lib-opt-${i}`)
    if (el) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }) }
  }
  const go = (entry) => { close(); input.value = ''; input.blur(); location.hash = entry.href }

  const update = () => {
    const query = input.value.trim()
    if (!query) return close()
    results = search(entries, query)
    list.innerHTML = results.length
      ? results.map((r, i) => `<a class="menu-item" role="option" id="lib-opt-${i}" href="${r.href}" aria-selected="false"><b>${highlight(r.title, query)}</b><small>${escapeHtml(r.where)}</small></a>`).join('')
      : `<div class="lib-search-empty">Nothing matches “${escapeHtml(query)}”.</div>`
    list.hidden = false
    input.setAttribute('aria-expanded', 'true')
    select(results.length ? 0 : -1)
  }

  input.addEventListener('input', update)
  input.addEventListener('focus', () => { if (input.value.trim()) update() })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); select((active + 1) % results.length) }
    else if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); select((active - 1 + results.length) % results.length) }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]) }
    else if (e.key === 'Escape') { if (!list.hidden) close(); else { input.value = ''; input.blur() } }
  })
  list.addEventListener('mousedown', (e) => e.preventDefault())
  list.addEventListener('click', (e) => {
    const option = e.target.closest('[role="option"]')
    if (!option) return
    e.preventDefault()
    go(results[Number(option.id.split('-').pop())])
  })
  input.addEventListener('blur', close)
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest('input, textarea, select, [contenteditable]')) { e.preventDefault(); input.focus() }
  })
}

// Preview primary ----------------------------------------------------------
const NAMES = { default: 'Default blue', 'var(--bs-red-600)': 'Red', 'var(--bs-green-600)': 'Green' }

function setPrimary(value) {
  const root = document.documentElement
  if (value === 'default') root.style.removeProperty('--fm-primary')
  else root.style.setProperty('--fm-primary', value)
  $('#primary-name').textContent = NAMES[value] || value
  $$('[data-primary]').forEach((item) => item.classList.toggle('active', item.dataset.primary === value))
  try { value === 'default' ? localStorage.removeItem('fm-primary') : localStorage.setItem('fm-primary', value) } catch {}
}

function setupPrimary() {
  $$('[data-primary]').forEach((item) => item.addEventListener('click', () => setPrimary(item.dataset.primary)))
  $('#primary-picker').addEventListener('input', (e) => setPrimary(e.target.value))
  let saved = null
  try { saved = localStorage.getItem('fm-primary') } catch {}
  if (saved) setPrimary(saved)
}

async function start() {
  // Light only: pin Bootstrap's theme attribute too.
  document.documentElement.setAttribute('data-bs-theme', 'light')
  setupPrimary()
  try {
    const response = await fetch(new URL('../data/components.json', import.meta.url))
    render(await response.json())
  } catch (error) {
    $('#components-excluded').innerHTML = '<div class="alert theme-danger" role="alert">The component list did not load. Serve this folder over HTTP, not as a file.</div>'
    console.error(error)
    setupPages()
    return
  }
  quietExamples()
  freeMenus()
  setupTooltips()
  setupUploadDemo()
  setupCopy()
  setupPages()
  setupSearch()
}

start()
