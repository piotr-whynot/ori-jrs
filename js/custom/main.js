ownedItems=new Array();

function initialize(){
    initializeMap();
    //check if flat call
    init="normal";
    var urlString = window.location.search.substring(1);
    if (urlString!=""){
        var urlArgs = urlString.split('&');
        var argName = urlArgs[0].split('=')[0];
        var argValue = urlArgs[0].split('=')[1];
	if (argName=="pid"){
	    init="updatePassword";
	    var tempPassword=argValue;
	}

    }else{
	// normal init
        txt="<span id=logo></span><div class=header>Welcome to Okavango Delta Monitoring and Data Sharing place</div>";
//      popup(0.4,0.9, txt);
    }
    call="./login.php?action=userInfo";
    $.get(call,
        function(data){
	    console.log(data)
	    data=JSON.parse(data);
        ownedItems= new Array();
	    if (data[0]==null){ //when not registered;
            $('#loginContainerFooter').html("<span class=clickable onClick=loginForm()>login</span>&nbsp|&nbsp<span class=clickable onClick=registerForm()>register</span>");
            ownedItems.push([]);
            ownedItems.push([]);
        }else{ //when registered
            if(data[1]=="admin"){
                $('#loginContainerFooter').html("<span class=clickable onClick=window.location.href='./admin/';>admin pages</span>&nbsp|&nbsp<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your account</span>");
                ownedItems.push(data[6]);
                ownedItems.push(data[7]);
            }else{
                $('#loginContainerFooter').html("<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your account</span>");
            ownedItems.push(data[6]);
            ownedItems.push(data[7]);
            }
	    }
	    if (init=="updatePassword"){
                updatePasswordForm(tempPassword);
            }
        populateSideMenu();
        console.log(ownedItems);
    });
}


