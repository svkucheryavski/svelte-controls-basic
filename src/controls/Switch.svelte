<!--
@component Switch between two options, a simplified selector with logical value.

   Main properties:
   - `options` - array with two options (strings), first for `false`, second for `true`.
   - `value` - the selected value, default: `false`.
   - `disable` - if `true` the switch does not react to any input, default: `false`.
   - `html` - if `true` the two options are rendered as HTML, default: `false`.

   As in `Select`, the options are shown as plain text. Set `html={true}` only for options
   which are yours - an option which comes from a user, a URL or a server can bring any
   markup into the page.
-->
<script>
   import Select from './Select.svelte';

   let {
      options = ["no", "yes"],         // array with all options
      value = $bindable(false),        // initial selected value
      disable = false,                 // if true the switch ignores any input
      html = false,                    // if true the options are rendered as HTML
      onchange = null,                 // callback when value changes
      ariaLabel = null,                // accessible name
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
      const newValue = selected === options[1];
      if (Object.is(newValue, value)) return;
      value = newValue;
      if (onchange) onchange(value);
   }
</script>

{#if cleanOptions}
<!-- the Select finds a Container's label by itself, only an explicit name has to be
     handed down -->
<Select options={cleanOptions} bind:value={selectValue} {disable} {html} {ariaLabel} onchange={handleSelect} />
{/if}