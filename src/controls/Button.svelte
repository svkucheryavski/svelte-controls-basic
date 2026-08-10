<!--
@component Button with text.

   Main properties:
   - `text` - text on the button.
   - `onclick` - function (callback) to be called when user clicks on the button.
   - `disable` - if `true` the button is disabled, default: `false`.
   - `type` - type of the button, default: `'button'`.

   The default type is `'button'` and not `'submit'`, so that a button placed inside a form
   does not submit it. Set `type="submit"` explicitly if that is what you need.
-->
<script>
   let {text = 'button', type = 'button', disable = false, onclick} = $props();
</script>

<button class="button" {type} {onclick} disabled={disable}>{text}</button>

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
      border-color: var(--main-color1, #6eb8ff);
      background-color: var(--main-color1-light, #6eb8ff20);
      color: var(--main-color2, #5086b9);
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
