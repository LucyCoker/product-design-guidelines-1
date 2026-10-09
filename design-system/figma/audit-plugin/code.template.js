// Filmmakers audit: compares this Figma file with the component library.
// Generated from code.template.js by scripts/build-figma.mjs, which embeds
// what the library expects. Edit the template, not code.js.
//
// Checks
//   Variables   every library token exists, with the right value in each mode
//   Code syntax every variable with a CSS name carries it (Dev Mode, AI tools)
//   Components  every library entry exists by name, with the right variants
//   Bindings    Buttons use the right variables, and no component uses a raw
//               colour or a palette/* colour

const EXPECTED = __EXPECTED__

const hex = ({ r, g, b, a }) => {
  const h = '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
  return a !== undefined && a < 1 ? h + Math.round(a * 255).toString(16).padStart(2, '0') : h
}
const near = (a, b) => {
  if (typeof a === 'number' || typeof b === 'number') return Math.abs(Number(a) - Number(b)) < 0.01
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [x, y] = [p(a.toLowerCase()), p(b.toLowerCase())]
  return x.every((v, i) => Math.abs(v - y[i]) <= 2)
}

// Library token path for a Figma variable name. Tokens Studio may keep the
// set name in front, so fall back to the longest matching end of the name.
function tokenPath(name) {
  if (EXPECTED.paths[name]) return name
  const parts = name.split('/')
  for (let i = 1; i < parts.length; i++) {
    const tail = parts.slice(i).join('/')
    if (EXPECTED.paths[tail]) return tail
  }
  return null
}

// Which token set a mode stands for: a theme (Default Blue), the collection
// name (primary/red), or the only set that has this token.
function setFor(path, collection, modeName) {
  const sets = EXPECTED.paths[path]
  const theme = EXPECTED.themes[modeName]
  if (theme && sets.includes(theme)) return theme
  if (sets.includes(collection.name)) return collection.name
  const named = sets.find((s) => collection.name.toLowerCase().includes(s.split('/').pop()))
  if (named) return named
  return sets.length === 1 ? sets[0] : null
}

async function resolveValue(value, modeId) {
  let v = value
  for (let depth = 0; v && v.type === 'VARIABLE_ALIAS' && depth < 10; depth++) {
    const target = await figma.variables.getVariableByIdAsync(v.id)
    if (!target) return null
    const modes = Object.keys(target.valuesByMode)
    v = target.valuesByMode[modeId] !== undefined ? target.valuesByMode[modeId] : target.valuesByMode[modes[0]]
  }
  if (v && typeof v === 'object' && 'r' in v) return hex(v)
  return v
}

async function auditVariables(report) {
  const variables = await figma.variables.getLocalVariablesAsync()
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const byId = Object.fromEntries(collections.map((c) => [c.id, c]))
  const seen = new Set()
  for (const variable of variables) {
    const path = tokenPath(variable.name)
    if (!path) { report.variables.extra.push(variable.name); continue }
    seen.add(path)
    const collection = byId[variable.variableCollectionId]
    for (const mode of collection.modes) {
      const set = setFor(path, collection, mode.name)
      if (!set) continue
      const expected = EXPECTED.values[set][path]
      const actual = await resolveValue(variable.valuesByMode[mode.modeId], mode.modeId)
      if (actual === null || actual === undefined || !near(actual, expected)) {
        report.variables.wrong.push({ name: variable.name, mode: mode.name, expected, actual })
      } else report.variables.ok++
    }
    const web = EXPECTED.codeSyntax[path]
    if (web && variable.codeSyntax.WEB !== web) report.codeSyntax.missing.push({ name: variable.name, expected: web, actual: variable.codeSyntax.WEB || null })
    else if (web) report.codeSyntax.ok++
  }
  report.variables.missing = Object.keys(EXPECTED.paths).filter((p) => !seen.has(p))
  return Object.fromEntries(variables.map((v) => [v.id, v.name]))
}

function variantOptions(node) {
  const defs = node.type === 'COMPONENT_SET' ? node.componentPropertyDefinitions : {}
  const out = {}
  for (const [key, def] of Object.entries(defs)) if (def.type === 'VARIANT') out[key] = def.variantOptions
  return out
}

