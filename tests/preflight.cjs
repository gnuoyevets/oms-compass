#!/usr/bin/env node
// One-command preflight verifier for OMS Compass (zero external dependencies).
// Checks release/cache consistency and runs all four dependency-free test suites.
// Software checks only; they do not establish clinical validity.
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const t0 = Date.now();
let okCount = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    okCount++;
  } else {
    failures.push(detail ? `${name} (${detail})` : name);
  }
}

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swJs = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');

// 1. Version sync across index.html, CHANGES[0], sw.js, and CHANGELOG.md
const verMatch = indexHtml.match(/const VER='([^']+)'/);
const changesMatch = indexHtml.match(/const CHANGES=\[\s*\{v:'([^']+)'/);
const swMatch = swJs.match(/const VERSION\s*=\s*'([^']+)'/);
const clMatch = changelog.match(/^## v([^\s—]+)/m);

const ver = verMatch && verMatch[1];
const changesVer = changesMatch && changesMatch[1];
const swVer = swMatch && swMatch[1];
const clVer = clMatch && clMatch[1];

check('index.html defines VER', !!ver, 'missing const VER');
check('index.html CHANGES[0] matches VER', !!ver && changesVer === ver, `CHANGES[0]=${changesVer}, VER=${ver}`);
check('sw.js VERSION ends with -v<VER>', !!ver && !!swVer && swVer.endsWith('-v' + ver), `sw.js=${swVer}, VER=${ver}`);
check('CHANGELOG.md top heading matches VER', !!ver && clVer === ver, `CHANGELOG=${clVer}, VER=${ver}`);

// 2. Service Worker precache integrity & version-skew guard
const coreMatch = swJs.match(/const CORE\s*=\s*\[([\s\S]*?)\];/);
const coreEntries = coreMatch ? [...coreMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : [];
check('sw.js CORE precache list is non-empty', coreEntries.length >= 6, `found ${coreEntries.length}`);

const missingCore = [];
for (const entry of coreEntries) {
  const rel = entry.replace(/^\.\//, '');
  const target = rel === '' ? 'index.html' : (rel.endsWith('/') ? path.join(rel, 'index.html') : rel);
  if (!fs.existsSync(path.join(ROOT, target))) missingCore.push(entry);
}
check('every sw.js CORE precache path exists on disk', missingCore.length === 0, `missing: ${missingCore.join(', ')}`);
check('sw.js fetches same-origin JS/CSS network-first (no version skew)',
  /\\\.\(js\|css\)\$/.test(swJs) && /fetch\(req,\s*\{cache:\s*'no-cache'\}\)/.test(swJs),
  'expected network-first handler for local .js/.css assets');

// 3. No stray git conflict markers in core source files
const scanFiles = ['index.html', 'sw.js', 'handouts/index.html', 'handouts/v2.js', 'CHANGELOG.md', 'README.md', 'AGENTS.md'];
const conflicted = scanFiles.filter(f => {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) return false;
  return /^(<{7}|={7}|>{7})/m.test(fs.readFileSync(p, 'utf8'));
});
check('no git merge-conflict markers in core files', conflicted.length === 0, `found in: ${conflicted.join(', ')}`);

if (failures.length) {
  console.error(`Preflight metadata checks FAILED (${failures.length}):`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`Preflight metadata: ${okCount} checks passed (v${ver}, cache ${swVer}).`);

// 4. Run all four dependency-free test suites
const suites = [
  'tests/reconciliation.cjs',
  'tests/clinical-workflow.cjs',
  'tests/v2.cjs',
  'tests/graph.cjs',
];

for (const suite of suites) {
  execFileSync(process.execPath, [path.join(ROOT, suite)], { stdio: 'inherit' });
}

const ms = Date.now() - t0;
console.log(`\nPreflight PASSED (${okCount} metadata checks + ${suites.length} test suites) in ${(ms / 1000).toFixed(2)}s.`);
console.log('Note: Software checks only; they do not establish clinical validity. Browser suite (tests/run.cjs) runs in CI.');
