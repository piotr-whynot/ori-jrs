function loginForm(){
    console.log("loginform");
    frm="<div class='loginContainer form-group text-center'><form>"; 
    frm+="<table>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>E-mail:  </label></td><td><input class=form-control type='text' placeholder='Enter e-mail' name='emailAddress' required ><br/></td></tr>";
    frm+="<tr><td><label>Password:  </label></td><td><input class=form-control type='password' placeholder='Enter Password'  name='password' required><br/></td></tr>";
    frm+="</table>";
    frm+="<button class='btn btn-primary my-2' type='button' onClick=login() >Login</button>&nbsp";
    frm+="<div class='clickable' onClick=resetPasswordForm()> Forgot password?</div>";           
    frm+="</form></div>";
    //popup(500,500, frm);
    textinModal(frm, "Log in");
}

function resetPasswordForm(){
    frm="<div class='loginContainer from-group text-center'><form>";
    frm+="<table>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>Email address:  </label><td><input class=form-control type='email' placeholder='Enter Email Adress' name='emailAddress' required></td></tr>";
    frm+="</table>";
    frm+="<button class='btn btn-primary my-2' type='button' onClick=resetPassword()>Reset</button>&nbsp";
    frm+="<p class='text-muted'>Reset password link will be sent to your email</p>";
    frm+="</form></div>";
    textinModal(frm, "Reset Password");
}


function registerForm(){
    frm="<div class='loginContainer form-group text-center'><form>";
    frm+="<table>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>Firstname:  </label></td><td><input class=form-control type='text' placeholder='Enter Firstname' name='firstName' required></td></tr>";
    frm+="<tr><td><label>Lastname:  </label></td><td><input class=form-control type='text' placeholder='Enter Lastname' name='lastName'  required></td></tr>";
    frm+="<tr><td><label>Email Address:  </label></td><td><input class=form-control type='email' placeholder='Enter Email Adress' name='emailAddress' required></td></tr>";
    frm+="<tr><td><label>Organisation/Institution:  </label></td><td><input class=form-control type='text' placeholder='Organisation/Institution Name, Country' name='organization' required width=150px></td></tr>";
    frm+="</table>";
    frm+="<button class='btn btn-primary my-2' type='button' onClick=register() >Submit</button>&nbsp";
    frm+="<p class='text-muted'>On submitting you will be e-mailed a link to set your password. Use that link to change password to one of your choice.</p>";
    frm+="<p class='text-muted'>Please note that we ask for your e-mail only in two cases - if you want to download data from this website, or if you want to contribute data to this website. In the first case - we just want to have an inventory of who dowloads data, and if you register for this purpose, you should not receive any e-mails from us. In the second case - you may receive an ocassional \"housekeeping\" e-mail. In either case, e-mails provided here will not be shared with anyone, and will not be used for any marketing purpose.</p>";
    frm+="</form></div>"
    textinModal(frm, "Register");
}



function updateUserForm(){
    frm="<div class='loginContainer text-center form-group'><form>";
    frm+="<input class='form-control hidden' type='text' name='userID'>";
    frm+="<table>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>Firstname:  </label></td><td><input class=form-control type='text' placeholder='Enter Firstname' name='firstName' required></td></tr>";
    frm+="<tr><td><label>Lastname:  </label></td><td><input class=form-control type='text' placeholder='Enter Lastname' name='lastName' required></td></tr>";
    frm+="<tr><td><label>Email Address:  </label></td><td><input class=form-control type='email' placeholder='Enter Email Adress' name='emailAddress' disabled></td></tr>";
    frm+="<tr><td><label>Organisation/Institution:  </label></td><td><input class=form-control type='text' placeholder='Organisation/Institution Name, Country' name='organization' required width=150px></td></tr>";
    frm+="</table>";
    frm+="<button class='btn btn-primary my-2' type='button' onClick=updateUser() >Submit</button>&nbsp";
    frm+="<div class='clickable' onClick=resetPasswordForm()> Reset password?</div> <br>";           
    frm+="<p class='text-muted'>You cannot change e-mail address. If you really want to do this - register with a different e-mail.</p>";
    frm+="</form></div>"
    textinModal(frm, "Update User Data");
    populateUserInfo();
}


function updatePasswordForm(passwordCode){
    frm="<div class='loginContainer animate'><form>";
    frm+="<div class=formLabel>Update password</div>";
    frm+="<table id=formTable>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>New password: </label><td><input class=form-control type='password' placeholder='New password' name='password' required></td></tr>";
    frm+="<tr><td><label>Confirm password: </label><td><input class=form-control type='password' placeholder='Confirm password' name='password2' required></td></tr>";
    frm+="</table>";
    frm+="<button class='form-control btn-primary' type='button' onClick=updatePassword('"+passwordCode+"')>Update</button>";
    frm+="</form></div>";   
    textinModal(frm, "Update Password");
}


function logoutForm(){
    frm="<div class='text-center'>";
    frm+="<button class='btn-primary btn' type='button' onClick=logout()>Logout</button>";
    frm+="</div>";   
    textinModal(frm, "Log out");
}



function responseForm(responsetext, toReload){
    frm="<div class=text-center>";
    if (toReload=="current"){
        frm+="<button class='btn btn-primary' type='button' onClick='closeModal();location.reload()'>OK</button>";
    }else if(toReload=="none"){
        frm+="<button class='btn btn-primary' type='button' onClick='closeModal()'>OK</button>";
    }else{
        frm+="<button class='btn btn-primary' type='button' onClick='closeModal(); window.open(\"/\",\"_self\");'>OK</button>";
    }
    frm+="</div>";
    textinModal(frm, responsetext);
}



