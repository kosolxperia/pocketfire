console.log('in Database category...');
var DatabaseCategoryModule = (function($) {

    var firebaseRef = firebase.database().ref("Category");

	var init = function() {

	};

	var get_data_category = function(){

      //  firebaseRef = firebase.database().ref("Category");

        return firebaseRef.once('value', function(snapshot) {

         });

         // .once Always RETURN Promise!!!!

	};

  var get_data_category_byId = function(active_category){
    var firebaseRef2 = firebase.database().ref("Category").orderByKey().equalTo(String(active_category));

    return firebaseRef2.once('value', function(snapshot) {

     });
  };

	var run_fn_on_change = function(fn){
        console.log('fn cate change...');
        // child change not return Prmomise !!!!
        firebaseRef.on('child_changed', function(data) {
            console.log('child change category...= '+JSON.stringify(data));
            fn(data);``
		});

	};

	return {
        get_data_category: get_data_category,
        run_fn_on_change: run_fn_on_change,
        get_data_category_byId: get_data_category_byId
	};

})(jQuery);
