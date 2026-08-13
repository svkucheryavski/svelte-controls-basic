/* Switch renders its labels as text unless asked */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import Switch from './Switch.svelte.js';
import Select from './Select.svelte.js';

const { ok, eq, results } = collector();

function render(Comp, props) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   mount(Comp, { target, props });
   flushSync();
   return target;
}

const MARKUP = ['m<sup>2</sup>', 'm<sup>3</sup>'];

// --- Switch: default is text -------------------------------------------------
{
   const t = render(Switch, { options: MARKUP, value: false });
   const btn = t.querySelectorAll('button')[0];
   eq('Switch default: no <sup> element', btn.querySelector('sup'), null);
   eq('Switch default: markup shown literally', btn.textContent.trim(), 'm<sup>2</sup>');
}

// --- Switch: html={true} renders markup --------------------------------------
{
   const t = render(Switch, { options: MARKUP, value: false, html: true });
   const btn = t.querySelectorAll('button')[0];
   ok('Switch html=true: <sup> element present', btn.querySelector('sup') !== null);
   eq('Switch html=true: text is m2', btn.textContent.replace(/\s+/g, ''), 'm2');
}

// --- the prop must reach Select, not merely be accepted ----------------------
{
   const a = render(Select, { options: MARKUP, value: MARKUP[0], html: true });
   const b = render(Switch, { options: MARKUP, value: false, html: true });
   eq('Switch html=true matches Select html=true',
      b.querySelectorAll('button')[0].innerHTML.trim(),
      a.querySelectorAll('button')[0].innerHTML.trim());
}

// --- html must not disturb the boolean binding -------------------------------
{
   const seen = [];
   const st = $state({ v: false });
   const target = document.createElement('div');
   document.body.appendChild(target);
   mount(Switch, { target, props: {
      options: ['off', 'on'], html: true,
      onchange: (v) => seen.push(v),
      get value() { return st.v; },
      set value(x) { st.v = x; },
   } });
   flushSync();
   target.querySelectorAll('button')[1].click();
   flushSync();
   eq('html=true: clicking "on" still yields true', st.v, true);
   eq('html=true: onchange fired once with true', JSON.stringify(seen), '[true]');

   target.querySelectorAll('button')[0].click();
   flushSync();
   eq('html=true: clicking "off" still yields false', st.v, false);
}

// --- second option is the one bound to true ----------------------------------
{
   const t = render(Switch, { options: MARKUP, value: true, html: true });
   const btns = t.querySelectorAll('button');
   eq('value=true selects the second option', btns[1].getAttribute('aria-checked'), 'true');
   eq('value=true leaves the first unchecked', btns[0].getAttribute('aria-checked'), 'false');
}

report(test, assert, results);
