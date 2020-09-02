function populateSources(){ 
    console.log("menu");
    //calls this, but that php should be merged with other api functions into a single function
    var apicall="./api/api_menu.php";
//    console.log(apicall);
    $.get(apicall,
        function(data){
  	        var menuArr0=JSON.parse(data);
            txt="<div class=row>";
            txt+="<div class=col-md-2></div>";
            txt+="<div id='accordion-menu' class=col-md-8>";
            txt+="<ul class='topnav'>";
            for (i in menuArr0){
                // zeroth level - explore all datasets/yourdatasets/keydatasets
                var catID0=menuArr0[i].categoryID; 
                var catName0=menuArr0[i].categoryName; 
                var menuArr1=menuArr0[i].data;
                txt+="<li>";
                txt+="<div class=menulevel id="+catID0+"><div class=levLabel>"+catName0+"</div></div>";
                txt+="<ul>";
                for (ii in menuArr1){
                    if (typeof menuArr1[ii].datasetID != "undefined"){
                        var datastreamID=menuArr1[ii].datastreamID;
                        var variableName=menuArr1[ii].variableName;
                        var datasetID=menuArr1[ii].datasetID;
                        var datasetName=menuArr1[ii].datasetName;
                        var locationID=menuArr1[ii].locationID;
                        var locationName=menuArr1[ii].locationName;
                        var dataBase=menuArr1[ii].dataBase;
                        txt+="<li>";
                        txt+="<div class='menuitem checkbox'>";
                        txt+="<label class=checkboxLabel>";
                        if(datastreamID != '') {
                            //pointing to datastream
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('"+datastreamID+"','"+locationID+"','"+datasetID+"','','"+dataBase+"')><span>"+variableName+" at "+locationName+"</span>";
                        }else if(locationID != '') {
                            //pointing to location
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','"+locationID+"','"+datasetID+"','','"+dataBase+"')><span>"+locationName+" in "+datasetID+"</span>";
                        }else{
                            //pointing to dataset
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','','"+datasetID+"','','"+dataBase+"')><span>"+datasetName+"</span>";
                        }
                        txt+="</label>";
                        txt+="</div>";
                        txt+="</li>";
                    }else{
                        // first level - monitoring & once-off - in explore all datasets
                        // datasets & locations - in your datasets/locations
                        var catID1=menuArr1[ii].categoryID; //this is monitoring or once-off
                        var catName1=menuArr1[ii].categoryName;
                        var menuArr2=menuArr1[ii].data;
                        txt+="<li>"
                        txt+="<div class=menulevel id="+catID1+"><div class=levLabel>"+catName1+"</div></div>";
                        txt+="<ul>"; 
                        for (iii in menuArr2){
                            // second level - envdata & biodiv in all dataset, but list of locations in key dataset
                            // third level
                            var catID2=menuArr2[iii].categoryID; //this is biodiv or envmon
                            var catName2=menuArr2[iii].categoryName;
                            var menuArr3=menuArr2[iii].data;
                            txt+="<li>";
                            txt+="<div class=menulevel id="+catID2+"><div class=levLabel>"+catName2+"</div></div>";
                            txt+="<ul>"; 
                            for (iiii in menuArr3){
                                    // third and final level
                                    var datasetName=menuArr3[iiii].datasetName;
                                    var datasetID=menuArr3[iiii].datasetID;
                                    var dataBase=menuArr3[iiii].dataBase;
                                    var datasetDescription=menuArr3[iiii].datasetDescription;
                                    txt+="<li>";
                                    txt+="<div class='menuitem checkbox'>";
                                    txt+="<div>";
                                    txt+="<label class=checkboxLabel>";
                                    txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','','"+datasetID+"','"+catID1+"','"+catID2+"')><span>"+datasetName+"</span>";
                                    txt+="</label>";
                                    txt+="</div>";
                                    txt+="<div class='menuitemLinks container-fluid text-right'><a onclick=showhideInfo('"+datasetID+"')><span class='glyphicon glyphicon-info-sign'></span>&nbsp info</a> | <a onClick=directDownload('"+catID2+"','"+datasetID+"')><span class='glyphicon glyphicon-download-alt'></span>&nbsp download</a> </div>";
                                    txt+="<div class=info id=info-"+datasetID+">"+datasetDescription+"</div>";

                                    txt+="</div>";
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
            txt+="</ul>"; 
            txt+="</div>"; 
            txt+="</div>"; 
        $('#sourcesContents').html(txt);
        $('.info').hide();
        $('#sourcesContents').accordion();
        }
    );
}

