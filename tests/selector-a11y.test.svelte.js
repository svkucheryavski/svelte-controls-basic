/* Select and PlotTypeSelector expose their state */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import Select from './Select.svelte.js';
import PlotTypeSelector from './PlotTypeSelector.svelte.js';

const { ok, eq, results } = collector();

function mountOne(Comp, props) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const st = $state({ v: props.value });
   mount(Comp, { target, props: { ...props,
      get value() { return st.v; }, set value(x) { st.v = x; } } });
   flushSync();
   return { target, st, group: () => target.querySelector('[role="radiogroup"]'),
            opts: () => [...target.querySelectorAll('.option')] };
}

for (const [name, Comp, props] of [
   ['Select', Select, { options: ['A', 'B', 'C'], value: 'B' }],
   ['PlotTypeSelector', PlotTypeSelector, { options: ['p', 'l', 'b'], value: 'l' }],
]) {
   const m = mountOne(Comp, props);
   const opts = m.opts();

   ok(`${name}: options rendered`, opts.length === 3, `got ${opts.length}`);
   ok(`${name}: every option has role=radio`,
      opts.every(o => o.getAttribute('role') === 'radio'),
      opts.map(o => o.getAttribute('role')).join(','));

   const checked = opts.map(o => o.getAttribute('aria-checked'));
   eq(`${name}: aria-checked marks exactly the selected one`,
      checked.join(','), 'false,true,false');

   // click the third option
   opts[2].click();
   flushSync();
   eq(`${name}: value updated by click`, m.st.v, props.options[2]);
   eq(`${name}: aria-checked follows the click`,
      m.opts().map(o => o.getAttribute('aria-checked')).join(','), 'false,false,true');
   m.target.remove();
}


// ---- options are text unless the consumer asks for markup ----
{
   const target = document.createElement('div');
   document.body.appendChild(target);
   const st = $state({ v: 'a' });
   mount(Select, { target, props: { options: ['a', '<img src=x onerror=alert(1)>b'],
      get value() { return st.v; }, set value(x) { st.v = x; } } });
   flushSync();
   const second = target.querySelectorAll('.option')[1];
   eq('default: markup is shown as text', second.textContent.trim(), '<img src=x onerror=alert(1)>b');
   eq('default: no element was injected', second.querySelector('img'), null);
   target.remove();
}

{
   const target = document.createElement('div');
   document.body.appendChild(target);
   const st = $state({ v: 'a' });
   mount(Select, { target, props: { options: ['a', 'm<sup>2</sup>'], html: true,
      get value() { return st.v; }, set value(x) { st.v = x; } } });
   flushSync();
   const second = target.querySelectorAll('.option')[1];
   ok('html={true}: markup still renders', !!second.querySelector('sup'), second.innerHTML);
   target.remove();
}

report(test, assert, results);
