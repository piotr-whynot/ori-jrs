<?php
require_once 'sendEmails.php';
require_once 'send_pass_reset.php';

session_start();
$username = "";
$email = "";
$errors = [];

$conn = new mysqli('localhost', 'contentadim', '@dm1N$ql', 'verify_user');
#include '/.creds/.credentials.php';
#print_r($conn);exit();
// SIGN UP USER
if (isset($_POST['signup-btn'])) {
    if (empty($_POST['username'])) {
        $errors['username'] = 'Username required';
    }
    if (empty($_POST['email'])) {
        $errors['email'] = 'Email required';
    }
    if (empty($_POST['password'])) {
        $errors['password'] = 'Password required';
    }
    if (isset($_POST['password']) && $_POST['password'] !== $_POST['passwordConf']) {
        $errors['passwordConf'] = 'The two passwords do not match';
    }
    
    $username = $_POST['username'];
    $email = $_POST['email'];
    $token = bin2hex(random_bytes(50)); // generate unique token
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); //encrypt password

    // Check if email already exists
    //$sql = "SELECT * FROM users WHERE email='$email' OR username='$username' LIMIT 1";
    $stmt=$conn->prepare("SELECT email, username FROM users WHERE email=? OR username=? LIMIT 1");
    $stmt->bind_param("ss", $_POST['email'], $_POST['username']);
    $stmt->execute();
    $user=$stmt->get_result()->fetch_assoc();
    
    //$result = mysqli_query($conn, $sql);
    //if (mysqli_num_rows($result) > 0) { //echo $result['username'];
    if ($user) {
      $stmt->bind_result($email,$username);
      //$errors['email'] = "Email already exists";
      if($username==$_POST['username']){
        $errors['username'] = "Username already exists";
      }
      if($email==$_POST['email']){
        $errors['email'] = "Email already exists";
      }
        $stmt->close();
    }

    if (count($errors) === 0) {
        $query = "INSERT INTO users SET username=?, email=?, token=?, password=?, date_created=CURRENT_TIMESTAMP()";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('ssss', $username, $email, $token, $password);
        $result = $stmt->execute();

        if ($result) {
            $user_id = $stmt->insert_id;
            $stmt->close();

            // TO DO: send verification email to user
             sendVerificationEmail($email, $token);

            $_SESSION['id'] = $user_id;
            $_SESSION['username'] = $username;
            $_SESSION['email'] = $email;
            $_SESSION['verified'] = false;
            $_SESSION['message'] = 'You are logged in!';
            $_SESSION['type'] = 'alert-success';
            header('location: 168.167.30.196/verify-user/index.php');
        } else {
            $_SESSION['error_msg'] = "Database error: Could not register user";
        }
    }
}

// LOGIN
if (isset($_POST['login-btn'])) {
    if (empty($_POST['username'])) {
        $errors['username'] = 'Username or email required';
    }
    if (empty($_POST['password'])) {
        $errors['password'] = 'Password required';
    }
    $username = $_POST['username'];
    $email = $_POST['username'];
    $password = $_POST['password'];

        $query = "SELECT * FROM users WHERE username=? OR email=? LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('ss', $username, $email);
        $stmt->execute(); 
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password'])) { // if password matches
                $stmt->close(); //Close the query above
                //Set timestamp after successful login
                //$sql = "UPDATE users SET last_login=CURRENT_TIMESTAMP() WHERE email='$email' OR username='$username'";
                $stmt_update=$conn->prepare("UPDATE users SET last_login=CURRENT_TIMESTAMP() WHERE email=? OR username=?");
                $stmt_update->bind_param("ss", $_POST['email'], $_POST['username']);
                $stmt_update->execute();
                //mysqli_query($conn, $sql);

                $stmt_update->close();

                $_SESSION['id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['verified'] = $user['verified'];
                $_SESSION['message'] = 'You are logged in!';
                $_SESSION['type'] = 'alert-success'; echo $_SESSION['message'];
                header('location: 168.167.30.196/verify-user/index.php');
                exit(0);
            } else { // if password does not match
                $errors['login_fail'] = "Wrong username / password";
            }
        } else {
            $_SESSION['message'] = "Database error. Login failed!";
            $_SESSION['type'] = "alert-danger";
        }
    }

}

