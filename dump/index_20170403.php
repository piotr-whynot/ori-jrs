<?php
session_start();
include "php_functions.php";
?>

<!DOCTYPE html>
<html>
<head>
    <title>ORI Monitoring and Forecasting</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="./javascript/leaflet-1.0.3/leaflet.js"></script>
    <script type="text/javascript" src="./javascript/jquery/jquery-3.2.0.min.js"></script>
    <script type="text/javascript" src="./javascript/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src="./main.js"></script>
    <script type="text/javascript" src="./javascript/custom/accordion.js"></script>
    <script type="text/javascript" src="./javascript/custom/popup.js"></script>

<!---X-editable files -->

<!--
    <script type="text/javascript" src="./javascript/jquery/jquery.ui.datepicker.js"></script>
    <script src="./javascript/Leaflet.label-master/src/Label.js"></script>
    <script src="./javascript/Leaflet.label-master/src/BaseMarkerMethods.js"></script>
    <script src="./javascript/Leaflet.label-master/src/Marker.Label.js"></script>
    <script src="./javascript/Leaflet.label-master/src/Map.Label.js"></script>
    <link rel="stylesheet" href='./stylesheets/graph.css'>
    <link rel="stylesheet" href='./stylesheets/tabmenu.css'>
    <link rel="stylesheet" href='./stylesheets/jquery.ui.datepicker.css'>
    <link rel="stylesheet" href="./javascript/Leaflet.label-master/dist/leaflet.label.css" />
-->
    <link rel="stylesheet" href='./stylesheets/popup.css'>
    <link rel="stylesheet" href="./stylesheets/leaflet.css" />
    <link rel="stylesheet" href="./javascript/leaflet-1.0.3/leaflet.css" />
    <link rel="stylesheet" href='./stylesheets/main.css'>
    <link rel="stylesheet" href='./stylesheets/jquery-ui-1.10.3.custom.min.css'>
    <link rel="stylesheet" href='./stylesheets/accordion.css'>
    <script>
        var map;
        var pointOverlays = new Array();

$(document).ready(function() {

});
  
    </script>
</head>

<body onload='initializeMap();populateSideMenu();'>
    <div id="shade"><img src="./images/default.gif" class="ajax_loader"></div>
    <div id="map"></div>
    <div id='popupBackground'></div>
    <div id='popupWindow'></div>
    <div id='sideMenuWindow'></div>
    <?php include 'footer.php'; ?>
</body>
</html>