function populateSideMenu(){ 
    //calls this, but that php should be merged with other api functions into a single function
    apicall="./api/api_menu.php";
    console.log(apicall);
    $.get(apicall,
        function(data){
	    menuarr0=JSON.parse(data);
            txt="<ul class='topnav'>";
            for (g0 in menuarr0){
                // zeroth level - explore all datasets/yourdatasets/keydatasets
                console.log(g0);
                groupName0=menuarr0[g0].groupName; 
                txt+="<li><div class=menuitem id=topgroup"+g0+">"+groupName0+"</div>";
                txt+="<ul>";
                menuarr1=menuarr0[g0].data;
                for (g1 in menuarr1){
                    if (g0=="keydatastreams"){
                        datastreamID=g1;
                        variableName=menuarr1[g1].variableName;
                        locationName=menuarr1[g1].locationName;
                        txt+="<li><span class=clickable onClick=showMonitoringDatastreamInPopup('"+datastreamID+"','1970-01-01','2019-01-01')>"+variableName+" at "+locationName+" </span></li>";
                    }else{
                        // first level - monitoring & once-off - in explore all datasets
                        // datasets & locations - in your datasets/locations
                        groupName1=menuarr1[g1].groupName;
                        txt+="<li><div class=menuitem id=group"+g1+">"+groupName1+"</div>";
                        txt+="<ul>"; 
                        menuarr2=menuarr1[g1].data;
                        for (g2 in menuarr2){
                            // second level - envdata & biodiv in all dataset, but list of locations in key dataset
                            if (g0=="owned"){
                                // fourth level - datasets
                                groupName=menuarr2[g2].groupName;
                                gC=menuarr2[g2].groupCategory;
                                txt+="<li>";
                                if (g1=='datasets'){
                                    txt+="<div class=markerHolder id=marker-"+gC+"-"+g2+"-owned"+">&nbsp</div>"
                                    txt+="<label class=checkboxLabel>";
                                    txt+="<input type=checkbox id="+gC+"-"+g2+"-owned"+" onClick=showhideDataset(\""+gC+"\",'"+g2+"','owned')>"+groupName;
                                    txt+="</label>";
                                    txt+="<div class=extrasHolder id=extras-"+gC+"-"+g2+"-owned"+">";
                                    txt+="<span class=clickable onClick=describeDataset(\""+gC+"\",'"+g2+"','popup') id=list-"+gC+"-"+g2+"-owned"+">dataset info</span><br>";
                                    txt+="<span class=clickable onClick=listLocationsInDataset(\""+gC+"\",'"+g2+"','owned') id=list-"+gC+"-"+g2+"-owned"+">list all locations</span>";
                                    txt+="</div>";
                                }else{
                                    txt+="<li><span class=clickable onClick=showLocationInPopup('"+gC+"','"+g2+"')>"+groupName+"</span></li>";

                                }
                                txt+="</li>";
                            }else{
                                groupName2=menuarr2[g2].groupName;
                                txt+="<li><div class=menuitem id=type"+g2+">"+groupName2+"</div>";
                                txt+="<ul>";
                                menuarr3=menuarr2[g2].data;
                                for (g3 in menuarr3){
                                    // third level - classes of observations
                                    groupName3=menuarr3[g3].groupName;
                                    groupCode=g3.replace(/ /g, "_");
                                    txt+="<li><div class=menuitem id=type"+g3+">"+groupName3+"</div>";
                                    txt+="<ul>";
                                    menuarr4=menuarr3[g3].data;
                                    for (g4 in menuarr4){
                                        // fourth level - datasets
                                        groupName4=menuarr4[g4].groupName;
                                        txt+="<li>";
                                        txt+="<div class=markerHolder id=marker-"+g2+"-"+g4+"-"+groupCode+">&nbsp</div>"
                                        txt+="<label class=checkboxLabel>";
                                        txt+="<input type=checkbox id="+g2+"-"+g4+"-"+groupCode+" onClick=showhideDataset(\""+g2+"\",'"+g4+"','"+groupCode+"')>"+groupName4;
                                        txt+="</label>";
                                        txt+="<div class=extrasHolder id=extras-"+g2+"-"+g4+"-"+groupCode+">";
                                        txt+="<span class=clickable onClick=describeDataset(\""+g2+"\",'"+g4+"','popup') id=list-"+g2+"-"+g4+"-"+groupCode+">dataset info</span><br>";
                                        txt+="<span class=clickable onClick=listLocationsInDataset(\""+g2+"\",'"+g4+"','"+groupCode+"') id=list-"+g2+"-"+g4+"-"+groupCode+">list all locations</span>";
                                        txt+="</div>";
                                        txt+="</li>";
                                    }
                                    txt+="</ul>";
                                    txt+="</li>";
                                }
                                txt+="</ul>";
                                txt+="</li>";
                            }// end of else
                        }
                        txt+="</ul>";
                        txt+="</li>";

                    }// end of else 
                }    
                txt+="</ul>";
                txt+="</li>";
            }
            txt+="</ul>";
            $("#sideMenuWindow").html(txt) //.hide();
            $(".extrasHolder").hide();
            $(".topnav").accordion();
	        wh=$(window).height()*0.9;
            $("#sideMenuWindow").css("max-height", wh+"px");
            $("#sideMenuSymbol").click(function(){
//                $("#sideMenuWindow").slideToggle("slow");
                $("#sideMenuWindow").toggle('slide',{direction: "right" });
            });
        }
    );
}


function listLocationsInDataset(group, datasetID, typeCode){
    dataGroup=group;
    typeName=typeCode.replace(/_/g," ");
    if (typeCode=="owned"){
        if (dataGroup=="biodiv"){
            apicall='./api/api_biodiv.php?datasetID='+datasetID+"";
        }else{
            apicall='./api/api_envdata.php?datasetID='+datasetID+"";
        }
    }else{
        if (dataGroup=="biodiv"){
            apicall='./api/api_biodiv.php?datasetID='+datasetID+"&popularGroup="+typeName+"";
        }else{
            apicall='./api/api_envdata.php?datasetID='+datasetID+"&variableType="+typeName+"";
        } 
    }
    $("#shade").show();
    console.log(apicall);
    $.get(apicall, 
        function(data){
            alldata=JSON.parse(data);
		    features=alldata['features'];
		    txt="<table width=1000>";
            txt+="<tr><th>Location ID<th>Location name<th>Locality<th>Geomorphological Position<th></tr>";
		    for (i in features){
		        props=features[i]['properties'];
                txt+="<tr><td>"+props['locationID']+"<td>"+props['locationName']+"<td>"+props['locality']+"<td>"+props['geomorphologicalPosition']+"<td><span class=clickable onClick=clickOnMapItem('"+props['locationID']+"','"+dataGroup+"','"+datasetID+"','"+typeCode+"')>view data</span>";
                txt+="<td><span class=clickable onClick=downloadAPI('"+dataGroup+"','','"+props['locationID']+"','','','csv')>download csv</span></td></tr>";
		    }
		    txt+="</table>";
		    popup(0.1,0.6,txt);
            $("#shade").hide();
        }
    );
}


