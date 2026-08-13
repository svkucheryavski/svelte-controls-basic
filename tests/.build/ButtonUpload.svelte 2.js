import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ButtonRound from "./ButtonRound.svelte.js";

export default function ButtonUpload($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, 'Upload'),
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
		className: 'button-upload'
	});
}