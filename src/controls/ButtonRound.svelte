<!--
@component Round button (empty).

   Main properties:
   - `title` - title (alternative text).
   - `className` - additional class name for styling the button.
   - `onclick` - function (callback) to be called when user clicks on the button.
-->
<script>
   let {title, className, disable = false, onclick} = $props();
</script>

<button {onclick} {title} aria-label={title} disabled={disable} class="button {className}"></button>

<style>
   button {
      display: inline-block;
      font-size: 1em;
      width: 1.3em;
      height: 1.3em;
      border: none;
      border-radius: 50%;
      box-shadow: none;
      margin: 0 0.25em;
      text-align: center;
      padding: 0;
      background-size: 45% 45%;
      background-position: 50%;
      background-repeat: no-repeat;
      background-color: var(--bg-color-dark, #606570);
   }

   button:hover:not(:disabled) {
      background-color: var(--main-color1, #6eb8ff);
   }

   button:disabled {
      opacity: 0.4;
      cursor: default;
   }

   button:last-of-type {
      margin-right: 0;
   }

   .button:focus-visible {
      outline: solid 2px;
      outline-offset: 2px;
      outline-color: var(--outline-color, #ccc);
   }

   .button-cancel {
      background-image:
         url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="2.0" viewBox="0 0 100 100" style="stroke:%23fafafa;stroke-width:1em;" ><line x1="0" y1="0" x2="100" y2="100"/><line x1="0" y1="100" x2="100" y2="0"/></svg>');
   }

   .button-cancel:hover {
      background-color: var(--warning-color, #dc143c);
   }

   .button-undo {
      background-image:
         url('data:image/svg+xml;utf8,<svg width="99px" height="99px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke-linecap="round" stroke-linejoin="round" ><path d="M6 7L7 6L4.70711 3.70711L5.19868 3.21553C5.97697 2.43724 7.03256 2 8.13323 2C11.361 2 14 4.68015 14 7.93274C14 11.2589 11.3013 14 8 14C6.46292 14 4.92913 13.4144 3.75736 12.2426L2.34315 13.6569C3.90505 15.2188 5.95417 16 8 16C12.4307 16 16 12.3385 16 7.93274C16 3.60052 12.4903 0 8.13323 0C6.50213 0 4.93783 0.647954 3.78447 1.80132L3.29289 2.29289L1 0L0 1V7H6Z" fill="%23fafafa"></path> </g></svg>');
   }

   .button-up {
      background-image:
         url('data:image/svg+xml;utf8,<svg viewBox="0 0 110 110" style="stroke:%23fafafa;stroke-width:1.1em;" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="55" y1="110" x2="55" y2="10"/><line x1="20" y1="50" x2="55" y2="10"/><line x1="90" y1="50" x2="55" y2="10"/></svg>');
   }

   .button-down {
      background-image:
         url('data:image/svg+xml;utf8,<svg viewBox="0 0 110 110" style="stroke:%23fafafa;stroke-width:1.1em;" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="55" y1="0" x2="55" y2="100"/><line x1="20" y1="60" x2="55" y2="100"/><line x1="90" y1="60" x2="55" y2="100"/></svg>');
   }

   .button-download {
      background-image:
         url('data:image/svg+xml;utf8,<svg viewBox="0 0 110 110" style="stroke:%23fafafa;stroke-width:1.1em;" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="0" x2="50" y2="100"/><line x1="10" y1="60" x2="50" y2="100"/><line x1="90" y1="60" x2="50" y2="100"/></svg>');
   }

   .button-add {
      background-image:
         url('data:image/svg+xml;utf8,<svg viewBox="0 0 110 110" style="stroke:%23fafafa;stroke-width:1.1em;" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="55" y1="0" x2="55" y2="110"/><line x1="0" y1="55" x2="110" y2="55"/></svg>');
   }

   .button-settings {
      background-size: 75%;
      background-image:
         url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16"  style="stroke:none;stroke-width:1px;" fill="%23fafafa" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12.2418 6.58543L6.27026 12.5584C5.94986 12.8788 5.54841 13.1061 5.10883 13.216L2.81783 13.7887C2.45164 13.8803 2.11994 13.5486 2.21149 13.1824L2.78424 10.8914C2.89413 10.4518 3.12143 10.0504 3.44183 9.72996L9.41337 3.75701L12.2418 6.58543ZM13.6567 2.3435C14.4378 3.12455 14.4378 4.39088 13.6567 5.17193L12.9489 5.87833L10.1205 3.0499L10.8283 2.3435C11.6093 1.56245 12.8757 1.56245 13.6567 2.3435Z"/></svg>');
   }

</style>
