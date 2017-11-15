<?php
session_start();
?>

<!DOCTYPE html>
<html>
<head>
    <title>ORI Monitoring and Forecasting</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="./js/leaflet-1.0.3/leaflet.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-3.2.0.min.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src="./main.js"></script>
    <script type="text/javascript" src="./js/custom/accordion.js"></script>
    <script type="text/javascript" src="./js/custom/popup.js"></script>
    <script type="text/javascript" src="./js/custom/graph.js"></script>
    <script src='./js/Highstock-1.3.9/js/highstock.js'></script>
<!---X-editable files -->
<!--
    <script type="text/javascript" src="./js/x-editable/bootstrap.js"></script>
    <script type="text/javascript" src="./js/x-editable/bootstrap-editable.js"></script>

    <link href="./css/x-editable/bootstrap.css" rel="stylesheet">
    <link href="./css/x-editable/bootstrap-editable.css" rel="stylesheet">
-->

    <link rel="stylesheet" href='./css/popup.css'>
    <link rel="stylesheet" href='./css/graph.css'>
    <link rel="stylesheet" href="./css/leaflet.css" />
    <link rel="stylesheet" href='./css/main.css'>
    <link rel="stylesheet" href='./css/jquery-ui-1.10.3.custom.min.css'>
    <link rel="stylesheet" href='./css/accordion.css'>
    <script>
        var map;
        var pointOverlays = new Array();

$(document).ready(function() {

});
  
    </script>
</head>

<body onload='initializeMap();populateSideMenu();'>
    <div id="shade"><img src="./img/ajax-loader.gif" class="ajax_loader"></div>
    <div id="map"></div>
    <div id='popupBackground'></div>
    <div id='popupWindow'></div>
    <div id='sideMenuWindow'></div>
    <?php include 'footer.php'; ?>
</body>
</html>
