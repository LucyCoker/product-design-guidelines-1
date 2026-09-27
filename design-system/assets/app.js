// Filmmakers Design System site. Plain ES modules, no build step.
import { check } from './rules-engine.js'

const GUIDE_BASE = 'https://denkungsart.github.io/product-design-guidelines/'
const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function storage(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key)
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch { return null }
}

function guideUrl(source) {
  const [path, hash] = source.split('#')
  return GUIDE_BASE + path.replace(/\.md$/, '/') + (hash ? '#' + hash : '')
}

async function loadJson(name) {
  const response = await fetch(new URL(`../data/${name}`, import.meta.url))
  if (!response.ok) throw new Error(`${name}: ${response.status}`)
  return response.json()
}

// ---------------------------------------------------------------------------
// Colour maths. The browser resolves every token (color-mix, light-dark, oklch),
// then a 1px canvas turns the result into sRGB bytes.
// ---------------------------------------------------------------------------
const canvas = document.createElement('canvas')
canvas.width = canvas.height = 1
const ctx = canvas.getContext('2d', { willReadFrequently: true })

function toRgb(cssColor) {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000'
  ctx.fillStyle = cssColor
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return { r, g, b }
}

const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

function luminance({ r, g, b }) {
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function oklab({ r, g, b }) {
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  }
}

// Hue distance in degrees, or null when either colour is close to grey.
function hueDistance(x, y) {
  const p = oklab(x), q = oklab(y)
  if (Math.hypot(p.a, p.b) < 0.05 || Math.hypot(q.a, q.b) < 0.05) return null
  const d = Math.abs(Math.atan2(p.b, p.a) - Math.atan2(q.b, q.a)) * 180 / Math.PI
  return d > 180 ? 360 - d : d
}

// Resolve a CSS colour expression inside a scope element.
function resolve(scope, expression) {
  const probe = document.createElement('span')
  probe.style.color = expression
  probe.style.display = 'none'
  scope.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return toRgb(value)
}

// ---------------------------------------------------------------------------
// Checks for one primary in one scope
// ---------------------------------------------------------------------------
const CHECKS = [
  { id: 'button', label: 'Button text on primary', fg: '--bs-primary-contrast', bg: '--bs-primary-bg', min: 4.5, why: 'Body and UI text' },
  { id: 'text', label: 'Primary text on the page', fg: '--bs-primary-fg', bg: '--bs-bg-body', min: 4.5, why: 'Links and primary text' },
  { id: 'fill', label: 'Primary fill against the page', fg: '--bs-primary-bg', bg: '--bs-bg-body', min: 3, why: 'Controls' },
  { id: 'focus', label: 'Focus ring against the page', fg: '--bs-primary-focus-ring', bg: '--bs-bg-body', min: 3, why: 'Focus indicators' },
  { id: 'zone', label: 'Client zone icon', fg: '--fm-accent-client-zone', bg: '--bs-bg-body', min: 3, why: 'Meaningful graphics' }
]

function runChecks(scope) {
  const results = CHECKS.map((c) => {
    const fg = resolve(scope, `var(${c.fg})`)
    const bg = resolve(scope, `var(${c.bg})`)
    const ratio = contrast(fg, bg)
    return { ...c, fgHex: toHex(fg), bgHex: toHex(bg), ratio, state: ratio >= c.min ? 'pass' : 'fail' }
  })
  const primary = resolve(scope, 'var(--bs-primary-bg)')
  for (const [name, token] of [['danger', '--bs-danger-bg'], ['warning', '--bs-warning-bg']]) {
    const distance = hueDistance(primary, resolve(scope, `var(${token})`))
    const close = distance !== null && distance < 30
    results.push({
      id: `near-${name}`,
      label: `Distinct from ${name}`,
      pair: close ? `${Math.round(distance)}° apart in hue` : 'Clearly different hue',
      state: close ? 'warn' : 'pass',
      needs: close ? `${name} needs icon or text` : '-'
    })
  }
  return results
}

