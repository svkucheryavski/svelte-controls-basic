<!--
@component Range slider.

   Main properties:
   - `min` - the smallest (left) value, default: `0`.
   - `max` - the largest (right) value, default: `100`.
   - `value` - currently selected value (bindable), default: `min`.
   - `decNum` - number of decimals to show the current value with, default: `1`.
   - `step` - increment between the values, by default 1% between `min` and `max`.
-->
<script>

   let {
      min = 0,                                   // smallest value of the range
      max = 100,                                 // largest value of the range
      value = $bindable(min),                    // selected value
      decNum = 1,                                // number of decimals to show the current value
      step = +((max - min) / 100).toFixed(4),    // increment/decrement step
      onchange = null
   } = $props();

   function setValue(newValue) {
      value = newValue;
      if (onchange) onchange(value);
   }

   // reactively correct values and wrong limits
   $effect(() => {
      if (value < min) setValue(min);
      if (value > max) setValue(max);
      if (min > max) min = max;
   })

   let sliderElement;
   let sliderContainer;
   let isDragging = $state(false);

   const computeValue = (p) => {
      const tmpValue = min + p * (max - min);

      // strange construction below is needed for:
      // a. make a value fractionated according to step
      // b. get rid of small decimals added by JS due to loss of precision
      return(+(Math.round(tmpValue / step) * step).toFixed(4));
   }

   /**
    * Returns relative position of the element 'e' inside the slider
    * @param e
    */
   const getRelativePosition = (e) => {
      const sliderRect = sliderElement.getBoundingClientRect();
      const parentRect = sliderContainer.getBoundingClientRect();
      const minX = sliderRect.x;
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
      isDragging = p * 100 > width - 5 && p * 100 < width + 5;
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
      setValue(computeValue(p));
   }

   /**
    * Handler of event when changes are made by mouse wheel
    * @param e
    */
   const changingByWheel = (e) => {
      let newValue = value + step * e.deltaY * 0.5;
      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;

      setValue(+(Math.round(newValue / step) * step).toFixed(4));
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
      setValue(computeValue(p));
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

   const width = $derived(min === max ? 100 : (value - min) / (max - min) * 100);
</script>

<div
   role="slider"
   class="range-slider-container"
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
>

   <div class="range-slider" class:range-slider_right={width < 50} style="width:{width}%" bind:this={sliderElement}>
   <span
      class="range-value"
      class:range-value_right={width < 50}
   >{value.toFixed(decNum)}</span>
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
   }

   .range-slider-container:focus-visible {
      outline: solid 2px var(--outline-color, #ccc);
      outline-offset: 2px;
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
      border-right-color: var(--main-color2, #528abe);
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
