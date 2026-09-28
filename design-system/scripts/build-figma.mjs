#!/usr/bin/env node
// Build the Figma hand-off files from the library.
//
//   npm install --prefix design-system   (once)
//   npm run figma --prefix design-system
//
// Writes:
//   figma/tokens.json      Variables for Figma, in Tokens Studio format (DTCG).
//                          Colours are resolved by a real browser from the same
//                          CSS the library and production use, so they match.
//   figma/components.json  The Figma component name and variant list for every
//                          entry in the library, so names match 1:1.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

const HUES = ['blue', 'indigo', 'violet', 'purple', 'pink', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'teal', 'cyan', 'brown', 'gray', 'pewter']
const STEPS = ['025', '050', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '975']
const THEMES = ['secondary', 'success', 'danger', 'warning', 'info', 'inverse']
const ROLES = ['base', 'bg', 'fg', 'fg-emphasis', 'bg-subtle', 'bg-muted', 'border', 'focus-ring', 'contrast']
const PRIMARIES = { 'default-blue': 'var(--bs-blue-600)', red: 'var(--bs-red-600)', green: 'var(--bs-green-600)' }
const LAYER = {
  'surface/body': '--bs-bg-body', 'surface/1': '--bs-bg-1', 'surface/2': '--bs-bg-2', 'surface/3': '--bs-bg-3', 'surface/4': '--bs-bg-4',
  'text/body': '--bs-fg-body', 'text/1': '--bs-fg-1', 'text/2': '--bs-fg-2', 'text/3': '--bs-fg-3', 'text/4': '--bs-fg-4',
  'border/default': '--bs-border-color', 'border/subtle': '--bs-border-subtle', 'border/muted': '--bs-border-muted', 'border/emphasized': '--bs-border-emphasized',
  'always-blue/control-checked': '--bs-control-checked-bg', 'always-blue/progress-bar': '--bs-progress-bar-bg', 'always-blue/focus-ring': '--bs-focus-ring-color',
  'accent/client-zone': '--fm-accent-client-zone'
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
const page = await browser.newPage()
await page.setContent('<!doctype html><html><body></body></html>')
for (const css of ['assets/bootstrap.min.css', 'assets/filmmakers.css']) await page.addStyleTag({ content: read(css) })

// Resolve CSS variables to hex inside a scope with an optional primary.
const resolve = (vars, primary) => page.evaluate(({ vars, primary }) => {
  const scope = document.createElement('div')
  scope.setAttribute('data-fm-primary', '')
  if (primary) scope.style.setProperty('--fm-primary', primary)
  document.body.append(scope)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const out = {}
  for (const name of vars) {
    const probe = document.createElement('span')
    probe.style.color = `var(${name})`
    scope.append(probe)
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = getComputedStyle(probe).color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
    out[name] = a < 255 ? hex + a.toString(16).padStart(2, '0') : hex
  }
  scope.remove()
  return out
}, { vars, primary })

const color = (value, cssVar, description) => ({
  $type: 'color', $value: value,
  ...(description ? { $description: description } : {}),
  $extensions: { 'com.figma': { codeSyntax: { WEB: `var(${cssVar})` } } }
})
const setPath = (target, path, token) => {
  const keys = path.split('/')
  let node = target
  for (const key of keys.slice(0, -1)) node = node[key] ??= {}
  node[keys.at(-1)] = token
}

// Palette ---------------------------------------------------------------
const paletteVars = ['--bs-white', '--bs-black', ...HUES.flatMap((h) => STEPS.map((s) => `--bs-${h}-${s}`))]
const paletteHex = await resolve(paletteVars)
const palette = {}
for (const name of paletteVars) setPath(palette, 'palette/' + name.replace('--bs-', '').replace(/-(\d+)$/, '/$1'), color(paletteHex[name], name))

// Theme (single mode) ---------------------------------------------------
const themeVars = [...THEMES.flatMap((t) => ROLES.map((r) => `--bs-${t}-${r}`)), ...Object.values(LAYER)]
const themeHex = await resolve(themeVars)
const theme = {}
for (const t of THEMES) for (const r of ROLES) setPath(theme, `${t}/${r}`, color(themeHex[`--bs-${t}-${r}`], `--bs-${t}-${r}`))
for (const [path, name] of Object.entries(LAYER)) setPath(theme, path, color(themeHex[name], name))

// Primary (one mode per customer primary) ------------------------------
const primarySets = {}
for (const [mode, value] of Object.entries(PRIMARIES)) {
  const vars = ROLES.map((r) => `--bs-primary-${r}`)
  const hex = await resolve(vars, value)
  const set = {}
  for (const r of ROLES) setPath(set, `primary/${r}`, color(hex[`--bs-primary-${r}`], `--bs-primary-${r}`))
  primarySets[`primary/${mode}`] = set
}
await browser.close()

// Sizes and type --------------------------------------------------------
const bs = read('assets/bootstrap.min.css')
// clamp() sizes take their largest (desktop) value in Figma.
const rem = (value) => Math.round(parseFloat(String(value).startsWith('clamp') ? String(value).match(/([0-9.]+)rem\)$/)[1] : value) * 16 * 100) / 100
const numbers = (prefix, group, cssPrefix) => {
  const out = {}
  for (const [, key, value] of bs.matchAll(new RegExp(`--bs-${prefix}-([0-9]+):([^;}]+)`, 'g'))) {
    out[key] = { $type: 'dimension', $value: value === '0' ? 0 : rem(value), $extensions: { 'com.figma': { codeSyntax: { WEB: `var(--bs-${cssPrefix}-${key})` } } } }
  }
  return { [group]: out }
}
const tokens = JSON.parse(read('data/tokens.json')).filmmakers.font
const type = { font: { family: { $type: 'fontFamilies', $value: 'Roboto', $description: 'ASK: Figma needs a real font for the system stack. Roboto is a placeholder.' }, weight: {}, size: {} } }
for (const [k, v] of Object.entries(tokens.weight)) if (!k.startsWith('$')) type.font.weight[k] = { $type: 'fontWeights', $value: String(v.$value) }
for (const [k, v] of Object.entries(tokens.size)) if (!k.startsWith('$')) type.font.size[k] = { $type: 'fontSizes', $value: rem(v.$value) }
const styles = {}
for (const k of Object.keys(type.font.size)) {
  const heading = /title|heading/.test(k)
  styles[k] = { $type: 'typography', $value: { fontFamily: '{font.family}', fontWeight: heading ? '{font.weight.semibold}' : '{font.weight.normal}', fontSize: `{font.size.${k}}`, lineHeight: heading ? '120%' : '150%' } }
}

