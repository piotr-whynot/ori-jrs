<?php
# main admin tasks
#
# Piotr
#
# June 2017
# 
# handles admin tasks, such as creating new and editing tables. 
# also adding and editing users
# basically a set of if statements that differentiates between envmondata and biodivdata, and each of the corresponding data tables. 
# different forms are invoked from the main menu by calling itself with arguments, and calls submit.php to submit to database
# 
# still missing: a lot, but importatnly - access control, handling photos in location
#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# the principles of the setup of functionality below are as follows:
# 
# for each table there is a separate block of commands below
# each block has similar structue:
# 1. reset of all variables needed by given table
# 2. if do==edit || do==view
#    this block has a multiple functionality: 
#    if given table identifier is defined (e.g. datasetID for dataset table) - then it basically just reads variables from database
#    but it also handles all 'intermediate' pages leading to finding that identifier
#    those pages will, for example, let one select dataset first, then location, and only then a datastream.
# 3. form
#
# note1 - view functionality is not provided. Admin can see all the entries in the form while do=edit
# note2 - displaying forms for measurement and occurrence tables is not handled here, but through javascript. This is because that table is dynamically constructed. Other tables are "static"
# note3 - querying database is done through sql rather than though api commands, this is because api does not have to exprose all variables in the database
#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
session_start();

//possible values: env, biodiv or users
if(isset($_REQUEST['base'])){
        $base = $_REQUEST['base'];
}else{
    //this makes sure base is not empty
    $base="admin";
}

//possible values: add, edit, delete
if(isset($_REQUEST['do'])){
    $do  = $_REQUEST['do'];
}else{
    $do="";
}

//possible values: 
//for env: dataset, location, datastream, measurement
//for biodiv: dataset, event, location, checklist, occurrence
//for users: users, ownership
if(isset($_REQUEST['table'])){
    $table  = $_REQUEST['table'];
}else{
    $table="";
}

// this identifies a dataset during a request to edit dataset. Similar statement need to be created for each of the tables, i.e. location, datastream etc...
if(isset($_REQUEST['datasetID'])){
    $datasetID  = $_REQUEST['datasetID'];
}else{
    $datasetID="";
}

if(isset($_REQUEST['locationID'])){
    $locationID  = $_REQUEST['locationID'];
}else{
    $locationID="";
}

if(isset($_REQUEST['datastreamID'])){
    $datastreamID  = $_REQUEST['datastreamID'];
}else{
    $datastreamID="";
}

if(isset($_REQUEST['eventID'])){
    $eventID  = $_REQUEST['eventID'];
}else{
    $eventID="";
}

if(isset($_REQUEST['userID'])){
    $userID  = $_REQUEST['userID'];
}else{
    $userID="";
}


if(isset($_REQUEST['date'])){
    $date  = $_REQUEST['date'];
}else{
    $date="";
}

if(isset($_REQUEST['baseTime'])){
    $baseTime  = $_REQUEST['baseTime'];
}else{
    $baseTime="";
}

if(isset($_REQUEST['locationType'])){
    $locationType  = $_REQUEST['locationType'];
}else{
    $locationType="";
}

if(isset($_REQUEST['taxonID'])){
    $taxonID  = $_REQUEST['taxonID'];
}else{
    $taxonID="";
}

if(isset($_REQUEST['ownedItemID'])){
    $ownedItemID  = $_REQUEST['ownedItemID'];
}else{
    $ownedItemID="";
}
if(isset($_REQUEST['databaseID'])){
    $databaseID  = $_REQUEST['databaseID'];
}else{
    $databaseID="";
}


if(isset($_SESSION['userInfo'])){
    unset($_SESSION['accessType']);
    if($_SESSION['userInfo'][1]=="admin"){
        $_SESSION['accessType']="admin";
    }
    if($table=="dataset" & $datasetID!="" & $do=="edit"){
        if (in_array($datasetID, $_SESSION['userInfo'][6])){
            $_SESSION['accessType']="user";
        }
    }

    if($table=="location" & $locationID!="" & $do=="edit"){
        if (in_array($locationID, $_SESSION['userInfo'][7])){
            $_SESSION['accessType']="user";
        }
    }
    if($table=="location" & $locationID!="" & $datasetID!="" & $do=="edit"){
        if (in_array($datasetID, $_SESSION['userInfo'][6])){
            $_SESSION['accessType']="user";
        }
    }
//    foreach($_SESSION['userInfo'][6] as $temp){
//        echo $temp;
//    }
}

if (!isset($_SESSION['accessType'])){
    echo "You are not authorized to access this page.";
    header("Location: ../");
}else{

include '/.creds/.credentials.php';
#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#



// opening database link
//$mysqli->select_db($base);
if ($base=="admin"){
    $cont=True;
}else{
    $mysqli->select_db($base);
}



#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
echo"
<!DOCTYPE html>
<html lang=\"en\">
<head>
<title>Okavango Data - Admin</title>
<meta charset=\"UTF-8\">
<meta name=\"description\" content=\"Okavango biodiversity and environmental monitoring\">
<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js\"></script>
<script type=\"text/javascript\" src=\"../js/bootstrap-datetimepicker.min.js\"></script>
<script type=\"text/javascript\" src=\"../js/forms.js\"></script>
<script type=\"text/javascript\" src=\"../js/popup.js\"></script>
<script type=\"text/javascript\" src=\"../js/bootstrap.min.js\"></script>
<link rel=\"stylesheet\" href=\"../css/bootstrap-datetimepicker.css\">
<link rel=\"stylesheet\" href=\"../css/bootstrap-3.4.1.min.css\">
<link rel=\"stylesheet\" href=\"../css/main.css\">
<link rel=\"stylesheet\" href=\"../css/admin.css\">
<link rel=\"stylesheet\" href=\"../css/popup.css\">
</head>
<script>
suff=\"/biodiv\";
</script>
<body>
<div id=adminContainer class='container-fluid row'>
<div class='col-sm-2'></div>
<div class='col-sm-8'>
";

#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//home button
echo "<p><a class='btn btn-link' href=\"../\">main page</a>&nbsp";
if ($_SESSION['accessType']=="admin"){
    echo "<a class='btn btn-link' href=\"./\">admin home</a><br>";
}
echo "<br><br>";

// this is a "plain" call - shows menu
if ($base=="admin" | ($do=="" & $table=="")){
echo "
<table class='table narrowTable'>
<tr class=success><th>biodiversity database<th></tr>
<tr><td>Management of database structure, adding/editing datasets and locations<td><a href=\"./?base=biodivdata&do=edit&table=dataset\">go</a></tr>
<tr><td>Add/edit events (and occurrences)<td><a href=\"./?base=biodivdata&do=edit&table=event\">go</a></tr>
<!--
<tr><td>Add/edit measurements/facts<td><a href=\"./?base=biodivdata&do=edit&table=measurementorfact\">go</a></tr>
-->
<tr><td>Checklist</><td><a href=\"./?base=biodivdata&do=edit&table=checklist\">edit</a></tr>
</table>
<br><br>
<table class='table narrowTable'>
<tr class=success><th>environmental database<th></tr>
<tr><td>Management of database structure, adding/editing datasets and locations and datastreams<td><a href=\"./?base=envmondata&do=edit&table=dataset\">go</a></tr>
<!--
<tr><td>Add/edit measurements<td><a href=\"./?base=envmondata&do=edit&table=measurement\">go</a></tr>
-->
</table>
<br><br>
<table class='table narrowTable'>
<tr class=success><th>site admin<th></tr>
<tr><td>Users</><td><a href=\"./?base=users&do=edit&table=users\">go</a></tr>
<tr><td>Key monitoring locations</><td><a href=\"./?base=envmondata&do=edit&table=keydatastream\">go</a></tr>
</table>
";
}

#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
#
# envmondata and dataset table
#
#
if ($base=="envmondata" & $table=="dataset"){
    // resetting dataset variables
    $datasetName="";
    $institutionCode="";
    $ownerInstitutionCode="";
    $datasetLicence="CC BY-NC";
    $datasetDescription="";
    $publications="";
    $datasetRemarks="";
    $subjectScope="";
    $geographicScope="";
    $temporalScope="";
    $samplingApproach="";
    $methodSteps="";
    $qualityControl="";
    $datasetCitation="";
    if ($datasetID=='' && $do!='add'){
        // datasetID is not set - shows list of all datasets
        $query="select datasetID, datasetName from dataset";
        $result = $mysqli->query($query);
        if ($_SESSION['accessType']=="admin"){
            echo "<a href=./>back</a>";
        }
        echo "<h2 class=text-center>View/edit dataset in environmental database</h2>";
        echo "<p class=text-center><a href=\"./?base=envmondata&do=add&table=dataset\">Add new dataset</a></p>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th>datasetID<th>dataset name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datasetID']."<td>".$row['datasetName']."<td><a href='./?base=envmondata&do=edit&table=dataset&datasetID=".$row['datasetID']."' >edit dataset info</a><br><a href='./?base=envmondata&do=edit&table=location&datasetID=".$row['datasetID']."' >show locations</a></tr>";
        }
        echo "</table>";
    }
    if ($datasetID!='' && $do=="edit"){
       //$datasetID is set
        $query="select * from dataset where datasetID='{$datasetID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $datasetName=$row['datasetName'];
        $institutionCode=$row['institutionCode'];
        $ownerInstitutionCode=$row['ownerInstitutionCode'];
        $datasetLicence=$row['datasetLicence'];
        $datasetDescription=$row['datasetDescription'];
        $publications=$row['publications'];
        $datasetRemarks=$row['datasetRemarks'];
        $subjectScope=$row['subjectScope'];
        $geographicScope=$row['geographicScope'];
        $temporalScope=$row['temporalScope'];
        $samplingApproach=$row['samplingApproach'];
        $methodSteps=$row['methodSteps'];
        $qualityControl=$row['qualityControl'];
        $datasetCitation=$row['datasetCitation'];
    }
    if (($datasetID!='' && $do=="edit") || $do=="add"){
     // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        if ($_SESSION['accessType']=="admin"){
            echo "<a href=./?base=envmondata&do=edit&table=dataset>back</a>";
        }
        if ($do=="add"){
            echo "<h2>Adding dataset to environmental monitoring database</h2>";
        }else{
            echo "<h2>Editing dataset in environmental monitoring database</h2>";
            echo "<h3>Current dataset: <b>$datasetID</b></h3>";
        }
        echo"
<p> required fields shaded in yellow-ish</p>
<form id=form action='#' method=post>

<h3>Dataset ID</h3>
<label><p>max length:10 characters<br>usually three to six letters describing dataset and a year when the dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty nospace unique' value='{$datasetID}'><br>

<h3>Dataset Name</h3>
<label><p>max length:100 characters<br>short name describing dataset, to be used to identify the dataset in the website, example: Biokavango community-based monitoring, Silica project (2013)</label><br>
<span id=datasetName class=warning></span>
<input type=text size=100 name=datasetName class=nonempty value='{$datasetName}'><br>

<h3>Project or Institution Name</h3>
<label><p>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=institutionCode class=warning></span>
<input type=text size=100 name=institutionCode class=nonempty value='{$institutionCode}'><br>

<h3>Legal Institutional Owner</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=ownerInstitutionCode class=warning></span>
<input type=text size=100 name=ownerInstitutionCode value='{$ownerInstitutionCode}'><br>

<h3>Dataset Licence</h3>
<label><p><br>Licence under which the dataset is shared</label><br>
<span id=datasetLicence class=warning></span>

<select name=datasetLicence width=20>";
$licenceList=array("CC0","CC BY","CC BY-NC");
foreach ($licenceList as $lic){ 
echo "<option class=nonempty value='$lic' ";
if ($datasetLicence==$lic){
    echo " selected";
}
echo ">$lic</option>";
}
echo "</select>";

echo "
<h3>Dataset Description</h3>
<label><p>max length:900 characters<br>Longer description of the dataset</label><br>
<span id=datasetDescription class=warning></span>
<textarea cols=80 rows=10 size=900 name=datasetDescription >{$datasetDescription}</textarea><br>

<h3>Publications</h3>
<label><p>max length:900 characters<br>Publications (papers, reports) associated with the dataset. Separate individual entries with colon (do not use colon IN each of references)</label><br>
<span id=publications class=warning></span>
<textarea cols=80 rows=10 size=900 name=publications>{$publications}</textarea><br>

<h3>Dataset Remarks</h3>
<label><p>max length:9000 characters<br>Any other remarks you might have</label><br>
<span id=datasetRemarks class=warning></span>
<textarea cols=80 rows=10 size=9000 name=datasetRemarks>{$datasetRemarks}</textarea><br>

<h3>Subject scope</h3>
<label><p>max length:250 characters<br>What does this dataset measure?</label><br>
<span id=subjectScope class=warning></span>
<textarea cols=80 rows=4 size=250 name=subjectScope>{$subjectScope}</textarea><br>

<h3>Temporal scope</h3>
<label><p>max length:250 characters<br>What period does this dataset cover?</label><br>
<span id=temporalScope class=warning></span>
<textarea cols=80 rows=4 size=250 name=temporalScope>{$temporalScope}</textarea><br>

<h3>Geographic scope</h3>
<label><p>max length:250 characters<br>What geographic region does this dataset cover?</label><br>
<span id=geographicScope class=warning></span>
<textarea cols=80 rows=4 size=250 name=geographicScope>{$geographicScope}</textarea><br>

<h3>Sampling Approach</h3>
<label><p>max length:900 characters<br>General approach to sampling</label><br>
<span id=samplingApproach class=warning></span>
<textarea cols=80 rows=10 size=900 name=samplingApproach>{$samplingApproach}</textarea><br>

<h3>Method steps</h3>
<label><p>max length:900 characters<br>Detailed steps involved in the process</label><br>
<span id=methodSteps class=warning></span>
<textarea cols=80 rows=10 size=900 name=methodSteps>{$methodSteps}</textarea><br>

<h3>Quality Control</h3>
<label><p>max length:900 characters<br>How was data/sampling quality ensured?</label><br>
<span id=qualityControl class=warning></span>
<textarea cols=80 rows=10 size=900 name=qualityControl>{$qualityControl}</textarea><br>

<h3>Dataset citation</h3>
<label><p>max length:250 characters<br>How should the data be cited</label><br>
<span id=datasetCitation class=warning></span>
<textarea cols=80 rows=4 size=250 name=datasetCitation>{$datasetCitation}</textarea><br>


<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=envmondata&do={$do}&table=dataset','./?base=envmondata&do=edit&table=dataset');>

<input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=envmondata&do=edit&table=dataset\"';>
<br>        
<br>        
</form>
        ";
    }
} //end envmondata and dataset table


