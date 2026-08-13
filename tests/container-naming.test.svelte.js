/* a control takes the label of the Container it sits in */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import Container from './Container.svelte.js';
import Select from './Select.svelte.js';
import PlotTypeSelector from './PlotTypeSelector.svelte.js';
import TextInput from './TextInput.svelte.js';
import Color from './Color.svelte.js';
import Number_ from './Number.svelte.js';
import Range from './Range.svelte.js';
import Switch from './Switch.svelte.js';

const { ok, eq, results } = collector();

function inContainer(Comp, props, containerProps) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const st = $state({ v: props.value });
   mount(Container, { target, props: {
      ...containerProps,
      children: (anchor) => Comp(anchor, {
         ...props,
         get value() { return st.v; },
         set value(x) { st.v = x; },
      }),
   } });
   flushSync();
   const named = target.querySelector('[role="radiogroup"], [role="slider"], [role="spinbutton"], input');
   return { target, named,
      // resolve aria-labelledby the way a screen reader would
      resolved: () => {
         const id = named?.getAttribute('aria-labelledby');
         if (!id) return null;
         return target.querySelector(`#${CSS.escape(id)}`)?.textContent ?? 'DANGLING-ID';
      } };
}

const CASES = [
   ['Select',           Select,           { options: ['A', 'B'], value: 'A' }],
   ['PlotTypeSelector', PlotTypeSelector, { options: ['p', 'l'], value: 'p' }],
   ['TextInput',        TextInput,        { value: '' }],
   ['Color',            Color,            { value: '#102030' }],
   ['Number',           Number_,          { value: 5 }],
   ['Range',            Range,            { value: 5 }],
   ['Switch',           Switch,           { value: false }],
];

// with an id set on the Container, the control names itself after its label
for (const [name, Comp, props] of CASES) {
   const m = inContainer(Comp, props, { label: 'the label', id: 'nm' });
   ok(`${name}: found the named element`, !!m.named);
   eq(`${name}: named by the Container's label`, m.resolved(), 'the label');
   m.target.remove();
}

// no id -> nothing changes, which is what every existing consumer gets
for (const [name, Comp, props] of CASES) {
   const m = inContainer(Comp, props, { label: 'the label' });
   eq(`${name}: no id -> no aria-labelledby`, m.named?.getAttribute('aria-labelledby'), null);
   m.target.remove();
}

// an id but no label must not leave a reference pointing at nothing
for (const [name, Comp, props] of CASES) {
   const m = inContainer(Comp, props, { id: 'nm' });
   eq(`${name}: id without a label -> no reference`, m.named?.getAttribute('aria-labelledby'), null);
   m.target.remove();
}

// an explicit ariaLabel must win over the Container's label
for (const [name, Comp, props] of CASES) {
   const m = inContainer(Comp, { ...props, ariaLabel: 'explicit' }, { label: 'the label', id: 'nm' });
   eq(`${name}: explicit ariaLabel wins`, m.named?.getAttribute('aria-label'), 'explicit');
   eq(`${name}: and does not also point at the label`, m.named?.getAttribute('aria-labelledby'), null);
   m.target.remove();
}

// two Containers with their own ids stay independent
{
   const a = inContainer(Select, { options: ['A', 'B'], value: 'A' }, { label: 'first', id: 'one' });
   const b = inContainer(Select, { options: ['A', 'B'], value: 'A' }, { label: 'second', id: 'two' });
   eq('first resolves to its own text', a.resolved(), 'first');
   eq('second resolves to its own text', b.resolved(), 'second');
   a.target.remove(); b.target.remove();
}

// a control on its own, with no Container at all
{
   const target = document.createElement('div');
   document.body.appendChild(target);
   const st = $state({ v: 'A' });
   mount(Select, { target, props: { options: ['A', 'B'],
      get value() { return st.v; }, set value(x) { st.v = x; } } });
   flushSync();
   const g = target.querySelector('[role="radiogroup"]');
   ok('bare Select still renders', !!g);
   eq('bare Select: no aria-labelledby', g.getAttribute('aria-labelledby'), null);
   target.remove();
}

report(test, assert, results);
