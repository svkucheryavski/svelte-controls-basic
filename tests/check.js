/* Collects the outcome of every check in a suite, so that each one can be reported to
   node:test afterwards as a test of its own. The suites run their assertions at the top
   level, which node:test cannot see; this keeps a failure named and located instead of
   collapsing a whole file into one red line. */
export function collector() {
   const results = [];
   const ok = (name, cond, extra = '') => {
      results.push({ name, passed: !!cond, extra });
   };
   const eq = (name, got, want) =>
      ok(name, Object.is(got, want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
   return { ok, eq, results };
}

export function report(test, assert, results) {
   if (results.length === 0) throw new Error('suite recorded no checks at all');
   for (const r of results) {
      test(r.name, () => assert.ok(r.passed, r.extra || r.name));
   }
}
