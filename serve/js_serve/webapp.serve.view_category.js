var ViewCategoryModule = (function($) {

	//var firebaseRef = firebase.database().ref("Category");

	var init = function() {
		console.log('init')
		sessionStorage.fromPage="view_category";
		loadFirebaseData();
		onFirebaseChange();
		checkActiveTable();
	};

	var loadFirebaseData = function(){
		DatabaseCategoryModule.get_data_category()
		.then(function(snapshot){
			UIUpdateListViewCategory(snapshot);
		});
		/*
		firebaseRef.once('value', function(snapshot) {
			UIUpdateListViewCategory(snapshot);
		});  //firebase once
		*/
	};

	var onFirebaseChange = function(){
		DatabaseCategoryModule.run_fn_on_change(UIUpdateCategoryName);
		/*
		firebaseRef.on('child_changed', function(data) {
			console.log('child change '+ data.key + ' and ' + data.val().category_name);
				//$('#'+data.key).text(data.val().category_name);
				UIUpdateCategoryName(data.key, data.val().category_name);
		});


		firebaseRef.on('child_added', function(data) {
			console.log('child add');
		});
		*/
	};

	var UIUpdateListViewCategory = function(snapshot){
		var categoryHtml='';

		snapshot.forEach(function(childSnapshot) {
			var childKey = childSnapshot.key;
			var childData = childSnapshot.val();

			categoryHtml += '<li><a href="view_menu.html" class="categorylist" data-key="'+ childKey +'">';
			//categoryHtml += '<li><a href="view_menu.html" class="categorylist" id="'+ childKey +'" data-key="'+ childKey +'">';
			categoryHtml += '<img src="../'+ childData.category_picture +'"/>' +'<span id="'+ childKey +'">'+childData.category_name+'</span>';
			categoryHtml += '</a></li> ';
		}); //for each

		$('#list_view_category').append(categoryHtml);
		$('#list_view_category').listview('refresh');

		setEventListOnclick();
	};

	//var UIUpdateCategoryName = function(key, status) {
	var UIUpdateCategoryName = function(data) {
		console.log('fn UIUpdateCategoryName... '+data.key);
		//console.log(JSON.stringify($('#' + data.key)));
		$('#' + data.key).text(data.val().category_name);
	};

	var setEventListOnclick = function(){
		$('.categorylist').click(function(){
				sessionStorage.activeCategory = $(this).attr('data-key');
				console.log('set active category= '+sessionStorage.activeCategory);
				$.mobile.changePage( "view_menu.html");
		}); // click function
	};

	var checkActiveTable = function(){

		var tableNum = $('.table_num');
		console.log('active table = '+sessionStorage.activeTable);

		if(sessionStorage.activeTable){
			tableNum.html('โต๊ะ '+sessionStorage.activeTable);
		}else{
			tableNum.html('ไม่ได้เลือกโต๊ะ');
		}
	};

	return {
		init: init
	};

})(jQuery);



$(document).on("pageinit", "#page-view_category", function(){
	ViewCategoryModule.init();

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
