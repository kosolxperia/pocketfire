<?php

$DBServer = "aakju4388g14se.cnp1bb6wstdo.ap-northeast-1.rds.amazonaws.com";
$DBName = "webapp_restaurant";
$DBUsername = "admin";
$DBPassword = "kosol123456";

$conn = mysql_connect($DBServer, $DBUsername , $DBPassword ) or die("ไม่สามารถติดต่อฐานข้อมูลได้");

mysql_select_db($DBName,$conn);
mysql_query("SET NAMES UTF8");

?>