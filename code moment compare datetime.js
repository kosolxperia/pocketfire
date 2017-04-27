var d = new Date();
var current_time = "2017-04-26 21:19:42";
current_time=current_time.substr(0,current_time.indexOf(' '));
//var now = moment().format('YYYY-MM-DD HH:mm:ss');
var now=moment();
//alert(now);
var diff=now.diff(current_time, 'days');
alert(diff);
