<!--
@component Selector as a set of buttons.

   Main properties:
   - `options` - array with options (strings).
   - `value` - the selected value (string, bindable), default - the first option.
   - `className` - additional class name for building customized selects.
   - `disable` - if `true` the selector does not react to any input, default: `false`.
   - `html` - if `true` the options are rendered as HTML, default: `false`.

   Options are shown as plain text. Set `html={true}` when they need to carry markup, e.g.
   `'m<sup>2</sup>'` - but only for options which are yours. An option which comes from a
   user, a URL or a server can bring any markup into the page, so it must not be rendered
   this way.
-->
<script>
   import { getContext } from 'svelte';
   import { LabelIdKey } from './utils.js';
   let {
      options,                         // array with all options
      value = $bindable(options[0]),   // initial selected value
      className = '',                  // extra class name
      disable = false,                 // if true the selector ignores any input
      html = false,                    // if true the options are rendered as HTML
      onchange = null,                 // callback when value changes
      ariaLabel = null,                // accessible name
   } = $props();

   /* a control which is not given an 'ariaLabel' of its own takes the label of the Container
      it sits in, when that container was given an 'id' */
   const containerLabel = getContext(LabelIdKey);
   const labelledBy = $derived(ariaLabel ? undefined : containerLabel?.());

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
   aria-label={ariaLabel}
   aria-labelledby={labelledBy}
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
