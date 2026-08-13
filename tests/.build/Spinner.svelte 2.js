import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="spinner svelte-xdz607" role="status"></div>`);

export default function Spinner($$anchor, $$props) {
	let label = $.prop($$props, 'label', 3, 'Loading');
	var div = root();

	$.template_effect(() => $.set_attribute(div, 'aria-label', label()));
	$.append($$anchor, div);
}