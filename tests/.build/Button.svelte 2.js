import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="button svelte-1ythfu8"> </button>`);

export default function Button($$anchor, $$props) {
	let text = $.prop($$props, 'text', 3, 'button'),
		type = $.prop($$props, 'type', 3, 'button'),
		disable = $.prop($$props, 'disable', 3, false);

	var button = root();
	var text_1 = $.child(button, true);

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'type', type());
		button.disabled = disable();
		$.set_text(text_1, text());
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);