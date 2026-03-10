<!--
@component Discrete range slider - like Range but with discrete value.

   Main properties:
   - `min` - the smallest (left) value, default: `0`.
   - `max` - the largest (right) value, default: `10`.
   - `value` - currently selected value (bindable), default: `min`.
   - `step` - increment between the values, by default `1`.

   The min, max and step values must be whole numbers.
-->
<script>
   let {
      min = 0,                                      // smallest value of the range
      max = 10,                                     // largest value of the range
      value = $bindable(min),                       // selected value
      step = 1,                                     // increment/decrement step
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
   });

   let sliderContainer;
   let isDragging = $state(false);

   const left = $derived(min === max ? 0 : (value - min) / (max - min + step) );
   const width = $derived(step / (max - min + step));

   // if number of values smaller than 100 show stripes otherwise fill with solid color
   const styleStr = $derived(max < 100 ? `background: repeating-linear-gradient(to right, var(--bg-color-light, #f4f4f4), var(--bg-color-light, #f4f4f4), var(--bg-color-light, #f4f4f4) ${width * 100}%, var(--bg-color-light2, #e8e8e8) ${width * 100}%, var(--bg-color-light2, #e8e8e8) ${200 * width}%)` : `background: var(--bg-color-light, #f0f0f0)`);

   const computeValue = (p) => {
      if (p < 0 || p > 1) return value;
      let newValue = value;
      if (p < left && left > 0) newValue = value - step * Math.ceil((left - p) / width);
      if (p > (left + width) && (left + width) < 1) newValue = value + step * Math.ceil((p - (left + width)) / width);
      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;
      return newValue;
   }

   /**
    * Returns relative position of the element 'e' inside the slider
    * @param e
    */
   const getRelativePosition = (e) => {
      const parentRect = sliderContainer.getBoundingClientRect();
      const minX = parentRect.x;
      const maxX = parentRect.x + parentRect.width;
      return (e.clientX - minX) / (maxX - minX);
   }

   /**
    * Handler of changing start event
    * @param e
    */
   const startChanging = (e) => {
      const p = getRelativePosition(e);
      if (p < 0 || p > 1) return;
      isDragging = p > left && p < width + left;
   }

   /**
    * Handler of changing cancel event
    * @param e
    */
   const cancelChanging = (e) => {
      isDragging = false;
   }

   /**
    * Handler of changing stop event
    * @param e
    */
   const stopChanging = (e) => {
      isDragging = false;
      const p = getRelativePosition(e);
      if (p < 0 || p > 1) return;
      const newValue = computeValue(p);
      if (value === newValue) return;
      setValue(newValue);
   }

   /**
    * Handler of event when changes are made by mouse wheel
    * @param e
    */
   const changingByWheel = (e) => {
      let newValue = value + Math.round(e.deltaY * 0.5) * step;
      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;

      setValue(newValue);
      e.preventDefault();
   }

   /**
    * Handler of event when changes are made by dragging an element
    * @param e
    */
   const changing = (e) => {
      if (!isDragging) return;
      const p = getRelativePosition(e);
      if (p < 0 || p > 1) return;
      const newValue = computeValue(p);
      if (newValue === value) return;
      setValue(newValue);
   }

   /**
    * Handler of event when changes are made by pressing left and right arrows
    * @param e
    */
   const changingByKeys = (e) => {
      if (e.key === 'ArrowLeft') {
         setValue(value - step < min ? min : value - step);
         return
      }

      if (e.key === 'ArrowRight') {
         setValue(value + step > max ? max : value + step);
         return
      }
   }

</script>

<div
   role="slider"
   class="range-slider-container range-slider-container_discrete"
   tabindex="0"
   aria-valuenow={value}
   aria-valuemin={min}
   aria-valuemax={max}
   bind:this={sliderContainer}
   onkeydown={changingByKeys}
   onwheel={changingByWheel}

   onmousemove={changing}
   onmousedown={startChanging}
   onmouseleave={cancelChanging}
   onmouseup={stopChanging}

   ontouchmove={changing}
   ontouchstart={startChanging}
   ontouchcancel={cancelChanging}
   ontouchend={stopChanging}

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
      >{value.toFixed(0)}</span>
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
   }


   .range-slider-container:focus-visible {
      outline: solid 2px var(--outline-color, #ccc);
      outline-offset: 2px;
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
