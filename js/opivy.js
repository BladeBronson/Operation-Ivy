$(function() {
	OpIvy.init();
});

var OpIvy = {

	init: function() {
		// Basic editor setup
		try {
			// Use <b> instead of <span style="font-weight: bold">
			document.execCommand('styleWithCSS', false, false);
			// Don't render table editing controls
			document.execCommand("enableInlineTableEditing", false, false);
			// Don't render controls to resize objects
			document.execCommand("enableObjectResizing", false, false);
		} catch(error) {
			// OpIvy.util.log(error);
		}

		// Keyboard handling
		$('.OperationIvy')
			.keydown(OpIvy.events.keyDown)
			.keyup(OpIvy.events.keyUp);

		// Table module control menu
		$('.OpIvy-Table .control').live('mouseenter mouseleave', OpIvy.module.table.controlHover);
		
		// Menu clicking
		$('.OperationIvy .menu a').live('click', OpIvy.menu.click);
		
		// Toolbar buttons
		$('button.bold').click(function() {
			//document.execCommand('bold', false, false);
			OpIvy.execCommand('bold')
		});
		
	},
	
	
	/**
	 * Event handling object for editing. Modules have their own callbacks.
	 */
	events: {
	
		keyDown: function(e) {
			if (OpIvy.util.accessKeyTriggerIsPressed(e)) {
				// Issuing a command. Call keyCommand and return.
				OpIvy.keyCommand(e);
				return;
			}	
		
			// Special handling for keys
			switch(e.keyCode) {
				// Nothing yet
			}
		},
		
		keyUp: function(e) {
			// Only check for block ancestor if a key that produces or removes a character is pressed
			if ((e.keyCode >= 45 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 111) || (e.keyCode >= 186 && e.keyCode <=222)) {
				// Ensure text nodes have a block element ancestor
				OpIvy.util.checkForBlockAncestor(e);	
			} else {
				OpIvy.util.log('ignoring special keys (shift, ctrl, page up, etc)');
			}
		}
		
	},
		
	
	/**
	 * Handles accesskey keyboard commands
	 */
	keyCommand: function(e) {
		OpIvy.util.log('running keyCommand');
		e.preventDefault();
		OpIvy.util.log(e);
		switch (e.keyCode) {
			case 49: // 1
				document.execCommand('formatblock', false, 'h1');
				break;
			case 50: // 2
				document.execCommand('formatblock', false, 'h2');
				break;
			case 51: // 3
				document.execCommand('formatblock', false, 'h3');
				break;
			case 52: // 4
				document.execCommand('formatblock', false, 'h4');
				break;
			case 53: // 5
				document.execCommand('formatblock', false, 'h5');
				break;
			case 54: // 6
				document.execCommand('formatblock', false, 'h6');
				break;
			case 66: // b
				// document.execCommand('insertHTML', false, '<b></b>');
				/*
				OpIvy.util.switchBoldToStrong();
				document.execCommand('bold', false, false);
				OpIvy.util.switchStrongToBold();
				*/
				OpIvy.execCommand('bold');
				break;				
			case 73: // i
				//document.execCommand('insertHTML', false, '<i></i>');
				document.execCommand('italic', false, false);
				break;
			case 80: // p
				// document.execCommand('formatblock', false, 'p');
				document.execCommand('insertparagraph', false, false);
				break;
			case 84: // t
				OpIvy.module.add('table');
				break;
			case 186: // ;
				document.execCommand('insertunorderedlist', false, false);
				break;
			case 222: // '
				document.execCommand('insertorderedlist', false, false);
				break;
		}
	},
	
	execCommand: function(type) {
		switch (type) {
			case 'bold':
				OpIvy.util.switchBoldToStrong();
				document.execCommand('bold', false, false);
				OpIvy.util.switchStrongToBold();
				OpIvy.util.cleanUp();
				break;
			case 'bold_old':
				OpIvy.util.log('running fake bold execCommand');
				var selection = window.getSelection();
				var range = selection.getRangeAt(0); // TODO: loop through ranges
				OpIvy.util.log('selecton:');
				OpIvy.util.log(selection);
				OpIvy.util.log('range:');
				OpIvy.util.log(range);

				if (range.startContainer == range.endContainer) {
					// The range is within a single text node. Generate 1 bold element.

					var node = range.commonAncestorContainer;
					var start = range.startOffset;
					var end = range.endOffset;
	
					var nodeToWrap = node.splitText(start);
	
					nodeToWrap.splitText(end - start);
					
					$(nodeToWrap).wrap('<b></b>');
				} else {
					// The range crosses text nodes. Generate multiple bold elements.

						
					/*
					var nodeToWrap = range.startContainer.splitText(range.startOffset);
					$(nodeToWrap).wrap('<b></b>');
					
					range.endContainer.splitText(range.endOffset);
					$(range.endContainer).wrap('<b></b>');
					
					// Wrap text nodes between start and end
					// TODO: break this out into its own method
					var textNodes = OpIvy.getTextNodes(range.commonAncestorContainer);
					console.log(textNodes);
					*/

					var node = range.commonAncestorContainer;
					var nodeArray = [];

					var lookingFor = 'start';
					
					(function recursive(node, nodeArray) {
						$(node).contents().each(function() {
							if (lookingFor == 'exit') {
								return false;
							}
						
							// Found an element. Recur.
							if (this.nodeType == 1) {
								recursive(this, nodeArray);
								return true;
							} else if (this.nodeType == 3) {
								// ignore empty text nodes
								if ($.trim(this.textContent).length == 0) {
									return true;
								}
															
								if (this != range.startContainer && lookingFor == 'start') {
									return true;
								}
								
								if (this == range.startContainer && lookingFor == 'start') {
									lookingFor = 'end';
									nodeArray.push(this);
									return true;
								}
								
								nodeArray.push(this);
								
								if (this == range.endContainer && lookingFor == 'end') {
									lookingFor = 'exit';
									return false;
								}
							}
						});
					})(node, nodeArray);
					
					window.nodeArray = nodeArray;
					
					OpIvy.util.log(nodeArray);
					
				}
				
				break;
		}
	},
	
	/**
	 * @brief Extracts text nodes, pushes them to OpIvy.textNodes
	 * @param element HTML element for which to find text nodes
	 * @return array Array of textNodes to be operated upon
	 */
	getTextNodes: function(element) {
		var textNodes = [];

		(function recursive(element, textNodes) {
			$(element.childNodes).each(function() {
				if (this.nodeType == Node.TEXT_NODE) {
					// Ignore text nodes that only contain spaces or \n
					if ($.trim(this.textContent).length) {
						textNodes.push(this);
					}
				} else {
					recursive(this, textNodes);
				}
			});
		})(element, textNodes);
		
		return textNodes;		
	},
		
	module: {
		add: function(type) {
			var html = '';
			
			switch (type) {
				case 'table':
					html = $('#TEMPLATE-OpIvy-Table').html();
					break;
			}
			
			// Insert module as a child of article, immediately after the current element's ancestor tree
			var $parents = $(OpIvy.util.getCurrentNode()).parentsUntil('.OperationIvy');
			$(html).insertAfter($parents.last());
			
		},
		
		table: {
			controlHover: function() {
				if ($(this).children().length == 0) {
					// Add the control menu from template
					$(this).append($('#TEMPLATE-OpIvy-Table-Control-Menu').html());
					// Store current cell. It may be needed to perform relative actions
					$(this).closest('.OpIvy-Table').data('currentCell', $(OpIvy.util.getCurrentNode()).closest('td, th'));
				} else {
					// Destroy the menu
					$(this).html('');
				}
			}
		}
	},
	
	menu: {
		/**
		 * Handles clicks on menu items
		 */
		click: function(e) {
			e.preventDefault();
			OpIvy.menu[$(this).data('function')](e);
		},
		addRow: function(e) {
			var $tableWrapper = $(e.currentTarget).closest('.OpIvy-Table');
			var $table = $tableWrapper.find('table');
			var numberOfColumns = $table.find('tr')[0].cells.length;
			
			var html = '<tr>';
			for (var i = 0; i<numberOfColumns; i++) {
				html += '<td contenteditable="true"></td>';
			}
			html += '</tr>';
			
			$tableWrapper.data('currentCell').closest('tr').after(html);
		},
		deleteRow: function(e) {
			var $tableWrapper = $(e.currentTarget).closest('.OpIvy-Table');
			$tableWrapper.data('currentCell').closest('tr').remove();
			// If no more table cells, remove table
			if (!$tableWrapper.find('td').length) {
				$tableWrapper.remove();
			}
		},
		addColumn: function(e) {
			var $tableWrapper = $(e.currentTarget).closest('.OpIvy-Table');
			var $table = $tableWrapper.find('table');
			var cellIndex = $tableWrapper.data('currentCell').prevAll().length;
			
			$table.find('tr').each(function() {
				$(this).find('td').eq(cellIndex).after('<td contenteditable="true"></td>');
			});
		},
		deleteColumn: function(e) {
			var $tableWrapper = $(e.currentTarget).closest('.OpIvy-Table');
			var $table = $tableWrapper.find('table');
			var cellIndex = $tableWrapper.data('currentCell').prevAll().length;
			
			$table.find('tr').each(function() {
				$(this).find('td').eq(cellIndex).remove();
			});			
			// If no more table cells, remove table
			if (!$tableWrapper.find('td').length) {
				$tableWrapper.remove();
			}
		}
	},
	
	util: {
	
		/**
		 * Checks to see if text being typed has a block element ancestor
		 * Wraps text with <p> if no block ancestor is found
		 */
		checkForBlockAncestor: function(e) {
			var $node = $(OpIvy.util.getCurrentNode());
			if (!$node.parentsUntil('.OperationIvy', 'p').length) { // TODO: define list of block elements
				OpIvy.util.log('wrap it!');
				$node.wrap('<p></p>');
	
				// wrapping loses focus on contentEditable
				// create a range, collapse to end of range
			    var range = document.createRange();
			    range.selectNodeContents($node.get(0));
			    range.collapse(false);
			    // blow away any other ranges (shouldn't be any) and add this one
			    var sel = window.getSelection();
			    sel.removeAllRanges();
			    sel.addRange(range);
			} else {
				// OpIvy.util.log('no need to wrap it');
			}
		},
		
		/**
		 * Returns node where the cursor currently is
		 */
		getCurrentNode: function() {
			return window.getSelection().anchorNode;
		},
		
		/**
		 * Check to see if accesskey modifier(s) are pressed
		 */
		accessKeyTriggerIsPressed: function(e) {
			if ($.browser.mozilla) {
				if (e.ctrlKey && e.keyCode != 17) {
					return true;
				}						
			} else if ($.browser.webkit) {
				if (e.altKey && e.ctrlKey && !(e.keyCode == 17 || e.keyCode == 18)) {
					return true;
				}			
			} else if ($.browser.msie) {
				if (e.altKey && !(e.keyCode == 18)) {
					return true;
				}
			}
			
		},
		
		/**
		 * Used when running a bold command in IE
		 * Switches all bold tags to strong in order to use IE's native bolding functionality
		 */
		switchBoldToStrong: function() {
			if ($.browser.msie) {
				$('.OperationIvy b').replaceWith(function(){
					return $("<strong />").append($(this).contents());
				
				});
			}
		},
		
		/**
		 * Used when running a bold command in IE
		 * Switches all strong tags to bold in order to maintain consitent markup
		 */
		switchStrongToBold: function() {
			if ($.browser.msie) {
				$('.OperationIvy strong').replaceWith(function(){
					return $("<b />").append($(this).contents());
				
				});
			}
		},
				
		log: function(msg) {
			if (typeof console != 'undefined') {
				console.log(msg);
			}	
		},
		
		blockElements : ['p', 'div'],
		
		inlineElements : ['b', 'i', 'u', 'a']
	}
}