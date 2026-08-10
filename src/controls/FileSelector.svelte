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

<!-- 'group' and not 'button': a group keeps everything inside it reachable, while a button
     turns its whole content presentational -->
<div class="file-selector" role="group"
   class:selected={file} class:dragging={dragCounter > 0} class:rejected={rejected !== ''}
   class:disabled={disable}
   ondragenter={(e) => { e.preventDefault(); if (!disable) dragCounter++; }}
   ondragleave={() => { if (dragCounter > 0) dragCounter--; }}
   ondragover={(e) => e.preventDefault()}
   ondrop={handleDrop}>

   <!-- the native input is the control itself. It used to be replaced by a div with
        role="button", which makes everything inside it presentational - the reset button was
        then unreachable for a screen reader. Here the input only gets clipped away, so it
        keeps its own keyboard behaviour, its accessible name and its disabled state, and the
        reset button stays a separate stop for both keyboard and screen reader -->
   <label>
      <input onchange={changeStatus} bind:this={fileInput} type="file" accept={acceptType}
         disabled={disable} multiple={multiple}>
      <span>{ file ? (file.length > 1 ? `Selected ${file.length} files`: file.name) : message }</span>
   </label>

   {#if file}
   <ButtonCancel onclick={reset} {disable}/>
   {/if}

   {#if rejected}
   <div class="error" role="alert">{rejected}</div>
   {/if}
</div>

<style>
   /* clipped instead of 'display: none', so the input stays focusable and keeps being
      announced - a hidden input is not part of the accessibility tree */
   .file-selector input[type="file"] {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      white-space: nowrap;
      clip-path: inset(50%);
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

      /* containing block for the clipped input above */
      position: relative;
   }

   /* the label carries what the container used to carry, so the row still looks the same and
      the icon stays part of the clickable area */
   .file-selector > label {
      display: flex;
      align-items: center;
      flex: 1 1;
      min-width: 0;
      overflow: hidden;
      cursor: default;
   }

   .file-selector span {
      flex: 1 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
   }

   .file-selector:has(input:focus-visible) {
      outline: solid 2px;
      outline-offset: 2px;
      outline-color: var(--outline-color, #767676);
   }

   .file-selector:has(input:focus-visible) > label::before {
      color: var(--main-color1, #6eb8ff);
   }

   .file-selector > label::before {
      display: inline-block;
      content: '\21ea';
      font-size: 1.1em;
      margin: 0 0.5em 0 0em;
      padding: 0;
      color: var(--text-color-dark, #606570);
   }

   .file-selector:hover:not(.disabled) > label::before {
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

   .file-selector.dragging > label::before {
      color: var(--main-color1, #6eb8ff);
   }

   .file-selector.rejected {
      background-color: var(--error-color, #f0a0a0);
   }

   .file-selector.selected > label::before {
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