function clickOnMapItem(itemId, dataGroup, datasetID, typeCode) {
    closePopup();
    //get target layer by it's id
    alayer=pointOverlays[dataGroup+"-"+datasetID+"-"+typeCode]
    var layer = alayer.getLayer(itemId);
    //fire event 'click' on target layer 
    layer.fireEvent('click');  
}



function describeDataset(group, datasetID, target){
    $("#shade").show();
    dataGroup=group;
    if (dataGroup=="biodiv"){
        apicall="./api/api_biodiv.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }else{
        apicall="./api/api_envdata.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }
    console.log(apicall);
    $.get(apicall, 
        function(data){
            alldata=JSON.parse(data);
		    txt="<h1>Dataset info:</h1>";
		    txt="<table width=100%>";
            txt+="<tr><td>dataset ID:<td>"+alldata['datasetID']+"</tr>";
            txt+="<tr><td>dataset name:<td>"+alldata['datasetName']+"</tr>";
            txt+="<tr><td>description:<td>"+alldata['datasetDescription']+"</tr>";
            txt+="<tr><td>institution holding data:<td>"+alldata['institutionCode']+"</tr>";
            txt+="<tr><td>institution owning data:<td>"+alldata['ownerInstitutionCode']+"</tr>";
		    if (alldata['publications']){
                txt+="<tr><td>relevant publications:<td>"+alldata['publications']+"</tr>";
		    }
		    if (alldata['datasetRemarks']){
                txt+="<tr><td>remarks:<td>"+alldata['datasetRemarks']+"</tr>";
		    }
            txt+="<tr><td><td><span class=clickable onClick=downloadAPI('"+dataGroup+"','"+alldata['datasetID']+"','','','','csv')>download entire dataset in csv format</span></tr>";
		    txt+="</table>";
            if (target=="popup"){
		        popup(0.2,0.5,txt);
            }else if (target=="return"){
                $("#shade").hide();
                console.log(txt);
                return txt;
            }else{
                $("#"+target).html(txt);
            }
            $("#shade").hide();
        }
    );
}



function showhideDataset(group, datasetID, typeCode){
// shows and hide datasets from the main menu
// needs to be richer. For example, should allow displaying all datasets for a given data type with one click
//
    dataGroup=group;
//    alert($('#'+group+"-"+datasetID+"-"+typeCode).prop('checked'));
    if( $('#'+dataGroup+"-"+datasetID+"-"+typeCode).prop('checked')){
        typeName=typeCode.replace(/_/g," ");
        if (typeCode=="owned"){
            if (dataGroup=="biodiv"){
                apicall='./api/api_biodiv.php?datasetID='+datasetID+"";
            }else{
                apicall='./api/api_envdata.php?datasetID='+datasetID+"";
            }
        }else{
            if (dataGroup=="biodiv"){
                apicall='./api/api_biodiv.php?datasetID='+datasetID+"&popularGroup="+typeName+"";
            }else{
                apicall='./api/api_envdata.php?datasetID='+datasetID+"&variableType="+typeName+"";
            }
        }
        console.log(apicall);
        $("#shade").show();
        $.get(apicall, 
            function(data){
//              this randomizes colours of markers
                n=Math.round(((Math.random()*19)),0);
                var smallIcon = new L.Icon({
//                   iconSize: [27, 27],
//                   iconAnchor: [13, 27],
//                   popupAnchor:  [1, -24],
                     iconUrl:"img/marker"+n+".svg" 
                });
                $('#marker-'+dataGroup+"-"+datasetID+"-"+typeCode).html("<img src=img/marker"+n+".svg width=16>");
                alldata=JSON.parse(data);
                geoJSONLayer = L.geoJSON(alldata, {
                    pointToLayer: function(feature, latlng) {
                        return L.marker(latlng, {icon: smallIcon});
                    },
                    onEachFeature: onEachFeature
                });
		        geoJSONLayer.addTo(map)
                //pointOverlays is a global array that stores currently displayed layers
                pointOverlays[dataGroup+"-"+datasetID+"-"+typeCode]=geoJSONLayer;
                $('#extras-'+dataGroup+"-"+datasetID+"-"+typeCode).show();
                $("#shade").hide();
            }
        );
    }else{

        // not sure if it wouldnt be better to hide the overlay... but let's remove it for the time being
        $('#marker-'+dataGroup+"-"+datasetID+"-"+typeCode).html("&nbsp");
        $('#extras-'+dataGroup+"-"+datasetID+"-"+typeCode).hide();
        map.removeLayer(pointOverlays[dataGroup+"-"+datasetID+"-"+typeCode]);
        delete pointOverlays[dataGroup+"-"+datasetID+"-"+typeCode];
    }
}



function initializeMap(){
//main function for initializing map interface
    showMap();
//    loadBaseMap(); // this is switched off for debugging
}



function loadBaseMap(){
// loads openstreetmap. For the time being the only option for background. Perhaps one day will implement google satellite overlay... 
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    osm=new L.TileLayer(osmUrl, {minZoom: 7, maxZoom: 15, attribution: osmAttrib});    
    osm.addTo(map);
}



function showMap(){
// shows empty map canvas
// map is a global variable here
    if($(window).height()*0.9<400){
        mapheight=400;
    }else{
        mapheight=$(window).height()-20;
    }
    $('#map').height(mapheight);
        map = L.map('map', {center: new L.LatLng(-19.3, 23), zoom: 10, zindex: 30});
}



function onEachFeature(feature,layer){
// what happens when one hovers over marker in map, or clicks on it
    // this function needs to be here to enable closing or not closing popup dependent on context
    // this is leaflet popup
    function closePopup(){
        layer.closePopup();
    }

    layer.bindPopup("<img src=img/ajax-loader.gif>");
    // this attaches apicall and dataGroup to properties of the feature for later use in populating popup
    // apicall and dataGroup are not passsed directly, they are defined here using js variable scope,
    // they need to be embedded in layer properties because they will disappear if another layer is opened
    layer.feature.properties.apicall = apicall;
    layer.feature.properties.dataGroup = dataGroup;
    layer.on('click', function (e) {
	    console.log(feature);
	    console.log(layer);
      populateFirstPopup(feature,layer); 
      layer.removeEventListener('mouseout', closePopup);
    });
    layer.on('mouseover', function (e) {
      txt=feature.properties.locationName;
      layer.bindPopup(txt, {maxWidth: "auto"}).openPopup();
      layer.addEventListener('mouseout', closePopup);
    });
    layer._leaflet_id = feature.properties['locationID'];
}


function showLocationInPopup(dataGroup, locationID){
//responds to owned items in menu, similar to populateSecondPopup
    if (dataGroup=="biodiv") {
        //  biodiv - this is still verbatim from populateSecondPopup, needs to be adapated
        featureapicall=apicall0+"&calltype=event&locationID="+feature.properties.locationID;
//        console.log("apicall:");
//        console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            txt="<div class=popupLocInfo>"
            txt+="<h1>Location:</h1>";
            txt+="<table width=400px>";
	    // this displays all properties coming from api
            for (key in selfeature){
                if ( key != "events"){
                    txt+="<tr><td>"+key+":<td>"+selfeature[key]+"</tr>";
                }
            }
            txt+="</table>";
            txt+="<h1>Sampling events:</h1>";
            txt+="<table width=400px>";
            for (ev in selfeature['events']){
                ev=selfeature['events'][ev];
                txt+="<tr><td>date: <td>"+ev.eventDate+"<td><span onClick=showEventInPopup('"+ev.eventID+"') class='clickable rf'>view</span></tr>";  
                txt+="<tr><td>protocol:<td>"+ev.samplingProtocol+"</tr>";
                txt+="<tr><td>recorded by:<td>"+ev.recordedBy+"</tr>";
            }
            txt+="</table>";
            txt+="</div>";
            layer.bindPopup(txt, {maxWidth: "auto"}).openPopup();
        });
    }else{
        // this is when dataGroup=='envdata';
        featureapicall="./api/api_envdata.php?calltype=data&locationID="+locationID;
        //console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            console.log(selfeature);
            txt="<div class=popupDataStreamInfo>"
            // Location info
            txt+="<h1>Location info:</h1>";
            txt+="<table width=300px>";
            for (key in selfeature){
                if ( key != "datastreams"){
                    txt+="<tr><td>"+key+"<td>"+selfeature[key]+"</tr>";
                }
            }
            txt+="</table><br>";
            // base times or events
            if (selfeature.locationType=="monitoring"){
                //monitoring
                txt+="<h1>Measurement frequencies:</h1>";
                baseTimes=new Array();
                for (dstrm in selfeature['datastreams']){
                    dstrm=selfeature['datastreams'][dstrm];
                    if ($.inArray(dstrm.baseTime, baseTimes)==-1){
                        baseTimes.push(dstrm.baseTime);
                    }
                }
                txt+="<table width=580px>";  
                for (i in baseTimes){
                    txt+="<tr><td>"+baseTimes[i];
                    // this will need to be dependent on access rights
                    if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID)){
                        txt+="<td><span class=clickable onClick=editMonitoringRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+dstrm.baseTime+"')>edit/add data</span>";
                        txt+="</td>";
                    }
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','"+selfeature.locationID+"','"+baseTimes[i]+"','','csv')>download csv</span></td></tr>"; //downloadAPI(dataGroup, datasetID, locationID, baseTime, datastreamID, format)
                }
                txt+="</table>";
            }else{
                //onceoff
                txt+="<h1>Measurement events:</h1>";
                // this will need to be dependent on access rights
                eventDates=new Array();
                for (dstrm in selfeature['datastreams']){
                    data=selfeature['datastreams'][dstrm].data;
                    for (rec in data){
                        if ($.inArray(data[rec][0], eventDates)==-1){
                            eventDates.push(data[rec][0]);
                        }
                    }
                }
                txt+="<table width=580px>";  
                for (i in eventDates){
                    txt+="<tr><td>"+eventDates[i];
                    // this will need to be dependent on access rights
                    if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID)){
                        txt+="<td><span class=clickable onClick=editOnceoffRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+encodeURIComponent(eventDates[i])+"')>edit/add data</span>";
                        txt+="</td>";
                    }
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','"+selfeature.locationID+"','','','csv')>download csv</span></td></tr>";
                    console.log("editOnceoffRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+eventDates[i]+"')");
                }
                txt+="</table>";
            }

            //variables
            txt+="<h1>Available variables:</h1>";
            
            txt+="<div style='height:200px; overflow-y:auto; width:600px;'>";  
            txt+="<table width=580px>";  
            txt+="<tr><th>Name</th><th>Unit</th><th>Type</th><th>Time period</th><th></th><th></th></tr>"; 
            for (dstrm in selfeature['datastreams']){
                dstrm=selfeature['datastreams'][dstrm];
console.log(selfeature.locationType);
                if (selfeature.locationType=="monitoring"){
                    firstDate=dstrm.firstMeasurementDate;
                    lastDate=dstrm.lastMeasurementDate;
                    var fD = new Date(firstDate);
                    var lD = new Date(lastDate);
                    firstDatestr=fD.getFullYear()+"/"+fD.getMonth()+"/"+fD.getDate()
                    lastDatestr=lD.getFullYear()+"/"+lD.getMonth()+"/"+lD.getDate()
                    //console.log(firstDatestr);
                    firstDate=firstDate.replace(/ /g,"_");
                    lastDate=lastDate.replace(/ /g,"_");
                    txt+="<tr><td>"+dstrm.variableName+"</td><td>["+dstrm.variableUnit+"]</td><td>"+dstrm.baseTime+"</td><td>"+firstDatestr+"-"+lastDatestr+"<td><span onClick=showMonitoringDatastreamInPopup('"+dstrm.datastreamID+"','"+firstDate+"','"+lastDate+"') class='clickable rf'>view</span>&nbsp&nbsp"; 
                    txt+="</td>";
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','','','"+dstrm.datastreamID+"','csv')>download csv</span></td></tr>"; //downloadAPI(dataGroup, datasetID, locationID, baseTime, datastreamID, format)
                }else{
                    txt+="<tr><td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]<td>"+dstrm.baseTime+"<td><span onClick=showOnceoffDatastreamInPopup('"+dstrm.datastreamID+"') class='clickable rf'>view</span>&nbsp&nbsp"; 
                    txt+="</td>";
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','','','"+dstrm.datastreamID+"','csv')>download csv</span></td></tr>";
                } 
            }
            txt+="</table>";
            txt+="</div>";  
            txt+="</div>";
            popup(0.9,0.9,txt);
        });
   }

}


