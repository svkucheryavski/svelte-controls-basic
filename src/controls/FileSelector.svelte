<!--
@component File selector with icons an text.

   Main properties:
   - `file` - bindable property to get the selected file
   - `message` - message text to show on the selector, default: `'Select CSV file with dataset'`.
   - `acceptType` - pattern - which files to accept, default: `'.csv'`.
-->
<script>
   import ButtonCancel from './ButtonCancel.svelte'
   let {
      file = $bindable(),                        // container to get return the uploaded file
      message = 'Select CSV file with dataset',  // message to show when no file is selected
      acceptType = '.csv',                       // file type to accept
      multiple = false
   } = $props();

   let fileInput = $state();
   /* change value for 'file' parameter when user selects or deselects file */
   function changeStatus(e) {
      if (fileInput && fileInput.files.length > 0) {
         file = fileInput.files.length === 1 ? fileInput.files[0] : fileInput.files;
      } else {
         file = null;
      }
   }

   /* activate file selection input if user hit Enter or Spacebar when being on label */
   function activateInput(e) {
      if (e.type === 'click' || (e.type === 'keydown' && (e.code === 'Space' || e.code === 'Enter'))) fileInput.click();
   }

   /* resets selection */
   function reset(e) {
      fileInput.value = null;
      file = null;
   }
</script>

<div tabindex="0" onkeydown={activateInput} onclick={activateInput} role="button" class="file-selector"
   class:selected={file}>
   { file ? (file.length > 1 ? `Selected ${file.length} files`: file.name) : message }
   {#if multiple}
   <input onchange={changeStatus} bind:this={fileInput} type="file" accept={acceptType} multiple>
   {:else}
   <input onchange={changeStatus} bind:this={fileInput} type="file" accept={acceptType}>
   {/if}
</div>
{#if file}
<ButtonCancel onclick={reset}/>
{/if}

<style>
   .file-selector > input {
      display: none;
   }

   .file-selector {
      display: flex;
      align-items: baseline;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      flex: 1 1;
      min-width: 0;
      border-radius: 2px;
      cursor: default;
   }

   .file-selector:focus-visible {
      outline: solid 2px;
      outline-offset: 2px;
      outline-color: var(--outline-color, #ccc);
   }

   .file-selector:focus-visible::before {
      color: var(--main-color1, #6eb8ff);
   }

   .file-selector::before {
      display: inline-block;
      content: '\21ea';
      font-size: 1.1em;
      margin: 0 0.5em 0 0em;
      padding: 0;
      color: var(--text-color-dark, #606570);
   }

   .file-selector:hover::before {
      color: var(--main-color1, #6eb8ff);
   }

   .file-selector.selected::before {
      content: '\2637';
      font-size: 1.3em;
      letter-spacing: -.2em;
      font-weight: bold;
      color: var(--main-color1, #6eb8ff);
   }
</style>