function updatePassword(passwordCode){
    //updates password after receiving password code
    password = $('input[name=password]').val();
    password2 = $('input[name=password2]').val();
    //console.log(password);
    //console.log(passwordCode);
    if(password!="" && password2!="" && password==password2){ 
        var formData = {
	        'passwordCode': passwordCode,
	        'password': password
	    };
	    console.log(formData);
	    $.ajax({
	        type : 'POST',
            url  : 'login.php?action=updatePassword',
            data  : {"data":formData},
            dataType  : 'json',
            encode  : true
	    })
        .done(function(data) {
	        console.log(data);
            if(data[0]=='true'){
		responseForm("Password updated.", "main");
            }else{
                $('.warning').html(data[1]);      
            }
        });
    }else{
        $('.warning').html("Both fields need to be filled, and passwords need to be identical");
    }                                                                             
}



function login(){
	console.log("login");
    $('.warning').html("").hide();
    emailAddress = $('input[name=emailAddress]').val();
    password = $('input[name=password]').val();
    if(emailAddress!="" && password!=""){ 
        var formData = {
	        'emailAddress': emailAddress,
	        'password': password
	    };
	    
	    $.ajax({
	        type : 'POST',
            url  : 'login.php?action=login',
            data  : {"data":formData},
            dataType  : 'json',
            encode  : true
	    })
        .done(function(data) {
		console.log("login");
		console.log(data);
            if(data[0]=='true'){
		        responseForm("Logged in", "current");
            }else{
                $('.warning').html(data[1]).fadeIn("slow");      
            }
        });
    }else{// end of email and password check                                                                                        
        $('.warning').html("All fields need to be filled!").fadeIn("slow");
    }
}


function register(){
    email = $('input[name=emailAddress]').val();
    firstName=$('input[name=firstName]').val();
    lastName=$('input[name=lastName]').val();
    organization=$('input[name=organization]').val();
    if(email!="" && firstName!="" && lastName!="" && organization!=""){ 
        var formData = {
	        'firstName': $('input[name=firstName]').val(),
	        'lastName': $('input[name=lastName]').val(),
	        'emailAddress': $('input[name=emailAddress]').val(),
	        'organization': $('input[name=organization]').val()
	    };
	    $.ajax({
	        type : 'POST',
            url  : 'login.php?action=register',
            data  : {"data":formData},
            dataType  : 'json',
            encode  : true
	    })
        .done(function(data) {
	        console.log(data);
            if(data[0]=='true'){
		        //window.open("/biodiv/?pid="+data[2],"_self") //this is temporary for testing without emailing
		        responseForm("Thank you for registering. <br>You will receive e-mail with a password reset link.", "current");
            }else if(data[0]=='false'){
                $('.warning').html(data[1]);
            }else{
                $('.warning').html("Something went awry. Reload the page and try again.");
            }
        });
    }else{
        $('.warning').html("All fields need to be filled!");
    }
}



function logout(){
    call="./login.php?action=logout";
    $.get(call,
        function(data){
	        data=JSON.parse(data);
	        if (data[0]==null){
		        responseForm("Logged out", "current");
            }
        }
    );
}


function resetPassword(){
    email = $('input[name=emailAddress]').val();
    if(email!=""){ 
        var formData = {
            'emailAddress': $('input[name=emailAddress]').val()
        };
        console.log(formData);
        $.ajax({
	    type : 'POST',
        url  : 'login.php?action=resetPassword',
        data  : {"data":formData},
        dataType  : 'json',
        encode  : true
        })
        .done(function(data) {
            console.log(data);
            if(data[0]){
              //  window.open("/biodiv/?pid="+data[2],"_self") //this is temporary for testing without emailing
   	            responseForm("E-mail with reset link sent", "current");
            }else{
	            responseForm("Something went awry. Try again.", "current");
	        }
        });
    }else{
        $('.warning').html("E-mail field cannot be empty");
    };
}


function populateUserInfo(){
    call="./login.php?action=userInfo";
    $.get(call,
        function(data){
	    data=JSON.parse(data);
	    if (data[0]==null){ //when not registered;
        }else{
            console.log(data);
		    //ID,type,firstname,lastname,email,organization
            $('input[name=userID]').val(data[0]);
            $('input[name=firstName]').val(data[2]);
            $('input[name=lastName]').val(data[3]);
            $('input[name=emailAddress]').val(data[4]);
            $('input[name=organization]').val(data[5]);
	    }
	})
}


function updateUser(){
    email = $('input[name=emailAddress]').val();
    if(email!=""){ 
        var formData = {
	'userID': $('input[name=userID]').val(),
	'firstName': $('input[name=firstName]').val(),
	'lastName': $('input[name=lastName]').val(),
	'emailAddress': $('input[name=emailAddress]').val(),
	'organization': $('input[name=organization]').val()
	};
    };
	$.ajax({
	    type : 'POST',
            url  : 'login.php?action=updateUser',
            data  : {"data":formData},
            dataType  : 'json',
            encode  : true
	})
        .done(function(data) {
	    console.log(data);
            if(data[0]=='true'){
		responseForm("Updated records", "current");
            }else if(data[0]=='false'){
                $('.warning').html(data[1]);
            }else{
                $('.warning').html("Something went awry. Reload the page and try again.");
            }
        });
}



