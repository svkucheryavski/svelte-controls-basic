<!--
@component Round button with add icon and main color.

   Main properties:
   - `title` - title (alternative text), default `'Add'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Add', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-add"/>