const primaryChecks = (results) => results.filter((r) => ['button', 'text', 'fill', 'focus'].includes(r.id))

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = { brands: [], rules: null, tokens: null, health: null, primary: 'default', exportTab: 'figma', compareMode: 'light' }

const probeHost = document.createElement('div')
probeHost.setAttribute('aria-hidden', 'true')
probeHost.style.cssText = 'position:absolute;inline-size:0;block-size:0;overflow:hidden'
document.body.appendChild(probeHost)

function scopeFor(value, mode) {
  const scope = document.createElement('div')
  scope.setAttribute('data-fm-primary', '')
  scope.style.setProperty('--fm-primary', value === 'default' ? 'var(--bs-blue-600)' : value)
  if (mode) {
    scope.setAttribute('data-bs-theme', mode)
    scope.style.colorScheme = mode
  }
  probeHost.appendChild(scope)
  return scope
}

function primaryName(value) {
  const brand = state.brands.find((b) => b.value === value)
  return brand ? brand.name : `Custom ${value}`
}

function setPrimary(value, { remember = true } = {}) {
  state.primary = value
  const root = document.documentElement
  if (value === 'default') root.style.removeProperty('--fm-primary')
  else root.style.setProperty('--fm-primary', value)
  if (remember) storage('fm-primary', value)

  const hex = toHex(resolve(document.body, 'var(--fm-primary)'))
  $('#brand-color').value = hex
  $('#brand-hex').value = value === 'default' ? hex : value
  const select = $('#brand-select')
  select.value = state.brands.some((b) => b.value === value) ? value : 'custom'
  renderAll()
}

function renderAll() {
  renderVerdict()
  renderContrast()
  renderSwatches()
  renderCompareChecks()
  renderExport()
}

// ---------------------------------------------------------------------------
// Preview bar
// ---------------------------------------------------------------------------
function renderBrandSelect() {
  const select = $('#brand-select')
  select.innerHTML = state.brands.map((b) => `<option value="${escapeHtml(b.value)}">${escapeHtml(b.name)}</option>`).join('') +
    '<option value="custom" disabled>Custom colour</option>'
  select.addEventListener('change', () => setPrimary(select.value))
  $('#brand-color').addEventListener('input', (e) => setPrimary(e.target.value))
  $('#brand-hex').addEventListener('change', (e) => {
    const value = e.target.value.trim()
    if (/^#?[0-9a-f]{6}$/i.test(value)) setPrimary(value.startsWith('#') ? value : '#' + value)
    else e.target.value = state.primary === 'default' ? $('#brand-color').value : state.primary
  })
}

function renderVerdict() {
  const results = primaryChecks(runChecks(document.body))
  const failed = results.filter((r) => r.state === 'fail')
  const out = $('#bar-verdict')
  out.dataset.state = failed.length ? 'fail' : 'pass'
  out.textContent = failed.length
    ? `✕ ${failed.length} contrast ${failed.length === 1 ? 'check fails' : 'checks fail'}`
    : '✓ Passes WCAG AA'
  out.title = results.map((r) => `${r.label}: ${r.ratio.toFixed(2)}:1`).join('\n')
}

function setupModes() {
  const root = document.documentElement
  const buttons = $$('[data-mode]')
  const apply = (mode) => {
    if (mode === 'auto') root.removeAttribute('data-bs-theme')
    else root.setAttribute('data-bs-theme', mode)
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)))
    storage('fm-mode', mode === 'auto' ? null : mode)
    requestAnimationFrame(renderAll)
  }
  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.mode)))
  apply(storage('fm-mode') || 'auto')
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => requestAnimationFrame(renderAll))
  new MutationObserver(() => requestAnimationFrame(renderAll)).observe(root, { attributes: true, attributeFilter: ['data-theme'] })
}

