# Svelte components for control widgets

`svelte-controls-basic` is a [Svelte 5](https://svelte.dev) component library for creating simple UI control widgets — buttons, sliders, selectors, inputs, and more. All components use Svelte 5 runes and support theming via CSS custom properties.


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
| `onchange` | `null` | Callback when value changes |

### Switch

Boolean toggle built on top of `Select`. Maps two string options to `true`/`false`.

```svelte
<Switch options={["off", "on"]} bind:value={isActive} />
```

| Property | Default | Description |
|---|---|---|
| `options` | `["no", "yes"]` | Two option labels |
| `value` | `false` | Boolean value (bindable) |
| `onchange` | `null` | Callback when value changes |

### Number

Number input with increment/decrement buttons and arrow key support.

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
| `onchange` | `null` | Callback when value changes |

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
| `onchange` | `null` | Callback when value changes |

### Color

Color picker using the native HTML5 color input.

```svelte
<Color bind:value={bgColor} />
```

| Property | Default | Description |
|---|---|---|
| `value` | `'#000000'` | Color value (bindable) |
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

### Button

Simple text button.

```svelte
<Button text="Run" onclick={() => runAnalysis()} />
```

| Property | Default | Description |
|---|---|---|
| `text` | `'button'` | Button text |
| `onclick` | | Click callback |

### Icon buttons

Round icon buttons: `ButtonCancel`, `ButtonUndo`, `ButtonAdd`, `ButtonDownload`, `ButtonUp`, `ButtonDown`, `ButtonSettings`. All share the same API:

```svelte
<ButtonAdd onclick={() => addItem()} />
<ButtonCancel onclick={() => reset()} />
<ButtonDownload onclick={() => saveFile()} disable={!hasData} />
```

| Property | Default | Description |
|---|---|---|
| `title` | *(varies)* | Accessible title |
| `disable` | `false` | Disabled state |
| `onclick` | | Click callback |

### Spinner

Animated loading spinner. No properties.

```svelte
<Spinner />
```

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

Each entry in `options` is `{ name, label, el: ComponentClass, props, default, hidden }`.


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
| `--outline-color` | `#ccc` | Focus outline color |
| `--text-color-dark` | `#606570` | Dark text / label color |
| `--text-color-light` | `#fafafa` | Light text (on colored backgrounds) |
| `--bg-color-light` | `#f0f0f0` | Light background |
| `--bg-color-light2` | `#f6f6f6` | Secondary light background |
| `--bg-color-medium` | `#e0e0e0` | Medium background |
| `--bg-color-dark` | `#606570` | Dark background (buttons) |
| `--main-color1` | `#6eb8ff` | Primary accent color |
| `--main-color1-light` | `#6eb8ff20` | Primary accent, translucent |
| `--main-color2` | `#4777a4` | Secondary accent color |
| `--warning-color` | `crimson` | Warning / error color |
| `--warning-text-color` | `#fefafa` | Text on warning background |
| `--warning-color-light` | `#ffd5ce` | Light warning background |
| `--warning-link-color` | `#fae550` | Link color in error containers |
| `--warning-link-hover-color` | `#ffee80` | Link hover color in error containers |
| `--container-bg-color` | `#fff` | Container background |
| `--container-bg-color-hover` | `#fafdff` | Container hover background |


## License

MIT
