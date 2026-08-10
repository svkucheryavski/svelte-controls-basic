<!--
@component  Combination of several control elements returning a single JSON with parameters.

   Main properties:
   - `options` - object describing the controls to show (see details).
   - `value` - JSON with the values of all controls (bindable).
   - `title` - title to show above the controls, default: `''`.
   - `labelWidth` - width of the labels column, default: `13`.
   - `colors` - CSS variables for theming.
   - `disable` - if `true` all controls of the widget are disabled, default: `false`.
-->
<script>
   import Container from "./Container.svelte";
   import { getDefaults } from "./utils.js";
   let {
      title = '',
      options,               // array with all options (see details)
      value = $bindable(),   // JSON with properties
      labelWidth = 13,
      colors = '',           // CSS variables for theming
      disable = false,       // if true all controls of the widget are disabled
   } = $props();

   $effect(() => {
      if (!value && options) value = getDefaults(options);
   });

   /* the widget can only add to what an option already asks for, so that 'disable' set for a
      single control is not lost when the whole widget stays enabled */
   const isDisabled = (opt) => disable || opt.props?.disable === true;
</script>

<div class="widget" >
   {#if value}

      {#if title}
      <Container {colors}>
         <h2>{title}</h2>
      </Container>
      {/if}

      {#each Object.keys(options) as id}
         {@const opt = options[id]}
         {#if !opt.hidden}
         <Container name={opt.name} label={opt.label} {labelWidth} {colors}>
         <opt.el {...opt.props} disable={isDisabled(opt)} bind:value={value[id]}/>
         </Container>
         {/if}
      {/each}
   {/if}
</div>