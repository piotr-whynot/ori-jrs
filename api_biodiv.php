<?php
# API function for querrying biodiversity database
# returns data in GeoJSON format
# at the moment handles two types of calls:
# - default call lists all locations, or their subset, based on criteria (dataset, lat, lon, eventDate, taxonID, popularGroup, datasetID)
# - calltype=data: data for all locations fulfilling criteria (lat,lon,eventDate, taxonID, locationID, popularGroup, dataasetID)
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
$mysqli->select_db('biodivdata');

###########################################################################
#inital checks on arguments
#check what type of call is this and make sure calltype is correct
$calltypes=array("data","event");
$calltype=''; #empty call returns locationinfo
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
$taxonID=null;
if (isset($_GET['taxonID'])){
    $taxonID=$_GET['taxonID'];
}
$datasetID=null;
if (isset($_GET['datasetID'])){
    $datasetID=$_GET['datasetID'];
}
$eventID=null;
if (isset($_GET['eventID'])){
    $eventID=$_GET['eventID'];
}
$popularGroup=null;
if (isset($_GET['popularGroup'])){
    $popularGroup=$_GET['popularGroup'];
}
$locationType=null;
if (isset($_GET['locationType'])){
    $locationType=$_GET['locationType'];
}



###########################################################################
# preparing query

# this is expression for table join and it gives all ocurrences for given criteria, joins ocurrence, event, location, and dataset tables
# need to include ocurrences results from the fact that we want taxonID to be included in the query

$query_join=" from ocurrence join event on ocurrence.eventID=event.eventID join location on event.locationID=location.locationID join dataset on event.datasetID=dataset.datasetID join checklist on ocurrence.taxonID=checklist.taxonID ";

#echo $query_join;

#this merges all criteria
$query_crit='';
$con=" where ";
if ($locationID){
    $query_crit=$query_crit.$con."location.locationID='".$locationID."' ";
    $con=" and ";
}
if ($locationType){
    $query_crit=$query_crit.$con."location.locationType='".$locationType."' ";
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
    $query_crit=$query_crit.$con."event.eventDate<'".$enddate."' ";
    $con=" and ";
}
if ($startdate){
    $query_crit=$query_crit.$con."event.eventDate>'".$startdate."' ";
    $con=" and ";
}
if ($taxonID){
    $query_crit=$query_crit.$con."taxonID='".$taxonID."' ";
    $con=" and ";
}
if ($datasetID){
    $query_crit=$query_crit.$con."dataset.datasetID='".$datasetID."' ";
    $con=" and ";
}
if ($eventID){
    $query_crit=$query_crit.$con."event.eventID='".$eventID."' ";
    $con=" and ";
}
if ($popularGroup){
    $query_crit=$query_crit.$con."ocurrence.popularGroupName='".$popularGroup."' ";
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
    $datastack=array(); #to store data
    $query12="select * from location where locationID='{$locationID}'";
    $result12 = $mysqli->query($query12);
    $row12= $result12->fetch_assoc();
    $locationgeometry=array(
        "type"=>"Point",
        "coordinates"=>array($row12['decimalLongitude'],$row12['decimalLatitude'])
    );
    $locationproperties=array(
        "locationID"=>$row12['locationID'],
        "locationName"=>$row12['locationName'],
        "locationType"=>$row12['locationType'],
        "locality"=>$row12['locality'],
        "geomorphologicalPosition"=>$row12['geomorphologicalPosition'],
        "distributary"=>$row12['distributary']
    );

    $eventstack=array();
    if($calltype=="data" || $calltype=="event"){
        #data array will have the following structure:
        #   event
        #     ocurrence
        #       measurementorfact      
        # iterating through events for given location for given criteria
        $query1="SELECT distinct event.eventID,eventDate,samplingProtocol,sampleSizeValue,sampleSizeValueUnit,recordedBy,eventRemarks ".$query_join.$query_crit." and location.locationID='".$locationID."'";
#        echo $query1."<br>";
        $result1 = $mysqli->query($query1);
        while($row1 = $result1->fetch_assoc()){
            $eventID=$row1['eventID'];
            $ocurrencestack=array();
            if ($calltype=="data"){
                #finding all ocurrences and populate ocurrencestack (actual data) if required
                $query2="select ocurrenceID,organismQuantity,organismQuantityType,ocurrenceRemarks,associatedMedia,popularGroupName,scientificName ".$query_join." and event.eventID='{$eventID}'";
                $con2=" and ";
#                echo $query2;
                $result2 = $mysqli->query($query2);
                while($row2 = $result2->fetch_assoc()){
                    $ocurrenceID=$row2['ocurrenceID'];
                    # finding all measurementorfacts for given ocurrence
                    $query21="select measurementID,measurementType,measurementValue,measurementUnit,measurementBy,measurementRemarks,measurementMethod from measurementorfact where ocurrenceID='{$ocurrenceID}'";
#                   echo $query21."<br>";
                    $result21 = $mysqli->query($query21);
                    $mofstack=array();
                    while($row21 = $result21->fetch_assoc()){
                        array_push($mofstack,$row21);
                    }
                    $ocurrencedata=array(
                    "ocurrenceID"=>$row2['ocurrenceID'],
                    "organismQuantity"=>$row2['organismQuantity'],
                    "organismQuantityType"=>$row2['organismQuantityType'],
                    "ocurrenceRemarks"=>$row2['ocurrenceRemarks'],
                    "scientificName"=>$row2['scientificName'],
                    "measurementOrFact"=>$mofstack,
                    );
                    array_push($ocurrencestack,$ocurrencedata);
                }
            }
            $eventdata=array(
            "eventID"=>$row1['eventID'],
            "eventDate"=>$row1['eventDate'],
            "samplingProtocol"=>$row1['samplingProtocol'],
            "sampleSizeValue"=>$row1['sampleSizeValue'],
            "sampleSizeValueUnit"=>$row1['sampleSizeValueUnit'],
            "recordedBy"=>$row1['recordedBy'],
            "eventRemarks"=>$row1['eventRemarks'],
            "ocurrenceData"=>$ocurrencestack,
            );
            array_push($eventstack, $eventdata);
        }
    }
    $locationproperties["events"]=$eventstack;
    $feature=array(
        "type"=>"Feature",
        "geometry"=>$locationgeometry,
        "properties"=>$locationproperties,
    );
    array_push($featurestack,$feature);
}

$output=array(
    "type"=>"FeatureCollection",
    "features"=>$featurestack,
);

#    "url"=>$_SERVER['REQUEST_URI'],

echo json_encode($output);
?>

