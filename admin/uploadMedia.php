<?php
$target_dir = "../temp/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
$ext=pathinfo($target_file)['extension'];
$fname=pathinfo($target_file)['filename'];
$responseArray=array();

// there is no file size check... it should have been checked on the client side.

// Check if image file is a actual image or fake image
$check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
if($check !== false) {
//    echo "File is an image - " . $check["mime"] . ".";
    $uploadOk = 1;
} else {
    $response="File is not an image.";
    $uploadOk = 0;
}


// Check if file already exists
if (file_exists($target_file)) {
$do=True;
$num=1;
    while ($do){
        $target_file=$target_dir.$fname."_".$num.".".$ext;
        if (file_exists($target_file)){
            $num=$num+1;
        }else{
            $do=False;
        }
        if($num>100){
            $response="Sorry, file of this name already exists on the server. Change the name and try to upload again.";
            $uploadOk = 0;
        }
    }
}

// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
&& $imageFileType != "gif" ) {
  $response="Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
  $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 1) {
// if everything is ok, try to upload file
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    //echo "The file ". basename( $_FILES["fileToUpload"]["name"]). " has been uploaded.";
      $response=$target_file;
  } else {
      $uploadOk = 0;
      $response="Sorry, there was an error uploading your file. Try again.";
  }
}
$responseArray[]=$uploadOk;
$responseArray[]=$response;

echo json_encode($responseArray);

?>

