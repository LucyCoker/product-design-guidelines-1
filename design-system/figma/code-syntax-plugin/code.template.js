// Filmmakers code syntax: sets the Web code syntax on every local variable
// whose name matches a library token, so Dev Mode shows the CSS variable.
// Generated from code.template.js by scripts/build-figma.mjs. Edit the
// template, not code.js.

const CODE_SYNTAX = __CODE_SYNTAX__

// Tokens Studio may keep the set name in front ("theme/surface/body"), so
// fall back to the longest matching end of the name.
function lookup(name) {
  if (CODE_SYNTAX[name]) return CODE_SYNTAX[name]
  const parts = name.split('/')
  for (let i = 1; i < parts.length; i++) {
    const tail = parts.slice(i).join('/')
    if (CODE_SYNTAX[tail]) return CODE_SYNTAX[tail]
  }
  return null
}

async function run() {
  const variables = await figma.variables.getLocalVariablesAsync()
  let updated = 0
  const missed = []
  for (const variable of variables) {
    const web = lookup(variable.name)
    if (!web) { missed.push(variable.name); continue }
    variable.setVariableCodeSyntax('WEB', web)
    updated++
  }
  if (missed.length) console.log('No code syntax for:', missed)
  figma.closePlugin(`Code syntax set on ${updated} of ${variables.length} variables.` + (missed.length ? ` ${missed.length} had no match (see console).` : ''))
}

run().catch((error) => figma.closePlugin(`Could not set code syntax: ${error.message}`))