#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# 
// envmondata and location table
#
#
if ($base=="envmondata" & $table=="location"){
    // resetting variables
    $locationName="";
    $locality="";
    $decimalLatitude="";
    $decimalLongitude="";
    $coordinateUncertaintyInMeters="";
    $geodeticDatum="";
    $verbatimElevation="";
    $elevationUncertaintyInMeters="";
    $locationType="";
    $parentLocationID="";
    $childLocationValue="";
    $childLocationUnit="";
    $geomorphologicalPosition="";
    $countryCode="";
    $locationOwner="";
    $associatedMedia="";
    $locationRemarks="";

    if ($datasetID==''){
        //dataset must be defined
        echo "dataset must be defined to list locations <br>";
        if ($_SESSION['accessType']=="admin"){
            echo "<a href=./?base=envmondata&do=edit&table=dataset>back</a>";
        }
    }
    if ($locationID==''&& $datasetID!='' && $do!='add'){
        //listing locations for given dataset
        //$query="select distinct location.locationID, locationName, locality, decimalLongitude, decimalLatitude from location join datastream on datastream.locationID=location.locationID where datasetID='{$datasetID}'";
        $query="select distinct locationID, locationName, locality, decimalLongitude, decimalLatitude from location where datasetID='{$datasetID}'";
//        echo $query;
        $result = $mysqli->query($query);
        echo "<a href=./?base=envmondata&do=edit&table=dataset>back</a>";
        echo "<h2 class=text-center>View/edit location in environmental monitoring database</h2>";
        echo "<h3>Current dataset: <b>$datasetID</b></h3>";
        echo "<p class=text-center><a href=\"./?base=envmondata&do=add&table=location&datasetID={$datasetID}\">Add new location</a></p>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th width=100px>locationID<th width=100px >locationName<th width=100px>locality<th width=100px>coordinates<th width=300px></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['locality']."<td>".$row['decimalLongitude']."<br>".$row['decimalLatitude']."<td><a href='./?base=envmondata&do=edit&table=location&datasetID={$datasetID}&locationID=".$row['locationID']."' >edit location</a><br><a href='./?base=envmondata&do=edit&table=datastream&datasetID={$datasetID}&locationID=".$row['locationID']."' >show datastreams</a><br></tr>";
        }
        echo "</table>";
    }
    if ($locationID!='' && $do=='edit'){
        // when $locationID is set through url argument - query database for location fields
        $query="select * from location where locationID='{$locationID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $locationName=$row['locationName'];
        $locality=$row['locality'];
        $decimalLatitude=$row['decimalLatitude'];
        $decimalLongitude=$row['decimalLongitude'];
        $coordinateUncertaintyInMeters=$row['coordinateUncertaintyInMeters'];
        $geodeticDatum=$row['geodeticDatum'];
        $verbatimElevation=$row['verbatimElevation'];
        $elevationUncertaintyInMeters=$row['elevationUncertaintyInMeters'];
        $locationType=$row['locationType'];
        $parentLocationID=$row['parentLocationID'];
        $childLocationValue=$row['childLocationValue'];
        $childLocationUnit=$row['childLocationUnit'];
        $geomorphologicalPosition=$row['geomorphologicalPosition'];
        $countryCode=$row['countryCode'];
        $locationOwner=$row['locationOwner'];
        $locationRemarks=$row['locationRemarks'];
        $associatedMedia=$row['associatedMedia'];
    }
    if (($locationID!='' && $do=="edit") || $do=="add"){
       // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=envmondata&do=edit&table=location&datasetID={$datasetID}>back</a>";
        if ($do=="add"){
            echo "<h2>Adding location to environmental monitoring database</h2>";
        }else{
            echo "<h2>Editing location to environmental monitoring database</h2>";
        }
echo"
<label><p> required fields shaded in yellow</label>

<form id=form action='#' method=post enctype='multipart/form-data'>

<h3>Location ID</h3>
<label><p>max length:20 characters<br>A location belongs to a given dataset. Even if measurements are carried out at the same place, but belong to different datasets, they will fall under different locations. LocationID is typically constructed as follows: three letters describing dataset, underscore (\"_\"), and up to 6 characters describing the location, usually either the location code used in the source dataset, or some abbreviation of it. No spaces, no special characters. LocationID has to be unique. Example: mla_nq22, ori_boro </label><br>
<span id=locationID class=warning></span>
<input type=text size=20 name=locationID class='nonempty unique nospace' value='{$locationID}'><br>

<h3>Dataset ID</h3>
<label><p>Must be of existing dataset. Submission will fail, if ID given here does not exist already. Normally, the dataset ID field is 'preloaded'</label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty mustexist nospace' value='{$datasetID}'><br>

<h3>Location Name</h3>
<label><p>max length:50 characters<br>short name describing location, to be used in the website. It can too be the full location code used in the original data source. Example: \"Flume at Phelo's floodplain at Nxaraga\" or \"Boro-124w\"</label><br>
<span id=locationName class=warning></span>
<input type=text size=50 name=locationName class=nonempty value='{$locationName}'><br>

<h3>Locality or description of location</h3>
<label><p>max length:100 characters<br>Longer description of the location. Example: \"East bank of the Xakanaxa lagoon, some 1 km upstream from Camp Okuti\"</label><br>
<span id=locality class=warning></span>
<input type=text size=100 name=locality class=nonempty value='{$locality}'><br>

<h3>decimalLatitude</h3>
<label><p>max length:15 characters<br>Latitude expressed in decimal degrees. Example: -21.122345</label><br>
<span id=decimalLatitude class=warning></span>
<input type=text size=15 name=decimalLatitude class='numeric' value={$decimalLatitude}><br>

<h3>decimalLongitude</h3>
<label><p>max length:15 characters<br>Longitude expressed in decimal degrees. Example: 19.134567</label><br>
<span id=decimalLongitude class=warning></span>
<input type=text size=15 name=decimalLongitude class='numeric' value='{$decimalLongitude}'><br>

<h3>coordinateUncertaintyInMeters</h3>
<label><p>max length:10 characters<br>Uncertainty of geographic coordinates in meters. Approximate. Handheld GPS-determined coordinates will typically have uncertainty of 5m. Some locations can be precisely measured with uncertainty of 0.5m or less. Some location, particularly archival ones, position of which is estimated from some desription can have uncertainty in the order of 1000m or even more, up to 10000m </label><br>
<span id=coordinateUncertaintyInMeters class=warning></span>
<input type=text size=10 name=coordinateUncertaintyInMeters class='numeric' value='{$coordinateUncertaintyInMeters}'><br>

<h3>geodeticDatum</h3>
<label><p>max length:10 characters<br>Geodetic Datum. Typically WGS84</label><br>
<span id=geodeticDatum class=warning></span>
<input type=text size=10 name=geodeticDatum value='{$geodeticDatum}'><br>

<h3>Verbatim Elevation</h3>
<label><p>max length:10 characters<br>Elevation in meters. That should actually be elevation in m a.m.s.l. rather than geoidal height. If you don't know what it means - don't worry, it is not THAT important</label><br>
<span id=verbatimElevation class=warning></span>
<input type=text size=10 name=verbatimElevation class='numeric' value='{$verbatimElevation}'><br>

<h3>Elevation Uncertainty In Meters</h3>
<label><p>max length:10 characters<br>Uncertainty of elevation value, in meters. If from handheld GPS it will be in the order of 10m. Precisely levelled sites can have uncertainty as low as 0.01m. </label><br>
<span id=elevationUncertaintyInMeters class=warning></span>
<input type=text size=10 name=elevationUncertaintyInMeters class='numeric' value='{$elevationUncertaintyInMeters}'><br>

<h3>locationType</h3>
<label><p>max length:50 characters<br>Type of location. Either \"monitoring\" or \"short-term\"</label><br>
<span id=locationType class=warning></span>

<select name=locationType width=20>
<option class=nonempty value='short-term' ";
if ($locationType=='short-term'){
    echo " selected";
}
echo ">short-term</option>
<option class=nonempty value='monitoring'";

if ($locationType=='monitoring'){
    echo " selected";
}
echo ">monitoring</option>
</select>


<h3>parentLocationID</h3>
<label><p>max length: 10 characters<br>Some sites have subsites. For example, one can measure water chemistry at one location at several depths, or measure vegetation cover along a short transect, or measure wind speed at two different heights abouve grond. To accomodate this, the database allows for defining 'parent' and 'child' locations. Child location is identified by having a parentLocationID that is non-empty and different from its own locationID. One has to create parent location before one can create child location. Unfortunately, for the sake of consistency, child location has to have all the necessary variables filled out, as if it was an independent location. parentLocationID should have no spaces and no special characters. Obviously, the field might be left empty, if given location does not have parent.</label><br> 

<span id=parentLocationID class=warning></span>
<input type=text size=20 name=parentLocationID class='nospace mustexistorempty' value='{$parentLocationID}'><br>

<h3>childLocationValue</h3>
<label><p>max length:10 characters<br> value describing relationship between child and parent location. It can be distance along transect, depth, or simply a number reflecting a subsite, or a number describing a sequential sample</label><br>
<span id=childLocationValue class=warning></span>
<input type=text size=10 name=childLocationValue class='nospace numeric' value='{$childLocationValue}'><br>

<h3>childLocationUnit</h3>
<label><p>max length:20 characters<br> unit for the value describing relationship between child and parent location. It can be m, or cm, or 'sample', 'point on transect' etc.</label><br>
<span id=childLocationUnit class=warning></span>
<input type=text size=20 name=childLocationUnit class=none value='{$childLocationUnit}'><br>


<h3>geomorphologicalPosition</h3>
<label><p>max length:100 characters<br>geomorphological position of measurement location. Descriptive. Examples: channel, channel bank, lagoon, lagoon centre, lagoon fringe, riparian fringe, island centre, crest of dune etc.</label><br>
<span id=geomorphologicalPosition class=warning></span>
<input type=text size=100 name=geomorphologicalPosition class='' value='{$geomorphologicalPosition}'><br>

<h3>countryCode</h3>
<label><p>max length:2 characters<br>A two letter country code. For Botswana it is BW</label><br>
<span id=countryCode class=warning></span>
<input type=text size=2 name=countryCode class='none' value='{$countryCode}'><br>

<h3>locationOwner</h3>
<label><p>max length:100 characters<br>if location is an established monitoring site, it is the name of an institution to whom that location belongs, or the name of an individual who 'owns' that location. For example: Island Safari Lodge, or Department of Water Affairs</label><br>
<span id=locationOwner class=warning></span>
<input type=text size=100 name=locationOwner value='{$locationOwner}'><br>


<h3>locationRemarks</h3>
<label><p>max length:255 characters<br>Any other remarks you might have</label><br>
<span id=locationRemarks class=warning></span>
<textarea cols=40 rows=6 size=255 name=locationRemarks>{$locationRemarks}</textarea><br>

<h3>Associated Media</h3>
<label><p>add/remove photo of measurement location</label><br>
<span id=associatedMedia class=warning></span>";

echo "<div id=associatedMediaDiv>";
if ($associatedMedia){
    echo "<input type=hidden name=associatedMedia class='none' value='{$associatedMedia}'>";
    echo "<img width=400px src='${associatedMedia}'><br><input type=button onClick='removePhoto()' value='Remove this photo'>";
}else{
    echo "<input type=hidden name=associatedMedia class='none' value=''>";
    echo "<input type='file' name='fileToUpload' id='fileToUpload' onChange='activateUpload()'><input type='button' id=uploadButton value='Upload this photo' onClick='uploadPhoto()' disabled>";
}
echo"</div></br>";

echo"<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=envmondata&do={$do}&table=location','./?base=envmondata&do=edit&table=location&datasetID=$datasetID');>

<input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=envmondata&do=edit&table=location&datasetID=$datasetID\"';>
</form>
        ";
    }
} //end envmondata and location table

