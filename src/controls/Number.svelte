<!--
@component Number selector.

   Main properties:
   - `min` - the smallest value, default: `0`.
   - `max` - the largest value, default: `100`.
   - `value` - currently selected value (bindable), default: `min`.
   - `decNum` - number of decimals to show the current value with, default: `1`.
   - `step` - increment between the values, by default `10^(-decNum)` (or `1` when `decNum` is `0`).
   - `disable` - if `true` the selector does not react to any input, default: `false`.
   - `ariaLabel` - accessible name for the selector, default: `null`.

   **Description**

   The value is changed by the two small buttons or by the keyboard (arrows, `Home` and `End`).
   Every value the selector produces is snapped to the grid `min + k * step`, so repeated steps
   do not accumulate rounding errors. A value which comes from the parent is only brought into
   the `[min, max]` range and is otherwise left as it is.
-->
<script>
   import { clamp, snapToStep, toFiniteNumber } from './utils.js';

   let {
      min: minProp = 0,                          // smallest value of the range
      max: maxProp = 100,                        // largest value of the range
      value = $bindable(),                       // selected value
      decNum: decNumProp = 1,                    // number of decimals to show the current value
      step: stepProp = undefined,                // increment/decrement step
      disable = false,                           // if true the selector ignores any input
      ariaLabel = null,                          // accessible name
      onchange = null,                           // callback when value changes
   } = $props();

   /* the settings are derived and not used as they come, so the selector stays usable when a
      parent sends something odd. Declaration order matters: on the server side the deriveds
      are evaluated eagerly, in the order they are written */
   const min = $derived(toFiniteNumber(minProp, 0));
   const max = $derived(Math.max(min, toFiniteNumber(maxProp, 100)));
   const decNum = $derived(Math.max(0, Math.min(20, Math.trunc(toFiniteNumber(decNumProp, 1)))));

   /* the step must be derived and not a default of $props() - the defaults are computed once,
      so a step taken from 'decNum' would never follow a later change of it */
   const defaultStep = $derived(decNum === 0 ? 1 : Math.pow(10, -decNum));
   const step = $derived.by(() => {
      if (stepProp === undefined) return defaultStep;
      const s = Math.abs(toFiniteNumber(stepProp, defaultStep));
      return s > 0 ? s : defaultStep;
   });

   /* value to show and to report to assistive technology. It is derived and not taken from
      'value' directly, so the selector is also correct when rendered on the server, where the
      correcting effect below does not run */
   const shown = $derived(clamp(toFiniteNumber(value, min), min, max));

   function setValue(newValue) {
      if (Object.is(newValue, value)) return;
      value = newValue;
      if (onchange) onchange(value);
   }

   /* bring a missing, non-numeric or out of range value back into the range. This fires
      'onchange' on purpose, so that a parent learns about the correction */
   $effect(() => {
      if (!Object.is(shown, value)) setValue(shown);
   });

   function increase() {
      if (disable) return;
      setValue(snapToStep(shown + step, min, max, step));
   }

   function decrease() {
      if (disable) return;
      setValue(snapToStep(shown - step, min, max, step));
   }

   /**
    * Handler of event when changes are made by pressing arrows, 'Home' or 'End'
    * @param e
    */
   function changingByKeys(e) {
      if (disable) return;

      let newValue;
      if (e.key === 'ArrowDown') newValue = shown - step;
      else if (e.key === 'ArrowUp') newValue = shown + step;
      else if (e.key === 'Home') newValue = min;
      else if (e.key === 'End') newValue = max;
      else return;

      e.preventDefault();
      setValue(snapToStep(newValue, min, max, step));
   }

</script>

<div
   role="spinbutton"
   class="number-container"
   class:disabled={disable}
   tabindex={disable ? -1 : 0}
   aria-label={ariaLabel}
   aria-valuenow={shown}
   aria-valuemin={min}
   aria-valuemax={max}
   aria-valuetext={shown.toFixed(decNum)}
   aria-disabled={disable || undefined}
   onkeydown={changingByKeys}
>

   <span class="value">{shown.toFixed(decNum)}</span>
   <button type="button" aria-label="increase" tabindex="-1" disabled={disable} onclick={increase} class="button-small button-up">
      <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,13 7,2 15,13, 0,13" />
      </svg>
   </button>
   <button type="button" aria-label="decrease"  tabindex="-1" disabled={disable} onclick={decrease} class="button-small button-down">
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

   .number-container.disabled {
      opacity: 0.4;
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

   .button-small:hover:not(:disabled) > svg > :global(polygon) {
      fill: var(--main-color1, #6eb8ff);
   }


   .button-up {
      grid-area: up;
   }

   .button-down {
      grid-area: down;
   }

</style>
