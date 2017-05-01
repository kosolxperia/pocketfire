console.log('in DatabaseDinningModule...');
var DatabaseDinningModule = (function($) {

    var firebaseRef = firebase.database().ref("DinningTable");

	var init = function() {

	};

	var get_data_dinning_table = function(){

        return firebaseRef.once('value', function(snapshot) {});
         // .once Always RETURN Promise!!!!
	};

	var run_fn_on_change = function(fn){
        // child change not return Prmomise !!!!
        firebaseRef.on('child_changed', function(data) {
            console.log('child change dinningtable...= '+JSON.stringify(data));
            fn(data);

		});

	};

	return {
        get_data_dinning_table: get_data_dinning_table,
        run_fn_on_change: run_fn_on_change
	};

})(jQuery);
