/* Button, the eight round buttons and Spinner */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import Button from './Button.svelte.js';
import ButtonCancel from './ButtonCancel.svelte.js';
import ButtonUndo from './ButtonUndo.svelte.js';
import ButtonAdd from './ButtonAdd.svelte.js';
import ButtonDownload from './ButtonDownload.svelte.js';
import ButtonUpload from './ButtonUpload.svelte.js';
import ButtonUp from './ButtonUp.svelte.js';
import ButtonDown from './ButtonDown.svelte.js';
import ButtonSettings from './ButtonSettings.svelte.js';
import Spinner from './Spinner.svelte.js';

const { ok, eq, results } = collector();

function render(Comp, props = {}) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const clicks = [];
   mount(Comp, { target, props: { onclick: () => clicks.push(1), ...props } });
   flushSync();
   return { target, clicks, el: target.querySelector('button') };
}

// ------------------------------------------------------------------------- Button
{
   const b = render(Button);
   eq('a Button says "button" by default', b.el.textContent.trim(), 'button');
   eq('and is type=button, so it cannot submit a form by accident',
      b.el.getAttribute('type'), 'button');
   b.el.click(); flushSync();
   eq('it calls back when clicked', b.clicks.length, 1);
}
{
   const b = render(Button, { text: 'Run' });
   eq('its text can be set', b.el.textContent.trim(), 'Run');
}
{
   const b = render(Button, { type: 'submit' });
   eq('it can be made a submit button', b.el.getAttribute('type'), 'submit');
}
{
   const b = render(Button, { disable: true });
   eq('a disabled Button is disabled', b.el.disabled, true);
   b.el.click(); flushSync();
   eq('and does not call back', b.clicks.length, 0);
}

// ------------------------------------------------------------- the round buttons
const ROUND = [
   ['ButtonCancel',   ButtonCancel,   'button-cancel',   'Reset'],
   ['ButtonUndo',     ButtonUndo,     'button-undo',     'Undo'],
   ['ButtonAdd',      ButtonAdd,      'button-add',      'Add'],
   ['ButtonDownload', ButtonDownload, 'button-download', 'Download'],
   ['ButtonUpload',   ButtonUpload,   'button-upload',   'Upload'],
   ['ButtonUp',       ButtonUp,       'button-up',       'Move up'],
   ['ButtonDown',     ButtonDown,     'button-down',     'Move down'],
   ['ButtonSettings', ButtonSettings, 'button-settings', 'Settings'],
];

for (const [name, Comp, cls, title] of ROUND) {
   const b = render(Comp);
   ok(`${name}: carries its own class, which is what picks its icon`,
      b.el.classList.contains(cls), b.el.className);
   eq(`${name}: has a name for a screen reader`, b.el.getAttribute('aria-label'), title);
   eq(`${name}: and a tooltip saying the same`, b.el.getAttribute('title'), title);
   eq(`${name}: is type=button`, b.el.getAttribute('type'), 'button');

   b.el.click(); flushSync();
   eq(`${name}: calls back when clicked`, b.clicks.length, 1);

   const d = render(Comp, { disable: true });
   eq(`${name}: can be disabled`, d.el.disabled, true);
   d.el.click(); flushSync();
   eq(`${name}: and then does not call back`, d.clicks.length, 0);

   const t = render(Comp, { title: 'Custom' });
   eq(`${name}: its title can be replaced`, t.el.getAttribute('aria-label'), 'Custom');
}

/* the icons are masks painted with 'currentColor'; the colour cannot be read without a layout
   engine, but the class which selects the icon can, and that is what the CSS keys on */
{
   const seen = ROUND.map(([, Comp]) => render(Comp).el.className);
   eq('every round button ends up with a different icon class',
      new Set(seen).size, ROUND.length);
}

// ------------------------------------------------------------------------ Spinner
{
   const target = document.createElement('div');
   document.body.appendChild(target);
   mount(Spinner, { target, props: {} });
   flushSync();
   const s = target.querySelector('.spinner');
   eq('a Spinner is a status region', s.getAttribute('role'), 'status');
   eq('and announces something by default', s.getAttribute('aria-label'), 'Loading');
}
{
   const target = document.createElement('div');
   document.body.appendChild(target);
   mount(Spinner, { target, props: { label: 'Fetching results' } });
   flushSync();
   eq('its announcement can be set',
      target.querySelector('.spinner').getAttribute('aria-label'), 'Fetching results');
}

report(test, assert, results);
