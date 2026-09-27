// Checks HTML or template markup against data/rules.json.
// No DOM needed, so the same code runs in the browser and in Node (CI).
// It reads opening tags only. Template syntax inside attributes is left as is.

const TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g
const ATTR = /([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g

function parseAttributes(source) {
  const attributes = {}
  for (const match of source.matchAll(ATTR)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attributes
}

function lineAt(text, index) {
  let line = 1
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++
  return line
}

export function parseElements(markup) {
  const elements = []
  for (const match of markup.matchAll(TAG)) {
    const attributes = parseAttributes(match[2] || '')
    elements.push({
      tag: match[1].toLowerCase(),
      attributes,
      classes: new Set((attributes.class || '').split(/\s+/).filter(Boolean)),
      line: lineAt(markup, match.index),
      snippet: match[0].length > 140 ? match[0].slice(0, 137) + '...' : match[0]
    })
  }
  return elements
}

function matches(element, match, selectors) {
  const has = (name) => element.classes.has(name)
  if (match.all && !match.all.every(has)) return false
  if (match.anyOf && !match.anyOf.some(has)) return false
  if (match.any && !(selectors[match.any] || []).some(has)) return false
  return true
}

export function check(markup, ruleset) {
  const elements = parseElements(markup)
  const selectors = ruleset.selectors || {}
  const findings = []
  const report = (rule, element, extra = '') => findings.push({
    rule: rule.id,
    category: rule.category,
    severity: rule.severity,
    message: rule.message + extra,
    source: rule.source,
    line: element.line,
    snippet: element.snippet
  })

  for (const rule of ruleset.rules) {
    if (rule.type === 'banned-style') {
      const pattern = new RegExp(rule.pattern)
      for (const element of elements) {
        if (element.attributes.style && pattern.test(element.attributes.style)) report(rule, element)
      }
      continue
    }

    const hits = elements.filter((element) => matches(element, rule.match, selectors))

    if (rule.type === 'banned-classes') {
      hits.forEach((element) => report(rule, element))
    } else if (rule.type === 'allowed-themes') {
      for (const element of hits) {
        const allowedOk = !rule.allowed || rule.allowed.some((name) => element.classes.has(name))
        const requiredOk = !rule.requireAll || rule.requireAll.every((name) => element.classes.has(name))
        if (!allowedOk || !requiredOk) report(rule, element)
      }
    } else if (rule.type === 'require-attribute') {
      for (const element of hits) {
        const named = rule.anyAttribute.some((name) => (element.attributes[name] || '').trim() !== '')
        if (!named) report(rule, element)
      }
    } else if (rule.type === 'max-count' && hits.length > rule.max) {
      hits.slice(rule.max).forEach((element) => report(rule, element, ` Found ${hits.length}.`))
    }
  }

  return findings.sort((a, b) => a.line - b.line)
}
