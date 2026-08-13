/* Widget writes its title at the depth the surrounding page needs */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import Widget from './Widget.svelte.js';
import Range from './Range.svelte.js';

const { ok, eq, results } = collector();

const OPTIONS = { a: { label: 'A', el: Range, props: {}, default: 5 } };

function render(props = {}) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const st = $state({ v: undefined });
   mount(Widget, { target, props: {
      options: OPTIONS, title: 'Settings', ...props,
      get value() { return st.v; }, set value(x) { st.v = x; },
   } });
   flushSync();
   const h = target.querySelector('h1, h2, h3, h4, h5, h6');
   return { target, h, tag: h?.tagName.toLowerCase() ?? null };
}

// ------------------------------------------------------------------- the default
{
   const r = render();
   eq('a title is an h2 unless asked otherwise', r.tag, 'h2');
}

// ------------------------------------------------------------------- every level
for (const level of [2, 3, 4, 5, 6]) {
   const r = render({ headingLevel: level });
   eq(`headingLevel ${level} writes an h${level}`, r.tag, `h${level}`);
}

// ------------------------------------------------------- out of range and nonsense
{
   const r = render({ headingLevel: 1 });
   eq('a level above h2 is pulled back to it, so the widget never takes the page title',
      r.tag, 'h2');
}
{
   const r = render({ headingLevel: 7 });
   eq('a level below h6 is pulled back to it - HTML has no h7', r.tag, 'h6');
}
{
   const r = render({ headingLevel: 99 });
   eq('and so is a far larger one', r.tag, 'h6');
}
{
   const r = render({ headingLevel: 3.4 });
   eq('a fractional level is rounded', r.tag, 'h3');
}
{
   const r = render({ headingLevel: 'nonsense' });
   eq('a non-numeric level falls back to the default', r.tag, 'h2');
}
{
   const r = render({ headingLevel: null });
   eq('and so does a missing one', r.tag, 'h2');
}
{
   const r = render({ headingLevel: '4' });
   eq('a numeric string is read as the number', r.tag, 'h4');
}

// --------------------------------------------------- the name of the group follows it
{
   const r = render({ headingLevel: 5 });
   const div = r.target.querySelector('.widget');
   eq('the widget is still a group', div.getAttribute('role'), 'group');
   const id = div.getAttribute('aria-labelledby');
   ok('which is named by the heading whatever its level', !!id && r.h.id === id,
      `${id} vs ${r.h?.id}`);
   eq('and the heading still carries the title', r.h.textContent, 'Settings');
}
{
   const r = render({ title: '', headingLevel: 4 });
   eq('a widget with no title writes no heading at all', r.tag, null);
}

report(test, assert, results);
