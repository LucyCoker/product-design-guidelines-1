#!/usr/bin/env node
// Build the Claude Design System from the library.
//
//   npm install --prefix design-system   (once)
//   npm run claude --prefix design-system
//
// Writes design-system/claude/project/, the files of the "Filmmakers System"
// Design System artifact on claude.ai. Nothing here is edited by hand: the
// library (components.json, the CSS, PROTOTYPE.md and the guideline pages) is
// the source, and this folder is rebuilt from it. design-system/claude/ is not
// committed. Publish it with the steps in claude.config.json.
//
// The system is marked "synced from code" ("editing": "code"), so its page is
// read-only. Change the library and rebuild instead.

import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = join(root, '..')
const out = join(root, 'claude', 'project')
const read = (path) => readFileSync(join(root, path), 'utf8')
const readRepo = (path) => readFileSync(join(repo, path), 'utf8')
const config = JSON.parse(read('claude.config.json'))
const REPO_URL = `https://github.com/${config.repository}`
const BLOB = `${REPO_URL}/blob/main/`
const CDN = `https://cdn.jsdelivr.net/gh/${config.repository}@main/design-system/assets/`
const library = JSON.parse(read('data/components.json'))

rmSync(join(root, 'claude'), { recursive: true, force: true })
const write = (path, text) => {
  const file = join(out, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text.endsWith('\n') ? text : text + '\n')
}

let sha = 'unknown'
try { sha = execSync('git rev-parse --short HEAD', { cwd: repo }).toString().trim() } catch {}
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z')

// ---------------------------------------------------------------------------
// Text helpers: the library's notes carry a little HTML. Turn it into Markdown.
// ---------------------------------------------------------------------------
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
function md(html = '') {
  let s = String(html)
  s = s.replace(/<table[\s\S]*?<\/table>/g, (table) => {
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => md(c[1]).replace(/\|/g, '\\|').replace(/\n/g, ' ')))
    if (!rows.length) return ''
    return '\n\n' + [rows[0], rows[0].map(() => '---'), ...rows.slice(1)].map((r) => `| ${r.join(' | ')} |`).join('\n') + '\n\n'
  })
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n\n#### $1\n\n')
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, (_, c) => '`' + decode(c) + '`')
  s = s.replace(/<(b|strong)>([\s\S]*?)<\/\1>/g, '**$2**')
  s = s.replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => href.startsWith('#') ? text : `[${text}](${href})`)
  s = s.replace(/<li>([\s\S]*?)<\/li>/g, '\n- $1')
  s = s.replace(/<\/?(div|p|ul|ol|span|br)[^>]*>/g, '\n')
  s = s.replace(/<[^>]+>/g, '')
  return decode(s).replace(/\n{3,}/g, '\n\n').trim()
}
const pascal = (id) => id.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('')
const fenced = (html) => '```html\n' + html.trim() + '\n```'