#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# envmondata and datastream table
#
#
#
#
if ($base=="envmondata" & $table=="datastream"){
    //resetting variables
    $variableType='';
    $variableName='';
    $variableUnit='';
    $baseTime='';
    $basisOfRecord='';
    $samplingEffort='';
    $samplingProtocol='';
    $sampleSizeValue='';
    $sampleSizeUnit='';

    if ($datastreamID=='' && $locationID!='' && $do!='add'){
        //lists all datastreams for given locationID
        $query="select datastreamID, locationID, variableName, baseTime from datastream where locationID='".$locationID."'";
        $result = $mysqli->query($query);
        echo "<a href=./?base=envmondata&do=edit&table=location&datasetID={$datasetID}>back</a>";
        echo "<h2 class=text-center>View/edit datastream in environmental monitoring database</h2>";
        echo "<h3>Current dataset: <b> $datasetID</b></h3>";
        echo "<h3>Current location: <b> $locationID</b></h3>";
        echo "<p class=text-center><a href=\"./?base=envmondata&do=add&table=datastream&datasetID={$datasetID}&locationID={$locationID}\">Add new datastream</a></p>";
        echo "<table class='table table-striped narrowTable'>";
        echo "<tr class=success><th>datastreamID<th>locationID<th>Name of variable<th>Base time<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datastreamID']."<td>".$row['locationID']."<td>".$row['variableName']."<td>".$row['baseTime']."<td><a href='./?base=envmondata&do=edit&table=datastream&datasetID=$datasetID&locationID=$locationID&datastreamID=".$row['datastreamID']."' >edit</a></tr>";
        }
        echo "</table>";
   }
   if ($datastreamID!='' && $do=='edit'){
        // when datastreamID is set through url argument - query database for datastream values
        $query="select * from datastream where datastreamID='{$datastreamID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $variableType=$row['variableType'];
        $variableName=$row['variableName'];
        $variableUnit=$row['variableUnit'];
        $baseTime=$row['baseTime'];
        $basisOfRecord=$row['basisOfRecord'];
        $samplingEffort=$row['samplingEffort'];
        $samplingProtocol=$row['samplingProtocol'];
        $sampleSizeValue=$row['sampleSizeValue'];
        $sampleSizeUnit=$row['sampleSizeUnit'];
    }
    if (($datastreamID!="" && $do=="edit") || $do=="add"){
        //shows form
        echo "<a href=./?base=envmondata&do=edit&table=datastream&datasetID={$datasetID}&locationID={$locationID}>back</a>";
        if ($do=="add"){
            echo "<h2>Adding datastream to environmental monitoring database</h2>";
        }else{
            echo "<h2>Editing datastream in environmental monitoring database</h2>";
        }
        echo" 
<label><p> required fields shaded in yellow</label>

<form id=form action='#' method=post>

<h3>Datastream ID</h3>
<label><p>max length:30 characters<br> DatastreamID is composed of two elements: locationID and a code for variable. Those are separeted by underscore '_'. Note that locationID is composed of dataset code (ffirst three letters) and location code (up to 6 letters after the underscore). So the datastreamID will have three parts separated by underscores. Example: mla_nq22_DO, ori_boro_wlevel. Datastream ID should have no spaces, and no special characters. It has to be unique.</label><br>
<span id=datastreamID class=warning></span>
<input type=text size=30 name=datastreamID class='nonempty unique nospace' value='{$datastreamID}'><br>

<h3>Location ID</h3>
<label><p>Must be of existing location. Submission will fail, if ID given here does not exist.</label><br>
<span id=locationID class=warning></span>
<input type=text size=20 name=locationID class='nonempty nospace mustexist' value='{$locationID}'><br>

<h3>Variable Type</h3>
<label><p>max length:50 characters<br>Type of variable. Possible values: water chemistry, water physical parameters, water isotopic composition, biochemistry, channel hydraulics, meteorology, climate. This value is the basis for creating entries in the menu on main (map) page. Care should be taken that there are no typos, as well as not too many very similar types - as this would make menu rather messy.</label><br>
<span id=variableType class=warning></span>
<input type=text size=50 name=variableType class='nonempty' value='{$variableType}'><br>

<h3>Variable Name</h3>
<label><p>max length:50 characters<br>Name of variable. Example: groundwater depth, wind speed, water level, air temperature, electric conductivity, concentration of Ca<sup>+2</sup> </label><br>
<span id=variableName class=warning></span>
<input type=text size=50 name=variableName class='nonempty' value='{$variableName}'><br>

<h3>Variable Unit</h3>
<label><p>max length:50 characters<br>Unit of variable. Example: m/s, m, mg/l </label><br>
<span id=variableUnit class=warning></span>
<input type=text size=50 name=variableUnit class='nonempty' value='{$variableUnit}'><br>

<h3>Base Time</h3>
<label><p>max length:20 characters<br>What period of time does the variable represent. Most of field measurements are instantaneous, data from automatic recording system will be Example: instantaneous, daily, monthly, annual</label><br>
<span id=baseTime class=warning></span>
<input type=text size=20 name=baseTime class='nonempty' value='{$baseTime}'><br>

<h3>Basis Of Record</h3>
<label><p>max length:50 characters<br>possible values: manual measurement, automatic measurement, laboratory measurement</label><br>
<span id=basisOfRecord class=warning></span>
<input type=text size=50 name=basisOfRecord class='none' value='{$basisOfRecord}'><br>

<h3>Sampling Effort</h3>
<label><p>max length:100 characters<br>describes details of sampling. Example: a single measurement, average of 3 measurements, average of 1s samples taken over 1 minute, measurement until stable reading</label><br>
<span id=samplingEffort class=warning></span>
<input type=text size=50 name=samplingEffort class='none' value='{$samplingEffort}'><br>

<h3>Sampling Protocol</h3>
<label><p>max length: 255 characters<br>How were the measurements carried out and with what equipment. Example: A bucket sample from the middle of a channel, measurements carried immediately after sampling with a pre-calibrated EC meter</label><br>
<span id=samplingProtocol class=warning></span>
<textarea cols=80 rows=3 size=255 class=none name=samplingProtocol>{$samplingProtocol}</textarea><br>

<h3>Sample Size - Value</h3>
<label><p>max length:10 characters<br>value reflecting sample size. Example: 1, 250. Leave blank if measurement done in situ, or</label><br>
<span id=sampleSizeValue class=warning></span>
<input type=text size=10 name='sampleSizeValue' class='numeric' value='{$sampleSizeValue}'><br>

<h3>Sample Size - Unit</h3>
<label><p>max length:50 characters<br>Unit of the value reflecting sample size. Example: l, ml. special case: 'in situ' - when measurement was done without sampling</label><br>
<span id=sampleSizeUnit class=warning></span>
<input type=text size=10 class=none name=sampleSizeUnit value='{$sampleSizeUnit}'><br>


<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=envmondata&do={$do}&table=datastream','./?base=envmondata&do=edit&table=datastream&datasetID=$datasetID&locationID=$locationID');>

<input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=envmondata&do=edit&table=datastream&datasetID=$datasetID&locationID=$locationID\"';>
</form>
        ";
    }
} //end envmondata and datastream table



