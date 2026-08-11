<!--
@component Selector as a set of buttons.

   Main properties:
   - `options` - array with options (strings).
   - `value` - the selected value (string, bindable), default - the first option.
   - `className` - additional class name for building customized selects.
   - `disable` - if `true` the selector does not react to any input, default: `false`.
   - `html` - if `true` the options are rendered as HTML, default: `true`.

   The options are rendered as HTML, so that they can contain markup, e.g. `'m<sup>2</sup>'`.
   Set `html={false}` when the options do not come from you but from a user, a URL or a
   server - otherwise they can bring any markup into the page.
-->
<script>
   let {
      options,                         // array with all options
      value = $bindable(options[0]),   // initial selected value
      className = '',                  // extra class name
      disable = false,                 // if true the selector ignores any input
      html = true,                     // if true the options are rendered as HTML
      onchange = null,                 // callback when value changes
   } = $props();

   function selectOption(option) {
      if (Object.is(option, value)) return;
      value = option;
      if (onchange) onchange(value);
   }

   /**
    * Handler of event when changes are made by pressing left and right arrows
    * @param e
    */
   const changeOption = (e) => {
      if (disable) return;
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

<div
   onkeydown={changeOption}
   role="radiogroup"
   class="selector {className}"
   class:disabled={disable}
   tabindex={disable ? -1 : 0}
   aria-disabled={disable || undefined}
>
   {#each options as option (option)}
   <!-- 'aria-checked' and not the class alone: a class paints the button, it does not tell a
        screen reader which option is the chosen one -->
   <button type="button" role="radio" aria-checked={option === value} tabindex="-1" disabled={disable} onclick={() => selectOption(option)} class="option option_{option.toString().replaceAll('.', '_')}" class:selected={option===value}>
   {#if html}{@html option}{:else}{option}{/if}
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
      outline-color: var(--outline-color, #767676);
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
      background-color: var(--main-color1, #2a75b8);
      color: var(--text-color-light, #fafafa);
   }

   .option:not(.selected):hover:not(:disabled) {
      border: 1px solid var(--main-color1, #2a75b8);
      background-color: var(--main-color1-light, #2a75b820);
      color: var(--main-color2, #1a4972);
   }

   .selector.disabled {
      opacity: 0.4;
   }
</style>
