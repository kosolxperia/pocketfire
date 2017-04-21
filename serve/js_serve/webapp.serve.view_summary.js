(function($){
	function extend(base) {
	    var parts = Array.prototype.slice.call(arguments, 1);
	    parts.forEach(function (p) {
	        if (p && typeof (p) === 'object') {
	            for (var k in p) {
					//console.log('k = '+k);
				//	console.log('p ='+JSON.stringify(p));
	                if (p.hasOwnProperty(k)) {
						//console.log("yes has own property k ja");
	                    base[k] = p[k];
						//console.log('base k = '+JSON.stringify(base[k])+" and p[k] = "+ JSON.stringify(p[k]));
	                }
	            }
	        }
	    });

		var parts2 = Array.prototype.slice.call(arguments, 3);
		console.log('part2 ='+JSON.stringify(parts2));
	    parts2.forEach(function (p2) {
			for (var k2 in p2) {
console.log('k2 ='+k2);
	console.log('p2 ='+JSON.stringify(p2));
			}

		});
	    return base;
	}
		var firebaseRefMenu;
		var firebaseRefTemp_Orders;
		var menu_data;
		var order_join_menu_data = {};

		$(document).on("pageinit", "#page-view_summary", function(){
			var back_to_page;
			var header_table_num = $("#table_num");

			loadFirebaseData();

			function loadFirebaseData(){
				//console.log('run loadFirebaseData()...');
var temp={};
var fb = firebase.database().ref("Temp_Orders").orderByChild("table_number").equalTo(String(sessionStorage.activeTable)).once('value', function(orderSnap) {

	orderSnap.forEach(function(childSnapshot) {

   firebase.database().ref("Menu").once('value', function(menuSnap) {
       // extend function: https://gist.github.com/katowulf/6598238
	   console.log('ordersnap.val= '+JSON.stringify(childSnapshot.val().order));
	    console.log('menusnap.val= '+JSON.stringify(menuSnap.val()));
       //console.log( extend({}, childSnapshot.val().order, menuSnap.val()) );
	   temp= extend(temp, childSnapshot.val().order, menuSnap.val());
	   console.log('temp =' + JSON.stringify(temp));
   });


}); // orderSnap.forEach

});

//temp=extend(temp, childData.order, menu_data);




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
