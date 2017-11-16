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
include '/.creds/.credentials.php';

#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
//possible values: env, biodiv or admin
if(isset($_REQUEST['base'])){
        $base = $_REQUEST['base'];
}else{
    //this makes sure base is not empty
    $base="admin";
}

//possible values: add, edit
if(isset($_REQUEST['do'])){
    $do  = $_REQUEST['do'];
}else{
    $do="";
}

//possible values: 
//for env: dataset, location, datastream, measurement
//for biodiv: dataset, event, location, checklist, occurrence
//for staff: not yet determined
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


// opening database link
$mysqli->select_db($base);




#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
echo"
<!DOCTYPE html>
<html lang=\"en\">
<head>
<title>Okavango Data</title>
<meta charset=\"UTF-8\">
<meta name=\"description\" content=\"Okavango biodiversity and environmental monitoring\">
<script type=\"text/javascript\" src=\"../js/jquery/jquery-3.2.0.min.js\"></script>
<script type=\"text/javascript\" src=\"../js/bootstrap/bootstrap-datetimepicker.min.js\"></script>
<script type=\"text/javascript\" src=\"../js/bootstrap/bootstrap.min.js\"></script>
<script type=\"text/javascript\" src=\"../js/custom/forms.js\"></script>
<script type=\"text/javascript\" src=\"../js/custom/popup.js\"></script>
<link rel=\"stylesheet\" href=\"../css/bootstrap-datetimepicker.css\">
<link rel=\"stylesheet\" href=\"../css/main.css\">
<link rel=\"stylesheet\" href=\"../css/admin.css\">
<link rel=\"stylesheet\" href=\"../css/popup.css\">
<!--
<link rel=\"stylesheet\" href=\"../css/bootstrap.css\">
-->
</head>
<body>
";

#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//home button
echo"<a href=\"./\">home</a><br><br>";

// this is a "plain" call - shows menu
if ($base=="admin" | ($do=="" & $table=="")){
echo "
<table width=800px>
<tr><th>biodiversity database<th></tr>
<tr><td>Management of database structure, adding/editing datasets and locations<td><a href=\"./?base=biodivdata&do=edit&table=dataset\">go</a></tr>
<tr><td>Add/edit events and occurrences<td><a href=\"./?base=biodivdata&do=edit&table=occurrence\">go</a></tr>
<!--<tr><td>Add/edit measurements/facts<td><a href=\"./?base=biodivdata&do=edit&table=measurementorfact\">go</a></tr>
-->
<tr><td>Checklist</><td><a href=\"./?base=biodivdata&do=edit&table=checklist\">edit</a></tr>
<tr><th>environmental database<th></tr>
<tr><td>Management of database structure, adding/editing datasets and locations and datastreams<td><a href=\"./?base=envmondata&do=edit&table=dataset\">go</a></tr>
<tr><td>Add/edit measurements<td><a href=\"./?base=envmondata&do=edit&table=measurement\">go</a></tr>
<tr><th>Site admin<th></tr>
<tr><td>Users</><td><a href=\"./saddusr.php\">new</a>&nbsp&nbsp<a href=\"./seditusr.php\">edit</a></tr>
</table>
";
}

