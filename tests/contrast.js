/* Contrast of every colour pair the library actually draws.
 *
 * The pairs below are not every combination of the palette - most of those are never drawn on
 * top of each other and their ratio means nothing. They are the pairs which do end up on screen
 * together, read out of the components' own CSS. Keep them in step with it: 'npm test' fails if
 * a variable is added to 'Colors' without being named here, which is the way this list would
 * otherwise quietly rot.
 *
 * Thresholds are WCAG 2.1 AA - 4.5:1 for text (SC 1.4.3) and 3:1 for the graphics and controls
 * which carry meaning on their own (SC 1.4.11).
 *
 * Run 'npm run check:contrast' to print the table.
 */

/** @param {string} c  '#rgb', '#rrggbb' or '#rrggbbaa' */
export function parse(c) {
   let s = String(c).trim().replace(/^#/, '');
   if (s.length === 3 || s.length === 4) s = [...s].map((x) => x + x).join('');
   if (s.length !== 6 && s.length !== 8) throw new Error(`cannot read colour ${c}`);
   const n = (i) => parseInt(s.slice(i, i + 2), 16);
   return { r: n(0), g: n(2), b: n(4), a: s.length === 8 ? n(6) / 255 : 1 };
}

/** flattens a translucent colour onto an opaque one, the way the browser paints it */
export function over(fg, bg) {
   const f = parse(fg), b = parse(bg);
   const mix = (x, y) => Math.round(x * f.a + y * (1 - f.a));
   const hex = (v) => v.toString(16).padStart(2, '0');
   return `#${hex(mix(f.r, b.r))}${hex(mix(f.g, b.g))}${hex(mix(f.b, b.b))}`;
}

export function luminance(c) {
   const { r, g, b } = parse(c);
   const ch = (v) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
   };
   return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrast(a, b) {
   const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
   return (hi + 0.05) / (lo + 0.05);
}

/** reads a 'Colors'-shaped string into an object of variable -> value */
export function parsePalette(str) {
   const out = {};
   for (const [, name, value] of str.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
      out[name] = value.trim();
   }
   return out;
}

/** every pair the components put on top of each other: [what, on what, minimum, why] */
export function pairs(P) {
   const container = P['--container-bg-color'];
   /* the accent is translucent where it is used as a hover and focus tint */
   const tint = over(P['--main-color1-light'], container);
   /* the round buttons paint their masked icons with '--text-color-light' */
   const icon = P['--text-color-light'];

   return [
      // --- text, 4.5:1 -------------------------------------------------------------
      ['--text-color-light', '--bg-color-dark', 4.5, 'Button label on its button'],
      ['--text-color-light', '--main-color1', 4.5, 'selected option, range value, filled input'],
      ['--text-color-dark', '--bg-color-light', 4.5, 'option, Number value, empty input'],
      ['--text-color-dark', '--container-bg-color', 4.5, 'Container label'],
      ['--text-color-dark', '--container-bg-color-hover', 4.5, 'Container label, hovered'],
      ['--text-color-placeholder', '--bg-color-light', 4.5, 'TextInput placeholder'],
      [P['--main-color2'], tint, 4.5, 'hover text, focused input text'],
      ['--warning-text-color', '--warning-color', 4.5, 'text in an error Container'],
      ['--warning-link-color', '--warning-color', 4.5, 'link in an error Container'],
      ['--warning-link-hover-color', '--warning-color', 4.5, 'that link, hovered'],
      ['--warning-color-dark', '--warning-color-light', 4.5, 'invalid input, rejected file'],
      // --- graphics and controls, 3:1 ----------------------------------------------
      [icon, P['--bg-color-dark'], 3, 'icon on a round button'],
      [icon, P['--main-color1'], 3, 'icon on a round button, hovered'],
      [icon, P['--warning-color'], 3, 'icon on ButtonCancel, hovered'],
      ['--main-color2', '--bg-color-light', 3, "Number's arrows"],
      ['--main-color1', '--bg-color-light', 3, "Number's arrows, hovered"],
      ['--outline-color', '--container-bg-color', 3, 'keyboard focus ring'],
      ['--main-color1', '--container-bg-color', 3, 'FileSelector icon, active'],
      [P['--main-color1'], tint, 3, 'FileSelector icon while dragging'],
      ['--main-color1', '--bg-color-light', 3, "Range's filled bar against its track"],
   ];
}

/* Pairs the default palette does not meet either. Reported, never asserted - raising them needs
   a change to the components, not to the palette, so failing on them would only mean the check
   can never pass. */
export function exceptions() {
   return [
      ['--slider-edge-color', '--main-color1', 3, "Range's grip against its bar"],
      ['--bg-color-light', '--container-bg-color', 3, 'a slider track against the container'],
      ['--bg-color-medium', '--bg-color-light', 3, "RangeDiscrete's step stripes"],
   ];
}

/** every variable a pair depends on, so an unused one can be spotted */
const NAMED = new Set([
   '--text-color-light', '--text-color-dark', '--text-color-placeholder', '--bg-color-dark',
   '--bg-color-light', '--bg-color-medium', '--main-color1', '--main-color1-light',
   '--main-color2', '--container-bg-color', '--container-bg-color-hover', '--outline-color',
   '--warning-color', '--warning-text-color', '--warning-color-light', '--warning-color-dark',
   '--warning-link-color', '--warning-link-hover-color', '--slider-edge-color',
]);

export function check(palette) {
   const resolve = (c) => (typeof c === 'string' && c.startsWith('--') ? palette[c] : c);
   const run = (list) => list.map(([fg, bg, need, what]) => {
      const ratio = contrast(resolve(fg), resolve(bg));
      return { what, need, ratio, passed: ratio >= need };
   });

   const required = run(pairs(palette));
   /* a variable nobody checks is a variable whose contrast silently stopped mattering */
   const unchecked = Object.keys(palette).filter((v) => !NAMED.has(v));

   return {
      required,
      exceptions: run(exceptions()),
      unchecked,
      failed: required.filter((r) => !r.passed),
      /* how much room the tightest required pair has above its own minimum */
      margin: Math.min(...required.map((r) => r.ratio / r.need)),
   };
}

/* --------------------------------------------------------------- printed report */

export function formatReport(name, result) {
   const lines = [`palette: ${name}`, ''];
   const row = (r) => `  ${r.passed ? 'ok  ' : 'FAIL'} ${r.ratio.toFixed(2).padStart(5)}:1` +
      `  (needs ${r.need})  ${r.what}`;
   lines.push('required:');
   for (const r of result.required) lines.push(row(r));
   lines.push('', 'known exceptions, not asserted:');
   for (const r of result.exceptions) lines.push(row(r).replace('FAIL', '--  '));
   lines.push('');
   if (result.unchecked.length) {
      lines.push(`WARNING: no pair uses ${result.unchecked.join(', ')} - is the list still complete?`);
   }
   lines.push(result.failed.length
      ? `${result.failed.length} of ${result.required.length} pairs fail`
      : `all ${result.required.length} pairs pass, tightest at ${result.margin.toFixed(2)}x its minimum`);
   return lines.join('\n');
}

/* run directly: print the table for the shipped palette, or for one given as an argument */
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
   const { Colors } = await import('../src/controls/utils.js');
   const arg = process.argv[2];
   const source = arg
      ? (await import('node:fs')).readFileSync(arg, 'utf8')
      : Colors;
   const result = check(parsePalette(source));
   console.log(formatReport(arg ?? 'the Colors constant', result));
   process.exit(result.failed.length ? 1 : 0);
}
