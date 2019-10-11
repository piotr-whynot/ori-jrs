function loginForm(){
    frm="<div class='loginContainer animate'><form>"; 
    frm+="<div class=formLabel>Login</div>";
    frm+="<table id=formTable>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>E-mail:  </label></td><td><input type='text' placeholder='Enter e-mail' name='emailAddress' required ><br/></td></tr>";
    frm+="<tr><td><label>Password:  </label></td><td><input type='password' placeholder='Enter Password'  name='password' required><br/></td></tr>";
    frm+="</table>";
    frm+="<button type='button' onClick=login() >Login</button> <!--<input type='checkbox' checked='checked'> Remember me-->";
    frm+="<button type='button' onClick=closePopup()>Cancel</button>";
    frm+="<div class='clickable' onClick=resetPasswordForm()> Forgot password?</div>";           
    frm+="</form></div>";
    popup(500,500, frm);
}

function updateUserForm(){
    frm="<div class='loginContainer animate'><form>";
    frm+="<div class=formLabel>Edit/change your details</div>";
    frm+="<input type='text' name='userID' hidden>";
    frm+="<table id=formTable>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>Firstname:  </label></td><td><input type='text' placeholder='Enter Firstname' name='firstName' required></td></tr>";
    frm+="<tr><td><label>Lastname:  </label></td><td><input type='text' placeholder='Enter Lastname' name='lastName' required></td></tr>";
    frm+="<tr><td><label>Email Address:  </label></td><td><input type='email' placeholder='Enter Email Adress' name='emailAddress' disabled></td></tr>";
    frm+="<tr><td><label>Organisation/Institution:  </label></td><td><input type='text' placeholder='Organisation/Institution Name, Country' name='organization' required width=150px></td></tr>";
    frm+="</table>";
    frm+="<button type='button' onClick=updateUser() >Submit</button>";
    frm+="<button type='button' onClick=closePopup()>Cancel</button>";
    frm+="<div class='clickable' onClick=resetPasswordForm()> Reset password?</div> <br>";           
    frm+="<p class='formNotification'>You cannot change e-mail address. If you really want to do this - register with a different e-mail.</p>";
    frm+="</form></div>"
    popup(500,500, frm);
    populateUserInfo();
}


function registerForm(){
    frm="<div class='loginContainer animate'><form>";
    frm+="<div class=formLabel>Register</div>";
    frm+="<table id=formTable>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>Firstname:  </label></td><td><input type='text' placeholder='Enter Firstname' name='firstName' required></td></tr>";
    frm+="<tr><td><label>Lastname:  </label></td><td><input type='text' placeholder='Enter Lastname' name='lastName'  required></td></tr>";
    frm+="<tr><td><label>Email Address:  </label></td><td><input type='email' placeholder='Enter Email Adress' name='emailAddress' required></td></tr>";
    frm+="<tr><td><label>Organisation/Institution:  </label></td><td><input type='text' placeholder='Organisation/Institution Name, Country' name='organization' required width=150px></td></tr>";
    frm+="</table>";
    frm+="<div class=centered><button type='button' onClick=register() >Submit</button>";
    frm+="&nbsp&nbsp&nbsp&nbsp<button type='button' onClick=closePopup()>Cancel</button>";
    frm+="<p class='formNotification'>On submitting you will be e-mailed a link to set your password. Use that link to change password to one of your choice.</p>";
    frm+="</form></div>"
    popup(500,500, frm);
}

function resetPasswordForm(){
    frm="<div class='loginContainer animate'><form>";
    frm+="<div class=formLabel>Reset password</div>";
    frm+="<table id=formTable>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>Email address:  </label><td><input type='email' placeholder='Enter Email Adress' name='emailAddress' required></td></tr>";
    frm+="</table>";
    frm+="<button type='button' onClick=resetPassword()>Reset</button>";
    frm+="<button type='button' onClick=closePopup()>Cancel</button>";
    frm+="<p class='formNotification'>Reset password link will be sent to your email</p>";
    frm+="</form></div>";
    popup(500,500, frm);
}

function updatePasswordForm(passwordCode){
    frm="<div class='loginContainer animate'><form>";
    frm+="<div class=formLabel>Update password</div>";
    frm+="<table id=formTable>";
    frm+="<tr><td></td><td><span class='warning'></span></td></tr>";
    frm+="<tr><td><label>New password: </label><td><input type='password' placeholder='New password' name='password' required></td></tr>";
    frm+="<tr><td><label>Confirm password: </label><td><input type='password' placeholder='Confirm password' name='password2' required></td></tr>";
    frm+="</table>";
    frm+="<button type='button' onClick=updatePassword('"+passwordCode+"')>Update</button>";
    frm+="<button type='button' onClick=closePopup()>Cancel</button>";
    frm+="</form></div>";   
    popup(500,500, frm);
}


function logoutForm(){
    frm="<div class='loginContainer animate'><form>";
    frm+="<div class=formLabel>Log out</div>";
    frm+="<button type='button' onClick=logout()>Logout</button>";
    frm+="<button type='button' onClick=closePopup()>Cancel</button>";
    frm+="</form>"
    frm+="</div>";   
    popup(500,500, frm);
}



function responseForm(responsetext, toReload){
    frm="<div class='loginContainer animate'><form>";
    frm+="<div class=formLabel>"+responsetext+"</div>";
    if (toReload=="current"){
        frm+="<button type='button' onClick='closePopup();location.reload()'>OK</button>";
    }else if(toReload=="none"){
        frm+="<button type='button' onClick='closePopup()'>OK</button>";
    }else{
        frm+="<button type='button' onClick='closePopup(); window.open(\"/\",\"_self\");'>OK</button>";
    }
    frm+="</form>"
    frm+="</div>";
    popup(500,500, frm);
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
	    //console.log(formData);
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
    emailAddress = $('input[name=emailAddress]').val();
    password = $('input[name=password]').val();
    if(emailAddress!="" && password!=""){ 
        var formData = {
	        'emailAddress': emailAddress,
	        'password': password
	    };
	    console.log(formData);
	    $.ajax({
	        type : 'POST',
            url  : 'login.php?action=login',
            data  : {"data":formData},
            dataType  : 'json',
            encode  : true
	    })
        .done(function(data) {
            if(data[0]=='true'){
		        responseForm("Logged in", "current");
            }else{
                $('.warning').html(data[1]);      
	        console.log(data[2]);
            }
        });
    }else{// end of email and password check                                                                                        
        $('.warning').html("All fields need to be filled!");
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