#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# envmondata and measurement table
#
#
# this one is a bit different than the above
# data entry table has two versions - one for monitoring and one for once-off
# the difference is "fluid" - once-off can have more than one measurement at a location
# but once-off will not be shown as time series in the map view
# also, monitoring datastreams have to have a "regular" basetime - 10min, hourly, daily, monthly, annual etc
#
#
if ($base=="envmondata" & $table=="measurement"){
    if ($datasetID=='' && $locationID==''){
        // shows list of datasets
        $query="select datasetID, datasetName from dataset";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h2>Add/edit measurements in environmental monitoring database</h2>";
        echo "<label><p>Select dataset:</label>";
        echo "<table class='table table-striped narrowTable'>";
        echo "<tr class=success><th>Dataset ID<th>Dataset name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datasetID']."<td>".$row['datasetName']."<td><a href='./?base=envmondata&do=edit&table=measurement&datasetID=".$row['datasetID']."' >select</a></tr>";
        }
        echo "</table>";
    }
    if ($datasetID!='' && $locationID==''){
        //shows list of locations for given dataset
        $query="select distinct location.locationID,locationName,locality,baseTime,locationType from datastream join location on datastream.locationID=location.locationID where datasetID='".$datasetID."'";
        $result = $mysqli->query($query);
        echo "<a href=./?base=envmondata&do=edit&table=measurement>back</a>";
        echo "<h2>Add/edit measurements in environmental monitoring database</h2>";
        echo "<h3>Dataset: ".$datasetID."</h3>";
        echo "<label><p>Select location:</label>";
        echo "<table class='table table-striped narrowTable'>";
        echo "<tr class=success><th>Location ID<th>Location name<th>Locality<th>base time<th>type<th></tr>";
        while ($row = $result->fetch_assoc()){
            //echo "<tr><td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['locality']."<td>".$row['baseTime']."<td>".$row['locationType']."<td><a href='./?base=envmondata&do=edit&table=measurement&locationID=".$row['locationID']."&datasetID=".$datasetID."&baseTime=".$row['baseTime']."&locationType=".$row['locationType']."'>select</a></tr>";
            echo "<tr><td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['locality']."<td>".$row['baseTime']."<td>".$row['locationType']."<td><a href=# onClick=editAnyInPopup('env','".$datasetID."','".$row['locationID']."','".$row['locationType']."','".$row['baseTime']."','null')>select</a></tr>";
        }
        echo "</table>";
    }

    if (($locationType=="once-off" || $locationType=='short-term') && $date=='' && $do=='edit' && $locationID!=''){
        //lists all dates for given datastreamID - only for once-off
        $query="select distinct locationID,measurementDateTime from measurement join datastream on measurement.datastreamID=datastream.datastreamID where datastream.locationID='$locationID';";
        $result = $mysqli->query($query);
        echo "<a href=./?base=envmondata&do=edit&table=measurement&datasetID=".$datasetID.">back</a>";
        echo "<h2>Add/edit measurements in environmental monitoring database</h2>";
        echo "<h3>Dataset: ".$datasetID."</h3>";
        echo "<h3>Location: ".$locationID."</h3>";
        echo "<label><p>Select date:</label>";
        echo "<table class='table table-striped narrowTable'>";
        echo "<tr class=success><th>locationID<th>date<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$locationID."<td>".$row['measurementDateTime']."<td><a href='./?base=envmondata&do=edit&table=measurement&datasetID=".$datasetID."&locationID=".$locationID."&date=".$row['measurementDateTime']."&locationType=".$locationType."'>edit</a></tr>";
        }
        echo "</table>";
        echo "<p><a href=\"./?base=envmondata&do=add&table=measurement&datasetID=$datasetID&locationID=$locationID&locationType=once-off\">Add new date and data</a></p>";

    }

    if (($locationType=='once-off'  || $locationType=='short-term') && (($do=='add' && $date=='')|| ($do=='edit' && $date!=''))){
            //shows form for once off measurements
            echo "<a href=./?base=envmondata&do=edit&table=measurement&datasetID=$datasetID&datastreamID=$datastreamID>back</a>";
            if ($do=='add'){
                echo" <h2>Adding measurements to environmental monitoring database</h2>";
            }else{
                echo" <h2>Editing measurements in environmental monitoring database</h2>";
            }
            echo "<h3>Dataset: ".$datasetID."</h3>";
            echo "<h3>Location: ".$locationID."</h3>";
            echo "<input type=hidden name=datasetID value=$datasetID>";
            echo "<input type=hidden name=locationID value=$locationID>";
            echo "Date: <input type=text class=date name=datetime value='$date' onchange='editOnceoffRecords(); return validateField(this);'>";
            echo "<div id=form></div>";
            echo "<script>editOnceoffRecords();</script>";
    }
} //end envmondata and measurements table


#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# envmondata and key datasetreams table
#

if ($base=="envmondata" & $table=="keydatastream"){
    if ($do=="edit"){
        $query="select datastreamID from envmondata.keydatastream";
        $result = $mysqli->query($query);
        $keystreams=array();
        while ($row = $result->fetch_assoc()){
            $keystreams[]=$row['datastreamID'];
        }
        // shows list of locations
        echo "<a href=./>back</a>";
        echo "<h2 class=text-center>Add/remove key monitoring data streams</h2>";
        echo "<table class='table table-striped narrowTable'>";
        echo "<tr class=success><th>Datastream ID<th>Dataset ID<th>Location ID<th>Location Name<th><th>variableName<th></tr>";

        $query="select datastreamID, datasetID, locationName, envmondata.datastream.locationID, variableName from envmondata.datastream left join envmondata.location on envmondata.location.locationID=envmondata.datastream.locationID where envmondata.location.locationType='monitoring'";
        $result = $mysqli->query($query);
        while ($row = $result->fetch_assoc()){
            if (in_Array($row['datastreamID'], $keystreams)){
                echo "<tr><td>".$row['datastreamID']."<td>".$row['datasetID']."<td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['variableName']."<td>already key&nbsp&nbsp<a href='./?base=envmondata&do=removekeydatastream&table=keydatastream&datastreamID=".$row['datastreamID']."' >remove</a></tr>";
            }else{
                echo "<tr><td>".$row['datastreamID']."<td>".$row['datasetID']."<td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['variableName']."<td><a href='./?base=envmondata&do=addkeydatastream&table=keydatastream&datastreamID=".$row['datastreamID']."' >add</a></tr>";
            }
        }
        echo "</table>";
    }else if ($do=="addkeydatastream"){
        echo "<a href=./?base=envmondata&do=edit&table=keydatastream>back</a>";
        $query="insert into envmondata.keydatastream values ('{$datastreamID}')";
	    $result = $mysqli->query($query);
	    if($result){
	        echo "<br>Done";
	    }else{
	        echo "<br>Problems";
	    }
    }else if ($do=="removekeydatastream"){
        echo "<a href=./?base=envmondata&do=edit&table=keydatastream>back</a>";
        $query="delete from envmondata.keydatastream where datastreamID='{$datastreamID}'";
	    $result = $mysqli->query($query);
	    if($result){
	        echo "<br>Done";
	    }else{
	        echo "<br>Problems";
	    }
    }
} //end envmondata and keydatastream table













