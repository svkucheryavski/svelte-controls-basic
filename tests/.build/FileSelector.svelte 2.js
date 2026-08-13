import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ButtonCancel from './ButtonCancel.svelte.js';

var root = $.from_html(`<div class="error svelte-7h9cqf" role="alert"> </div>`);
var root_1 = $.from_html(`<div role="group"><label class="svelte-7h9cqf"><input type="file" class="svelte-7h9cqf"/> <span class="svelte-7h9cqf"> </span></label> <!> <!></div>`);

export default function FileSelector($$anchor, $$props) {
	$.push($$props, true);

	let file = $.prop($$props, 'file', 15),
		// container to get return the uploaded file
		message = $.prop($$props, 'message', 3, 'Select CSV file with dataset' // message to show when no file is selected
		),
		acceptType = $.prop($$props, 'acceptType', 3, '.csv' // file type to accept
		),
		multiple = $.prop($$props, 'multiple', 3, false),
		disable = $.prop($$props, 'disable', 3, false // if true the selector ignores any input
		);

	let fileInput = $.state(void 0);
	let dragCounter = $.state(0);
	let rejected = $.state('');
	let rejectTimer;

	/* set file from a FileList */
	function setFiles(files) {
		if (files && files.length > 0) {
			file(files.length === 1 ? files[0] : files);
		} else {
			file(null);
		}
	}

	/* change value for 'file' parameter when user selects or deselects file */
	function changeStatus() {
		setFiles($.get(fileInput)?.files);
	}

	/* check if a file matches the acceptType pattern */
	function isAccepted(f) {
		if (!acceptType()) return true;

		return acceptType().split(',').some((t) => {
			t = t.trim().toLowerCase();

			if (t.startsWith('.')) return f.name.toLowerCase().endsWith(t);
			if (t.endsWith('/*')) return f.type.toLowerCase().startsWith(t.slice(0, -1));

			return f.type.toLowerCase() === t;
		});
	}

	/* show rejection error for 1 second */
	function reject(msg) {
		clearTimeout(rejectTimer);
		$.set(rejected, msg, true);
		rejectTimer = setTimeout(() => $.set(rejected, ''), 1000);
	}

	/* handle file drop */
	function handleDrop(e) {
		e.preventDefault();
		$.set(dragCounter, 0);

		if (disable()) return;

		const allFiles = Array.from(e.dataTransfer.files);

		if (!multiple() && allFiles.length > 1) {
			reject('drop one file only');

			return;
		}

		const dropped = allFiles.filter(isAccepted);

		if (dropped.length === 0) {
			reject('wrong file type');

			return;
		}

		setFiles(multiple() ? dropped : [dropped[0]]);
	}

	/* resets selection */
	function reset() {
		if (disable()) return;

		$.get(fileInput).value = null;
		file(null);
	}

	var div = root_1();
	let classes;
	var label = $.child(div);
	var input = $.child(label);

	$.bind_this(input, ($$value) => $.set(fileInput, $$value), () => $.get(fileInput));

	var span = $.sibling(input, 2);
	var text = $.child(span, true);

	$.reset(span);
	$.reset(label);

	var node = $.sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			ButtonCancel($$anchor, {
				onclick: reset,
				get disable() {
					return disable();
				}
			});
		};

		$.if(node, ($$render) => {
			if (file()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();
			var text_1 = $.child(div_1, true);

			$.reset(div_1);
			$.template_effect(() => $.set_text(text_1, $.get(rejected)));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(rejected)) $$render(consequent_1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'file-selector svelte-7h9cqf', null, classes, {
			selected: file(),
			dragging: $.get(dragCounter) > 0,
			rejected: $.get(rejected) !== '',
			disabled: disable()
		});

		$.set_attribute(input, 'accept', acceptType());
		input.disabled = disable();
		input.multiple = multiple();

		$.set_text(text, file()
			? file().length > 1 ? `Selected ${file().length} files` : file().name
			: message());
	});

	$.event('dragenter', div, (e) => {
		e.preventDefault();

		if (!disable()) $.update(dragCounter);
	});

	$.event('dragleave', div, () => {
		if ($.get(dragCounter) > 0) $.update(dragCounter, -1);
	});

	$.event('dragover', div, (e) => e.preventDefault());
	$.event('drop', div, handleDrop);
	$.delegated('change', input, changeStatus);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);