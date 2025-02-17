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

if(isset($_REQUEST['type'])){
    $type  = $_REQUEST['type'];
}else{
    $type="";
}

//this tells what to do
if(isset($_REQUEST['do'])){
    $do  = $_REQUEST['do'];
}else{
    $do="";
}

$errorflag=true;


#******************************************************************************************************************************************
# envmon & dataset
#
if ($base=="envmondata" & $table=="dataset"){
    $errorflag=false;
    $mysqli->select_db('envmondata');
    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into envmondata.dataset values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("sssssssssssssss", $_POST['datasetID'], $_POST['datasetName'], $_POST['institutionCode'],$_POST['ownerInstitutionCode'],$_POST['datasetLicence'],$_POST['datasetDescription'],$_POST['publications'],$_POST['datasetRemarks'],$_POST['subjectScope'],$_POST['temporalScope'],$_POST['geographicScope'],$_POST['samplingApproach'],$_POST['methodSteps'],$_POST['qualityControl'],$_POST['datasetCitation']);
    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update envmondata.dataset set datasetName=?, institutionCode=?, ownerInstitutionCode=?,datasetLicence=?, datasetDescription=?, publications=?, datasetRemarks=? , subjectScope=?, temporalScope=?, geographicScope=?, samplingApproach=?, methodSteps=?, qualityControl=?, datasetCitation=? where datasetID=?");
        $stmt->bind_param("sssssssssssssss", $_POST['datasetName'], $_POST['institutionCode'],$_POST['ownerInstitutionCode'],$_POST['datasetLicence'],$_POST['datasetDescription'],$_POST['publications'],$_POST['datasetRemarks'],$_POST['subjectScope'],$_POST['temporalScope'],$_POST['geographicScope'],$_POST['samplingApproach'],$_POST['methodSteps'],$_POST['qualityControl'],$_POST['datasetCitation'], $_POST['datasetID']);
    }

    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        echo "success";
    }
    $stmt->close();
}




#******************************************************************************************************************************************
# envmon & location
#
if ($base=="envmondata" & $table=="location"){
    $errorflag=false;
    $mysqli->select_db('envmondata');
    // these are for numeric fields that may be null
    if ($_POST['verbatimElevation']==''){ $verbatimElevation=NULL;}else{$verbatimElevation=$_POST['verbatimElevation'];}
    if ($_POST['elevationUncertaintyInMeters']==''){ $elevationUncertaintyInMeters=NULL;}else{$elevationUncertaintyInMeters=$_POST['elevationUncertaintyInMeters'];}
    if ($_POST['childLocationValue']==''){ $childLocationValue=NULL;}else{$childLocationValue=$_POST['childLocationValue'];}
    if ($_POST['associatedMedia']!=''){
        if (substr($_POST['associatedMedia'],0,2)=='..'){
            // new file stored in temp
            $file=$_POST['associatedMedia'];
//            echo $file;
            $ext=strtolower(pathinfo($file)['extension']);
            $fname=pathinfo($file)['filename'];
            $newfile="../associatedMedia/".$_POST['locationID']."_media.".$ext;
//            echo $newfile;
            rename($file, $newfile);
//            echo "<br>";
//            echo dirname($_SERVER['PHP_SELF']);
//            echo "<br>";
//            echo str_replace(dirname($_SERVER['PHP_SELF']),"admin","");
//            echo "<br>";
            $associatedMedia="http://".$_SERVER['HTTP_HOST'].str_replace("admin","",dirname($_SERVER['PHP_SELF']))."associatedMedia/".$_POST['locationID']."_media.".$ext;
//            echo $associatedMedia;
        }else{
           // old file
           $associatedMedia=$_POST['associatedMedia'];
        }
    }
    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into envmondata.location values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssssdddssssddssdsss", $_POST['locationID'], $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$_POST['countryCode'],$_POST['locationRemarks'], $associatedMedia,$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['parentLocationID'],$childLocationValue,$_POST['childLocationUnit'],$_POST['geomorphologicalPosition'],$_POST['locationOwner']);

    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update envmondata.location set  datasetID=?, locationName=?, locality=?,  decimalLatitude=?, decimalLongitude=?, coordinateUncertaintyInMeters=?, geodeticDatum=?, verbatimElevation=?, elevationUncertaintyInMeters=?, locationType=?, parentLocationID=?, childLocationValue=?, childLocationUnit=?, geomorphologicalPosition=?, countryCode=?, locationOwner=?, locationRemarks=?, associatedMedia=? where locationID=?");

        $stmt->bind_param("sssdddsddssdsssssss", $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['parentLocationID'],$childLocationValue,$_POST['childLocationUnit'],$_POST['geomorphologicalPosition'],$_POST['countryCode'],$_POST['locationOwner'],$_POST['locationRemarks'],$associatedMedia, $_POST['locationID']);
    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        echo "success";
    }
    $stmt->close();
    $url="./?base=envmondata&do=edit&table=location&datasetID={$_POST['datasetID']}";
}




