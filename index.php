<?php
session_start();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Okavango Data</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="text/javascript" src="./js/leaflet-1.0.3/leaflet.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-3.2.0.min.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src="./js/custom/graph.js"></script>
    <script type="text/javascript" src="./js/custom/forms.js"></script>
    <script type="text/javascript" src="./js/custom/popup.js"></script>
    <script type="text/javascript" src="./js/custom/accordion.js"></script>
    <script type="text/javascript" src='./js/highstock-7.1.2.js'></script>
    <script type="text/javascript" src='./js/exporting.js'></script>
    <script type="text/javascript" src="./js/bootstrap/bootstrap-datetimepicker.min.js"></script>
    <script type="text/javascript" src="./js/bootstrap/bootstrap.min.js"></script>
    <script type="text/javascript" src="./js/custom/main.js"></script>
    <script type="text/javascript" src="./js/custom/login.js"></script>
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
    <link rel="stylesheet" href='./css/main.css'>
    <link rel="stylesheet" href='./css/graph.css'>
    <link rel="stylesheet" href='./css/accordion.css'>
    <link rel="stylesheet" href='./css/login.css'>
    <link rel="stylesheet" href="./css/leaflet.css" />
    <link href="https://fonts.googleapis.com/css?family=Rubik:300,400,700,900" rel="stylesheet">
    <script>
    </script>
</head>

<body onload='initialize();'>
    <div id='popupBackground'></div>
    <div id='popupWindow'><div id=popupWindowClose>&times</div><div id='popupWindowContents'></div></div>


    <div id='allContents'>
    <div id='introWindow' class=narrowDiv><div class='spacer'></div><div id='introHeader' class=headerDiv></div><div id='introContents' class=contentsDiv></div></div>
    <div id='menuWindow' class=narrowDiv><div class='spacer'></div><div id='menuHeader' class=headerDiv></div><div id='menuContents' class=contentsDiv></div></div>
    <div id="mapWindow" class=wideDiv><div id='mapContents'></div></div>
    <div id="locationWindow" class=wideDiv><div class=spacer></div><div id='locationHeader' class=headerDiv></div><div id='locationContents' class=contentsDiv></div></div>
    <div id="datasetWindow" class=wideDiv><div class=spacer></div><div id='datasetHeader' class=headerDiv></div><div id='datasetContents' class=contentsDiv></div></div>
    <div id="figureWindow" class=wideDiv><div class=spacer></div><div id='figureHeader' class=headerDiv></div><div id='figureContents' class=contentsDiv></div></div>
    <div id="dataWindow" class=wideDiv><div class=spacer></div><div id='dataHeader' class=headerDiv></div><div id='dataContents' class=contentsDiv></div></div>
    </div>
    <div id="shade"></div>
    <div id='footer'><?php include 'footer.php'; ?></div>
<!--
-->
</body>
</html>
