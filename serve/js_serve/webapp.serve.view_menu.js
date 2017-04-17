(function($){

	var change_quantity = false;
	var firebaseRefMenu;
	var firebaseRefTemp_Orders;

	$(document).on("pageinit", "#page-view_menu", function(){
		var active_category = parseInt(sessionStorage.activeCategory);
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

			firebaseRefMenu.on('child_changed', function(data) {
				console.log('child change '+ data.key + ' and ' + data.val().category_name);
					//$('#'+data.key).text(data.val().category_name);
					UIUpdateMenuName(data.key, data.val());
			});


			//Temp_Orders
			firebaseRefTemp_Orders.on('child_changed', function(data) {
			var childData = data.val();
			console.log('child CHANGE childData = '+JSON.stringify(childData));

			var arrayLength = childData.order.length;
			for (var i = 0; i < arrayLength; i++) {

				console.log(childData.order[i].menu_id + ' and ' + childData.order[i].quantity );
				UIUpdateQuantity(childData.order[i].menu_id, childData.order[i].quantity);

			}

			});

			firebaseRefTemp_Orders.on('child_added', function(data) {
			var childData = data.val();
			//console.log('child ADD childData = '+JSON.stringify(childData));
			console.log('child ADD');
			var arrayLength = childData.order.length;
			for (var i = 0; i < arrayLength; i++) {

				//console.log(childData.order[i].menu_id + ' and ' + childData.order[i].quantity );
				UIUpdateQuantity(childData.order[i].menu_id, childData.order[i].quantity);

			}
			});


		}

		function UIUpdateMenuName(key, data){
				$('#' + key).text(data.menu_name);
				$('#' + key +'price').text(data.menu_price);
		}

		function UIUpdateListViewMenu(snapshot){

			console.log('run UIUdatelistviewmenu...');
		//	console.log(JSON.stringify(snapshot));
			var menuHtml='';

			snapshot.forEach(function(childSnapshot) {
				var childKey = childSnapshot.key;
				var childData = childSnapshot.val();
				//console.log(childData.menu_picture);

				menuHtml += '<li data-icon="false"><a class="link_menu">';
				menuHtml += '<img src="../'+ childData.menu_picture +'"/>';
				menuHtml += '<h1 id="' + childKey +'">'+ childData.menu_name +'</h1>';
				//menuHtml += '<h1>'+ childData.menu_name +'</h1>';
				menuHtml += '<p><span id="'+ childKey +'price">'+ childData.menu_price +'</span> บาท</p>';
				//menuHtml += '<span class="ui-li-count" id="'+ childKey +'" data-menu_id="'+ childKey +'">'+ '0'+'</span>';
				menuHtml += '<span class="ui-li-count" id="'+ childKey +'quan" data-menu_id="'+ childKey +'">'+ '0'+'</span>';
				menuHtml += '</a></li>';
	//alert($('#'+childKey).html());
			}); //for each
			//console.log(menuHtml);
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
		console.log('check pending order....');
		firebaseRefTemp_Orders = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable));
		firebaseRefTemp_Orders.once('value', function(snapshot) {

			snapshot.forEach(function(childSnapshot) {

				console.log('found pending order');
				//console.log(JSON.stringify(childSnapshot));

				var childData = childSnapshot.val();
				//console.log('childData = '+JSON.stringify(childData));

				var arrayLength = childData.order.length;
				for (var i = 0; i < arrayLength; i++) {

					console.log(childData.order[i].menu_id + ' and ' + childData.order[i].quantity );
					UIUpdateQuantity(childData.order[i].menu_id, childData.order[i].quantity);
					console.log('key is ' + childSnapshot.key);
					//	console.log('element is ='+$('#'+childSnapshot.key));
					//$('#'+childData.order[i].menu_id).attr('data-childkey',childSnapshot.key);
					$('#'+childData.order[i].menu_id+"quan").attr('data-childkey',childSnapshot.key);


				}

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

		var d = new Date();
		var current_time = d.getFullYear()+"-"+ d.getMonth()+"-"+d.getDate()+" "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
		jsonOrder.table_number = sessionStorage.activeTable;
		jsonOrder.time = current_time;
		jsonOrder.order = [];

		var update_order = [];
		var menuId;
		var quan;

		//$("#list_view_menu .ui-li-count[data-update_item]").each(function(index){
		$("#list_view_menu .ui-li-count").each(function(index){

			menuId = $(this).attr("data-menu_id");
			quan = $(this).text();

			if($(this).attr("data-childkey")){

				// exits in Temp_Orders
				have_data_from_firebase  = true;
				console.log('found old order.......');
				childkey = $(this).attr("data-childkey");
				//menuId = $(this).attr("data-menu_id");
				//newQuan = $(this).text();
				firebaseRefUpdateTemp_Orders = firebase.database().ref("Temp_Orders/"+childkey+"/order");

			}  //end if if($(this).attr("data-childkey"))


				if(quan!='0'){

					update_order.push({
							menu_id: menuId,
							quantity: quan,
							status: 'pending'
					});

					// เพิ่มตรงนี้เสมอ เพราะอาจจะเจอว่าเป็น order จาก ดาต้าเบสในลิสต์แถวล่างๆ ก็ได้
					jsonOrder.order.push({
							menu_id: menuId,
							quantity: quan,
							status: 'pending'
					});
				}

		});  // list view menu each ******

		// save new order
		if(have_data_from_firebase === true){
			// มีอย่างน้อยหนึ่งแถวในลิสต์ที่มาจากดาต้าเบส
			console.log('if have data from firebase and no new order');
			firebaseRefUpdateTemp_Orders.set(update_order);
			console.log(JSON.stringify(update_order));
			//console.log('update old order but no new order success');
			console.log('update old order but no new order success');
		}
		else if(have_data_from_firebase === false && jsonOrder.order.length > 0){
			// ไม่มีแถวใดในลิสต์ที่เป็นลิสต์จากดาต้าเบสเลย
			console.log('if all is new order');
			//firebaseRefTemp_Orders.push(jsonOrder);
			firebase.database().ref("Temp_Orders").push(jsonOrder);
			//firebaseRefUpdateTemp_Orders.push(jsonOrder);
			console.log(JSON.stringify(jsonOrder));
			console.log('add new order success (no OLD order)');

		}

		change_quantity = false;

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
