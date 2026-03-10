<!--
@component  Combination of several control elements returning a single JSON with parameters.
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
   } = $props();

   $effect(() => {
      if (!value && options) value = getDefaults(options);
   });
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
         <opt.el {...opt.props} bind:value={value[id]}/>
         </Container>
         {/if}
      {/each}
   {/if}
</div>