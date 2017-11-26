<?php
session_start();
include '/.creds/.credentials.php';
$data=json_decode($_POST['data']);
//echo json_encode("test0");

$function= stripslashes($data->action);  
//$function=$data['action'];
#return $function;


switch($function) {
    case "loginForm"://Loads login form only
        $form=loginForm('loginform');
#        $form="test1";
        echo json_encode($form);
        break;
    case "register": 
        $load=stripslashes($data->what);
        //echo json_encode($load);
        if($load=='loadform'){//Loads register form for adding users
            $action= register($load,"","");
            //echo json_encode($load);
            echo json_encode($action);
        }
        if($load=='register'){//To add the user to the database after all fields have been field
            $username=stripslashes($data->username);
            $action = register($load,$username,$mysqli);
            echo json_encode($action);
        } 
        #mysql_real_escape_string()
       //include '/creds/.credentials.php';
        break;         
    case "login":
        $logged="false";
        //include '/creds/.credentials.php';
        //session_start();
        $username=stripslashes($data->username);
        $password=md5(stripslashes($data->password));
        $mysqli->select_db('users');
        $sql= "SELECT * FROM users WHERE username="."'$username'"." AND ";
        $sql.="password="."'$password'";
      # $sql.="password="."'$password'"." AND ";
      # $sql.=" active='1'";
        $res=$mysqli->query($sql); //echo json_encode($res->num_rows);
        if($res->num_rows>0){
            while($user=$res->fetch_array()){
                $userArray=array($user['username'],
                $user['privilege'],
                $user['email_address']);
               //$_SESSION['is_admin']=$user['is_admin'];
                $_SESSION['userinfo']=$userArray;
                $logged="true_";
               //Update the last time the user successfully logged in
                $curr_timestamp = date('Y-m-d H:i:s');
               #$datetime = now();
                $sql = "UPDATE users SET last_logged_in="."'$curr_timestamp'"." WHERE username="."'$username'";
                $mysqli->query($sql);
                $logged.=" Logged in as <span id=user onClick=editUser()>"+$user['username']+"</span><a href='#' onClick='logout()'> Log Out</a>";
                $logged.="<span id=user-admin onClick=adminMenu('list')> Admin</span>";
                echo json_encode($logged);
              // header("Refresh:0");
            }
        }else{
          // if($logged=="false"){//Creditials are incorrect or the user doesn't exit
            $logged.="_"."Username or Password Incorrect.";
           echo json_encode($logged);
        }
          //else{
             //echo json_encode('false');
           //} 
        break;
    case "logout":
        session_unset();
        session_destroy();
        echo json_encode("Logged out!");
        break;
    case  "islogged":
        $logged='false';    
        if(isset($_SESSION['userinfo'][0])!=null && 
            $_SESSION['userinfo'][0]!=""){
            //username+admin rights
            $logged='true';
            $logged.="_  Logged in as <span id=user onClick=editUser()>".$_SESSION['userinfo'][0]."</span><a href='#' onClick='logout()'> Log Out</a>";
            if($_SESSION['userinfo'][1]=='admin'){
                $logged.="<span id=user-admin onClick=adminMenu('list')> Admin</span>"; 
            }
            echo json_encode($logged);
        }else{
            $logged.="_".loginForm('loginform');
            echo json_encode($logged);
        }
          //  echo json_encode('false');
        break;
    case "resetPassword":
        $load=stripslashes($data->what);
        //echo json_encode($load);
        if($load=='loadform'){
            $action= resetPassword($load,"","");
            //echo json_encode($load);
            echo json_encode($action);
        }
        if($load=='reset'){
            $username=stripslashes($data->username);
            $action = resetPassword($load,$username,$mysqli);
            echo json_encode($action);
        }    
/*
        $username=stripslashes($data->username);
        $mysqli->select_db('users');
        $sql= "SELECT * FROM users WHERE username="."'$username'";
        $res=$mysqli->query($sql); //echo json_encode($res->num_rows);
        if($res->num_rows>0){
            while($result=$res->fetch_array(MYSQLI_ASSOC)){
                $email=$result['email'];
            }
            $to      = $email;
            $subject = 'Password Reset';
            $message = 'Below is your temporary password.';
            $message .="Please reset it after login.";
            $message .="<br />".$password;
            $headers = 'From: contentadmin@okavangodata.ub.bw' . "\r\n" .
            'Reply-To: contentadmin@okavangodata.ub.bw' . "\r\n" .
            'X-Mailer: PHP/' . phpversion();
            mail($to, $subject, $message, $headers);
            }*/
        break;
    case "editUser":
        if(isset($_SESSION['userinfo'][0])!=null && $_SESSION['userinfo'][0]
            !="" || $_SESSION['userinfo'][1]=='admin'){
            $sql= "SELECT * FROM users WHERE username="."'$username'";
            $res=$mysqli->query($sql);
            $frm="<form><table>";
            while($result=$res->fetch_array()){
                $frm.="<tr><td>Firstname: </td><td><input id=fname type=text>";
                $frm.=$result['fname']."</td></tr>";
                $frm.="<tr><td>Lastname: </td><td><input id=lname type=text>";    
                $frm.=$result['lname']."</td></tr>";
                $frm.="<tr><td>Password: </td><td><input id=password type=password>";
                $frm.=$result['password']."</td></tr>";
                $frm.="<tr><td>Confirm Password: </td><td><input id=password1 type=password>";
                $frm.=$result['password']."</td></tr>";
                $frm.="<tr><td>Email: </td><td><input id=email type=text>";
                $frm.=$result['email']."</td></tr>"; 
                $frm.="<tr><td>Orgnization/Institute: </td><td><input id=institute type=text>";
                $frm.=$result['institute']."</td></tr>";
            }
            $frm.="<tr><td></td><td><input type=button onClick=save()></td></tr>";
            $frm.="</table></form>";
        }
        break;
    case "adminContent": 
        if(isset($_SESSION['userinfo'][0])!=null && $_SESSION['userinfo'][0]
            !="" && $_SESSION['userinfo'][1]=='admin'){
            $load=stripslashes($data->what);
            if($load=='list'){
                $data=adminMenu($load, $mysqli, "admin");
                echo json_encode($data);
            }
        }else{
            if(isset($_SESSION['userinfo'][0])!=null && $_SESSION['userinfo'][0]!=""){
            }
        }
        break;
    case "content":
        if(isset($_SESSION['userinfo'][0])!=null && $_SESSION['userinfo'][0]
            !="" && $_SESSION['userinfo'][1]=='admin'){
            $contentID = $load=stripslashes($data->contentID);
            $mysqli->select_db('webgui');
            $sql = "SELECT * FROM webgui WHERE id=''";
            $res=$mysqli->query($sql);
            while($result=$res->fetch_array){
                $content=$result['text'];
            }
            $frm="<form>";
            $frm.="<textarea>".$content;
            $frm.="</textarea>";
            $frm.="<button id=submit type=button onClick=saveContent()>";
            $frm="</form>";
             echo json_encode($frm);
        } 
        break;
    default: 
        header("Refresh:0");
}




