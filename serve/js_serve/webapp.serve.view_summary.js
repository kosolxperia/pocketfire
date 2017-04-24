(function($){

	function joinMenuData(obj1, obj2, keyname) {
			for (var k in obj2) {
					if(k==keyname){
						//console.log('inside if p==keyname '+k);
						obj1[k].menu_data=obj2[k];
					} //  if(obj2[p]==keyname)
			} // for
			return obj1;
	}


		$(document).on("pageinit", "#page-view_summary", function(){
			var back_to_page;
			var header_table_num = $("#table_num");

			loadFirebaseData();
			setEventBtn();
			setFromPage();

			function loadFirebaseData(){

				var firebaseRefMenu;
				var firebaseRefTemp_Orders;
				var temp={};
				var order_join_menu_data = {};
				var keyname;
				var data_order_snap;
				var data_menu_snap;

				firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));
				firebaseRefMenu = firebase.database().ref("Menu");

				firebaseRefTemp_Orders.once('value')
				.then(function(orderSnap){
					 		// 1.. ดึงข้อมูลออร์เดอร์
							data_order_snap = orderSnap;
				}).then(function(){
							// 2. ดึงข้อมูลเมนู
							firebaseRefMenu.once('value').then(function(menuSnap){
								data_menu_snap = menuSnap;
							}).then(function(){
								// 3. เอาข้อมูลแต่ละออร์เดอร์มา join ข้อมูลเมนู
								data_order_snap.forEach(function(childSnapshot) {
									var child_order_snap = childSnapshot.val();

									for (var k in child_order_snap.order){
											keyname = k;
											//console.log('key ='+k);
											temp = joinMenuData(child_order_snap.order, data_menu_snap.val(), keyname);
											$.extend(order_join_menu_data, temp);
								 	} // for

									 //console.log('temp =' + JSON.stringify(temp));
									 console.log('order_temp_orders =' + JSON.stringify(order_join_menu_data));
								}); // data_order_snap.forEach

								 // 4. update UI
							   UIUpdateListSummary(order_join_menu_data);
							}); // then menu

						});  // then temp_orders

			} // function loadFirebaseData()

			function setFromPage(){
				//หากมาจาก page ดูรายเมนูอาหารให้ใส่ id ประเภทอาหารไว้ในแอตทริบิวต์ data-cat_id
				if(sessionStorage.fromPage == "view_menu"){
					header_table_num.attr("data-cat_id", sessionStorage.activeCategory);
					header_table_num.text(sessionStorage.activeTable);
				} else {
					header_table_num.text(sessionStorage.activeTable);
				}

			}


			function UIUpdateListSummary(childData){
				//var childData = order_temp_orders;
				console.log('run UIUdatelistSummary...');
				//console.log('in UILIstsummary...' +JSON.stringify(childData["M1"].menu_data.menu_name));

				var orderHtml='';

				var keys = Object.keys(childData);
				for (var i = 0; i < keys.length; i++) {
						var keyname = keys[i];
						orderHtml += '<li data-icon="false"><h1>' + childData[keyname].menu_data.menu_name + '</h1>';
						orderHtml += '<span class="ui-li-count" data-menu_id="' + keyname +'">'+ childData[keyname].quantity +'</span></li>';
						orderHtml += '</li>';
				} // for (var i = 0)

				$('#list_summary').append(orderHtml);
				$('#list_summary').listview('refresh');
			}


		function 	setEventBtn(){
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

		}




	}); // pageinit page-view_summary



})(jQuery);
