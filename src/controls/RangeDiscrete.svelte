<!--
@component Discrete range slider - like Range but with discrete value.

   Main properties:
   - `min` - the smallest (left) value, default: `0`.
   - `max` - the largest (right) value, default: `10`.
   - `value` - currently selected value (bindable), default: `min`.
   - `step` - increment between the values, by default `1`.
   - `disable` - if `true` the slider does not react to any input, default: `false`.
   - `ariaLabel` - accessible name for the slider, default: `null`.

   The min, max and step values must be whole numbers. The step is rounded to the nearest
   whole number not smaller than 1. Values which do not belong to the grid `min + k * step`
   are moved to the closest value which does.
-->
<script>
   import { clamp, snapToStep, toFiniteNumber } from './utils.js';

   let {
      min: minProp = 0,                          // smallest value of the range
      max: maxProp = 10,                         // largest value of the range
      value = $bindable(),                       // selected value
      step: stepProp = 1,                        // increment/decrement step
      disable = false,                           // if true the slider ignores any input
      ariaLabel = null,                          // accessible name
      onchange = null                            // callback when value changes
   } = $props();

   /* see the comment in Range.svelte - the declaration order of the deriveds matters */
   const min = $derived(toFiniteNumber(minProp, 0));
   const max = $derived(Math.max(min, toFiniteNumber(maxProp, 10)));
   const step = $derived(Math.max(1, Math.round(Math.abs(toFiniteNumber(stepProp, 1)))));

   /* value to draw and to report, always on the grid and inside the range */
   const shown = $derived(snapToStep(toFiniteNumber(value, min), min, max, step));

   const left = $derived(max === min ? 0 : (shown - min) / (max - min + step));
   const width = $derived(step / (max - min + step));

   // if number of values smaller than 100 show stripes otherwise fill with solid color
   const styleStr = $derived(max < 100 ? `background: repeating-linear-gradient(to right, var(--bg-color-light, #f0f0f0), var(--bg-color-light, #f0f0f0), var(--bg-color-light, #f0f0f0) ${width * 100}%, var(--bg-color-medium, #e0e0e0) ${width * 100}%, var(--bg-color-medium, #e0e0e0) ${200 * width}%)` : `background: var(--bg-color-light, #f0f0f0)`);

   function setValue(newValue) {
      if (Object.is(newValue, value)) return;
      value = newValue;
      if (onchange) onchange(value);
   }

   /* bring a missing, non-numeric, out of range or off grid value back onto the grid */
   $effect(() => {
      if (!Object.is(shown, value)) setValue(shown);
   });

   let sliderContainer;
   let isDragging = $state(false);

   /**
    * Returns position of the event 'e' relative to the width of the slider, or NaN if it
    * can not be determined
    * @param e
    */
   const getRelativePosition = (e) => {
      const rect = sliderContainer.getBoundingClientRect();
      if (rect.width === 0) return NaN;
      return (e.clientX - rect.x) / rect.width;
   }

   /**
    * Returns value whose slot on the track contains the relative position 'p'
    * @param p
    */
   const computeValue = (p) => {
      const slot = Math.floor(p * (max - min + step) / step);
      return snapToStep(min + slot * step, min, max, step);
   }

   /**
    * Handler of changing start event
    * @param e
    */
   const startChanging = (e) => {
      if (disable) return;
      const p = getRelativePosition(e);
      if (!Number.isFinite(p) || p < 0 || p > 1) return;

      // dragging starts only on the handle itself
      isDragging = p > left && p < left + width;
      if (isDragging) e.currentTarget.setPointerCapture?.(e.pointerId);
   }

   /**
    * Handler of changing cancel event
    */
   const cancelChanging = () => {
      isDragging = false;
   }

   /**
    * Handler of changing stop event
    * @param e
    */
   const stopChanging = (e) => {
      if (disable) return;
      if (isDragging) e.currentTarget.releasePointerCapture?.(e.pointerId);
      isDragging = false;

      const p = getRelativePosition(e);
      if (!Number.isFinite(p) || p < 0 || p > 1) return;
      setValue(computeValue(p));
   }

   /**
    * Handler of event when changes are made by dragging an element
    * @param e
    */
   const changing = (e) => {
      if (disable || !isDragging) return;
      const p = getRelativePosition(e);
      if (!Number.isFinite(p)) return;
      setValue(computeValue(clamp(p, 0, 1)));
   }

   /**
    * Handler of event when changes are made by mouse wheel
    * @param e
    */
   const changingByWheel = (e) => {
      if (disable) return;
      setValue(snapToStep(shown + Math.round(e.deltaY * 0.5) * step, min, max, step));
      e.preventDefault();
   }

   /**
    * Handler of event when changes are made by pressing arrows, 'Home' or 'End'
    * @param e
    */
   const changingByKeys = (e) => {
      if (disable) return;

      let newValue;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') newValue = shown - step;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') newValue = shown + step;
      else if (e.key === 'Home') newValue = min;
      else if (e.key === 'End') newValue = max;
      else return;

      e.preventDefault();
      setValue(snapToStep(newValue, min, max, step));
   }