function loginForm($logininfo){
    if($logininfo=='loginform'){
        if(isset($_SESSION['userinfo'][0])!=null && $_SESSION['userinfo'][0] !="" && $_SESSION['userinfo'][1]=='admin'){
            $data="islogged_ Logged in as <span id=user onClick=editUser()>".$_SESSION['userinfo'][0]."</span><a href='#' onClick='logout()'> Log Out</a>";
            if($_SESSION['userinfo'][1]=='admin'){
                $data.="<span id=user-admin onClick=adminMenu('list')> Admin</span>"; 
            }            
        }else{
           // $username="";
           // $password="";
            $data="false_<span id=logo></span><div class=header>Welcome to Okavango Delta Monitoring & Forecasting Portal</div>";
            $data.="<table id=form-table><form class='modal-content animate' >"; 
            $data.= "<div class='container'>";
            $data.="<tr><td><td><div id='errors'></div></td></tr>";
            $data.="<tr><td><label><b>Username:  </b></label></td>";
            $data.="<td><input type='text' placeholder='Enter Username' name='uname' required><br /></td></tr>";
            $data.="<tr><td><label><b>Password:  </b></label></td>";
            $data.="<td><input type='password' placeholder='Enter Password'  name='psw' required><br /></td></tr>";
            $data.="<tr><td></td><td><button type='button' onClick=login('login') >Login</button><input type='checkbox' checked='checked'> Remember me";
            $data.="<tr><td></td><td><span >Forgot <a href='#' onClick=resetPassword('loadform')>password?</a></span></td></tr>";           
            $data.="<tr><td></td><td>OR</td>";
            $data.="<tr><td></td><td> <a href=# onClick=register('loadform')>Register</a></td></td>";
            $data.="</form></table>";
            $data.="</div>";
        }
    }
    if($logininfo=='login'){
    }
    //echo json_encode($frm);
    return $data;
}





