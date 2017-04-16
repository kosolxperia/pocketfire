(function($){

	var change_quantity = false;


	$(document).on("pageinit", "#page-view_menu", function(){
		var active_category = parseInt(sessionStorage.activeCategory);
		console.log('active category = '+ active_category);

		// .equalTo use integer data !!!!
		var firebaseRef = firebase.database().ref("Menu").orderByChild("category_id").equalTo(active_category);
		var tableNum;
		checkActiveTable();
		//checkActiveCategory();

		loadFirebaseData();
		onFirebaseChange();
		showCategoryName();
		setEventBtnSummaryMenu();

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
			console.log('run loadFirebaseData()...');
			firebaseRef.once('value', function(snapshot) {
				UIUpdateListViewMenu(snapshot);
			});  //firebase once

		}

		function onFirebaseChange(){

			firebaseRef.on('child_changed', function(data) {
				console.log('child change '+ data.key + ' and ' + data.val().category_name);
					//$('#'+data.key).text(data.val().category_name);
					UIUpdateMenuName(data.key, data.val());
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
				menuHtml += '<p><span id="'+ childKey +'price">'+ childData.menu_price +'</span> บาท</p>';
				menuHtml += '<span class="ui-li-count" data-menu_id="'+ childKey +'">'+ '0'+'</span>';
				menuHtml += '</a></li>';

			}); //for each
			//console.log(menuHtml);
			$('#list_view_menu').append(menuHtml);
			$('#list_view_menu').listview('refresh');

			setEventListMenu();
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
		var firebaseRef4 = firebase.database().ref("Temp_Orders");
		
	}

	function sendOrder(){

		var firebaseRef3 = firebase.database().ref("Temp_Orders")
		console.log('sendOrder....');
		var jsonOrder = {};

		var d = new Date();
		var current_time = d.getFullYear()+"-"+ d.getMonth()+"-"+d.getDate()+" "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
		jsonOrder.table_number = sessionStorage.activeTable;
		jsonOrder.time = current_time;
		jsonOrder.order = [];

		$("#list_view_menu .ui-li-count[data-update_item]").each(function(index){
			jsonOrder.order.push({
									menu_id: $(this).attr("data-menu_id"),
									quantity: $(this).text()
								 });

		});
		//แปลงข้อมูลชนิดออบเจ็กตให้เป็นข้อมูล JSON
		//jsonOrder = JSON.stringify(jsonOrder);
		//console.log(jsonOrder);

		firebaseRef3.push(jsonOrder);
		console.log('send order success');

		//$.mobile.changePage( "view_summary.html");

	}

/*
	$(document).on("pagebeforehide", "#page-view_menu", function(){

		if(change_quantity === false){
			return false;
		}

		var json_order = createJSON_Order();

		$.ajax({
			type: "POST",
			url: "send_order.php",
			data: { "order": json_order },
			success: function(data){

				change_quantity = false;

			},
			error: function() {
				alert("เกิดข้อผิดพลาด");
			}
		});
*/
	});



})(jQuery);