// Guideline pages: strip Jekyll front matter and point relative links at GitHub.
function guideline(path) {
  let text = readRepo(path).replace(/^---\n[\s\S]*?\n---\n/, '').trim()
  const base = dirname(path)
  text = text.replace(/\]\((?!https?:|#|mailto:)([^)]+)\)/g, (_, link) => `](${BLOB}${join(base, link).replace(/ /g, '%20')})`)
  return text
}

// ---------------------------------------------------------------------------
// Tokens, resolved by a real browser from the same CSS the library loads.
// Light mode only: prototypes are light (PROTOTYPE.md). Fluid sizes are read
// at a 1280px viewport, the library's desktop width.
// ---------------------------------------------------------------------------
const HUES = ['blue', 'indigo', 'violet', 'purple', 'pink', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'teal', 'cyan', 'brown', 'gray', 'pewter']
const STEPS = ['025', '050', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '975']
const THEMES = {
  primary: 'Primary: the one most important action on a screen. Follows the customer primary (--fm-primary); default blue-600.',
  secondary: 'Secondary: the bulk of the interface — text, borders, surfaces and most controls.',
  success: 'Status, success: reports a state only. Never makes an action feel positive.',
  danger: 'Status, danger: reports a state, and marks destructive actions.',
  warning: 'Status, warning: reports a state only.',
  info: 'Status, info: reports a state only.',
  inverse: 'Inverse: the opposite of the colour mode. On a brand-coloured surface set data-bs-theme="dark" on the surface first.'
}
const ROLES = {
  base: 'The theme colour itself.',
  bg: 'Solid fill (btn-solid, solid badges).',
  fg: 'Text and icons in this theme on body surfaces.',
  'fg-emphasis': 'Stronger text in this theme, for example hover.',
  'bg-subtle': 'Subtle fill (alerts, subtle badges).',
  'bg-muted': 'Muted fill, a step stronger than subtle.',
  border: 'Borders of components in this theme.',
  'focus-ring': 'Focus ring. Always blue-500 in Filmmakers System, whatever the theme.',
  contrast: 'Text and icons on the solid bg fill.'
}
const LAYER = {
  'bs-bg-body': 'Page background.',
  'bs-bg-1': 'Surface 1: cards and raised areas on the page background.',
  'bs-bg-2': 'Surface 2.',
  'bs-bg-3': 'Surface 3.',
  'bs-bg-4': 'Surface 4.',
  'bs-fg-body': 'Body text, on bg-body and bg-1.',
  'bs-fg-1': 'Text 1: strongest text.',
  'bs-fg-2': 'Text 2: de-emphasised text (.fg-2).',
  'bs-fg-3': 'Text 3: muted text, captions (.fg-3).',
  'bs-fg-4': 'Text 4: weakest text. Not for running text.',
  'bs-border-color': 'Default border.',
  'bs-border-subtle': 'Subtle border.',
  'bs-border-muted': 'Muted border.',
  'bs-border-emphasized': 'Emphasised border.',
  'bs-control-checked-bg': 'Checked checkbox, radio and switch. Always Bootstrap blue, never the customer primary.',
  'bs-progress-bar-bg': 'Progress bar. Always Bootstrap blue, never the customer primary.',
  'bs-focus-ring-color': 'Focus ring colour. Always blue-500.',
  'fm-primary': 'The customer primary. The one input every primary role is mixed from. To preview a customer colour, set :root { --fm-primary: #hex }.',
  'fm-accent-client-zone': 'Accent, client zone: marks areas of Selections that clients or other people outside the team can see. Chrome and context only, never actions, and always stated in text too.'
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.setContent('<!doctype html><html data-bs-theme="light"><body></body></html>')
for (const css of ['assets/bootstrap.min.css', 'assets/filmmakers.css']) await page.addStyleTag({ content: read(css) })

const colours = await page.evaluate((names) => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const result = {}
  for (const name of names) {
    const probe = document.createElement('span')
    probe.style.color = `var(--${name}, rgb(1, 2, 3))`
    document.body.append(probe)
    const computed = getComputedStyle(probe).color
    probe.remove()
    if (computed === 'rgb(1, 2, 3)') continue
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = computed
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
    result[name] = a < 255 ? hex + a.toString(16).padStart(2, '0') : hex
  }
  return result
}, [
  'bs-white', 'bs-black',
  ...HUES.flatMap((h) => STEPS.map((s) => `bs-${h}-${s}`)),
  ...Object.keys(THEMES).flatMap((t) => Object.keys(ROLES).map((r) => `bs-${t}-${r}`)),
  ...Object.keys(LAYER)
])

const lengths = await page.evaluate((names) => {
  const result = {}
  for (const name of names) {
    const probe = document.createElement('div')
    probe.style.width = `var(--${name}, -1px)`
    document.body.append(probe)
    const w = getComputedStyle(probe).width
    probe.remove()
    if (w !== '-1px' && w !== 'auto') result[name] = w.replace(/\.0+px$/, 'px')
  }
  return result
}, [...Array.from({ length: 13 }, (_, i) => `bs-spacer-${i}`), ...Array.from({ length: 10 }, (_, i) => `bs-radius-${i}`), 'bs-radius-pill'])

const TYPE = [
  { group: 'Headings', name: 'page-title', classes: 'fs-2xl fw-semibold', sample: 'Your Projects', usage: 'Page title: .fs-2xl fw-semibold (28–32px, fluid). One per page, on the h1.' },
  { group: 'Headings', name: 'section-heading', classes: 'fs-lg fw-semibold', sample: 'Auditions', usage: 'Section heading: .fs-lg fw-semibold (18–20px, fluid).' },
  { group: 'Headings', name: 'group-heading', classes: 'fs-md fw-semibold', sample: 'Contact details', usage: 'Card or group heading: .fs-md fw-semibold.' },
  { group: 'Text', name: 'body-large', classes: 'fs-md', sample: 'Selections you share with a client appear here.', usage: 'Larger body text: .fs-md. Use rarely.' },
  { group: 'Text', name: 'body', classes: '', sample: 'Add actors to this Selection, then share it with the client.', usage: 'Body text, 14px. The default; no class needed.' },
  { group: 'Text', name: 'caption', classes: 'fs-xs', sample: 'Last edited 12 March', usage: 'Captions and meta: .fs-xs, the 12px floor. De-emphasise with .fg-2 / .fg-3, never a smaller size.' }
]
const typeComputed = await page.evaluate((styles) => {
  const body = getComputedStyle(document.body)
  return {
    family: body.fontFamily,
    styles: styles.map((s) => {
      const el = document.createElement('div')
      el.className = s.classes
      el.textContent = s.sample
      document.body.append(el)
      const cs = getComputedStyle(el)
      const r = { fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: Number(cs.fontWeight) }
      el.remove()
      return r
    })
  }
}, TYPE)
await browser.close()

const colourTokens = []
const add = (name, usage) => { if (colours[name]) colourTokens.push({ name, value: { light: colours[name] }, usage }) }
for (const [name, usage] of Object.entries(LAYER)) add(name, usage)
for (const [theme, meaning] of Object.entries(THEMES)) for (const [role, usage] of Object.entries(ROLES)) add(`bs-${theme}-${role}`, `${usage} ${meaning}`)
add('bs-white', 'Fixed white. The same in both modes: only where a fixed colour is the point, such as white text on a dark band over a photo.')
add('bs-black', 'Fixed black. The same in both modes: only where a fixed colour is the point.')
for (const hue of HUES) for (const step of STEPS) add(`bs-${hue}-${step}`, `Palette step ${hue} ${step}. Fixed in both modes. Interfaces take colour from the theme roles; a palette step is used only where the guidelines name it.`)

const family = typeComputed.family.replace(/[;{}<>\\()]/g, '').slice(0, 200)
const tokens = {
  name: config.title,
  version: 1,
  meta: { source: 'github', repo: config.repository, ref: `main@${sha}`, package: 'design-system', paths: { tokens: ['design-system/assets/bootstrap.min.css', 'design-system/assets/filmmakers.css'], docs: ['design-system/prototype-kit/PROTOTYPE.md', 'design-system/data/components.json', 'products/filmmakers-system', 'patterns'] }, synced: now, note: 'Generated by design-system/scripts/build-claude.mjs. Light mode only. Values resolved in a browser at a 1280px viewport.' },
  color: { themes: [{ id: 'light', name: 'Light' }], tokens: colourTokens },
  type: {
    fonts: [],
    families: { sans: family },
    groups: ['Headings', 'Text'].map((group) => ({
      name: group,
      family: 'sans',
      styles: TYPE.map((s, i) => ({ ...s, ...typeComputed.styles[i] })).filter((s) => s.group === group).map((s) => ({ name: s.name, fontSize: s.fontSize, lineHeight: s.lineHeight, fontWeight: s.fontWeight, sample: s.sample, usage: s.usage }))
    }))
  },
  spacing: { tokens: Object.entries(lengths).filter(([n]) => n.startsWith('bs-spacer')).map(([name, value]) => ({ name, value, usage: `Spacing step ${name.split('-').pop()}: use the matching Bootstrap utility (p-${name.split('-').pop()}, gap-${name.split('-').pop()}…). Lay out with flex gap, not margins.` })) },
  radius: { tokens: Object.entries(lengths).filter(([n]) => n.startsWith('bs-radius')).map(([name, value]) => ({ name, value, usage: name.endsWith('pill') ? 'Pill: chips and pill badges.' : `Radius step ${name.split('-').pop()}. Components set their own radius; use rounded utilities only in compositions.` })) }
}
write('tokens.json', JSON.stringify(tokens, null, 2))

// tokens.css, laid out as the Design System page compiles it.
const css = [`/* ${config.title} — generated from tokens.json */`, ':root, [data-theme="light"] {', ...colourTokens.map((t) => `  --${t.name}: ${t.value.light};`), '}', ':root {',
  ...tokens.spacing.tokens.map((t) => `  --${t.name}: ${t.value};`), ...tokens.radius.tokens.map((t) => `  --${t.name}: ${t.value};`), `  --font-sans: ${family};`, '}',
  ...tokens.type.groups.flatMap((g) => g.styles.map((s) => `.${s.name} { font-family: var(--font-sans); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight}; }`))]
write('tokens.css', css.join('\n'))

// ---------------------------------------------------------------------------
// The stylesheet previews load: Bootstrap 6, Font Awesome and the Filmmakers
// layer, in the library's order. Bootstrap's script and the filter bars are
// plain files the previews import.
// ---------------------------------------------------------------------------
write('components/bundle.css', ['assets/bootstrap.min.css', 'assets/fontawesome.css', 'assets/filmmakers.css'].map((f) => `/* ${f} */\n${read(f)}`).join('\n'))
for (const file of ['bootstrap.bundle.min.js', 'filterbar.js', 'simplefilter.js']) {
  mkdirSync(join(out, 'vendor'), { recursive: true })
  copyFileSync(join(root, 'assets', file), join(out, 'vendor', file))
}

// ---------------------------------------------------------------------------
// Components: one card per library group. Candidates are left out: they wait
// for a decision and must not be used in new work.
// ---------------------------------------------------------------------------
const SECTION = { foundations: 'Foundations', components: 'Components', forms: 'Forms', organisms: 'Organisms', 'organisms-area': 'Organisms', 'app-shell': 'App shell', templates: 'Templates' }
const KIND = { do: 'Do', dont: 'Don’t', caution: 'Only when', a11y: 'Accessibility', code: 'Code notes', other: 'Other notes' }
const items = (g) => g.items || g.components || []
const groups = library.groups.filter((g) => g.section !== 'candidates' && !g.subpageOf)
const subpages = library.groups.filter((g) => g.subpageOf)
const candidates = library.groups.filter((g) => g.section === 'candidates')
const asks = []
const built = []

function itemMarkdown(item, group) {
  const lines = [`### ${item.name}${item.code ? ` · ${item.code}` : ''}`]
  const meta = [
    item.classes && `Classes: \`${item.classes}\``,
    item.status && `Status: ${item.status}${item.replacesFrom ? ` (from ${item.replacesFrom})` : ''}`,
    item.replaces && `Replaces: \`${item.replaces}\``,
    item.review && `**Not finished: ${item.review}.** Use it, but say in the prototype that it may change.`,
    item.docs && `[Bootstrap docs](${item.docs})`,
    item.guide && `[Guideline](${BLOB}${item.guide})`
  ].filter(Boolean)
  if (meta.length) lines.push(meta.map((m) => `- ${m}`).join('\n'))
  if (item.note) lines.push(md(item.note))
  for (const flag of item.flags || []) {
    if (flag.type === 'ask') {
      lines.push(`> **ASK — not decided.** ${md(flag.text)} Do not choose: leave it visibly unresolved and say so.`)
      asks.push({ where: `${group.title} › ${item.name}`, text: md(flag.text) })
    } else if (flag.type === 'exception') lines.push(`> **Exception, kept to match production.** ${md(flag.text)}`)
    else lines.push(`> ${md(flag.text)}`)
  }
  if (item.unresolved && !(item.flags || []).some((f) => f.type === 'ask')) {
    lines.push('> **ASK — this entry has an open decision.** Check the library before using it.')
    asks.push({ where: `${group.title} › ${item.name}`, text: 'Open decision; see the library entry.' })
  }
  for (const [kind, label] of Object.entries(KIND)) {
    const rules = (item.rules || []).filter((r) => r.kind === kind)
    if (rules.length) lines.push(`**${label}**\n\n${rules.map((r) => `- ${md(r.text)}${r.devReview ? ' *(Developer still to confirm.)*' : ''}`).join('\n')}`)
  }
  const markup = item.examples?.length ? item.examples.map((e) => `<!-- ${e.label} -->\n${e.html}`).join('\n\n') : item.example || item.snippet
  if (markup) lines.push(`Markup:\n\n${fenced(markup)}`)
  return lines.join('\n\n')
}

function previewBody(item) {
  if (item.examples?.length) {
    return `<div class="ds-examples">${item.examples.map((e) => `<figure class="ds-example"><div class="ds-stage">${e.html}</div><figcaption>${e.label}${e.badge ? ` · <code>${e.badge}</code>` : ''}${e.caption ? ` — ${e.caption}` : ''}</figcaption></figure>`).join('')}</div>`
  }
  if (item.example) return `<div class="ds-preview" data-layout="${item.layout || 'row'}">${item.example}</div>`
  return ''
}

const PREVIEW_CSS = `
.ds-root { display: flex; flex-direction: column; gap: 24px; padding: 16px; background: var(--bs-bg-body); color: var(--bs-fg-body); }
.ds-item > h3 { margin: 0 0 8px; font-size: var(--bs-font-size-xs); font-weight: 600; color: var(--bs-fg-3); }
.ds-ask { display: inline-block; margin-inline-start: 6px; }
.ds-preview { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.ds-preview[data-layout="stack"] { flex-direction: column; align-items: flex-start; }
.ds-preview[data-layout="full"] { display: block; }
.ds-examples { display: flex; flex-wrap: wrap; gap: 16px; }
.ds-example { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ds-example figcaption { font-size: var(--bs-font-size-xs); color: var(--bs-fg-3); }
.ds-stage { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }`

function previewScript(html) {
  const imports = ["import * as bootstrap from '../../vendor/bootstrap.bundle.min.js'"]
  const init = [
    "document.querySelectorAll('[data-bs-toggle=\"tooltip\"]').forEach((el) => bootstrap.Tooltip.getOrCreateInstance(el))",
    "document.querySelectorAll('[data-bs-toggle=\"menu\"]').forEach((el) => el.setAttribute('data-bs-strategy', 'fixed'))",
    "document.addEventListener('click', (e) => { const a = e.target.closest('a[href]'); if (a) e.preventDefault() })",
    "document.addEventListener('submit', (e) => e.preventDefault())"
  ]
  if (html.includes('data-filterbar')) { imports.push("import { initFilterBar } from '../../vendor/filterbar.js'"); init.push("document.querySelectorAll('[data-filterbar]').forEach(initFilterBar)") }
  if (html.includes('data-simplefilter')) { imports.push("import { initSimpleFilter } from '../../vendor/simplefilter.js'"); init.push("document.querySelectorAll('[data-simplefilter]').forEach(initSimpleFilter)") }
  return `<script type="module">\n${imports.join('\n')}\n${init.join('\n')}\n</script>`
}

for (const group of groups) {
  const name = pascal(group.id)
  const all = [...items(group), ...subpages.filter((s) => s.subpageOf === group.id).flatMap(items)]
  const shown = all.filter((i) => i.examples?.length || i.example)
  const sections = shown.map((item) => {
    const open = (item.flags || []).some((f) => f.type === 'ask') || item.unresolved
    return `<section class="ds-item"><h3>${item.name}${item.code ? ` · ${item.code}` : ''}${open ? ' <span class="badge theme-warning badge-subtle ds-ask">ASK</span>' : ''}${item.review ? ` <span class="badge theme-secondary badge-subtle ds-ask">${item.review}</span>` : ''}</h3>${previewBody(item)}</section>`
  }).join('\n')
  const height = Math.min(4000, 60 + shown.length * 110)
  const subtitle = shown.map((i) => i.name).join(' / ').replace(/"/g, '').slice(0, 200)
  const html = `<!-- @dsCard group="${SECTION[group.section] || 'Components'}" height=${height} subtitle="${subtitle}" -->\n<div class="ds-root">\n<style>${PREVIEW_CSS}</style>\n${sections || '<p class="fg-3 m-0">No live example in the library yet. See the guidelines.</p>'}\n</div>\n${previewScript(sections)}`
  write(`components/${name}/preview.html`, html)

  const intro = md(group.introHtml || group.intro || '')
  const readme = [`# ${group.title}`, `${md(group.intro || group.title)}`, group.introHtml ? md(group.introHtml) : '', ...all.map((item) => itemMarkdown(item, group))].filter(Boolean).join('\n\n')
  write(`components/${name}/README.md`, readme)
  built.push({ name, title: group.title, section: SECTION[group.section] || 'Components', items: all.length, intro })
}

// ---------------------------------------------------------------------------
// The brand book: the prototype brief, then the guideline pages as sections.
// ---------------------------------------------------------------------------
const brief = read('prototype-kit/PROTOTYPE.md')
const start = brief.indexOf('## Build with the real design system')
const end = brief.indexOf('## Sources')
let rules = brief.slice(start, end < 0 ? undefined : end).trim()
rules = rules
  .replace('Start from `design-system/prototype-kit/starter.html`.', `Start from the [starter page](${BLOB}design-system/prototype-kit/starter.html).`)
  .replace(/Copy component markup from `design-system\/data\/components.json`\./, 'Copy component markup from the component cards in this system (each README has the markup), which come from the library’s `components.json`.')

const askRows = asks.map((a) => `| ${a.where} | ${a.text.replace(/\|/g, '\\|').replace(/\n+/g, ' ')} |`)
const readme = `Filmmakers System is Bootstrap 6 with the Filmmakers layer on top. Use this system as the starting point for prototypes and designs.

**This system is generated from the [Filmmakers component library](${REPO_URL}/tree/main/design-system) and is read-only.** The library wins wherever the two differ. To change anything, change the library and rebuild this system.

**ASK means not decided.** Where a card or section says ASK, do not choose or infer an answer. Leave it visibly unresolved in the prototype and say so. An unresolved ASK is a valid result; a guessed answer is not.

${rules}

## Load the real CSS

The component cards here render with the same files production prototypes load. In a prototype, load them by URL:

\`\`\`html
<link rel="stylesheet" href="${CDN}bootstrap.min.css">
<link rel="stylesheet" href="${CDN}fontawesome.css">
<link rel="stylesheet" href="${CDN}filmmakers.css">
<script type="module" src="${CDN}bootstrap.bundle.min.js"></script>
\`\`\`

The colour tokens here are the light-mode values resolved from that CSS, with the default primary (blue-600). In markup, always use the classes and \`var(--bs-…)\` tokens, never the hex values.

## Filmmakers classes

The only classes that are not Bootstrap 6. Each one covers a layout Bootstrap has no class for, and is defined in \`filmmakers.css\`. Use them only in the components that use them.

- Never invent a class. Use Bootstrap 6 classes, and these where a component uses them.
- A new \`fm-\` class is added to the library first, with what it does and why Bootstrap cannot do it, before it is used.
- No \`fm-\` class sets colour, type or spacing values of its own. They use Bootstrap tokens.

## Component candidates: do not use

These wait for a decision and are not in this system: ${candidates.map((g) => g.title).join(', ')}. Do not use them in new work.

## Not in use

${[...library.excluded, ...library.removed].map((x) => `- **${x.code}** (${x.replaces}): ${md(x.reason)}`).join('\n')}

## Open decisions

ASK items on the component cards:

| Where | Question |
|---|---|
${askRows.join('\n')}

Parked in the library’s decisions backlog:

| Question | What is undecided | Why it waits | Revisit |
|---|---|---|---|
${library.backlog.map((b) => `| ${b.title} (${b.where}) | ${md(b.question).replace(/\|/g, '\\|')} | ${md(b.why).replace(/\|/g, '\\|')} | ${md(b.revisit || '').replace(/\|/g, '\\|')} |`).join('\n')}

Not covered here yet: public pages (an ASK in the guidelines) and dark mode (in the code, not live for clients).
`
write('README.md', readme)

const SECTIONS = [
  ['guidelines/01-colour.md', 'products/filmmakers-system/foundations/colour.md'],
  ['guidelines/02-typography.md', 'products/filmmakers-system/foundations/typography.md'],
  ['guidelines/03-buttons.md', 'products/filmmakers-system/components/buttons.md'],
  ['guidelines/04-patterns-overview.md', 'patterns/Patterns overview'],
  ['guidelines/05-button-hierarchy.md', 'patterns/button-hierarchy.md'],
  ['guidelines/06-button-groups.md', 'patterns/Button groups'],
  ['guidelines/07-destructive-actions.md', 'patterns/destructive-actions.md'],
  ['guidelines/08-help-text.md', 'patterns/help-text.md']
]
for (const [path, source] of SECTIONS) if (existsSync(join(repo, source))) write(path, guideline(source))

// Logo group: the image itself is an upload (see claude.config.json).
write('assets/Logos/README.md', `The Filmmakers logo, copied from the library (\`design-system/assets/filmmakers-logo.png\`). Use it as it is: never redraw, recolour or stretch it. It sits on the left of the app header (see App header).`)

// ---------------------------------------------------------------------------
// The cover.
// ---------------------------------------------------------------------------
write('components/Cover/preview.html', `<!-- @dsCard height=288 -->
<div class="cv">
<style>
.cv { position: relative; width: 960px; height: 288px; background: var(--bs-bg-body); overflow: hidden; font-family: var(--font-sans); }
.cv svg { position: absolute; left: 480px; top: 0; width: 480px; height: 288px; }
.cv .p { fill: var(--bs-primary-bg); } .cv .ps { fill: var(--bs-primary-bg-muted); } .cv .z { fill: var(--fm-accent-client-zone); }
.cv .ink { fill: var(--bs-gray-900); } .cv .s { fill: var(--bs-secondary-bg-subtle); }
.cv .t { padding: 0 0 32px 40px; position: absolute; left: 0; bottom: 0; max-width: 440px; }
.cv h1 { margin: 0; font-size: 72px; line-height: .95; font-weight: 600; color: var(--bs-fg-1); letter-spacing: -0.01em; }
.cv p { margin: 16px 0 0; font-size: 14px; color: var(--bs-fg-3); }
</style>
<svg viewBox="0 0 480 288" aria-hidden="true">
<!-- blocks: primary-bg (default blue-600) 192x168, gray-900 ink 120x120, client-zone orange 72x72, primary-bg-muted 120x96, secondary-bg-subtle tiles
     arrangement: flush modular grid on a 24px step, bleeding off the top and right edge, like dense list and card UI
     pattern: tiles cut by radius-4 (6px), some merged two-wide like Button groups; chosen because the system is a dense, modular Bootstrap UI
     steps: spacer-6 (24px) grid, radius-4 corners -->
<rect class="p" x="96" y="-24" width="192" height="168" rx="6"/>
<rect class="ink" x="312" y="-24" width="192" height="120" rx="6"/>
<rect class="ps" x="312" y="120" width="120" height="96" rx="6"/>
<rect class="z" x="456" y="120" width="72" height="72" rx="6"/>
<rect class="s" x="96" y="168" width="96" height="48" rx="6"/>
<rect class="s" x="216" y="168" width="72" height="48" rx="6"/>
<rect class="s" x="96" y="240" width="48" height="48" rx="6"/>
<rect class="s" x="168" y="240" width="120" height="48" rx="6"/>
<rect class="p" x="312" y="240" width="48" height="48" rx="6"/>
<rect class="s" x="384" y="240" width="120" height="48" rx="6"/>
</svg>
<div class="t"><h1>Filmmakers<br>System</h1><p>Bootstrap 6 with the Filmmakers layer, built from the library.</p></div>
</div>`)

// ---------------------------------------------------------------------------
// The index, written last.
// ---------------------------------------------------------------------------
const logo = config.assets?.logo
const index = {
  v: 3,
  layout: 'files',
  createdOnFiles: config.createdOnFiles,
  title: config.title,
  namespace: 'FilmmakersSystem',
  libraries: [],
  editing: 'code',
  sections: {},
  groups: ['Logos'],
  assetGroups: { Logos: { name: 'Logos', tile: 'l', order: logo ? [logo.name] : [], files: logo ? { [logo.name]: logo } : {} } },
  blobs: {},
  docs: { readme: 'project/README.md', sections: [] },
  lastChange: { by: process.env.DS_BY || 'Claude', at: now, via: `Claude Code · ${config.repository}@${sha}`, note: `Rebuilt from the library: ${colourTokens.length} colours, ${built.length} components.` }
}
write('design-system.json', JSON.stringify(index, null, 2))

const files = []
const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) e.isDirectory() ? walk(join(dir, e.name)) : files.push(join(dir, e.name).slice(out.length + 1)) }
walk(out)
console.log(`Built ${files.length} files in design-system/claude/project: ${colourTokens.length} colours, ${tokens.spacing.tokens.length} spacing, ${tokens.radius.tokens.length} radii, ${built.length} components, ${asks.length} ASK items.`)
