<!--
@component Color picker.

   Main properties:
   - `value` - the selected value (string, bindable), default - the first option.
   - `disable` - if `true` the picker does not react to any input, default: `false`.
-->
<script>
   import { getContext } from 'svelte';
   import { LabelIdKey } from './utils.js';
   let {
      value = $bindable('#000000'),   // initial selected value
      disable = false,               // if true the picker ignores any input
      onchange = null,               // callback when value changes
      ariaLabel = null,              // accessible name
   } = $props();

   /* a control which is not given an 'ariaLabel' of its own takes the label of the Container
      it sits in, when that container was given an 'id' */
   const containerLabel = getContext(LabelIdKey);
   const labelledBy = $derived(ariaLabel ? undefined : containerLabel?.());

   function handleInput() {
      if (onchange) onchange(value);
   }
</script>

<label class="color-picker" class:disabled={disable} style="background-color:{value}">
<input type="color" aria-label={ariaLabel} aria-labelledby={labelledBy} disabled={disable} bind:value={value} oninput={handleInput}>
</label>

<style>
   .color-picker {
      width: 3em;
      height: 1.25em;
      margin-right: 2px;
      background: black;
      border: 3px solid var(--bg-color-light, #f0f0f0);
      border-radius: 2px;
   }

   .color-picker.disabled {
      opacity: 0.4;
      cursor: default;
   }

   input[type="color" i] {
      width: 0;
      height: 0;
      appearance: none;
      border:none;
      background: transparent;
   }

</style>
