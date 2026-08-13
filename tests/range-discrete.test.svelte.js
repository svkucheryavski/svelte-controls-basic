/* RangeDiscrete keeps its value on the integer grid and reports it */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import RangeDiscrete from './RangeDiscrete.svelte.js';

const { ok, eq, results } = collector();

/* Pointer input is not covered here: jsdom gives every element a zero-sized rectangle, and the
   component turns a zero width into NaN and ignores the event by design. Only the keyboard and
   the value corrections can be exercised without a layout engine. */
function render(props = {}) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const seen = [];
   const st = $state({ v: props.value });
   mount(RangeDiscrete, { target, props: {
      ...props,
      onchange: (v) => seen.push(v),
      get value() { return st.v; }, set value(x) { st.v = x; },
   } });
   flushSync();
   const el = target.querySelector('[role="slider"]');
   return {
      el, st, seen,
      key: (key) => { el.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true })); flushSync(); },
      shown: () => el.getAttribute('aria-valuenow'),
   };
}

// ------------------------------------------------------------------ value correction
{
   const r = render({ min: 1, max: 10, value: 4 });
   eq('a value already on the grid is left alone', r.st.v, 4);
   eq('nothing is reported for it', r.seen.length, 0);
}
{
   const r = render({ min: 1, max: 10, value: 4.7 });
   eq('an off-grid value is snapped', r.st.v, 5);
   eq('the correction is reported', JSON.stringify(r.seen), '[5]');
}
{
   const r = render({ min: 1, max: 10, value: 99 });
   eq('a value above max is pulled back', r.st.v, 10);
}
{
   const r = render({ min: 1, max: 10, value: -5 });
   eq('a value below min is pulled up', r.st.v, 1);
}
{
   const r = render({ min: 1, max: 10, value: 'nonsense' });
   eq('a non-numeric value falls back to min', r.st.v, 1);
}
{
   const r = render({ min: 1, max: 10 });
   eq('a missing value falls back to min', r.st.v, 1);
}

// ------------------------------------------------------------------ limits and step
{
   const r = render({ min: 5, max: 2, value: 4 });
   eq('max below min collapses the range', r.el.getAttribute('aria-valuemax'), '5');
   eq('and the value sits on it', r.st.v, 5);
}
{
   const r = render({ min: 0, max: 10, step: 0.4, value: 0 });
   r.key('ArrowRight');
   eq('a fractional step is rounded up to a whole one', r.st.v, 1);
}
{
   const r = render({ min: 0, max: 10, step: -3, value: 0 });
   r.key('ArrowRight');
   eq('a negative step is used as its size', r.st.v, 3);
}
{
   const r = render({ min: 0, max: 9, step: 3, value: 0 });
   r.key('End');
   eq('End reaches the last value on the grid', r.st.v, 9);
}

// ------------------------------------------------------------------ keyboard
{
   const r = render({ min: 1, max: 10, value: 5 });
   r.key('ArrowRight'); eq('ArrowRight steps up', r.st.v, 6);
   r.key('ArrowUp');    eq('ArrowUp steps up', r.st.v, 7);
   r.key('ArrowLeft');  eq('ArrowLeft steps down', r.st.v, 6);
   r.key('ArrowDown');  eq('ArrowDown steps down', r.st.v, 5);
   r.key('Home');       eq('Home goes to min', r.st.v, 1);
   r.key('End');        eq('End goes to max', r.st.v, 10);
   r.key('End');        eq('End again changes nothing', r.st.v, 10);
   eq('a no-op is not reported', r.seen.filter(v => v === 10).length, 1);
   r.key('q');          eq('an unrelated key is ignored', r.st.v, 10);
}
{
   const r = render({ min: 1, max: 10, value: 1 });
   r.key('ArrowLeft');
   eq('it does not step below min', r.st.v, 1);
}

// ------------------------------------------------------------------ disabled
{
   const r = render({ min: 1, max: 10, value: 5, disable: true });
   r.key('ArrowRight');
   eq('a disabled slider ignores the keyboard', r.st.v, 5);
   eq('and says so', r.el.getAttribute('aria-disabled'), 'true');
   eq('and is out of the tab order', r.el.getAttribute('tabindex'), '-1');
}
{
   const r = render({ min: 1, max: 10, value: 5 });
   eq('an enabled slider is in the tab order', r.el.getAttribute('tabindex'), '0');
   eq('and does not claim to be disabled', r.el.getAttribute('aria-disabled'), null);
}

// ------------------------------------------------------------------ what it reports
{
   const r = render({ min: 2, max: 8, value: 5, ariaLabel: 'components' });
   eq('role', r.el.getAttribute('role'), 'slider');
   eq('valuenow', r.el.getAttribute('aria-valuenow'), '5');
   eq('valuemin', r.el.getAttribute('aria-valuemin'), '2');
   eq('valuemax', r.el.getAttribute('aria-valuemax'), '8');
   eq('its own name wins', r.el.getAttribute('aria-label'), 'components');
   eq('and it does not also point at a container', r.el.getAttribute('aria-labelledby'), null);
   r.key('ArrowRight');
   eq('valuenow follows the value', r.el.getAttribute('aria-valuenow'), '6');
}

/* the modifier class matches no rule in the package and is documented as a hook for the
   consumer's own CSS, which makes it look like dead code to anyone tidying up - it is pinned
   here so that removing it fails rather than silently breaking somebody's stylesheet */
{
   const r = render({ min: 1, max: 20, value: 5 });
   ok('the container class is shared with Range',
      r.el.classList.contains('range-slider-container'), r.el.className);
   ok('and the discrete slider carries a modifier of its own',
      r.el.classList.contains('range-slider-container_discrete'), r.el.className);
}

report(test, assert, results);
