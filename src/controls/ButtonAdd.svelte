<!--
@component Round button with add icon and main color.

   Main properties:
   - `title` - title (alternative text), default `'Add'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
   - `disable` - if `true` the button is disabled, default: `false`.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Add', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} class="button-add"/>


