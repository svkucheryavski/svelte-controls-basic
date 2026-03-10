<!--
@component Round button with download icon and main color.

   Main properties:
   - `title` - title (alternative text), default `'Download'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Download', disable = false, onclick} = $props();
</script>

<ButtonRound {title} {disable} {onclick} className="button-download"/>


