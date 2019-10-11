<?php include 'controllers/authController.php' ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css" />
  <link rel="stylesheet" href="user-styling.css">
  <title>Monitoring Data - Password Reset</title>
</head>
<body>
  <div class="container">
    <div class="row">
      <div class="col-md-4 offset-md-4 form-wrapper auth">
        <h3 class="text-center form-title">Reset Password</h3>
        <!-- form title -->

        <?php if (count($errors) > 0): ?>
          <div class="alert alert-danger">
            <?php foreach ($errors as $error): ?>
            <li>
              <?php echo $error; ?>
            </li>
            <?php endforeach;?>
          </div>
        <?php endif;?>
        <!-- Before reset password form is displayed check if token is available and has not expired -->
        <?php if(@$_GET['token']){
           $token=$_GET['token'];
           //$sql = "SELECT * FROM users WHERE token='$token' LIMIT 1";
           $sql="SELECT * FROM users WHERE token=? LIMIT 1";
           $stmt=$conn->prepare($sql);
           $stmt->bind_param('s',$_GET['token']);
           $stmt->execute();
           $user=$stmt->get_result()->fetch_assoc();
           //$result = mysqli_query($conn,$sql);

           if ($user) {
             $stmt->close();
             //$user = mysqli_fetch_assoc($result);
             $token_created = $user['date_modified'];
             $username = $user['username'];
             $email = $user['email'];
             #If token is more than 24 hours old then do not reset password
             $expiry_time= date("Y-m-d H:i:s",strtotime('-24 hours')); //echo $token_created;
             $token_date = date("Y-m-d H:i:s", strtotime($token_created));
             #echo $token_date;
             if($expiry_time<$token_date){?>
              <form action="password_reset.php" method="post">
                <div class="form-group">
                 
                  <input type="text" name="username" hidden class="form-control form-control-lg" value="<?php echo $username; ?>">
                </div>
                <div class="form-group">
                  
                  <input type="text" name="email" hidden class="form-control form-control-lg" value="<?php echo $email; ?>">
                </div>
                <div class="form-group">
                  <label>Password</label>
                  <input type="password" name="password" class="form-control form-control-lg">
                </div>
                <div class="form-group">
                  <label>Password Confirm</label>
                  <input type="password" name="passwordConf" class="form-control form-control-lg">
                </div>
                <div class="form-group">
                  <button type="submit" name="pass-reset-btn" class="btn btn-lg btn-block">Reset Password</button>
                </div>
              </form>
             <?php  
             }else{
               echo "Time has expired!"."<a href=sendPassword.php>Create a new token</a>";
             } 
           }else{
             echo "Token could not be found! It must have been used."."<a href=sendPassword.php>Create a new token</a>";
             
           }
   
        ?>

        <?php 
         }else{
            echo "Token cannot be empty";
            header('refresh:5;url=index.php');
            exit;
           // echo  
         }
        ?>
      </div>
    </div>
  </div>
</body>
</html>

