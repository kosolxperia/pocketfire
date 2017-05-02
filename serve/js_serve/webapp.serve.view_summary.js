var ViewSummaryModule = (function($) {

	var change_quantity = false;
	var back_to_page;
	var header_table_num;

	var init = function() {
		header_table_num = $("#table_num");
		loadFirebaseData();
		setEventBtn();
		setFromPage();
		//bindEvents();
	};

	var joinMenuData = function(obj1, obj2, keyname, parent_key){
		for (var k in obj2) {
				if(k==keyname){
					//console.log('inside if p==keyname '+k);
					obj1[k].menu_data=obj2[k];
					obj1[k].parent_key=parent_key;
				} //  if(obj2[p]==keyname)
		} // for
		return obj1;
	};

	var loadFirebaseData = function(){
		//var firebaseRefMenu;
	//	var firebaseRefTemp_Orders;
		var temp={};
		var order_join_menu_data = {};
		var keyname;
		var data_order_snap;
		var data_menu_snap;

		var today_orders;

		DatabaseTemp_OrdersModule.get_data_Temp_Orders_byTable(sessionStorage.activeTable)
		.then(function(snapshot){
			// 1.. ดึงข้อมูลออร์เดอร์
			today_orders = DatabaseTemp_OrdersModule.filter_today_orders(snapshot);
		})
		.then(function(){
			//DatabaseMenuModule.get_data_menu_byId(sessionStorage.activeCategory)
			DatabaseMenuModule.get_data_menu()
			.then(function(menuSnap){
				// 2. ดึงข้อมูลเมนู
				data_menu_snap = menuSnap;
				console.log('menuSnap = '+JSON.stringify(menuSnap));
			}).then(function(){
				// 3. เอาข้อมูลแต่ละออร์เดอร์มา join ข้อมูลเมนู
				var parentkeys = Object.keys(today_orders);
					console.log('obj contains ' + parentkeys.length + ' keys: '+  parentkeys);

					for (var i = 0; i < parentkeys.length; i++) {
						var parent_key = parentkeys[i];
						var child_order_snap = today_orders[parentkeys[i]].order;
						var orderKeys = Object.keys(today_orders[parentkeys[i]].order);

							for (var i2 = 0; i2 < orderKeys.length; i2++) {
								keyname = orderKeys[i2];
								temp = joinMenuData(today_orders[parentkeys[i]].order, data_menu_snap.val(), keyname, parent_key);
								$.extend(order_join_menu_data, temp);
								console.log('order_temp_orders =' + JSON.stringify(order_join_menu_data));
							} // for loop order key

						} // for loop parentkey

					 // 4. update UI
					 UIUpdateListSummary(order_join_menu_data);
			  }); // then menu
		});


	};

	var setFromPage = function() {
		//หากมาจาก page ดูรายเมนูอาหารให้ใส่ id ประเภทอาหารไว้ในแอตทริบิวต์ data-cat_id
		if(sessionStorage.fromPage == "view_menu"){
			header_table_num.attr("data-cat_id", sessionStorage.activeCategory);
			header_table_num.text(sessionStorage.activeTable);
		} else {
			header_table_num.text(sessionStorage.activeTable);
		}
	};

	var UIUpdateListSummary = function(childData) {
		console.log('run UIUdatelistSummary...');
		console.log('in UILIstsummary...' +JSON.stringify(childData));

		var orderHtml='';

		var keys = Object.keys(childData);
		for (var i = 0; i < keys.length; i++) {
				var keyname = keys[i];
				console.log(keyname);
				orderHtml += '<li data-icon="false"><a class="link_menu"><h1>' + childData[keyname].menu_data.menu_name + '</h1>';
				orderHtml += '<span class="ui-li-count" data-menu_id="' + keyname +'" data-parentkey="'+ childData[keyname].parent_key +'">'+ childData[keyname].quantity +'</span></li>';
				orderHtml += '</a></li>';
		} // for (var i = 0)

		$('#list_summary').append(orderHtml);
		$('#list_summary').listview('refresh');
		setEventListMenu();
	};

	var updateOrder = function() {
		console.log('function updateOrder....');

		var menuId;
		var parentKey;
		var quan;

		var current_time = moment().format('YYYY-MM-DD HH:mm:ss');
		var data_update;

		$("#list_summary .ui-li-count[data-update_item]").each(function(index){

			menuId = $(this).attr("data-menu_id");
			parentKey= $(this).attr("data-parentkey");
			quan = $(this).text();

			if(quan != "0"){
				data_update = {
					key: parentKey,
					menu_id: menuId,
					quantity: quan,
					status: 'order',
					edit_time: current_time
				};
				DatabaseTemp_OrdersModule.update_orders(data_update);

			} else {

				data_update = {
					key: parentKey,
					menu_id: menuId
				};

				DatabaseTemp_OrdersModule.remove_orders(data_update);

			}


		}); // list_view_menu .each

	};

	var setEventBtn = function() {
		$("#closebutton").on("click", function(){

			if(change_quantity === true){
				updateOrder();
				change_quantity = false;
			}

			if(header_table_num.attr("data-cat_id")){
				back_to_page = "view_menu.html";
			}else {
				back_to_page = "view_category.html";
			}

			console.log('back to page = ' + back_to_page);
			$.mobile.changePage(back_to_page, {
				changeHash: false
			});

		});

		$("#confirm_order").on("click", function(){

			if(change_quantity === true){
				updateOrder();
				change_quantity = false;
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

	};

	var setEventListMenu = function() {
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
	};

	return {
		init: init
	};

})(jQuery);


$(document).on("pageinit", "#page-view_summary", function(){

	ViewSummaryModule.init();

}); // pageinit page-view_summary
