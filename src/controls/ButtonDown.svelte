<!--
@component Round button with arrow down.

   Main properties:
   - `title` - title (alternative text), default `'Move down'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Move down', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-down"/>