// ---------------------------------------------------------------------------
// Colour section
// ---------------------------------------------------------------------------
function renderContrast() {
  const results = runChecks(document.body)
  $('#contrast-name').textContent = primaryName(state.primary)
  $('#contrast-table tbody').innerHTML = results.map((r) => `
    <tr>
      <td>${escapeHtml(r.label)}</td>
      <td>${r.fgHex ? `<code class="ds-class">${r.fgHex}</code> on <code class="ds-class">${r.bgHex}</code>` : escapeHtml(r.pair)}</td>
      <td class="num">${r.ratio ? r.ratio.toFixed(2) + ':1' : '-'}</td>
      <td class="num">${r.min ? r.min + ':1' : escapeHtml(r.needs)}</td>
      <td><span class="ds-pill" data-state="${r.state}">${r.state === 'pass' ? 'Pass' : r.state === 'fail' ? 'Fail' : 'Second signal'}</span></td>
    </tr>`).join('')
  $('#contrast-ask').hidden = results.find((r) => r.id === 'button').state === 'pass'
}

const PRIMARY_ROLES = ['base', 'bg', 'fg', 'fg-emphasis', 'bg-subtle', 'bg-muted', 'border', 'focus-ring', 'contrast']
const FIXED = [
  ['Success', '--bs-success-bg'], ['Danger', '--bs-danger-bg'], ['Warning', '--bs-warning-bg'], ['Info', '--bs-info-bg'],
  ['Secondary', '--bs-secondary-bg'], ['Client zone', '--fm-accent-client-zone']
]

function swatch(name, token) {
  const hex = toHex(resolve(document.body, `var(${token})`))
  return `<div class="ds-swatch"><div class="ds-swatch-chip" style="background:var(${token})"></div><b>${escapeHtml(name)}</b><code>${token} · ${hex}</code></div>`
}

function renderSwatches() {
  $('#primary-swatches').innerHTML = PRIMARY_ROLES.map((role) => swatch(role, `--bs-primary-${role}`)).join('')
  $('#fixed-swatches').innerHTML = FIXED.map(([name, token]) => swatch(name, token)).join('')
}

