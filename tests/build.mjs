/* Compiles the components and the suites into 'tests/.build', which is what node:test runs.
   The package itself ships uncompiled source and has no build step - this one exists only so
   that node can import '.svelte' files and the runes the suites use. */
import { compile, compileModule } from 'svelte/compiler';
import { readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'src', 'controls');
const out = join(here, 'build');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

/* the build is flat and every component became a '.js', so an import of './X.svelte' has to
   become './X.svelte.js' - in the compiled components and in index.js alike */
const relink = (code) => code.replace(/(\.svelte)(['"])/g, '$1.js$2');

let components = 0;
for (const file of readdirSync(src)) {
   if (file.endsWith('.js')) {
      writeFileSync(join(out, file), relink(readFileSync(join(src, file), 'utf8')));
      continue;
   }
   if (!file.endsWith('.svelte')) continue;
   const { js } = compile(readFileSync(join(src, file), 'utf8'),
      { filename: file, generate: 'client', dev: false });
   writeFileSync(join(out, `${file}.js`), relink(js.code));
   components++;
}

let suites = 0;
for (const file of readdirSync(here)) {
   if (file.endsWith('.test.svelte.js')) {
      const code = readFileSync(join(here, file), 'utf8');
      const { js } = compileModule(code, { filename: file, generate: 'client', dev: false });
      writeFileSync(join(out, file.replace('.test.svelte.js', '.test.js')), js.code);
      suites++;
   } else if (file === 'check.js') {
      copyFileSync(join(here, file), join(out, file));
   }
}

if (suites === 0) throw new Error('no suites found - nothing would be tested');
console.log(`built ${components} components and ${suites} suites into tests/build`);
