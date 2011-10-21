$(function() {
	document.execCommand("enableInlineTableEditing", false, false);
	document.execCommand("enableObjectResizing", false, false);
	
	$('article').mousedown(mousedown);
	$('article').mouseup(mouseup);
});

function mousedown(e) {
	if ($(e.target).closest('table').length == 0) {
		console.log('outside table');
		$('article').addClass('disable-table');
		$('article table').attr('contenteditable', 'false');
	}
}

function mouseup() {
	$('article').removeClass('disable-table');
	$('article table').attr('contenteditable', 'true');
}