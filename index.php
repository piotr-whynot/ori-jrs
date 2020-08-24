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
    <script type="text/javascript" src="./js/bootstrap-3.4.1/bootstrap.min.js"></script>

    <script type="text/javascript" src="./js/custom/menu.js"></script>
    <script type="text/javascript" src="./js/custom/main.js"></script>
    <script type="text/javascript" src="./js/custom/login.js"></script>
<!--
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="./js/bootstrap/bootstrap.min.js"></script>
    note: loading highstock above, although graph.js uses highcharts 
    <link rel="stylesheet" href="./css/bootstrap.css">
    <script type="text/javascript" src='./js/Highstock-1.3.9/highstock.js'></script>
    <script type="text/javascript" src='./js/highcharts-5.0.12.js'></script>
    <script type="text/javascript" src='./js/highcharts-7.1.2.js'></script>
    <script type="text/javascript" src='./js/highcharts-more-7.1.2.js'></script>
    <link rel="stylesheet" href="./css/bootstrap.css"> #removed bootstrap.css because it was messing up with styles for the entire page. Only 3 items from bootstrap.css were necessary for datetimepicker, and these were put into the main.css
    <link rel="stylesheet" href='./css/table.css'>
    <link rel="stylesheet" href="./css/bootstrap-datetimepicker.css">
    <link rel="stylesheet" href='./css/admin.css'>
    <link rel="stylesheet" href='./css/graph.css'>
    <link rel="stylesheet" href='./css/login.css'>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <link href="https://fonts.googleapis.com/css?family=Rubik:300,400,700,900" rel="stylesheet">
-->
    <link rel="stylesheet" href="./css/bootstrap-3.4.1.min.css">
    <link rel="stylesheet" href="./css/leaflet.css" />
    <link rel="stylesheet" href='./css/popup.css'>
    <link rel="stylesheet" href='./css/main.css'>
    <link rel="stylesheet" href='./css/accordion.css'>
    <link rel="stylesheet" href='./css/tabs.css'>
    <link rel="stylesheet" href='./css/loader.css'>
    <script>
    </script>
</head>

<body onload='initialize();'>
        <nav class='navbar navbar-default'>
            <div class=container>
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">Okavango Data</a>
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                </div>
                <div id=myNavbar class="collapse navbar-collapse">
                    <ul class='nav navbar-nav'>
                        <li>
                        <a class='nav-link ' href=# onClick=showHome() data-id=home>Home</a>
                        </li>
                        <li>
                        <a class=nav-link href=# onClick=showExplore() data-id=exploredata>Explore Data</a>
                        </li>
                    </ul>
                    <ul class="nav navbar-nav navbar-right" id=loginContainer>
                        <li><a href="#" onClick='registerForm()'><span class="glyphicon glyphicon-user"></span> Sign Up</a></li>
                        <li><a href="#" onClick='loginForm()'><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
                    </ul>
                </div>
            </div>
        </nav>

        <div id='allContents' class='container'>
            <div id=exploreMenu class=p-1>
                <ul class='nav nav-tabs'>
                <li class='nav-item active'>
                <a id=nav-sourcesWindow class='nav-link expmenuItem active' data-toggle='tab' data-id=sourcesWindow href='#'>Data Sources</a>
                </li>
                <li class='nav-item'>
                <a class='nav-link expmenuItem' data-toggle='tab'  data-id=datasetWindow href='#'>Dataset Info</a>
                </li>
                <li class='nav-item'>
                <a class='nav-link expmenuItem' data-toggle='tab'  data-id=locationWindow href='#'>Location Info</a>
                </li>
                <li class='nav-item'>
                <a class='nav-link expmenuItem' data-toggle='tab'  data-id=figureWindow href='#')>Graphs & Data</a>
                </li>
                <li class='nav-item hidden'>
                <a class='nav-link expmenuItem' data-toggle='tab'  data-id=dataWindow href='#'>Data Editor</a>
                </li>
                </ul>
            </div>
            <div id='mainContents' class='container-fluid'>
                <div id='introWindow' class='homeDiv'>
                    <div id='introContents' class=contentsDiv></div>
                </div>
                <div id='sourcesWindow' class='exploreDiv'>
                    <div id='sourcesContents' class=contentsDiv></div>
                </div>
                <div id="datasetWindow" class='exploreDiv'>
                    <div id='datasetContents' >
                        <div id=datasetInfo class='contentsDiv narrowTable'></div>
                        <div id=mapDiv></div>
                        <div id=locationsList class='contentsDiv narrowTable'></div>
                    </div>
                </div>
                <div id="locationWindow" class='exploreDiv'>
                    <div id='locationContents' class=contentsDiv></div>
                </div>
                <div id="figureWindow" class='exploreDiv'>
                    <div id='figureContents' class=contentsDiv></div>
                </div>
                <div id="dataWindow" class='exploreDiv'>
                    <div id='dataContents' class=contentsDiv></div>
                </div>
            </div>

        <div id='footer' class='col-sm-12 navbar-fixed-bottom bg-default'>
            <ul class='list-inline pull-right mb-0'>
                <li><span class=text-muted>this site does not use cookies!</li>
                <li><a href='#' onClick='pageinModal("termsofuse_contents", "Terms of use");'><span class="glyphicon glyphicon-copyright-mark"></span>&nbsp Terms of use</a></li>
                <li><a href='#' onClick='pageinModal("disclaimer_contents", "Disclaimer");'><span class="glyphicon glyphicon-alert"></span>&nbsp Disclaimer</a></li>
                <li><a href='#' onClick='pageinModal("contactus_contents", "Contact Us");'><span class="glyphicon glyphicon-envelope"></span>&nbsp Contact Us</a></li>
            </ul>
        </div>

<!--        <div class='navbar-fixed-bottom' id=floatFaq><div id="floatFaqTxt"></div></div>
-->        <div id=floatFaq><span class="glyphicon glyphicon-question-sign"></div>
        <div id="shade"></div>
        <div id='popupBackground'></div>
        <div id='popupWindow'><div id=popupWindowClose>&times</div><div id='popupWindowContents'></div></div>
    </div>

<!-- Modal -->
<div id="myModal" class="modal fade" role="dialog">
  <div class="modal-dialog">
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Modal Header</h4>
      </div>
      <div class="modal-body">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>

  </div>
</div>

</body>
</html>