#******************************************************************************************************************************************
# envmon & datastream
#
if ($base=="envmondata" & $table=="datastream"){
    $errorflag=false;
    $mysqli->select_db('envmondata');
    // these are for numeric fields that may be null
    if ($_POST['sampleSizeValue']==''){ $sampleSizeValue=NULL;} else {$sampleSizeValue=$_POST['sampleSizeValue'];}
//echo $do;
//echo  $_POST['locationID'].$_POST['variableType'].$_POST['variableName'].$_POST['variableUnit'].$_POST['baseTime'].$_POST['basisOfRecord'].$_POST['samplingEffort'].$_POST['samplingProtocol'].$sampleSizeValue.$_POST['sampleSizeUnit'].$_POST['datastreamID'];
    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into envmondata.datastream values (?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("sssssssssds", $_POST['datastreamID'], $_POST['locationID'], $_POST['variableType'], $_POST['variableName'], $_POST['variableUnit'],$_POST['baseTime'],$_POST['basisOfRecord'],$_POST['samplingEffort'],$_POST['samplingProtocol'],$sampleSizeValue,$_POST['sampleSizeUnit']);
    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update envmondata.datastream set locationID=?, variableType=?, variableName=?, variableUnit=?,  baseTime=?, basisOfRecord=?, samplingEffort=?, samplingProtocol=?, sampleSizeValue=?, sampleSizeUnit=? where datastreamID=?");

        $stmt->bind_param("ssssssssdss",  $_POST['locationID'], $_POST['variableType'], $_POST['variableName'], $_POST['variableUnit'],$_POST['baseTime'],$_POST['basisOfRecord'],$_POST['samplingEffort'],$_POST['samplingProtocol'],$sampleSizeValue,$_POST['sampleSizeUnit'], $_POST['datastreamID']);

    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") ";
    }else{
        echo "success";
    }
    $stmt->close();
    $url="./?base=envmondata&do=edit&table=datastream&locationID={$_POST['locationID']}";
}



#******************************************************************************************************************************************
# biodiv & dataset
#
if ($base=="biodivdata" & $table=="dataset"){
    $errorflag=false;
    $mysqli->select_db('biodivdata');
    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into biodivdata.dataset values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("sssssssssssssss", $_POST['datasetID'], $_POST['datasetName'], $_POST['institutionCode'],$_POST['ownerInstitutionCode'],$_POST['datasetLicence'],$_POST['datasetDescription'],$_POST['publications'],$_POST['datasetRemarks'],$_POST['subjectScope'],$_POST['temporalScope'],$_POST['geographicScope'],$_POST['samplingApproach'],$_POST['methodSteps'],$_POST['qualityControl'],$_POST['datasetCitation']);
    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update biodivdata.dataset set datasetName=?, institutionCode=?, ownerInstitutionCode=?,datasetLicence=?, datasetDescription=?, publications=?, datasetRemarks=? , subjectScope=?, temporalScope=?, geographicScope=?, samplingAproach=?, methodSteps=?, qualityControl=?, datasetCitation=? where datasetID=?");
        $stmt->bind_param("sssssssssssssss", $_POST['datasetName'], $_POST['institutionCode'],$_POST['ownerInstitutionCode'],$_POST['datasetLicence'],$_POST['datasetDescription'],$_POST['publications'],$_POST['datasetRemarks'],$_POST['subjectScope'],$_POST['temporalScope'],$_POST['geographicScope'],$_POST['samplingApproach'],$_POST['methodSteps'],$_POST['qualityControl'],$_POST['datasetCitation'], $_POST['datasetID']);
    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
	echo "success";
    }
    $stmt->close();
    $url="./?base=biodivdata&do=edit&table=dataset";
}

