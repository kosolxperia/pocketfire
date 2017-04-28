(function($){

	var change_quantity = false;
	var firebaseRefMenu;
	var firebaseRefTemp_Orders;

	$(document).on("pageinit", "#page-view_menu", function(){

		sessionStorage.fromPage="view_menu";

		var active_category = sessionStorage.activeCategory;
		console.log('active category = '+ active_category);

		// .equalTo use integer data !!!!
		firebaseRefMenu = firebase.database().ref("Menu").orderByChild("category_id").equalTo(active_category);
		var tableNum;
		checkActiveTable();

		loadFirebaseData();
		onFirebaseChange();
		showCategoryName();
		setEventBtnSummaryMenu();
		//checkPendingOrder();

		function showCategoryName(){

			//orderByKey use String!!!!
			var firebaseRef2 = firebase.database().ref("Category").orderByKey().equalTo(String(active_category));
			firebaseRef2.once('value', function(snapshot) {
				snapshot.forEach(function(childSnapshot) {
					$('#category-name').html(childSnapshot.val().category_name);
				});
			}); //once

		}

		function checkActiveTable(){
			tableNum = $('.table_num');

			if(sessionStorage.activeTable){
				tableNum.html('โต๊ะ '+sessionStorage.activeTable);
			}else{
				tableNum.html('ไม่ได้เลือกโต๊ะ');
			}

		}

		function loadFirebaseData(){
			//console.log('run loadFirebaseData()...');
			firebaseRefMenu.once('value', function(snapshot) {
					UIUpdateListViewMenu(snapshot);
			});  //firebase once

			firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));
			//firebaseRefTemp_Orders.orderByChild("time");
		}

		function onFirebaseChange(){
			console.log('function onFirebaseChange....');

			firebaseRefMenu.on('child_changed', function(data) {
				console.log('child change '+ data.key + ' and ' + data.val().category_name);
					//$('#'+data.key).text(data.val().category_name);
					UIUpdateMenu(data.key, data.val());
			});


			//Temp_Orders
			firebaseRefTemp_Orders.on('child_changed', function(data) {

				var childData = data.val();
				console.log('child CHANGE childData = '+JSON.stringify(childData));

				var keys = Object.keys(childData.order);
				for (var i = 0; i < keys.length; i++) {
						var keyname = keys[i];
					//console.log(childData.order[i].menu_id + ' and ' + childData.order[i].quantity );
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
						order_time=order_time.substr(0,order_time.indexOf(' '));

						if (now.diff(order_time, 'days') > 0) {
						console.log('found very old order = '+keys+" " +childData.time.substr(0,childData.time.indexOf(' '), 'days'));
						continue;

						}

					UIUpdateQuantity(keyname, childData.order[keyname].quantity);
				}

			});

			firebaseRefTemp_Orders.on('child_removed', function(oldChildSnapshot) {
			  console.log('child REMOVED = '+ console.log(JSON.Stringify(oldChildSnapshot)));
			});


		}

		function UIUpdateMenu(key, data){
				$('#' + key).text(data.menu_name);
				$('#' + key +'price').text(data.menu_price);
				$('#' + key +'img').attr('src','../' + data.menu_picture);

		}

		function UIUpdateListViewMenu(snapshot){

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
			checkPendingOrder();

		}

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

	}

	function setEventBtnSummaryMenu(){

		$("#btn_summary_menu").on("click",function(){
			console.log('button summary click...');
			if(change_quantity === true){
				// มีการเปลี่ยนแปลงออร์เดอร์ ให้ส่งข้อมูลออร์เดอร์ไปที่ฐานข้อมูลก่อน
				sendOrder();
				//$.mobile.changePage( "view_summary.html");
			}else {
				//ไม่มีการเปลี่ยนแปลงออร์เดอร์ ให้เปลี่ยน page ได้เลย
				$.mobile.changePage("view_summary.html");
			}

		}); //btn_summary_menu

	}

	function checkPendingOrder(){
		//return false;
		console.log('check pending order....');
		var now = moment();
		var diffDays;

		firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));
		firebaseRefTemp_Orders.once('value', function(snapshot) {
			console.log('snapshot = ' +JSON.stringify(snapshot));

			snapshot.forEach(function(childSnapshot) {

				console.log('found pending order');

				var childData = childSnapshot.val();
				//var childData = childSnapshot;
				console.log('test = ' +JSON.stringify(childData));
				//console.log('child val = ' +JSON.stringify(childData);
				//console.log('order key = ' +JSON.stringify(childData.order['M1'].quantity));
				console.log('AAAAA order menuid ='+childData.table_number);

				var keys = Object.keys(childData.order);
				console.log('obj contains ' + keys.length + ' keys: '+  keys);
				//var arrayLength = childData.order.length;
				for (var i = 0; i < keys.length; i++) {
						//alert(keys[i]);
						var order_time=childData.time;
						order_time=order_time.substr(0,order_time.indexOf(' '));
						//alert(now);
						//alert( now.diff(order_time, 'days'));
					if (now.diff(order_time, 'days') > 0) {
						console.log('found very old order = '+keys+" " +childData.time.substr(0,childData.time.indexOf(' '), 'days'));
						continue;

					}
					console.log('after if now diff');
						var keyname = keys[i];
					//	alert(childData.order[keyname]);
						//alert(childData.order[keyname].quantity);
					//console.log(childData.order[i].menu_id + ' and ' + childData.order[i].quantity );
				//	UIUpdateQuantity(childData.order[i].menu_id, childData.order[i].quantity);
					UIUpdateQuantity(keyname, childData.order[keyname].quantity);
					console.log('key is ' + childSnapshot.key);

					// set key เพื่อให้รู้ว่าข้อมูลนี้มาจากดาต้าเบส
					//$('#'+childData.order[i].menu_id+"quan").attr('data-childkey',childSnapshot.key);
					$('#'+keyname+"quan").attr('data-childkey',childSnapshot.key);

				} // for loop

			}); //for each
		});  //firebase once
	}

	function UIUpdateQuantity(menu_id, quantity){
		console.log('fn UIUpdateQuantity....');
		$('#'+menu_id+'quan').text(quantity);
	}

	function sendOrder(){

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

	}

	$(document).on("pagebeforehide", "#page-view_menu", function(){

		if(change_quantity === false){
			return false;
		}

		sendOrder();

	}); //before page hide



});

})(jQuery);
