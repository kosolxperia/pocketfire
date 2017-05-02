var ModuleViewMenu = (function($) {

	var change_quantity = false;
	var active_category;
	var tableNum;

	var init = function() {
		active_category = sessionStorage.activeCategory;
		tableNum = $('.table_num');
		sessionStorage.fromPage="view_menu";

		console.log('active category = '+ active_category);

		checkActiveTable();
		loadFirebaseData();
		onFirebaseChange();
		setEventBtnSummaryMenu();
		onPageHide();
	};

	var showCategoryName = function(snapshot){
		console.log('fn showCategoryName... snapshot= '+JSON.stringify(snapshot));

			snapshot.forEach(function(childSnapshot) {
				$('#category-name').html(childSnapshot.val().category_name);
			});
	};

	var checkActiveTable = function(){

		if(sessionStorage.activeTable){
			tableNum.html('โต๊ะ '+sessionStorage.activeTable);
		}else{
			tableNum.html('ไม่ได้เลือกโต๊ะ');
		}
	};

	var loadFirebaseData = function() {

		var today_orders;

		DatabaseTemp_OrdersModule.get_data_Temp_Orders_byTable(sessionStorage.activeTable)
		.then(function(snapshot){
			today_orders = DatabaseTemp_OrdersModule.filter_today_orders(snapshot);
		})
		.then(function(){
			DatabaseMenuModule.get_data_menu_byId(active_category)
			.then(function(snapshot){
				UIUpdateListViewMenu(snapshot);
				UIUpdatePendingOrders(today_orders);
			});
		});

		DatabaseCategoryModule.get_data_category_byId(active_category)
		.then(function(snapshot){
			showCategoryName(snapshot);
		});

	};

	var onFirebaseChange = function() {
		console.log('function onFirebaseChange....');
		DatabaseMenuModule.run_fn_on_change(UIUpdateMenu);

		//Temp_Orders
		DatabaseTemp_OrdersModule.set_active_table(sessionStorage.activeTable);
		DatabaseTemp_OrdersModule.run_fn_on_change(UIUpdateQuantity);
		DatabaseTemp_OrdersModule.run_fn_on_add(UIUpdatePendingOrders);
		DatabaseTemp_OrdersModule.run_fn_on_remove(UIRemoveOrders);
		return false;




	};

	var UIRemoveOrders = function(data) {
		//console.log('fn UIRemoveOrders....data = '+JSON.stringify(data));

		var orderKeys = Object.keys(data.val().order);
		var elm_quan;
		for(var i=0; i < orderKeys.length; i++){
			
			elm_quan = $('#'+orderKeys[i]+'quan');
			if(elm_quan.attr("data-childkey") == data.key){
				elm_quan.text("0");
				elm_quan.removeAttr("data-update_item");
				elm_quan.removeAttr("data-childkey");
			}
			//$('#'+orderKeys[i]+'quan').text("0");
			//$('#'+orderKeys[i]+'quan').removeAttr("data-update_item");
		//	$('#'+orderKeys[i]+'quan').removeAttr("data-childkey");
		}

	};

	var UIUpdateMenu = function(data){
		$('#' + data.key).text(data.val().menu_name);
		$('#' + data.key +'price').text(data.val().menu_price);
		$('#' + data.key +'img').attr('src','../' + data.val().menu_picture);
	};

	var UIUpdateListViewMenu = function(snapshot){
		console.log('run UIUdatelistviewmenu...');
		//	console.log(JSON.stringify(snapshot));
		var menuHtml='';

			snapshot.forEach(function(childSnapshot) {
				var childKey = childSnapshot.key;
				var childData = childSnapshot.val();

				menuHtml += '<li data-icon="false"><a class="link_menu">';
				menuHtml += '<img id="' + childKey +'img" src="../'+ childData.menu_picture +'"/>';
				menuHtml += '<h1 id="' + childKey +'">'+ childData.menu_name +'</h1>';
				menuHtml += '<p><span id="'+ childKey +'price">'+ childData.menu_price +'</span> บาท</p>';
				//menuHtml += '<span class="ui-li-count" id="'+ childKey +'" data-menu_id="'+ childKey +'">'+ '0'+'</span>';
				menuHtml += '<span class="ui-li-count" id="'+ childKey +'quan" data-menu_id="'+ childKey +'">'+ '0'+'</span>';
				menuHtml += '</a></li>';

			}); //for each


			$('#list_view_menu').append(menuHtml);
			$('#list_view_menu').listview('refresh');

			setEventListMenu();
			//add delay for loadcomplete then check pending order
			//checkPendingOrder();
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

	var setEventBtnSummaryMenu = function() {

		$("#btn_summary_menu").on("click",function(){
			console.log('button summary click...');
			if(change_quantity === true){
				// มีการเปลี่ยนแปลงออร์เดอร์ ให้ส่งข้อมูลออร์เดอร์ไปที่ฐานข้อมูลก่อน
				sendOrder();
				//$.mobile.changePage( "view_summary.html");
			}else {
				//ไม่มีการเปลี่ยนแปลงออร์เดอร์ ให้เปลี่ยน page ได้เลย
				//$.mobile.changePage("view_summary.html");


				$.mobile.changePage("view_summary.html", {
					changeHash: false
				});
			}

		}); //btn_summary_menu
	};

	var UIUpdateQuantity = function(data) {
		console.log('fn UIUpdateQuantity....'+JSON.stringify(data));

		var orderKeys = Object.keys(data.order);

		for(var i=0; i < orderKeys.length; i++){
			$('#'+orderKeys[i]+'quan').text(data.order[orderKeys[i]].quantity);
		}

	};

	var UIUpdatePendingOrders = function(childData) {
		console.log('data from UIUpdatePendingOrders = '+JSON.stringify(childData));

		var parentkeys = Object.keys(childData);
			console.log('obj contains ' + parentkeys.length + ' keys: '+  parentkeys);

			for (var i = 0; i < parentkeys.length; i++) {

				var order_time=childData[parentkeys[i]].time;
				console.log('order_time = '+order_time);
				var orderKeys = Object.keys(childData[parentkeys[i]].order);

					for (var i2 = 0; i2 < orderKeys.length; i2++) {
						console.log('ordekey = '+orderKeys[i2]);
						UIUpdateQuantity(childData[parentkeys[i]]);
						$('#'+orderKeys[i2]+"quan").attr('data-childkey',parentkeys[i]);
					} // for loop order key

				} // for loop parentkey

	};

	var sendOrder = function() {
		if(change_quantity === false){
			return false;
		}

		var have_data_from_firebase = false;

		console.log('sendOrder....');
		var firebaseRefUpdateTemp_Orders;
		var childkey; // for old order
		var jsonOrder = {};

		var current_time = moment().format('YYYY-MM-DD HH:mm:ss');

		jsonOrder.table_number = sessionStorage.activeTable;
		jsonOrder.time = current_time;
		jsonOrder.firebase_timestamp = firebase.database.ServerValue.TIMESTAMP;
		jsonOrder.order = [];

		var update_order = [];
		var menuId;
		var quan;

		var orderFromDB;
		var data_update;

		//prepare key for new order
		//var firebaseRefNewOrders=firebase.database().ref("Temp_Orders").push();
		var firebaseRefNewOrders = DatabaseTemp_OrdersModule.get_new_orders_id();

		$("#list_view_menu .ui-li-count[data-update_item]").each(function(index){
			// ห้ามกันการอัพเดท firebase ในฟังก์ชั่น each เพราะมันจะหลุดจาก context ทำให้ข้อมูลผิดพลาด
			menuId = $(this).attr("data-menu_id");
			quan = $(this).text();

			if($(this).attr("data-childkey")){

				// exits in Temp_Orders
				have_data_from_firebase  = true;
				console.log('found old order.......');
				childkey = $(this).attr("data-childkey");

				if(quan != "0"){
					//data_update = {
					update_order[menuId]={
						key: childkey,
						menu_id: menuId,
						quantity: quan,
						status: 'pending',
						edit_time: current_time
					};
					console.log('update_orders = '+JSON.stringify(update_order[menuId]));
					//DatabaseTemp_OrdersModule.update_orders(data_update);

				} else {
					//data_update = {
					update_order[menuId]={
						key: childkey,
						menu_id: menuId,
						quantity: quan,
						status: 'cancel',
						edit_time: current_time
					};

					//DatabaseTemp_OrdersModule.update_orders(data_update);
					// out of context jQuery !!!!!!

				}

			}

			else {

				$(this).attr("data-childkey", firebaseRefNewOrders.key);

				jsonOrder.order[menuId]= {
					quantity: quan,
					status: 'pending'
				}
			}  //end if if($(this).attr("data-childkey"))

		});  // list view menu each ******
		console.log('JSON ORDER = '+JSON.stringify(jsonOrder));

		DatabaseTemp_OrdersModule.update_orders(update_order);

		// save new order
		var keys = Object.keys(jsonOrder.order);
		if(keys.length > 0){
				DatabaseTemp_OrdersModule.set_new_orders(firebaseRefNewOrders, jsonOrder);
				//firebaseRefNewOrders.set(jsonOrder);
				console.log('save new order jsonOrder to DB');
		}

		change_quantity = false;
		$("#list_view_menu .ui-li-count").removeAttr("data-update_item");

		//$.mobile.changePage( "view_summary.html");
	};

	var onPageHide = function() {
		$(document).on("pagebeforehide", "#page-view_menu", function(){

			if(change_quantity === false){
				return false;
			}

			sendOrder();

		}); //before page hide
	};

	return {
		init: init
	};

})(jQuery);

$(document).on("pageinit", "#page-view_menu", function(){
	ModuleViewMenu.init();
});
