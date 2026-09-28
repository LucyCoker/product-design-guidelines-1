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

function itemHtml(item) {
  const chips = [
    `<span class="badge theme-secondary badge-subtle">${item.code}</span>`,
    item.status === 'Custom' ? '<span class="badge theme-secondary">Custom</span>' : '',
    item.unresolved ? '<span class="badge theme-warning badge-subtle">Unresolved</span>' : ''
  ].join('')
  const meta = [
    item.classes ? `<span>Classes <code>${escapeHtml(item.classes)}</code></span>` : '',
    item.docs ? `<a href="${item.docs}" target="_blank" rel="noopener">Bootstrap 6 docs</a>` : '',
    item.replaces && item.replaces !== '(none)' ? `<span>Replaces ${escapeHtml(item.replaces)}</span>` : ''
  ].join('')
  const preview = item.example
    ? `<div class="lib-preview" data-layout="${item.layout}">${item.example}</div>`
    : '<div class="lib-preview-missing"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>Example not shared yet.</span></div>'
  const code = item.example
    ? `<details class="lib-code"><summary><i class="fa-solid fa-chevron-right fs-xs" aria-hidden="true"></i>Code</summary>
        <div class="lib-code-box"><button type="button" class="btn-text theme-secondary btn-xs lib-copy">Copy</button><pre><code>${escapeHtml(formatMarkup(item.example))}</code></pre></div></details>`
    : ''
  return `<article class="lib-item" id="${slug(item)}">
    <div class="lib-item-head"><h3>${escapeHtml(item.name)}</h3>${chips}</div>
    <div class="lib-item-meta">${meta}</div>
    ${item.note ? `<p class="lib-note">${escapeHtml(item.note)}</p>` : ''}
    ${item.flags.map(flagHtml).join('')}
    ${preview}
    ${code}
  </article>`
}

function groupHtml(group) {
  return `<div class="lib-group" id="${group.id}">
    <div class="lib-group-head"><h2>${escapeHtml(group.title)}</h2><p>${escapeHtml(group.intro)}</p></div>
    <div>${group.items.map(itemHtml).join('')}</div>
  </div>`
}

function render(data) {
  const icons = data.groups.find((g) => g.id === 'icons')
  $('#icons-items').innerHTML = icons.items.map(itemHtml).join('')

  const groups = data.groups.filter((g) => g.section === 'components')
  const excluded = data.excluded.map((e) => `<li><b>${e.code}</b> ${escapeHtml(e.replaces)}: ${escapeHtml(e.reason)}</li>`).join('')
  $('#components-items').innerHTML = groups.map(groupHtml).join('') +
    `<div class="lib-group"><div class="lib-group-head"><h2>Not included</h2><p>Retired in the mapping, with no Bootstrap 6 component.</p></div><ul class="lib-rules">${excluded}</ul></div>`

  $('#side-components').insertAdjacentHTML('beforeend', groups.map((g) =>
    `<a href="#${g.id}" class="lib-sub">${escapeHtml(g.title)}<span class="lib-count">${g.items.length}</span></a>`).join(''))
}

// Examples are specimens. Stop their links from jumping the page.
function quietExamples() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.lib-preview a[href="#"]')
    if (link) e.preventDefault()
  })
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

function setupNav() {
  const links = $$('.lib-side a')
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a.hash === '#' + entry.target.id)))
    }
  }, { rootMargin: '-15% 0px -75% 0px' })
  $$('.lib-group[id], .lib-section').forEach((el) => observer.observe(el))
}

async function start() {
  setupPrimary()
  try {
    const response = await fetch(new URL('../data/components.json', import.meta.url))
    render(await response.json())
  } catch (error) {
    $('#components-items').innerHTML = '<div class="alert theme-danger" role="alert">The component list did not load. Serve this folder over HTTP, not as a file.</div>'
    console.error(error)
    return
  }
  quietExamples()
  setupTooltips()
  setupUploadDemo()
  setupCopy()
  setupNav()
}

start()