const out = {
  palette,
  theme,
  ...primarySets,
  size: { ...numbers('spacer', 'spacing', 'spacer'), ...numbers('radius', 'radius', 'radius') },
  typography: { ...type, 'text-style': styles },
  $themes: Object.keys(PRIMARIES).map((mode) => ({
    id: `primary-${mode}`,
    name: mode.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
    group: 'Primary',
    selectedTokenSets: { palette: 'source', theme: 'enabled', size: 'enabled', typography: 'enabled', [`primary/${mode}`]: 'enabled' }
  })),
  $metadata: { tokenSetOrder: ['palette', 'theme', ...Object.keys(primarySets), 'size', 'typography'] }
}
writeFileSync(join(root, 'figma/tokens.json'), JSON.stringify(out, null, 2) + '\n')

// Component names -------------------------------------------------------
const library = JSON.parse(read('data/components.json'))
const sectionName = { foundations: 'Foundations', components: 'Components', organisms: 'Organisms', 'app-shell': 'App shell' }
const components = library.groups.flatMap((group) => group.items
  .filter((item) => item.example || item.examples?.length)
  .map((item) => ({
    figmaPage: sectionName[group.section],
    figmaName: `${group.title}/${item.name}`,
    libraryId: item.id || item.code.toLowerCase(),
    classes: item.classes || '',
    variants: {
      ...(item.examples ? { Version: item.examples.map((e) => e.label) } : {}),
      // Buttons also vary by size in Figma; small is the default.
      ...(group.id === 'buttons' && !['btn-sizes', 'btn-not-allowed'].includes(item.id) ? { Size: item.id === 'btn-row-action' ? ['Extra small'] : ['Small', 'Extra small', 'Medium'] } : {})
    }
  })))
writeFileSync(join(root, 'figma/components.json'), JSON.stringify({ $description: 'One Figma component (or component set) per library entry. Keep figmaName exactly as written so names match the library and code.', components }, null, 2) + '\n')

console.log(`figma/tokens.json: ${paletteVars.length} palette, ${themeVars.length} theme, ${Object.keys(primarySets).length} primary modes`)
console.log(`figma/components.json: ${components.length} components`)
