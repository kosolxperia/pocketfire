(function($){
	function extend(base) {
	    var parts = Array.prototype.slice.call(arguments, 1);
	    parts.forEach(function (p) {
	        if (p && typeof (p) === 'object') {
	            for (var k in p) {
	                if (p.hasOwnProperty(k)) {
	                    base[k] = p[k];
	                }
	            }
	        }
	    });
	    return base;
	}
		var firebaseRefMenu;
		var firebaseRefTemp_Orders;
		var menu_data;
		var order_join_menu_data = {};

		$(document).on("pageinit", "#page-view_summary", function(){
			var back_to_page;
			var header_table_num = $("#table_num");

			loadFirebaseData();

			function loadFirebaseData(){
				//console.log('run loadFirebaseData()...');
firebaseRefMenu = firebase.database().ref("Menu");
				firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));


firebaseRefTemp_Orders.once('value', function(childSnapshot) {

	var childData = childSnapshot.val();

var temp={};
   firebaseRefMenu.once('value', function(menuSnap) {
       // extend function: https://gist.github.com/katowulf/6598238
       //console.log( extend({}, childData.order, menuSnap.val()) );
			 temp=extend(temp, childData.order, menuSnap.val());
			 //order_join_menu_data.push(temp);
			 console.log('temp =' + JSON.stringify(temp));
			 temp=order_join_menu_data;
			 console.log(temp.M1);
			 //console.log('in loop extend' + JSON.stringify(order_join_menu_data);
			 //console.log('after extend ='+order_join_menu_data;
	 });

	 //console.log('after  ='+ JSON.stringify(order_join_menu_data));
console.log(temp.M1);
		$.each(order_join_menu_data, function(index, value){
			console.log(index + " and " +value);
		});
//console.log('order jon menu data  =' +order_join_menu_data[0].M1.menu_name);
 	//var keys = Object.keys(order_join_menu_data);
	/*
 	console.log('obj contains ' + keys.length + ' keys: '+  keys);
 	//var arrayLength = childData.order.length;
 	for (var i = 0; i < keys.length; i++) {
		var keyname = keys[i];
		UIUpdateListSummary(order_join_menu_data[keyname]);
 	}
*/

});
				/*
				// 1. โหลดดาต้าเบส Menu ก่อน
				firebaseRefMenu = firebase.database().ref("Menu");
				firebaseRefMenu.once('value', function(snapshot) {

						menu_data = snapshot.val();
						// delay
						// 2. โหลด temp_orders หลังจากโหลด Menu เสร็จแล้ว
						firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));

						firebaseRefTemp_Orders.once('value', function(snapshot) {
							UIUpdateListSummary(snapshot);
						});  //firebase once

				//

				});  //firebase once
				*/

			}

			//หากมาจาก page ดูรายเมนูอาหารให้ใส่ id ประเภทอาหารไว้ในแอตทริบิวต์ data-cat_id
			if(sessionStorage.fromPage="view_menu"){
				header_table_num.attr("data-cat_id", sessionStorage.activeCategory);
				header_table_num.text(sessionStorage.activeTable);
			} else {
				header_table_num.text(sessionStorage.activeTable);
			}

			function UIUpdateListSummary(snapshot){
				console.log('run UIUdatelistSummary...');
			//	console.log(JSON.stringify(snapshot));
				var orderHtml='';

				snapshot.forEach(function(childSnapshot) {
					var childKey = childSnapshot.key;
					var childData = childSnapshot.val();

					var keys = Object.keys(childData.order);
					for (var i = 0; i < keys.length; i++) {
							var keyname = keys[i];
							orderHtml += '<li data-icon="false"><h1>' + menu_data[keyname].menu_name + '</h1>';
							orderHtml += '<span class="ui-li-count" data-menu_id="IDDDD">'+ childData.order[keyname].quantity +'</span></li>';
							orderHtml += '</li>';
					} // for (var i = 0)

				}); //for each

				$('#list_summary').append(orderHtml);
				$('#list_summary').listview('refresh');
			}

		$("#closebutton").on("click", function(){

			if(header_table_num.attr("data-cat_id")){
				back_to_page = "view_menu.html";
			}else {
				back_to_page = "view_category.html";
			}

			$.mobile.changePage(back_to_page, {
				changeHash: false,
				data: { cat_id: header_table_num.attr("data-cat_id"),
					   table_number: header_table_num.text() }
			});

		});

		$("#confirm_order").on("click", function(){
			$.ajax({
				type: "POST",
				url: "confirm_order.php",
				data: { "table_number": header_table_num.text() },

				success: function(data){

					$.mobile.changePage("view_table.php",{
						reloadPage: true
					});

				},

				error: function() {
					alert("เกิดข้อผิดพลาด");
				}
			});

		});



	}); // pageinit page-view_summary



})(jQuery);
