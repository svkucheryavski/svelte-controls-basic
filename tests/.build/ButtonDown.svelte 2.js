import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ButtonRound from "./ButtonRound.svelte.js";

export default function ButtonDown($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, 'Move down'),
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
		className: 'button-down'
	});
}