//Send Password link Reset
if (isset($_POST['reset-btn'])) { 
  if (empty($_POST['email'])) {
    $errors['email'] = 'Email required';
  }
  if (filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    $email = $_POST['email'];
  } else {
      $errors['email'] = "mail is not a valid email address";
  }
  
  if (count($errors) === 0) { 
    $query = "SELECT * FROM users WHERE email=? LIMIT 1";

    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    //$var =$stmt->get_result()->fetch_assoc();
    // var_export($var); exit();
    

    if ($stmt->get_result()->fetch_assoc()) {
      //$result = $stmt->get_result()->fetch_assoc();echo $result;exit();
      $stmt->close();//close the above query
   // if ($result) {
      $token = bin2hex(random_bytes(50)); // generate unique token
      //Update date modified row after creating a token. This is the date and time the token was created.
      $sql = "UPDATE users SET token=?, date_modified=CURRENT_TIMESTAMP() WHERE email=?";
      $stmt_update = $conn->prepare($sql); 
      $stmt_update->bind_param('ss', $token, $email);
      $stmt_update->execute();
      //$var =$stmt_update->get_result()->fetch_assoc();
       //var_export($var); 
      $stmt_update->close();
      //$result = mysqli_query($conn, $sql); var_export($result);exit();
        //$user_id = $stmt->insert_id;
      

        // Send link for password reset to user
         sendPasswordResetLink($email, $token);

       // $_SESSION['id'] = $user_id;
       // $_SESSION['username'] = $username;
       // $_SESSION['email'] = $email;
        //$_SESSION['verified'] = false;
        echo 'Mail has been sent to your email address!';
        
        header("refresh:5;url=http://168.167.30.186/verify-user/login.php");
    } else {
        $errors['error_msg'] = "Your email address could not be found!";
    }


      //$token = bin2hex(random_bytes(50)); // generate unique token
  }

    //Email with token to be sent to the user's email   
}

//Reset Password
if (isset($_POST['pass-reset-btn'])) {
  if (empty($_POST['email'])) {
      $errors['email'] = 'Email required';
  }
  if (empty($_POST['password'])) {
      $errors['password'] = 'Password required';
  }
  if (isset($_POST['password']) && $_POST['password'] !== $_POST['passwordConf']) {
      $errors['passwordConf'] = 'The two passwords do not match';
  }
  $email = $_POST['email'];
  $token = bin2hex(random_bytes(50)); // generate unique token
  $password = password_hash($_POST['password'], PASSWORD_DEFAULT); //encrypt password

  // Check if email already exists
  //$sql = "SELECT * FROM users WHERE email='$email' LIMIT 1";

  $stmt = $conn->prepare("SELECT * FROM users WHERE email=? LIMIT 1");
  $stmt->bind_param("s",$_POST['email']);
  $stmt->execute();
    
  //$result = mysqli_query($conn, $sql); 
  if ($stmt->get_result()->fetch_assoc()) {
    
     //Check when token was created, if more than 2 hours it is expired

    $stmt->close();
    //Update password to the newly created password
    //$sql = "UPDATE users SET password='$password' WHERE email='$email'";
    //$password=password_hash($_POST['password'], PASSWORD_DEFAULT); //encrypt password
    $stmt= $conn->prepare("UPDATE users SET password=? WHERE email=?");
    $stmt->bind_param("ss", $password, $_POST['email']);
    $stmt->execute();
    //echo $stmt->affected_rows; 
    //echo $_POST['email'];
    //echo $stmt->get_result;
     //$var =$stmt->get_result()->fetch_assoc(); echo $var;exit(); 
    //$stmt->close();
    //If password reset was successful, reset the token since it has been used
    if($stmt->affected_rows>0){
      $stmt->close(); //close the query to update password
      $token=bin2hex(random_bytes(50));
      $stmt= $conn->prepare("UPDATE users SET token=? WHERE email=?");
      $stmt->bind_param("ss", $token ,$_POST['email']);
      $stmt->execute();
      $stmt->close(); //close the query to update token
     }else{
       $error['pass_fail']="Password reset failed! An error occured";
     }
    //$result = mysqli_query($conn, $sql);
    //IF password was updated successfully then delete the session. There is no need to reuse it again.
   /* $stmt = $mysqli->prepare("DELETE token FROM users WHERE email=?");
    $stmt->bind_param("ss", $_POST["email"]);
    $stmt->close();*/
   echo "Password reset successfully!";
    
   // $_SESSION['type'] = 'alert-success';
    //header('location: index.php');
    header("refresh:5;url=168.167.30.196/verify-user/index.php");
     // $errors['email'] = "Email already exists";
  }

}

