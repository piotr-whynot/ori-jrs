<?php
session_start();
include '/.creds/.credentials.php';
//need to pick up these to know what to submit
//echo "checking..";

if(isset($_REQUEST['base'])){
        $base = $_REQUEST['base'];
}else{
    //this makes sure base is not empty
    $base="admin";
}

//this is table name
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

function checkIfExists($database, $datatable,$column, $value){
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

if ($base=="envmondata" && ($item=="parentLocationID" || $item=="locationID")){
    checkIfExists($base ,'location','locationID',$value);
}else if ($base=="envmondata" && $item=="datastreamID"){
    checkIfExists($base, 'datastream','datastreamID',$value);
}else if ($base=="envmondata" && $item=="datasetID"){
    checkIfExists('envmondata','dataset','datasetID',$value);
}else if ($base=="biodivdata" && $item=="datasetID"){
    checkIfExists('biodivdata','dataset','datasetID',$value);
}else if ($base=="biodivdata" && $item=="locationID"){
    checkIfExists('biodivdata','location','locationID',$value);
}else if ($base=="biodivdata" && strpos($item,"taxonID")!==false){
    checkIfExists('biodivdata','checklist','taxonID',$value);
}else{
    echo "error0<br>";
    echo strpos($item,"taxnID");
    echo "<br>";
    echo $base, $item, $value;
}

?>
