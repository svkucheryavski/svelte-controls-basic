import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ButtonRound from "./ButtonRound.svelte.js";

export default function ButtonAdd($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, 'Add'),
		disable = $.prop($$props, 'disable', 3, false);

	ButtonRound($$anchor, {
		get title() {
			return title();
		},

		get disable() {
			return disable();
		},

		get onclick() {
			return $$props.onclick;
		},
		className: 'button-add'
	});
}