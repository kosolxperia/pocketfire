(function($){

	function joinMenuData(obj1, obj2, keyname, parent_key) {
			for (var k in obj2) {
					if(k==keyname){
						//console.log('inside if p==keyname '+k);
						obj1[k].menu_data=obj2[k];
						obj1[k].parent_key=parent_key;
					} //  if(obj2[p]==keyname)
			} // for
			return obj1;
	}

var change_quantity = false;

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
							//console.log('orderSnap KEY = '+orderSnap)
							data_order_snap = orderSnap;
				}).then(function(){
							// 2. ดึงข้อมูลเมนู
							firebaseRefMenu.once('value').then(function(menuSnap){
								data_menu_snap = menuSnap;
							}).then(function(){
								// 3. เอาข้อมูลแต่ละออร์เดอร์มา join ข้อมูลเมนู
								data_order_snap.forEach(function(childSnapshot) {
									//console.log('ordersnap KEY = '+childSnapshot.key);
									var parent_key = childSnapshot.key;
									var child_order_snap = childSnapshot.val();

									for (var k in child_order_snap.order){
											keyname = k;
											//console.log('key ='+k);
											temp = joinMenuData(child_order_snap.order, data_menu_snap.val(), keyname, parent_key);
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
				console.log('in UILIstsummary...' +JSON.stringify(childData));

				var orderHtml='';

				var keys = Object.keys(childData);
				for (var i = 0; i < keys.length; i++) {
						var keyname = keys[i];
						orderHtml += '<li data-icon="false"><a class="link_menu"><h1>' + childData[keyname].menu_data.menu_name + '</h1>';
						orderHtml += '<span class="ui-li-count" data-menu_id="' + keyname +'" data-parentkey="'+ childData[keyname].parent_key +'">'+ childData[keyname].quantity +'</span></li>';
						orderHtml += '</a></li>';
				} // for (var i = 0)

				$('#list_summary').append(orderHtml);
				$('#list_summary').listview('refresh');
				setEventListMenu();
			}

		function updateOrder(){
			console.log('function updateOrder....');

			var menuId;
			var parentKey;
			var quan;
			var firebaseRefUpdateTemp_Orders;

			$("#list_view_menu .ui-li-count[data-update_item]").each(function(index){
				menuId = $(this).attr("data-menu_id");
				parentKey= $(this).attr("data-parentkey");
				quan = $(this).text();

				firebaseRefUpdateTemp_Orders = firebase.database().ref("Temp_Orders/"+parentKey+"/order/"+menuId);

				if(quan != "0"){

					firebaseRefUpdateTemp_Orders.set({
							quantity: quan,
							status: 'pending',
							edit_time: current_time
					});

				} else {
					firebaseRefUpdateTemp_Orders.set({
							quantity: quan,
							status: 'cancel',
							edit_time: current_time
					});
					//firebaseRefUpdateTemp_Orders.remove();
				}


			}); // list_view_menu .each

			//childkey = $(this).attr("data-childkey");
			//menuId = $(this).attr("data-menu_id");
			//newQuan = $(this).text();
		//	firebaseRefUpdateTemp_Orders = firebase.database().ref("Temp_Orders/"+childkey+"/order/"+menuId);


		}

		function setEventBtn(){
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

				if(change_quantity === true){
					updateOrder();
				}

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

		} // function setEventBtn


		function setEventListMenu(){

			$(".link_menu").on("tap", function(){
				console.log('tapppp ja');
				var quan_element = $(this).find("span.ui-li-count");
				var quantity = parseInt(quan_element.text());

				quan_element.text(++quantity);
				quan_element.attr("data-update_item","yes");

				//มีการเปลี่ยนแปลงออร์เดอร์ในรายการเมนู
				change_quantity = true;

			});//.link_menu tap

			$(".link_menu").on("swipeleft", function(){

				var quan_element = $(this).find("span.ui-li-count");
				var quantity = parseInt(quan_element.text());

				if(quantity === 0){
					return false;
				}

				if(quantity === 1){
					quan_element.text("0");
				}else {
					quan_element.text(--quantity);
				}
				quan_element.attr("data-update_item","yes");
				change_quantity = true;
			}); //.link_menu swipeleft

		} // function setEventListMenu




	}); // pageinit page-view_summary



})(jQuery);
