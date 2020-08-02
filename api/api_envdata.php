<?php
# API function for querrying environmental monitoring database
# returns data in GeoJSON, JSON or csv format
#
# all criteria are assessed using AND condition
#
# P.Wolski
#
# March 2017
#
# to do: 
# handle permissions, handle errors, transfer size limit
#
# arguments:
# calltype - data, datastream, location, datasetinfo
#      datasetinfo will return info for all datasets
# format - json, csv
# latmin - decimal degrees
# latmax - decimal degrees
# lonmin - decimal degrees
# lonmax - decimal degrees
# startdate - YYYY-MM-DD??
# enddate - YYYY-MM-DD??
# datetime -???
# baseTime - instantaneous, daily, monthly, annual etc. terms from vocabulary
# datasetID - must correspond to existing ID
# locationID - must correspond to existing ID
# datastreamID - must correspond to existing ID
# variableType - variable category that is displayed in menu - restricted vocabulary..
# locationType - monitoring, short-term
#

$debug=false;

###########################################################################
# connecting to db
# using mysqli
include '/.creds/.credentials.php';
$mysqli->select_db('envmondata');

###########################################################################
#inital checks on arguments
#check what type of call is this and make sure calltype is correct
$calltypes=array("data", "datastream", "datasetinfo", 'location');

$calltype='location'; #empty call returns locations
if (isset($_GET['calltype'])){
    if (in_array($_GET['calltype'],$calltypes)){
        $calltype=$_GET['calltype'];
    }
}

#check what format is asked for and make sure it is correct
$formats=array("json","csv");
$format='json'; #default, for calltype=location, format will actually be geoJSON
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

$baseTime=null;
if (isset($_GET['baseTime'])){
    $baseTime=$_GET['baseTime'];
}




