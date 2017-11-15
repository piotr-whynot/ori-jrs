<?php
# API function for querrying environmental monitoring database
# returns data in GeoJSON format
# at the moment handles two types of calls:
#
# all criteria are assessed using AND condition
#
# P.Wolski
#
# March 2017
#
# to do: 
# implement csv, handle permissions, handle errors, transfer size limit
#


###########################################################################
# connecting to db
# using mysqli
include '/.creds/.credentials.php';
$mysqli->select_db('envmondata');

###########################################################################
#inital checks on arguments
#check what type of call is this and make sure calltype is correct
$calltypes=array("data", "datastream");
$calltype=''; #empty call returns info
if (isset($_GET['calltype'])){
    if (in_array($_GET['calltype'],$calltypes)){
        $calltype=$_GET['calltype'];
    }
}

#check what format is asked for and make sure it is correct
$formats=array("json","csv");
$format='json'; #default

if (isset($_GET['format'])){
    if (in_array($_GET['format'],$formats)){
        $format=$_GET['format'];
    }
}

$locationID=null;
if (isset($_GET['locationID'])){
    $locationID=$_GET['locationID'];
}
$latmin=null;
if (isset($_GET['latmin'])){
    $latmin=$_GET['latmin'];
}
$latmax=null;
if (isset($_GET['latmax'])){
    $latmax=$_GET['latmax'];
}
$lonmin=null;
if (isset($_GET['lonmin'])){
    $lonmin=$_GET['lonmin'];
}
$lonmax=null;
if (isset($_GET['lonmax'])){
    $lonmax=$_GET['lonmax'];
}
$startdate=null;
if (isset($_GET['startdate'])){
    $startdate=$_GET['startdate'];
}
$enddate=null;
if (isset($_GET['enddate'])){
    $enddate=$_GET['enddate'];
}
$datetime=null;
if (isset($_GET['datetime'])){
    $datetime=$_GET['datetime'];
}
$datasetID=null;
if (isset($_GET['datasetID'])){
    $datasetID=$_GET['datasetID'];
}
$datastreamID=null;
if (isset($_GET['datastreamID'])){
    $datastreamID=$_GET['datastreamID'];
}
$variableType=null;
if (isset($_GET['variableType'])){
    $variableType=$_GET['variableType'];
}
$locationType=null;
if (isset($_GET['locationType'])){
    $locationType=$_GET['locationType'];
}



###########################################################################
# preparing query

# this is expression for table join and it gives all occurrences for given criteria, joins ocurrence, event, location, and dataset tables
# need to include occurrences results from the fact that we want taxonID to be included in the query

$query_join=" from measurement join datastream on measurement.datastreamID=datastream.datastreamID join location on datastream.locationID=location.locationID join dataset on location.datasetID=dataset.datasetID ";

#echo $query_join;

#this merges all criteria
$query_crit='';
$con=" where ";
if ($locationID){
    $query_crit=$query_crit.$con."location.locationID='".$locationID."' ";
    $con=" and ";
}
if ($latmin & $latmax){
    $query_crit=$query_crit.$con."decimalLatitude>".$latmin." and decimalLatitude<".$latmax;
    $con=" and ";
}
if ($lonmin & $lonmax){
    $query_crit=$query_crit.$con."decimalLongitude>".$lonmin." and decimalLongitude<".$lonmax;
    $con=" and ";
}
if ($enddate){
    $query_crit=$query_crit.$con."measurementDateTime<='".$enddate."' ";
    $con=" and ";
}
if ($startdate){
    $query_crit=$query_crit.$con."measurementDateTime>='".$startdate."' ";
    $con=" and ";
}
if ($datetime){
    $query_crit=$query_crit.$con."measurementDateTime='".$datetime."' ";
    $con=" and ";
}

