# Svelte components for control widgets

`svelte-controls-basic` is a [Svelte 5](https://svelte.dev) component library for creating simple UI control widgets — buttons, sliders, selectors, inputs, and more. All components use Svelte 5 runes and support theming via CSS custom properties.

The controls are meant to be rendered in the browser. They are not tested against server-side
rendering, so nothing here promises to survive being rendered on a server and hydrated.


## Installation

```
npm install svelte-controls-basic
```


## Quick start

Every control is typically placed inside a `Container`, which provides layout (label + content) and theming. All components have built-in default colors, so no extra setup is needed:

```svelte
<script>
   import { Container, Range, Select, Switch, Button } from 'svelte-controls-basic';

   let rangeValue = $state(50);
   let selectedOption = $state('A');
   let isEnabled = $state(false);
</script>

<Container label="range">
   <Range bind:value={rangeValue} min={0} max={100} />
</Container>
<Container label="option">
   <Select options={['A', 'B', 'C']} bind:value={selectedOption} />
</Container>
<Container label="enable">
   <Switch bind:value={isEnabled} />
</Container>
<Container>
   <Button text="Submit" onclick={() => alert(`${selectedOption}: ${rangeValue}`)} />
</Container>
```

[Check this example](https://svelte.dev/playground/ebbd1231a7a947e287d1dd2f8452ddda?version=latest) in Svelte REPL.

## Components

### Container

Wrapper for control elements. Provides label, theming, and stacking behavior (rounded corners on first/last child).

```svelte
<Container label="setting" status="error">
   <p>Something went wrong!</p>
</Container>
```

| Property | Default | Description |
|---|---|---|
| `label` | `null` | Label text shown on the left |
| `name` | `''` | CSS class name for the container |
| `status` | `''` | Status class, use `'error'` for error styling |
| `colors` | `''` | CSS variables string for theming |
| `labelWidth` | `12` | Label width in `ch` units |
| `id` | `null` | Id for the label, see [Naming controls](#naming-controls) |

### Range

Continuous range slider with mouse, touch, wheel, and keyboard support.

```svelte
<Range bind:value={opacity} min={0} max={1} decNum={2} step={0.01} onchange={(v) => console.log(v)} />
```

| Property | Default | Description |
|---|---|---|
| `min` | `0` | Minimum value |
| `max` | `100` | Maximum value |
| `value` | `min` | Current value (bindable) |
| `decNum` | `1` | Decimal places to display |
| `step` | `(max-min)/100` | Increment step |
| `disable` | `false` | Disabled state |
| `ariaLabel` | `null` | Accessible name for the slider |
| `onchange` | `null` | Callback when value changes |

### RangeDiscrete

Like `Range` but for discrete (integer) values with a striped background showing individual steps.

```svelte
<RangeDiscrete bind:value={count} min={1} max={20} step={1} />
```

| Property | Default | Description |
|---|---|---|
| `min` | `0` | Minimum value |
| `max` | `10` | Maximum value |
| `value` | `min` | Current value (bindable) |
| `step` | `1` | Increment step |
| `disable` | `false` | Disabled state |
| `ariaLabel` | `null` | Accessible name for the slider |
| `onchange` | `null` | Callback when value changes |

### Select

Selector shown as a row of buttons.

```svelte
<Select options={['Small', 'Medium', 'Large']} bind:value={size} />
```

| Property | Default | Description |
|---|---|---|
| `options` | | Array of option strings |
| `value` | first option | Selected value (bindable) |
| `className` | `''` | Extra CSS class |
| `disable` | `false` | Disabled state |
| `html` | `true` | Render the options as HTML |
| `ariaLabel` | `null` | Accessible name, see [Naming controls](#naming-controls) |
| `onchange` | `null` | Callback when value changes |

Options are rendered as HTML, so a label can contain markup such as `'m<sup>2</sup>'`. Pass
`html={false}` when the options do not come from you but from a user, a URL or a server —
otherwise they can bring arbitrary markup into the page.

### Switch

Boolean toggle built on top of `Select`. Maps two string options to `true`/`false`.

```svelte
<Switch options={["off", "on"]} bind:value={isActive} />
```

| Property | Default | Description |
|---|---|---|
| `options` | `["no", "yes"]` | Two option labels |
| `value` | `false` | Boolean value (bindable) |
| `disable` | `false` | Disabled state |
| `ariaLabel` | `null` | Accessible name, see [Naming controls](#naming-controls) |
| `onchange` | `null` | Callback when value changes |

### Number

Number input with increment/decrement buttons and keyboard support (arrows, `Home`, `End`).

```svelte
<Number bind:value={fontSize} min={8} max={72} decNum={0} />
```

| Property | Default | Description |
|---|---|---|
| `min` | `0` | Minimum value |
| `max` | `100` | Maximum value |
| `value` | `min` | Current value (bindable) |
| `decNum` | `1` | Decimal places |
| `step` | `10^(-decNum)` | Increment step |
| `disable` | `false` | Disabled state |
| `ariaLabel` | `null` | Accessible name for the selector |
| `onchange` | `null` | Callback when value changes |

Every value the selector produces is snapped to the grid `min + k * step`, so repeated steps do
not accumulate rounding errors — ten increments of `0.1` from `0` give exactly `1`, not
`0.9999999999999999`. A value coming from the parent is only brought into the `[min, max]`
range and is otherwise left as it is.

> **Note on the export name.** This component is exported as `Number`, which shadows the
> JavaScript global of the same name in the module that imports it — `Number(x)` and
> `Number.isFinite(x)` will stop working in that file. Import it under an alias if you need
> the global: `import { Number as NumberInput } from 'svelte-controls-basic';`

### TextInput

Text input with optional validation.

```svelte
<TextInput bind:value={name} placeholder="Enter name" validator={(v) => v.length < 2 ? 'Too short' : ''} />
```

| Property | Default | Description |
|---|---|---|
| `value` | `''` | Text value (bindable) |
| `placeholder` | `''` | Placeholder text |
| `maxLength` | `25` | Maximum character count |
| `validator` | `null` | Function returning error message or `''` |
| `disable` | `false` | Disabled state |
| `ariaLabel` | `null` | Accessible name, see [Naming controls](#naming-controls) |
| `onchange` | `null` | Callback when value changes |

The validator re-runs whenever the value or the validator itself changes, including changes
made by the parent rather than by the user. An empty field is never reported, so a form does
not open with error messages on fields nobody has filled in yet. Anything else the validator
rejects is reported for as long as it is rejected — including a value that arrives already
invalid from the parent, and including after the input has been hidden and shown again.

### Color

Color picker using the native HTML5 color input.

```svelte
<Color bind:value={bgColor} />
```

| Property | Default | Description |
|---|---|---|
| `value` | `'#000000'` | Color value (bindable) |
| `disable` | `false` | Disabled state |
| `ariaLabel` | `null` | Accessible name, see [Naming controls](#naming-controls) |
| `onchange` | `null` | Callback when value changes |

### PlotTypeSelector

Selector with SVG icons for plot types: `'p'` (scatter), `'l'` (line), `'b'` (both), `'h'` (bars), `'hm'` (heatmap), `'bp'` (boxplot), `'qq'` (qq-plot).

```svelte
<PlotTypeSelector options={['p', 'l', 'b', 'h']} bind:value={plotType} />
```

| Property | Default | Description |
|---|---|---|
| `options` | `['p','l','b','h','qq']` | Plot types to show |
| `value` | first option | Selected type (bindable) |
| `disable` | `false` | Disabled state |
| `ariaLabel` | `null` | Accessible name, see [Naming controls](#naming-controls) |
| `onchange` | `null` | Callback when value changes |

### FileSelector

File upload trigger with visual feedback.

```svelte
<FileSelector bind:file={dataFile} message="Select data file" acceptType=".csv,.txt" />
```

| Property | Default | Description |
|---|---|---|
| `file` | | Selected file (bindable) |
| `message` | `'Select CSV file with dataset'` | Prompt text |
| `acceptType` | `'.csv'` | Accepted file types |
| `multiple` | `false` | Allow multiple files |
| `disable` | `false` | Disabled state |

The control is a real `<input type="file">` wrapped in a label, so it behaves natively for the
keyboard and takes its accessible name from the visible text. The clear button next to it is a
separate stop for both keyboard and screen reader.

### Button

Simple text button.

```svelte
<Button text="Run" onclick={() => runAnalysis()} />
```

| Property | Default | Description |
|---|---|---|
| `text` | `'button'` | Button text |
| `type` | `'button'` | Native button type, set to `'submit'` to submit a surrounding form |
| `disable` | `false` | Disabled state |
| `onclick` | | Click callback |

### Icon buttons

Round icon buttons: `ButtonCancel`, `ButtonUndo`, `ButtonAdd`, `ButtonDownload`, `ButtonUpload`, `ButtonUp`, `ButtonDown`, `ButtonSettings`. All share the same API:

```svelte
<ButtonAdd onclick={() => addItem()} />
<ButtonCancel onclick={() => reset()} />
<ButtonDownload onclick={() => saveFile()} disable={!hasData} />
<ButtonUpload onclick={() => loadFile()} />
```

| Property | Default | Description |
|---|---|---|
| `title` | *(varies)* | Accessible title |
| `disable` | `false` | Disabled state |
| `onclick` | | Click callback |

### Spinner

Animated loading spinner.

```svelte
{#if isLoading}<Spinner label="Fetching results" />{/if}
```

| Property | Default | Description |
|---|---|---|
| `label` | `'Loading'` | Text announced by screen readers while the spinner is shown |

The spinner has `role="status"` and no visible text, so `label` is the only thing assistive
technology can announce. Render it conditionally, as above, so it is announced when it appears.
Its rotation slows down for users who ask for reduced motion.

### Widget

Combines multiple controls into a group, producing a single bindable JSON value.

```svelte
<script>
   import { Widget, Select, Range, Switch } from 'svelte-controls-basic';

   const options = {
      method: { label: 'method', el: Select, props: { options: ['PCA', 'PLS'] }, default: 'PCA' },
      ncomp:  { label: 'components', el: Range, props: { min: 1, max: 20, decNum: 0 }, default: 5 },
      center: { label: 'center', el: Switch, default: true },
   };

   let params = $state();
</script>

<Widget title="Settings" {options} bind:value={params} />
```

| Property | Default | Description |
|---|---|---|
| `title` | `''` | Group title |
| `options` | | Configuration object (see below) |
| `value` | | JSON object with all values (bindable) |
| `labelWidth` | `13` | Label width in `ch` units |
| `colors` | `''` | CSS variables string for theming |
| `disable` | `false` | Disables every control of the widget |

Setting `disable` on the widget disables all of its controls. A single control can also be
disabled on its own via `props`, and that stays in effect regardless of the widget-level value:

```svelte
const options = {
   method: { label: 'method', el: Select, props: { options: ['PCA', 'PLS'], disable: true }, default: 'PCA' },
};
```

Each entry in `options` describes one control:

| Field | Type | Description |
|---|---|---|
| `el` | component | The control to render, e.g. `Select` |
| `props` | object | Properties the control is created with |
| `default` | any | Value the bound `value` is initialised with |
| `label` | `string` or `(value) => string` | Text in the label column |
| `name` | string | Extra CSS class on the control's `Container` |
| `hidden` | boolean | Hide the control outright |
| `hiddenWhen` | `(value) => boolean` | Hide it based on the current values |

Every entry should have a `default`. An entry that has neither a `default` nor an existing
value in `value` is reported on the console and its control is skipped, so one incomplete
entry does not take the rest of the widget down.

A `value` object that was built for an older, shorter `options` is filled in from the missing
entries' `default`, so widget settings can be persisted and reused after new options are added.

#### Conditional labels and visibility

`label` and `hiddenWhen` both receive the widget's **whole** bound value object, so a control
can react to what the user has selected in any other control of the same widget:

```svelte
const options = {
   mode: { label: 'mode', el: Select, props: { options: ['single', 'both'] }, default: 'single' },
   stat: {
      el: Switch, default: false,
      label: (v) => v.mode === 'single' ? 'FoM (single)' : 'FoM',
      hidden: resobj.Yref === null,          // this data has no reference values at all
      hiddenWhen: (v) => v.mode === 'both',  // not applicable to the current selection
   },
};
```

`hidden` and `hiddenWhen` are combined with **OR**. They answer different questions — `hidden`
says the control is impossible for this data, `hiddenWhen` says it does not apply to the
current selection — and neither can cancel the other, so an interactive rule can never bring
back a control that the data rules out.

A hidden control **keeps its value** in the bound object; nothing is reset when it disappears,
and it comes back with the same value. Whether a parameter that is currently hidden should be
forgotten is the application's decision, not the widget's.

Both callbacks run while the widget renders, so they must be **synchronous and side effect
free** — writing to the values object from inside one is an error in Svelte, and returning a
promise hides the control, because a promise is always truthy. The object they receive always
has an entry for every option: until the widget has written the `default`s into the bound
object, the callbacks are handed a copy with the missing ones filled in, so a predicate can
read a sibling on the very first render without having to guard against `undefined`.

A callback that throws costs only its own control: that one is hidden, the error is reported
once on the console, and the rest of the widget renders as usual.

Because both fields are evaluated during render, an `options` map never has to be mutated
after it is built — it can be a plain constant or a `$derived` value rather than `$state`.
This works as long as the object bound to `value` is reactive, which is the usual case.

### getDefaults

Helper that builds the initial `value` object for a `Widget` from the same `options`
configuration, so a widget's values can be created (or reset) without rendering it.

```svelte
<script>
   import { Widget, getDefaults, Select, Range } from 'svelte-controls-basic';

   const options = {
      method: { label: 'method', el: Select, props: { options: ['PCA', 'PLS'] }, default: 'PCA' },
      ncomp:  { label: 'components', el: Range, props: { min: 1, max: 20, decNum: 0 }, default: 5 },
   };

   let params = $state(getDefaults(options));   // { method: 'PCA', ncomp: 5 }
</script>

<Widget title="Settings" {options} bind:value={params} />
<Button text="Reset" onclick={() => params = getDefaults(options)} />
```

It returns a plain object mapping each option name to its `default`.


## Naming controls

Most controls here are built from `div`s and buttons rather than from a native `<select>` or
`<input>`, so a screen reader has no name to read out for them. The label you put on the
`Container` is only text sitting next to the control — nothing connects the two.

There are two ways to connect them. Give the control its own name:

```svelte
<Container label="components">
   <Range bind:value={ncomp} min={1} max={20} ariaLabel="components" />
</Container>
```

Or give the `Container` an `id`, and every control inside it takes that label as its name
without you writing the words a second time:

```svelte
<Container label="components" id="ncomp-label">
   <Range bind:value={ncomp} min={1} max={20} />
</Container>
```

The `id` must be unique on the page, which is why there is no default — a built-in one would
be the same string in every container, and two labels sharing an id make a screen reader
announce the wrong one, which is worse than announcing nothing. An `ariaLabel` on the control
always wins over the container's label.

This works for `Range`, `RangeDiscrete`, `Number`, `Select`, `Switch`, `TextInput`, `Color`
and `PlotTypeSelector`.


## Theming

All components have built-in default colors via CSS variable fallbacks, so they work out of the box without any theme configuration. To customize the appearance, pass a CSS variables string to Container's `colors` prop. You can use the exported `Colors` constant as a starting point and override individual variables:

```svelte
<script>
   import { Container, Colors } from 'svelte-controls-basic';
   const colors = Colors + '--main-color1: #e74c3c; --main-color2: #c0392b;';
</script>

<Container {colors}>
   <!-- controls here use the custom colors -->
</Container>
```

Available variables:

| Variable | Default | Description |
|---|---|---|
| `--outline-color` | `#767676` | Focus outline color |
| `--text-color-dark` | `#606570` | Dark text / label color |
| `--text-color-light` | `#fafafa` | Light text (on colored backgrounds) |
| `--text-color-placeholder` | `#6d6d6d` | Placeholder text in `TextInput` |
| `--bg-color-light` | `#f0f0f0` | Light background |
| `--bg-color-medium` | `#e0e0e0` | Track of `RangeDiscrete` between the steps |
| `--bg-color-dark` | `#606570` | Dark background (buttons) |
| `--main-color1` | `#2a75b8` | Primary accent color |
| `--main-color1-light` | `#2a75b820` | Primary accent, translucent |
| `--main-color2` | `#1a4972` | Secondary accent color |
| `--warning-color` | `#b00d2f` | Warning **background** (error `Container`, `ButtonCancel` hover) |
| `--warning-text-color` | `#fefafa` | Text drawn **on** `--warning-color` |
| `--warning-color-light` | `#ffd5ce` | Light warning background (`TextInput` error state) |
| `--warning-color-dark` | `#b00d2f` | Text and border drawn **on** `--warning-color-light` |
| `--warning-link-color` | `#fae550` | Link color in error containers |
| `--warning-link-hover-color` | `#ffee80` | Link hover color in error containers |
| `--container-bg-color` | `#fff` | Container background |
| `--container-bg-color-hover` | `#fafdff` | Container hover background |
| `--slider-edge-color` | `#15395a` | Grip edge on the filled bar of `Range` |

Every pair of these colors which ends up drawn on top of another meets WCAG 2.1 AA — 4.5:1 for
text, 3:1 for the borders and filled areas which carry meaning on their own. This is what fixes
the lightness of `--main-color1`: the near-white `--text-color-light` is written on it in the
selected option of a `Select`, the value of a `Range` and a filled `TextInput`, so a lighter
accent cannot stay readable there. Only its saturation is free. If you replace the palette with
your own, the same two constraints apply to it.

`--slider-edge-color` marks the grip on the filled bar of a `Range` and falls back to
`--main-color2` when it is not set, which is what the edge used before it existed. Set it when
your secondary color sits too close to your primary one to keep the grip visible against the
bar — darkening `--main-color2` instead would also darken the hover text and the `Number`
arrows, which read the same variable.

The four warning variables come in two pairs, and mixing them up is easy: `--warning-color` is a
**background** with `--warning-text-color` written on it, while `--warning-color-light` is a
background with `--warning-color-dark` written on it. A theme that sets `--warning-color` to a
pale shade — correct for a background — must also set `--warning-color-dark`, or the error text
in `TextInput` and the message of a rejected file in `FileSelector` inherit a pale colour on a
pale background and become unreadable.


## License

MIT
