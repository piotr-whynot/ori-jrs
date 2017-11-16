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
    <script type="text/javascript" src="./js/leaflet-1.0.3/leaflet.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-3.2.0.min.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src='./js/Highstock-1.3.9/highstock.js'></script>
    <script type="text/javascript" src="./js/custom/graph.js"></script>
    <script type="text/javascript" src="./js/custom/forms.js"></script>
    <script type="text/javascript" src="./js/custom/popup.js"></script>
    <script type="text/javascript" src="./js/custom/accordion.js"></script>
    <script type="text/javascript" src="./js/bootstrap/bootstrap-datetimepicker.min.js"></script>
    <script type="text/javascript" src="./js/bootstrap/bootstrap.min.js"></script>
<!--
    <script type="text/javascript" src="./javascript/jquery/jquery.ui.datepicker.js"></script>
    <script src="./javascript/Leaflet.label-master/src/Label.js"></script>
    <script src="./javascript/Leaflet.label-master/src/BaseMarkerMethods.js"></script>
    <script src="./javascript/Leaflet.label-master/src/Marker.Label.js"></script>
    <script src="./javascript/Leaflet.label-master/src/Map.Label.js"></script>
    <link rel="stylesheet" href='./stylesheets/graph.css'>
    <link rel="stylesheet" href='./stylesheets/jquery.ui.datepicker.css'>
    <link rel="stylesheet" href="./javascript/Leaflet.label-master/dist/leaflet.label.css" />
    <link rel="stylesheet" href='./css/jquery-ui-1.10.3.custom.min.css'>
    <link rel="stylesheet" href="./css/bootstrap.css">
-->
    <link rel="stylesheet" href='./css/popup.css'>
    <link rel="stylesheet" href="./js/leaflet-1.0.3/leaflet.css" />
    <link rel="stylesheet" href='./css/main.css'>
    <link rel="stylesheet" href='./css/graph.css'>
    <link rel="stylesheet" href='./css/accordion.css'>
    <link rel="stylesheet" href="./css/bootstrap-datetimepicker.css">
    <script>
        var map;
        var pointOverlays = new Array();
    </script>
</head>

<body onload='initializeMap();populateSideMenu();'>
    <div id="map"></div>
    <div id='popupBackground'></div>
    <div id='popupWindow'></div>
    <div id='sideMenuWindow'></div>
    <div id='sideMenuSymbol'>&#9776</div>
    <div id="shade"><img src="./img/ajax-loader.gif" class="ajax_loader"></div>
</body>
</html>
