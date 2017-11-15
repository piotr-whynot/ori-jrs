function chkDigits(obj)
{
  variables = variable.split("_");
  last = variables[variables.length -1];
 
 if(!(last == 'metadata')){ 
   if (isNaN(document.getElementById('current_edit').value)==true)
   {
    alert("Please enter numbers only");
    document.getElementById(obj).focus();
    //document.getElementById(obj).select();
    return false;
  }
   return true;
 }
 
}