function populateFirstPopup(feature,layer){
//makes leaflet popup that appears when one clicks on a marker
    apicall0=feature.properties.apicall;
    dataGroup=feature.properties.dataGroup;
    if (dataGroup=="biodiv") {
        //  biodiv
        featureapicall=apicall0+"&calltype=event&locationID="+feature.properties.locationID;
//        console.log("apicall:");
//        console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            txt="<div class=popupLocInfo>"
            txt+="<h1>Location:</h1>";
            txt+="<table width=400px>";
	    // this displays all properties coming from api
            for (key in selfeature){
                if ( key != "events"){
                    txt+="<tr><td>"+key+":<td>"+selfeature[key]+"</tr>";
                }
            }
            txt+="</table>";
            txt+="<h1>Sampling events:</h1>";
            txt+="<table width=400px>";
            for (ev in selfeature['events']){
                ev=selfeature['events'][ev];
                txt+="<tr><td>date: <td>"+ev.eventDate+"<td><span onClick=showEventInPopup('"+ev.eventID+"') class='clickable rf'>view</span></tr>";  
                txt+="<tr><td>protocol:<td>"+ev.samplingProtocol+"</tr>";
                txt+="<tr><td>recorded by:<td>"+ev.recordedBy+"</tr>";
            }
            txt+="</table>";
            txt+="</div>";
            layer.bindPopup(txt, {maxWidth: "auto"}).openPopup();
        });
    }else{
        // this is when dataGroup=='envdata';
        featureapicall=apicall0+"&calltype=data&locationID="+feature.properties.locationID;
        //console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            console.log(selfeature);
            txt="<div class=popupDataStreamInfo>"
            // Location info
            txt+="<h1>Location info:</h1>";
            txt+="<table width=300px>";
            for (key in selfeature){
                if ( key != "datastreams"){
                    txt+="<tr><td>"+key+"<td>"+selfeature[key]+"</tr>";
                }
            }
            txt+="</table><br>";
            // base times or events
            if (selfeature.locationType=="monitoring"){
                //monitoring
                txt+="<h1>Measurement frequencies:</h1>";
                baseTimes=new Array();
                for (dstrm in selfeature['datastreams']){
                    dstrm=selfeature['datastreams'][dstrm];
                    if ($.inArray(dstrm.baseTime, baseTimes)==-1){
                        baseTimes.push(dstrm.baseTime);
                    }
                }
                txt+="<table width=580px>";  
                for (i in baseTimes){
                    txt+="<tr><td>"+baseTimes[i];
                    // this will need to be dependent on access rights
                    if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID)){
                        txt+="<td><span class=clickable onClick=editMonitoringRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+dstrm.baseTime+"')>edit/add data</span>";
                        txt+="</td>";
                    }
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','"+selfeature.locationID+"','"+baseTimes[i]+"','','csv')>download csv</span></td></tr>"; //downloadAPI(dataGroup, datasetID, locationID, baseTime, datastreamID, format)
                }
                txt+="</table>";
            }else{
                //onceoff
                txt+="<h1>Measurement events:</h1>";
                // this will need to be dependent on access rights
                eventDates=new Array();
                for (dstrm in selfeature['datastreams']){
                    data=selfeature['datastreams'][dstrm].data;
                    for (rec in data){
                        if ($.inArray(data[rec][0], eventDates)==-1){
                            eventDates.push(data[rec][0]);
                        }
                    }
                }
                txt+="<table width=580px>";  
                for (i in eventDates){
                    txt+="<tr><td>"+eventDates[i];
                    // this will need to be dependent on access rights
                    if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID)){
                        txt+="<td><span class=clickable onClick=editOnceoffRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+encodeURIComponent(eventDates[i])+"')>edit/add data</span>";
                        txt+="</td>";
                    }
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','"+selfeature.locationID+"','','','csv')>download csv</span></td></tr>";
                    console.log("editOnceoffRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+eventDates[i]+"')");
                }
                txt+="</table>";
            }

            //variables
            txt+="<h1>Available variables:</h1>";
            
            txt+="<div style='height:200px; overflow-y:auto; width:600px;'>";  
            txt+="<table width=580px>";  
            txt+="<tr><th>Name</th><th>Unit</th><th>Type</th><th>Time period</th><th></th><th></th></tr>"; 
            for (dstrm in selfeature['datastreams']){
                dstrm=selfeature['datastreams'][dstrm];
console.log(selfeature.locationType);
                if (selfeature.locationType=="monitoring"){
                    firstDate=dstrm.firstMeasurementDate;
                    lastDate=dstrm.lastMeasurementDate;
                    var fD = new Date(firstDate);
                    var lD = new Date(lastDate);
                    firstDatestr=fD.getFullYear()+"/"+fD.getMonth()+"/"+fD.getDate()
                    lastDatestr=lD.getFullYear()+"/"+lD.getMonth()+"/"+lD.getDate()
                    //console.log(firstDatestr);
                    firstDate=firstDate.replace(/ /g,"_");
                    lastDate=lastDate.replace(/ /g,"_");
                    txt+="<tr><td>"+dstrm.variableName+"</td><td>["+dstrm.variableUnit+"]</td><td>"+dstrm.baseTime+"</td><td>"+firstDatestr+"-"+lastDatestr+"<td><span onClick=showMonitoringDatastreamInPopup('"+dstrm.datastreamID+"','"+firstDate+"','"+lastDate+"') class='clickable rf'>view</span>&nbsp&nbsp"; 
                    txt+="</td>";
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','','','"+dstrm.datastreamID+"','csv')>download csv</span></td></tr>"; //downloadAPI(dataGroup, datasetID, locationID, baseTime, datastreamID, format)
                }else{
                    txt+="<tr><td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]<td>"+dstrm.baseTime+"<td><span onClick=showOnceoffDatastreamInPopup('"+dstrm.datastreamID+"') class='clickable rf'>view</span>&nbsp&nbsp"; 
                    txt+="</td>";
                    txt+="<td><span class=clickable onClick=downloadAPI('envdata','','','','"+dstrm.datastreamID+"','csv')>download csv</span></td></tr>";
                } 
            }
            txt+="</table>";
            txt+="</div>";  
            txt+="</div>";
            layer.bindPopup(txt,{maxWidth: "650px"}).openPopup();
        });
   }
}



