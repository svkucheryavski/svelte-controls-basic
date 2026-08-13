import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { clamp, snapToStep, toFiniteNumber, LabelIdKey } from './utils.js';

var root = $.from_html(`<div role="slider"><div><span> </span></div></div>`);

export default function RangeDiscrete($$anchor, $$props) {
	$.push($$props, true);

	let minProp = $.prop($$props, 'min', 3, 0 // smallest value of the range
		),
		maxProp = $.prop($$props, 'max', 3, 10 // largest value of the range
		),
		value = $.prop($$props, 'value', 15),
		// selected value
		stepProp = $.prop($$props, 'step', 3, 1 // increment/decrement step
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

	/* see the comment in Range.svelte - the declaration order of the deriveds matters */
	const min = $.derived(() => toFiniteNumber(minProp(), 0));

	const max = $.derived(() => Math.max($.get(min), toFiniteNumber(maxProp(), 10)));
	const step = $.derived(() => Math.max(1, Math.round(Math.abs(toFiniteNumber(stepProp(), 1)))));

	/* value to draw and to report, always on the grid and inside the range */
	const shown = $.derived(() => snapToStep(toFiniteNumber(value(), $.get(min)), $.get(min), $.get(max), $.get(step)));

	const left = $.derived(() => $.get(max) === $.get(min)
		? 0
		: ($.get(shown) - $.get(min)) / ($.get(max) - $.get(min) + $.get(step)));

	const width = $.derived(() => $.get(step) / ($.get(max) - $.get(min) + $.get(step)));

	// if number of values smaller than 100 show stripes otherwise fill with solid color
	const styleStr = $.derived(() => $.get(max) < 100
		? `background: repeating-linear-gradient(to right, var(--bg-color-light, #f0f0f0), var(--bg-color-light, #f0f0f0), var(--bg-color-light, #f0f0f0) ${$.get(width) * 100}%, var(--bg-color-medium, #e0e0e0) ${$.get(width) * 100}%, var(--bg-color-medium, #e0e0e0) ${200 * $.get(width)}%)`
		: `background: var(--bg-color-light, #f0f0f0)`);

	function setValue(newValue) {
		if (Object.is(newValue, value())) return;

		value(newValue);

		if (onchange()) onchange()(value());
	}

	/* bring a missing, non-numeric, out of range or off grid value back onto the grid */
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
	 * Returns value whose slot on the track contains the relative position 'p'
	 * @param p
	 */
	const computeValue = (p) => {
		const slot = Math.floor(p * ($.get(max) - $.get(min) + $.get(step)) / $.get(step));

		return snapToStep($.get(min) + slot * $.get(step), $.get(min), $.get(max), $.get(step));
	};

	/**
	 * Handler of changing start event
	 * @param e
	 */
	const startChanging = (e) => {
		if (disable()) return;

		const p = getRelativePosition(e);

		if (!Number.isFinite(p) || p < 0 || p > 1) return;

		// dragging starts only on the handle itself
		$.set(isDragging, p > $.get(left) && p < $.get(left) + $.get(width), true);

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

		setValue(snapToStep($.get(shown) + Math.round(e.deltaY * 0.5) * $.get(step), $.get(min), $.get(max), $.get(step)));
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
		($0) => {
			classes = $.set_class(div, 1, 'range-slider-container range-slider-container_discrete svelte-1ytleou', null, classes, { disabled: disable() });
			$.set_attribute(div, 'tabindex', disable() ? -1 : 0);
			$.set_attribute(div, 'aria-label', ariaLabel());
			$.set_attribute(div, 'aria-labelledby', $.get(labelledBy));
			$.set_attribute(div, 'aria-valuenow', $.get(shown));
			$.set_attribute(div, 'aria-valuemin', $.get(min));
			$.set_attribute(div, 'aria-valuemax', $.get(max));
			$.set_attribute(div, 'aria-disabled', disable() || undefined);
			$.set_style(div, $.get(styleStr));

			classes_1 = $.set_class(div_1, 1, 'range-slider svelte-1ytleou', null, classes_1, {
				'range-slider_left': $.get(width) < 0.10 && $.get(left) < 0.5,
				'range-slider_right': $.get(width) < 0.10 && $.get(left) >= 0.5
			});

			$.set_style(div_1, `width: max(2px, ${$.get(width) * 100}%);left:${$.get(left) * 100}%;`);

			classes_2 = $.set_class(span, 1, 'range-value svelte-1ytleou', null, classes_2, {
				'range-value_right': $.get(width) < 0.10 && $.get(left) > 0.5,
				'range-value_left': $.get(width) < 0.10 && $.get(left) <= 0.5
			});

			$.set_text(text, $0);
		},
		[() => $.get(shown).toFixed(0)]
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