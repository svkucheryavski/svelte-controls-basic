<!--
@component Container (wrapper) for any control or a group of control elements.

   Main properties:
   - `label` - the label text (optional).
   - `name` - name of the element, will be used for add CSS class.
   - `status` - status name will be added as a class (optional).
   - `colors` - string with CSS variables defining colors of control elements.
   - `labelWidth` - width of label elements in characters, default: 12.

   **Description**

   If `label` is not empty the label will be shown as fixed width text on the left of the
   container, so the control elements will be indented. If no or empty label is provided, the
   control elements will be placed at the beginning of the container.

   String with colors can be exported from the package (plus see readme for details).

   If several containers share the same parent, the first and the last ones will have slightly
   round borders. There will be a small margin (0.5px) between the containers in the stack.

   You can also put any text inside container, tags `<p>` and `<h2>` will be styled nicely.

   If you provide status `'error'` the container will be shown using a specific warning color
   (by default crimson) assuming that it contains an error message.

   **Example:**

```svelte
<script>
   import {Container, Range, Button} from 'svelte-controls-basic';
   let rangeValue = $state(0);
</script>

<Container {colors}>
   <h2>Block</h2>
</Container>
<Container label="range" {colors}>
   <Range bind:value={rangeValue} min={0} max={0.1} decNum={2}/>
</Container>
<Container label="button" {colors}>
   <Button text="click me" onclick={() => alert(rangeValue)}/>
</Container>
{#if rangeValue > 0.07}
<Container status="error">
    <p>The value is too high, reduce it please!</p>
</Container>
{/if}
```
-->
<script>
   let {
      label = null,
      name = '',
      status = '',
      colors = '',
      labelWidth = 12,
      children
   } = $props();
</script>

<div class="control-element {name} {status}" style={colors}>
   {#if label}
   <span class="label" style="flex-basis:{labelWidth}ch;">{label}</span>
   {/if}
   {@render children?.()}
</div>

<style>
   .control-element {
      font-size: 0.85em;
      background: var(--container-bg-color, #fff);
      color: var(--text-color-dark, #606570);

      padding: 0.5em 0.5em 0.5em 1.0em;
      border-radius: 0;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-bottom: 0.5px;
   }

   .control-element:hover {
      background: var(--container-bg-color-hover, #fafdff);
   }

   .control-element:first-child {
      margin-top: 0.25rem;
      border-top-left-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
   }

   .control-element:last-child {
      margin-bottom: 0.25rem;
      border-bottom-left-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
   }

   .control-element.error {
      background: var(--warning-color, crimson);
      color: var(--warning-text-color, #fefefe);
   }


   .label {
      padding-right: 0.75em;
      flex-grow: 0;
      flex-shrink: 1;
      color: var(--text-color-dark, #606570);
   }

   .control-element > :global(.wrapper) {
      flex: 1 1 auto;
      position: relative;
      box-sizing: border-box;
      display: inline-block;
      margin: 0;
      padding: 0;
      width: auto;
   }

   .control-element > :global(h2) {
      text-align: left;
      flex-grow: 1;
      padding: 0 0.25em 0 0;
      margin: 0;
      font-size: 1.1em;
   }

   .control-element > :global(p) {
      text-align: left;
      flex-grow: 1;
      padding: 0 0.25em 0 0em;
      margin: 0;
      font-size: max(12px, 0.9em);
   }

   :global(.control-element.error p) {
      color: var(--warning-text-color, #fefafa);
   }

   :global(.control-element.error a) {
      color: var(--warning-link-color, #ffeeaa);
   }

   :global(.control-element.error a:hover) {
      color: var(--warning-link-hover-color, #ffee80);
   }

   .control-element > :global(.title) {
      font-size: 1.05em;
      font-weight: bold;
      color: var(--text-color-dark, #606570);
      flex-grow: 1;
      padding: 0.3em 0;
      margin: 0;
   }

</style>