function downloadAPI(_base, _datasetID, _locationID, _baseTime, _datastreamID, _format){
    alert("not available at the moment");
}

function downloadAPI_final(_base, _datasetID, _locationID, _baseTime, _datastreamID, _format){

    apicall="./api/api_"+_base+".php?calltype=data";

    if (_datasetID!=''){
        apicall+="&datasetID="+_datasetID;
    }
    if (_locationID!=''){
        apicall+="&locationID="+_locationID;
    }
    if (_datastreamID!=''){
        apicall+="&datastreamID="+_datastreamID;
    }
    if (_baseTime!=''){
        apicall+="&baseTime="+_baseTime;
    }
    console.log(apicall);
}


function showEventInPopup(ev){
// when one clicks on "view" in leaflet popup. this is for biodiv data
// popup to show stuff with is not leaflet popup, its the "full screen popup"
    eventapicall="./api/api_biodiv.php?calltype=data&eventID="+ev;
    console.log(eventapicall);
    $.get(eventapicall, 
        function(data){
            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            console.log(selfeature);
            txt="<div class=eventInfo>"
                txt+="<h1>Location:"+"</h1>";
                txt+="<table>";
                txt+="<tr><td>"+selfeature.locationID+"</tr>";
                txt+="</table>";
                txt+="<h1>Sampling events:"+"</h1>";
                for (ev in selfeature['events']){
                    ev=selfeature['events'][ev];
                    txt+="<h2>date:"+ev.eventDate+"</h2>";  
                    txt+="<table>";
                    txt+="<tr><td>protocol:<td>"+ev.samplingProtocol+"</tr>";
                    txt+="<tr><td>sampling size:<td>"+ev.sampleSizeValue+" "+ev.sampleSizeUnit+"</tr>";
                    txt+="<tr><td>remarks:<td>"+ev.eventRemarks+"</tr>";
                    txt+="<tr><td>recorded by: <td>"+ev.recordedBy+"</tr>";
                    txt+="</table>";
                    txt+="<h3>Occurrence records</h3>";
                    for (oc in ev.occurrenceData){
                        oc=ev.occurrenceData[oc];
                        txt+="<table width=600px>";
                        txt+="<tr><td width=200px>"+oc.scientificName+":<td width=200px>"+oc.organismQuantityType+":<td width=200px>"+oc.organismQuantity+"</tr>";
                        for (mf in oc.measurementOrFact){
                            mf=oc.measurementOrFact[mf];
                            txt+="<tr><td><td>"+mf.measurementType+": <td>"+mf.measurementValue+" "+mf.measurementUnit+"</tr>";
                        }
                        txt+="</table>";
                    }
                }
        // this directs output to "full screen popup" 
        popup(0.9,0.9, txt);
   });
}




