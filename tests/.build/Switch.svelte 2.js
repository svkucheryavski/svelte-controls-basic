import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select from './Select.svelte.js';

export default function Switch($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 19, () => ["no", "yes"]),
		// array with all options
		value = $.prop($$props, 'value', 15, false // initial selected value
		),
		disable = $.prop($$props, 'disable', 3, false // if true the switch ignores any input
		),
		html = $.prop($$props, 'html', 3, false // if true the options are rendered as HTML
		),
		onchange = $.prop($$props, 'onchange', 3, null // callback when value changes
		),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, null // accessible name
		);

	let selectValue = $.state($.proxy(value() ? options()[1] : options()[0]));

	const cleanOptions = $.derived(() => {
		if (options().length !== 2) {
			console.error('Switch: parameter "options" must have two values.');

			return null;
		}

		return options();
	});

	// sync parent's value → selectValue
	$.user_effect(() => $.set(selectValue, value() ? options()[1] : options()[0], true));

	// sync user selection → value (via Select's onchange, avoiding circular $effect)
	function handleSelect(selected) {
		const newValue = selected === options()[1];

		if (Object.is(newValue, value())) return;

		value(newValue);

		if (onchange()) onchange()(value());
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Select($$anchor, {
				get options() {
					return $.get(cleanOptions);
				},

				get disable() {
					return disable();
				},

				get html() {
					return html();
				},

				get ariaLabel() {
					return ariaLabel();
				},
				onchange: handleSelect,
				get value() {
					return $.get(selectValue);
				},

				set value($$value) {
					$.set(selectValue, $$value, true);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(cleanOptions)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}