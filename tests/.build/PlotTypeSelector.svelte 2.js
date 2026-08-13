import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { LabelIdKey } from './utils.js';

var root = $.from_html(`<button type="button" role="radio" tabindex="-1"></button>`);
var root_1 = $.from_html(`<div role="radiogroup"></div>`);

export default function PlotTypeSelector($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 19, () => ['p', 'l', 'b', 'h', 'qq']),
		// list of types to show
		value = $.prop($$props, 'value', 31, () => $.proxy(options()[0] // default plot type
		)),
		disable = $.prop($$props, 'disable', 3, false // if true the selector ignores any input
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
			const ind = options().findIndex((v) => v === value());

			if (ind > 0) {
				selectOption(options()[ind - 1]);
			}

			return;
		}

		if (e.key === 'ArrowRight') {
			const ind = options().findIndex((v) => v === value());

			if (ind < options().length - 1) {
				selectOption(options()[ind + 1]);
			}

			return;
		}
	};

	const prefix = '<svg width="3em" height="1.5em" viewBox="0 0 32 20" fill="transparent" xmlns="http://www.w3.org/2000/svg">';

	const icons = {
		'bp': '<rect x="8" y="5" width="16" height="10" stroke-width="2"/><line x1="15" y1="14" x2="15" y2="4" stroke-width="2"/><line x1="30" y1="10" x2="25" y2="10" stroke-width="2"/><line x1="8" y1="10" x2="2" y2="10" stroke-width="2"/>',
		'hm': '<rect x="5" y="4" width="23" height="12"stroke-width="2"/><line x1="13" y1="16" x2="13" y2="3" stroke-width="2"/><line x1="21" y1="16" x2="21" y2="3" stroke-width="2"/><line x1="28" y1="10" x2="5" y2="10" stroke-width="2"/>',
		'l': '<path d="M4.23178 14.3598L15.5 5" stroke-width="2"/><line x1="14.4846" y1="5.17692" x2="26.4846" y2="10.1769" stroke-width="2"/>',
		'p': '<circle cx="6.5" cy="12.5" r="1" stroke-width="4"/><circle cx="15.2" cy="5.8" r="1" stroke-width="4"/><circle cx="25" cy="10" r="1" stroke-width="4"/>',
		'h': '<line x1="9" y1="15" x2="9" y2="9" stroke-width="6"/><line x1="17" y1="15" x2="17" y2="3" stroke-width="6"/><line x1="25" y1="15" x2="25" y2="7" stroke-width="6"/>',
		'qq': '<circle cx="6.5" cy="15.0" r="1" stroke-width="4"/><circle cx="15.2" cy="10" r="1" stroke-width="4"/><circle cx="25" cy="5.8" r="1" stroke-width="4"/>'
	};

	icons['b'] = icons['l'] + icons['p'];

	const titles = {
		'bp': 'boxplot',
		'hm': 'heatmap',
		'l': 'line',
		'p': 'scatter',
		'b': 'line + scatter',
		'h': 'bar',
		'qq': 'qq-plot'
	};

	/* look up icon and title only among own keys, so that an unknown option (or a key
	   inherited from Object.prototype) can not inject anything into the markup */
	const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

	const iconFor = (o) => hasOwn(icons, o) ? icons[o] : '';
	const titleFor = (o) => hasOwn(titles, o) ? titles[o] : undefined;
	var div = root_1();
	let classes;

	$.each(div, 20, options, (option) => option, ($$anchor, option) => {
		var button = root();
		let classes_1;

		$.html(button, () => prefix + iconFor(option) + '</svg>', true);
		$.reset(button);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(button, 'aria-checked', option === value());
				$.set_attribute(button, 'aria-label', $0);
				button.disabled = disable();
				classes_1 = $.set_class(button, 1, 'option svelte-1t0v0cu', null, classes_1, { selected: option === value() });
				$.set_attribute(button, 'title', $1);
			},
			[() => titleFor(option) ?? option, () => titleFor(option)]
		);

		$.delegated('click', button, () => selectOption(option));
		$.append($$anchor, button);
	});

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'selector plot-selector svelte-1t0v0cu', null, classes, { disabled: disable() });
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