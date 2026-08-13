import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { clamp, snapToStep, toFiniteNumber, LabelIdKey } from './utils.js';

var root = $.from_html(`<div role="slider"><div><span> </span></div></div>`);

export default function Range($$anchor, $$props) {
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
		disable = $.prop($$props, 'disable', 3, false // if true the slider ignores any input
		),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, null // accessible name
		),
		onchange = $.prop($$props, 'onchange', 3, null // callback when value changes
		);

	/* a control which is not given an 'ariaLabel' of its own takes the label of the Container
	   it sits in, when that container was given an 'id' */
	const containerLabel = getContext(LabelIdKey);

	const labelledBy = $.derived(() => ariaLabel() ? undefined : containerLabel?.());

	/* the limits are derived and not used as they come, so that a slider stays usable when a
	   parent sends something odd. Declaration order matters: a derived which reads another
	   one has to come after it */
	const min = $.derived(() => toFiniteNumber(minProp(), 0));

	const max = $.derived(() => Math.max($.get(min), toFiniteNumber(maxProp(), 100)));

	const step = $.derived(() => stepProp() === undefined
		? ($.get(max) - $.get(min)) / 100
		: Math.abs(toFiniteNumber(stepProp(), ($.get(max) - $.get(min)) / 100)));

	const decNum = $.derived(() => Math.max(0, Math.min(20, Math.trunc(toFiniteNumber(decNumProp(), 1)))));

	/* value to draw and to report to assistive technology. It is derived and not taken from
	   'value' directly, so the slider is already right on the first render - the effect below
	   only corrects 'value' afterwards */
	const shown = $.derived(() => clamp(toFiniteNumber(value(), $.get(min)), $.get(min), $.get(max)));

	const width = $.derived(() => $.get(max) === $.get(min)
		? 100
		: ($.get(shown) - $.get(min)) / ($.get(max) - $.get(min)) * 100);

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

	let sliderContainer;
	let isDragging = $.state(false);

	/**
	 * Returns position of the event 'e' relative to the width of the slider, or NaN if it
	 * can not be determined
	 * @param e
	 */
	const getRelativePosition = (e) => {
		const rect = sliderContainer.getBoundingClientRect();

		if (rect.width === 0) return NaN;

		return (e.clientX - rect.x) / rect.width;
	};

	/**
	 * Returns value corresponding to the relative position 'p'
	 * @param p
	 */
	const computeValue = (p) => snapToStep($.get(min) + p * ($.get(max) - $.get(min)), $.get(min), $.get(max), $.get(step));

	/**
	 * Handler of changing start event
	 * @param e
	 */
	const startChanging = (e) => {
		if (disable()) return;

		const p = getRelativePosition(e);

		if (!Number.isFinite(p) || p < 0 || p > 1) return;

		// dragging starts only near the right edge of the slider, a click anywhere else
		// sets the value when the pointer is released
		$.set(isDragging, Math.abs(p * 100 - $.get(width)) < 5);

		if ($.get(isDragging)) e.currentTarget.setPointerCapture?.(e.pointerId);
	};

	/**
	 * Handler of changing cancel event
	 */
	const cancelChanging = () => {
		$.set(isDragging, false);
	};

	/**
	 * Handler of changing stop event
	 * @param e
	 */
	const stopChanging = (e) => {
		if (disable()) return;
		if ($.get(isDragging)) e.currentTarget.releasePointerCapture?.(e.pointerId);

		$.set(isDragging, false);

		const p = getRelativePosition(e);

		if (!Number.isFinite(p) || p < 0 || p > 1) return;

		setValue(computeValue(p));
	};

	/**
	 * Handler of event when changes are made by dragging an element
	 * @param e
	 */
	const changing = (e) => {
		if (disable() || !$.get(isDragging)) return;

		const p = getRelativePosition(e);

		if (!Number.isFinite(p)) return;

		setValue(computeValue(clamp(p, 0, 1)));
	};

	/**
	 * Handler of event when changes are made by mouse wheel
	 * @param e
	 */
	const changingByWheel = (e) => {
		if (disable()) return;

		setValue(snapToStep($.get(shown) + $.get(step) * e.deltaY * 0.5, $.get(min), $.get(max), $.get(step)));
		e.preventDefault();
	};

	/**
	 * Handler of event when changes are made by pressing arrows, 'Home' or 'End'
	 * @param e
	 */
	const changingByKeys = (e) => {
		if (disable()) return;

		let newValue;

		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') newValue = $.get(shown) - $.get(step); else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') newValue = $.get(shown) + $.get(step); else if (e.key === 'Home') newValue = $.get(min); else if (e.key === 'End') newValue = $.get(max); else return;

		e.preventDefault();
		setValue(snapToStep(newValue, $.get(min), $.get(max), $.get(step)));
	};

	var div = root();
	let classes;
	var div_1 = $.child(div);
	let classes_1;
	var span = $.child(div_1);
	let classes_2;
	var text = $.child(span, true);

	$.reset(span);
	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => sliderContainer = $$value, () => sliderContainer);

	$.template_effect(
		($0, $1) => {
			classes = $.set_class(div, 1, 'range-slider-container svelte-4pw54z', null, classes, { disabled: disable() });
			$.set_attribute(div, 'tabindex', disable() ? -1 : 0);
			$.set_attribute(div, 'aria-label', ariaLabel());
			$.set_attribute(div, 'aria-labelledby', $.get(labelledBy));
			$.set_attribute(div, 'aria-valuenow', $.get(shown));
			$.set_attribute(div, 'aria-valuemin', $.get(min));
			$.set_attribute(div, 'aria-valuemax', $.get(max));
			$.set_attribute(div, 'aria-valuetext', $0);
			$.set_attribute(div, 'aria-disabled', disable() || undefined);
			classes_1 = $.set_class(div_1, 1, 'range-slider svelte-4pw54z', null, classes_1, { 'range-slider_right': $.get(width) < 50 });
			$.set_style(div_1, `width:${$.get(width) ?? ''}%`);
			classes_2 = $.set_class(span, 1, 'range-value svelte-4pw54z', null, classes_2, { 'range-value_right': $.get(width) < 50 });
			$.set_text(text, $1);
		},
		[
			() => $.get(shown).toFixed($.get(decNum)),
			() => $.get(shown).toFixed($.get(decNum))
		]
	);

	$.delegated('keydown', div, changingByKeys);
	$.event('wheel', div, changingByWheel);
	$.delegated('pointerdown', div, startChanging);
	$.delegated('pointermove', div, changing);
	$.delegated('pointerup', div, stopChanging);
	$.event('pointercancel', div, cancelChanging);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'pointerdown', 'pointermove', 'pointerup']);