#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# envmondata and dataset table
#
if ($base=="envmondata" & $table=="dataset"){
    // resetting dataset variables
    $datasetName="";
    $institutionCode="";
    $ownerInstitutionCode="";
    $datasetDescription="";
    $publications="";
    $datasetRemarks="";
    if ($datasetID=='' && $do!='add'){
        // datasetID is not set - shows list of all datasets
        $query="select datasetID, datasetName from dataset";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h3>View/edit dataset in environmental database</h3>";
        echo "<b><a href=\"./?base=envmondata&do=add&table=dataset\">Add new dataset</a></b>";
        echo "<table class=twoColour width=800px>";
        echo "<tr><th>datasetID<th>dataset name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datasetID']."<td>".$row['datasetName']."<td><a href='./?base=envmondata&do=edit&table=dataset&datasetID=".$row['datasetID']."' >edit dataset</a><br><a href='./?base=envmondata&do=edit&table=location&datasetID=".$row['datasetID']."' >show locations</a></tr>";
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
        $datasetDescription=$row['datasetDescription'];
        $publications=$row['publications'];
        $datasetRemarks=$row['datasetRemarks'];
    }
    if (($datasetID!='' && $do=="edit") || $do=="add"){
     // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=envmondata&do=edit&table=dataset>back</a>";
        if ($do=="add"){
            echo "<h3>Adding dataset to environmental monitoring database</h3>";
        }else{
            echo "<h3>Editing dataset in environmental monitoring database</h3>";
        }
        echo"
<label> required fields shaded in yellow-ish</label>
<form id=form action='#' method=post>
<h4>Dataset ID</h4>
<label>max length:10 characters<br>usually three to six letters describing dataset and a year when the dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty nospace unique' value='{$datasetID}'><br>

<h4>Dataset Name</h4>
<label>max length:50 characters<br>short name describing dataset, to be used to identify the dataset in the website, example: Biokavango community-based monitoring, Silica project (2013)</label><br>
<span id=datasetName class=warning></span>
<input type=text size=50 name=datasetName class=nonempty value='{$datasetName}'><br>

<h4>Project or Institution Name</h4>
<label>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=institutionCode class=warning></span>
<input type=text size=100 name=institutionCode class=nonempty value='{$institutionCode}'><br>

<h4>Legal Institutional Owner</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=ownerInstitutionCode class=warning></span>
<input type=text size=100 name=ownerInstitutionCode value='{$ownerInstitutionCode}'><br>

<h4>Dataset Description</h4>
<label>max length:900 characters<br>Longer description of the dataset</label><br>
<span id=datasetDescription class=warning></span>
<textarea cols=80 rows=10 size=900 name=datasetDescription >{$datasetDescription}</textarea><br>

<h4>Publications</h4>
<label>max length:900 characters<br>Publications (papers, reports) associated with the dataset. Separate individual entries with colon (do not use colon IN each of references)</label><br>
<span id=publications class=warning></span>
<textarea cols=80 rows=10 size=900 name=publications>{$publications}</textarea><br>

<h4>Dataset Remarks</h4>
<label>max length:900 characters<br>Any other remarks you might have</label><br>
<span id=datasetRemarks class=warning></span>
<textarea cols=80 rows=10 size=900 name=datasetRemarks>{$datasetRemarks}</textarea><br>

<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=envmondata&do={$do}&table=dataset','./?base=envmondata&do=edit&table=dataset');>

        
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
    $altitude="";
    $altitudeUncertaintyInMeters="";
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
        echo "<a href=./?base=envmondata&do=edit&table=dataset>back</a>";
    }
    if ($locationID==''&& $datasetID!='' && $do!='add'){
        //listing locations for given dataset
        $query="select distinct location.locationID, locationName, locality, decimalLongitude, decimalLatitude from location join datastream on datastream.locationID=location.locationID where datasetID='{$datasetID}'";
        $result = $mysqli->query($query);
        echo "<a href=./?base=envmondata&do=edit&table=dataset>back</a>";
        echo "<h3>View/edit location in environmental monitoring database</h3>";
        echo "<b><a href=\"./?base=envmondata&do=add&table=location&datasetID={$datasetID}\">Add new location</a></b>";
        echo "<table width=800px class=twoColour>";
        echo "<tr><th width=100px>locationID<th width=100px >locationName<th width=100px>locality<th width=100px>coordinates<th width=300px></tr>";
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
        $altitude=$row['altitude'];
        $altitudeUncertaintyInMeters=$row['altitudeUncertaintyInMeters'];
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
            echo "<h3>Adding location to environmental monitoring database</h3>";
        }else{
            echo "<h3>Editing location to environmental monitoring database</h3>";
        }
echo"
<label> required fields shaded in grey</label>

<form id=form action='#' method=post>

<h4>Location ID</h4>
<label>max length:10 characters<br>A location belongs to a given dataset. Even if measurements are carried out at the same place, but belong to different datasets, they will fall under different locations. LocationID is typically constructed as follows: three letters describing dataset, underscore (\"_\"), and up to 6 characters describing the location, usually either the location code used in the source dataset, or some abbreviation of it. No spaces, no special characters. LocationID has to be unique. Example: mla_nq22, ori_boro </label><br>
<span id=locationID class=warning></span>
<input type=text size=10 name=locationID class='nonempty unique nospace' value='{$locationID}'><br>

<h4>Dataset ID</h4>
<label>Must be of existing dataset. Submission will fail, if ID given here does not exist already. Normally, the dataset ID field is 'preloaded'</label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty mustexist nospace' value='{$datasetID}'><br>

<h4>Location Name</h4>
<label>max length:50 characters<br>short name describing location, to be used in the website. It can too be the full location code used in the original data source. Example: \"Flume at Phelo's floodplain at Nxaraga\" or \"Boro-124w\"</label><br>
<span id=locationName class=warning></span>
<input type=text size=50 name=locationName class=nonempty value='{$locationName}'><br>

<h4>Locality or description of location</h4>
<label>max length:100 characters<br>Longer description of the location. Example: \"East bank of the Xakanaxa lagoon, some 1 km upstream from Camp Okuti\"</label><br>
<span id=locality class=warning></span>
<input type=text size=100 name=locality class=nonempty value='{$locality}'><br>

<h4>decimalLatitude</h4>
<label>max length:15 characters<br>Latitude expressed in decimal degrees. Example: -21.122345</label><br>
<span id=decimalLatitude class=warning></span>
<input type=text size=15 name=decimalLatitude class='numeric' value={$decimalLatitude}><br>

<h4>decimalLongitude</h4>
<label>max length:15 characters<br>Longitude expressed in decimal degrees. Example: 19.134567</label><br>
<span id=decimalLongitude class=warning></span>
<input type=text size=15 name=decimalLongitude class='numeric' value='{$decimalLongitude}'><br>

<h4>coordinateUncertaintyInMeters</h4>
<label>max length:10 characters<br>Uncertainty of geographic coordinates in meters. Approximate. Handheld GPS-determined coordinates will typically have uncertainty of 5m. Some locations can be precisely measured with uncertainty of 0.5m or less. Some location, particularly archival ones, position of which is estimated from some desription can have uncertainty in the order of 1000m or even more, up to 10000m </label><br>
<span id=coordinateUncertaintyInMeters class=warning></span>
<input type=text size=10 name=coordinateUncertaintyInMeters class='numeric' value='{$coordinateUncertaintyInMeters}'><br>

<h4>geodeticDatum</h4>
<label>max length:10 characters<br>Geodetic Datum. Typically WGS84</label><br>
<span id=geodeticDatum class=warning></span>
<input type=text size=10 name=geodeticDatum value='{$geodeticDatum}'><br>

<h4>altitude</h4>
<label>max length:10 characters<br>Altitude in meters. That should actually be elevation in m a.m.s.l. rather than geoidal height. If you don't know what it means - don't worry, it is not THAT important</label><br>
<span id=altitude class=warning></span>
<input type=text size=10 name=altitude class='numeric' value='{$altitude}'><br>

<h4>altitudeUncertaintyInMeters</h4>
<label>max length:10 characters<br>Uncertainty of altitude value, in meters. If from handheld GPS it will be in the order of 10m. Precisely levelled sites can have uncertainty as low as 0.01m. </label><br>
<span id=altitudeUncertaintyInMeters class=warning></span>
<input type=text size=10 name=altitudeUncertaintyInMeters class='numeric' value='{$altitudeUncertaintyInMeters}'><br>

<h4>locationType</h4>
<label>max length:50 characters<br>Type of location. Either \"monitoring\" or \"short-term\"</label><br>
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


<h4>parentLocationID</h4>
<label>max length: 10 characters<br>Some sites have subsites. For example, one can measure water chemistry at one location at several depths, or measure vegetation cover along a short transect, or measure wind speed at two different heights abouve grond. To accomodate this, the database allows for defining 'parent' and 'child' locations. Child location is identified by having a parentLocationID that is non-empty and different from its own locationID. One has to create parent location before one can create child location. Unfortunately, for the sake of consistency, child location has to have all the necessary variables filled out, as if it was an independent location. parentLocationID should have no spaces and no special characters. Obviously, the field might be left empty, if given location does not have parent.</label><br> 

<span id=parentLocationID class=warning></span>
<input type=text size=10 name=parentLocationID class='nospace mustexist' value='{$parentLocationID}'><br>

<h4>childLocationValue</h4>
<label>max length:10 characters<br> value describing relationship between child and parent location. It can be distance along transect, depth, or simply a number reflecting a subsite, or a number describing a sequential sample</label><br>
<span id=childLocationValue class=warning></span>
<input type=text size=10 name=childLocationValue class='nospace numeric' value='{$childLocationValue}'><br>

<h4>childLocationUnit</h4>
<label>max length:20 characters<br> unit for the value describing relationship between child and parent location. It can be m, or cm, or 'sample', 'point on transect' etc.</label><br>
<span id=childLocationUnit class=warning></span>
<input type=text size=20 name=childLocationUnit class=none value='{$childLocationUnit}'><br>


<h4>geomorphologicalPosition</h4>
<label>max length:100 characters<br>geomorphological position of measurement location. Descriptive. Examples: channel, channel bank, lagoon, lagoon centre, lagoon fringe, riparian fringe, island centre, crest of dune etc.</label><br>
<span id=geomorphologicalPosition class=warning></span>
<input type=text size=100 name=geomorphologicalPosition class='' value='{$geomorphologicalPosition}'><br>

<h4>countryCode</h4>
<label>max length:2 characters<br>A two letter country code. For Botswana it is BW</label><br>
<span id=countryCode class=warning></span>
<input type=text size=2 name=countryCode class='none' value='{$countryCode}'><br>

<h4>locationOwner</h4>
<label>max length:100 characters<br>if location is an established monitoring site, it is the name of an institution to whom that location belongs, or the name of an individual who 'owns' that location. For example: Island Safari Lodge, or Department of Water Affairs</label><br>
<span id=locationOwner class=warning></span>
<input type=text size=100 name=locationOwner value='{$locationOwner}'><br>


<h4>locationRemarks</h4>
<label>max length:255 characters<br>Any other remarks you might have</label><br>
<span id=locationRemarks class=warning></span>
<textarea cols=40 rows=6 size=255 name=locationRemarks>{$locationRemarks}</textarea><br>

<h4>Associated Media</h4>
<label>upload a photo of measurement location here. For the time being not functional</label><br>
<span id=associatedMedia class=warning></span>
<input type=text size=10 name=associatedMedia class='none' disabled value='{$associatedMedia}'><br>

<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\",'base=envmondata&do={$do}&table=location','./?base=envmondata&do=edit&table=dataset');>

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
        echo "<h3>View/edit datastream in environmental monitoring database</h3>";
        echo "<b><a href=\"./?base=envmondata&do=add&table=datastream&datasetID={$datasetID}&locationID={$locationID}\">Add new datastream</a></b>";
        echo "<table width=800px class=twoColour>";
        echo "<tr><th>datastreamID<th>locationID<th>Name of variable<th>Base time<th></tr>";
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
            echo "<h3>Adding datastream to environmental monitoring database</h3>";
        }else{
            echo "<h3>Editing datastream in environmental monitoring database</h3>";
        }
        echo" 
<label> required fields shaded in grey</label>

<!--
<form id=form action=# method=post onSubmit='return validateForm(this,\"{$do}\")'>
<form id=aform action='./submit.php?base=envmondata&do={$do}&table=datastream' method=post>
<form id=form action='#' method='POST' onSubmit='return validateForm(this,\"{$do}\")'>
<form id=form action='#' method='POST'>
-->
<form id=temp action='./submit.php?base=envmondata&do={$do}&table=datastream' method=post onSubmit='return validateForm(this,\"{$do}\")'>

<h4>Datastream ID</h4>
<label>max length:20 characters<br> DatastreamID is composed of two elements: locationID and a code for variable. Those are separeted by underscore '_'. Note that locationID is composed of dataset code (ffirst three letters) and location code (up to 6 letters after the underscore). So the datastreamID will have three parts separated by underscores. Example: mla_nq22_DO, ori_boro_wlevel. Datastream ID should have no spaces, and no special characters. It has to be unique.</label><br>
<span id=datastreamID class=warning></span>
<input type=text size=20 name=datastreamID class='nonempty unique nospace' value='{$datastreamID}'><br>

<h4>Location ID</h4>
<label>Must be of existing location. Submission will fail, if ID given here does not exist.</label><br>
<span id=locationID class=warning></span>
<input type=text size=10 name=locationID class='nonempty nospace mustexist' value='{$locationID}'><br>

<h4>Variable Type</h4>
<label>max length:50 characters<br>Type of variable. Possible values: water chemistry, water physical parameters, water isotopic composition, biochemistry, channel hydraulics, meteorology, climate. This value is the basis for creating entries in the menu on main (map) page. Care should be taken that there are no typos, as well as not too many very similar types - as this would make menu rather messy.</label><br>
<span id=variableType class=warning></span>
<input type=text size=50 name=variableType class='nonempty' value='{$variableType}'><br>

<h4>Variable Name</h4>
<label>max length:50 characters<br>Name of variable. Example: groundwater depth, wind speed, water level, air temperature, electric conductivity, concentration of Ca<sup>+2</sup> </label><br>
<span id=variableName class=warning></span>
<input type=text size=50 name=variableName class='nonempty' value='{$variableName}'><br>

<h4>Variable Unit</h4>
<label>max length:50 characters<br>Unit of variable. Example: m/s, m, mg/l </label><br>
<span id=variableUnit class=warning></span>
<input type=text size=50 name=variableUnit class='nonempty' value='{$variableUnit}'><br>

<h4>Base Time</h4>
<label>max length:20 characters<br>What period of time does the variable represent. Most of field measurements are instantaneous, data from automatic recording system will be Example: instantaneous, daily, monthly, annual</label><br>
<span id=baseTime class=warning></span>
<input type=text size=20 name=baseTime class='nonempty' value='{$baseTime}'><br>

<h4>Basis Of Record</h4>
<label>max length:50 characters<br>possible values: manual measurement, automatic measurement, laboratory measurement</label><br>
<span id=basisOfRecord class=warning></span>
<input type=text size=50 name=basisOfRecord class='none' value='{$basisOfRecord}'><br>

<h4>Sampling Effort</h4>
<label>max length:100 characters<br>describes details of sampling. Example: a single measurement, average of 3 measurements, average of 1s samples taken over 1 minute, measurement until stable reading</label><br>
<span id=samplingEffort class=warning></span>
<input type=text size=50 name=samplingEffort class='none' value='{$samplingEffort}'><br>

<h4>Sampling Protocol</h4>
<label>max length: 255 characters<br>How were the measurements carried out and with what equipment. Example: A bucket sample from the middle of a channel, measurements carried immediately after sampling with a pre-calibrated EC meter</label><br>
<span id=samplingProtocol class=warning></span>
<textarea cols=80 rows=3 size=255 class=none name=samplingProtocol>{$samplingProtocol}</textarea><br>

<h4>Sample Size - Value</h4>
<label>max length:10 characters<br>value reflecting sample size. Example: 1, 250. Leave blank if measurement done in situ, or</label><br>
<span id=sampleSizeValue class=warning></span>
<input type=text size=10 name='sampleSizeValue' class='numeric' value='{$sampleSizeValue}'><br>

<h4>Sample Size - Unit</h4>
<label>max length:50 characters<br>Unit of the value reflecting sample size. Example: l, ml. special case: 'in situ' - when measurement was done without sampling</label><br>
<span id=sampleSizeUnit class=warning></span>
<input type=text size=10 class=none name=sampleSizeUnit value='{$sampleSizeUnit}'><br>

<!--
<input type='button' class='button' value=' Save ' onClick=validateForm(\"$do\");>
-->

<input type='submit' class='button' value=' Save '>
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
        echo "<h3>Add/edit measurements in environmental monitoring database</h3>";
        echo "<label>Select dataset:</label>";
        echo "<table width=900px class=twoColour>";
        echo "<tr><th>Dataset ID<th>Dataset name<th></tr>";
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
        echo "<h3>Add/edit measurements in environmental monitoring database</h3>";
        echo "<h4>Dataset: ".$datasetID."</h4>";
        echo "<label>Select location:</label>";
        echo "<table width=900px class=twoColour>";
        echo "<tr><th>Location ID<th>Location name<th>Locality<th>base time<th>type<th></tr>";
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
        echo "<h3>Add/edit measurements in environmental monitoring database</h3>";
        echo "<h4>Dataset: ".$datasetID."</h4>";
        echo "<h4>Location: ".$locationID."</h4>";
        echo "<label>Select date:</label>";
        echo "<table width=900px class=twoColour>";
        echo "<tr><th>locationID<th>date<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$locationID."<td>".$row['measurementDateTime']."<td><a href='./?base=envmondata&do=edit&table=measurement&datasetID=".$datasetID."&locationID=".$locationID."&date=".$row['measurementDateTime']."&locationType=".$locationType."'>edit</a></tr>";
        }
        echo "</table>";
        echo "<b><a href=\"./?base=envmondata&do=add&table=measurement&datasetID=$datasetID&locationID=$locationID&locationType=once-off\">Add new date and data</a></b>";

    }

    if (($locationType=='once-off'  || $locationType=='short-term') && (($do=='add' && $date=='')|| ($do=='edit' && $date!=''))){
            //shows form for once off measurements
            echo "<a href=./?base=envmondata&do=edit&table=measurement&datasetID=$datasetID&datastreamID=$datastreamID>back</a>";
            if ($do=='add'){
                echo" <h3>Adding measurements to environmental monitoring database</h3>";
            }else{
                echo" <h3>Editing measurements in environmental monitoring database</h3>";
            }
            echo "<h4>Dataset: ".$datasetID."</h4>";
            echo "<h4>Location: ".$locationID."</h4>";
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
# biodiv and dataset table
#
if ($base=="biodivdata" & $table=="dataset"){
    // resetting dataset variables
    $datasetName="";
    $institutionCode="";
    $ownerInstitutionCode="";
    $datasetRemarks="";
    $datasetDescription="";
    $publications="";
    if ($datasetID=='' && $do!='add'){
        // datasetID is not set - shows list of all datasets
        $query="select datasetID, datasetName from dataset";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h3>View/edit dataset in biodiversity database</h3>";
        echo "<b><a href=\"./?base=biodivdata&do=add&table=dataset\">Add new dataset</a></b>";
        echo "<table width=800px>";
        echo "<tr><th>datasetID<th>dataset name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datasetID']."<td>".$row['datasetName']."<td><a href='./?base=biodivdata&do=edit&table=dataset&datasetID=".$row['datasetID']."' >edit dataset</a><br><a href='./?base=biodivdata&do=edit&table=location&datasetID=".$row['datasetID']."' >show locations</tr>";
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
        $datasetDescription=$row['datasetDescription'];
        $publications=$row['publications'];
        $datasetRemarks=$row['datasetRemarks'];
    }
    if (($datasetID!='' && $do=="edit") || $do=="add"){
     // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=biodivdata&do=edit&table=dataset>back</a>";
        if ($do=="add"){
            echo "<h3>Adding dataset to biodiversity database</h3>";
        }else{
            echo "<h3>Editing dataset in biodiversity database</h3>";
        }
        echo"
<label> required fields shaded in grey</label>
<form id=form action='./submit.php?base=biodivdata&do={$do}&table=dataset' method=post onSubmit='return validateForm(this, \"$do\")'>

<h4>datasetID</h4>
<label>max length:10 characters<br>usually three to six letters describing dataset and a year dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty nospace unique' value='{$datasetID}'><br>

<h4>datasetName</h4>
<label>max length:50 characters<br>short name describing dataset, to be used in the website, example: Biokavango community-based monitoring, Silica project (2013)</label><br>
<span id=datasetName class=warning></span>
<input type=text size=50 name=datasetName class=nonempty value='{$datasetName}'><br>

<h4>Institution Name</h4>
<label>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=institutionCode class=warning></span>
<input type=text size=100 name=institutionCode class=nonempty value='{$institutionCode}'><br>

<h4>owner Institution Name</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=ownerInstitutionCode class=warning></span>
<input type=text size=100 name=ownerInstitutionCode value='{$ownerInstitutionCode}'><br>

<h4>datasetDescription</h4>
<label>max length:900 characters<br>Longer description of the dataset</label><br>
<span id=datasetDescription class=warning></span>
<textarea cols=40 rows=6 size=900 name=datasetDescription class=nonempty>{$datasetDescription}</textarea><br>

<h4>publications</h4>
<label>max length:900 characters<br>Publications (papers, reports) associated with the dataset. Separate individual entries with colon (do not use colon IN each of references)</label><br>
<span id=publications class=warning></span>
<textarea cols=40 rows=6 size=900 name=publications>{$publications}</textarea><br>

<h4>datasetRemarks</h4>
<label>max length:900 characters<br>Any other remarks you might have</label><br>
<span id=datasetRemarks class=warning></span>
<textarea cols=40 rows=6 size=900 name=datasetRemarks>{$datasetRemarks}</textarea><br>

<input type='submit' class='button' value=' Save '>
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
    $altitude="";
    $altitudeUncertaintyInMeters="";
    $locationType="";
    $geomorphologicalPosition="";
    $countryCode="";
    $footprintWKT="";
    $footprintSRS="";
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
        echo "<h3>View/edit location in biodiversity database</h3>";
        echo "<b><a href=\"./?base=biodivdata&do=add&table=location&datasetID={$datasetID}\">Add new location</a></b>";
        echo "<table width=800px>";
        echo "<tr><th>locationID<th>locationName<th>locality<th>coordinates<th></tr>";
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
        $altitude=$row['altitude'];
        $altitudeUncertaintyInMeters=$row['altitudeUncertaintyInMeters'];
        $locationType=$row['locationType'];
        $geomorphologicalPosition=$row['geomorphologicalPosition'];
        $countryCode=$row['countryCode'];
        $footprintWKT=$row['footprintWKT'];
        $footprintSRS=$row['footprintSRS'];
        $associatedMedia=$row['associatedMedia'];
        $locationRemarks=$row['locationRemarks'];
    }
    if (($locationID!='' && $do=="edit") || $do=="add"){
       // this is common to "edit" and "add" functionality - form that is populated when "edit", or remains empty when "add"
        echo "<a href=./?base=biodivdata&do=edit&table=location&datasetID={$datasetID}>back</a>";
        echo "
<h3>Adding location to biodiversity database</h3>
<label> required fields shaded in grey</label>
<form id=form action='./submit.php?base=biodivdata&do={$do}&table=location' method=post onSubmit='return validateForm(this,\"{$do}\")'>

<h4>locationID</h4>
<label>max length:10 characters<br>A location can potentially be measured under various datasets. However, typically, datasets, particularly once-off ones, have unique locations. To reconcile this somewhat contradictory requirements, there is no 'hard' link between location and dataset. Instead, locationID reflects its 'source' dataset. LocationID is typically constructed as follows: three letters describing dataset, underscore (\"_\"), and up to 6 characters describing the location, usually either the location code used in the source dataset, or some abbreviation of it. No spaces, no special characters. LocationID has to be unique. Example: mla_nq22, ori_boro </label><br>
<span id=locationID class=warning></span>
<input type=text size=10 name=locationID class='nonempty unique nospace' value='{$locationID}'><br>

<h4>datasetID</h4>
<label>Must be of existing dataset. Submission will fail, if ID given here does not exist.</label><br>
<span id=datasetID class=warning></span>
<input type=text size=10 name=datasetID class='nonempty unique nospace' value='{$datasetID}'><br>

<h4>locationName</h4>
<label>max length:50 characters<br>short name describing location, to be used in the website. It can too be the full location code used in the original data source. Example: \"Flume at Phelo's floodplain at Nxaraga\" or \"Boro-124w\"</label><br>
<span id=locationName class=warning></span>
<input type=text size=50 name=locationName class=nonempty value='{$locationName}'><br>

<h4>locality</h4>
<label>max length:255 characters<br>Longer description of the location. Example: \"East bank of the Xakanaxa lagoon, some 1 km upstream from Camp Okuti\"</label><br>
<span id=locality class=warning></span>
<textarea cols=40 rows=6 size=255 name=locality class=nonempty>{$locality}</textarea><br>

<h4>decimalLongitude</h4>
<label>max length:15 characters<br>Longitude expressed in decimal degrees. Example: 19.134567</label><br>
<span id=decimalLongitude class=warning></span>
<input type=text size=15 name=decimalLongitude class='numeric' value='{$decimalLongitude}'><br>

<h4>decimalLatitude</h4>
<label>max length:15 characters<br>Latitude expressed in decimal degrees. Example: -21.122345</label><br>
<span id=decimalLatitude class=warning></span>
<input type=text size=15 name=decimalLatitude class='numeric' value={$decimalLatitude}><br>

<h4>coordinateUncertaintyInMeters</h4>
<label>max length:10 characters<br>Uncertainty of geographic coordinates in meters. Approximate. Handheld GPS-determined coordinates will typically have uncertainty of 5m. Some locations can be precisely measured with uncertainty of 0.5m or less. Some location, particularly archival ones, position of which is estimated from some desription can have uncertainty in the order of 1000m or even more, up to 10000m </label><br>
<span id=coordinateUncertaintyInMeters class=warning></span>
<input type=text size=10 name=coordinateUncertaintyInMeters class='numeric' value='{$coordinateUncertaintyInMeters}'><br>

<h4>geodeticDatum</h4>
<label>max length:10 characters<br>Geodetic Datum. Typically WGS84</label><br>
<span id=geodeticDatum class=warning></span>
<input type=text size=10 name=geodeticDatum class='none' value='{$geodeticDatum}'><br>

<h4>altitude</h4>
<label>max length:10 characters<br>Altitude in meters. That should actually be elevation in m a.m.s.l. rather than geoidal height. If you don't know what it means - don't worry, it is not THAT important</label><br>
<span id=altitude class=warning></span>
<input type=text size=10 name=altitude class='numeric' value='{$altitude}'><br>

<h4>altitudeUncertaintyInMeters</h4>
<label>max length:10 characters<br>Uncertainty of altitude value, in meters. If from handheld GPS it will be in the order of 10m. Precisely levelled sites can have uncertainty as low as 0.01m. </label><br>
<span id=altitudeUncertaintyInMeters class=warning></span>
<input type=text size=10 name=altitudeUncertaintyInMeters class='numeric' value='{$altitudeUncertaintyInMeters}'><br>

<h4>locationType</h4>
<label>max length:50 characters<br>Type of location. Either \"monitoring\", \"short-term\" or \"once-off\"</label><br>
<span id=locationType class=warning></span>
<input type=text size=50 name=locationType class=nonempty value='{$locationType}'><br>

<h4>geomorphologicalPosition</h4>
<label>max length:50 characters<br>geomorphological position of measurement location. Descriptive. Examples: channel, channel bank, lagoon, lagoon centre, lagoon fringe, riparian fringe, island centre, crest of dune etc.</label><br>
<span id=geomorphologicalPosition class=warning></span>
<input type=text size=50 name=geomorphologicalPosition class='' value='{$geomorphologicalPosition}'><br>

<h4>countryCode</h4>
<label>max length:2 characters<br>A two letter country code. For Botswana it is BW</label><br>
<span id=countryCode class=warning></span>
<input type=text size=2 name=countryCode class='none' value='{$countryCode}'><br>

<h4>footprintWKT</h4>
<label>max length:1000 characters<br>Reserved for future use. FootprintWKT is a plain text representation of geometry of a measurement location if that is different than a point (e.g. transect, or a polygon). For the time being it is not used as the mapping tool cannot handle other geometries than a point</label><br>
<span id=footprintWKT class=warning></span>
<textarea cols=40 rows=6 size=1000 name=footprintWKT disabled>{$footprintWKT}</textarea><br>

<h4>footprintSRS</h4>
<label>max length:10 characters<br>Reserved for future use. FootprintSRS is a description of coordinate system in which footprintWKT is defined </label><br>
<span id=footprintSRS class=warning></span>
<input type=text size=10 name=footprintSRS class='numeric' disabled value='{$footprintSRS}'><br>

<h4>locationRemarks</h4>
<label>max length:255 characters<br>Any other remarks you might have</label><br>
<span id=locationRemarks class=warning></span>
<textarea cols=40 rows=6 size=255 name=locationRemarks>{$locationRemarks}</textarea><br>

<h4>associatedMedia</h4>
<label>upload a photo of measurement location here. For the time being not functional</label><br>
<span id=associatedMedia class=warning></span>
<input type=text size=50 name=associatedMedia class='none' disabled value='{$associatedMedia}'><br>


<input type='submit' class='button' value=' Save '>
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
# this one is a bit different - it is called while editing occurrence table, so it comes back to occurrence table
#
if ($base=="biodivdata" & $table=="event"){
    //resetting variables
    $variableType='';
    $variableName='';
    $variableUnit='';
    $eventDate='';
    $baseTime='';
    $basisOfRecord='';
    $samplingEffort='';
    $samplingProtocol='';
    $sampleSizeValue='';
    $sampleSizeValueUnit='';
   if ($eventID!='' && $do=='edit'){
        // when eventID is set through url argument - query database for event values
        $query="select * from event where eventID='{$eventID}'";
        $result = $mysqli->query($query);
        $row = $result->fetch_assoc();
        $datastreamID=$row['eventID'];
        $locationID=$row['locationID'];
        $basisOfRecord=$row['basisOfRecord'];
        $samplingEffort=$row['samplingEffort'];
        $samplingProtocol=$row['samplingProtocol'];
        $sampleSizeValue=$row['sampleSizeValue'];
        $sampleSizeValueUnit=$row['sampleSizeValueUnit'];
    }
    if (($eventID!="" && $do=="edit") || $do=="add"){
        //shows form
        echo "<a href=./?base=biodivdata&do=edit&table=occurrence&datasetID={$datasetID}&locationID={$locationID}>back</a>";
        echo" 
<h3>Adding event to biodiversity database</h3>
<label> required fields shaded in grey</label>
<form id=form action='./submit.php?base=biodivdata&do={$do}&table=event' method=post onSubmit='return validateForm(this,\"{$do}\")'>

<h4>eventID</h4>
<label>max length:20 characters<br> the source dataset, or some abbreviation of it. No spaces, no special characters. LocationID has to be unique. Example: mla_nq22, ori_boro </label><br>
<span id=locationID class=warning></span>
<input type=text size=20 name=locationID class='nonempty unique nospace' value='{$eventID}'><br>

<h4>locationID</h4>
<label>Must be of existing location. Submission will fail, if ID given here does not exist.</label><br>
<span id=locationID class=warning></span>
<input type=text size=10 name=locationID class='nonempty unique nospace' value='{$locationID}'><br>

<h4>basisOfRecord</h4>
<label>max length:50 characters<br>possible values: manual measurement, automatic measurement, laboratory measurement</label><br>
<span id=basisOfRecord class=warning></span>
<input type=text size=50 name=basisOfRecord class='nonempty' value='{$basisOfRecord}'><br>

<h4>samplingEffort</h4>
<label>max length:255 characters<br>describes details of sampling. Example: a single measurement, average of 3 measurements, average of 1s samples taken over 1 minute, measurement until stable reading</label><br>
<span id=samplingEffort class=warning></span>
<textarea cols=40 rows=6 size=255 name=samplingEffort>{$samplingEffort}</textarea><br>

<h4>samplingProtocol</h4>
<label>max length: 255 characters<br>How were the measurements carried out and with what equipment. Example: A bucket sample from the middle of a channel, measurements carried immediately after sampling with a pre-calibrated EC meter</label><br>
<span id=samplingProtocol class=warning></span>
<textarea cols=40 rows=6 size=255 name=samplingProtocol>{$samplingProtocol}</textarea><br>

<h4>sampleSizeValue</h4>
<label>max length:10 characters<br>value reflecting sample size. Example: 1, 250. leave blank if measurement done in situ, or</label><br>
<span id=sampleSizeValue class=warning></span>
<input type=text size=10 name=sampleSizeValue class='numeric' value='{$sampleSizeValue}'><br>

<h4>sampleSizeValueUnit</h4>
<label>max length:10 characters<br>Unit of the value reflecting sample size. Example: l, ml. Leave blank if measurement done in situ, or</label><br>
<span id=sampleSizeValueUnit class=warning></span>
<input type=text size=10 name=sampleSizeValueUnit class='none' value='{$sampleSizeValueUnit}'><br>

<input type='submit' class='button' value=' Save '>
</form>
        ";
    }
} //end biodiv and event table

#
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# biodiv and occurrence table
#
#
# structure is a bit weird - this section handles entire "path" to edit occurrence table, i.e. selection of dataset, location and event. Editing events, however, is handled by request event table...
#
#

if ($base=="biodivdata" & $table=="occurrence"){
    if ($datasetID=='' && $locationID==''){
        // shows list of datasets
        $query="select datasetID, datasetName from dataset";
        $result = $mysqli->query($query);
        echo "<a href=./>back</a>";
        echo "<h3>Add/edit sampling events and occurrences in biodiversity monitoring database</h3>";
        echo "<label>Select dataset:</label>";
        echo "<table width=900px>";
        echo "<tr><th>Dataset ID<th>Dataset name<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['datasetID']."<td>".$row['datasetName']."<td><a href='./?base=biodivdata&do=edit&table=occurrence&datasetID=".$row['datasetID']."' >select</a></tr>";
        }
        echo "</table>";
    }
    if ($datasetID!='' && $locationID==''){
        //shows list of locations for given dataset
        $query="select distinct location.locationID,locationName,locality from  location where datasetID='".$datasetID."'";
	#echo $query;
        $result = $mysqli->query($query);
        echo "<a href=./?base=biodivdata&do=edit&table=occurrence>back</a>";
        echo "<h3>Add/edit event in environmental monitoring database</h3>";
        echo "<h4>Dataset: ".$datasetID."</h4>";
        echo "<label>Select location:</label>";
        echo "<table width=900px>";
        echo "<tr><th>Location ID<th>Location name<th>Locality<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['locationID']."<td>".$row['locationName']."<td>".$row['locality']."<td><a href='./?base=biodivdata&do=edit&table=occurrence&locationID=".$row['locationID']."&datasetID=".$datasetID."'>select</a></tr>";
        }
        echo "</table>";
    }
    if ($datasetID!='' && $locationID!='' && $eventID==''){
        //shows list of events for given location
        $query="select eventID, eventDate from event where locationID='".$locationID."'";
        $result = $mysqli->query($query);
        echo "<a href=./?base=biodivdata&do=edit&table=occurrence&datasetID={$datasetID}>back</a>";
        echo "<h3>Add/edit event in environmental monitoring database</h3>";
        echo "<h4>dataset: ".$datasetID.", location: ".$locationID."</h4>";
        echo "<b><a href=\"./?base=biodivdata&do=add&table=event&datasetID={$datasetID}&locationID={$locationID}\">Add new event</a></b>";
        echo "<table width=900px>";
        echo "<tr><th>event ID<th>Event date<th></tr>";
        while ($row = $result->fetch_assoc()){
            echo "<tr><td>".$row['eventID']."<td>".$row['eventDate']."<td><a href='./?base=biodivdata&do=edit&table=event&locationID=".$locationID."&datasetID=".$datasetID."&eventID=".$row['eventID']."'>edit event</a><br><a href='./?base=biodivdata&do=edit&table=occurrence&locationID=".$locationID."&datasetID=".$datasetID."&eventID=".$row['eventID']."'>edit/add occurrences</a></tr>";
        }
        echo "</table>";
    }


    if ($eventID!=''){
        //shows form for occurrences
        echo "<a href=./?base=biodivdata&do=edit&table=occurrence&datasetID=$datasetID&locationID=$locationID>back</a>";
        echo "<input type=hidden name=datasetID value=$datasetID>";
        echo "<input type=hidden name=locationID value=$locationID>";
        echo "<input type=hidden name=eventID value=$eventID>";
        echo "<h3>Add/edit occurrences in biodiversity database</h3>";
        echo "<h4>Dataset: ".$datasetID."</h4>";
        echo "<h4>Location: ".$locationID."</h4>";
        echo "<h4>Event: ".$eventID."</h4>";
        echo "<form id=form action='./submit.php?base=biodivdata&do={$do}&table=occurrence' method=post onSubmit='return validateForm(this,\"{$do}\")'>";

	echo"</div><div id='records_table' class=centeritem></div>";
	echo"</div><div id='extras'></div>";
        echo"<input type='submit' class='button' value=' Save '>";
        echo"</form>";
	echo"<script>editOccurrences()</script>";
    }
} //end biodiv and occurrence table


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
        echo "<h3>Add/edit checklist entries in biodiversity monitoring database</h3>";
        echo "<b><a href=\"./?base=biodivdata&do=add&table=checklist\">Add new entry</a></b>";
        echo "<table width=900px class=twoColour>";
        echo "<tr><th>taxonID<th>Scientific name<th></tr>";
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
            echo "<h3>Adding checklist entry to biodiversity database</h3>";
        }else{
            echo "<h3>Editing checklist entry in biodiversity database</h3>";
        }
        echo"
<label> required fields shaded in grey</label>
<form id=form action='./submit.php?base=envmondata&do={$do}&table=checklist' method=post onSubmit='return validateForm(this, \"$do\")'>

<h4>taxonID</h4>
<label>max length:10 characters<br>usually three to six letters describing dataset and a year dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=8 name=taxonID class='nonempty nospace unique' value='{$taxonID}'><br>

<h4>taxonRank</h4>
<label>max length:10 characters<br>usually three to six letters describing dataset and a year dataset was created, no spaces, no special characters, for example: mla2005, bkv2009 </label><br>
<span id=datasetID class=warning></span>
<input type=text size=8 name=taxonRank class=nonempty value='{$taxonRank}'><br>


<h4>scientificName</h4>
<label>max length:50 characters<br>short name describing dataset, to be used in the website, example: Biokavango community-based monitoring, Silica project (2013)</label><br>
<span id=datasetName class=warning></span>
<input type=text size=50 name=scientificName class=nonempty value='{$scientificName}'><br>

<h4>vernacularName</h4>
<label>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=vernacularName class=warning></span>
<input type=text size=50 name=vernacularName value='{$vernacularName}'><br>

<h4>setswanaName</h4>
<label>max length:100 characters<br>Name of institution/project that generated data</label><br>
<span id=setswanaName class=warning></span>
<input type=text size=50 name=setswanaName value='{$setswanaName}'><br>

<h4>kingdom</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=kingdom class=warning></span>
<input type=text size=50 name=kingdom class=nonempty value='{$kingdom}'><br>

<h4>phyllum</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=phyllum class=warning></span>
<input type=text size=50 name=phyllum value='{$phyllum}'><br>

<h4>order</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=order class=warning></span>
<input type=text size=50 name=order value='{$order}'><br>

<h4>class</h4>
<label>max length:50 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=class class=warning></span>
<input type=text size=50 name=class value='{$class}'><br>

<h4>family</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=family class=warning></span>
<input type=text size=50 name=family value='{$family}'><br>

<h4>genus</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=genus class=warning></span>
<input type=text size=50 name=genus value='{$genus}'><br>

<h4>species</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=species class=warning></span>
<input type=text size=50 name=species value='{$species}'><br>

<h4>parentNameUsageID</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=parentNameUsageID class=warning></span>
<input type=text size=50 name=parentNameUsageID value='{$parentNameUsageID}'><br>

<h4>acceptedNameUsageID</h4>
<label>max length:100 characters<br>Name of institution that is a legal owner of data</label><br>
<span id=acceptedNameUsageID class=warning></span>
<input type=text size=50 name=acceptedNameUsageID value='{$acceptedNameUsageID}'><br>

<input type='submit' class='button' value=' Save '>
</form>
        ";
    }
} //end biodiv and dataset table






echo"
<br>
<br>
<a href=\"./\">home</a>
";
?>
    <div id='popupBackground'></div>
    <div id='popupWindow'></div>
</body>
</html>
