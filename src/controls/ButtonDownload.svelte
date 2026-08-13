<!--
@component Round button with download icon and main color.

   Main properties:
   - `title` - title (alternative text), default `'Download'`.
   - `onclick` - function (callback) to be called when user clicks on the button.
   - `disable` - if `true` the button is disabled, default: `false`.
   - `class` - additional class name, added next to the one which picks the icon.
-->
<script>
   import ButtonRound from "./ButtonRound.svelte";
   let {title = 'Download', disable = false, onclick, class: className = ''} = $props();
</script>

<ButtonRound {title} {disable} {onclick} class={['button-download', className]}/>


