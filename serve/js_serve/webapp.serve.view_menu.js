var ModuleViewMenu = (function($) {

	//var firebaseRefMenu;
	//var firebaseRef2;
	var change_quantity = false;
	//var firebaseRefMenu;
	//var firebaseRefTemp_Orders;
	var active_category;
	var tableNum;

	var init = function() {
		active_category = sessionStorage.activeCategory;
		tableNum = $('.table_num');
		sessionStorage.fromPage="view_menu";

		console.log('active category = '+ active_category);

		checkActiveTable();
		loadFirebaseData();
		//onFirebaseChange();
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
	//	tableNum = $('.table_num');

		if(sessionStorage.activeTable){
			tableNum.html('โต๊ะ '+sessionStorage.activeTable);
		}else{
			tableNum.html('ไม่ได้เลือกโต๊ะ');
		}
	};

	var loadFirebaseData = function() {

		DatabaseMenuModule.get_data_menu_byId(active_category)
		.then(function(snapshot){
			UIUpdateListViewMenu(snapshot);
		}).then(function(){
				DatabaseTemp_OrdersModule.get_data_Temp_Orders_byTable(sessionStorage.activeTable)
				.then(function(snapshot){

					var today =DatabaseTemp_OrdersModule.filter_today_orders(snapshot);
					console.log('today return = '+JSON.stringify(today));
					checkPendingOrder(today);

					//checkPendingOrder(snapshot);
				});
		});

		DatabaseCategoryModule.get_data_category_byId(active_category)
		.then(function(snapshot){
			showCategoryName(snapshot);
		});


		//firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));

	};

	var onFirebaseChange = function() {
		console.log('function onFirebaseChange....');
		DatabaseMenuModule.run_fn_on_change(UIUpdateMenu);

		//Temp_Orders
		firebaseRefTemp_Orders.on('child_changed', function(data) {

			var childData = data.val();
			console.log('child CHANGE childData = '+JSON.stringify(childData));

			var keys = Object.keys(childData.order);
			//console.log('key.length = '+keys.length);
			for (var i = 0; i < keys.length; i++) {
					var keyname = keys[i];
					UIUpdateQuantity(keyname, childData.order[keyname].quantity);
			}
		});

		//ar fix
		//http://stackoverflow.com/questions/11788902/firebase-child-added-only-get-child-added
		firebaseRefTemp_Orders.on('child_added', function(data) {
			var now = moment();
			var diffDays;
			var childData = data.val();
			//console.log('child ADD childData = '+JSON.stringify(childData));
			console.log('child ADD');

			var keys = Object.keys(childData.order);
			for (var i = 0; i < keys.length; i++) {
					var keyname = keys[i];
					var order_time=childData.time;
				//	order_time=order_time.substr(0,order_time.indexOf(' '));
				var firebasetime=moment(childData.firebase_timestamp);
				var diff = moment().diff(firebasetime, 'seconds');
				console.log('diff in child Add = '+diff);

					//if (now.diff(order_time, 'days') > 0) {
					if(parseInt(diff) > 5){
					console.log('found very old order > 5 seconds = '+keys+" " +childData.time.substr(0,childData.time.indexOf(' '), 'days'));
					continue;

					}

				console.log('**** call UIUpdateQuantity from event child ADD ****');

				UIUpdateQuantity(keyname, childData.order[keyname].quantity);
			}

		});

		firebaseRefTemp_Orders.on('child_removed', function(oldChildSnapshot) {
		  console.log('child REMOVED = '+ console.log(JSON.stringify(oldChildSnapshot)));
		});
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

	var UIUpdateQuantity = function(menu_id, quantity) {
		console.log('fn UIUpdateQuantity.... quantitiy = '+quantity + ' menu_id ='+menu_id);
		$('#'+menu_id+'quan').text(quantity);
	};

	var checkPendingOrder = function(childData) {

				//var keys = Object.keys(childData.order);
				var parentkeys = Object.keys(childData);
				console.log('obj contains ' + parentkeys.length + ' keys: '+  parentkeys);

				//return false;

				for (var i = 0; i < parentkeys.length; i++) {

						var order_time=childData[parentkeys[i]].time;
						console.log('order_time = '+order_time);
						//continue;

						var orderKeys = Object.keys(childData[parentkeys[i]].order);

						for (var i2 = 0; i2 < orderKeys.length; i2++) {
							console.log('ordekey = '+orderKeys[i2]);
							UIUpdateQuantity(orderKeys[i2], childData[parentkeys[i]].order[orderKeys[i2]].quantity);
							//console.log('key is ' + childSnapshot.key);
							$('#'+orderKeys[i2]+"quan").attr('data-childkey',parentkeys[i]);
						} // for loop order key
					//var keyname = parentkeys[i];



					// set key เพื่อให้รู้ว่าข้อมูลนี้มาจากดาต้าเบส


				} // for loop parentkey

	};

	var sendOrder = function() {
		if(change_quantity === false){
			return false;
		}

		var have_data_from_firebase = false;

		//firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders");
		console.log('sendOrder....');
		var firebaseRefUpdateTemp_Orders;
		var childkey; // for old order
		var jsonOrder = {};

	//	var d = new Date();
	//	var current_time = d.getFullYear()+"-"+ d.getMonth()+"-"+d.getDate()+" "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
		var current_time = moment().format('YYYY-MM-DD HH:mm:ss');

		jsonOrder.table_number = sessionStorage.activeTable;
		jsonOrder.time = current_time;
		jsonOrder.firebase_timestamp = firebase.database.ServerValue.TIMESTAMP;
		jsonOrder.order = [];

		var update_order = [];
		var menuId;
		var quan;

		var orderFromDB;

		//prepare key for new order
		var firebaseRefNewOrders=firebase.database().ref("Temp_Orders").push();

		$("#list_view_menu .ui-li-count[data-update_item]").each(function(index){
		//$("#list_view_menu .ui-li-count").each(function(index){

			menuId = $(this).attr("data-menu_id");
			quan = $(this).text();

			if($(this).attr("data-childkey")){
			//if($(this).attr("data-childkey") && $(this).attr("data-update_item")){

				// exits in Temp_Orders
				have_data_from_firebase  = true;
				console.log('found old order.......');
				childkey = $(this).attr("data-childkey");
				//menuId = $(this).attr("data-menu_id");
				//newQuan = $(this).text();
				firebaseRefUpdateTemp_Orders = firebase.database().ref("Temp_Orders/"+childkey+"/order/"+menuId);

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
			//firebase.database().ref("Temp_Orders/"+childkey+"/order/M3").remove();

			}
			//ar fix 18-4-60  19.35
			//else if(!$(this).attr("data-childkey") && $(this).attr("data-update_item")){
			else {
			//else{
				$(this).attr("data-childkey", firebaseRefNewOrders.key);

				jsonOrder.order[menuId]= {
					quantity: quan,
					status: 'pending'
				}
			}  //end if if($(this).attr("data-childkey"))

		});  // list view menu each ******
		console.log('JSON ORDER = '+JSON.stringify(jsonOrder));

		// save new order
		var keys = Object.keys(jsonOrder.order);
		if(keys.length > 0){
				//firebase.database().ref("Temp_Orders").push(jsonOrder);
				firebaseRefNewOrders.set(jsonOrder);
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
