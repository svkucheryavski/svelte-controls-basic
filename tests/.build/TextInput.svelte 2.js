import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { LabelIdKey } from './utils.js';

var root = $.from_html(`<div class="error-message svelte-i90oxn"> </div>`);
var root_1 = $.from_html(`<div><input type="text" class="svelte-i90oxn"/> <!></div>`);

export default function TextInput($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, '' // initial selected value
		),
		className = $.prop($$props, 'className', 3, '' // extra class name
		),
		placeholder = $.prop($$props, 'placeholder', 3, '' // placeholder (hint)
		),
		maxLength = $.prop($$props, 'maxLength', 3, 25 // maximum number of characters
		),
		validator = $.prop($$props, 'validator', 3, null // validator callback, returns error message if value is not valid (empty if it is).
		),
		disable = $.prop($$props, 'disable', 3, false // if true the input ignores any input
		),
		onchange = $.prop($$props, 'onchange', 3, null // callback when value changes
		),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, null // accessible name
		);

	/* a control which is not given an 'ariaLabel' of its own takes the label of the Container
	   it sits in, when that container was given an 'id' */
	const containerLabel = getContext(LabelIdKey);

	const labelledBy = $.derived(() => ariaLabel() ? undefined : containerLabel?.());

	/* derived and not set from the input handler, so that a value or a validator replaced by
	   the parent does not leave an outdated message on the screen.
	
	   An empty field is never reported, so a form does not open covered in messages on the
	   fields nobody has filled in yet. That test is made on the value itself rather than on a
	   "this one has been edited" flag held by the component, because the input is destroyed
	   and built again every time it is hidden and shown - by a Widget's 'hiddenWhen', or by
	   any '{#if}' around it - and such a flag would come back cleared, leaving a field the
	   validator still rejects looking valid */
	const error = $.derived(() => {
		if (!validator() || value() === '' || value() === null || value() === undefined) return '';

		const msg = validator()(value());

		return typeof msg === 'string' ? msg : '';
	});

	function handleInput() {
		if (onchange()) onchange()(value());
	}

	var div = root_1();
	let classes;
	var input = $.child(div);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text = $.child(div_1, true);

			$.reset(div_1);
			$.template_effect(() => $.set_text(text, $.get(error)));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(error) !== '') $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `textinput ${className() ?? ''}`, 'svelte-i90oxn', classes, { error: $.get(error) !== '' });
		$.set_attribute(input, 'aria-label', ariaLabel());
		$.set_attribute(input, 'aria-labelledby', $.get(labelledBy));
		$.set_attribute(input, 'placeholder', placeholder());
		$.set_attribute(input, 'maxlength', maxLength());
		input.disabled = disable();
	});

	$.delegated('input', input, handleInput);
	$.bind_value(input, value);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);