#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# biodiv and dataset table
#
if ($base=="biodivdata" & $table=="dataset"){
    // resetting dataset variables
    $datasetName="";
    $institutionCode="";
    $ownerInstitutionCode="";
    $datasetLicence="CC BY-NC";
    $datasetRemarks="";
    $datasetDescription="";
    $publications="";
    $subjectScope="";
    $geographicScope="";
    $temporalScope="";
    $samplingApproach="";
    $methodSteps="";
    $qualityControl="";
    $datasetCitation="";

    if ($datasetID=='' && $do!='add'){
        // datasetID is not set - shows list of all datasets
        $query="select datasetID, datasetName from dataset";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h2 class=text-center>View/edit dataset in biodiversity database</h2>";
        echo "<p class=text-center><a href=\"./?base=biodivdata&do=add&table=dataset\">Add new dataset</a></p>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th>datasetID<th>dataset name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datasetID']."<td>".$row['datasetName']."<td><a href='./?base=biodivdata&do=edit&table=dataset&datasetID=".$row['datasetID']."' >edit dataset info</a><br><a href='./?base=biodivdata&do=edit&table=location&datasetID=".$row['datasetID']."' >show locations</tr>";
        }
        echo "</table>";
    }
    if ($datasetID!='' && $do=="edit"){
       // when $datasetID is set through url argument - query database for dataset values
        $query="select * from dataset where datasetID='{$datasetID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $datasetID=$row['datasetID'];
        $datasetName=$row['datasetName'];
        $institutionCode=$row['institutionCode'];
        $ownerInstitutionCode=$row['ownerInstitutionCode'];
        $datasetLicence=$row['datasetLicence'];
        $datasetDescription=$row['datasetDescription'];
        $publications=$row['publications'];
        $datasetRemarks=$row['datasetRemarks'];
        $subjectScope=$row['subjectScope'];
        $geographicScope=$row['geographicScope'];
        $temporalScope=$row['temporalScope'];
        $samplingApproach=$row['samplingApproach'];
        $methodSteps=$row['methodSteps'];
        $qualityControl=$row['qualityControl'];
        $datasetCitation=$row['datasetCitation'];
    }
    if (($datasetID!='' && $do=="edit") || $do=="add"){
     // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=biodivdata&do=edit&table=dataset>back</a>";
        if ($do=="add"){
            echo "<h2>Adding dataset to biodiversity database</h2>";
        }else{
            echo "<h2>Editing dataset in biodiversity database</h2>";
        }
        echo"
<label><p> required fields shaded in yellow-ish</label>

<form id=form action='#' method=post>

<h3>datasetID</h3>
<label><p>max length:10 characters<br>usually three to six letters describing dataset and a year dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty nospace unique' value='{$datasetID}'><br>

<h3>datasetName</h3>
<label><p>max length:100 characters<br>short name describing dataset, to be used in the website, example: Biokavango community-based monitoring, Silica project (2013)</label><br>
<span id=datasetName class=warning></span>
<input type=text size=100 name=datasetName class=nonempty value='{$datasetName}'><br>

<h3>Institution Name</h3>
<label><p>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=institutionCode class=warning></span>
<input type=text size=100 name=institutionCode class=nonempty value='{$institutionCode}'><br>

<h3>Owner Institution Name</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=ownerInstitutionCode class=warning></span>
<input type=text size=100 name=ownerInstitutionCode value='{$ownerInstitutionCode}'><br>

<h3>Dataset Licence</h3>
<label><p><br>Licence under which the dataset is shared</label><br>
<span id=datasetLicence class=warning></span>
<select name=datasetLicence width=20>";
$licenceList=array("CC0","CC BY","CC BY-NC");
foreach ($licenceList as $lic){ 
echo "<option class=nonempty value='$lic' ";
if ($datasetLicence==$lic){
    echo " selected";
}
echo ">$lic</option>";
}
echo "</select>";

echo "

<h3>datasetDescription</h3>
<label><p>max length:900 characters<br>Longer description of the dataset</label><br>
<span id=datasetDescription class=warning></span>
<textarea cols=40 rows=6 size=900 name=datasetDescription class=nonempty>{$datasetDescription}</textarea><br>

<h3>publications</h3>
<label><p>max length:900 characters<br>Publications (papers, reports) associated with the dataset. Separate individual entries with colon (do not use colon IN each of references)</label><br>
<span id=publications class=warning></span>
<textarea cols=40 rows=6 size=900 name=publications>{$publications}</textarea><br>

<h3>datasetRemarks</h3>
<label><p>max length:900 characters<br>Any other remarks you might have</label><br>
<span id=datasetRemarks class=warning></span>
<textarea cols=40 rows=6 size=900 name=datasetRemarks>{$datasetRemarks}</textarea><br>

<h3>Subject scope</h3>
<label><p>max length:250 characters<br>What does this dataset measure?</label><br>
<span id=subjectScope class=warning></span>
<textarea cols=80 rows=4 size=250 name=subjectScope>{$subjectScope}</textarea><br>

<h3>Temporal scope</h3>
<label><p>max length:250 characters<br>What period does this dataset cover?</label><br>
<span id=temporalScope class=warning></span>
<textarea cols=80 rows=4 size=250 name=temporalScope>{$temporalScope}</textarea><br>

<h3>Geographic scope</h3>
<label><p>max length:250 characters<br>What geographic region does this dataset cover?</label><br>
<span id=geographicScope class=warning></span>
<textarea cols=80 rows=4 size=250 name=geographicScope>{$geographicScope}</textarea><br>

<h3>Sampling Approach</h3>
<label><p>max length:900 characters<br>General approach to sampling</label><br>
<span id=samplingApproach class=warning></span>
<textarea cols=80 rows=10 size=900 name=samplingApproach>{$samplingApproach}</textarea><br>

<h3>Method steps</h3>
<label><p>max length:900 characters<br>Detailed steps involved in the process</label><br>
<span id=methodSteps class=warning></span>
<textarea cols=80 rows=10 size=900 name=methodSteps>{$methodSteps}</textarea><br>

<h3>Quality Control</h3>
<label><p>max length:900 characters<br>How was data/sampling quality ensured?</label><br>
<span id=qualityControl class=warning></span>
<textarea cols=80 rows=10 size=900 name=qualityControl>{$qualityControl}</textarea><br>

<h3>Dataset citation</h3>
<label><p>max length:250 characters<br>How should the data be cited</label><br>
<span id=datasetCitation class=warning></span>
<textarea cols=80 rows=4 size=250 name=datasetCitation>{$datasetCitation}</textarea><br>


<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=biodivdata&do={$do}&table=dataset','./?base=biodivdata&do=edit&table=dataset');>

<input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=biodivdata&do=edit&table=dataset\"';>
</form>
        ";
    }
} //end biodiv and dataset table

