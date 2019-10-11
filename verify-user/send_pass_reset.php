<?php
function sendPasswordResetLink($userEmail, $token){

   // global $mailer;
    $body = '<!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <title>Password Reset</title>
      <style>
        .wrapper {
          padding: 20px;
          color: #444;
          font-size: 1.3em;
        }
        a {
          background: #592f80;
          text-decoration: none;
          padding: 8px 15px;
          border-radius: 5px;
          color: #fff;
        }
      </style>
    </head>

    <body>
      <div class="wrapper">
       <p>Thank you for visiting our site. Please click on the link below to reset your password:.</p>
        <a href="http://localhost/verify_user/reset_password.php?token=' . $token . '">reset password!</a>
      </div>
    </body>

    </html>';

   mail($userEmail, "Password Reset", $body);

}

