console.log('in Temp_Orders category...');
var DatabaseTemp_OrdersModule = (function($) {

    var firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders");

	var init = function() {

	};

    var get_data_Temp_Orders_byTable = function(activeTable){
        var firebaseRefTemp_Orders2 = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(activeTable));

        return firebaseRefTemp_Orders2.once('value', function(snapshot) {

         });
     };

    var filter_today_orders = function(snapshot){
        var now = moment();
        var diffDays;
        var todayOrders = {};
        snapshot.forEach(function(childSnapshot) {

        console.log('found pending order');

        var childData = childSnapshot.val();

        var keys = Object.keys(childData.order);
        console.log('obj contains ' + keys.length + ' keys: '+  keys);

        for (var i = 0; i < keys.length; i++) {
            var order_time=childData.time;
            order_time=order_time.substr(0,order_time.indexOf(' '));

            if (now.diff(order_time, 'days') > 0) {
                console.log('found very old order = '+keys+" " +childData.time.substr(0,childData.time.indexOf(' '), 'days'));
                continue;
            }

        var keyname = keys[i];

        todayOrders[childSnapshot.key] = childData;

      } // for loop

    }); //for each
      console.log('fn retrun today = '+JSON.stringify(todayOrders));
      return todayOrders;
  }

	var run_fn_on_change = function(fn){
        console.log('fn Temp_Orders change...');
        firebaseRefTemp_Orders.on('child_changed', function(data) {
            console.log('child change Temp_Orders...= '+JSON.stringify(data));
                    fn(data.val());
		});

	};

    var update_orders = function(data){
        var firebaseUpdate = firebase.database().ref("Temp_Orders/"+ data.key +"/order/"+ data.menu_id);
        firebaseUpdate.set({
            quantity: data.quantity,
            status: data.status,
            edit_time: data.edit_time
        });
    };

	return {
        run_fn_on_change: run_fn_on_change,
        get_data_Temp_Orders_byTable: get_data_Temp_Orders_byTable,
        filter_today_orders: filter_today_orders,
        update_orders: update_orders
	};

})(jQuery);
