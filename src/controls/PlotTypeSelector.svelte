<!--
@component Plot type selector with icons of plots.

   Main properties:
   - `options` - array with types to select from, default: `['p', 'l', 'b', 'h', 'qq']`.
   - `value` - the selected type (string), default: first option.
   - `disable` - if `true` the selector does not react to any input, default: `false`.

   The list of supported types:
   - `'p'` - scatter
   - `'l'` - line
   - `'b'` - both, line and scatter
   - `'h'` - bars
   - `'hm'` - heatmap
   - `'bp'` - boxplot
   - `'qq'` - qq-plot

   Types which are not in the list above are shown as an empty button.
-->
<script>
   let {
      options = ['p', 'l', 'b', 'h', 'qq'],    // list of types to show
      value = $bindable(options[0]),     // default plot type
      disable = false,                  // if true the selector ignores any input
      onchange = null,                  // callback when value changes
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

   const prefix = '<svg width="3em" height="1.5em" viewBox="0 0 32 20" fill="transparent" xmlns="http://www.w3.org/2000/svg">';
   const icons = {
      'bp': '<rect x="8" y="5" width="16" height="10" stroke-width="2"/><line x1="15" y1="14" x2="15" y2="4" stroke-width="2"/><line x1="30" y1="10" x2="25" y2="10" stroke-width="2"/><line x1="8" y1="10" x2="2" y2="10" stroke-width="2"/>',
      'hm': '<rect x="5" y="4" width="23" height="12"stroke-width="2"/><line x1="13" y1="16" x2="13" y2="3" stroke-width="2"/><line x1="21" y1="16" x2="21" y2="3" stroke-width="2"/><line x1="28" y1="10" x2="5" y2="10" stroke-width="2"/>',
      'l': '<path d="M4.23178 14.3598L15.5 5" stroke-width="2"/><line x1="14.4846" y1="5.17692" x2="26.4846" y2="10.1769" stroke-width="2"/>',
      'p': '<circle cx="6.5" cy="12.5" r="1" stroke-width="4"/><circle cx="15.2" cy="5.8" r="1" stroke-width="4"/><circle cx="25" cy="10" r="1" stroke-width="4"/>',
      'h': '<line x1="9" y1="15" x2="9" y2="9" stroke-width="6"/><line x1="17" y1="15" x2="17" y2="3" stroke-width="6"/><line x1="25" y1="15" x2="25" y2="7" stroke-width="6"/>',
      'qq': '<circle cx="6.5" cy="15.0" r="1" stroke-width="4"/><circle cx="15.2" cy="10" r="1" stroke-width="4"/><circle cx="25" cy="5.8" r="1" stroke-width="4"/>',
   };
   icons['b'] = icons['l'] + icons['p'];

   const titles = {
      'bp': 'boxplot',
      'hm': 'heatmap',
      'l': 'line',
      'p': 'scatter',
      'b': 'line + scatter',
      'h': 'bar',
      'qq': 'qq-plot',
   }

   /* look up icon and title only among own keys, so that an unknown option (or a key
      inherited from Object.prototype) can not inject anything into the markup */
   const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
   const iconFor = (o) => hasOwn(icons, o) ? icons[o] : '';
   const titleFor = (o) => hasOwn(titles, o) ? titles[o] : undefined;
</script>


<div
   onkeydown={changeOption}
   role="radiogroup"
   class="selector plot-selector"
   class:disabled={disable}
   tabindex={disable ? -1 : 0}
   aria-disabled={disable || undefined}
>
   {#each options as option (option)}
   <button type="button" tabindex="-1" disabled={disable} onclick={() => selectOption(option)} class="option" title={titleFor(option)} class:selected={option===value}>
   {@html prefix + iconFor(option) + '</svg>'}
   </button>
   {/each}
</div>


<style>

   .selector {
      position: relative;
      box-sizing: border-box;
      flex: 1 1 auto;
      font-size: 1em;
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
      padding: 0;
      margin: 0 0.2em 0 0;
      border: 1px solid transparent;
      border-radius: 0.3em;
      font-size: 0.85em;
      height: auto;
      display: flex;
      justify-content: center;
      color: var(--text-color-dark, #606570);
      background-color: var(--bg-color-light, #f0f0f0);
   }

   .option :global(svg) {
      stroke: var(--main-color1, #606570);
   }

   .option.selected {
      background-color: var(--main-color1, #6eb8ff);
      color: var(--text-color-light, #fefefe);
   }

   .option.selected :global(svg) {
      stroke: var(--text-color-light, #fefefe);
   }

   .option:not(.selected):hover:not(:disabled) {
      border: 1px solid var(--main-color1, #6eb8ff);
      background-color: var(--main-color1-light, #6eb8ff20);
      color: var(--main-color2, #4777a4);
   }

   .option:not(.selected):hover:not(:disabled) :global(svg) {
      stroke: var(--main-color2, #4777a4);
   }

   .selector.disabled {
      opacity: 0.4;
   }
</style>
