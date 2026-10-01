// Filmmakers component library. Renders data/components.json.
import * as bootstrap from './bootstrap.bundle.min.js'
import { initFilterBar } from './filterbar.js'
import { initSimpleFilter } from './simplefilter.js'

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
    <figcaption><b>${escapeHtml(example.label)}</b>${example.badge ? `<span class="badge ${example.badge === 'Default' ? 'theme-primary' : example.badge === 'ASK' ? 'theme-warning' : 'theme-secondary'} badge-subtle">${escapeHtml(example.badge)}</span>` : ''}
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
  // Related pages, such as responsive behaviour, as buttons under the note.
  const links = item.links?.length
    ? `<div class="lib-item-links">${item.links.map((l) => `<a class="btn-outline theme-secondary btn-sm" href="${l.href}"><i class="fa-solid ${l.icon || 'fa-arrow-right'}" aria-hidden="true"></i>${escapeHtml(l.label)}</a>`).join('')}</div>`
    : ''

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
    <div class="lib-item-head"><h3 class="fs-md">${escapeHtml(item.name)}</h3>${chips}</div>
    ${meta ? `<div class="lib-item-meta">${meta}</div>` : ''}
    ${item.note ? `<p class="lib-note">${escapeHtml(item.note)}</p>` : ''}
    ${links}
    ${preview}
    ${rules}
    ${item.flags.map(flagHtml).join('')}
    ${code}
  </article>`
}

// parent is the page this one sits under; a sub-page also names its section
// so the breadcrumb shows the whole path.
function pageHtml(group, parent, section) {
  const trail = [section, parent].filter(Boolean)
  const crumbs = trail.length
    ? `<nav class="lib-crumbs" aria-label="Breadcrumb">${trail.map((t) => `<a href="#${t.id}">${escapeHtml(t.title)}</a><span aria-hidden="true">/</span>`).join('')}<span>${escapeHtml(group.title)}</span></nav>`
    : ''
  // introHtml is written in this repo and may carry markup, like rules.
  return `<section class="lib-page" data-page="${group.id}"${parent ? ` data-parent="${parent.id}"` : ''} data-title="${escapeHtml(group.title)}" hidden>
    ${crumbs}
    <div class="lib-page-head"><h1 class="fs-2xl">${escapeHtml(group.title)}</h1><p>${escapeHtml(group.intro)}</p></div>
    ${group.introHtml || ''}
    <div>${group.items.map(itemHtml).join('')}</div>
  </section>`
}

const sideLinks = (groups) => groups.map((g) =>
  `<a href="#${g.id}" class="lib-sub">${escapeHtml(g.title)}<span class="lib-count">${g.items.length}</span></a>`).join('')

function render(data) {
  const icons = data.groups.find((g) => g.id === 'icons')
  $('#icons-items').innerHTML = icons.items.map(itemHtml).join('')

  // Sub-pages sit under another page: not in the sidebar or overview.
  const inSection = (name) => data.groups.filter((g) => g.section === name && !g.subpageOf)
  const components = inSection('components')
  const organisms = inSection('organisms')
  const forms = inSection('forms')
  const templates = inSection('templates')
  $('#component-pages').outerHTML = components.map((g) => pageHtml(g, { id: 'components', title: 'Components' })).join('')
  $('#template-pages').outerHTML = templates.map((g) => pageHtml(g, { id: 'templates', title: 'Templates' })).join('')
  $('#form-pages').outerHTML = forms.map((g) => pageHtml(g, { id: 'forms', title: 'Forms' })).join('')
  const section = { id: 'organisms', title: 'Organisms' }
  $('#organism-pages').outerHTML = organisms.map((g) => pageHtml(g, section)).join('') +
    data.groups.filter((g) => g.subpageOf).map((g) => {
      const parent = data.groups.find((p) => p.id === g.subpageOf)
      return pageHtml(g, { id: parent.id, title: parent.title }, section)
    }).join('')
  const areaSpecific = inSection('organisms-area')
  $('#organism-area-pages').outerHTML = areaSpecific.map((g) => pageHtml(g, { id: 'organisms-area', title: 'Organisms: Area specific' })).join('')
  $('#shell-page').outerHTML = inSection('app-shell').map((g) => pageHtml(g, null)).join('')
  $('#side-components').insertAdjacentHTML('beforeend', sideLinks(components))
  $('#side-forms').insertAdjacentHTML('beforeend', sideLinks(forms))
  $('#side-templates').insertAdjacentHTML('beforeend', sideLinks(templates))
  $('#side-organisms').insertAdjacentHTML('beforeend', sideLinks(organisms))
  $('#side-organisms-area').insertAdjacentHTML('beforeend', sideLinks(areaSpecific))

  $('#components-excluded').innerHTML =
    `<div class="lib-page-head"><h2 class="fs-lg">Not included</h2><p>Retired in the mapping, with no Bootstrap 6 component.</p></div>
     <ul class="lib-rules">${data.excluded.map((e) => `<li><b>${e.code}</b> ${escapeHtml(e.replaces)}: ${escapeHtml(e.reason)}</li>`).join('')}</ul>`

  // Overview pages list their child pages as cards.
  for (const overview of $$('[data-overview]')) {
    const parent = overview.dataset.overview
    overview.innerHTML = $$(`.lib-page[data-parent="${parent}"]`).map((page) => {
      const count = $$('.lib-item', page).length
      const intro = $('.lib-page-head p', page)?.textContent || ''
      return `<a class="card" href="#${page.dataset.page}"><div class="card-body">
        <small>${parent === 'templates' ? 'Template' : count ? `${count} ${count === 1 ? 'item' : 'items'}` : 'Foundation'}</small>
        <b>${escapeHtml(page.dataset.title)}</b><p>${escapeHtml(intro)}</p></div></a>`
    }).join('')
  }
}

// Pages -------------------------------------------------------------------
// One page shows at a time. The hash names a page (#buttons) or a
// component (#btn-2), which opens its page and scrolls to it.
function pagerHtml(page, order) {
  const i = order.indexOf(page.dataset.page)
  const back = i < 0 && page.dataset.parent && $(`.lib-page[data-page="${page.dataset.parent}"]`)
  if (back) return `<nav class="lib-pager" aria-label="Pages"><a class="lib-pager-prev" href="#${page.dataset.parent}"><small>Back to</small><b>${escapeHtml(back.dataset.title)}</b></a><span></span></nav>`
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
    const inSide = (id) => $$('.lib-side a').some((a) => a.hash === '#' + id)
    const current = inSide(page.dataset.page) ? page.dataset.page : page.dataset.parent
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
// Validation example: on Save, mark every invalid field and show a summary
// at the top that links to each one. Fields clear as they become valid.
function setupValidationDemo() {
  for (const form of $$('.lib-validate-demo')) {
    const summary = $('[data-summary]', form)
    const refresh = () => {
      const bad = $$('.form-control', form).filter((c) => !c.checkValidity())
      if (!bad.length) { summary.hidden = true; return bad }
      $('[data-summary-title]', form).textContent = bad.length === 1 ? '1 field needs attention' : `${bad.length} fields need attention`
      $('[data-summary-list]', form).innerHTML = bad.map((c) => `<li><a href="#${c.id}" class="alert-link" data-field="${c.id}">${escapeHtml(form.querySelector(`label[for="${c.id}"]`).firstChild.textContent)}</a></li>`).join('')
      return bad
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const bad = refresh()
      $$('.form-control', form).forEach((c) => c.classList.toggle('is-invalid', bad.includes(c)))
      if (bad.length) {
        summary.hidden = false
        summary.tabIndex = -1
        summary.focus()
      }
    })
    form.addEventListener('input', (e) => {
      if (e.target.checkValidity()) e.target.classList.remove('is-invalid')
      if (!summary.hidden) refresh()
    })
    form.addEventListener('click', (e) => {
      const link = e.target.closest('[data-field]')
      if (link) { e.preventDefault(); document.getElementById(link.dataset.field).focus() }
    })
  }
}

// Toast examples: Show again re-shows a dismissed toast with Bootstrap's
// Toast plugin, using the toast's own data-bs-autohide and data-bs-delay.
function setupToastDemo() {
  document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-demo-toast]')
    if (!button) return
    const toast = button.parentElement.querySelector('.toast')
    bootstrap.Toast.getOrCreateInstance(toast).show()
  })
}

// Alert example: Bootstrap removes a dismissed alert, so the demo hides it
// instead and offers Show again. Real alerts use the plugin as it is.
function setupAlertDemo() {
  for (const alert of $$('[data-demo-alert]')) {
    const again = alert.parentElement.querySelector('[data-demo-alert-again]')
    alert.addEventListener('close.bs.alert', (e) => {
      e.preventDefault()
      alert.hidden = true
      again.hidden = false
      again.focus()
    })
    again.addEventListener('click', () => {
      alert.hidden = false
      again.hidden = true
    })
  }
}

// Links inside examples are placeholders: never navigate, so trying an
// Edit or a chip keeps you on the page.
function quietExampleLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.lib-example-stage a[href], .lib-preview a[href]')
    if (a && a.getAttribute('href').startsWith('#')) e.preventDefault()
  })
}

function freeMenus() {
  $$('.lib-examples [data-bs-toggle="menu"], .lib-preview [data-bs-toggle="menu"]').forEach((el) => el.setAttribute('data-bs-strategy', 'fixed'))
}

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

// Nav overflow (NAV-11): the pages are drawn after Bootstrap loads, so start it here.
function setupNavOverflow() {
  $$('[data-bs-toggle="nav-overflow"]').forEach((el) => bootstrap.NavOverflow.getOrCreateInstance(el))
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

// Prototype kit ------------------------------------------------------------
const KIT = new URL('../prototype-kit/', import.meta.url)
const CDN = 'https://cdn.jsdelivr.net/gh/LucyCoker/product-design-guidelines-1@main/design-system/assets'

// Combinations the guidelines ban, as [all these classes, reason].
const BANNED = [
  [['btn-solid', 'theme-secondary'], 'Solid is only for primary, danger (in a dialog) and inverse.'],
  [['btn-outline', 'theme-primary'], 'Becomes a second primary. Use btn-outline theme-secondary.'],
  [['btn-subtle'], 'Only for the filter and Sort by buttons in Search and filter (Simple). Check this is one of them.'],
  [['btn-styled'], 'Use the default rounded corners.'],
  [['fw-medium'], 'Weight 500 renders as 400 on Windows. Use fw-semibold.'],
  [['fst-italic'], 'No italics for emphasis. Use fw-semibold.']
]
const STATUS = ['theme-success', 'theme-warning', 'theme-info']

async function setupKit() {
  $('#kit-links').textContent = ['bootstrap.min.css', 'fontawesome.css', 'filmmakers.css']
    .map((f) => `<link rel="stylesheet" href="${CDN}/${f}">`).join('\n') +
    `\n<script type="module" src="${CDN}/bootstrap.bundle.min.js"></script>`
  for (const [id, file] of [['#kit-brief', 'PROTOTYPE.md'], ['#kit-starter', 'starter.html']]) {
    try { $(id).textContent = await (await fetch(new URL(file, KIT))).text() } catch { $(id).textContent = `Open design-system/prototype-kit/${file} in the repo.` }
  }
  // One prompt: the brief, then the starter page, then what to build.
  $('#kit-all').textContent = [
    $('#kit-brief').textContent.trim().replace(/^Paste this into[^\n]*\n+/m, ''),
    '## Start from this page\n\nUse this page as the starting point. Keep its head, header and subheader band, and build inside <main>.\n\n```html\n' + $('#kit-starter').textContent.trim() + '\n```',
    '## What to build\n\n[Describe the screen you want here.]'
  ].join('\n\n')

  // Every class the real CSS defines. Anything else in a prototype was invented.
  let known = null
  const loadKnown = async () => {
    if (known) return known
    known = new Set()
    for (const sheet of document.styleSheets) {
      let rules
      try { rules = sheet.cssRules } catch { continue }
      const walk = (list) => { for (const r of list) { if (r.selectorText) for (const m of r.selectorText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) known.add(m[1]); if (r.cssRules) walk(r.cssRules) } }
      walk(rules)
    }
    return known
  }
  // Known fixes for classes that look plausible but do not exist here.
  const HINTS = {
    'menu-end': 'Not in this Bootstrap 6 build. Put data-bs-placement="bottom-end" on the trigger instead.',
    'badge-dot': 'Not in this Bootstrap 6 build. Use a small badge with visually-hidden text.',
    'alert-info': 'Bootstrap 5 name. Use alert theme-info.',
    'alert-danger': 'Bootstrap 5 name. Use alert theme-danger.',
    'text-danger': 'Bootstrap 5 name. Use fg-danger.',
    'text-muted': 'Bootstrap 5 name. Use fg-3.',
    'btn-primary': 'Bootstrap 5 name. Use btn-solid theme-primary.',
    'btn-secondary': 'Bootstrap 5 name. Use btn-outline theme-secondary.',
    'dropdown-menu': 'Bootstrap 5 name. Use menu.',
    'dropdown-item': 'Bootstrap 5 name. Use menu-item.'
  }
  // Placeholders filled in when a template runs: {{ … }} (Claude Design and
  // most template languages) and ${ … } (JavaScript template strings).
  const TEMPLATE = /\{\{[\s\S]*?\}\}|\$\{[\s\S]*?\}/g

  $('#kit-check-run').addEventListener('click', async () => {
    const html = $('#kit-check').value
    if (!html.trim()) { $('#kit-check-out').innerHTML = '<p class="lib-note">Paste some HTML first.</p>'; return }
    const classes = await loadKnown()

    // Classes the prototype defines itself, in its own <style> blocks.
    const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n')
    const local = new Set([...css.replace(/\{[^{}]*\}/g, '{}').matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]))
    const cssColours = [...css.matchAll(/([^{};]+)\{([^}]*)\}/g)]
      .flatMap(([, sel, body]) => body.split(';').filter((d) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(d)).map((d) => `<code>${escapeHtml(sel.trim())} { ${escapeHtml(d.trim())} }</code>`))

    // Read class lists straight from the source, so markup inside templates
    // and scripts is checked too.
    const unknown = new Map()
    const invented = new Map()
    const dynamic = new Map()
    const banned = []
    let lists = 0
    let primaries = 0
    for (const m of html.matchAll(/\b(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g)) {
      if (m[3] !== undefined) { dynamic.set(`className={${m[3].trim()}}`, (dynamic.get(`className={${m[3].trim()}}`) || 0) + 1); continue }
      lists++
      const raw = m[1] ?? m[2]
      const holes = []
      const masked = raw.replace(TEMPLATE, (t) => { holes.push(t); return `\u0000${holes.length - 1}\u0000` })
      const tokens = masked.split(/\s+/).filter(Boolean)
      const list = []
      for (const t of tokens) {
        if (t.includes('\u0000')) {
          const shown = t.replace(/\u0000(\d+)\u0000/g, (_, i) => holes[i].replace(/\s+/g, ' '))
          dynamic.set(shown, (dynamic.get(shown) || 0) + 1)
          continue
        }
        list.push(t)
        if (classes.has(t)) continue
        const bucket = local.has(t) ? invented : unknown
        bucket.set(t, (bucket.get(t) || 0) + 1)
      }
      for (const [all, why] of BANNED) if (all.every((c) => list.includes(c))) banned.push(`<code>${all.join(' ')}</code>: ${why}`)
      if (list.some((c) => /^btn-(solid|outline|text)$/.test(c)) && list.some((c) => STATUS.includes(c))) banned.push(`<code>${escapeHtml(list.join(' '))}</code>: status themes are never used on buttons.`)
      if (list.includes('btn-solid') && list.includes('theme-primary')) primaries++
    }
    if (primaries > 1) banned.push(`${primaries} × <code>btn-solid theme-primary</code> in the source. At most one primary per screen, so check these are not on the same screen.`)
    const inline = [...html.matchAll(/\bstyle\s*=\s*"([^"]*)"/g)].map((m) => m[1]).filter((v) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(v))

    const count = (map, hint) => [...map].map(([c, n]) => `<code>${escapeHtml(c)}</code>${n > 1 ? ` × ${n}` : ''}${hint && HINTS[c] ? ` — ${escapeHtml(HINTS[c])}` : ''}`)
    const block = (title, note, items, state) => `<p class="lib-flag"><span class="badge theme-${items.length ? state : 'success'} badge-subtle">${items.length || '✓'}</span><span><b>${title}</b>${note ? ` <span class="fg-3">${note}</span>` : ''}</span></p>` + (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '')
    $('#kit-check-out').innerHTML =
      `<p class="lib-note">Checked ${lists} class lists.${dynamic.size ? (() => { const n = [...dynamic.values()].reduce((a, b) => a + b, 0); return ` ${n} ${n === 1 ? 'value is' : 'values are'} set while the page runs, so ${n === 1 ? 'it is' : 'they are'} listed separately.` })() : ''}</p>` +
      block('Not allowed', 'Banned by the guidelines.', banned, 'danger') +
      block('Classes that do not exist', 'Not in Bootstrap 6 or the Filmmakers layer. A typo, an old name, or another UI kit.', count(unknown, true), 'danger') +
      block('Custom classes', 'Made up by the prototype in its own &lt;style&gt;. Replace with library markup.', count(invented), 'warning') +
      block('Hard-coded colours', 'Use theme classes or var(--bs-…).', [...cssColours, ...inline.map((v) => `<code>style="${escapeHtml(v)}"</code>`)], 'danger') +
      block('Set while the page runs', 'Cannot be checked here. Make sure each value resolves to an allowed class, for example a theme name.', count(dynamic), 'secondary')
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
  $$('[data-filterbar]').forEach(initFilterBar)
  $$('[data-simplefilter]').forEach(initSimpleFilter)
  setupValidationDemo()
  setupToastDemo()
  setupAlertDemo()
  quietExampleLinks()
  freeMenus()
  setupTooltips()
  setupNavOverflow()
  setupRatingDemo()
  setupUploadDemo()
  setupCopy()
  setupPages()
  setupSearch()
  setupKit()
}

start()
