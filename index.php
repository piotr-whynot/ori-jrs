<?php
session_start();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Okavango Data</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="text/javascript" src="./js/custom/main.js"></script>
    <script type="text/javascript" src="./js/custom/login.js"></script>
    <script type="text/javascript" src="./js/leaflet-1.0.3/leaflet.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-3.2.0.min.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src="./js/custom/graph.js"></script>
    <script type="text/javascript" src="./js/custom/forms.js"></script>
    <script type="text/javascript" src="./js/custom/popup.js"></script>
    <script type="text/javascript" src="./js/custom/accordion.js"></script>
    <script type="text/javascript" src="./js/bootstrap/bootstrap-datetimepicker.min.js"></script>
    <script type="text/javascript" src="./js/bootstrap/bootstrap.min.js"></script>
    <script type="text/javascript" src='./js/highstock-7.1.2.js'></script>
    <script type="text/javascript" src='./js/exporting.js'></script>
<!--
    note: loading highstock above, although graph.js uses highcharts 
    <link rel="stylesheet" href="./css/bootstrap.css">
    <script type="text/javascript" src='./js/Highstock-1.3.9/highstock.js'></script>
    <script type="text/javascript" src='./js/highcharts-5.0.12.js'></script>
    <script type="text/javascript" src='./js/highcharts-7.1.2.js'></script>
    <script type="text/javascript" src='./js/highcharts-more-7.1.2.js'></script>
-->
    <link rel="stylesheet" href="./css/bootstrap-datetimepicker.css">
    <link rel="stylesheet" href="./css/bootstrap.css">
    <link rel="stylesheet" href='./css/popup.css'>
    <link rel="stylesheet" href="./css/leaflet.css" />
    <link rel="stylesheet" href='./css/main.css'>
    <link rel="stylesheet" href='./css/graph.css'>
    <link rel="stylesheet" href='./css/accordion.css'>
    <link rel="stylesheet" href='./css/login.css'>
    <script>
        var map;
        var pointOverlays = new Array();
        var suff="/biodiv";
    </script>
</head>

<body onload='initialize();'>
    <div id="map"></div>
    <div id='popupBackground'></div>
    <div id='popupWindow'><div id=popupWindowClose>&times</div><div id='popupWindowContents'></div></div>
    <div id='sideMenuWindow'></div>
    <div id='sideMenuSymbol'>&#9776</div>
    <div id="shade"></div>
    <?php include 'footer.php'; ?>
</body>
</html>
