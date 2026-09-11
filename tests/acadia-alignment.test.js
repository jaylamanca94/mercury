const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.join(__dirname, '..');
const manifest = require('../acadia-vendor.json');

test('vendored Acadia stylesheet and supporting assets match the reviewed revision', () => {
  for (const [file, record] of Object.entries(manifest.files)) {
    const actual = createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
    assert.equal(actual, record.sha256, `${file}: refresh the reviewed Acadia snapshot; do not patch shared assets locally`);
  }
});

test('active product class names all have definitions in the Acadia snapshot', () => {
  const css = fs.readFileSync(path.join(root, 'acadia.css'), 'utf8');
  const selectors = new Set([...css.matchAll(/\.((?:acadia-)[\w-]+)/g)].map(match => match[1]));
  for (const file of ['index.html', 'brokerage.js', 'dashboard.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/(?:class=|className\s*=\s*)["'`]([^"'`]+)["'`]/g)) {
      for (const name of match[1].split(/\s+/).filter(name => name.startsWith('acadia-'))) {
        assert.ok(selectors.has(name), `${file}: ${name} has no canonical style definition`);
      }
    }
  }
  assert.ok(!fs.existsSync(path.join(root, 'acadia-table.css')), 'Table belongs in the single canonical stylesheet');
});
