<!--
@component Round button with arrow up.

   Main properties:
   - `title` - title (alternative text), default `'Move up'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Move up', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-up"/>


