/* the 'class' property, shared by Button, Select and TextInput: an extra class name is added
   next to the one the control gives itself. That own class is what carries the styling, so it
   has to survive; and when nothing extra is given the attribute must not be left with a gap */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import Button from './Button.svelte.js';
import Select from './Select.svelte.js';
import TextInput from './TextInput.svelte.js';

const { ok, eq, results } = collector();

function render(Comp, props, selector) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   mount(Comp, { target, props });
   flushSync();
   return target.querySelector(selector);
}

const CASES = [
   ['Button',    Button,    {},                     'button',     'button'],
   ['Select',    Select,    { options: ['a', 'b'] }, '.selector',  'selector'],
   ['TextInput', TextInput, {},                     '.textinput', 'textinput'],
];

for (const [name, Comp, props, selector, own] of CASES) {
   const plain = render(Comp, props, selector);
   ok(`${name}: carries its own class`, plain.classList.contains(own), plain.className);
   eq(`${name}: leaves no gap in the attribute when no extra class is given`,
      /\s{2,}|^\s|\s$/.test(plain.getAttribute('class')), false);

   const one = render(Comp, { ...props, class: 'extra' }, selector);
   ok(`${name}: an extra class is added`, one.classList.contains('extra'), one.className);
   ok(`${name}: next to its own`, one.classList.contains(own), one.className);

   const two = render(Comp, { ...props, class: 'wide tall' }, selector);
   ok(`${name}: several class names at once`,
      two.classList.contains('wide') && two.classList.contains('tall'), two.className);
}

/* 'className' was the name until 3.0.0 - it must not quietly keep half working */
{
   const el = render(Button, { className: 'extra' }, 'button');
   eq(`the old 'className' is not read any more`, el.classList.contains('extra'), false);
}

report(test, assert, results);
