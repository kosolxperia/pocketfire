console.log('in DatabaseMenu...');
var DatabaseMenuModule = (function($) {

  var firebaseRefMenu = firebase.database().ref("Menu")
  var init = function() {

	};

    var get_data_menu = function(){
        return firebaseRefMenu.once('value', function(snapshot) {

         });
    };

	var get_data_menu_byId = function(active_category){

      var firebaseRefMenu2 = firebase.database().ref("Menu").orderByChild("category_id").equalTo(active_category);

        return firebaseRefMenu2.once('value', function(snapshot) {

         });

         // .once Always RETURN Promise!!!!

	};

	var run_fn_on_change = function(fn){
        // child change not return Prmomise !!!!
        firebaseRefMenu.on('child_changed', function(data) {
            console.log('child change menu...= '+JSON.stringify(data));
            fn(data);

		});

	};

	return {
        get_data_menu: get_data_menu,
        get_data_menu_byId: get_data_menu_byId,
        run_fn_on_change: run_fn_on_change
	};

})(jQuery);
