import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { LabelIdKey } from './utils.js';

var root = $.from_html(`<button type="button" role="radio" tabindex="-1"><!></button>`);
var root_1 = $.from_html(`<div role="radiogroup"></div>`);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	let // array with all options
		value = $.prop($$props, 'value', 31, () => $.proxy($$props.options[0] // initial selected value
		)),
		className = $.prop($$props, 'className', 3, '' // extra class name
		),
		disable = $.prop($$props, 'disable', 3, false // if true the selector ignores any input
		),
		html = $.prop($$props, 'html', 3, false // if true the options are rendered as HTML
		),
		onchange = $.prop($$props, 'onchange', 3, null // callback when value changes
		),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, null // accessible name
		);

	/* a control which is not given an 'ariaLabel' of its own takes the label of the Container
	   it sits in, when that container was given an 'id' */
	const containerLabel = getContext(LabelIdKey);

	const labelledBy = $.derived(() => ariaLabel() ? undefined : containerLabel?.());

	function selectOption(option) {
		if (Object.is(option, value())) return;

		value(option);

		if (onchange()) onchange()(value());
	}

	/**
	 * Handler of event when changes are made by pressing left and right arrows
	 * @param e
	 */
	const changeOption = (e) => {
		if (disable()) return;

		if (e.key === 'ArrowLeft') {
			const ind = $$props.options.findIndex((v) => v === value());

			if (ind > 0) {
				selectOption($$props.options[ind - 1]);
			}

			return;
		}

		if (e.key === 'ArrowRight') {
			const ind = $$props.options.findIndex((v) => v === value());

			if (ind < $$props.options.length - 1) {
				selectOption($$props.options[ind + 1]);
			}

			return;
		}
	};

	var div = root_1();
	let classes;

	$.each(div, 20, () => $$props.options, (option) => option, ($$anchor, option) => {
		var button = root();
		let classes_1;
		var node = $.child(button);

		{
			var consequent = ($$anchor) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.html(node_1, () => option);
				$.append($$anchor, fragment);
			};

			var alternate = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, option));
				$.append($$anchor, text);
			};

			$.if(node, ($$render) => {
				if (html()) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(button);

		$.template_effect(
			($0) => {
				$.set_attribute(button, 'aria-checked', option === value());
				button.disabled = disable();
				classes_1 = $.set_class(button, 1, `option option_${$0 ?? ''}`, 'svelte-1w61u80', classes_1, { selected: option === value() });
			},
			[() => option.toString().replaceAll('.', '_')]
		);

		$.delegated('click', button, () => selectOption(option));
		$.append($$anchor, button);
	});

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `selector ${className() ?? ''}`, 'svelte-1w61u80', classes, { disabled: disable() });
		$.set_attribute(div, 'tabindex', disable() ? -1 : 0);
		$.set_attribute(div, 'aria-label', ariaLabel());
		$.set_attribute(div, 'aria-labelledby', $.get(labelledBy));
		$.set_attribute(div, 'aria-disabled', disable() || undefined);
	});

	$.delegated('keydown', div, changeOption);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'click']);