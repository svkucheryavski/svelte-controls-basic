<!--
@component Text input.

   Main properties:
   - `value` - the entered value, bindable, default: `''`.
   - `placeholder` - text for place holder, default: `''`.
   - `maxLength` - maximum number of symbols that can be entered, default: `25`.
   - `validator` - function to validate the input value (should return error message or empty string)
-->
<script>
   let {
      value = $bindable(''),        // initial selected value
      className = '',               // extra class name
      placeholder = '',             // placeholder (hint)
      maxLength = 25,               // maximum number of characters
      validator = null,             // validator callback, returns error message if value is not valid (empty if it is).
      onchange = null,              // callback when value changes
   } = $props();

   let error = $state('')

   function handleInput() {
      if (validator) error = validator(value);
      if (onchange) onchange(value);
   }
</script>

<div class="textinput {className}" class:error={error && error.length > 0}>
<input type="text" {placeholder} maxlength={maxLength} bind:value={value} oninput={handleInput}>
{#if error && error.length > 0}<div class="error-message">{error}</div>{/if}
</div>

<style>

   .textinput {
      box-sizing: border-box;
      flex: 1 1 auto;
      /* height: 1.5em; */
      font-size: 1em;
      line-height: 1.5em;
      margin: 0;
      padding: 0.15em 0;
      width: auto;
      border-radius: 2px;
      user-select: none;
      display: flex;
      position: relative;
   }

   .textinput > input {
      flex: 1 1 auto;
      font-size: 0.9em;
      width: 100%;
      cursor: default;
      padding: 0.25em 0.5em;
      border: 1px solid;
      border-radius: 0.3em;
      outline: none;
      background-color: var(--main-color1, #6eb8ff);
      color: var(--text-color-light, #fefefe);
   }

   .textinput > input:placeholder-shown {
      color: var(--text-color-dark, #a0a0a0);
      background-color: var(--bg-color-light, #f0f0f0);
      border-color: var(--bg-color-light, #f0f0f0);
   }

   .textinput > input::placeholder {
      color: #a0a0a0;
   }

   .textinput > input:active::placeholder,
   .textinput > input:focus::placeholder {
      color: transparent;
   }

   .textinput > input:focus,
   .textinput > input:active {
      border-color: var(--main-color1, #6eb8ff);
      background-color: var(--main-color1-light, #6eb8ff20);
      color: var(--main-color2, #4777a4);
   }

   .textinput.error > input,
   .textinput.error > input:focus,
   .textinput.error > input:active {
      color: var(--warning-color, crimson);
      background-color: var(--warning-color-light, #ffd5ce);
      border-color: var(--warning-color, crimson);
   }

   .error-message {
      position: absolute;
      left: 0;
      bottom: calc(100% + 2px);
      border-radius: 0.3em;
      line-height: 1em;
      font-size: 0.75em;
      padding: 0.5em;
      color: var(--warning-color, crimson);
      background-color: var(--warning-color-light, #ffd5ce);
   }
</style>
