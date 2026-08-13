/* Widget values, defaults, hiding and disabling */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, unmount, flushSync } from 'svelte';
import Widget from './Widget.svelte.js';
import Select from './Select.svelte.js';
import Switch from './Switch.svelte.js';
import Number_ from './Number.svelte.js';
import TextInput from './TextInput.svelte.js';

const { ok, eq, results } = collector();

/* mounts a Widget on its own target and returns helpers scoped to that target, so one
   test cannot see the DOM another one left behind */
function makeWidget(options, initial) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const state = $state({ value: initial });
   // a mount that throws must not take the whole suite down - the crash is the thing
   // under test, so it is recorded rather than propagated
   let app = null, crash = 'none';
   try {
      app = mount(Widget, { target, props: {
         options,
         get value() { return state.value; },
         set value(v) { state.value = v; },
      } });
      flushSync();
   } catch (e) { crash = e.message; }
   // only the label span, so an assertion cannot match text belonging to the control itself
   const labels = () => [...target.querySelectorAll('.control-element > span.label')]
      .map(e => e.textContent.trim());
   return { target, state, app, labels, crash: () => crash,
      controls: () => target.querySelectorAll('.wrapper, select, input').length,
      done: () => { if (app) { try { unmount(app); } catch {} } target.remove(); } };
}

// ---------------------------------------------------------------- hiddenWhen

{
   const w = makeWidget({
      mode: { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'single' },
      stat: { label: 'FoM', el: Switch, default: false, hiddenWhen: (v) => v.mode === 'both' },
   });
   flushSync();
   ok('hiddenWhen false -> control shown', w.labels().includes('FoM'), w.labels().join('|'));

   w.state.value = { ...w.state.value, mode: 'both' };
   flushSync();
   ok('hiddenWhen true -> control hidden', !w.labels().includes('FoM'), w.labels().join('|'));

   // the value of a hidden control must survive untouched
   eq('hidden control keeps its value', w.state.value.stat, false);

   w.state.value = { ...w.state.value, stat: true };
   flushSync();
   eq('value can still be set while hidden', w.state.value.stat, true);

   w.state.value = { ...w.state.value, mode: 'single' };
   flushSync();
   ok('control reappears', w.labels().includes('FoM'), w.labels().join('|'));
   eq('value preserved across hide/show', w.state.value.stat, true);
   w.done();
}

// ------------------------------------------- OR: hidden cannot be overridden

{
   const w = makeWidget({
      never: { label: 'never', el: Switch, default: false, hidden: true, hiddenWhen: () => false },
      shown: { label: 'shown', el: Switch, default: false, hidden: false, hiddenWhen: () => false },
   });
   flushSync();
   ok('hidden:true survives hiddenWhen:()=>false', !w.labels().includes('never'), w.labels().join('|'));
   ok('hidden:false + hiddenWhen:false renders', w.labels().includes('shown'), w.labels().join('|'));
   w.done();
}

// ------------------------------------------------------ reactivity of the predicate

{
   let calls = 0;
   const w = makeWidget({
      mode: { label: 'mode', el: Select, props: { options: ['a', 'b'] }, default: 'a' },
      dep:  { label: 'dep', el: Switch, default: false,
              hiddenWhen: (v) => { calls++; return v.mode === 'b'; } },
   });
   flushSync();
   const first = calls;
   ok('predicate runs on first render', first > 0, `calls=${calls}`);

   w.state.value = { ...w.state.value, mode: 'b' };
   flushSync();
   ok('predicate re-runs when a sibling value changes', calls > first, `calls=${calls}, was ${first}`);
   ok('and the DOM follows it', !w.labels().includes('dep'), w.labels().join('|'));
   w.done();
}

// ---------------------------------------------------------------- label as function

{
   const w = makeWidget({
      mode: { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'single' },
      stat: { el: Switch, default: false, label: (v) => v.mode === 'single' ? 'FoM (single)' : 'FoM' },
   });
   flushSync();
   ok('function label resolved', w.labels().includes('FoM (single)'), w.labels().join('|'));

   w.state.value = { ...w.state.value, mode: 'both' };
   flushSync();
   ok('function label re-resolves', w.labels().includes('FoM'), w.labels().join('|'));
   w.done();
}

{
   let called = 0;
   const w = makeWidget({
      gone: { el: Switch, default: false, hidden: true, label: () => { called++; return 'x'; } },
   });
   flushSync();
   eq('label function not called for a hidden control', called, 0);
   w.done();
}

// ---------------------------------------------------------------- unchanged behaviour

{
   const w = makeWidget({
      a: { label: 'plain string', el: Switch, default: true },
      b: { label: 'another', el: Select, props: { options: ['x', 'y'] }, default: 'x' },
   });
   flushSync();
   ok('string label still works', w.labels().includes('plain string'), w.labels().join('|'));
   ok('descriptor with neither new field renders', w.labels().includes('another'), w.labels().join('|'));
   eq('defaults still seeded', w.state.value.a, true);
   eq('defaults still seeded for second', w.state.value.b, 'x');
   w.done();
}

{
   // hidden controls must still get a default seeded into value
   const w = makeWidget({
      vis:  { label: 'vis', el: Switch, default: true },
      hid:  { label: 'hid', el: Switch, default: true, hidden: true },
      hidW: { label: 'hidW', el: Switch, default: true, hiddenWhen: () => true },
   });
   flushSync();
   eq('hidden control still seeded', w.state.value.hid, true);
   eq('hiddenWhen control still seeded', w.state.value.hidW, true);
   w.done();
}

