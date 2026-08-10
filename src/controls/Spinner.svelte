<!--
@component Shows spinner

   Main properties:
   - `label` - text announced by screen readers while the spinner is shown, default: `'Loading'`.

   The spinner carries no visible text, so the label is the only thing assistive technology can
   announce. Render the spinner conditionally - it is announced when it appears.
-->
<script>
   let { label = 'Loading' } = $props();
</script>

<div class="spinner" role="status" aria-label={label}></div>

<style>
   .spinner {
      display: inline-block;
      height: 1.5em;
      line-height: 1.5em;
      width: 1.5em;
      margin: 0 0.5em;
   }

   .spinner:after {
      content: " ";
      display: block;
      width: 0.8em;
      height: 0.8em;
      margin: 0.1em;
      border-radius: 50%;
      border: 0.2em solid;
      border-color: var(--main-color1, #6eb8ff) transparent var(--main-color1, #6eb8ff) transparent;
      animation: spinner 1.2s linear infinite;
   }

   @keyframes spinner {
      0% {
         transform: rotate(0deg);
      }
      100% {
         transform: rotate(360deg);
      }
   }

   /* the rotation is what says "busy", so it is slowed down rather than stopped */
   @media (prefers-reduced-motion: reduce) {
      .spinner:after {
         animation-duration: 3s;
      }
   }
</style>
