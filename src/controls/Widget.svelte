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

   const warned = new Set();

   $effect(() => {
      if (!options) return;

      if (!value) {
         value = getDefaults(options);
         return;
      }

      /* a binding may not receive 'undefined' - it throws in the control it is bound to. So
         every option must have an entry, also when 'value' was made for an older, shorter
         set of options and is now reused with a longer one */
      let missing = null;
      for (const id of Object.keys(options)) {
         if (value[id] !== undefined) continue;

         if (options[id].default === undefined) {
            if (!warned.has(id)) {
               warned.add(id);
               console.error(`Widget: option "${id}" has neither a value nor a "default", its control is not shown.`);
            }
            continue;
         }

         if (missing === null) missing = {};
         missing[id] = options[id].default;
      }

      if (missing !== null) value = { ...value, ...missing };
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

      {#each Object.keys(options) as id (id)}
         {@const opt = options[id]}
         <!-- a control is only created once its value exists: bound to 'undefined' it would
              throw, and one which silently corrects the value would overwrite the default -->
         {#if !opt.hidden && value[id] !== undefined}
         <Container name={opt.name} label={opt.label} {labelWidth} {colors}>
         <opt.el {...opt.props} disable={isDisabled(opt)} bind:value={value[id]}/>
         </Container>
         {/if}
      {/each}
   {/if}
</div>