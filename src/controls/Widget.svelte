<!--
@component  Combination of several control elements returning a single JSON with parameters.

   Main properties:
   - `options` - object describing the controls to show (see details).
   - `value` - JSON with the values of all controls (bindable).
   - `title` - title to show above the controls, default: `''`.
   - `labelWidth` - width of the labels column, default: `13`.
   - `colors` - CSS variables for theming.
   - `disable` - if `true` all controls of the widget are disabled, default: `false`.

   **The `options` descriptor**

   Every entry is `{ name, label, el, props, default, hidden, hiddenWhen }`:

   - `el` - the control component, `props` - the properties it is created with.
   - `default` - value to use when `value` has no entry for this control.
   - `label` - either a string or `(value) => string`, where `value` is the whole bound
      object, so a label can be worded after another control's current selection.
   - `hidden` - static boolean, for a control which makes no sense for this data at all.
   - `hiddenWhen` - `(value) => boolean`, for a control which makes no sense for what the
      user has currently selected.

   `hidden` and `hiddenWhen` are combined with OR, so an interactive rule can never bring
   back a control which the data rules out. A hidden control keeps its value in the bound
   object - nothing is reset when it disappears.

   Both callbacks run during render and must be synchronous and free of side effects. They
   always see an entry for every option, defaults included, and one which throws hides only
   its own control.
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

   /* Ids for the labels this widget writes, so that the control under each label can name
      itself with it. A page can hold several widgets and two labels must never share an id,
      or a reader announces the wrong one - this is unique per component instance, and from
      Svelte 5.22 the counter behind it lives on a window global, so it stays unique even on
      a page which ended up with two separately bundled copies of the package. */
   const uid = $props.id();

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

   /* what 'hiddenWhen' and a label function are given. The effect above writes the defaults
      into the bound object, but an effect runs after the render, so on the first pass 'value'
      can still be missing the very entry a callback is about to read. Without this a
      predicate reading a sibling would throw, and a control which should have been hidden
      would mount for one frame - long enough for a control which corrects its own value in an
      effect, like Number or Range, to write that correction back and change data the user
      never touched. The controls stay bound to 'value' itself, only the callbacks see this */
   const effectiveValue = $derived.by(() => {
      if (!options || !value) return value ?? {};

      let merged = null;
      for (const id of Object.keys(options)) {
         /* an entry which is present but 'undefined' counts as missing, the same way the
            effect above treats it - so it must not be left to shadow the default */
         if (value[id] === undefined && options[id].default !== undefined) {
            if (merged === null) merged = { ...value };
            merged[id] = options[id].default;
         }
      }

      /* once the effect has caught up nothing is missing, and the callbacks are handed the
         bound object itself rather than a copy of it */
      return merged ?? value;
   });

   const failed = new Set();

   /**
    * Decides whether one option is shown and what its label reads.
    *
    * Its callbacks are the consumer's code and run while the widget renders, so a throw
    * would otherwise take every other control down with it. One that throws hides its own
    * control and is reported once, which is how a descriptor with no usable value is
    * already handled.
    *
    * @param {string} id - key of the option in 'options'.
    * @param {object} opt - the option descriptor.
    * @returns {{hidden: boolean, label?: *}}
    */
   function resolve(id, opt) {
      try {
         /* 'hidden' and 'hiddenWhen' are combined with OR and neither can cancel the other:
            'hidden' says the control is impossible for this data, 'hiddenWhen' says it does
            not apply to what the user has currently selected. A single field taking either a
            boolean or a function would let the second answer erase the first */
         if (opt.hidden || opt.hiddenWhen?.(effectiveValue)) return { hidden: true };
         return {
            hidden: false,
            label: typeof opt.label === 'function' ? opt.label(effectiveValue) : opt.label
         };
      } catch (e) {
         if (!failed.has(id)) {
            failed.add(id);
            console.error(`Widget: option "${id}" has a callback which threw, its control is not shown.`, e);
         }
         return { hidden: true };
      }
   }
</script>

<div class="widget" >
   {#if value}

      {#if title}
      <Container {colors}>
         <h2>{title}</h2>
      </Container>
      {/if}

      {#each Object.keys(options) as id, i (id)}
         {@const opt = options[id]}
         <!-- a control is only created once its value exists: bound to 'undefined' it would
              throw, and one which silently corrects the value would overwrite the default -->
         {#if value[id] !== undefined}
            <!-- 'hiddenWhen' has to run for every option, including the ones it hides. Only
                 the label is resolved behind the check, so a label function is not called
                 for a control which is not rendered -->
            {@const shown = resolve(id, opt)}
            {#if !shown.hidden}
            <!-- the position and not the option key: a key is free to hold anything, and a
                 key sanitised into an id can collide with another sanitised key, which is the
                 very fault - two labels under one id - this exists to prevent -->
            <Container name={opt.name} label={shown.label} id="{uid}-{i}" {labelWidth} {colors}>
            <opt.el {...opt.props} disable={isDisabled(opt)} bind:value={value[id]}/>
            </Container>
            {/if}
         {/if}
      {/each}
   {/if}
</div>