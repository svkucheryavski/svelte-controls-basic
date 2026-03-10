<!--
@component Round button with undo icon and main color.

   Main properties:
   - `title` - title (alternative text), default `'Undo'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Undo', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-undo"/>


