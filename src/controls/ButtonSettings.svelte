<!--
@component Round button with settings icon and main color.

   Main properties:
   - `title` - title (alternative text), default `'Settings'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Settings', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-settings"/>


