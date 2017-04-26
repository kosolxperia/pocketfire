var d = new Date();
var current_time = "2017-3-18 21:9:42";
//var now = moment().format('YYYY-MM-DD HH:mm:ss');
var now=moment();
var diff=now.diff(current_time, 'years');
alert(diff);
