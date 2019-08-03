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
#echo $query1."</br>";
    $result1 = $mysqli->query($query1);
    while ($row1= $result1->fetch_assoc()){
        $datasetID=$row1['datasetID'];
        $datasetarr=array(
            "groupName"=>$row1['datasetName'],
            "groupDescription"=>$row1['datasetDescription'],
        );
        $datasetstack[$datasetID]=$datasetarr;
    }
    $typearr=array(
    "groupName"=>$popularGroupName,
    "data"=>$datasetstack,
    );
    $typestack[$popularGroupName]=$typearr;
}
$grouparr=array(
	"groupName"=>"Biodiversity Data",
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
        $datasetID=$row1['datasetID'];
        $datasetarr=array(
            "groupName"=>$row1['datasetName'],
            "groupDescription"=>$row1['datasetDescription'],
        );
    $datasetstack[$datasetID]=$datasetarr;
    }
    $typearr=array(
    "groupName"=>$variableType,
    "data"=>$datasetstack,
    );
    $typestack[$variableType]=$typearr;
}

$grouparr=array(
	"groupName"=>"Environmental Data",
	"data"=>$typestack
);
return $grouparr;

}




function getowned($mysqli, $type){
    $userID=$_SESSION['userInfo'][0]; 
    if($type=="datasets"){
        // find datasets owned by user
        $ownedItems=array();
        $sql="SELECT distinct datasetID, datasetName FROM envmondata.dataset JOIN users1.ownership ON envmondata.dataset.datasetID=users1.ownership.ownedItemID WHERE userID=${userID}";
        $res=$mysqli->query($sql);
        if(mysqli_num_rows($res)){
            while($owned=$res->fetch_array()){
                $itemarr=array(
	                "groupName"=>$owned['datasetName'],
	                "groupCategory"=>'envmon'
                );
                $ownedItems[$owned['datasetID']]=$itemarr;
            }
        }
        $sql="SELECT distinct datasetID, datasetName FROM biodivdata.dataset JOIN users1.ownership ON biodivdata.dataset.datasetID=users1.ownership.ownedItemID WHERE userID=${userID}";
        $res=$mysqli->query($sql);
        if(mysqli_num_rows($res)){
            while($owned=$res->fetch_array()){
                $itemarr=array(
	                "groupName"=>$owned['datasetName'],
	                "groupCategory"=>'envmon'
                );
                $ownedItems[$owned['datasetID']]=$itemarr;
            }
        }

        $grouparr=array(
	        "groupName"=>"Datasets",
	        "data"=>$ownedItems
        );
    }

    if($type=="locations"){
        // find datasets owned by user
        $sql="SELECT distinct locationID, locationName FROM envmondata.location JOIN users1.ownership ON envmondata.location.locationID=users1.ownership.ownedItemID WHERE userID=${userID}";
        $res=$mysqli->query($sql);
        $ownedItems=array();
        if(mysqli_num_rows($res)){
            while($owned=$res->fetch_array()){
                $itemarr=array(
	                "groupName"=>$owned['locationName'],
	                "groupCategory"=>'envmon'
                );
                $ownedItems[$owned['locationID']]=$itemarr;
            }
        }
        $grouparr=array(
	        "groupName"=>"Locations",
	        "data"=>$ownedItems
        );
    }
    return $grouparr;
}



function getkeydatastream($mysqli, $type){
    // find datastream
    $keylocs=array();
    $sql="SELECT envmondata.datastream.locationID,locationName,variableName,envmondata.datastream.datastreamID FROM envmondata.keydatastream JOIN envmondata.datastream ON envmondata.datastream.datastreamID=envmondata.keydatastream.datastreamID JOIN envmondata.location ON envmondata.datastream.locationID=envmondata.location.locationID";
    $res=$mysqli->query($sql);
    if(mysqli_num_rows($res)){
        while($loc=$res->fetch_array()){
            $keylocs[$loc['datastreamID']]=array(
	            "locationID"=>$loc['locationID'],
	            "locationName"=>$loc['locationName'],
	            "variableName"=>$loc['variableName'],
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
$monitoring['envdata']=getenvdata($mysqli,"monitoring");
$campaign['envdata']=getenvdata($mysqli,"campaign");

$keylocations['envdata']=getkeydatastream($mysqli,"monitoring");
###########################################################################
# connecting to db
# 
$mysqli->select_db('biodivdata');
###########################################################################

$monitoring['biodiv']=getbiodiv($mysqli,"monitoring");
$campaign['biodiv']=getbiodiv($mysqli,"campaign");


if (array_key_exists('userInfo', $_SESSION)){
    $owned['datasets']=getowned($mysqli, "datasets");
    $owned['locations']=getowned($mysqli, "locations");
if ($_SESSION['userInfo']!=null){
    $output['owned']=array(
        "groupName"=>"Your datasets/locations",
       "data"=>$owned
    );
}
}


$all['monitoring']=array(
	"groupName"=>"Monitoring",
	"data"=>$monitoring
);
$all['onceoff']=array(
	"groupName"=>"Once-off surveys",
	"data"=>$campaign
);

$output['all']=array(
    "groupName"=>"Explore all datasets",
    "data"=>$all
);

$key=getkeydatastream($mysqli, "locations");
    $output['keydatastreams']=array(
        "groupName"=>"Key monitoring locations",
       "data"=>$key
    );

echo json_encode($output);

?>

