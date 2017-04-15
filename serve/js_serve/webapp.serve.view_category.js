(function($){

	$(document).on("pageinit", "#page-view_category", function(){

		var firebaseRef = firebase.database().ref("Category");

		loadFirebaseData();
		onFirebaseChange();
		checkActiveTable();

		function checkActiveTable(){

			var tableNum = $('#table_num');
			console.log(tableNum);
			console.log('page view_category session = '+sessionStorage.activeTable);

			if(sessionStorage.activeTable){
				tableNum.html('โต๊ะ '+sessionStorage.activeTable);
			}else{
				tableNum.html('ไม่ได้เลือกโต๊ะ');
			}

		}

		function loadFirebaseData(){

			firebaseRef.once('value', function(snapshot) {
				UIUpdateListViewCategory(snapshot);
			});  //firebase once

		}

		function UIUpdateListViewCategory(snapshot){
			snapshot.forEach(function(childSnapshot) {
			var childKey = childSnapshot.key;
			var childData = childSnapshot.val();
			console.log(childKey);
			console.log(childData.category_name);

			categoryHtml += '<li><a href="view_menu.html">';
			categoryHtml += '<img src="../'+ childData.category_picture +'"/><span id="' + childKey +'">' +childData.category_name +'</span>';
			categoryHtml += '</a></li> ';
			}); //for each
		//console.log(myHtml);
		$('#list_view_category').append(categoryHtml);
		$('#list_view_category').listview('refresh');
		}

		function onFirebaseChange(){

			firebaseRef.on('child_changed', function(data) {
				console.log('child change '+ data.key + ' and ' + data.val().category_name);
					$('#'+data.key).text(data.val().category_name);
					//$("#list_view_table a").find("span.ui-li-count").attr("data-table_id")

			});

		}

		var categoryHtml='';





		$("#btn_summary_category").on("click",function(){

			$.mobile.changePage("view_summary.php", {
				// ไม่มีการเปลี่ยน url ใน address bar ทำให้กดปุ่ม Back หรือ Forward กลับมาไม่ได้
				changeHash: false,
				data: { table_number: $("#table_num").text() }
			});

		});

	});  //pageinit

})(jQuery);
