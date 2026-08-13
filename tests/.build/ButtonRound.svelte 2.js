import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button"></button>`);

export default function ButtonRound($$anchor, $$props) {
	let disable = $.prop($$props, 'disable', 3, false);
	var button = root();

	$.template_effect(() => {
		$.set_attribute(button, 'title', $$props.title);
		$.set_attribute(button, 'aria-label', $$props.title);
		button.disabled = disable();
		$.set_class(button, 1, `button ${$$props.className ?? ''}`, 'svelte-1ht2wfg');
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);