<!--
@component Selector as a set of buttons.

   Main properties:
   - `options` - array with options (strings).
   - `value` - the selected value (string, bindable), default - the first option.
   - `className` - additional class name for building customized selects.
-->
<script>
   let {
      options,                         // array with all options
      value = $bindable(options[0]),   // initial selected value
      className = '',                  // extra class name
      onchange = null,                 // callback when value changes
   } = $props();

   function selectOption(option) {
      value = option;
      if (onchange) onchange(value);
   }

   /**
    * Handler of event when changes are made by pressing left and right arrows
    * @param e
    */
   const changeOption = (e) => {
      if (e.key === 'ArrowLeft') {
         const ind = options.findIndex(v => v === value);
         if (ind > 0) {
            selectOption(options[ind - 1]);
         }
         return
      }

      if (e.key === 'ArrowRight') {
         const ind = options.findIndex(v => v === value);
         if (ind < options.length - 1) {
            selectOption(options[ind + 1]);
         }
         return
      }
   }

</script>

<div onkeydown={changeOption} role="radiogroup" tabindex="0" class="selector {className}">
   {#each options as option (option)}
   <button tabindex="-1" onclick={() => selectOption(option)} class="option option_{option.toString().replaceAll('.', '_')}" class:selected={option===value}>
   {@html option}
   </button>
   {/each}
</div>

<style>
   .selector {
      position: relative;
      box-sizing: border-box;
      flex: 1 1 auto;
      font-size: 1em;
      line-height: 1.5em;
      margin: 0;
      padding: 0;
      width: auto;
      border-radius: 2px;
      user-select: none;
      display: flex;
   }

   .selector:focus-visible {
      outline: 2px solid;
      outline-offset: 2px;
      outline-color: var(--outline-color, #ccc);
   }

   .option {
      cursor: default;
      padding: 0.25em 0.5em;
      margin: 0 0.3em 0 0;
      border: 1px solid transparent;
      border-radius: 0.3em;
      font-size: 0.85em;
      color: var(--text-color-dark, #606570);
      background-color: var(--bg-color-light, #f0f0f0);
   }

   .option.selected {
      background-color: var(--main-color1, #6eb8ff);
      color: var(--text-color-light, #fefefe);
   }

   .option:not(.selected):hover {
      border: 1px solid var(--main-color1, #6eb8ff);
      background-color: var(--main-color1-light, #6eb8ff20);
      color: var(--main-color2, #4777a4);
   }
</style>
