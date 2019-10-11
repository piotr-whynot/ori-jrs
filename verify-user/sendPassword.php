<?php include 'controllers/authController.php' ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css" />
  <link rel="stylesheet" href="main.css">
  <title>Okavango Research Institute - Login</title>
</head>
<body>
  <div class="container">
    <div class="row">
      <div class="col-md-4 offset-md-4 form-wrapper auth login">
        <h3 class="text-center form-title">Reset Password</h3>
        <!-- Display messages -->
        <?php if (isset($_SESSION['message'])): ?>
        <div class="alert <?php echo $_SESSION['type'] ?>">
          <?php
            echo $_SESSION['message'];
            unset($_SESSION['message']);
            unset($_SESSION['type']);
          ?>
        </div>
        <?php endif;?>

        <?php if (count($errors) > 0): ?>
          <div class="alert alert-danger">
            <?php foreach ($errors as $error): ?>
            <li>
              <?php echo $error; ?>
            </li>
            <?php endforeach;?>
          </div>
        <?php endif;?>
        <form action="sendPassword.php" method="post">
          <div class="form-group">
            <label>Email Address</label>
            <input type="text" name="email" class="form-control form-control-lg" value="<?php echo $email; ?>">
          </div>
          <div class="form-group">
            <button type="submit" name="reset-btn" class="btn btn-lg btn-block">Send</button>
          </div>
        </form>
        <p><a href="login.php">Cancel</a> | <a href="signup.php">Sign up</a></p>
      </div>
    </div>
  </div>
</body>
</html>

