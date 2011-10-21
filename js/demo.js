$(function() {
	Demo.init();
});

/**
 * Small set of functions for the Operation Ivy demo page
 */
var Demo = {
	updateSourceTimer: null,

	init: function() {
		// Repeatedly update the source viewer
		Demo.timer.start();	
		$('#Source').click(Demo.click);
	},
	
	/**
	 * Updates the source viewer with the contents of the article
	 */
	updateSource: function() {
		$('#Source').text($('.OperationIvy').html());
	},
	
	/**
	 * Handle clicks on the source viewer
	 */
	click: function() {
		if ($(this).height() < 200) {
			$(this).animate({
				height: 400
			}, 'fast');
			Demo.timer.stop();
		} else {
			$(this).animate({
				height: 50
			}, 'fast');
			Demo.timer.start();
		}
	},
	
	
	timer: {
		start: function() {
			Demo.updateSourceTimer = setInterval(Demo.updateSource, 500);	
		},
		stop: function() {
			clearInterval(Demo.updateSourceTimer);
		}
	}	
}