function showOnceoffDatastreamInPopup(ds){
// when one clicks on "view" in leaflet popup. this is for envmon data of non-monitoring type
// popup to show stuff with is not leaflet popup, its the "full screen popup"
// just shows a table of data, no graph
    eventapicall="./api/api_envdata.php?calltype=data&datastreamID="+ds;
    $.get(eventapicall, 
        function(data){
//            console.log(eventapicall);
            alldata=JSON.parse(data);
		selfeature=alldata[0];
            txt="<div class=dataStreamInfo>"
//            console.log(selfeature.properties);
            txt+="<h1>Location info:</h1>";
            txt+="<table width=400px>";
            for (key in selfeature){
                if ( key != "datastreams"){
                    txt+="<tr><td>"+key+":<td>"+selfeature[key]+"</tr>";
                }
            }
            txt+="</table>";
            txt+="<h1>Observations:</h1>";
            txt+="<table width=400px>";
            for (dstrm in selfeature['datastreams']){
//              console.log(ds);
                dstrm=selfeature['datastreams'][dstrm];
//               console.log(ds);
                txt+="<table width=400px>";  
                txt+="<tr><td>variable: <td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]</tr>";  
                txt+="<tr><td>base time:<td>"+dstrm.baseTime+"<td></tr>";
                txt+="</table width=400px>";
                txt+="</div>";
                txt+="<h1>Data:</h1>";
                txt+="<table width=400px>";
                txt+="<tr><th>Date<th>Value</tr>";
                for (dt in dstrm.data){
                    dt=dstrm.data[dt];
//                  console.log(dt);
                    tstamp=dt[0];
                    txt+="<tr><td>"+dt[0]+":<td> "+dt[1]+"</tr>"
                }
                txt+="</table>";
            }
        // this directs output to "full screen popup" 
        popup(0.9,0.9, txt);
   });
}



