<?php
# main login tasks
#
# Piotr
#
# June 2017
# 
# handles user login tasks
#  
# register, login, logout, resetPassword, updatePassword and userInfo
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#
# the principles of the setup of functionality below are as follows:
# 
# for each task there is a block of code below
# this script is called from a page containing a form, created in the main.js
# task is called by the url attribute 'action'
# parameters are then read from a submitted form
# data are attempted to be submitted to the database, or database checks are performed
# results, including possible errors, are encapsulated in a json variable and returned to the main.js
# 
# on register - a user is added based on information provided
# a passwordcode is created as a md5 hash of a random number, mailed to the provided e-mail and returned to main.js. it is then used to set the password
#
#
# 
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
session_start();
include '/.creds/.credentials.php';
@$function=$_GET['action'];

switch($function) {
//*************************************************************************************************************
    case "register":
        $data=$_POST["data"];
        $emailaddress=stripslashes($data['emailAddress']);
        $organization=stripslashes($data['organization']);
        $firstname=stripslashes($data['firstName']);
	    $lastname=stripslashes($data['lastName']);
	    $datestr = date('y-m-d h:i:s');
	    $passwordcode=md5(mt_rand(0,1000000));
        //check if already registered
	    $sql= "select * from users1.users where emailaddress='".$emailaddress."'";
	    $res=$mysqli->query($sql);
	    if(mysqli_num_rows($res)){
            $register='false';
            $outcome="already registered as ".$emailaddress." try logging in.";
	    }else{
	        //adding to table
            $sql= "insert into users1.users(firstname, lastname, passwordcode, emailaddress, organization,dateregistered,usertype) values('".$firstname."','".$lastname."','".$passwordcode."','".$emailaddress."','".$organization."','".$datestr."','registered')";
	        //echo $sql;
	        $res=$mysqli->query($sql);
            if($res){
                $register='true';
		        $outcome="success";
		        //send email with password
            }else{
                $register='false';
                $outcome="something went wrong. try again.";
	        }
	    }
	    $result=array($register,$outcome, $passwordcode);
        echo json_encode($result);
        break;

//*************************************************************************************************************
    case "login":
	$data=$_POST["data"];
//	$data= array();
//        $data['emailAddress']='wolski@csag.uct.ac.za';
//        $data['password']='elek1995';
        $login="false";
	$outcome="none";
        $emailAddress=stripslashes($data['emailAddress']);
        $password=md5(stripslashes($data['password']));
	$sql1= "SELECT * FROM users1.users WHERE emailAddress="."'$emailAddress'"." AND password="."'$password'";
	$res=$mysqli->query($sql1);
	echo $res;
	echo mysqli_num_rows($res);
	echo "test";
        if(mysqli_num_rows($res)){
            $login="true";
            $outcome="none";
	        while($user=$res->fetch_array()){
		        $userID=$user['userID'];
                $userArray=array($user['userID'],
                    $user['userType'],
                    $user['firstName'],
                    $user['lastName'],
                    $user['emailAddress'],
                    $user['organization']);
            }
            // find datasets owned by user
            $sql="SELECT distinct datasetID FROM envmondata.dataset JOIN users1.ownership ON envmondata.dataset.datasetID=users1.ownership.ownedItemID WHERE userID=${userID}";
            $res=$mysqli->query($sql);
            $ownedItems=array();
            if(mysqli_num_rows($res)){
                while($owned=$res->fetch_array()){
		            array_push($ownedItems, $owned['datasetID']);
                }
            }
            array_push($userArray,$ownedItems);

            // find locations owned by user
            $ownedItems=array();
            $sql="SELECT distinct locationID FROM envmondata.location JOIN users1.ownership ON envmondata.location.locationID=users1.ownership.ownedItemID WHERE userID=${userID}";
            $res=$mysqli->query($sql);
            $ownedItems=array();
            if(mysqli_num_rows($res)){
                while($owned=$res->fetch_array()){
		            array_push($ownedItems, $owned['locationID']);
                }
            }
            array_push($userArray,$ownedItems);


            $_SESSION['userInfo']=$userArray;
            //Update the last time the user successfully logged in
            $curr_timestamp = date('Y-m-d H:i:s');
            $ip = $_SERVER['REMOTE_ADDR']?:($_SERVER['HTTP_X_FORWARDED_FOR']?:$_SERVER['HTTP_CLIENT_IP']);
            $sql = "UPDATE users1.users SET lastLoggedIn='${curr_timestamp}', lastIPAddress='${ip}' WHERE userID=${userID}";
            $mysqli->query($sql);
        }else{
            $outcome="Username or Password Incorrect";
	    }
	    $result=array($login,$outcome, $sql1);
        echo json_encode($result);
        break;



//*************************************************************************************************************
    case "logout":
        session_unset();
        session_destroy();
        $result=array(null,null,null,null,null,null,null); 
	    echo json_encode($result);
        break;



//*************************************************************************************************************
    case "userInfo":
        if(isset($_SESSION['userInfo'])){
            $result=$_SESSION['userInfo'];
	    }else{
            $result=array(null,null,null,null,null,null,null); 
        }
	    echo json_encode($result);
        break;




//*************************************************************************************************************
    case "updatePassword":
	//Called in response to the password reset link. Replaces password with user-defined one.
	//Used to set password in first login, to reset password and to change password
        $data=$_POST["data"];
	    $password=md5(stripslashes($data['password']));
	    $passwordCode=stripslashes($data['passwordCode']);
	    $sql= "SELECT * FROM users1.users WHERE passwordCode='".$passwordCode."'";
	    //echo $sql;
        $res=$mysqli->query($sql); 
	    if(mysqli_num_rows($res)){
		    $sql= "UPDATE users1.users SET password='".$password."', passwordCode='".md5("")."' where passwordCode='".$passwordCode."'";
		    //echo $sql;
	        $res=$mysqli->query($sql);
	        if ($res){ 
	            $update="true";
	            $outcome="Success";
	        }else{
      	        $update="false";
                $outcome= "<p> Something went awry. Try again, please.</p>";
	        }
	    }else{
	        $update="false";
            $outcome= "<p> Hmm... there is something seriously wrong here. If you think you are here legitimately - drop us an email. Otherwise don't try it again, please.</p>";
        }
	    $result=array($update,$outcome);
        echo json_encode($result);
        break;


//*************************************************************************************************************
    case "resetPassword":
	$passwordCode=md5(mt_rand(0,1000000));
        $data=$_POST['data'];
        $emailAddress=stripslashes($data['emailAddress']);
	$sql= "UPDATE users1.users set passwordCode='".$passwordCode."' WHERE emailAddress='".$emailAddress."'";
        $res=$mysqli->query($sql);
	if($res){
	    $outcome="Success";
	    $reset="true";
	}else{
	    $outcome="Something went awry. Try again";
	    $reset="false";
	}
	$result=array($reset,$outcome, $passwordCode);
	echo json_encode($result);
	break;






//*************************************************************************************************************
    case "updateUser":
        $data=$_POST["data"];
        $emailAddress=stripslashes($data['emailAddress']);
        $organization=stripslashes($data['organization']);
        $firstName=stripslashes($data['firstName']);
	    $lastName=stripslashes($data['lastName']);
	    $userID=stripslashes($data['userID']);

        //check if email address already exists apart from current record
	    $sql= "select * from users1.users where emailAddress='".$emailAddress."' and userID!='".$userID."'";
	    //echo $sql;
	    $res=$mysqli->query($sql);
	    if(mysqli_num_rows($res)){
            $update='false';
            $outcome=$emailAddress." already in database. Try logging in perhaps?";
	    }else{
	    //adding to table
            $sql= "update users1.users set firstName='".$firstName."', lastName='".$lastName."', organization='".$organization."' where userID='".$userID."'";
	//echo $sql;
	        $res=$mysqli->query($sql);
            if($res){
                $update='true';
		        $outcome="success";
		        //send email with password
            }else{
                $update='false';
                $outcome="something went wrong. try again.";
	        }
	    }
	    $result=array($update,$outcome);
        echo json_encode($result);
        break;         




//*************************************************************************************************************
    default: 
            //header("Refresh:0");
    }

?>
