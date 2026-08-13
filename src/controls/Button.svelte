<!--
@component Button with text.

   Main properties:
   - `text` - text on the button.
   - `onclick` - function (callback) to be called when user clicks on the button.
   - `disable` - if `true` the button is disabled, default: `false`.
   - `type` - type of the button, default: `'button'`.
   - `class` - extra class name (or names) added next to the built in one.

   The default type is `'button'` and not `'submit'`, so that a button placed inside a form
   does not submit it. Set `type="submit"` explicitly if that is what you need.

   Svelte scopes styles to the component they are written in, and a class name passed as a
   property does not carry that scope - write the rule as `:global(.my-class)` or it will be
   dropped as unused. The built in rules are scoped and therefore more specific than a bare
   class, so an override needs a selector of its own weight, e.g. `:global(.my-class.my-class)`.
-->
<script>
   let {text = 'button', type = 'button', disable = false, onclick, class: className = ''} = $props();
</script>

<button class={['button', className]} {type} {onclick} disabled={disable}>{text}</button>

<style>
   button {
      display: inline-block;
      font-size: 0.9em;
      padding: 0em 0.5em;
      line-height: 1.5em;
      border-radius: 0.25em;
      box-shadow: none;
      margin: 0;
      text-align: center;
      border: 1px solid transparent;
      background-color: var(--bg-color-dark, #606570);
      color: var(--text-color-light, #fafafa);
   }

   button:hover:not(:disabled) {
      border-color: var(--main-color1, #2a75b8);
      background-color: var(--main-color1-light, #2a75b820);
      color: var(--main-color2, #1a4972);
   }

   button:disabled {
      opacity: 0.4;
      cursor: default;
   }

   .button:focus-visible {
      outline: solid 2px;
      outline-offset: 2px;
      outline-color: var(--outline-color, #767676);
   }

</style>
