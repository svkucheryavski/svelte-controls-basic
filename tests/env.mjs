/* A DOM for the controls to be mounted into. Loaded through node's '--import' so that these
   globals exist before Svelte's client runtime is first imported - it reads 'window' as it
   loads, and would otherwise fail. */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });

/* copy the window's own properties onto the global object, leaving the JS built-ins alone -
   replacing those would break instanceof against values made outside the jsdom realm */
const builtins = new Set(['undefined', 'NaN', 'Infinity', 'global', 'globalThis', 'eval',
   'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Array', 'Object', 'Function', 'String',
   'Number', 'Boolean', 'Symbol', 'Math', 'JSON', 'Date', 'RegExp', 'Error', 'Promise',
   'Proxy', 'Reflect', 'Map', 'Set', 'WeakMap', 'WeakSet', 'console']);

for (const key of Object.getOwnPropertyNames(dom.window)) {
   if (builtins.has(key) || key in globalThis) continue;
   try { globalThis[key] = dom.window[key]; } catch { /* read-only on this platform */ }
}

globalThis.window = dom.window;
globalThis.document = dom.window.document;
try {
   globalThis.navigator = dom.window.navigator;
} catch {
   Object.defineProperty(globalThis, 'navigator',
      { value: dom.window.navigator, configurable: true });
}

export { dom };
