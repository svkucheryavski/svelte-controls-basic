# Release notes

## 2.0.0 (2026-08-12)

The first release since `1.1.1`. It is a major version because several controls now behave
differently from before — see [Upgrading from 1.x](README.md#upgrading-from-1x) in the README
for the list and what to do about each one.

**Security**

* `Select` options are shown as text unless `html={true}` is passed. Until now every option was
  rendered as HTML, so an option taken from a user, a URL or a server could put arbitrary markup
  into the page. `Switch` takes the same `html` property.
* `PlotTypeSelector` looks up icons only among its own keys, so an unknown plot type cannot
  reach the markup.

**Fixed**

* `Number` no longer crashes when used with `bind:value` or given a non-numeric value, and its
  repeated steps no longer drift — ten steps of `0.1` from `0` give exactly `1`.
* `Range` and `RangeDiscrete` handle touch input, snap every value to the grid `min + k * step`
  and reach both `min` and `max` from the keyboard.
* A `TextInput` validator now re-runs when the value or the validator is replaced by the parent,
  not only while the user types, and an error message survives the input being hidden and shown
  again. An empty field is never reported.
* A `Widget` no longer loses the `default`s of options that are missing from the bound value; a
  value object saved against an older, shorter `options` is filled in and stays usable.
* An option's `label` and `hiddenWhen` callbacks are given the defaults on the very first render,
  so a callback can read a sibling without guarding against `undefined`.
* The message `FileSelector` shows for a rejected file now hides the file name underneath it,
  instead of being drawn over it with no background of its own, and sits on the same line.
* `onchange` is not called when a value is set to what it already was.

**Accessibility**

* Controls take their accessible name from the label of their `Container` when it is given an
  `id`, or from an `ariaLabel` of their own — see
  [Naming controls](README.md#naming-controls).
* `Select` and `PlotTypeSelector` report which option is selected instead of only painting it.
* The reset button of `FileSelector` is reachable by keyboard, and error messages and `Spinner`
  are announced.
* The keyboard focus ring is visible: `--outline-color` `#ccc` → `#767676`.

**Theming**

* The default palette was repainted so that every pair of colours the library draws on top of
  each other meets WCAG 2.1 AA.
* `--text-color-placeholder`, `--warning-color-dark` and `--slider-edge-color` are new;
  `--bg-color-light2`, which no component read, is gone.
* Every CSS variable fallback in the components agrees with the `Colors` constant.
* A rejected file in `FileSelector` is shown in the same colours as an invalid `TextInput`.

**Added**

* `disable` on every control, and on `Widget` to disable all of its controls at once.
* `hiddenWhen` and a callable `label` on a `Widget` option, so a control can hide itself or
  reword its label from the current values.
* `type` on `Button`, for a button that submits a surrounding form.
* `label` on `Spinner`, announced by screen readers.

**Documentation**

* The README says once that these controls are meant for the browser and are not tested against
  server-side rendering.

## 1.1.2 (not published)

Committed but never released to npm; its changes are part of 2.0.0.

* Added the `LICENSE` file.
* `'qq'` added to the default `options` of `PlotTypeSelector`.
* Corrected the documented default title of `ButtonUpload`.

## 1.1.1 (2026-08-07)

* Package metadata modernised: `"type": "module"`, conditional `exports` with `svelte` and
  `default` conditions, a `./package.json` subpath export, and `svelte ^5.0.0` declared as a
  peer dependency.

## 1.1.0 (2026-08-06)

* Added `ButtonUpload`.
* `FileSelector` reworked.
* `ButtonRound` restyled, which changes the look of all icon buttons built on it.

## 1.0.0 (2026-03-10)

First release. All components rewritten with Svelte 5 runes and given a consistent API,
`mdatools` dropped as a dependency, and the README written.
