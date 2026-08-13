/* the shipped palette meets WCAG AA on every pair the library draws */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { check, parsePalette, contrast, over } from './contrast.js';
import { Colors } from './utils.js';

const { ok, eq, results } = collector();

const palette = parsePalette(Colors);
const result = check(palette);

eq('the Colors constant parses into every variable it declares',
   Object.keys(palette).length, (Colors.match(/--[\w-]+\s*:/g) || []).length);

for (const r of result.required) {
   ok(`${r.what} - ${r.ratio.toFixed(2)}:1, needs ${r.need}`, r.passed);
}

/* a variable no pair mentions is one whose contrast quietly stopped being checked, which is how
   this list would rot as the components change */
eq('every variable of the palette is covered by some pair',
   result.unchecked.join(', '), '');

/* the maths itself, against values whose answer is known independently */
eq('black on white is 21:1', Math.round(contrast('#000000', '#ffffff')), 21);
eq('a colour against itself is 1:1', Math.round(contrast('#2a75b8', '#2a75b8')), 1);
eq('contrast does not depend on the order', contrast('#000', '#fff'), contrast('#fff', '#000'));
eq('a fully transparent colour flattens to its background', over('#00000000', '#2a75b8'), '#2a75b8');
eq('an opaque colour ignores its background', over('#2a75b8ff', '#ffffff'), '#2a75b8');
ok('a half-transparent black darkens white', contrast(over('#00000080', '#ffffff'), '#ffffff') > 1);

report(test, assert, results);