#
#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# 
// biodivdata and location table
#
#
if ($base=="biodivdata" & $table=="location"){
    // resetting variables
    $locationName="";
    $locality="";
    $decimalLatitude="";
    $decimalLongitude="";
    $coordinateUncertaintyInMeters="";
    $geodeticDatum="";
    $verbatimElevation="";
    $elevationUncertaintyInMeters="";
    $locationType="";
    $geomorphologicalPosition="";
    $countryCode="";
    $locationRemarks="";
    $associatedMedia="";

    if ($datasetID==''){
        //dataset must be defined
        echo "dataset must be defined to list locations <br>";
        echo "<a href=./?base=biodivdata&do=edit&table=dataset>back</a>";
    }
    if ($locationID==''&& $datasetID!='' && $do!='add'){
        //listing locations for given dataset
        $query="select distinct location.locationID, locationName, locality, decimalLongitude, decimalLatitude from location where datasetID='{$datasetID}'";
        $result = $mysqli->query($query);
        echo "<a href=./?base=biodivdata&do=edit&table=dataset>back</a>";
        echo "<h2 class=text-center>View/edit location in biodiversity database</h2>";
        echo "<p class=text-center><a href=\"./?base=biodivdata&do=add&table=location&datasetID={$datasetID}\">Add new location</a></p>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th>locationID<th>locationName<th>locality<th>coordinates<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['locality']."<td>".$row['decimalLongitude']."<br>".$row['decimalLatitude']."<td><a href='./?base=biodivdata&do=edit&table=location&datasetID={$datasetID}&locationID=".$row['locationID']."' >edit</a></tr>";
        }
        echo "</table>";
    }
    if ($locationID!='' && $do=='edit'){
        // when $locationID is set through url argument - query database for location fields
        $query="select * from location where locationID='{$locationID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $locationName=$row['locationName'];
        $locality=$row['locality'];
        $decimalLatitude=$row['decimalLatitude'];
        $decimalLongitude=$row['decimalLongitude'];
        $coordinateUncertaintyInMeters=$row['coordinateUncertaintyInMeters'];
        $geodeticDatum=$row['geodeticDatum'];
        $verbatimElevation=$row['verbatimElevation'];
        $elevationUncertaintyInMeters=$row['elevationUncertaintyInMeters'];
        $locationType=$row['locationType'];
        $geomorphologicalPosition=$row['geomorphologicalPosition'];
        $countryCode=$row['countryCode'];
        $associatedMedia=$row['associatedMedia'];
        $locationRemarks=$row['locationRemarks'];
    }
    if (($locationID!='' && $do=="edit") || $do=="add"){
       // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=biodivdata&do=edit&table=location&datasetID={$datasetID}>back</a>";
        if ($do=="add"){
            echo "<h2>Adding location to biodiversity database</h2>";
        }else{
            echo "<h2>Editing location in biodiversity database</h2>";
        }
echo "
<label><p> required fields shaded in grey</label>

<form id=form action='#' method=post>

<h3>locationID</h3>
<label><p>max length: 20 characters<br>A location can potentially be measured under various datasets. However, typically, datasets, particularly once-off ones, have unique locations. To reconcile this somewhat contradictory requirements, there is no 'hard' link between location and dataset. Instead, locationID reflects its 'source' dataset. LocationID is typically constructed as follows: three letters describing dataset, underscore (\"_\"), and up to 6 characters describing the location, usually either the location code used in the source dataset, or some abbreviation of it. No spaces, no special characters. LocationID has to be unique. Example: mla_nq22, ori_boro </label><br>
<span id=locationID class=warning></span>
<input type=text size=20 name=locationID class='nonempty unique nospace' value='{$locationID}'><br>

<h3>datasetID</h3>
<label><p>Must be of existing dataset. Submission will fail, if ID given here does not exist.</label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty unique nospace' value='{$datasetID}'><br>

<h3>locationName</h3>
<label><p>max length:50 characters<br>short name describing location, to be used in the website. It can too be the full location code used in the original data source. Example: \"Flume at Phelo's floodplain at Nxaraga\" or \"Boro-124w\"</label><br>
<span id=locationName class=warning></span>
<input type=text size=50 name=locationName class=nonempty value='{$locationName}'><br>

<h3>locality</h3>
<label><p>max length:255 characters<br>Longer description of the location. Example: \"East bank of the Xakanaxa lagoon, some 1 km upstream from Camp Okuti\"</label><br>
<span id=locality class=warning></span>
<textarea cols=40 rows=6 size=255 name=locality class=nonempty>{$locality}</textarea><br>

<h3>decimalLongitude</h3>
<label><p>max length:15 characters<br>Longitude expressed in decimal degrees. Example: 19.134567</label><br>
<span id=decimalLongitude class=warning></span>
<input type=text size=15 name=decimalLongitude class='numeric' value='{$decimalLongitude}'><br>

<h3>decimalLatitude</h3>
<label><p>max length:15 characters<br>Latitude expressed in decimal degrees. Example: -21.122345</label><br>
<span id=decimalLatitude class=warning></span>
<input type=text size=15 name=decimalLatitude class='numeric' value={$decimalLatitude}><br>

<h3>coordinateUncertaintyInMeters</h3>
<label><p>max length:10 characters<br>Uncertainty of geographic coordinates in meters. Approximate. Handheld GPS-determined coordinates will typically have uncertainty of 5m. Some locations can be precisely measured with uncertainty of 0.5m or less. Some location, particularly archival ones, position of which is estimated from some desription can have uncertainty in the order of 1000m or even more, up to 10000m </label><br>
<span id=coordinateUncertaintyInMeters class=warning></span>
<input type=text size=10 name=coordinateUncertaintyInMeters class='numeric' value='{$coordinateUncertaintyInMeters}'><br>

<h3>geodeticDatum</h3>
<label><p>max length:10 characters<br>Geodetic Datum. Typically WGS84</label><br>
<span id=geodeticDatum class=warning></span>
<input type=text size=10 name=geodeticDatum class='none' value='{$geodeticDatum}'><br>

<h3>Verbatim Elevation</h3>
<label><p>max length:10 characters<br>Elevation in meters. That should actually be elevation in m a.m.s.l. rather than geoidal height. If you don't know what it means - don't worry, it is not THAT important</label><br>
<span id=verbatimElevation class=warning></span>
<input type=text size=10 name=verbatimElevation class='numeric' value='{$verbatimElevation}'><br>

<h3>Elevation Uncertainty In Meters</h3>
<label><p>max length:10 characters<br>Uncertainty of elevation value, in meters. If from handheld GPS it will be in the order of 10m. Precisely levelled sites can have uncertainty as low as 0.01m. </label><br>
<span id=elevationUncertaintyInMeters class=warning></span>
<input type=text size=10 name=elevationUncertaintyInMeters class='numeric' value='{$elevationUncertaintyInMeters}'><br>

<h3>locationType</h3>
<label><p>max length:50 characters<br>Type of location. Either \"monitoring\", \"short-term\" </label><br>
<span id=locationType class=warning></span>
<input type=text size=50 name=locationType class=nonempty value='{$locationType}'><br>

<h3>geomorphologicalPosition</h3>
<label><p>max length:50 characters<br>geomorphological position of measurement location. Descriptive. Examples: channel, channel bank, lagoon, lagoon centre, lagoon fringe, riparian fringe, island centre, crest of dune etc.</label><br>
<span id=geomorphologicalPosition class=warning></span>
<input type=text size=50 name=geomorphologicalPosition class='' value='{$geomorphologicalPosition}'><br>

<h3>countryCode</h3>
<label><p>max length:2 characters<br>A two letter country code. For Botswana it is BW</label><br>
<span id=countryCode class=warning></span>
<input type=text size=2 name=countryCode class='none' value='{$countryCode}'><br>

<!--
<h3>footprintWKT</h3>
<label><p>max length:1000 characters<br>Reserved for future use. FootprintWKT is a plain text representation of geometry of a measurement location if that is different than a point (e.g. transect, or a polygon). For the time being it is not used as the mapping tool cannot handle other geometries than a point</label><br>
<span id=footprintWKT class=warning></span>
<textarea cols=40 rows=6 size=1000 name=footprintWKT disabled></textarea><br>

<h3>footprintSRS</h3>
<label><p>max length:10 characters<br>Reserved for future use. FootprintSRS is a description of coordinate system in which footprintWKT is defined </label><br>
<span id=footprintSRS class=warning></span>
<input type=text size=10 name=footprintSRS class='numeric' disabled value=''><br>
-->

<h3>locationRemarks</h3>
<label><p>max length:255 characters<br>Any other remarks you might have</label><br>
<span id=locationRemarks class=warning></span>
<textarea cols=40 rows=6 size=255 name=locationRemarks>{$locationRemarks}</textarea><br>

<h3>associatedMedia</h3>
<label><p>upload a photo of measurement location here. File has to be smaller than 2MB</label><br>
<span id=associatedMedia class=warning></span>
";

echo "<div id=associatedMediaDiv>";
if ($associatedMedia){
    echo "<input type=hidden name=associatedMedia class='none' value='{$associatedMedia}'>";
    echo "<img width=400px src='${associatedMedia}'><br><input type=button onClick='removePhoto()' value='Remove this photo'>";
}else{
    echo "<input type=hidden name=associatedMedia class='none' value=''>";
    echo "<input type='file' name='fileToUpload' id='fileToUpload' onChange='activateUpload()'><input type='button' id=uploadButton value='Upload this photo' onClick='uploadPhoto()' disabled>";
}
echo"</div></br>";


echo"<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=biodivdata&do={$do}&table=location','./?base=biodivdata&do=edit&table=location&datasetID=$datasetID');>

<input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=biodivdata&do=edit&table=location&datasetID=$datasetID\"';>
</form>
        ";
    }
} //end biodiv and location table



#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# biodiv and event table
#
#
# structure is a bit weird - this section handles entire "path" to edit occurrence table, i.e. selection of dataset, location and event. Editing events, however, is handled by request event table...
#
#

