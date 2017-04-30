console.log('in DatabaseMenu...');
var DatabaseCategoryModule = (function($) {

    var firebaseRef = firebase.database().ref("DinningTable");

	var init = function() {

	};

	var get_data_category = function(){

        firebaseRef = firebase.database().ref("Category");

        return firebaseRef.once('value', function(snapshot) {

         });

         // .once Always RETURN Promise!!!!

	};

	var run_fn_on_change = function(fn){
        console.log('fn cate change...');
        // child change not return Prmomise !!!!
        firebaseRef.on('child_changed', function(data) {
            console.log('child change category...= '+JSON.stringify(data));
            //fn(data.key, data.val().category_name);
            fn(data);``
		});

	};

	return {
        get_data_category: get_data_category,
        run_fn_on_change: run_fn_on_change
	};

})(jQuery);
