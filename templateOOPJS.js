var Module = (function($) {

	var elmNetworkStatus;

	var init = function() {
		elmNetworkStatus = $('#span-network-status');
		bindEvents();
	};

	var bindEvents = function(){
		document.addEventListener("offline", onOffline, false);
		document.addEventListener("online", onOnline, false);
	};

	var onOffline = function(){
		elmNetworkStatus.append(navigator.connection.type + '<br>');
	};

	var onOnline = function() {
		elmNetworkStatus.append(navigator.connection.type + '<br>');
	};

	return {
		init: init
	};

})(jQuery);