if ($base=="biodivdata" & $table=="event"){
    if ($datasetID=='' && $locationID==''){
        // shows list of datasets
        $query="select datasetID, datasetName from dataset";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h2 class=text-center>Add/edit sampling events in biodiversity monitoring database</h2>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th>Dataset ID<th>Dataset name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datasetID']."<td>".$row['datasetName']."<td><a href='./?base=biodivdata&do=edit&table=event&datasetID=".$row['datasetID']."' >select</a></tr>";
        }
        echo "</table>";
    }
    if ($datasetID!='' && $locationID==''){
        //shows list of locations for given dataset
        $query="select distinct location.locationID,locationName,locality from  location where datasetID='".$datasetID."'";
	#echo $query;
        $result = $mysqli->query($query);
        echo "<a href=./?base=biodivdata&do=edit&table=event>back</a>";
        echo "<h2 class=text-center>Add/edit event in biodiversity monitoring database</h2>";
        echo "<h3>Current dataset: <b>".$datasetID."</b></h3><br>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th>Location ID<th>Location name<th>Locality<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['locality']."<td><a href='./?base=biodivdata&do=edit&table=event&locationID=".$row['locationID']."&datasetID=".$datasetID."'>select</a></tr>";
        }
        echo "</table>";
    }
    if ($datasetID!='' && $locationID!='' && $eventID==''){
        //shows list of events for given location
        $query="select eventID, eventDate from event where locationID='".$locationID."'";
        $result = $mysqli->query($query);
        echo "<a href=./?base=biodivdata&do=edit&table=event&datasetID={$datasetID}>back</a>";
        echo "<h2 class=text-center>Add/edit event in biodiversity monitoring database</h2>";
        echo "<h3>Current dataset:<b> ".$datasetID."</b></h3>";
        echo "<h3>Current location: <b>".$locationID."</b></h3><br>";
        echo "<p class=text-center><a href=\"./?base=biodivdata&do=add&table=event&datasetID={$datasetID}&locationID={$locationID}\">Add new event</a></p>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th>event ID<th>Event date<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['eventID']."<td>".$row['eventDate']."<td><a href='./?base=biodivdata&do=edit&table=event&locationID=".$locationID."&datasetID=".$datasetID."&eventID=".$row['eventID']."'>edit event</a><br><a href='./?base=biodivdata&do=edit&table=occurrence&locationID=".$locationID."&datasetID=".$datasetID."&eventID=".$row['eventID']."'>edit/add occurrences</a></tr>";
        }
        echo "</table>";
    }

    if ($eventID!=''){
    //resetting variables
    $variableType='';
    $variableName='';
    $variableUnit='';
    $eventDate='';
    $eventTime='';
    $baseTime='';
    $habitat='';
    $basisOfRecord='';
    $samplingEffort='';
    $samplingProtocol='';
    $sampleSizeValue='';
    $sampleSizeUnit='';
    $eventRemarks='';
    $recordedBy='';
   if ($eventID!='' && $do=='edit'){
        // when eventID is set through url argument - query database for event values
        $query="select * from event where eventID='{$eventID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $eventID=$row['eventID'];
        $habitat=$row['habitat'];
        $datasetID=$row['datasetID'];
        $eventDate=$row['eventDate'];
        $eventTime=$row['eventTime'];
        $recordedBy=$row['recordedBy'];
        $eventRemarks=$row['eventRemarks'];
        $locationID=$row['locationID'];
        $basisOfRecord=$row['basisOfRecord'];
        $samplingEffort=$row['samplingEffort'];
        $samplingProtocol=$row['samplingProtocol'];
        $sampleSizeValue=$row['sampleSizeValue'];
        $sampleSizeUnit=$row['sampleSizeUnit'];
    }
    if (($eventID!="" && $do=="edit") || $do=="add"){
        //shows form
        echo "<a href=./?base=biodivdata&do=edit&table=event&datasetID={$datasetID}&locationID={$locationID}>back</a>";
        if($do=="add"){
            echo "<h2>Adding event to biodiversity database</h2>";
        }else{
            echo "<h2>Editing event in biodiversity database</h2>";
        }
        echo" 
<label><p> required fields shaded in grey</label>
<form id=form action='#' method=post>

<h3>eventID</h3>
<label><p>max length:35 characters<br> the source dataset, or some abbreviation of it. No spaces, no special characters. LocationID has to be unique. Example: mla2004_nq22, ori1998_boro </label><br>
<span id=eventID class=warning></span>
<input type=text size=35 name=eventID class='nonempty unique nospace' value='{$eventID}'><br>

<h3>locationID</h3>
<label><p>Must be of existing location. Submission will fail, if ID given here does not exist.</label><br>
<span id=locationID class=warning></span>
<input type=text size=20 name=locationID class='nonempty mustexist nospace' value='{$locationID}'><br>

<h3>habitat</h3>
<label><p>max length:100 characters<br>examples: riverine low open grassed shrubland, low open grassland, grassland, woodland</label><br>
<span id=habitat class=warning></span>
<input type=text size=100 name=habitat class='' value='{$habitat}'><br>

<h3>datasetID</h3>
<label><p>Must be of existing dataset. Submission will fail, if ID given here does not exist already.</label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty mustexist nospace' value='{$datasetID}'><br>

<h3>event date</h3>
<label><p>Date in YYYY-MM-DD format</label><br>
<span id=eventDate class=warning></span>
<input type=text size=10 name=eventDate class='nonempty' value='{$eventDate}'><br>


<h3>event time</h3>
<label><p>Time in hh:mm:ss format. If unknown - put 00:00:00</label><br>
<span id=eventTime class=warning></span>
<input type=text size=10 name=eventTime class='nonempty' value='{$eventTime}'><br>

<h3>basisOfRecord</h3>
<label><p>max length:50 characters<br>possible values: manual measurement, automatic measurement, laboratory measurement</label><br>
<span id=basisOfRecord class=warning></span>
<input type=text size=50 name=basisOfRecord class='nonempty' value='{$basisOfRecord}'><br>

<h3>samplingEffort</h3>
<label><p>max length:255 characters<br>describes details of sampling. Example: a single measurement, average of 3 measurements, average of 1s samples taken over 1 minute, measurement until stable reading</label><br>
<span id=samplingEffort class=warning></span>
<textarea cols=40 rows=6 size=255 name=samplingEffort>{$samplingEffort}</textarea><br>

<h3>samplingProtocol</h3>
<label><p>max length: 255 characters<br>How were the measurements carried out and with what equipment. Example: A bucket sample from the middle of a channel, measurements carried immediately after sampling with a pre-calibrated EC meter</label><br>
<span id=samplingProtocol class=warning></span>
<textarea cols=40 rows=6 size=255 name=samplingProtocol>{$samplingProtocol}</textarea><br>

<h3>sampleSizeValue</h3>
<label><p>max length:10 characters<br>value reflecting sample size. Example: 1, 250. leave blank if measurement done in situ, or</label><br>
<span id=sampleSizeValue class=warning></span>
<input type=text size=10 name=sampleSizeValue class='numeric' value='{$sampleSizeValue}'><br>

<h3>sampleSizeUnit</h3>
<label><p>max length:10 characters<br>Unit of the value reflecting sample size. Example: l, ml. Leave blank if measurement done in situ, or</label><br>
<span id=sampleSizeUnit class=warning></span>
<input type=text size=10 name=sampleSizeUnit class='none' value='{$sampleSizeUnit}'><br>


<h3>recorded by</h3>
<label><p>max length:50 characters<br>Who recorded data</label><br>
<span id=recordedBy class=warning></span>
<input type=text size=50 name=recordedBy class='none' value='{$recordedBy}'><br>

<h3>eventRemarks</h3>
<label><p>max length:255 characters<br>Any other remarks you might have</label><br>
<span id=eventRemarks class=warning></span>
<textarea cols=40 rows=6 size=255 name=eventRemarks>{$eventRemarks}</textarea><br>


<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=biodivdata&do={$do}&table=event','./?base=biodivdata&do=edit&table=event&datasetID=$datasetID&locationID=$locationID');>

<input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=biodivdata&do=edit&table=event&datasetID=$datasetID&locationID=$locationID\"';>
</form>
        ";
    }

    }
} //end biodiv and event table



if ($base=="biodivdata" & $table=="occurrence"){
    if ($eventID!=''){
        //shows form for occurrences
        echo "<a href=./?base=biodivdata&do=edit&table=event&datasetID=$datasetID&locationID=$locationID>back</a>
        <input type=hidden name=datasetID value=$datasetID>
        <input type=hidden name=locationID value=$locationID>
        <input type=hidden name=eventID value=$eventID>
        <h2>Add/edit occurrences in biodiversity database</h2>
        <h3>Dataset:<b> $datasetID</b></h3>
        <h3>Location: <b>$locationID</b></h3>
        <h3>Event: <b>$eventID</b></h3><br>
        <form id=form action='#' method=post>
        <p><span class=clickable onClick=addRow()>add occurrence</span></p>
	    <div id='records_table'></div>
	    <div id='extras'></div>
        <input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=biodivdata&do={$do}&table=occurrence','./?base=biodivdata&do=edit&table=event&datasetID=$datasetID&locationID=$locationID');>
        <input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=biodivdata&do=edit&table=event&datasetID=$datasetID&locationID=$locationID\"';>

        </form>
	    <script>editOccurrences()</script>";
    }
}

#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# biodiv and checklist table
#
#
#

if ($base=="biodivdata" & $table=="checklist"){
    // resetting dataset variables
    $scientificName="";
    $taxonRank="";
    $vernacularName="";
    $setswanaName="";
    $kingdom="";
    $phyllum="";
    $order="";
    $class="";
    $family="";
    $genus="";
    $species="";
    $parentNameUsageID="";
    $acceptedNameUsageID="";
    if ($taxonID=='' && $do!='add'){
        // shows list of species
        $query="select taxonID, scientificName from checklist";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h2 class=text-center>Add/edit checklist entries in biodiversity monitoring database</h2>";
        echo "<p class=text-center><a href=\"./?base=biodivdata&do=add&table=checklist\">Add new entry</a></p>";
        echo "<table class='table table-striped narrowTable'>";
        echo "<tr class=success><th>taxonID<th>Scientific name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['taxonID']."<td>".$row['scientificName']."<td><a href='./?base=biodivdata&do=edit&table=checklist&taxonID=".$row['taxonID']."' >edit</a></tr>";
        }
        echo "</table>";
    }
    if ($taxonID!='' && $do=="edit"){
       // when $taxonID is set through url argument - query database for checklist values
        $query="select * from checklist where taxonID='{$taxonID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $taxonRank=$row['taxonRank'];
        $scientificName=$row['scientificName'];
        $vernacularName=$row['vernacularName'];
        $setswanaName=$row['setswanaName'];
        $kingdom=$row['kingdom'];
        $phyllum=$row['phyllum'];
        $order=$row['order'];
        $class=$row['class'];
        $family=$row['family'];
        $genus=$row['genus'];
        $species=$row['species'];
        $parentNameUsageID=$row['parentNameUsageID'];
        $acceptedNameUsageID=$row['acceptedNameUsageID'];
    }
    if (($taxonID!='' && $do=="edit") || $do=="add"){
     // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=biodivdata&do=edit&table=checklist>back</a>";
        if ($do=="add"){
            echo "<h2>Adding checklist entry to biodiversity database</h2>";
        }else{
            echo "<h2>Editing checklist entry in biodiversity database</h2>";
        }
        echo"
<label><p> required fields shaded in grey</label>
<form id=form action='#' method=post>

<h3>taxonID</h3>
<label><p>max length:10 characters<br>usually three to six letters describing dataset and a year dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=8 name=taxonID class='nonempty nospace unique' value='{$taxonID}'><br>

<h3>taxonRank</h3>
<label><p>max length:10 characters<br>usually three to six letters describing dataset and a year dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=8 name=taxonRank class=nonempty value='{$taxonRank}'><br>


<h3>scientificName</h3>
<label><p>max length:50 characters<br>short name describing dataset, to be used in the website, example: Biokavango community-based monitoring, Silica project (2013)</label><br>
<span id=datasetName class=warning></span>
<input type=text size=50 name=scientificName class=nonempty value='{$scientificName}'><br>

<h3>vernacularName</h3>
<label><p>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=vernacularName class=warning></span>
<input type=text size=50 name=vernacularName value='{$vernacularName}'><br>

<h3>setswanaName</h3>
<label><p>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=setswanaName class=warning></span>
<input type=text size=50 name=setswanaName value='{$setswanaName}'><br>

<h3>kingdom</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=kingdom class=warning></span>
<input type=text size=50 name=kingdom class=nonempty value='{$kingdom}'><br>

<h3>phyllum</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=phyllum class=warning></span>
<input type=text size=50 name=phyllum value='{$phyllum}'><br>

<h3>order</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=order class=warning></span>
<input type=text size=50 name=order value='{$order}'><br>

<h3>class</h3>
<label><p>max length:50 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=class class=warning></span>
<input type=text size=50 name=class value='{$class}'><br>

<h3>family</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=family class=warning></span>
<input type=text size=50 name=family value='{$family}'><br>

<h3>genus</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=genus class=warning></span>
<input type=text size=50 name=genus value='{$genus}'><br>

<h3>species</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=species class=warning></span>
<input type=text size=50 name=species value='{$species}'><br>

<h3>parentNameUsageID</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=parentNameUsageID class=warning></span>
<input type=text size=50 name=parentNameUsageID value='{$parentNameUsageID}'><br>

<h3>acceptedNameUsageID</h3>
<label><p>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=acceptedNameUsageID class=warning></span>
<input type=text size=50 name=acceptedNameUsageID value='{$acceptedNameUsageID}'><br>

<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=envmondata&do={$do}&table=checklist','./?base=envmondata&do=edit&table=checklist');>

<input type='button' class='button' value=' Cancel ' onClick='window.location=\"./?base=biodivdata&do=edit&table=checklist\"';>

</form>
        ";
    }
} //end biodiv and dataset table