#******************************************************************************************************************************************
# biodiv & event
#
if ($base=="biodivdata" & $table=="event"){
    $errorflag=false;
    $mysqli->select_db('biodivdata');
    $eventDate="{$_POST['eventDate']}";
    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into biodivdata.event values (?,?,?,?,?,?,?,?,?,?,?,?,?)");

        $stmt->bind_param("sssssssssdsss", $_POST['eventID'], $_POST['locationID'], $_POST['habitat'], $_POST['datasetID'],$_POST['eventDate'],$_POST['eventTime'],$_POST['samplingProtocol'],$_POST['samplingEffort'],$_POST['basisOfRecord'],$_POST['sampleSizeValue'],$_POST['sampleSizeUnit'],$_POST['recordedBy'],$_POST['eventRemarks']);
    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update biodivdata.event set  locationID=?, habitat=?, datasetID=?,  eventDate=?, eventTime=?, samplingProtocol=?, samplingEffort=?, basisOfRecord=?, sampleSizeValue=?, sampleSizeUnit=?, recordedBy=?, eventRemarks=? where eventID=?");

        $stmt->bind_param("ssssssssdssss", $_POST['locationID'], $_POST['habitat'], $_POST['datasetID'],$eventDate,$_POST['eventTime'],$_POST['samplingProtocol'],$_POST['samplingEffort'],$_POST['basisOfRecord'],$_POST['sampleSizeValue'],$_POST['sampleSizeUnit'],$_POST['recordedBy'],$_POST['eventRemarks'], $_POST['eventID']);
    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        echo "success";
    }
    $stmt->close();
    $url="./?base=biodivdata&do=edit&table=event&datasetID={$_POST['datasetID']}&locationID={$_POST['locationID']}";
}



#******************************************************************************************************************************************
# biodiv & location
#
if ($base=="biodivdata" & $table=="location"){
    $errorflag=false;
    $mysqli->select_db('biodivdata');
    // these are for numeric fields that may be null
    if ($_POST['verbatimElevation']==''){ $vebatimElevation=NULL;} else {$verbatimElevation=$_POST['verbatimElevation'];}
    if ($_POST['elevationUncertaintyInMeters']==''){ $elevationUncertaintyInMeters=NULL;} else {$elevationUncertaintyInMeters=$_POST['elevationUncertaintyInMeters'];}

    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into biodivdata.location values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");

        $stmt->bind_param("ssssdddsddsssss", $_POST['locationID'], $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['geomorphologicalPosition'],$_POST['countryCode'],$_POST['locationRemarks'],$_POST['associatedMedia']);
    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update biodivdata.location set  datasetID=?, locationName=?, locality=?,  decimalLatitude=?, decimalLongitude=?, coordinateUncertaintyInMeters=?, geodeticDatum=?, verbatimElevation=?, elevationUncertaintyInMeters=?, locationType=?, geomorphologicalPosition=?, countryCode=?, locationRemarks=?, associatedMedia=? where locationID=?");

        $stmt->bind_param("sssdddsddssssss", $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['geomorphologicalPosition'],$_POST['countryCode'],$_POST['locationRemarks'],$_POST['associatedMedia'], $_POST['locationID']);
    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        echo "success";
    }
    $stmt->close();
    $url="./?base=biodivdata&do=edit&table=location&datasetID={$_POST['datasetID']}";
}


#******************************************************************************************************************************************
# biodiv & checklist
#
if ($base=="biodivdata" & $table=="checklist"){
    $errorflag=false;
    $mysqli->select_db('biodivdata');
    // these are for numeric fields that may be null
    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into biodivdata.checklist values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssssdddsddsssssss", $_POST['locationID'], $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['geomorphologicalPosition'],$_POST['countryCode'],$_POST['footprintWKT'],$_POST['footprintSRS'],$_POST['locationRemarks'],$_POST['associatedMedia']);
    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update biodivdata.location set  datasetID=?, locationName=?, locality=?,  decimalLatitude=?, decimalLongitude=?, coordinateUncertaintyInMeters=?, geodeticDatum=?, verbatimElevation=?, elevationUncertaintyInMeters=?, locationType=?, geomorphologicalPosition=?, countryCode=?, footprintWKT=?, footprintSRS=?, locationRemarks=?, associatedMedia=? where locationID=?");

        $stmt->bind_param("sssdddsddssssssss", $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['geomorphologicalPosition'],$_POST['countryCode'],$_POST['footprintWKT'],$_POST['footprintSRS'],$_POST['locationRemarks'],$_POST['associatedMedia'], $_POST['locationID']);
    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        echo "success";
    }
    $stmt->close();
    $url="./?base=biodivdata&do=edit&table=location&datasetID={$_POST['datasetID']}";
}

