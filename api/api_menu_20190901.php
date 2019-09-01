<?php
session_start();

//foreach($_SESSION['userInfo'] as $test){echo $test;}


function getbiodiv($mysqli, $what){
$link="not";
if ($what=="monitoring"){
    $link="";
}

$query0="select distinct popularGroupName from occurrence join event on occurrence.eventID=event.eventID join location on event.locationID=location.locationID where ".$link." location.locationType='monitoring'";
//echo $query0."<br>";


$result0 = $mysqli->query($query0);
$typestack=array();
while($row0 = $result0->fetch_assoc()){
    $popularGroupName=$row0['popularGroupName'];
    $datasetstack=array(); #to store datasets
    $query1="select distinct dataset.datasetID,datasetName,datasetDescription from occurrence join event on occurrence.eventID=event.eventID join dataset on event.datasetID=dataset.datasetID join location on location.locationID=event.locationID where popularGroupName='{$popularGroupName}' and ".$link." location.locationType='monitoring'";
//echo $query1."</br>";
    $result1 = $mysqli->query($query1);
    while ($row1= $result1->fetch_assoc()){
        $datasetarr=array(
            "datastreamID"=>"",
            "variableName"=>"",
            "locationID"=>"",
            "locationName"=>"",
            "datasetID"=>$row1['datasetID'],
            "datasetName"=>$row1['datasetName'],
            "datasetDescription"=>$row1['datasetDescription'],
        );
        $datasetstack[]=$datasetarr;
    }
    $typearr=array(
        "categoryID"=>$popularGroupName,
        "categoryName"=>$popularGroupName,
        "data"=>$datasetstack,
    );
    $typestack[]=$typearr;
}
$grouparr=array(
	"categoryID"=>"biodiv",
	"categoryName"=>"Biodiversity Data",
	"data"=>$typestack)
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
//echo $query1."</br>";
    $result1 = $mysqli->query($query1);
    while ($row1= $result1->fetch_assoc()){
        $datasetarr=array(
            "datastreamID"=>"",
            "variableName"=>"",
            "locationID"=>"",
            "locationName"=>"",
            "datasetID"=>$row1['datasetID'],
            "datasetName"=>$row1['datasetName'],
            "datasetDescription"=>$row1['datasetDescription'],
        );
        $datasetstack[]=$datasetarr;
    }
    $typearr=array(
    "categoryID"=>$variableType,
    "categoryName"=>$variableType,
    "data"=>$datasetstack,
    );
    $typestack[]=$typearr;
}

$grouparr=array(
	"categoryID"=>"envmon",
	"categoryName"=>"Environmental Data",
	"data"=>$typestack
);
return $grouparr;
}




function getowned($mysqli){
    $userID=$_SESSION['userInfo'][0]; 
        // find datasets owned by user
        $ownedItems=array();
        $sql="SELECT distinct datasetID, datasetName FROM envmondata.dataset JOIN users1.ownership ON envmondata.dataset.datasetID=users1.ownership.ownedItemID WHERE userID=${userID}";
        $res=$mysqli->query($sql);
        if(mysqli_num_rows($res)){
            while($owned=$res->fetch_array()){
                $itemarr=array(
	                "datastreamID"=>"",
	                "variableName"=>"",
	                "locationID"=>"",
	                "locationName"=>"",
	                "datasetName"=>$owned['datasetName'],
	                "datasetID"=>$owned['datasetID'],
	                "databaseCategory"=>'envmon'
                );
                $ownedItems[]=$itemarr;
            }
        }
        $sql="SELECT distinct datasetID, datasetName FROM biodivdata.dataset JOIN users1.ownership ON biodivdata.dataset.datasetID=users1.ownership.ownedItemID WHERE userID=${userID}";
        $res=$mysqli->query($sql);
        if(mysqli_num_rows($res)){
            while($owned=$res->fetch_array()){
                $itemarr=array(
	                "datastreamID"=>"",
	                "variableName"=>"",
	                "locationID"=>"",
	                "locationName"=>"",
	                "datasetID"=>$owned['datasetID'],
	                "datasetName"=>$owned['datasetName'],
	                "databaseCategory"=>'biodiv'
                );
                $ownedItems[]=$itemarr;
            }
        }

        // find datasets owned by user
        $sql="SELECT distinct locationID, locationName, datasetID FROM envmondata.location JOIN users1.ownership ON envmondata.location.locationID=users1.ownership.ownedItemID WHERE userID=${userID}";
        $res=$mysqli->query($sql);
        if(mysqli_num_rows($res)){
            while($owned=$res->fetch_array()){
                $itemarr=array(
	                "datastreamID"=>"",
	                "variableName"=>"",
	                "locationID"=>$owned['locationID'],
	                "locationName"=>$owned['locationName'],
	                "datasetID"=>$owned['datasetID'],
	                "databaseCategory"=>'biodiv'
                );
                $ownedItems[]=$itemarr;
            }
        }
    return $ownedItems;
}



function getkeydatastream($mysqli, $type){
    // find datastream
    $keylocs=array();
    $sql="SELECT envmondata.datastream.locationID,locationName,variableName,datasetID,envmondata.datastream.datastreamID FROM envmondata.keydatastream JOIN envmondata.datastream ON envmondata.datastream.datastreamID=envmondata.keydatastream.datastreamID JOIN envmondata.location ON envmondata.datastream.locationID=envmondata.location.locationID";
    $res=$mysqli->query($sql);
    if(mysqli_num_rows($res)){
        while($loc=$res->fetch_array()){
            $keylocs[]=array(
	            "datastreamID"=>$loc['datastreamID'],
	            "variableName"=>$loc['variableName'],
	            "locationID"=>$loc['locationID'],
	            "locationName"=>$loc['locationName'],
	            "datasetID"=>$loc['datasetID'],
	            "databaseCategory"=>'envmon'
            );
        }
    }
    return $keylocs;
}






#inital checks on arguments
#check if dataset is set


#standard menu call
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

$keylocations['envdata']=getkeydatastream($mysqli,"monitoring");
###########################################################################
# connecting to db
# 
$mysqli->select_db('biodivdata');
###########################################################################

$monitoring[]=getbiodiv($mysqli,"monitoring");
$campaign[]=getbiodiv($mysqli,"campaign");



$key=getkeydatastream($mysqli, "locations");
    $output[]=array(
        "categoryID"=>"keydatastreams",
        "categoryName"=>"Key monitoring locations",
        "data"=>$key
    );


$all[]=array(
    "categoryID"=>"monitoring",
	"categoryName"=>"Monitoring",
	"data"=>$monitoring
);
$all[]=array(
    "categoryID"=>"onceoff",
	"categoryName"=>"Once-off and short-term campaigns",
	"data"=>$campaign
);


$output[]=array(
    "categoryID"=>"all",
    "categoryName"=>"Explore all datasets",
    "data"=>$all
);

if (array_key_exists('userInfo', $_SESSION)){
    $owned=getowned($mysqli);
    if ($_SESSION['userInfo']!=null){
        $output[]=array(
            "categoryID"=>"owned",
            "categoryName"=>"Your datasets/locations",
            "data"=>$owned
        );
    }
}


echo json_encode($output);

?>

