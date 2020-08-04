function populateSources(){ 
    console.log("menu");
    //calls this, but that php should be merged with other api functions into a single function
    apicall="./api/api_menu.php";
//    console.log(apicall);
    $.get(apicall,
        function(data){
  	        menuArr0=JSON.parse(data);
            txt="";
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
                        dataBase=menuArr1[ii].dataBase;
                        txt+="<li>";
                        txt+="<div class=menuitem>";
                        txt+="<label class=checkboxLabel>";
                        if(datastreamID != '') {
                            //pointing to datastream
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('"+datastreamID+"','"+locationID+"','"+datasetID+"','','"+dataBase+"','')><span>"+variableName+" at "+locationName+"</span>";
                        }else if(locationID != '') {
                            //pointing to location
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','"+locationID+"','"+datasetID+"','','"+dataBase+"','')><span>"+locationName+" in "+datasetID+"</span>";
                        }else{
                            //pointing to dataset
                            txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','','"+datasetID+"','','"+dataBase+"','')><span>"+datasetName+"</span>";
                        }
                        txt+="</label>";
                        txt+="</div>";
                        txt+="</li>";
                    }else{
                        // first level - monitoring & once-off - in explore all datasets
                        // datasets & locations - in your datasets/locations
                        catID1=menuArr1[ii].categoryID; //this is monitoring or once-off
                        catName1=menuArr1[ii].categoryName;
                        menuArr2=menuArr1[ii].data;
                        txt+="<li>"
                        txt+="<div class=menulevel id="+catID1+">"+catName1+"</div>";
                        txt+="<ul>"; 
                        for (iii in menuArr2){
                            // second level - envdata & biodiv in all dataset, but list of locations in key dataset
                            // third level
                            catID2=menuArr2[iii].categoryID; //this is biodiv or envmon
                            catName2=menuArr2[iii].categoryName;
                            menuArr3=menuArr2[iii].data;
                            txt+="<li>";
                            txt+="<div class=menulevel id="+catID2+">"+catName2+"</div>";
                            txt+="<ul>"; 
                            for (iiii in menuArr3){
                                    // third and final level
                                    datasetName=menuArr3[iiii].datasetName;
                                    datasetID=menuArr3[iiii].datasetID;
                                    dataBase=menuArr3[iiii].dataBase;
                                    txt+="<li>";
                                    txt+="<div class=menuitem>";
                                    txt+="<label class=checkboxLabel>";
                                    txt+="<input type=radio class=radio-custom name=datasetselect onClick=showAll('','','"+datasetID+"','"+catID1+"','"+catID2+"','')><span>"+datasetName+"</span>";
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
                } 
                txt+="</ul>"; 
                txt+="</li>";
            }
        $('#sourcesContents').html(txt);
        $('#sourcesContents').accordion();
        }
    );
}

function populateDownload(){ 
    console.log("dataset list");
    //calls this, but that php should be merged with other api functions into a single function
    apicall="./api/api_menu.php";
//    console.log(apicall);
    $.get(apicall,
        function(data){
  	        menuArr0=JSON.parse(data);
            txt="";
            txt+="<div id='menu2'>";
            i=1;
            // zeroth level - explore all datasets/yourdatasets/keydatasets
            catID0=menuArr0[i].categoryID; 
            catName0=menuArr0[i].categoryName; 
            menuArr1=menuArr0[i].data;
            txt+="<h2>Select dataset to download</h2>";
            txt+="<ul class=topnav2>";
            for (ii in menuArr1){
                if (typeof menuArr1[ii].datasetID != "undefined"){
                }else{
                    // first level - monitoring & once-off - in explore all datasets
                    // datasets & locations - in your datasets/locations
                    catID1=menuArr1[ii].categoryID; //this is monitoring or once-off
                    catName1=menuArr1[ii].categoryName;
                    menuArr2=menuArr1[ii].data;
                    txt+="<li>"
                    txt+="<div class=menulevel1>"+catName1+"</div>";
                    txt+="<ul>"; 
                    for (iii in menuArr2){
                        // second level - envdata & biodiv in all dataset, but list of locations in key dataset
                        // third level
                        catID2=menuArr2[iii].categoryID; //this is biodiv or envmon
                        catName2=menuArr2[iii].categoryName;
                        menuArr3=menuArr2[iii].data;
                        txt+="<li>";
                        txt+="<div class=menulevel2 >"+catName2+"</div>";
                        txt+="<ul>"; 
                        for (iiii in menuArr3){
                                // third and final level
                                datasetName=menuArr3[iiii].datasetName;
                                datasetID=menuArr3[iiii].datasetID;
                                dataBase=menuArr3[iiii].dataBase;
                                datasetDescription=menuArr3[iiii].datasetDescription;
                                txt+="<li>";
                                txt+="<div class=menulevel3>";
                                txt+="<div>"+datasetName+" (<span class='clickable infoLink' onclick=showhidedloadInfo('"+datasetID+"')>info</span>) <span class=clickable onClick=directDownload('"+catID2+"','"+datasetID+"')>download</span> </div>";
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
        $('#downloadContents').html(txt);
        $(".info").hide()
        }
    );
}
