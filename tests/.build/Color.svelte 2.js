import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { LabelIdKey } from './utils.js';

var root = $.from_html(`<label><input type="color" class="svelte-4ea5vp"/></label>`);

export default function Color($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, '#000000' // initial selected value
		),
		disable = $.prop($$props, 'disable', 3, false // if true the picker ignores any input
		),
		onchange = $.prop($$props, 'onchange', 3, null // callback when value changes
		),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, null // accessible name
		);

	/* a control which is not given an 'ariaLabel' of its own takes the label of the Container
	   it sits in, when that container was given an 'id' */
	const containerLabel = getContext(LabelIdKey);

	const labelledBy = $.derived(() => ariaLabel() ? undefined : containerLabel?.());

	function handleInput() {
		if (onchange()) onchange()(value());
	}

	var label = root();
	let classes;
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.reset(label);

	$.template_effect(() => {
		classes = $.set_class(label, 1, 'color-picker svelte-4ea5vp', null, classes, { disabled: disable() });
		$.set_style(label, `background-color:${value() ?? ''}`);
		$.set_attribute(input, 'aria-label', ariaLabel());
		$.set_attribute(input, 'aria-labelledby', $.get(labelledBy));
		input.disabled = disable();
	});

	$.delegated('input', input, handleInput);
	$.bind_value(input, value);
	$.append($$anchor, label);
	$.pop();
}

$.delegate(['input']);