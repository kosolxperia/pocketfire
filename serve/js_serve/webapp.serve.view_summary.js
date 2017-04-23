(function($){

	function MergeRecursive(obj1, obj2, keyname) {

  		for (var k in obj2) {
		  console.log('k in obj2 = ' +k);

		  if(k==keyname){
			  console.log('inside if p==keyname '+k);
			  obj1[k].menu_data=obj2[k];
				  } //  if(obj2[p]==keyname)

				} // for

  		return obj1;
	}

		var firebaseRefMenu;
		var firebaseRefTemp_Orders;
		var order_join_menu_data = {};
		var order_temp_orders={};

		$(document).on("pageinit", "#page-view_summary", function(){
			var back_to_page;
			var header_table_num = $("#table_num");

			loadFirebaseData();

			function loadFirebaseData(){

				var temp={};
				var keyname;

				var fb = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable)).once('value', function(orderSnap) {


					orderSnap.forEach(function(childSnapshot) {
						var child_order_snap=childSnapshot.val();
						//order_temp_orders={};

						   	firebase.database().ref("Menu").once('value', function(menuSnap) {

								   for (var k in child_order_snap.order){
									   keyname = k;
									   console.log('key ='+k);
								   }
								   //console.log('key order= '+childSnapshot.val().order)
								   temp=MergeRecursive(child_order_snap.order, menuSnap.val(), keyname);
								   $.extend(order_temp_orders,temp);
								   console.log('temp =' + JSON.stringify(temp));
								   return Promise.all(order_temp_orders);
						   	}).then(function(order_temp_orders){
						   			console.log('then order_temp_orders ='+ JSON.stringify(order_temp_orders));
								});

					  }); // orderSnap.forEach

				});// order temp .once

			} // function loadFirebaseData()

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
			console.log('order_temp_orders = '+ JSON.stringify(order_temp_orders));
			return false;
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