// ---------------------------------------------------------------------------
// Compare grid
// ---------------------------------------------------------------------------
function renderCompare() {
  $('#compare').innerHTML = state.brands.map((b) => `
    <div class="ds-tile" data-fm-primary data-brand="${escapeHtml(b.value)}" style="--fm-primary:${b.value === 'default' ? 'var(--bs-blue-600)' : b.value}">
      <div class="ds-tile-head"><span class="ds-tile-dot" aria-hidden="true"></span><b>${escapeHtml(b.name)}</b></div>
      <span class="ds-small ds-muted">${escapeHtml(b.note)}</span>
      <div class="ds-tile-row">
        <button type="button" class="btn-solid theme-primary btn-xs">Publish</button>
        <button type="button" class="btn-outline theme-secondary btn-xs">Save draft</button>
      </div>
      <div class="ds-tile-row">
        <span class="badge badge-subtle theme-warning"><svg class="fm-icon" aria-hidden="true"><use href="#i-alert"></use></svg> Awaiting reply</span>
        <span class="badge badge-subtle theme-danger">Declined</span>
      </div>
      <div class="ds-tile-checks ds-small"></div>
      <button type="button" class="btn-text theme-secondary btn-xs ds-apply">Preview this primary</button>
    </div>`).join('')
  $$('#compare .ds-apply').forEach((button) => button.addEventListener('click', () => {
    setPrimary(button.closest('.ds-tile').dataset.brand)
    $('#preview').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }))
  $$('[data-compare-mode]').forEach((button) => button.addEventListener('click', () => {
    state.compareMode = button.dataset.compareMode
    $$('[data-compare-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)))
    renderCompareChecks()
  }))
}

function renderCompareChecks() {
  for (const tile of $$('#compare .ds-tile')) {
    tile.setAttribute('data-bs-theme', state.compareMode)
    tile.style.colorScheme = state.compareMode
    const results = runChecks(tile)
    const show = results.filter((r) => ['button', 'text', 'near-danger', 'near-warning'].includes(r.id) && (r.id.startsWith('near') ? r.state !== 'pass' : true))
    $('.ds-tile-checks', tile).innerHTML = show.map((r) =>
      `<span class="ds-pill" data-state="${r.state}">${escapeHtml(r.label)}${r.ratio ? ' ' + r.ratio.toFixed(1) + ':1' : ''}</span>`).join('')
  }
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------
const PERMITTED = [
  ['The one primary action', 'btn-solid theme-primary', 'Publish selection', 'Max one per screen'],
  ['Secondary action', 'btn-outline theme-secondary', 'Save draft', 'Cancel, Export, Save draft'],
  ['Tertiary, inline, or in-menu', 'btn-text theme-secondary', 'Discard', 'Discard, Learn more'],
  ['Icon-only action', 'btn-text theme-secondary btn-icon', 'icon', 'Accessible name and tooltip'],
  ['Confirm a destructive action', 'btn-solid theme-danger', 'Remove 3 people', 'Confirmation dialogs only'],
  ['Destructive in a menu or detail page', 'btn-text theme-danger', 'Delete selection', 'Never bare in a table row'],
  ['Any action on a brand surface', 'btn-solid theme-inverse', 'Open selection', 'Primary on inverse', 'surface'],
  ['Secondary on a brand surface', 'btn-outline theme-inverse', 'Not now', '', 'surface'],
  ['Client zone signal', 'btn-outline theme-secondary has-client-zone-icon', 'Preview as client', 'Filmmakers custom class', 'zone']
]

function buttonMarkup(classes, label, kind) {
  const all = `${classes} btn-sm`
  if (label === 'icon') return `<button type="button" class="${all}" aria-label="More actions" title="More actions"><svg class="fm-icon" aria-hidden="true"><use href="#i-more"></use></svg></button>`
  if (kind === 'zone') return `<button type="button" class="${all}"><svg class="fm-icon" aria-hidden="true"><use href="#i-eye"></use></svg>${label}</button>`
  return `<button type="button" class="${all}">${label}</button>`
}

function renderButtons() {
  $('#permitted-table tbody').innerHTML = PERMITTED.map(([purpose, classes, label, note, kind], i) => {
    const markup = buttonMarkup(classes, label, kind)
    const example = kind === 'surface'
      ? `<span class="d-inline-flex p-2 rounded" style="background:var(--bs-primary-bg)">${markup}</span>`
      : markup
    return `<tr>
      <td><b>${escapeHtml(purpose)}</b>${note ? `<br><span class="ds-muted">${escapeHtml(note)}</span>` : ''}</td>
      <td>${example}</td>
      <td><code class="ds-class">${escapeHtml(classes)}</code></td>
      <td><button type="button" class="btn-text theme-secondary btn-xs ds-copy" data-copy-text="${escapeHtml(markup)}">Copy</button></td>
    </tr>`
  }).join('')

  const examples = {
    'button/no-status-theme': '<button type="button" class="btn-solid theme-success btn-sm">Publish</button>',
    'button/solid-reserved': '<button type="button" class="btn-solid theme-secondary btn-sm">Export</button>',
    'button/no-second-primary': '<button type="button" class="btn-outline theme-primary btn-sm">Save draft</button>',
    'button/no-subtle': '<button type="button" class="btn-subtle theme-secondary btn-sm">Filter</button>',
    'button/no-styled': '<button type="button" class="btn-solid btn-styled theme-primary btn-sm">Publish</button>'
  }
  $('#banned-table tbody').innerHTML = state.rules.rules.filter((r) => examples[r.id]).map((r) => `
    <tr>
      <td><span inert>${examples[r.id]}</span></td>
      <td><span class="ds-pill" data-state="fail">Banned</span><br><span class="ds-muted">${escapeHtml(r.message)}</span></td>
    </tr>`).join('')
}

// ---------------------------------------------------------------------------
// Markup checker
// ---------------------------------------------------------------------------
const SAMPLE_MARKUP = `<!-- app/views/selections/show.html.erb (example) -->
<header class="selection-header">
  <h2 class="fw-medium">Lead roles shortlist</h2>
  <span class="fst-italic">Shared with the client</span>
</header>

<div class="toolbar">
  <button class="btn-solid theme-primary btn-sm">Publish selection</button>
  <button class="btn-solid theme-primary btn-sm">Share with client</button>
  <button class="btn-outline theme-primary btn-sm">Save draft</button>
  <button class="btn-solid theme-success btn-sm">Mark complete</button>
</div>

<td class="row-actions">
  <button class="btn-text theme-secondary btn-xs btn-icon">
    <i class="icon-star"></i>
  </button>
  <button class="btn-solid theme-secondary btn-xs btn-icon" aria-label="More actions">
    <i class="icon-more"></i>
  </button>
</td>

<p style="color: #d9534f">This person has not replied yet.</p>
<button class="btn-text theme-secondary has-client-zone-icon">Preview as client</button>`

function setupChecker() {
  const area = $('#markup')
  area.value = SAMPLE_MARKUP
  let timer
  area.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(runChecker, 250) })
  $('#markup-run').addEventListener('click', runChecker)
  $('#markup-reset').addEventListener('click', () => { area.value = SAMPLE_MARKUP; runChecker() })
  runChecker()
}

