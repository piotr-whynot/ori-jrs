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
	    $sql= "select * from users.users where emailaddress='".$emailaddress."'";
	    $res=$mysqli->query($sql);
	    if(mysqli_num_rows($res)){
            $register='false';
            $outcome="already registered as ".$emailaddress." try logging in.";
	    }else{
	        //adding to table
            $sql= "insert into users.users(firstname, lastname, passwordcode, emailaddress, organization,dateregistered,usertype) values('".$firstname."','".$lastname."','".$passwordcode."','".$emailaddress."','".$organization."','".$datestr."','registered')";
	        //echo $sql;
	        $res=$mysqli->query($sql);
            if($res){
                $register='true';
		$outcome="success";
		$headers= 'MIME-Version: 1.0' . "\r\n";
	        $headers.= 'Content-type: text/html; charset=UTF-8' . "\r\n";
		$body="<p>Thank you for showing interest and registering on Monitoring Data website at Okavango Research Institute.</p>
<p> copy and use the link below to verify</p><p>https://monitoringdata.ub.bw/?pid=".$passwordcode."</p>";
                 mail($emailaddress,"Monitoring Data Verification",$body, $headers);
		        //send email with password
            }else{
                $register='false';
                $outcome="something went wrong. try again.";
	        }
	    }
	    $result=array($register,$outcome, $passwordcode);
        echo json_encode($result);
	    break;
//************************************************************************************************************	    
    case "verify":
	    $data=$_POST["data"];
	    $sql = "SELECT * FROM users.users WHERE emailAdress="."'$emailAddress'"." AND token=";
	    break;

//*************************************************************************************************************
    case "login":
        $data=$_POST["data"];
        $login="false";
	    $outcome="none";
        $emailAddress=stripslashes($data['emailAddress']);
	    $password=md5(stripslashes($data['password']));

	    $sql= "SELECT * FROM users.users WHERE emailAddress="."'$emailAddress'"." AND password="."'$password'";
       // echo $sql;
        $res=$mysqli->query($sql); 
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
            $sql="SELECT distinct datasetID FROM envmondata.dataset JOIN users.ownership ON envmondata.dataset.datasetID=users.ownership.ownedItemID WHERE userID=${userID}";
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
            $sql="SELECT distinct locationID FROM envmondata.location JOIN users.ownership ON envmondata.location.locationID=users.ownership.ownedItemID WHERE userID=${userID}";
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
            $sql = "UPDATE users.users SET lastLoggedIn='${curr_timestamp}', lastIPAddress='${ip}' WHERE userID=${userID}";
            $mysqli->query($sql);
        }else{
            $outcome="Username or Password Incorrect";
	    }
	    $result=array($login,$outcome);
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
	    $sql0= "SELECT * FROM users.users WHERE passwordCode='".$passwordCode."'";
	    //echo $sql;
        $res=$mysqli->query($sql0); 
	    if(mysqli_num_rows($res)){
	        $randomCode=md5(rand());
            $sql= "UPDATE users.users SET password='".$password."', passwordCode='".$randomCode."' where passwordCode='".$passwordCode."'";
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
            $outcome= "<p> Hmm... something went wrong. Please make sure that you copy the link from the password reset e-mail precisely. Also, if you requested password reset more than once (because e-mail was no arriving) make sure you use the link from the most recent e-mail.</p>";
        }
	    $result=array($update,$outcome, $sql0);
        echo json_encode($result);
        break;


//*************************************************************************************************************
    case "resetPassword":
	$passwordCode=md5(mt_rand(0,1000000));
        $data=$_POST['data'];
	$emailAddress=stripslashes($data['emailAddress']);
	$headers= "MIME-Version: 1.0" . "\r\n";
	$headers.= "Content-type:text/html;charset=UTF-8" . "\r\n";
	//Test
// global $mailer;
	$body='You receive this e-mail because you requested a password reset for your account on www.monitoringdata.ub.bw. If you did not request this, please ignore this e-mail. </br></br>To reset the password - please copy the link below and paste in in your browser </br> </br> http://monitoringdata.ub.bw/?pid='.$passwordCode.'</br></br>Please make sure that you copied the link exactly, i.e. that you did not miss a letter or add any letters.</br></br>Okavango Data Team';
	mail($emailAddress,"Monitoring Data Password Reset",$body, $headers); //This works

	//Firstly check if the emailadress exists in the database
	#$sqlUser="SELECT * FROM users.users WHERE emailAdress='"$emailAdress."'";
	#$resUser=$mysqli->query($sqlUser);
        #if(mysqli_num_rows($resUser)>0){

	    $sql= "UPDATE users.users set passwordCode='".$passwordCode."' WHERE emailAddress='".$emailAddress."'";
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

    case "passReset":
	  header("Location: http://monitoringdata.ub.bw/");
	    echo '<script type="text/javascript">updatePasswordForm("test");</script>';
//	echo '<script type="text/javascript">alert("Loading");
  //      document.getElementById("popupWindowContents").innerHTML=<span clickable onclik=updatePasswordForm()>Click to Update Password</span>
//		</script>';
        $pid = $_GET['pid'];
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
	    $sql= "select * from users.users where emailAddress='".$emailAddress."' and userID!='".$userID."'";
	    //echo $sql;
	    $res=$mysqli->query($sql);
	    if(mysqli_num_rows($res)){
            $update='false';
            $outcome=$emailAddress." already in database. Try logging in perhaps?";
	    }else{
	    //adding to table
            $sql= "update users.users set firstName='".$firstName."', lastName='".$lastName."', organization='".$organization."' where userID='".$userID."'";
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
