<?php
session_start();
include '/.creds/.credentials.php';
//need to pick up these to know what to submit
if(isset($_REQUEST['base'])){
        $base = $_REQUEST['base'];
}else{
    //this makes sure base is not empty
    $base="admin";
}
//this is table name
if(isset($_REQUEST['table'])){
    $table  = $_REQUEST['table'];
}else{
    $table="";
}
if(isset($_REQUEST['datastreamID'])){
    $datastreamID  = $_REQUEST['datastreamID'];
}else{
    $datastreamID="";
}
if(isset($_REQUEST['value'])){
    $value  = $_REQUEST['value'];
}else{
    $value="";
}
if(isset($_REQUEST['date'])){
    $date  = $_REQUEST['date'];
}else{
    $date="";
}
if(isset($_REQUEST['field'])){
    $field  = $_REQUEST['field'];
}else{
    $field="";
}

//this tells what to do
if(isset($_REQUEST['do'])){
    $do  = $_REQUEST['do'];
}else{
    $do="";
}


if ($base=="env" & $table=="measurement1"){
    $mysqli->select_db('envmondata');
    //check if data for given date and datastream exists
    echo $datastreamID;
    echo $date;
    $stmt = $mysqli->prepare("update envmondata.measurement set measurementValue=? where datastreamID=? and measurementDateTime=?");
    $stmt->bind_param("dss", $value, $datastreamID, $date);
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }
    $stmt->close();
    //upload to database
}

if ($base=="env" & $table=="measurement"){
    $mysqli->select_db('envmondata');
    $newval=trim($value);
    if($newval==null){
        $newval="NULL";
    }else{
        $newval="{$newval}";
    }
    $datestr=date("Y-m-d H:i:s", $date); // mysql date format
    $query = "SELECT * FROM envmondata.measurement WHERE datastreamID='$datastreamID' and measurementDateTime = '{$datestr}'";
    $result=$mysqli->query($query);
    if(mysqli_num_rows($result) > 0){
        if($newval=="NULL" && $field=='measurementValue'){
            $query = "delete from envmondata.measurement WHERE datastreamID='$datastreamID' and measurementDateTime = '{$datestr}'";
//    echo $query;
        }else{
            $query = "UPDATE envmondata.measurement SET {$field} = {$newval} WHERE datastreamID='$datastreamID' and measurementDateTime = '{$datestr}'";
        }
        $result1=$mysqli->query($query);
        if($result1){
        }else{
            echo $query."Error!! Data not saved on update".$datestr;
        }
    }else{
        echo "Date selected is not in the database".$datestr;
        $query = "INSERT INTO envmondata.measurement (datastreamID,measurementDateTime,measurementValue) VALUES('{$datastreamID}','{$datestr}',{$newval})";
        $result2=$mysqli->query($query);
        if($result2){
        }else{
            echo $query."Data not saved on insert";
        }
    }
}
?>