function runChecker() {
  const findings = check($('#markup').value, state.rules)
  const errors = findings.filter((f) => f.severity === 'error').length
  const warnings = findings.length - errors
  const summary = $('#findings-summary')
  summary.innerHTML = findings.length
    ? `<span class="ds-pill" data-state="fail">${errors} ${errors === 1 ? 'error' : 'errors'}</span> <span class="ds-pill" data-state="warn">${warnings} ${warnings === 1 ? 'warning' : 'warnings'}</span>`
    : '<span class="ds-pill" data-state="pass">No findings</span>'
  $('#findings').innerHTML = findings.length ? findings.map((f) => `
    <li class="ds-finding" data-severity="${f.severity}">
      <div class="ds-finding-top"><span class="ds-cat">${escapeHtml(f.category)}</span><code>${escapeHtml(f.rule)}</code><span class="ds-muted">line ${f.line}</span></div>
      <span>${escapeHtml(f.message)} <a href="${guideUrl(f.source)}" target="_blank" rel="noopener">Read the rule</a></span>
      <pre>${escapeHtml(f.snippet)}</pre>
    </li>`).join('') : '<li class="ds-muted ds-small">This markup follows every rule the checker knows about.</li>'
}

// ---------------------------------------------------------------------------
// Production health (sample data)
// ---------------------------------------------------------------------------
function sparkline(values) {
  const w = 160, h = 40, pad = 3
  const max = Math.max(...values), min = Math.min(...values)
  const x = (i) => pad + (i * (w - pad * 2)) / (values.length - 1)
  const y = (v) => pad + (h - pad * 2) * (1 - (v - min) / (max - min || 1))
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
  const last = values.length - 1
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Findings over the last ${values.length} weeks, from ${values[0]} to ${values[last]}">
    <polygon points="${x(0)},${h} ${points.join(' ')} ${x(last)},${h}" fill="var(--bs-gray-500)" fill-opacity="0.15"></polygon>
    <polyline points="${points.join(' ')}" fill="none" stroke="var(--bs-gray-600)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>
    <circle cx="${x(last)}" cy="${y(values[last])}" r="3" fill="var(--bs-fg-body)"></circle>
  </svg>`
}

function renderHealth() {
  const h = state.health
  const total = h.rules.reduce((sum, r) => sum + r.count, 0)
  const first = h.trend[0]
  $('#health-stats').innerHTML = `
    <div class="ds-stat"><span>Templates scanned</span><b>${h.files}</b></div>
    <div class="ds-stat"><span>Open findings</span><b>${total}</b></div>
    <div class="ds-stat"><span>Rules broken</span><b>${h.rules.length} of ${state.rules.rules.length}</b></div>
    <div class="ds-stat"><span>Last 12 weeks: ${first} → ${h.trend.at(-1)}</span>${sparkline(h.trend)}</div>`
  const max = Math.max(...h.rules.map((r) => r.count))
  $('#health-rules').innerHTML = [...h.rules].sort((a, b) => b.count - a.count).map((r) => `
    <div class="ds-bar-row" title="${escapeHtml(r.rule)}: ${r.count} findings">
      <code>${escapeHtml(r.rule)}</code>
      <div class="ds-bar-track"><div class="ds-bar-fill" style="inline-size:${(r.count / max) * 100}%"></div></div>
      <span class="num">${r.count}</span>
    </div>`).join('')
  $('#health-components tbody').innerHTML = h.components.map((c) => `
    <tr><td>${escapeHtml(c.name)}</td><td class="num">${c.uses.toLocaleString('en')}</td><td class="num">${c.violations}</td><td class="num">${((c.violations / c.uses) * 100).toFixed(1)}%</td></tr>`).join('')
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
function primarySet(value, mode) {
  const scope = scopeFor(value, mode)
  const set = {}
  for (const role of PRIMARY_ROLES) set[role] = { $type: 'color', $value: toHex(resolve(scope, `var(--bs-primary-${role})`)) }
  scope.remove()
  return set
}

function exportFigma() {
  const neutral = scopeFor('default', 'light')
  const fixed = {}
  for (const [name, token] of FIXED) fixed[name.toLowerCase().replace(/\s+/g, '-')] = { $type: 'color', $value: toHex(resolve(neutral, `var(${token})`)) }
  neutral.remove()
  const t = state.tokens.filmmakers.font
  const data = {
    'filmmakers/foundations': {
      color: fixed,
      font: {
        weight: Object.fromEntries(Object.entries(t.weight).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, { $type: 'fontWeights', $value: v.$value }])),
        size: Object.fromEntries(Object.entries(t.size).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, { $type: 'fontSizes', $value: v.$value }]))
      }
    },
    'primary/default-light': { primary: primarySet('default', 'light') },
    'primary/default-dark': { primary: primarySet('default', 'dark') },
    'primary/customer-light': { primary: primarySet(state.primary, 'light') },
    'primary/customer-dark': { primary: primarySet(state.primary, 'dark') },
    $themes: [],
    $metadata: {
      tokenSetOrder: ['filmmakers/foundations', 'primary/default-light', 'primary/default-dark', 'primary/customer-light', 'primary/customer-dark'],
      customer: primaryName(state.primary)
    }
  }
  return JSON.stringify(data, null, 2)
}

function exportCss() {
  const custom = state.primary === 'default' ? '/* No customer primary: Filmmakers default (Bootstrap blue-600). */' : `:root { --fm-primary: ${state.primary}; } /* ${primaryName(state.primary)} */`
  return `<!-- Load order matters: Bootstrap first, then the Filmmakers layer. -->
<link rel="stylesheet" href="bootstrap.min.css">   <!-- Bootstrap 6.0.0-alpha1 -->
<link rel="stylesheet" href="filmmakers.css">       <!-- Filmmakers tokens -->

<style>
  ${custom}
</style>

/* filmmakers.css derives every primary role from --fm-primary.
   Resolved values for this primary, light mode: */
${Object.entries(primarySet(state.primary, 'light')).map(([role, token]) => `--bs-primary-${role}: ${token.$value};`).join('\n')}`
}

function exportAi() {
  const checks = primaryChecks(runChecks(document.body))
  const failing = checks.filter((c) => c.state === 'fail')
  const banned = state.rules.rules.map((r) => `- ${r.message} (${r.id})`).join('\n')
  return `# Filmmakers System prototype brief

Build UI for Filmmakers System, a dense casting and production tool.
Use Bootstrap 6 (6.0.0-alpha1) markup only, with the Filmmakers layer on top.
Do not invent components, classes or colours that are not listed here.

## Setup
- Load bootstrap.min.css, then filmmakers.css.
- Customer primary for this prototype: ${primaryName(state.primary)} (${$('#brand-color').value}).
  Set it with :root { --fm-primary: ${$('#brand-color').value}; }.
${failing.length ? `- WARNING: this primary fails ${failing.map((f) => f.label.toLowerCase()).join(', ')}. Do not fix it yourself. Show the failure and flag it as an open decision (ASK).\n` : ''}
## Type
- System font stack. Body 14px (0.875rem). Weights 400 and 600 only. Never 500.
- h1 30px, h2 24px, h3 20px, h4 18px, h5 16px, h6 14px, all 600.
- De-emphasise with colour (.fg-2 / .fg-3), not with size, weight or italics. 12px is the floor.

## Colour
- Apply colour only through theme classes and tokens. No hex values.
- Primary marks the single most important action. At most one per screen.
- Status colours (success, danger, warning, info) report state only, never actions.
- Meaning is never carried by colour alone.
- Client zone: areas clients can see get the orange client zone signal and a text label.

## Buttons (default size btn-sm; btn-xs in table rows)
${PERMITTED.map(([purpose, classes, , note]) => `- ${purpose}: ${classes}${note ? ` (${note})` : ''}`).join('\n')}
- Icon-only buttons: btn-text theme-secondary btn-icon, with aria-label and a tooltip. Never destructive.
- Row icon sets: identical on every row, at most three, never hover-only. Destructive actions go in the overflow menu with a text label.

## Banned (checked automatically)
${banned}

## Open decisions
Where the guidelines say ASK, do not choose. Leave it visibly unresolved in the prototype.

Full guidelines: ${GUIDE_BASE}
Rules as data: design-system/data/rules.json · Tokens: design-system/data/tokens.json`
}

const EXPORTS = {
  figma: { make: exportFigma, help: 'Tokens Studio format. Import it, or point Tokens Studio at tokens.json in GitHub. Each primary set becomes a Figma variable mode, so designers can switch customer and light or dark mode in Figma.' },
  css: { make: exportCss, help: 'What a production page or prototype needs to render this customer primary.' },
  ai: { make: exportAi, help: 'Paste into Claude Design (or any AI prototyping tool) as the design system brief. It carries the current primary and every rule the checker enforces.' }
}

function renderExport() {
  const tab = EXPORTS[state.exportTab]
  $('#export-out').textContent = tab.make()
  $('#export-help').textContent = tab.help
}

function setupExport() {
  const tabs = $$('[data-export]')
  const select = (button) => {
    state.exportTab = button.dataset.export
    tabs.forEach((b) => { b.setAttribute('aria-selected', String(b === button)); b.tabIndex = b === button ? 0 : -1 })
    $('#export-out').setAttribute('aria-labelledby', button.id)
    renderExport()
  }
  tabs.forEach((button, i) => {
    button.addEventListener('click', () => select(button))
    button.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
      next.focus()
      select(next)
    })
  })
  select(tabs[0])
}

// ---------------------------------------------------------------------------
// Copy buttons and navigation
// ---------------------------------------------------------------------------
function setupCopy() {
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('.ds-copy')
    if (!button) return
    const target = button.dataset.copy ? document.getElementById(button.dataset.copy) : null
    const text = target ? target.textContent : button.dataset.copyText
    const label = button.textContent
    try {
      await navigator.clipboard.writeText(text)
      button.textContent = 'Copied'
    } catch {
      if (target) getSelection().selectAllChildren(target)
      button.textContent = target ? 'Selected, press Ctrl+C' : 'Copy failed'
    }
    setTimeout(() => { button.textContent = label }, 1600)
  })
}

function setupNav() {
  const links = $$('.ds-nav a')
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      links.forEach((a) => a.setAttribute('aria-current', String(a.hash === '#' + entry.target.id)))
    }
  }, { rootMargin: '-20% 0px -70% 0px' })
  $$('.ds-section').forEach((section) => observer.observe(section))
}

// ---------------------------------------------------------------------------
async function start() {
  try {
    const [tokens, rules, brands, health] = await Promise.all(
      ['tokens.json', 'rules.json', 'brands.json', 'health.example.json'].map(loadJson))
    Object.assign(state, { tokens, rules, brands: brands.brands, health })
  } catch (error) {
    $('#bar-verdict').textContent = 'Could not load data files. Serve this folder over HTTP.'
    $('#bar-verdict').dataset.state = 'fail'
    console.error(error)
    return
  }
  renderBrandSelect()
  renderCompare()
  renderButtons()
  renderHealth()
  setupChecker()
  setupExport()
  setupCopy()
  setupNav()
  setupModes()
  const saved = storage('fm-primary')
  setPrimary(saved || 'default', { remember: false })
}

start()