#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# user and user table
#

if ($base=="users" & $table=="users"){
    // resetting dataset variables
//    $userID="";
    $firstName="";
    $lastName="";
    $emailAddress="";
    $organization="";
    $userType="";
    $dateRegistered="";
    $lastLoggedIn="";
    $lastIpAddress="";

    if ($userID!="" && $do=='delete'){
        echo "deleting user ".$userID;
    }

    if ($userID=="" && $do!='add'){
	$query="select * from users.users";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h2 class=text-center>View/edit registered users database</h2>";
        echo "<p class=text-center><a href=\"./?base=users&do=add&table=users\">Add user</a></p>";
        echo "<table class='table table-striped' >";
        echo "<tr class=success><th>name<th>e-mail<th>type<th>last logged in<th>last IP<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['firstName']." ".$row['lastName']."<td>".$row['emailAddress']."<td>".$row['userType']."<td>".$row['lastLoggedIn']."<td>".$row['lastIpAddress']."<td><a href='./?base=users&do=edit&table=users&userID=".$row['userID']."' >edit</a>&nbsp<a href='./?base=users&do=delete&table=users&userID=".$row['userID']."' >delete</a>&nbsp<a href='./?base=users&do=edit&table=ownership&userID=".$row['userID']."' >edit ownership</a></tr>";
        }
        echo "</table>";
    }

    if ($userID!='' && $do=="edit"){
       // when $datasetID is set through url argument - query database for dataset values
        $query="select * from users.users where userID='{$userID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $userID=$row['userID'];
        $firstName=$row['firstName'];
        $lastName=$row['lastName'];
        $organization=$row['organization'];
        $emailAddress=$row['emailAddress'];
        $userType=$row['userType'];
        $dateRegistered=$row['dateRegistered'];
        $lastLoggedIn=$row['lastLoggedIn'];
        $lastIpAddress=$row['lastIpAddress'];
    }

    if (($userID!='' && $do=="edit") || $do=="add"){
     // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=users&do=edit&table=users>back</a>";
        if ($do=="add"){
            echo "<h2>Adding user to database</h2>";
        }else{
            echo "<h2>Editing user in database</h2>";
        }
        echo"
<label><p> required fields shaded in grey</label>
<form id=form action='#' method=post>

<h3>userID</h3>
<label><p>cannot be changed<br></label><br>
<span id=userID class=warning></span>
<input type=text size=10 name=userID0 value='{$userID}' disabled><br>
<input type=text size=10 name=userID value='{$userID}' hidden><br>

<h3>First Name</h3>
<label><p>max length:50 </label><br>
<span id=firstName class=warning></span>
<input type=text size=50 name=firstName class=nonempty value='{$firstName}'><br>

<h3>Last Name</h3>
<label><p>max length:50 </label><br>
<span id=lastName class=warning></span>
<input type=text size=50 name=lastName class=nonempty value='{$lastName}'><br>

<h3>Email Address</h3>
<label><p>max length:100 characters<br>Email address</label><br>
<span id=emailAddress class=warning></span>
<input type=text size=100 name=emailAddress class='nonempty unique nospace' value='{$emailAddress}'><br>

<h3>Organization Name</h3>
<label><p>max length:100 characters<br>Name of institution/organization. Put 'private individual' if organization is not relevant</label><br>
<span id=organization class=warning></span>
<input type=text size=100 name=organization class=nonempty value='{$organization}'><br>

<h3>User Type</h3>
<label><p>either 'registered' or 'admin'</label><br>
<span id=userType class=warning></span>
<input type=text size=20 name=userType class=nonempty value='{$userType}'><br>

<h3>Date Registered</h3>
<label><p>Cannot be changed</label><br>
<span id=dateRegistered class=warning></span>
<input type=text size=50 name=dateRegistered value='{$dateRegistered}' disabled><br>

<h3>Last Logged In</h3>
<label><p>Cannot be changed</label><br>
<span id=lastLoggedIn class=warning></span>
<input type=text size=50 name=lastLoggedIn value='{$lastLoggedIn}' disabled><br>

<h3>Last IP</h3>
<label><p>Cannot be changed</label><br>
<span id=lastIpAddress class=warning></span>
<input type=text size=50 name=lastIpAddress value='{$lastIpAddress}' disabled><br>

<h3>Password</h3>
<label><p>If you have to..</label><br>
<span id=password class=warning></span>
<input type=password size=50 name=password value=''><br>


<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=users&do={$do}&table=users','./?base=users&do=edit&table=users');>
</form>
        ";
    }
} //end user and user table

if ($base=="users" & $table=="ownership"){
    if ($do=="edit"){
        $query="select * from users.ownership where userID='{$userID}'";
        $result = $mysqli->query($query);
        echo "<a href=./?base=users&do=edit&table=users>back</a>";
        echo "<h2 class=text-center>Dataset/location ownership for user:{$userID} </h2>";
        echo "<p class=text-center><a href=\"./?base=users&do=listDatasets&table=ownership&userID={$userID}\">Add new ownership</a></p>";
        echo "<table class='table table-striped'>";
        echo "<tr class=success><th>itemID<th></tr>";
        while ($row = $result->fetch_assoc()){
            $ownedItemID=$row['ownedItemID'];
            echo "<tr><td>".$row['ownedItemID']."<td>&nbsp<a href='./?base=users&do=delete&table=ownership&userID=".$row['userID']."&ownedItemID=".$row['ownedItemID']."'>delete</a></tr>";
        }
        echo "</table>";
    }else if ($do=="delete"){
        echo "<a href=./?base=users&do=edit&table=ownership&userID={$userID}>back</a>";
        $query="delete from users.ownership where userID={$userID} and ownedItemID='{$ownedItemID}'";
	$result = $mysqli->query($query);
	if($result){
	    echo "<br>Done";
	}else{
	    echo "<br>Problems...";
	}
    }else if ($do=="listDatasets"){
	//check which items are owned
        $query="select ownedItemID from users.ownership where userID='{$userID}'";
        $result = $mysqli->query($query);
	$owneditems=array();
	while ($row = $result->fetch_assoc()){
	    $owneditems[]=$row['ownedItemID'];
	}
        echo "<a href=./?base=users&do=edit&table=ownership&userID={$userID}>back</a>";
        echo "<h2>View/edit dataset/location ownership</h2>";
        echo "<table class='table table-striped narrowTable' >";
        echo "<tr class=success><th>Database<th>datasetID<th><th></tr>";
	$query="select datasetID from envmondata.dataset";
        $result = $mysqli->query($query);
	while ($row = $result->fetch_assoc()){
	    //check if already owner
	    if (in_Array($row['datasetID'], $owneditems)){
	        echo "<tr><td>envmon<td>".$row['datasetID']."<td>already owned <td>&nbsp</tr>";
	    }else{
	        echo "<tr><td>envmon<td>".$row['datasetID']."<td>&nbsp<a href='./?base=users&do=addownershipDataset&table=ownership&userID=".$userID."&ownedItemID=".$row['datasetID']."'>add entire dataset</a><td>&nbsp<a href='./?base=users&do=listLocations&table=ownership&userID=".$userID."&datasetID=".$row['datasetID']."&databaseID=envmondata'>select locations</a></tr>";
	    }
        }
        $query="select datasetID from biodivdata.dataset";
        $result = $mysqli->query($query);
        while ($row = $result->fetch_assoc()){
	    if (in_Array($row['datasetID'], $owneditems)){
	        echo "<tr><td>envmon<td>".$row['datasetID']."<td>already owned <td>&nbsp</tr>";
	    }else{
	        echo "<tr><td>envmon<td>".$row['datasetID']."<td>&nbsp<a href='./?base=users&do=addownershipDataset&table=ownership&userID=".$userID."&ownedItemID=".$row['datasetID']."'>add entire dataset</a><td>&nbsp<a href='./?base=users&do=listLocations&table=ownership&userID=".$userID."&datasetID=".$row['datasetID']."&databaseID=envmondata'>select locations</a></tr>";
	    }
	}
        echo "</table>";

    }else if ($do=="addownershipDataset"){
        echo "<a href=./?base=users&do=edit&table=ownership&userID={$userID}>back</a>";
        $query="insert into users.ownership values ({$userID}, '{$ownedItemID}')";
	$result = $mysqli->query($query);
	if($result){
	    echo "<br>Done";
	}else{
	echo "<br>Problems";
	}
    }else if ($do=="addownershipLocation"){
        echo "<a href=./?base=users&do=edit&table=ownership&userID={$userID}>back</a>";
        $query="insert into users.ownership values ({$userID}, '{$locationID}')";
	$result = $mysqli->query($query);
	if($result){
	    echo "<br>Done";
	}else{
	echo "<br>Problems";
	}

    }else if ($do=="listLocations"){
        $query="select ownedItemID from users.ownership where userID='{$userID}'";
        $result = $mysqli->query($query);
	$owneditems=array();
	while ($row = $result->fetch_array()){
	    $owneditems[]=$row['ownedItemID'];
	}
        echo "<a href=./?base=users&do=edit&table=ownership&userID={$userID}>back</a>";
        echo "<h2>View/edit dataset/location ownership</h2>";
        echo "<table class='table table-striped narrowTable'>";
        echo "<tr class=success><th>datasetID<th><th></tr>";
        $query="select * from {$databaseID}.location where datasetID='{$datasetID}'";
	$result = $mysqli->query($query);
	while ($row = $result->fetch_assoc()){
	    if (in_Array($row['locationID'], $owneditems)){
		echo "<tr><td>".$row['locationID']."<td>already owned <td>&nbsp</tr>";
	    }else{
                echo "<tr><td>".$row['locationID']."<td>&nbsp<a href='./?base=users&do=addownershipLocation&table=ownership&userID=".$userID."&locationID=".$row['locationID']."'>add this location</a></tr>";
	    }
        }
        echo "</table>";
    }
}


echo"
<div id='popupBackground'></div>
<div id='popupWindow'></div>
</div>
</div>
</body>
</html>";
}//end authorized user check
?>
