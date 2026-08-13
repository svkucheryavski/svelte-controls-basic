/* Switch keeps a boolean on one side and a Select's string on the other, so the two have to
   stay in step whichever end moves. The clicking direction is covered in switch-html; this is
   the other one - the parent replacing the value, or the options underneath it */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import Switch from './Switch.svelte.js';

const { ok, eq, results } = collector();

function render(props = {}) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const seen = [];
   const st = $state({ v: props.value ?? false, options: props.options ?? ['off', 'on'] });
   mount(Switch, { target, props: {
      ...props,
      onchange: (v) => seen.push(v),
      get options() { return st.options; },
      get value() { return st.v; }, set value(x) { st.v = x; },
   } });
   flushSync();
   const btns = () => [...target.querySelectorAll('button')];
   return {
      target, st, seen, btns,
      checked: () => btns().find(b => b.getAttribute('aria-checked') === 'true')?.textContent.trim(),
   };
}

// ------------------------------------------------------------------ initial state
{
   const s = render({ value: false });
   eq('value=false shows the first option as chosen', s.checked(), 'off');
}
{
   const s = render({ value: true });
   eq('value=true shows the second one', s.checked(), 'on');
}

// -------------------------------------------------- the parent replaces the value
{
   const s = render({ value: false });
   s.st.v = true;
   flushSync();
   eq('a value set by the parent moves the selection', s.checked(), 'on');
   eq('and does not call onchange - nobody chose anything', JSON.stringify(s.seen), '[]');

   s.st.v = false;
   flushSync();
   eq('and moves it back', s.checked(), 'off');
}

// ------------------------------------------------ the parent replaces the options
{
   const s = render({ value: true, options: ['off', 'on'] });
   s.st.options = ['no', 'yes'];
   flushSync();
   eq('new options are shown', s.btns().map(b => b.textContent.trim()).join(','), 'no,yes');
   eq('and the selection follows the value into them', s.checked(), 'yes');
}

// --------------------------------------------------- clicking what is already set
{
   const s = render({ value: true });
   s.btns()[1].click();
   flushSync();
   eq('clicking the chosen option changes nothing', s.st.v, true);
   eq('and says nothing', JSON.stringify(s.seen), '[]');
}

// ----------------------------------------------------------- options of wrong size
{
   const s = render({ value: false, options: ['only one'] });
   eq('a switch needs exactly two options, and draws nothing without them',
      s.btns().length, 0);
}

report(test, assert, results);
