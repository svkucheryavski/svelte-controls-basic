import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { clamp, snapToStep, toFiniteNumber, LabelIdKey } from './utils.js';

var root = $.from_html(`<div role="spinbutton"><span class="value svelte-1t8nhlt"> </span> <button type="button" aria-label="increase" tabindex="-1" class="button-small button-up svelte-1t8nhlt"><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" class="svelte-1t8nhlt"><polygon points="0,13 7,2 15,13, 0,13"></polygon></svg></button> <button type="button" aria-label="decrease" tabindex="-1" class="button-small button-down svelte-1t8nhlt"><svg width="100%" height="100%" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" class="svelte-1t8nhlt"><polygon points="0,2 7,13 15,2, 0,2"></polygon></svg></button></div>`);

export default function Number($$anchor, $$props) {
	$.push($$props, true);

	let minProp = $.prop($$props, 'min', 3, 0 // smallest value of the range
		),
		maxProp = $.prop($$props, 'max', 3, 100 // largest value of the range
		),
		value = $.prop($$props, 'value', 15),
		// selected value
		decNumProp = $.prop($$props, 'decNum', 3, 1 // number of decimals to show the current value
		),
		stepProp = $.prop($$props, 'step', 3, undefined // increment/decrement step
		),
		disable = $.prop($$props, 'disable', 3, false // if true the selector ignores any input
		),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, null // accessible name
		),
		onchange = $.prop($$props, 'onchange', 3, null // callback when value changes
		);

	/* a control which is not given an 'ariaLabel' of its own takes the label of the Container
	   it sits in, when that container was given an 'id' */
	const containerLabel = getContext(LabelIdKey);

	const labelledBy = $.derived(() => ariaLabel() ? undefined : containerLabel?.());

	/* the settings are derived and not used as they come, so the selector stays usable when a
	   parent sends something odd. Declaration order matters: a derived which reads another
	   one has to come after it */
	const min = $.derived(() => toFiniteNumber(minProp(), 0));

	const max = $.derived(() => Math.max($.get(min), toFiniteNumber(maxProp(), 100)));
	const decNum = $.derived(() => Math.max(0, Math.min(20, Math.trunc(toFiniteNumber(decNumProp(), 1)))));

	/* the step must be derived and not a default of $props() - the defaults are computed once,
	   so a step taken from 'decNum' would never follow a later change of it */
	const defaultStep = $.derived(() => $.get(decNum) === 0 ? 1 : Math.pow(10, -$.get(decNum)));

	const step = $.derived(() => {
		if (stepProp() === undefined) return $.get(defaultStep);

		const s = Math.abs(toFiniteNumber(stepProp(), $.get(defaultStep)));

		return s > 0 ? s : $.get(defaultStep);
	});

	/* value to show and to report to assistive technology. It is derived and not taken from
	   'value' directly, so the selector is already right on the first render - the effect
	   below only corrects 'value' afterwards */
	const shown = $.derived(() => clamp(toFiniteNumber(value(), $.get(min)), $.get(min), $.get(max)));

	function setValue(newValue) {
		if (Object.is(newValue, value())) return;

		value(newValue);

		if (onchange()) onchange()(value());
	}

	/* bring a missing, non-numeric or out of range value back into the range. This fires
	   'onchange' on purpose, so that a parent learns about the correction */
	$.user_effect(() => {
		if (!Object.is($.get(shown), value())) setValue($.get(shown));
	});

	function increase() {
		if (disable()) return;

		setValue(snapToStep($.get(shown) + $.get(step), $.get(min), $.get(max), $.get(step)));
	}

	function decrease() {
		if (disable()) return;

		setValue(snapToStep($.get(shown) - $.get(step), $.get(min), $.get(max), $.get(step)));
	}

	/**
	 * Handler of event when changes are made by pressing arrows, 'Home' or 'End'
	 * @param e
	 */
	function changingByKeys(e) {
		if (disable()) return;

		let newValue;

		if (e.key === 'ArrowDown') newValue = $.get(shown) - $.get(step); else if (e.key === 'ArrowUp') newValue = $.get(shown) + $.get(step); else if (e.key === 'Home') newValue = $.get(min); else if (e.key === 'End') newValue = $.get(max); else return;

		e.preventDefault();
		setValue(snapToStep(newValue, $.get(min), $.get(max), $.get(step)));
	}

	var div = root();
	let classes;
	var span = $.child(div);
	var text = $.child(span, true);

	$.reset(span);

	var button = $.sibling(span, 2);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			classes = $.set_class(div, 1, 'number-container svelte-1t8nhlt', null, classes, { disabled: disable() });
			$.set_attribute(div, 'tabindex', disable() ? -1 : 0);
			$.set_attribute(div, 'aria-label', ariaLabel());
			$.set_attribute(div, 'aria-labelledby', $.get(labelledBy));
			$.set_attribute(div, 'aria-valuenow', $.get(shown));
			$.set_attribute(div, 'aria-valuemin', $.get(min));
			$.set_attribute(div, 'aria-valuemax', $.get(max));
			$.set_attribute(div, 'aria-valuetext', $0);
			$.set_attribute(div, 'aria-disabled', disable() || undefined);
			$.set_text(text, $1);
			button.disabled = disable();
			button_1.disabled = disable();
		},
		[
			() => $.get(shown).toFixed($.get(decNum)),
			() => $.get(shown).toFixed($.get(decNum))
		]
	);

	$.delegated('keydown', div, changingByKeys);
	$.delegated('click', button, increase);
	$.delegated('click', button_1, decrease);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'click']);