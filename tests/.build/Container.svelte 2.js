import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { LabelIdKey } from './utils.js';

var root = $.from_html(`<span class="label svelte-1isidbt"> </span>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Container($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, null),
		name = $.prop($$props, 'name', 3, ''),
		status = $.prop($$props, 'status', 3, ''),
		colors = $.prop($$props, 'colors', 3, ''),
		labelWidth = $.prop($$props, 'labelWidth', 3, 12),
		id = $.prop($$props, 'id', 3, null);

	/* the label is already on the screen, so a control inside this container should not have to
	   be given the same words again as its 'ariaLabel' - it reads this and points at the label
	   instead. Off unless an 'id' is given: a built-in default would be the same string in
	   every container, and two labels sharing an id make a reader announce the wrong one,
	   which is worse than announcing none */
	setContext(LabelIdKey, () => label() && id() ? id() : undefined);

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.child(span, true);

			$.reset(span);

			$.template_effect(() => {
				$.set_attribute(span, 'id', id() ?? undefined);
				$.set_style(span, `flex-basis:${labelWidth() ?? ''}ch;`);
				$.set_text(text, label());
			});

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `control-element ${name() ?? ''} ${status() ?? ''}`, 'svelte-1isidbt');
		$.set_style(div, colors());
		$.set_attribute(div, 'role', status() === 'error' ? 'alert' : undefined);
	});

	$.append($$anchor, div);
	$.pop();
}