if ($datasetID){
    $query_crit=$query_crit.$con."dataset.datasetID='".$datasetID."' ";
    $con=" and ";
}
if ($datastreamID){
    $query_crit=$query_crit.$con."datastream.datastreamID='".$datastreamID."' ";
    $con=" and ";
}
if ($variableType){
    $query_crit=$query_crit.$con."datastream.variableType='".$variableType."' ";
    $con=" and ";
}

if ($locationType){
    $query_crit=$query_crit.$con."location.locationType='".$locationType."' ";
    $con=" and ";
}



###########################################################################
#querying datasets based on criteria

#finding all locations in the current dataset that correspond to criteria

$query0="select distinct location.locationID ".$query_join.$query_crit;
#echo $query0."<br>";
$result0 = $mysqli->query($query0);
$featurestack=array(); # initialize array to store features (i.e. locations)
while($row0 = $result0->fetch_assoc()){
    $locationID=$row0['locationID'];
    $query12="select * from location where locationID='{$locationID}'";
    $result12 = $mysqli->query($query12);
    $row12= $result12->fetch_assoc();
    $locationgeometry=array(
        "type"=>"Point",
        "coordinates"=>array($row12['decimalLongitude'],$row12['decimalLatitude'])
        );
    $locationproperties=array(
        "datasetID"=>$row12['datasetID'],
        "locationID"=>$row12['locationID'],
        "locationName"=>$row12['locationName'],
        "locality"=>$row12['locality'],
        "locationType"=>$row12['locationType'],
        "geomorphologicalPosition"=>$row12['geomorphologicalPosition'],
    );

    $datastreamstack=array();
    if($calltype=="data" || $calltype=="datastream"){
        #data array will have the following structure:
        # dataset
        #   location
        #     variable
        #       measurement
        # iterating through datasets
        # iterating through datastreams for given location for given criteria
        $query1="SELECT distinct datastream.datastreamID,variableName,variableUnit,baseTime,samplingProtocol ".$query_join.$query_crit." and location.locationID='".$locationID."'";
//    echo $query1."<br>";
        $result1 = $mysqli->query($query1);
        while($row1 = $result1->fetch_assoc()){
            $datastreamID=$row1['datastreamID'];
            #populate valuestack (actual data) if required
            $datastack=array();
            if ($calltype=="data"){
                $query2="select measurementDateTime,measurementValue,qcCode,censoredCode ".$query_join.$query_crit." and datastream.datastreamID='{$datastreamID}' order by measurementDateTime";
      #          echo $query2."<br>";
                $result2 = $mysqli->query($query2);
                while($row2 = $result2->fetch_assoc()){
                    array_push($datastack,array($row2['measurementDateTime'],$row2['measurementValue'],$row2['qcCode'],$row2['censoredCode']));
                }
            }
            $query3="select MIN(measurementDateTime),MAX(measurementDateTime) ".$query_join.$query_crit." and datastream.datastreamID='{$datastreamID}'";
//            echo $query3."<br>";
            $result3 = $mysqli->query($query3);
            $row3 = $result3->fetch_assoc();

            $datastream=array(
            "datastreamID"=>$row1['datastreamID'],
            "variableName"=>$row1['variableName'],
            "variableUnit"=>$row1['variableUnit'],
            "baseTime"=>$row1['baseTime'],
            "firstMeasurementDate"=>$row3['MIN(measurementDateTime)'],
            "lastMeasurementDate"=>$row3['MAX(measurementDateTime)'],
            "data"=>$datastack
            );
            array_push($datastreamstack, $datastream);
        }
    }
    $locationproperties['datastreams']=$datastreamstack;
    $feature=array(
        "type"=>"Feature",
        "geometry"=>$locationgeometry,
        "properties"=>$locationproperties,
    );
    array_push($featurestack,$feature);
}

$output=array(
    "type"=>"FeatureCollection",
    "features"=>$featurestack
);

#    "url"=>$_SERVER['REQUEST_URI'],

echo json_encode($output);



?>

