<!--
@component Round button with arrow up.

   Main properties:
   - `title` - title (alternative text), default `'Move up'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
   - `disable` - if `true` the button is disabled, default: `false`.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Move up', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-up"/>


