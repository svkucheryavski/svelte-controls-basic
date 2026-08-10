<!--
@component Range slider.

   Main properties:
   - `min` - the smallest (left) value, default: `0`.
   - `max` - the largest (right) value, default: `100`.
   - `value` - currently selected value (bindable), default: `min`.
   - `decNum` - number of decimals to show the current value with, default: `1`.
   - `step` - increment between the values, by default 1% between `min` and `max`.
   - `disable` - if `true` the slider does not react to any input, default: `false`.
   - `ariaLabel` - accessible name for the slider, default: `null`.

   **Description**

   The slider can be changed by dragging its right edge, by clicking anywhere inside it, by
   the mouse wheel and by the keyboard (arrows, `Home` and `End`). All values are snapped to
   the grid `min + k * step`, so both `min` and `max` are always reachable.
-->
<script>
   import { clamp, snapToStep, toFiniteNumber } from './utils.js';

   let {
      min: minProp = 0,                          // smallest value of the range
      max: maxProp = 100,                        // largest value of the range
      value = $bindable(),                       // selected value
      decNum: decNumProp = 1,                    // number of decimals to show the current value
      step: stepProp = undefined,                // increment/decrement step
      disable = false,                           // if true the slider ignores any input
      ariaLabel = null,                          // accessible name
      onchange = null                            // callback when value changes
   } = $props();

   /* the limits are derived and not used as they come, so that a slider stays usable when a
      parent sends something odd. Declaration order matters: on the server side the deriveds
      are evaluated eagerly, in the order they are written */
   const min = $derived(toFiniteNumber(minProp, 0));
   const max = $derived(Math.max(min, toFiniteNumber(maxProp, 100)));
   const step = $derived(
      stepProp === undefined
         ? (max - min) / 100
         : Math.abs(toFiniteNumber(stepProp, (max - min) / 100))
   );
   const decNum = $derived(Math.max(0, Math.min(20, Math.trunc(toFiniteNumber(decNumProp, 1)))));

   /* value to draw and to report to assistive technology. It is derived and not taken from
      'value' directly, so the slider is also correct when rendered on the server, where the
      correcting effect below does not run */
   const shown = $derived(clamp(toFiniteNumber(value, min), min, max));
   const width = $derived(max === min ? 100 : (shown - min) / (max - min) * 100);

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
    * Returns value corresponding to the relative position 'p'
    * @param p
    */
   const computeValue = (p) => snapToStep(min + p * (max - min), min, max, step);

   /**
    * Handler of changing start event
    * @param e
    */
   const startChanging = (e) => {
      if (disable) return;
      const p = getRelativePosition(e);
      if (!Number.isFinite(p) || p < 0 || p > 1) return;

      // dragging starts only near the right edge of the slider, a click anywhere else
      // sets the value when the pointer is released
      isDragging = Math.abs(p * 100 - width) < 5;
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
      setValue(snapToStep(shown + step * e.deltaY * 0.5, min, max, step));
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
   class="range-slider-container"
   class:disabled={disable}
   tabindex={disable ? -1 : 0}
   aria-label={ariaLabel}
   aria-valuenow={shown}
   aria-valuemin={min}
   aria-valuemax={max}
   aria-valuetext={shown.toFixed(decNum)}
   aria-disabled={disable || undefined}
   bind:this={sliderContainer}
   onkeydown={changingByKeys}
   onwheel={changingByWheel}

   onpointerdown={startChanging}
   onpointermove={changing}
   onpointerup={stopChanging}
   onpointercancel={cancelChanging}
>

   <div class="range-slider" class:range-slider_right={width < 50} style="width:{width}%" >
   <span
      class="range-value"
      class:range-value_right={width < 50}
   >{shown.toFixed(decNum)}</span>
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
      background: var(--bg-color-light, #f0f0f0);

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
      justify-content: flex-end;
      align-items: center;
      box-sizing: border-box;
      border-radius: 2px;
      border-right: solid 5px;
      text-align: right;
      margin: 0;
      padding: 0;
      height: 100%;
      cursor: default;
      user-select: none;
      color: var(--text-color-light, #fafafa);
      background-color: var(--main-color1, #6eb8ff);
      /* the edge marks the grip and has to stay apart from the bar it sits on. It follows
         '--main-color2' unless '--slider-edge-color' is set, so a theme whose secondary
         colour is close to the primary one can darken just this edge and leave the hover
         text, which also reads '--main-color2', where it is */
      border-right-color: var(--slider-edge-color, var(--main-color2, #4777a4));
   }

   .range-slider_right {
      justify-content: flex-start;
   }

   .range-value {
      display: inline-block;
      margin: 0;
      padding: 0;
      cursor: default;
      font-size: 0.85em;
      position: relative;
      user-select: none;
      right: 0.25em;
      color: var(--text-color-light, #fafafa);
   }

   .range-value_right {
      left: calc(100% + 5px + 0.25em);
      color: var(--text-color-dark, #606570);
   }


</style>
