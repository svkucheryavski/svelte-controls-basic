<!--
@component Text input.

   Main properties:
   - `value` - the entered value, bindable, default: `''`.
   - `placeholder` - text for place holder, default: `''`.
   - `maxLength` - maximum number of symbols that can be entered, default: `25`.
   - `validator` - function to validate the input value (should return error message or empty string)
   - `disable` - if `true` the input does not react to any input, default: `false`.

   The validator is re-run whenever the value or the validator itself changes, also when the
   change comes from the parent and not from the user. An empty field is never reported, so a
   form does not open with error messages on the fields nobody has filled in yet.
-->
<script>
   import { getContext } from 'svelte';
   import { LabelIdKey } from './utils.js';
   let {
      value = $bindable(''),        // initial selected value
      className = '',               // extra class name
      placeholder = '',             // placeholder (hint)
      maxLength = 25,               // maximum number of characters
      validator = null,             // validator callback, returns error message if value is not valid (empty if it is).
      disable = false,              // if true the input ignores any input
      onchange = null,              // callback when value changes
      ariaLabel = null,             // accessible name
   } = $props();

   /* a control which is not given an 'ariaLabel' of its own takes the label of the Container
      it sits in, when that container was given an 'id' */
   const containerLabel = getContext(LabelIdKey);
   const labelledBy = $derived(ariaLabel ? undefined : containerLabel?.());

   /* derived and not set from the input handler, so that a value or a validator replaced by
      the parent does not leave an outdated message on the screen.

      An empty field is never reported, so a form does not open covered in messages on the
      fields nobody has filled in yet. That test is made on the value itself rather than on a
      "this one has been edited" flag held by the component, because the input is destroyed
      and built again every time it is hidden and shown - by a Widget's 'hiddenWhen', or by
      any '{#if}' around it - and such a flag would come back cleared, leaving a field the
      validator still rejects looking valid */
   const error = $derived.by(() => {
      if (!validator || value === '' || value === null || value === undefined) return '';
      const msg = validator(value);
      return typeof msg === 'string' ? msg : '';
   });

   function handleInput() {
      if (onchange) onchange(value);
   }
</script>

<div class="textinput {className}" class:error={error !== ''}>
<input type="text" aria-label={ariaLabel} aria-labelledby={labelledBy} {placeholder} maxlength={maxLength} disabled={disable} bind:value={value} oninput={handleInput}>
{#if error !== ''}<div class="error-message">{error}</div>{/if}
</div>

<style>

   .textinput {
      box-sizing: border-box;
      flex: 1 1 auto;
      /* height: 1.5em; */
      font-size: 1em;
      line-height: 1.5em;
      margin: 0;
      padding: 0.15em 0;
      width: auto;
      border-radius: 2px;
      user-select: none;
      display: flex;
      position: relative;
   }

   .textinput > input {
      flex: 1 1 auto;
      font-size: 0.9em;
      width: 100%;
      cursor: default;
      padding: 0.25em 0.5em;
      border: 1px solid;
      border-radius: 0.3em;
      outline: none;
      background-color: var(--main-color1, #2a75b8);
      color: var(--text-color-light, #fafafa);
   }

   .textinput > input:disabled {
      opacity: 0.4;
      cursor: default;
   }

   .textinput > input:placeholder-shown {
      color: var(--text-color-dark, #606570);
      background-color: var(--bg-color-light, #f0f0f0);
      border-color: var(--bg-color-light, #f0f0f0);
   }

   .textinput > input::placeholder {
      color: var(--text-color-placeholder, #6d6d6d);
   }

   .textinput > input:active::placeholder,
   .textinput > input:focus::placeholder {
      color: transparent;
   }

   .textinput > input:focus,
   .textinput > input:active {
      border-color: var(--main-color1, #2a75b8);
      background-color: var(--main-color1-light, #2a75b820);
      color: var(--main-color2, #1a4972);
   }

   /* '--warning-color-dark' and not '--warning-color': the latter is the colour of a warning
      *background* elsewhere in the library, so a theme which sets it to a pale shade - the
      right choice for a background - would paint this text invisible on the pale background
      below it */
   .textinput.error > input,
   .textinput.error > input:focus,
   .textinput.error > input:active {
      color: var(--warning-color-dark, #b00d2f);
      background-color: var(--warning-color-light, #ffd5ce);
      border-color: var(--warning-color-dark, #b00d2f);
   }

   .error-message {
      position: absolute;
      left: 0;
      bottom: calc(100% + 2px);
      border-radius: 0.3em;
      line-height: 1em;
      font-size: 0.75em;
      padding: 0.5em;
      color: var(--warning-color-dark, #b00d2f);
      background-color: var(--warning-color-light, #ffd5ce);
   }
</style>