async function auditComponents(report, variableNames) {
  await figma.loadAllPagesAsync()
  const nodes = figma.root.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    .filter((n) => !(n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET'))
  const byName = Object.fromEntries(nodes.map((n) => [n.name, n]))
  const expectedNames = new Set(EXPECTED.components.map((c) => c.figmaName))
  for (const component of EXPECTED.components) {
    const node = byName[component.figmaName]
    if (!node) { report.components.missing.push(component.figmaName); continue }
    const actual = variantOptions(node)
    const problems = []
    for (const [prop, options] of Object.entries(component.variants)) {
      const have = actual[prop] || []
      const lacking = options.filter((o) => !have.includes(o))
      if (lacking.length) problems.push(`${prop}: missing ${lacking.join(', ')}`)
    }
    if (problems.length) report.components.variants.push({ name: component.figmaName, problems })
    else report.components.ok++
    await auditBindings(report, node, component, variableNames)
  }
  report.components.extra = nodes.map((n) => n.name).filter((n) => !expectedNames.has(n))
}

// Colours on every layer of a component: bound variable name, or raw hex.
function paints(node, variableNames, kind) {
  const list = kind === 'fill' ? node.fills : node.strokes
  if (!Array.isArray(list)) return []
  return list.filter((p) => p.type === 'SOLID' && p.visible !== false).map((p) => {
    const bound = p.boundVariables && p.boundVariables.color
    return bound ? { variable: variableNames[bound.id] || '(from a library file)' } : { raw: hex(p.color) }
  })
}

async function auditBindings(report, root, component, variableNames) {
  const variants = root.type === 'COMPONENT_SET' ? root.children : [root]
  for (const variant of variants) {
    const where = `${component.figmaName} › ${variant.name}`
    const layers = [variant, ...(variant.findAll ? variant.findAll(() => true) : [])]
    for (const layer of layers) {
      for (const kind of ['fill', 'stroke']) {
        for (const p of paints(layer, variableNames, kind)) {
          if (p.raw) report.bindings.raw.push({ where, layer: layer.name, kind, colour: p.raw })
          else if (/(^|\/)palette\//.test(p.variable)) report.bindings.palette.push({ where, layer: layer.name, kind, variable: p.variable })
        }
      }
    }
    // Buttons: compare the frame fill, stroke and first text colour.
    const rule = EXPECTED.buttonRules[component.figmaName]
    if (!rule) continue
    const props = variant.variantProperties || {}
    const version = props.Version || ''
    const expected = version in rule ? rule[version] : rule['*']
    if (!expected) continue
    const text = variant.findOne ? variant.findOne((n) => n.type === 'TEXT') : null
    const got = {
      fill: (paints(variant, variableNames, 'fill')[0] || {}).variable || null,
      stroke: (paints(variant, variableNames, 'stroke')[0] || {}).variable || null,
      text: text ? ((paints(text, variableNames, 'fill')[0] || {}).variable || null) : null
    }
    for (const prop of ['fill', 'stroke', 'text']) {
      if (!(prop in expected)) continue
      const want = expected[prop]
      const have = got[prop] ? tokenPath(got[prop]) : null
      if ((want || null) !== (have || null)) report.bindings.wrong.push({ where, prop, expected: want || 'none', actual: got[prop] || 'none' })
      else report.bindings.ok++
    }
  }
}

async function run() {
  const report = {
    file: figma.root.name,
    library: EXPECTED.generatedFrom,
    variables: { ok: 0, wrong: [], missing: [], extra: [] },
    codeSyntax: { ok: 0, missing: [] },
    components: { ok: 0, missing: [], variants: [], extra: [] },
    bindings: { ok: 0, wrong: [], raw: [], palette: [] }
  }
  const variableNames = await auditVariables(report)
  await auditComponents(report, variableNames)
  figma.ui.postMessage(report)
}

figma.showUI(__html__, { width: 520, height: 680, title: 'Filmmakers audit' })
figma.ui.onmessage = (msg) => { if (msg === 'rerun') run().catch((e) => figma.ui.postMessage({ error: e.message })) }
run().catch((e) => figma.ui.postMessage({ error: e.message }))
