<?php

function getbiodiv($mysqli, $what){

$link="not";
if ($what=="monitoring"){
    $link="";
}

$query0="select distinct popularGroupName from occurrence join event on occurrence.eventID=event.eventID join location on event.locationID=location.locationID where ".$link." location.locationType='monitoring'";
#echo $query0."<br>";
$result0 = $mysqli->query($query0);
$typestack=array();
while($row0 = $result0->fetch_assoc()){
    $popularGroupName=$row0['popularGroupName'];
    $datasetstack=array(); #to store datasets
    $query1="select distinct dataset.datasetID,datasetName,datasetDescription from occurrence join event on occurrence.eventID=event.eventID join dataset on event.datasetID=dataset.datasetID join location on location.locationID=event.locationID where popularGroupName='{$popularGroupName}' and ".$link." location.locationType='monitoring'";
#echo $query1."</br>";
    $result1 = $mysqli->query($query1);
    while ($row1= $result1->fetch_assoc()){
        $datasetID=$row1['datasetID'];
        $datasetarr=array(
            "datasetName"=>$row1['datasetName'],
            "datasetDescription"=>$row1['datasetDescription'],
        );
        $datasetstack[$datasetID]=$datasetarr;
    }
    $typearr=array(
    "typeName"=>$popularGroupName,
    "datasets"=>$datasetstack,
    );
    $typestack[]=$typearr;
}
$grouparr=array(
	"groupCode"=>"biodiv",
	"groupName"=>"Biodiversity Data",
	"dataTypes"=>$typestack)
;
return $grouparr;

}




function getenvdata($mysqli, $what){
$link="not";
if ($what=="monitoring"){
    $link="";
}

$query0="select distinct variableType from datastream join location on datastream.locationID=location.locationID where ".$link." location.locationType='monitoring'";
#echo $query0."<br>";
$result0 = $mysqli->query($query0);

$typestack=array();
while($row0 = $result0->fetch_assoc()){
    $variableType=$row0['variableType'];
    $datasetstack=array(); #to store datasets
    $query1="select distinct dataset.datasetID,datasetName,datasetDescription from dataset join location on location.datasetID=dataset.datasetID join datastream on location.locationID=datastream.locationID where variableType='{$variableType}' and ".$link." location.locationType='monitoring'";
#echo $query1."</br>";
    $result1 = $mysqli->query($query1);
    while ($row1= $result1->fetch_assoc()){
        $datasetID=$row1['datasetID'];
        $datasetarr=array(
            "datasetName"=>$row1['datasetName'],
            "datasetDescription"=>$row1['datasetDescription'],
        );
    $datasetstack[$datasetID]=$datasetarr;
    }
    $typearr=array(
    "typeName"=>$variableType,
    "datasets"=>$datasetstack,
    );
    $typestack[]=$typearr;
}

$grouparr=array(
	"groupName"=>"Environmental Data",
	"groupCode"=>"envdata",
	"dataTypes"=>$typestack
);
return $grouparr;

}



$output=array();
$monitoring=array();
$campaign=array();
###########################################################################
# connecting to db
# using mysqli
include '/.creds/.credentials.php';
$mysqli->select_db('envmondata');
###########################################################################
$monitoring[]=getenvdata($mysqli,"monitoring");
$campaign[]=getenvdata($mysqli,"campaign");

###########################################################################
# connecting to db
# using mysqli
$mysqli->select_db('biodivdata');
###########################################################################
$monitoring[]=getbiodiv($mysqli,"monitoring");
$campaign[]=getbiodiv($mysqli,"campaign");
$output[]=array(
	"groupName"=>"Monitoring",
	"data"=>$monitoring
);
$output[]=array(
	"groupName"=>"Once-off surveys",
	"data"=>$campaign
);


echo json_encode($output);

?>