</script>

<div
   role="slider"
   class="range-slider-container range-slider-container_discrete"
   class:disabled={disable}
   tabindex={disable ? -1 : 0}
   aria-label={ariaLabel}
   aria-valuenow={shown}
   aria-valuemin={min}
   aria-valuemax={max}
   aria-disabled={disable || undefined}
   bind:this={sliderContainer}
   onkeydown={changingByKeys}
   onwheel={changingByWheel}

   onpointerdown={startChanging}
   onpointermove={changing}
   onpointerup={stopChanging}
   onpointercancel={cancelChanging}

   style={styleStr}
>

   <div class="range-slider"
      class:range-slider_left={width < 0.10 && left < 0.5}
      class:range-slider_right={width < 0.10 && left >= 0.5}
      style="width: max(2px, {width * 100}%);left:{left * 100}%;"
   >
      <span
         class="range-value"
         class:range-value_right={width < 0.10 && left > 0.5}
         class:range-value_left={width < 0.10 && left <= 0.5}
      >{shown.toFixed(0)}</span>
   </div>
</div>


<style>
   .range-slider-container {
      position: relative;
      box-sizing: border-box;
      flex: 1 1 auto;
      height: 1.5em;
      margin: 0;
      padding: 0;
      width: auto;
      border-radius: 2px;
      cursor: default;
      display: flex;
      align-items: center;
      user-select: none;

      /* horizontal gestures belong to the slider, vertical panning and zooming stay
         with the browser */
      touch-action: pan-y pinch-zoom;
   }


   .range-slider-container:focus-visible {
      outline: solid 2px var(--outline-color, #767676);
      outline-offset: 2px;
   }

   .range-slider-container.disabled {
      opacity: 0.4;
   }

   .range-slider {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      border-radius: 2px;
      text-align: center;
      margin: 0;
      padding: 0;
      height: 100%;
      cursor: default;
      user-select: none;
      color: var(--text-color-light, #fafafa);
      background-color: var(--main-color1, #6eb8ff);
   }

   .range-slider_left {
      justify-content: flex-start;
   }

   .range-slider_right {
      justify-content: flex-end;
   }

   .range-value {
      display: inline-block;
      margin: 0;
      padding: 0;
      cursor: default;
      font-size: 0.85em;
      user-select: none;
      color: var(--text-color-light, #fafafa);
   }

   .range-value_left {
      position: relative;
      left: calc(100% + 0.25em);
      color: var(--text-color-dark, #606570);
   }

   .range-value_right {
      position: relative;
      right: calc(100% + 0.25em);
      color: var(--text-color-dark, #606570);
   }
</style>
