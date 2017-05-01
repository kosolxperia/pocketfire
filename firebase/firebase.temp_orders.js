console.log('in Temp_Orders category...');
var DatabaseTemp_OrdersModule = (function($) {

    var firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders");

	var init = function() {

	};

	//var get_data_category = function(){

      //  firebaseRef = firebase.database().ref("Category");

      //  return firebaseRef.once('value', function(snapshot) {

      //   });

         // .once Always RETURN Promise!!!!

	//};

  var get_data_Temp_Orders_byTable = function(activeTable){
    var firebaseRefTemp_Orders2 = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(activeTable));

    return firebaseRefTemp_Orders2.once('value', function(snapshot) {

     });
  };

	var run_fn_on_change = function(fn){
        console.log('fn Temp_Orders change...');
        // child change not return Prmomise !!!!
        firebaseRef.on('child_changed', function(data) {
            console.log('child change Temp_Orders...= '+JSON.stringify(data));
            fn(data);``
		});

	};

	return {
      //  get_data_category: get_data_category,
        run_fn_on_change: run_fn_on_change,
        get_data_Temp_Orders_byTable: get_data_Temp_Orders_byTable
	};

})(jQuery);
