<!--
@component Number selector.

   Main properties:
   - `min` - the smallest (left) value, default: `0`.
   - `max` - the largest (right) value, default: `100`.
   - `value` - currently selected value (bindable), default: `min`.
   - `decNum` - number of decimals to show the current value with, default: `1`.
   - `step` - increment between the values, by default `10^(-decNum)` (or `1` when `decNum` is `0`).
-->
<script>
   let {
      min = 0,                                       // smallest value of the range
      max = 100,                                       // largest value of the range
      value = $bindable(min),                       // selected value
      decNum = 1,                                // number of decimals to show the current value
      step = decNum === 0 ? 1 : Math.pow(10, -decNum),    // increment/decrement step
      onchange = null,                              // callback when value changes
   } = $props();

   function setValue(newValue) {
      value = newValue;
      if (onchange) onchange(value);
   }

   $effect(() => {
      if (value < min) setValue(min);
      if (value > max) setValue(max);
      if (min > max) min = max;
   })


   function increase() {
      setValue(value + step > max ? max : value + step);
   }

   function decrease() {
      setValue(value - step < min ? min : value - step);
   }

   /**
    * Handler of event when changes are made by pressing left and right arrows
    * @param e
    */
   function changingByKeys(e) {
      if (e.key === 'ArrowDown') decrease();
      if (e.key === 'ArrowUp') increase();
   }

</script>

<div
   role="slider"
   class="number-container"
   tabindex="0"
   aria-valuenow={value}
   aria-valuemin={min}
   aria-valuemax={max}
   onkeydown={changingByKeys}
>

   <span class="value">{value.toFixed(decNum)}</span>
   <button aria-label="increase" tabindex="-1" onclick={increase} class="button-small button-up">
      <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,13 7,2 15,13, 0,13" />
      </svg>
   </button>
   <button aria-label="decrease"  tabindex="-1" onclick={decrease} class="button-small button-down">
      <svg width="100%" height="100%" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,2 7,13 15,2, 0,2" />
      </svg>
   </button>
</div>


<style>
   .number-container {
      box-sizing: border-box;
      flex: 0 1 auto;
      width: auto;
      height: 1.5em;
      margin: 0;
      padding: 0;
      border-radius: 2px;
      background-color: var(--bg-color-light, #f0f0f0);

      cursor: default;
      user-select: none;
      margin-right: 5px;

      display: grid;
      grid-template-areas:
         "value up"
         "value down";
      grid-template-columns: 1fr 1em;
      grid-template-rows: 1fr 1fr;
      justify-items: center;
      align-items: center;
   }

   .number-container:focus-visible {
      outline: solid 2px;
      outline-offset: 2px;
      outline-color: var(--outline-color, #ccc);
   }

   .value {
      grid-area: value;
      box-sizing: border-box;
      height: 100%;
      display: block;
      padding: 0.1em 0.1em 0.1em 0.3em;
      text-align: right;
      color: var(--text-color-dark, #606570);
   }

   .button-small {
      padding: 0;
      margin: 0;
      border: none;
      background: none;
      outline: none;
      width: 0.6em;
      height: 0.6em;
      box-sizing: border-box;
      font-size: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
   }

   .button-small > svg {
      font-size: inherit;
      width: 0.6em;
      height: 0.6em;
   }

   .button-small > svg > :global(polygon) {
      fill: var(--main-color2, #4777a4);
   }

   .button-small:hover > svg > :global(polygon) {
      fill: var(--main-color1, #6eb8ff);
   }


   .button-up {
      grid-area: up;
   }

   .button-down {
      grid-area: down;
   }

</style>
