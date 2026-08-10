<!--
@component File selector with icons an text. Supports both click-to-browse and drag-and-drop.

   Main properties:
   - `file` - bindable property to get the selected file
   - `message` - message text to show on the selector, default: `'Select CSV file with dataset'`.
   - `acceptType` - pattern - which files to accept, default: `'.csv'`.
   - `disable` - if `true` the selector does not react to any input, default: `false`.
-->
<script>
   import ButtonCancel from './ButtonCancel.svelte'
   let {
      file = $bindable(),                        // container to get return the uploaded file
      message = 'Select CSV file with dataset',  // message to show when no file is selected
      acceptType = '.csv',                       // file type to accept
      multiple = false,
      disable = false                            // if true the selector ignores any input
   } = $props();

   let fileInput = $state();
   let dragCounter = $state(0);
   let rejected = $state('');
   let rejectTimer;

   /* set file from a FileList */
   function setFiles(files) {
      if (files && files.length > 0) {
         file = files.length === 1 ? files[0] : files;
      } else {
         file = null;
      }
   }

   /* change value for 'file' parameter when user selects or deselects file */
   function changeStatus() {
      setFiles(fileInput?.files);
   }

   /* activate file selection input if user hit Enter or Spacebar when being on label */
   function activateInput(e) {
      if (disable) return;
      if (e.target.tagName === 'BUTTON') return;
      if (e.type === 'click' || (e.type === 'keydown' && (e.code === 'Space' || e.code === 'Enter'))) fileInput.click();
   }

   /* check if a file matches the acceptType pattern */
   function isAccepted(f) {
      if (!acceptType) return true;
      return acceptType.split(',').some(t => {
         t = t.trim().toLowerCase();
         if (t.startsWith('.')) return f.name.toLowerCase().endsWith(t);
         if (t.endsWith('/*')) return f.type.toLowerCase().startsWith(t.slice(0, -1));
         return f.type.toLowerCase() === t;
      });
   }

   /* show rejection error for 1 second */
   function reject(msg) {
      clearTimeout(rejectTimer);
      rejected = msg;
      rejectTimer = setTimeout(() => rejected = '', 1000);
   }

   /* handle file drop */
   function handleDrop(e) {
      e.preventDefault();
      dragCounter = 0;
      if (disable) return;
      const allFiles = Array.from(e.dataTransfer.files);
      if (!multiple && allFiles.length > 1) {
         reject('drop one file only');
         return;
      }
      const dropped = allFiles.filter(isAccepted);
      if (dropped.length === 0) {
         reject('wrong file type');
         return;
      }
      setFiles(multiple ? dropped : [dropped[0]]);
   }

   /* resets selection */
   function reset() {
      if (disable) return;
      fileInput.value = null;
      file = null;
   }
</script>

<div tabindex={disable ? -1 : 0} onkeydown={activateInput} onclick={activateInput} role="button" class="file-selector"
   class:selected={file} class:dragging={dragCounter > 0} class:rejected={rejected !== ''}
   class:disabled={disable} aria-disabled={disable || undefined}
   ondragenter={(e) => { e.preventDefault(); if (!disable) dragCounter++; }}
   ondragleave={() => { if (dragCounter > 0) dragCounter--; }}
   ondragover={(e) => e.preventDefault()}
   ondrop={handleDrop}>
   <span>{ file ? (file.length > 1 ? `Selected ${file.length} files`: file.name) : message }</span>
   {#if multiple}
   <input onchange={changeStatus} bind:this={fileInput} type="file" accept={acceptType} disabled={disable} multiple>
   {:else}
   <input onchange={changeStatus} bind:this={fileInput} type="file" accept={acceptType} disabled={disable}>
   {/if}

   {#if file}
   <ButtonCancel onclick={reset} {disable}/>
   {/if}

   {#if rejected}
   <div class="error">{rejected}</div>
   {/if}
</div>

<style>
   .file-selector > input {
      display: none;
      position: relative;
   }

   .file-selector {
      display: flex;
      align-items: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      flex: 1 1;
      min-width: 0;
      border-radius: 2px;
      cursor: default;
   }

   .file-selector span {
      flex: 1 1;
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

   .file-selector:hover:not(.disabled)::before {
      color: var(--main-color1, #6eb8ff);
   }

   .file-selector.disabled {
      opacity: 0.4;
   }

   .file-selector.dragging {
      background-color: var(--main-color1-light, #6eb8ff20);
      outline: dashed 2px var(--main-color1, #6eb8ff);
      outline-offset: 2px;
   }

   .file-selector.dragging::before {
      color: var(--main-color1, #6eb8ff);
   }

   .file-selector.rejected {
      background-color: var(--error-color, #f0a0a0);
   }

   .file-selector.selected::before {
      content: '\2637';
      font-size: 1.3em;
      letter-spacing: -.2em;
      font-weight: bold;
      color: var(--main-color1, #6eb8ff);
   }

   .error {
      display: none;
   }

   .rejected {
      position: relative;
   }

   .rejected .error {
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      padding: 0.2em;
      border-radius: 2px;
   }
</style>
