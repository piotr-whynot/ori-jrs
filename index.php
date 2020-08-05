<?php
session_start();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Okavango Data</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
  integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
  crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
  integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
  crossorigin=""></script>

<!-- 
    <script type="text/javascript" src="./js/leaflet-1.0.3/leaflet.js"></script>
   <script type="text/javascript" src="./js/jquery/jquery-3.2.0.min.js"></script>
    <script type="text/javascript" src="./js/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src='./js/highstock-7.1.2.js'></script>
    <script type="text/javascript" src='./js/offline-exporting.js'></script>
    <script type="text/javascript" src='./js/exporting.js'></script>
-->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> 
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script type="text/javascript" src="./js/custom/graph.js"></script>
    <script type="text/javascript" src="./js/custom/forms.js"></script>
    <script type="text/javascript" src="./js/custom/popup.js"></script>
    <script type="text/javascript" src="./js/custom/accordion.js"></script>


    <script type="text/javascript" src='https://code.highcharts.com/stock/highstock.src.js'></script>
    <script type="text/javascript" src='https://code.highcharts.com/stock/modules/exporting.js'></script>

    <script type="text/javascript" src="./js/bootstrap/bootstrap-datetimepicker.min.js"></script>
    <script type="text/javascript" src="./js/custom/menu.js"></script>
    <script type="text/javascript" src="./js/custom/main.js"></script>
    <script type="text/javascript" src="./js/custom/login.js"></script>
<!--
    <script type="text/javascript" src="./js/bootstrap/bootstrap.min.js"></script>
    note: loading highstock above, although graph.js uses highcharts 
    <link rel="stylesheet" href="./css/bootstrap.css">
    <script type="text/javascript" src='./js/Highstock-1.3.9/highstock.js'></script>
    <script type="text/javascript" src='./js/highcharts-5.0.12.js'></script>
    <script type="text/javascript" src='./js/highcharts-7.1.2.js'></script>
    <script type="text/javascript" src='./js/highcharts-more-7.1.2.js'></script>
    <link rel="stylesheet" href="./css/bootstrap.css"> #removed bootstrap.css because it was messing up with styles for the entire page. Only 3 items from bootstrap.css were necessary for datetimepicker, and these were put into the main.css
-->
    <link rel="stylesheet" href="./css/bootstrap-datetimepicker.css">
    <link rel="stylesheet" href='./css/admin.css'>
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
    <span id=loginContainer></span>
    <div id=topMenu>
        <span class='topmenuItem clickable' data-id=home>Home</span>
        <span class='topmenuItem clickable' data-id=exploredata>Explore&nbspData</span>
        <span class='topmenuItem clickable' data-id=downloaddata >Download&nbspData</span>
    </div>
<!--
-->        
    <div id=exploreMenu></div>
    <div id='mainContents'>
        <div id='introWindow' class='wideDiv homeDiv'><div class='spacer'></div><div id='introContents' class=contentsDivwide></div></div>
        <div id='sourcesWindow' class='wideDiv exploreDiv'><div class='spacer'></div><div id='sourcesHeader' class=headerDiv></div><div id='sourcesContents' class=contentsDivnarrow></div></div>
        <div id="datasetWindow" class='wideDiv exploreDiv'><div class=spacer></div><div id='datasetHeader' class=headerDiv></div><div id='datasetContents' ><div id=datasetInfo class=contentsDivnarrow></div><div id=mapDiv></div><div id=locationsList class=contentsDivnarrow ></div></div></div>
<!--    <div id="mapWindow" class='wideDiv exploreDiv'><div class=spacer></div><div id='mapHeader' class=headerDiv></div><div id='mapContents' class=contentsDiv></div></div>
-->
    <div id="locationWindow" class='wideDiv exploreDiv'><div class=spacer></div><div id='locationHeader' class=headerDiv></div><div id='locationContents' class=contentsDivnarrow></div></div>
    <div id="figureWindow" class='wideDiv exploreDiv'><div class=spacer></div><div id='figureHeader' class=headerDiv></div><div id='figureContents' class=contentsDiv></div></div>
    <div id="dataWindow" class='wideDiv exploreDiv'><div class=spacer></div><div id='dataHeader' class=headerDiv></div><div id='dataContents' class=contentsDiv></div></div>
    <div id="downloadWindow" class='wideDiv downloadDiv'><div id='downloadHeader' class=headerDiv></div><div id='downloadContents' class=contentsDiv></div></div>

    <!--
    <div id=quickMenu class='clickable floatRight'><img src="img/menu32.svg" alt=""><br>quick<br>nav</div>
    <div class=floatRight id="fdown"><div class=floatImg><img src='img/down.svg' width=50px></div></div>
    <div class=floatRight id="fup"><div class=floatImg><img src='img/up.svg' width=50px></div></div>
    <div class='floatLeft' id=floatFaq>?</div>
        <div id=faqPointer>Scroll to explore or <br>click here for help</div>
-->
    <div class='floatLeft' id=floatFaq><div id="floatFaqTxt">?</div></div>
</div>
    <div id="shade"></div>
    <div id='footer'><?php include 'footer.php'; ?></div>
</body>
</html>
