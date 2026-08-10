export const Colors = '\
--outline-color: #ccc; \
--text-color-dark: #606570; \
--text-color-light: #fafafa; \
--text-color-placeholder: #a0a0a0;\
--bg-color-light: #f0f0f0;\
--bg-color-light2: #f6f6f6 ;\
--bg-color-medium: #e0e0e0;\
--bg-color-dark: #606570;\
--main-color1: #6eb8ff;\
--main-color1-light: #6eb8ff20;\
--main-color2: #4777a4;\
--warning-color: crimson;\
--warning-text-color: #fefafa;\
--warning-color-light: #ffd5ce;\
--warning-color-dark: crimson;\
--warning-link-color:#fae550;\
--warning-link-hover-color:#ffee80;\
--container-bg-color: #fff;\
--container-bg-color-hover: #fafdff;\
';

export function getDefaults(options) {
   const out = {};
   for(const opt of Object.keys(options)) {
      out[opt] = options[opt].default;
   }
   return out;
}


/**
 * Coerces 'v' to a finite number or returns 'fallback' if that is not possible.
 *
 * The explicit checks are needed because 'Number()' maps several non-numeric values to 0
 * ('', '   ', null, false, []), which would silently look like a valid position.
 *
 * @param {*} v - value to coerce.
 * @param {number} fallback - value to return when 'v' is not a finite number.
 * @returns {number}
 */
export function toFiniteNumber(v, fallback) {
   if (v === null || v === undefined || typeof v === 'boolean') return fallback;
   if (typeof v === 'string' && v.trim() === '') return fallback;
   if (typeof v !== 'number' && typeof v !== 'string') return fallback;
   const n = typeof v === 'number' ? v : Number(v);
   return Number.isFinite(n) ? n : fallback;
}


/**
 * Constrains 'v' to the interval ['min', 'max'].
 *
 * @param {number} v - value to constrain.
 * @param {number} min - smallest allowed value.
 * @param {number} max - largest allowed value.
 * @returns {number}
 */
export function clamp(v, min, max) {
   return v < min ? min : (v > max ? max : v);
}


/**
 * Number of decimals needed to write 'x' out exactly, capped at 10.
 *
 * @param {number} x
 * @returns {number}
 */
function decimalsOf(x) {
   if (!Number.isFinite(x) || x === 0) return 0;
   const [mantissa, exponent] = Math.abs(x).toExponential().split('e');
   return Math.max(0, Math.min(10, (mantissa.split('.')[1] ?? '').length - Number(exponent)));
}


/**
 * Snaps 'v' onto the grid of values 'min + k * step' and constrains it to ['min', 'max'].
 *
 * The grid is anchored at 'min', not at zero, so that 'min' is always reachable. 'max' is
 * reachable too even when it is not on the grid, which keeps the right edge of a slider
 * usable for step values that do not divide the range. The result is rounded to the number
 * of decimals the grid actually needs, which removes binary floating point noise, and is
 * idempotent - snapping an already snapped value returns it unchanged.
 *
 * @param {number} v - value to snap.
 * @param {number} min - smallest value of the range.
 * @param {number} max - largest value of the range.
 * @param {number} step - distance between neighbouring values.
 * @returns {number}
 */
export function snapToStep(v, min, max, step) {
   if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return Number.isFinite(v) ? v : min;
   if (!Number.isFinite(v)) return min;
   if (!(step > 0) || !Number.isFinite(step)) return clamp(v, min, max);

   const span = (max - min) / step;
   if (!Number.isFinite(span)) return clamp(v, min, max);

   // relative epsilon, so that the last grid point is not lost to rounding at any magnitude
   const eps = Math.max(1e-9, Math.abs(span) * 1e-9);
   const kMax = Math.max(0, Math.floor(span + eps));
   const k = clamp(Math.round((v - min) / step), 0, kMax);
   const onGrid = min + k * step;

   // let the last step reach 'max' itself when the grid stops short of it
   const useMax = k === kMax && max > onGrid && v > (onGrid + max) / 2;
   const prec = Math.min(10, Math.max(decimalsOf(step), decimalsOf(min), decimalsOf(max)));

   return clamp(+(useMax ? max : onGrid).toFixed(prec), min, max);
}
