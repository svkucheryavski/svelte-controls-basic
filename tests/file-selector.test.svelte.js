/* FileSelector accepts what it should, refuses the rest, and says which */
import { test } from 'node:test';
import assert from 'node:assert';
import { collector, report } from './check.js';
import { mount, flushSync } from 'svelte';
import FileSelector from './FileSelector.svelte.js';

const { ok, eq, results } = collector();

const file = (name, type = '') => new window.File(['x'], name, { type });

function render(props = {}) {
   const target = document.createElement('div');
   document.body.appendChild(target);
   const st = $state({ f: props.file });
   mount(FileSelector, { target, props: {
      ...props,
      get file() { return st.f; }, set file(x) { st.f = x; },
   } });
   flushSync();
   const box = target.querySelector('.file-selector');
   const fire = (type, init = {}) => {
      const e = new window.Event(type, { bubbles: true, cancelable: true });
      Object.assign(e, init);
      box.dispatchEvent(e);
      flushSync();
   };
   return {
      target, st, box,
      /* jsdom has no DataTransfer, and the component only ever reads '.files' off it */
      drop: (...files) => fire('drop', { dataTransfer: { files } }),
      dragenter: () => fire('dragenter'),
      dragleave: () => fire('dragleave'),
      message: () => target.querySelector('.error')?.textContent ?? null,
      text: () => target.querySelector('label span').textContent,
   };
}

// ---------------------------------------------------------------- accepting a file
{
   const r = render({ acceptType: '.csv' });
   const f = file('data.csv');
   r.drop(f);
   eq('an accepted file is taken', r.st.f, f);
   eq('and nothing is refused', r.message(), null);
   eq('the name replaces the prompt', r.text(), 'data.csv');
}
{
   const r = render({ acceptType: '.csv' });
   r.drop(file('DATA.CSV'));
   ok('the extension is matched case-insensitively', !!r.st.f);
}
{
   const r = render({ acceptType: '' });
   r.drop(file('anything.bin'));
   ok('an empty acceptType takes everything', !!r.st.f);
}
{
   const r = render({ acceptType: 'text/csv' });
   r.drop(file('data.csv', 'text/csv'));
   ok('a media type is matched', !!r.st.f);
}
{
   const r = render({ acceptType: 'image/*' });
   r.drop(file('p.png', 'image/png'));
   ok('a wildcard media type is matched', !!r.st.f);
}
{
   const r = render({ acceptType: '.csv,.txt' });
   r.drop(file('notes.txt'));
   ok('any of several patterns is enough', !!r.st.f);
}

// ---------------------------------------------------------------- refusing a file
{
   const r = render({ acceptType: '.csv' });
   r.drop(file('picture.png'));
   eq('a file of the wrong type is not taken', r.st.f, undefined);
   eq('and it says why', r.message(), 'wrong file type');
   ok('the box is marked as refusing', r.box.classList.contains('rejected'));
   eq('the message is announced', r.target.querySelector('.error').getAttribute('role'), 'alert');
}
{
   const r = render({ acceptType: '.csv', multiple: false });
   r.drop(file('a.csv'), file('b.csv'));
   eq('two files where one is allowed is refused', r.st.f, undefined);
   eq('and it says why', r.message(), 'drop one file only');
}
{
   const r = render({ acceptType: '.csv' });
   r.drop(file('keep.csv'));
   const kept = r.st.f;
   r.drop(file('wrong.png'));
   eq('a refused drop leaves the file already chosen alone', r.st.f, kept);
}

// ---------------------------------------------------------------- several files
{
   const r = render({ acceptType: '.csv', multiple: true });
   r.drop(file('a.csv'), file('b.csv'));
   eq('both are taken', r.st.f?.length, 2);
   eq('and the count is shown', r.text(), 'Selected 2 files');
}
{
   const r = render({ acceptType: '.csv', multiple: true });
   r.drop(file('a.csv'), file('skip.png'), file('b.csv'));
   eq('the ones which do not match are dropped', r.st.f?.length, 2);
}
{
   const r = render({ acceptType: '.csv', multiple: true });
   r.drop(file('only.csv'));
   ok('a single file is not wrapped in an array', r.st.f instanceof window.File, String(r.st.f));
}

// ---------------------------------------------------------------- disabled
{
   const r = render({ acceptType: '.csv', disable: true });
   r.drop(file('data.csv'));
   eq('a disabled selector takes nothing', r.st.f, undefined);
   eq('and refuses nothing either', r.message(), null);
   ok('it is marked disabled', r.box.classList.contains('disabled'));
   eq('and its input is disabled', r.target.querySelector('input').disabled, true);
}
{
   const r = render({ acceptType: '.csv', disable: true });
   r.dragenter();
   ok('a disabled selector does not light up while dragging',
      !r.box.classList.contains('dragging'));
}

// ---------------------------------------------------------------- dragging feedback
{
   const r = render({ acceptType: '.csv' });
   r.dragenter();
   ok('dragging over it lights up', r.box.classList.contains('dragging'));
   r.dragleave();
   ok('leaving turns it off', !r.box.classList.contains('dragging'));
}
{
   const r = render({ acceptType: '.csv' });
   r.dragenter();
   r.dragenter();     // entering a child fires again before the parent's leave
   r.dragleave();
   ok('it stays lit while still over a child', r.box.classList.contains('dragging'));
   r.dragleave();
   ok('and turns off once fully left', !r.box.classList.contains('dragging'));
}
{
   const r = render({ acceptType: '.csv' });
   r.dragenter();
   r.drop(file('data.csv'));
   ok('dropping turns the highlight off', !r.box.classList.contains('dragging'));
}

// ---------------------------------------------------------------- clearing
{
   const r = render({ acceptType: '.csv' });
   r.drop(file('data.csv'));
   const clear = r.target.querySelector('button');
   ok('a clear button appears once a file is chosen', !!clear);
   clear.click();
   flushSync();
   eq('it clears the file', r.st.f, null);
   eq('and the prompt comes back', r.text(), 'Select CSV file with dataset');
   eq('and the button goes away', r.target.querySelector('button'), null);
}
{
   const r = render({ acceptType: '.csv' });
   eq('there is no clear button before a file is chosen', r.target.querySelector('button'), null);
}
{
   const r = render({ message: 'Pick a table' });
   eq('the prompt can be set', r.text(), 'Pick a table');
}

report(test, assert, results);