function showMonitoringDatastreamInPopup(ds,firstDate,lastDate){
// when one clicks on "view" in leaflet popup. this is for envmon data of monitoring type
// popup to show stuff with is not leaflet popup, its the "full screen popup"
// shows time series plots
    $("#shade").show();
    firstDate=firstDate.replace(/_/g," ");
    lastDate=lastDate.replace(/_/g," ");
//    console.log(firstDate+lastDate);
    eventapicall="./api/api_envdata.php?calltype=datastream&datastreamID="+ds;
    console.log(eventapicall);
    $.get(eventapicall, 
        function(data){
            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
                txt="";
                txt+="<div id=graphWrapper>";
                txt+="<div id=graphControls></div>";
                txt+="<div id=graph></div>";
                txt+="</div>";
            txt+="<div class=dataStreamInfo>"
//            console.log(selfeature.properties);
            txt+="<table width=400px>";
            // there should be only one datastream at this stage...
            for (dstrm in selfeature['datastreams']){
                key="locationID";
                txt+="<tr><td>"+key+"<td>"+selfeature[key]+"</tr>";
                key="Location name";
                txt+="<tr><td>"+key+"<td>"+selfeature['locationName']+"</tr>";
                key="Location description";
                txt+="<tr><td>"+key+"<td>"+selfeature['locality']+"</tr>";
                key="coordinates";
                txt+="<tr><td>"+key+"<td>"+selfeature['latitude']+" S<br>"+selfeature['longitude']+" E</tr>";
                key="First measurement";
                txt+="<tr><td>"+key+"<td>"+firstDate+"</tr>";
                key="Most recent measurement";
                txt+="<tr><td>"+key+"<td>"+lastDate+"</tr>";
//              console.log(ds);
                dstrm=selfeature['datastreams'][dstrm];
//              console.log(ds);
                txt+="<tr><td>variable <td>"+dstrm.variableName+" ["+dstrm.variableUnit+"]</tr>";
                txt+="<tr><td>base time <td>"+dstrm.baseTime+"</tr>";
                key="datasetID";
			    txt+="<tr><td><span class=clickable onClick=describeDataset('envmon','"+selfeature[key]+"','datasetinfo') id=list-"+groupCode+"-"+ds+"-"+">dataset info</span><td></tr>";
                if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID)){
                    txt+="<tr><td><span class=clickable onClick=editMonitoringRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+dstrm.baseTime+"')>edit/add data</span><td></tr>";
                }
                txt+="</table>";
                txt+="<div id='datasetinfo'>";
                txt+="</div>";
                txt+="<br>";
                txt+="</div>";
            }
        // this directs output to "full screen popup" 
        popup(0.9,0.9, txt);
        
        graphType="compareyearsnormal";
//        graphType="timeseries";
        isFirst=true;
        showcumsum=false;
        if(dstrm.variableName=="rainfall" || dstrm.variableName=="Rainfall"){
            graphType="compareyearscumsum";
            showcumsum=true;
        }
        loadPlot(ds, graphType, isFirst, showcumsum);
    });
}

