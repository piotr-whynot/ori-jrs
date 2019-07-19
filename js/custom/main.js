function initialize(){
    initializeMap();
    populateSideMenu();
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
	    if (data[0]==null){ //when not registered;
            $('#loginContainerFooter').html("<span class=clickable onClick=loginForm()>login</span>&nbsp|&nbsp<span class=clickable onClick=registerForm()>register</span>");
        }else{
            if(data[1]=="admin"){
                $('#loginContainerFooter').html("<span class=clickable onClick=>admin pages</span>&nbsp|&nbsp<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your account</span>");
            }else{
                $('#loginContainerFooter').html("<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your account</span>");
            }
	    }
	    if (init=="updatePassword"){
                updatePasswordForm(tempPassword);
            }
    });
}


function populateSideMenu(){ 
    //calls this, but that php should be merged with other api functions into a single function
    apicall="./api/api_menu.php";
    console.log(apicall);
    $.get(apicall,
        function(data){
	    topmenuarr=JSON.parse(data);
            txt="<ul class='topnav'>";
            for (topg in topmenuarr){
                topGroupName=topmenuarr[topg].groupName; 
                txt+="<li><div class=menuitem id=topgroup"+topg+">"+topGroupName+"</div>";
                txt+="<ul>";
                menuarr=topmenuarr[topg].data;
                for (g in menuarr){
                    groupName=menuarr[g].groupName;
                    groupCode=menuarr[g].groupCode;
                    txt+="<li><div class=menuitem id=group"+groupCode+">"+groupName+"</div>";
                    txt+="<ul>"; 
                    for (tp in menuarr[g].dataTypes){
                        typeName=menuarr[g].dataTypes[tp].typeName;
                        typeCode=typeName.replace(/ /g, "_");
                        txt+="<li><div class=menuitem id=type"+tp+">"+typeName+"</div>";
                        txt+="<ul>";
                        //alert(type);
                        for (d in menuarr[g].dataTypes[tp].datasets){
                            datasetName=menuarr[g].dataTypes[tp].datasets[d].datasetName;
                            // alert(datasetName);
			    txt+="<li>";
			    txt+="<div class=markerHolder id=marker-"+groupCode+"-"+d+"-"+typeCode+">&nbsp</div>"
                            txt+="<label class=checkboxLabel>";
			    txt+="<input type=checkbox id="+groupCode+"-"+d+"-"+typeCode+" onClick=showhideDataset(\""+groupCode+"\",'"+d+"','"+typeCode+"')>"+datasetName;
			    txt+="</label>";
			    txt+="<div class=extrasHolder id=extras-"+groupCode+"-"+d+"-"+typeCode+">";
			    txt+="<span class=clickable onClick=describeDataset(\""+groupCode+"\",'"+d+"','"+typeCode+"') id=list-"+groupCode+"-"+d+"-"+typeCode+">dataset info</span><br>";
			    txt+="<span class=clickable onClick=listLocationsInDataset(\""+groupCode+"\",'"+d+"','"+typeCode+"') id=list-"+groupCode+"-"+d+"-"+typeCode+">list all locations</span>";
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
    if (dataGroup=="biodiv"){
        apicall='./api/api_biodiv.php?datasetID='+datasetID+"&popularGroup="+typeName+"";
    }else{
        apicall='./api/api_envdata.php?datasetID='+datasetID+"&variableType="+typeName+"";
    }
    $("#shade").show();
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
		popup(0.9,0.9,txt);
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



function describeDataset(group, datasetID, typeCode){
    dataGroup=group;
    if (dataGroup=="biodiv"){
        apicall="./api/api_biodiv.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }else{
        apicall="./api/api_envdata.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }
	    console.log(apicall);
    $("#shade").show();
    $.get(apicall, 
        function(data){
            alldata=JSON.parse(data);
		txt="<h1>Dataset info:</h1>";
		txt="<table width=1000>";
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
		popup(0.9,0.9,txt);
                $("#shade").hide();
            }
        );

}



function showhideDataset(group, datasetID, typeCode){
// shows and hide datasets from the main menu
// needs to be richer. For example, should allow displaying all datasets for a given data type with one click
//
    dataGroup=group;
//    alert(group+datasetID+typeCode);
//    alert($('#'+group+"-"+datasetID+"-"+typeCode).prop('checked'));
    if( $('#'+dataGroup+"-"+datasetID+"-"+typeCode).prop('checked')){
        typeName=typeCode.replace(/_/g," ");
        if (dataGroup=="biodiv"){
            apicall='./api/api_biodiv.php?datasetID='+datasetID+"&popularGroup="+typeName+"";
        }else{
            apicall='./api/api_envdata.php?datasetID='+datasetID+"&variableType="+typeName+"";
        }
        console.log(apicall);
        $("#shade").show();
        $.get(apicall, 
            function(data){
		console.log(data); 
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
		console.log(alldata);
                geoJSONLayer = L.geoJSON(alldata, {
                    pointToLayer: function(feature, latlng) {
                        return L.marker(latlng, {icon: smallIcon});
                    },
                    onEachFeature: onEachFeature
                });
		console.log(geoJSONLayer);
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
        $("#shade").hide();
    }
}



function initializeMap(){
//main function for initializing map interface
// $("#shade").show();
    showMap();
//    loadBaseMap(); // this is switched off for debugging
// $("#shade").hide("scale",2000);
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
                    txt+="<td><span class=clickable onClick=editMonitoringRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+dstrm.baseTime+"')>edit/add data</span>";
                    txt+="</td>";
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
                    txt+="<td><span class=clickable onClick=editOnceoffRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+encodeURIComponent(eventDates[i])+"')>edit/add data</span>";
                    txt+="</td>";
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
    firstDate=firstDate.replace(/_/g," ");
    lastDate=lastDate.replace(/_/g," ");
//    console.log(firstDate+lastDate);
    console.log(ds);
    eventapicall="./api/api_envdata.php?calltype=datastream&datastreamID="+ds;
    $.get(eventapicall, 
        function(data){
            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            txt="<div class=dataStreamInfo>"
//            console.log(selfeature.properties);
            txt+="<h1>Monitoring Data:</h1>";
            txt+="<table width=400px>";
            // there should be only one datastream at this stage...
            for (dstrm in selfeature['datastreams']){
                key="locationID";
                txt+="<tr><td>"+key+"<td>"+selfeature[key]+"</tr>";
                key="locationName";
                txt+="<tr><td>"+key+"<td>"+selfeature[key]+"</tr>";
//              console.log(ds);
                dstrm=selfeature['datastreams'][dstrm];
//              console.log(ds);
                txt+="<tr><td>variable <td>"+dstrm.variableName+" "+dstrm.variableUnit+"]</tr>";
                txt+="<tr><td>base time <td>"+dstrm.baseTime+"</tr>";
                txt+="</table>";
                txt+="<br>";
                txt+="<div id=graphWrapper>";
                txt+="<div id=graphControls></div>";
                txt+="<div id=graph></div>";
                txt+="</div>";
            }
        // this directs output to "full screen popup" 
        popup(0.9,0.9, txt);
        if(dstrm.variableName=="rainfall" || dstrm.variableName=="Rainfall"){
            showcumsum=true;
        }else{
            showcumsum=false;
        }
        loadPlot(ds,"compareyearsnormal", true, showcumsum);
    });
}

