import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Container from "./Container.svelte.js";
import { getDefaults } from "./utils.js";

var root = $.from_html(`<h2> </h2>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="widget"><!></div>`);

export default function Widget($$anchor, $$props) {
	const // array with all options (see details)
	// JSON with properties
	// CSS variables for theming
	// if true all controls of the widget are disabled
	/* Ids for the labels this widget writes, so that the control under each label can name
	   itself with it. A page can hold several widgets and two labels must never share an id,
	   or a reader announces the wrong one - this is unique per component instance, and from
	   Svelte 5.22 the counter behind it lives on a window global, so it stays unique even on
	   a page which ended up with two separately bundled copies of the package. */
	uid = $.props_id();

	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		value = $.prop($$props, 'value', 15),
		labelWidth = $.prop($$props, 'labelWidth', 3, 13),
		colors = $.prop($$props, 'colors', 3, ''),
		disable = $.prop($$props, 'disable', 3, false);

	const warned = new Set();

	$.user_effect(() => {
		if (!$$props.options) return;

		if (!value()) {
			value(getDefaults($$props.options));

			return;
		}

		/* a binding may not receive 'undefined' - it throws in the control it is bound to. So
		   every option must have an entry, also when 'value' was made for an older, shorter
		   set of options and is now reused with a longer one */
		let missing = null;

		for (const id of Object.keys($$props.options)) {
			if (value()[id] !== undefined) continue;

			if ($$props.options[id].default === undefined) {
				if (!warned.has(id)) {
					warned.add(id);
					console.error(`Widget: option "${id}" has neither a value nor a "default", its control is not shown.`);
				}

				continue;
			}

			if (missing === null) missing = {};

			missing[id] = $$props.options[id].default;
		}

		if (missing !== null) value({ ...value(), ...missing });
	});

	/* the widget can only add to what an option already asks for, so that 'disable' set for a
	   single control is not lost when the whole widget stays enabled */
	const isDisabled = (opt) => disable() || opt.props?.disable === true;

	/* what 'hiddenWhen' and a label function are given. The effect above writes the defaults
	   into the bound object, but an effect runs after the render, so on the first pass 'value'
	   can still be missing the very entry a callback is about to read. Without this a
	   predicate reading a sibling would throw, and a control which should have been hidden
	   would mount for one frame - long enough for a control which corrects its own value in an
	   effect, like Number or Range, to write that correction back and change data the user
	   never touched. The controls stay bound to 'value' itself, only the callbacks see this */
	const effectiveValue = $.derived(() => {
		if (!$$props.options || !value()) return value() ?? {};

		let merged = null;

		for (const id of Object.keys($$props.options)) {
			/* an entry which is present but 'undefined' counts as missing, the same way the
			   effect above treats it - so it must not be left to shadow the default */
			if (value()[id] === undefined && $$props.options[id].default !== undefined) {
				if (merged === null) merged = { ...value() };

				merged[id] = $$props.options[id].default;
			}
		}

		/* once the effect has caught up nothing is missing, and the callbacks are handed the
		   bound object itself rather than a copy of it */
		return merged ?? value();
	});

	const failed = new Set();

	/**
	 * Decides whether one option is shown and what its label reads.
	 *
	 * Its callbacks are the consumer's code and run while the widget renders, so a throw
	 * would otherwise take every other control down with it. One that throws hides its own
	 * control and is reported once, which is how a descriptor with no usable value is
	 * already handled.
	 *
	 * @param {string} id - key of the option in 'options'.
	 * @param {object} opt - the option descriptor.
	 * @returns {{hidden: boolean, label?: *}}
	 */
	function resolve(id, opt) {
		try {
			/* 'hidden' and 'hiddenWhen' are combined with OR and neither can cancel the other:
			   'hidden' says the control is impossible for this data, 'hiddenWhen' says it does
			   not apply to what the user has currently selected. A single field taking either a
			   boolean or a function would let the second answer erase the first */
			if (opt.hidden || opt.hiddenWhen?.($.get(effectiveValue))) return { hidden: true };

			return {
				hidden: false,
				label: typeof opt.label === 'function' ? opt.label($.get(effectiveValue)) : opt.label
			};
		} catch(e) {
			if (!failed.has(id)) {
				failed.add(id);
				console.error(`Widget: option "${id}" has a callback which threw, its control is not shown.`, e);
			}

			return { hidden: true };
		}
	}

	var div = root_2();
	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					Container($$anchor, {
						get colors() {
							return colors();
						},

						children: ($$anchor, $$slotProps) => {
							var h2 = root();
							var text = $.child(h2, true);

							$.reset(h2);

							$.template_effect(() => {
								$.set_attribute(h2, 'id', `${uid}-title`);
								$.set_text(text, title());
							});

							$.append($$anchor, h2);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_1, ($$render) => {
					if (title()) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 18, () => Object.keys($$props.options), (id) => id, ($$anchor, id, i) => {
				const opt = $.derived(() => $$props.options[id]);
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				{
					var consequent_2 = ($$anchor) => {
						const shown = $.derived(() => resolve(id, $.get(opt)));
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							var consequent_1 = ($$anchor) => {
								Container($$anchor, {
									get name() {
										return $.get(opt).name;
									},

									get label() {
										return $.get(shown).label;
									},

									get id() {
										return `${uid}-${$.get(i) ?? ''}`;
									},

									get labelWidth() {
										return labelWidth();
									},

									get colors() {
										return colors();
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_5 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => isDisabled($.get(opt)));

											$.component(node_5, () => $.get(opt).el, ($$anchor, opt_el) => {
												opt_el($$anchor, $.spread_props(() => $.get(opt).props, {
													get disable() {
														return $.get($0);
													},

													get value() {
														return value()[id];
													},

													set value($$value) {
														value(value()[id] = $$value, true);
													}
												}));
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_4, ($$render) => {
								if (!$.get(shown).hidden) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.if(node_3, ($$render) => {
						if (value()[id] !== undefined) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (value()) $$render(consequent_3);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'role', title() && value() ? 'group' : undefined);
		$.set_attribute(div, 'aria-labelledby', title() && value() ? `${uid}-title` : undefined);
	});

	$.append($$anchor, div);
	$.pop();
}