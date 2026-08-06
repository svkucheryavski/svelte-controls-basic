<!--
@component Round button with upload icon and main color.

   Main properties:
   - `title` - title (alternative text), default `'Download'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Upload', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-upload"/>


