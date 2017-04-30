var ViewTableModule = (function($) {

	var init = function() {
	//	bindEvents();
		loadFirebaseData();
		onFirebaseChange();
	};

	var loadFirebaseData = function(){

		DatabaseDinningModule.get_data_dinning_table()
		.then(function(data){
			console.log('data = '+JSON.stringify(data));
			UIUpdateListViewTable(data);
		});

	};

	var onFirebaseChange = function(){
		DatabaseDinningModule.run_fn_on_change(UIUpdateTableStatus);
	};

	var UIUpdateListViewTable = function(snapshot) {
		var myHtml='';

		snapshot.forEach(function(childSnapshot) {
			var childKey = childSnapshot.key;
			var childData = childSnapshot.val();
			//console.log(childKey);
			//console.log(childData.table_status);
			myHtml+='<li><a href="#" class="tablelist" data-key="'+ childKey +'">โต๊ะ ' + childKey;
			myHtml+='<span class="ui-li-count" id="' + childKey  +'" >'+ childData.table_status +'</span>';
			myHtml+='</a></li>';
		}); //for each

		$('#list_view_table').append(myHtml);
		$('#list_view_table').listview('refresh');

		setEventListOnclick();
	};

	var setEventListOnclick = function(){
		$('.tablelist').click(function(){
				sessionStorage.activeTable = $(this).attr('data-key');
				//console.log('sessionStorage = '+$(this).attr('data-key'));
				$.mobile.changePage( "view_category.html");
		}); // click function
	};

	var UIUpdateTableStatus = function(data){
		console.log('on child change dinning table..');
		$('#' + data.key).text(data.val().table_status);
		
	};

	return {
		init: init
	};

})(jQuery);



$(document).on("pageinit", "#page-view_table", function(){

	ViewTableModule.init();

}); //page init


		/*
		setInterval(check_table_ready, 10000);

		$("#list_view_table a").on("swipeleft", function(){

			var status_element = $(this).find("span.ui-li-count");
			if(status_element.text() === "พร้อมเสิร์ฟ"){
				status_element.stop(true, true);
				remove_table_ready(status_element);
			}

		});

		$("#list_view_table .ui-li-count").each(function(){

			if($(this).text() === "ไม่ว่าง"){
				$(this).hide();
			}

		});

	}); //pageinit

	var check_table_ready = function(){
		console.log("check table ready");

		$.ajax({
			url: "check_table_ready.php",
			dataType: "json",
			success: function(data){

				update_list_table(data);

			},
			error: function(){
				alert("เกิดข้อผิดพลาด");
			}
		});

	};

	function remove_table_ready(element){
		$.ajax({
			url: "remove_table_ready.php",
			dataType: "json",
			data: { table_id: element.attr("data-table_id") },
			success: function(data){
				if(data.status === "OK"){
					element.hide();
				}else {
					alert("ไม่สามารถซ่อน count bubble ได้");
				}
			},
			error: function(){
				alert("เกิดข้อผิดพลาด");
			}
		});
	}

	function update_list_table(data){

		var table_id;
		var status;
		var chef_msg;
		var element;

		for(var i=0; i<data.json_table.length; i++){

			table_id = data.json_table[i].table_id;
			status = data.json_table[i].table_status;
			chef_msg = data.json_table[i].chef_message;
			element = $("span:jqmData(table_id='"+ table_id +"')");

			element.removeClass("ui-btn-up-e");

			if(status === "ไม่ว่าง"){

				element.text(status);
				element.hide();
			}else if(status === "ว่าง"){
				element.text(status);
				element.show();

			}

			if(chef_msg === "ready"){

				element.text("พร้อมเสิร์ฟ");
				element.addClass("ui-btn-up-e");
				element.show();
				element.effect("pulsate", { times:6 }, 1200);

			}

		}


	}
*/
