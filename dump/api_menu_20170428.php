<?php

$output=array();

###########################################################################
# connecting to db
# using mysqli
include '/.creds/.credentials.php';
$mysqli->select_db('biodivdata');

###########################################################################
$query0="select distinct popularGroupName from ocurrence";
#echo $query0."<br>";
$result0 = $mysqli->query($query0);

$typestack=array();
while($row0 = $result0->fetch_assoc()){
    $popularGroupName=$row0['popularGroupName'];
    $datasetstack=array(); #to store datasets
    $query1="select distinct dataset.datasetID,datasetName,datasetDescription from ocurrence join event on ocurrence.eventID=event.eventID join dataset on event.datasetID=dataset.datasetID where popularGroupName='{$popularGroupName}'";
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
	"groupName"=>"Biodiversity Data",
	"dataTypes"=>$typestack)
;
$output["biodiv"]=$grouparr;


###########################################################################
# connecting to db
# using mysqli
$mysqli->select_db('envmondata');

###########################################################################

$query0="select distinct variableType from datastream";
#echo $query0."<br>";
$result0 = $mysqli->query($query0);

$typestack=array();
while($row0 = $result0->fetch_assoc()){
    $variableType=$row0['variableType'];
    $datasetstack=array(); #to store datasets
    $query1="select distinct dataset.datasetID,datasetName,datasetDescription from datastream join dataset on datastream.datasetID=dataset.datasetID where variableType='{$variableType}'";
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
	"dataTypes"=>$typestack
);
$output["envmon"]=$grouparr;

echo json_encode($output);

?>

