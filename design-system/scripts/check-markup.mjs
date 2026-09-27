#!/usr/bin/env node
// Check production templates against the Filmmakers System rules.
//
//   node design-system/scripts/check-markup.mjs app/views/**/*.erb
//
// Prints one line per finding in GitHub Actions annotation format, so
// findings show inline on the pull request. Exits 1 when any error is found.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { check } from '../assets/rules-engine.js'

const here = dirname(fileURLToPath(import.meta.url))
const ruleset = JSON.parse(readFileSync(join(here, '../data/rules.json'), 'utf8'))
const files = process.argv.slice(2)

if (files.length === 0) {
  console.error('Usage: check-markup.mjs <file>...')
  process.exit(2)
}

let errors = 0
let warnings = 0

for (const file of files) {
  for (const finding of check(readFileSync(file, 'utf8'), ruleset)) {
    const level = finding.severity === 'error' ? 'error' : 'warning'
    if (level === 'error') errors++
    else warnings++
    console.log(`::${level} file=${file},line=${finding.line},title=${finding.rule}::${finding.message} See ${finding.source}`)
  }
}

console.log(`${files.length} file(s) checked: ${errors} error(s), ${warnings} warning(s).`)
process.exit(errors > 0 ? 1 : 0)