#******************************************************************************************************************************************
# biodiv & occurrence
#
if ($base=="biodivdata" & $table=="occurrence"){
    $errorflag=false;
    $mysqli->select_db('biodivdata');
    // these are for numeric fields that may be null
    if ($do=="add"){
        //using prepared statements - apparently v.secure way of interacting with database
        $stmt = $mysqli->prepare("insert into biodivdata.checklist values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssssdddsddsssssss", $_POST['locationID'], $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['geomorphologicalPosition'],$_POST['countryCode'],$_POST['footprintWKT'],$_POST['footprintSRS'],$_POST['locationRemarks'],$_POST['associatedMedia']);
    }else if ($do=="edit"){
        $stmt = $mysqli->prepare("update biodivdata.location set  datasetID=?, locationName=?, locality=?,  decimalLatitude=?, decimalLongitude=?, coordinateUncertaintyInMeters=?, geodeticDatum=?, verbatimElevation=?, elevationUncertaintyInMeters=?, locationType=?, geomorphologicalPosition=?, countryCode=?, footprintWKT=?, footprintSRS=?, locationRemarks=?, associatedMedia=? where locationID=?");

        $stmt->bind_param("sssdddsddssssssss", $_POST['datasetID'], $_POST['locationName'], $_POST['locality'],$_POST['decimalLatitude'],$_POST['decimalLongitude'],$_POST['coordinateUncertaintyInMeters'],$_POST['geodeticDatum'],$verbatimElevation,$elevationUncertaintyInMeters,$_POST['locationType'],$_POST['geomorphologicalPosition'],$_POST['countryCode'],$_POST['footprintWKT'],$_POST['footprintSRS'],$_POST['locationRemarks'],$_POST['associatedMedia'], $_POST['locationID']);
    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        echo "success";
    }
    $stmt->close();
    $url="./?base=biodivdata&do=edit&table=location&datasetID={$_POST['datasetID']}";
}



#******************************************************************************************************************************************
# user & user
#
if ($base=="users" & $table=="users"){
    $errorflag=false;
    $mysqli->select_db('users');
    if ($do=="add"){
	$datestr = date('Y-m-d H:i:s');
	$passwordCode=md5(mt_rand(0,1000000));
	//using prepared statements - apparently v.secure way of interacting with database	
	if ($_POST['password']){
            $password=md5($_POST['password']);
            $stmt = $mysqli->prepare("insert into users (lastName, firstName,emailAddress,organization,userType,dateRegistered,passwordCode,password) values (?,?,?,?,?,?,?,?)");
            $stmt->bind_param("ssssssss", $_POST['lastName'], $_POST['firstName'],$_POST['emailAddress'],$_POST['organization'],$_POST['userType'],$datestr, $passwordCode, $password);
	}else{
            $stmt = $mysqli->prepare("insert into users (lastName, firstName,emailAddress,organization,userType,dateRegistered,passwordCode) values (?,?,?,?,?,?,?)");
            $stmt->bind_param("sssssss", $_POST['lastName'], $_POST['firstName'],$_POST['emailAddress'],$_POST['organization'],$_POST['userType'],$datestr, $passwordCode);
	}
    }else if ($do=="edit"){

	if ($_POST['password']){
            $password=md5($_POST['password']);
            $stmt = $mysqli->prepare("update users set firstName=?, lastName=?, emailAddress=?, organization=?, userType=?,password=? where userID=?");
            $stmt->bind_param("ssssssd", $_POST['firstName'], $_POST['lastName'],$_POST['emailAddress'],$_POST['organization'],$_POST['userType'],$password, $_POST['userID']);

	}else{
            $stmt = $mysqli->prepare("update users set firstName=?, lastName=?, emailAddress=?, organization=?, userType=? where userID=?");
            $stmt->bind_param("sssssd", $_POST['firstName'], $_POST['lastName'],$_POST['emailAddress'],$_POST['organization'],$_POST['userType'],$_POST['userID']);
        }
    }
    if (!$stmt->execute()) {
        $errorflag=true;
        echo "Execute failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }else{
        echo "success";
    }
    $stmt->close();
    $url="./?base=users&do=edit&table=users";
}

if ($errorflag) {
    echo "Some errors occurred";
}

?>
