<!--
@component Switch between two options, a simplified selector with logical value.

   Main properties:
   - `options` - array with two options (strings), first for `false`, second for `true`.
   - `value` - the selected value, default: `false`.
-->
<script>
   import Select from './Select.svelte';

   let {
      options = ["no", "yes"],         // array with all options
      value = $bindable(false),        // initial selected value
      onchange = null,                 // callback when value changes
   } = $props();

   let selectValue = $state(value ? options[1] : options[0]);

   const cleanOptions = $derived.by(() => {
      if (options.length !== 2) {
         console.error('Switch: parameter "options" must have two values.');
         return null;
      }

      return options;
   });

   // sync parent's value → selectValue
   $effect(() => selectValue = value ? options[1] : options[0]);

   // sync user selection → value (via Select's onchange, avoiding circular $effect)
   function handleSelect(selected) {
      value = selected === options[1];
      if (onchange) onchange(value);
   }
</script>

{#if cleanOptions}
<Select options={cleanOptions} bind:value={selectValue} onchange={handleSelect} />
{/if}