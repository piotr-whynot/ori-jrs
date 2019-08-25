function populateMenu(){ 
    console.log("menu");
    //calls this, but that php should be merged with other api functions into a single function
    apicall="./api/api_menu.php";
//    console.log(apicall);
    $.get(apicall,
        function(data){
  	        menuArr0=JSON.parse(data);
            txt+="<div id='menu'>";
            txt="<ul class='topnav'>";
            for (i in menuArr0){
                // zeroth level - explore all datasets/yourdatasets/keydatasets
                catID0=menuArr0[i].categoryID; 
                catName0=menuArr0[i].categoryName; 
                menuArr1=menuArr0[i].data;
                txt+="<li>";
                txt+="<span class=menulevel id="+catID0+"><span class=levLabel>"+catName0+"</span></span>";
                txt+="<ul>";
                for (ii in menuArr1){
                    if (typeof menuArr1[ii].datasetID != "undefined"){
                        datastreamID=menuArr1[ii].datastreamID;
                        variableName=menuArr1[ii].variableName;
                        datasetID=menuArr1[ii].datasetID;
                        datasetName=menuArr1[ii].datasetName;
                        locationID=menuArr1[ii].locationID;
                        locationName=menuArr1[ii].locationName;
                        txt+="<li>";
                        txt+="<div class=menuitem>";
                        txt+="<label class=checkboxLabel>";
                        if(datastreamID != '') {
                            //pointing to datastream
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('"+datastreamID+"','"+locationID+"','"+datasetID+"','','','')><span>"+variableName+" at "+locationName+"</span>";
                        }else if(locationID != '') {
                            //pointing to location
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','"+locationID+"','"+datasetID+"','','','')><span>"+locationName+" in "+datasetID+"</span>";
                        }else{
                            //pointing to dataset
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','','"+datasetID+"','','','')><span>"+datasetName+"</span>";
                        }
                        txt+="</label>";
                        txt+="</div>";
                        txt+="</li>";
                    }else{
                        // first level - monitoring & once-off - in explore all datasets
                        // datasets & locations - in your datasets/locations
                        catID1=menuArr1[ii].categoryID;
                        catName1=menuArr1[ii].categoryName;
                        menuArr2=menuArr1[ii].data;
                        txt+="<li>"
                        txt+="<div class=menulevel id="+catID1+">"+catName1+"</div>";
                        txt+="<ul>"; 
                        for (iii in menuArr2){
                            // second level - envdata & biodiv in all dataset, but list of locations in key dataset
                            // third level
                            catID2=menuArr2[iii].categoryID;
                            catName2=menuArr2[iii].categoryName;
                            menuArr3=menuArr2[iii].data;
                            txt+="<li>";
                            txt+="<div class=menulevel id="+catID2+">"+catName2+"</div>";
                            txt+="<ul>"; 
                            for (iiii in menuArr3){
                                // fourth level
                                catID3=menuArr3[iiii].categoryID.replace(/ /g,"_");
                                catName3=menuArr3[iiii].categoryName;
                                menuArr4=menuArr3[iiii].data;
                                txt+="<li>";
                                txt+="<div class=menulevel id="+catID3+">"+catName3+"</div>";
                                txt+="<ul>"; 
                                for (iiiii in menuArr4){
                                    // second level
                                    datasetName=menuArr4[iiiii].datasetName;
                                    datasetID=menuArr4[iiiii].datasetID;
                                    txt+="<li>";
                                    txt+="<div class=menuitem>";
                                    txt+="<label class=checkboxLabel>";
                                    txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','','"+datasetID+"','"+catID1+"','"+catID2+"','"+catID3+"')><span>"+datasetName+"</span>";
                                    txt+="</label>";
                                    txt+="</div>";
                                    txt+="</li>";
                                }
                                txt+="</ul>"; 
                                txt+="</li>";
                            } 
                            txt+="</ul>"; 
                            txt+="</li>";
                        } 
                        txt+="</ul>"; 
                        txt+="</li>";
                    } 
                } 
                txt+="</ul>"; 
                txt+="</li>";
            }
        $('#menuContents').html(txt);
        $('#menuContents').accordion();
        }
    );
}
