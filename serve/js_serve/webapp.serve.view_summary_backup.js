(function($){

		var firebaseRefMenu;
		var firebaseRefTemp_Orders;
		var menu_data;

		$(document).on("pageinit", "#page-view_summary", function(){
			var back_to_page;
			var header_table_num = $("#table_num");

			loadFirebaseData();

			function loadFirebaseData(){
				//console.log('run loadFirebaseData()...');

				// 1. โหลดดาต้าเบส Menu ก่อน
				firebaseRefMenu = firebase.database().ref("Menu");
				firebaseRefMenu.once('value', function(snapshot) {

						menu_data = snapshot.val();
						//console.log('menu_data = '+JSON.stringify(menu_data));
						//console.log('menu_data = ' + menu_data["M1"].menu_name);

						// delay
						// 2. โหลด temp_orders หลังจากโหลด Menu เสร็จแล้ว
						firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));

						firebaseRefTemp_Orders.once('value', function(snapshot) {
							UIUpdateListSummary(snapshot);
						});  //firebase once

						//

				});  //firebase once


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