###########################################################################
if ($calltype=="datasetinfo"){
#if datasetinfo call
    $query="select * from dataset";
    if($datasetID){
        $query=$query." where datasetID='".$datasetID."' ";
    }
    $result = $mysqli->query($query);
    $output=array(); #to store data
    while($row = $result->fetch_assoc()){
        $output[$row['datasetID']]=$row;
    }

    $num_rows = $result->num_rows;
    if ($format=="csv" && $num_rows>0){
        $outfile = fopen("php://output",'w') or die("Can't open php://output");
        header("Content-Type:application/csv");
        header("Content-Disposition:attachment;filename=dataset.csv");
        $keys=array_keys($output);
        fputcsv($outfile, $keys);
        fputcsv($outfile, $output);
        fclose($outfile) or die("Can't close php://output");
    }
}else{
    ###########################################################################
    # preparing query for all other calls

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
    if ($baseTime){
        $query_crit=$query_crit.$con."datastream.baseTime='".$baseTime."' ";
        $con=" and ";
    }

    if ($locationType){
        $query_crit=$query_crit.$con."location.locationType='".$locationType."' ";
        $con=" and ";
    }


    ###########################################################################
    # querying datasets based on criteria
    # location
    #

    if ($calltype=='location'){
        //location call returns geoJSON    
        #finding all locations in the current dataset that correspond to criteria
        $query0="select distinct location.locationID ".$query_join.$query_crit;
        if ($debug){
            echo $query0."<br>";
        }
        $result0 = $mysqli->query($query0);
        $featurestack=array(); # initialize array to store features (i.e. locations) in geojson format
        $locationcsvstack=array(); # initialize array to store features (i.e. locations) in csv format
        while($row0 = $result0->fetch_assoc()){
            $locationID=$row0['locationID'];
            $query12="select * from location where locationID='{$locationID}'";
            if ($debug){
                echo $query12."<br>";
            }
            $result12 = $mysqli->query($query12);
            $row12= $result12->fetch_assoc();

            if ($format=="json"){
                $locationgeometry=array(
                   "type"=>"Point",
                    "coordinates"=>array($row12['decimalLongitude'],$row12['decimalLatitude'])
                );
                $locationproperties=array(
                    "datasetID"=>$row12['datasetID'],
                    "locationID"=>$row12['locationID'],
                    "locationName"=>$row12['locationName'],
                    "locality"=>$row12['locality'],
                    "decimalLatitude"=>$row12['decimalLatitude'],
                    "decimalLongitude"=>$row12['decimalLongitude'],
                    "coordinateUncertaintyInMeters"=>$row12['coordinateUncertaintyInMeters'],
                    "geodeticDatum"=>$row12['geodeticDatum'],
                    "locationRemarks"=>$row12['locationRemarks'],
                    "verbatimElevation"=>$row12['verbatimElevation'],
                    "elevationUncertaintyInMeters"=>$row12['elevationUncertaintyInMeters'],
                    "locationRemarks"=>$row12['locationRemarks'],
                    "locationType"=>$row12['locationType'],
                    "locationOwner"=>$row12['locationOwner'],
                    "geomorphologicalPosition"=>$row12['geomorphologicalPosition'],
                );
                $feature=array(
                    "type"=>"Feature",
                    "geometry"=>$locationgeometry,
                    "properties"=>$locationproperties,
                );
                array_push($featurestack,$feature);
            }else{
                $locationcsv=array(
                "locationID"=>$row12['locationID'],
                "longitude"=>$row12['decimalLongitude'],
                "latitude"=>$row12['decimalLatitude'],
                "locationName"=>$row12['locationName'],
                "locality"=>$row12['locality'],
                "locationType"=>$row12['locationType'],
                "datasetID"=>$row12['datasetID'],
                "geomorphologicalPosition"=>$row12['geomorphologicalPosition'],
                );
                array_push($locationcsvstack,$locationcsv);
            }
        }// end of while - iterating through locations

        if ($format=="json"){
            $output=array(
                "type"=>"FeatureCollection",
                "features"=>$featurestack
            );
        }else{
            //format=csv    
            $outfile = fopen("php://output",'w') or die("Can't open php://output");
            header("Content-Type:application/csv");
            header("Content-Disposition:attachment;filename=location.csv");
            $keys=array_keys($locationcsv);
            fputcsv($outfile, $keys);
            foreach ($locationcsvstack as $row){
                fputcsv($outfile, $row);
            }
            fclose($outfile) or die("Can't close php://output");
        }
    }// end of locationcall


    ###########################################################################
    # querying datasets based on criteria
    # datastream and data
    #
    # plain JSON or csv
    #
    if ($calltype=='datastream' || $calltype=="data"){
        #finding all locations in the current dataset that correspond to criteria
        $query0="select distinct location.locationID ".$query_join.$query_crit;
        if ($debug){
            echo $query0."<br>";
        }
        if ($format=="csv"){
            $outfile = fopen("php://output",'w') or die("Can't open php://output");
            header("Content-Type:application/csv");
            header("Content-Disposition:attachment;filename=dataset.csv");
        }
        $result0 = $mysqli->query($query0);
        $featurestack=array(); # initialize array to store features (i.e. locations)
        while($row0 = $result0->fetch_assoc()){
            $locationID=$row0['locationID'];
            $query12="select * from location where locationID='{$locationID}'";
            if ($debug){
                echo $query12."<br>";
            }
            $result12 = $mysqli->query($query12);
            $row12= $result12->fetch_assoc();
            if ($format=="json"){
                $locationproperties=array(
                    "datasetID"=>$row12['datasetID'],
                    "locationID"=>$row12['locationID'],
                    "locationName"=>$row12['locationName'],
                    "locality"=>$row12['locality'],
                    "decimalLatitude"=>$row12['decimalLatitude'],
                    "decimalLongitude"=>$row12['decimalLongitude'],
                    "coordinateUncertaintyInMeters"=>$row12['coordinateUncertaintyInMeters'],
                    "geodeticDatum"=>$row12['geodeticDatum'],
                    "locationRemarks"=>$row12['locationRemarks'],
                    "verbatimElevation"=>$row12['verbatimElevation'],
                    "elevationUncertaintyInMeters"=>$row12['elevationUncertaintyInMeters'],
                    "locationRemarks"=>$row12['locationRemarks'],
                    "locationType"=>$row12['locationType'],
                    "locationOwner"=>$row12['locationOwner'],
                    "geomorphologicalPosition"=>$row12['geomorphologicalPosition'],
                );
            }else{
                ##storing for csv format
                $locationcsv=array(
                "datasetID"=>$row12['datasetID'],
                "locationID"=>$row12['locationID'],
                "longitude"=>$row12['decimalLongitude'],
                "latitude"=>$row12['decimalLatitude'],
                "locationName"=>$row12['locationName'],
                "locality"=>$row12['locality'],
                "locationType"=>$row12['locationType'],
                "geomorphologicalPosition"=>$row12['geomorphologicalPosition'],
                );
                $keys=array_keys($locationcsv);
                fputcsv($outfile, $keys);
                fputcsv($outfile, $locationcsv);
            }

            $datastreamstack=array();
            # iterating through datasets
            # iterating through datastreams for given location for given criteria
            $query1="SELECT distinct datastream.datastreamID,variableName,variableUnit,baseTime,samplingProtocol ".$query_join.$query_crit." and location.locationID='".$locationID."'";
            if ($debug){
                echo $query1."<br>";
            }
            $result1 = $mysqli->query($query1);
            while($row1 = $result1->fetch_assoc()){
                $datastreamID=$row1['datastreamID'];
                #populate valuestack (actual data) if required
                $datastack=array();
                if ($calltype=="data"){
                    $query2="select measurementDateTime,measurementValue,qcCode,censoredCode ".$query_join.$query_crit." and datastream.datastreamID='{$datastreamID}' order by measurementDateTime";
                    if ($debug){
                        echo $query2."<br>";
                    }
                    $result2 = $mysqli->query($query2);
                    while($row2 = $result2->fetch_assoc()){
                        array_push($datastack,array($row2['measurementDateTime'],$row2['measurementValue'],$row2['qcCode'],$row2['censoredCode']));
                    }
                }
                $query3="select MIN(measurementDateTime),MAX(measurementDateTime) ".$query_join.$query_crit." and datastream.datastreamID='{$datastreamID}'";
                if ($debug){
                    echo $query3."<br>";
                }
                $result3 = $mysqli->query($query3);
                $row3 = $result3->fetch_assoc();
                if ($format=="json"){
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
                }else{
                    # if format==csv
                    $datastreamcsv=array(
                    "datastreamID"=>$row1['datastreamID'],
                    "variableName"=>$row1['variableName'],
                    "variableUnit"=>$row1['variableUnit'],
                    "baseTime"=>$row1['baseTime'],
                    "firstMeasurementDate"=>$row3['MIN(measurementDateTime)'],
                    "lastMeasurementDate"=>$row3['MAX(measurementDateTime)'],
                    );
                    $keys=array_keys($datastreamcsv);
                    fputcsv($outfile, $keys);
                    fputcsv($outfile, $datastreamcsv);
                    if ($calltype=="data"){
                        foreach($datastack as $row){
                            fputcsv($outfile, $row);
                        }
                    }
                }
            }
            $locationproperties['datastreams']=$datastreamstack;
            array_push($featurestack, $locationproperties);
        }
        $output=$featurestack;
    }// of call type data and datastream
}//end of non-datasetinfo

if ($format=="csv"){
    #do nothing	
}else{
    echo json_encode($output);
}


?>

