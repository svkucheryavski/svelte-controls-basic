<!--
@component Round button with cross icon and warning color, can be used for canceling or resetting anything.

   Main properties:
   - `title` - title (alternative text), default `'Reset'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Reset', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-cancel"/>