function register($action,$dataArray,$connection){
    $data="";
    if($action=='loadform'){
        $data="<div class=header>Okavango Delta Monitoring & Forecasting Portal</div>";
        $data.="<table><form class='modal-content animate' >";
        $data.= "<div class='container'>";
        $data.="<tr><td></td><td><div id='errors'></div></td></tr>";
        $data.="<tr><td><label><b>Firstname:  </b></label></td>";
        $data.="<td><input type='text' placeholder='Enter Firstname' name='fname' required></td></tr>";
        $data.="<tr><td><label><b>Lastname:  </b></label></td>";
        $data.="<td><input type='text' placeholder='Enter Lastname' name='lname' required></td></tr>";
        $data.="<tr><td><label><b>Email Address:  </b></label></td>";
        $data.="<td><input type='email' placeholder='Enter Email Adress' name='email' required></td></tr>";
        $data.="<tr><td><label><b>Password:  </b></label></td>";
        $data.="<td><input type='password' placeholder='Enter Password'  name='psw' required></td></tr>";
        $data.="<tr><td><label><b>Confirm Password:  </b></label></td>";
        $data.="<td><input type='password' placeholder='Confirm Password'  name='psw1' required></td></tr>";
        $data.="<tr><td><label><b>Organisation/Institution:  </b></label></td>";
        $data.="<td><input type='text' placeholder='Enter Organisation/Institution represented' name='lname' required></td></tr>";
        $data.="<tr><td></td><td><button type='button' onClick=disablePopup() >Cancel</button> || ";
        $data.="<button type='button' onClick=register('register') >Submit</button></td></tr>";
        $data.="</div>";
        $data.="</form></table>";
    }
    if($action=='register'){
        $connection->select_db('users');/*
        $sql= "INSERT INTO users(firstname, lastname, email, username, password, organisation )"; 
        $sql.=" VALUES($fname, $lastname, $email, $username, md5($password), organisation)";
        $res=$connection->query($sql);
  
        if($res){
            $data='true_'.'success';
        }else{
            $data='false_'.'Sorry something happened. Please retry';
        }     */ 
    }
    return $data;
}







function resetPassword($action,$username,$connection){
    $data="";
    if($action=='loadform'){
    //disablePopup();
        $data="<form class='modal-content animate' >";
        $data.= "<div class='container'>";
        $data.="<div id='errors'></div>";
        $data.="<div id='info'>Reset password will be sent to your email for the username provided below.</div>";
        $data.="<label><b>Username:  </b></label>";
        $data.="<input type='text' placeholder='Enter Username' name='uname' required><br />";
        $data.="<button type='button' onClick=resetPassword('reset') >Reset</button>";
        $data.="</form>";
        $data.="</div>";
    }
    if($action=='reset'){ $data='action';
        if($username!=""){
            //$data=$mysqli;
            //$mysqli->select_db('users');
            $connection->select_db('users');
            $sql= "SELECT * FROM users WHERE username="."'$username'";
            $res=$connection->query($sql);
           //$sql.="password="."'$password'"." AND ";
            //$sql.=" active='1'";
            if($res->num_rows>0){
                while($result=$res->fetch_array()){
                    $email=$result['email_address'];
                     # $status=$result['active'];// 1 = active account and 0= deactivated account
                }
              //If account is deactivated then it should not send them an email to reset password
             # if($status=1){
                 # $pwd = RAND(); //generate random password
                $to      = $email;
                $subject = 'Password Reset';
                $message = 'Below is your temporary password.';
                $message .="Please reset it after login.";
                //$message .="<br />".$password;
                $headers = 'From: contentadmin@okavangodata.ub.bw' . "\r\n" .
                'Reply-To: contentadmin@okavangodata.ub.bw' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();
                mail($to, $subject, $message, $headers);
                    
                $data="success";
                # }else{
                 #    $data="Please contact contentadmin@ori.ub.bw to activate your account";
                # }
            }else{
                $data="Matching username cannot be found.";
            }
        }else{
            $data="Username cannot be empty!";
        }
    }
    return $data;
}







function adminMenu($action, $connection, $rights){
    $data="";
    if($rights=='admin'){       
        $connection->select_db('users');
        $sql="SELECT * FROM users";
        $res=$connection->query($sql);
        $data="<table id=user-table>";
        $data.="<th>User</th><th>Last Login</th><th>Status</th><th>Action</th>";
                //$table.="<tr>";
        while($result=$res->fetch_array()){
            $data.="<tr><td>".$result['username']."</td>";
            $data.="<td>".$result['last_login']."</td>";
            $data.="<td>";
            $status='InActive';
            if($result['active']=='1'){$status='Active';}
            $data.=$status."</td>";
            $data.="<td><span onClick=editUser()>Edit </span>";
            $data.="<span onClick=deleteUser()> Delete</span></td></tr>";
        }
        $data.="<tr><td colspan=4 align=right><button onClick=register('loadform') id=add>Add User</button></td></tr>";
        $data.="</table>";
    }
    return $data;
}

?>
