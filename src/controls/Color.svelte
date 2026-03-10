<!--
@component Color picker.

   Main properties:
   - `value` - the selected value (string, bindable), default - the first option.
-->
<script>
   let {
      value = $bindable('#000000'),   // initial selected value
      onchange = null,               // callback when value changes
   } = $props();

   function handleInput() {
      if (onchange) onchange(value);
   }
</script>

<label class="color-picker" style="background-color:{value}">
<input type="color" bind:value={value} oninput={handleInput}>
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

   input[type="color" i] {
      width: 0;
      height: 0;
      appearance: none;
      border:none;
      background: transparent;
   }

</style>