// --------------------------- the path a real interaction takes: one property mutated

{
   const w = makeWidget({
      mode: { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'single' },
      stat: { el: Switch, default: false,
              label: (v) => v.mode === 'single' ? 'FoM (single)' : 'FoM',
              hiddenWhen: (v) => v.mode === 'both' },
   });
   flushSync();
   ok('mutation: visible to start', w.labels().includes('FoM (single)'), w.labels().join('|'));

   // a bound child writes to one property, it does not replace the object
   w.state.value.mode = 'both';
   flushSync();
   ok('mutation: predicate follows a property write', !w.labels().includes('FoM'), w.labels().join('|'));

   w.state.value.mode = 'single';
   flushSync();
   ok('mutation: label follows a property write', w.labels().includes('FoM (single)'), w.labels().join('|'));
   w.done();
}

// ----------------------------- end to end: change the real Select element

{
   const w = makeWidget({
      mode: { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'single' },
      stat: { label: 'FoM', el: Switch, default: false, hiddenWhen: (v) => v.mode === 'both' },
   });
   flushSync();
   // Select is a radiogroup of buttons, not a native <select>
   const btn = [...w.target.querySelectorAll('.selector button.option')]
      .find(b => b.textContent.trim() === 'both');
   ok('end to end: option button found', !!btn);
   if (btn) {
      btn.click();
      flushSync();
      eq('end to end: bound value updated', w.state.value.mode, 'both');
      ok('end to end: sibling hidden by user interaction', !w.labels().includes('FoM'), w.labels().join('|'));
   }
   w.done();
}

// ---- callbacks must see defaults the seeding effect has not written yet ----

{
   // 'value' persisted before 'mode' existed - the case the README supports
   const w = makeWidget({
      mode:  { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'both' },
      ncomp: { label: 'ncomp', el: Number_, props: { min: 1, max: 10 }, default: 5,
               hiddenWhen: (v) => v.mode.startsWith('b') },
   }, { ncomp: 3 });
   flushSync();
   eq('partial value: no crash', w.crash(), 'none');
   ok('partial value: widget survives a dereferencing predicate', w.labels().includes('mode'), w.labels().join('|'));
   ok('partial value: predicate saw the default and hid the control', !w.labels().includes('ncomp'), w.labels().join('|'));
   w.done();
}

{
   // the control must never mount, so its clamping $effect cannot rewrite the value
   const w = makeWidget({
      mode:  { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'both' },
      ncomp: { label: 'ncomp', el: Number_, props: { min: 1, max: 10 }, default: 5,
               hiddenWhen: (v) => v.mode === 'both' },
   }, { ncomp: 99 });
   flushSync();
   eq('partial value: hidden control keeps an out of range value', w.state.value.ncomp, 99);
   w.done();
}

{
   // an explicitly present 'undefined' counts as missing, as the seeding effect treats it
   const w = makeWidget({
      mode: { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'both' },
      stat: { label: 'stat', el: Switch, default: false, hiddenWhen: (v) => v.mode === 'both' },
   }, { mode: undefined, stat: false });
   flushSync();
   ok('explicit undefined is treated as missing, not as an override', !w.labels().includes('stat'), w.labels().join('|'));
   w.done();
}

// ---- a throwing callback must cost only its own control ----

{
   const w = makeWidget({
      a: { label: 'a', el: Switch, default: false },
      b: { label: 'b', el: Switch, default: false, hiddenWhen: () => { throw new Error('boom'); } },
      c: { label: 'c', el: Switch, default: false },
   });
   flushSync();
   eq('throwing hiddenWhen: no crash', w.crash(), 'none');
   ok('throwing hiddenWhen: siblings survive', w.labels().includes('a') && w.labels().includes('c'), w.labels().join('|'));
   ok('throwing hiddenWhen: the bad control is hidden', !w.labels().includes('b'), w.labels().join('|'));
   w.done();
}

{
   const w = makeWidget({
      a: { label: 'a', el: Switch, default: false },
      b: { el: Switch, default: false, label: () => { throw new Error('boom'); } },
      c: { label: 'c', el: Switch, default: false },
   });
   flushSync();
   eq('throwing label: no crash', w.crash(), 'none');
   ok('throwing label: siblings survive', w.labels().includes('a') && w.labels().includes('c'), w.labels().join('|'));
   w.done();
}

// ---- a validation message must survive the control being hidden and shown again ----

{
   const short = (v) => v.length < 3 ? 'too short' : '';
   const w = makeWidget({
      mode: { label: 'mode', el: Select, props: { options: ['on', 'off'] }, default: 'on' },
      name: { label: 'name', el: TextInput, props: { validator: short }, default: '',
              hiddenWhen: (v) => v.mode === 'off' },
   });
   flushSync();
   const err = () => w.target.querySelector('.error-message')?.textContent ?? null;
   const input = () => w.target.querySelector('.textinput > input');

   ok('empty field shows no message', err() === null, `msg=${err()}`);

   input().value = 'ab';
   input().dispatchEvent(new window.Event('input', { bubbles: true }));
   flushSync();
   eq('invalid value shows the message', err(), 'too short');

   w.state.value.mode = 'off';   // hide it
   flushSync();
   w.state.value.mode = 'on';    // and bring it back
   flushSync();

   eq('value survived hide/show', w.state.value.name, 'ab');
   eq('message survives hide/show', err(), 'too short');
   ok('field still marked invalid', !!w.target.querySelector('.textinput.error'),
      w.target.querySelector('.textinput')?.className);
   w.done();
}

report(test, assert, results);
