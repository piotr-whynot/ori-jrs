<?php
session_start();
include '/.creds/.credentials.php';
//need to pick up these to know what to submit
//echo "checking..";

$base="users1";

if(isset($_REQUEST['item'])){
    $item  = $_REQUEST['item'];
}else{
    $item="";
}

if(isset($_REQUEST['value'])){
    $value  = $_REQUEST['value'];
}else{
    $value="";
}

if(isset($_REQUEST['userID'])){
    $userID  = $_REQUEST['userID'];
}else{
    $userID="";
}
	

function checkIfExists1($database, $datatable,$column, $value){
    include '/.creds/.credentials.php';
    $mysqli->select_db($database);
    $stmt = $mysqli->prepare("select * from ${datatable} where ${column}=?");
    $stmt->bind_param("s", $value);
    if (!$stmt->execute()) {
        echo "error1";
//        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        $res = $stmt->get_result();
        $nrows=mysqli_num_rows($res);
        if ($nrows==1){
            echo 'true';
        }else{
            echo 'false';
        }
    }
    $stmt->close();
}
function checkIfExists2($database, $datatable,$column, $value, $id){
    include '/.creds/.credentials.php';
    $mysqli->select_db($database);
    $stmt = $mysqli->prepare("select * from ${datatable} where ${column}=? and userID!=${id}");
    $stmt->bind_param("s", $value);
    if (!$stmt->execute()) {
        echo "error1";
//        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        $res = $stmt->get_result();
        $nrows=mysqli_num_rows($res);
        if ($nrows==1){
            echo 'true';
        }else{
            echo 'false';
        }
    }
    $stmt->close();
}

if ($userID){
	checkIfExists2("users1" ,'users','emailAddress',$value, $userID);
}else{
	checkIfExists1("users1" ,'users','emailAddress',$value);
}
?>
