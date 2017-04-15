(function($){

	$(document).on("pageinit", "#page-view_category", function(){

		var firebaseRef = firebase.database().ref("Category");

		loadFirebaseData();
		onFirebaseChange();
		checkActiveTable();

		function checkActiveTable(){

			var tableNum = $('#table_num');
			console.log('active table = '+sessionStorage.activeTable);

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

		function onFirebaseChange(){

			firebaseRef.on('child_changed', function(data) {
				console.log('child change '+ data.key + ' and ' + data.val().category_name);
					//$('#'+data.key).text(data.val().category_name);
					UIUpdateCategoryName(data.key, data.val().category_name);
			});

		}

		function UIUpdateCategoryName(key, status){
			$('#' + key).text(status);
		}

		function UIUpdateListViewCategory(snapshot){

			var categoryHtml='';

			snapshot.forEach(function(childSnapshot) {
				var childKey = childSnapshot.key;
				var childData = childSnapshot.val();

				//console.log(childKey);
			//	console.log(childData.category_name);

				categoryHtml += '<li><a href="view_menu.html" class="categorylist" data-key="'+ childKey +'">';
				categoryHtml += '<img src="../'+ childData.category_picture +'"/><span id="' + childKey +'">' +childData.category_name +'</span>';
				categoryHtml += '</a></li> ';
			}); //for each

			$('#list_view_category').append(categoryHtml);
			$('#list_view_category').listview('refresh');

			setEventListOnclick();
		}

		function setEventListOnclick(){

			$('.categorylist').click(function(){
					sessionStorage.activeCategory = $(this).attr('data-key');
					console.log('set active category= '+sessionStorage.activeCategory);
					$.mobile.changePage( "view_menu.html");
			}); // click function


		}


		/*
		$("#btn_summary_category").on("click",function(){

			$.mobile.changePage("view_summary.php", {
				// ไม่มีการเปลี่ยน url ใน address bar ทำให้กดปุ่ม Back หรือ Forward กลับมาไม่ได้
				changeHash: false,
				data: { table_number: $("#table_num").text() }
			});

		});
		*/

	});  //pageinit

})(jQuery);
