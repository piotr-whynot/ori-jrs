// global variables
var ownedItems=new Array();
var map;
var suff="/biodiv";
var currentLayer;
var currentMarker;
var allMarkers=new Array();
var smallIcon = new L.Icon({
     iconUrl:"img/marker.svg" 
});
var largeIcon = new L.Icon({
     iconUrl:"img/marker0.svg" 
});


function initialize(){
    //just some housekeeping to adjust sizes of divs to the current screen
    wh=$(window).height();
    ww=$(window).width();
    $("#allContents").css({
        "height":wh-25,
        "width":ww-20,
    });
    $(".spacer").css({
        "height":wh-25,
    });
    $("#mapWindow").css({
        "height":wh-25,
    });


    populateHeaders();
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
    }


    call="./login.php?action=userInfo";
    $.get(call,
        function(data){
	    data=JSON.parse(data);
        ownedItems= new Array();
	    if (data[0]==null){ //when not registered;
            $('#loginContainerFooter').html("<span class=clickable onClick=loginForm()>login</span>&nbsp|&nbsp<span class=clickable onClick=registerForm()>register</span>");
            ownedItems.push([]);
            ownedItems.push([]);
        }else{ //when registered
            ownedItems.push(data[6]);
            ownedItems.push(data[7]);
            if(data[1]=="admin"){
                $('#loginContainerFooter').html("<span class=clickable onClick=window.location.href='./admin/';>admin pages</span>&nbsp|&nbsp<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your account</span>");
            }else{
                $('#loginContainerFooter').html("<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your account</span>");
            }
	    }
	    if (init=="updatePassword"){
                updatePasswordForm(tempPassword);
            }
        populateMenu();
    });
}


function populateHeaders(){
    txt="<div id=intro>Welcome to Okavango Delta Monitoring and Data Sharing<br><img src=img/UB-logo.png></div>";
    $('#introContents').html(txt);
    $('#introHeader').html("<span class=headerText>Okavango monitoring and data sharing</span>");
    $('#menuHeader').html("<span class=headerText>Data sources</span>");
    $('#datasetHeader').html("<span class=headerText>Dataset</span>");
    $('#locationHeader').html("<span class=headerText>Location</span>");
    $('#figureHeader').html("<span class=headerText>Graphs</span>");
    $('#dataHeader').html("<span class=headerText>Data editor</span>");
    $('#figureWindow').hide();
    $('#locationWindow').hide();
    $('#datasetWindow').hide();
    $('#dataWindow').hide();
}



function clickOnMapItem(itemId, dataGroup, datasetID, typeCode) {
    closePopup();
    //fire event 'click' on target layer. Layer here is the clicked marker. 
    currentLayerfireEvent('click');  
}





function listLocationsInDataset(group, datasetID, typeCode, target){
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
            if (typeCode>''){
                txt="<h4>Listing all locations for "+datasetID+"with data for "+typeName+"</h4>";
            }else{
                txt="<h4>Listing all locations for "+datasetID+"</h4>";
            }
		    txt+="<table class=twoColour width=1000>";
            txt+="<tr><th>Location ID<th>Location name<th>Locality<th>Geomorphological Position<th><th></tr>";
		    for (i in features){
		        props=features[i]['properties'];
                txt+="<tr><td>"+props['locationID']+"<td>"+props['locationName']+"<td>"+props['locality']+"<td>"+props['geomorphologicalPosition']+"<td><span class=clickable onClick=showLocation('"+props['locationID']+"','"+dataGroup+"','locationWindow')>show this location</span>";
                txt+="<td><span class=clickable onClick=downloadAPI('"+dataGroup+"','','"+props['locationID']+"','','','csv')>download csv</span></td></tr>";
		    }
		    txt+="</table>";
		    $("#"+target).html(txt);
        }
    );
}





function describeDataset(group, datasetID, varType, scrollTo){
    console.log("describe dataset");
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
            txt+="<div id=locationTable></div>";
            $("#datasetContents").html(txt);

            listLocationsInDataset(group, datasetID, varType, 'locationTable')

            if(scrollTo){
                scroll2div(scrollTo);    
            }
            $("#shade").hide();
        }
    );
}




function showDataset(locationID, datasetID,dbaseCat,varType, obsType, scrollTo, callback){
// dbaseCat - biodiv or envmon
// varType - climate etc
// obsType - monitoring, once-off 
// shows dataset in map, highlights selected location if needed, executes scroll and cleanup if needed
// only called from menu
// dataset always shown
    dataGroup=dbaseCat;

    describeDataset(dataGroup, datasetID, varType, null);

    typeName=varType.replace(/_/g," ");
    if (varType==""){
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
//    console.log(apicall);
    $("#shade").show();


    $.get(apicall, 
        function(data){
            alldata=JSON.parse(data);
            geoJSONLayer = L.geoJSON(alldata, {
                pointToLayer: function(feature, latlng) {
                    marker=L.marker(latlng, {icon: smallIcon});
                    return marker;
                },
                onEachFeature: onEachFeature
            });
            // if there is a previous dataset layer already
            if (currentLayer){
                delete allMarkers;
                delete currentMarker;
                map.removeLayer(currentLayer);
                datasetInfoBox(dbaseCat, datasetID, "update");
            }else{
                datasetInfoBox(dbaseCat, datasetID, "create");
            }
            geoJSONLayer.addTo(map);
            currentLayer=geoJSONLayer;

            if (locationID>''){
            }

            console.log("csrolling from dataset "+scrollTo);
            if (scrollTo){
                scroll2div(scrollTo);
            }
            callback(true);
        }
    );
}



function showAll(datastreamID, locationID, datasetID, dbaseCat, varType, obsType){
    showDataset(locationID, datasetID,dbaseCat,varType, obsType, false, 
        function(data){
            scrollTo='mapWindow';
            $('#datasetWindow').show();
            if (datastreamID>""){
                // datastream to show
                $('#locationWindow').show();
                $('#figureWindow').show();
                showDatastream(datastreamID, null);
                scrollTo='figureContents';
            }else{
                $('#figureContents').html("");
                $('#figureWindow').hide();
                $('#dataContents').html("");
                $('#dataWindow').hide();
            }
            if (locationID>""){
                $('#locationWindow').show();
                // location to show
                console.log(locationID);
                showLocation(locationID, dataGroup, null);
            }else{
                $('#locationContents').html("");
                $('#locationWindow').hide();
                $('#figureContents').html("");
                $('#figureWindow').hide();
                $('#dataContents').html("");
                $('#dataWindow').hide();
            }
            console.log("csrolling from all"+scrollTo);
            if (scrollTo){
                scroll2div(scrollTo);
            }
            $("#shade").hide();
        }
    );
}





function initializeMap(){
//main function for initializing map interface
    showMap();
    loadBaseMap(); // this is switched off for debugging
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
//    if($(window).height()*0.9<400){
//        mapheight=400;
//    }else{
//        mapheight=$(window).height()-20;
//    }
        map = L.map('mapContents', {center: new L.LatLng(-19.3, 23), zoom: 9, zindex: 30});
        map.scrollWheelZoom.disable();
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
      showLocationWrapper(feature,layer); 
      layer.removeEventListener('mouseout', closePopup);
    });
    layer.on('mouseover', function (e) {
      txt=feature.properties.locationName;
      layer.bindPopup(txt, {maxWidth: "auto"}).openPopup();
      layer.addEventListener('mouseout', closePopup);
    });
    layer._leaflet_id = feature.properties['locationID'];
    allMarkers[feature.properties['locationID']]=layer;
}



function showLocationWrapper(feature,layer){
    showLocation(feature.properties.locationID, feature.properties.dataGroup, 'locationWindow');
}







function showLocation(locationID, dataGroup, scrollTo){
console.log("loading location");
    currentMarker=allMarkers[locationID];
    currentMarker.setIcon(largeIcon);
    centerLeafletMapOnMarker(currentMarker);
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
            datasetID=selfeature['datasetID'];
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
            datasetID=selfeature['datasetID'];
            txt+="</table><br>";
            // base times or events
            if (selfeature.locationType=="monitoring"){
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
                    txt+="<tr><td>"+dstrm.variableName+"</td><td>["+dstrm.variableUnit+"]</td><td>"+dstrm.baseTime+"</td><td>"+firstDatestr+"-"+lastDatestr+"<td><span onClick=showDatastream('"+dstrm.datastreamID+"','figureWindow') class='clickable rf'>view graphs</span>&nbsp&nbsp"; 
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
            $('#locationContents').html(txt);
            $('#locationWindow').show();
            console.log("csrolling from location "+scrollTo);
            if (scrollTo){
                console.log("csrolling from location "+scrollTo);
                scroll2div(scrollTo);
            }
        });
   }

}




function showDatastream(datastreamID, scrollTo){
// when one clicks on "view" in leaflet popup. this is for envmon data of monitoring type
// popup to show stuff with is not leaflet popup, its the "full screen popup"
// shows time series plots
    $("#shade").show();
    $('#figureWindow').show();
    eventapicall="./api/api_envdata.php?calltype=datastream&datastreamID="+datastreamID;
    console.log(eventapicall);
    $.get(eventapicall, 
        function(data){
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
            }
            $('#figureContents').html(txt);

            graphType="compareyearsnormal";
            graphType="timeseries";
            isFirst=true;
            showcumsum=false;
            if(dstrm.variableName=="rainfall" || dstrm.variableName=="Rainfall"){
                graphType="compareyearscumsum";
                showcumsum=true;
            }

            console.log(datastreamID+" "+graphType+" "+isFirst+" "+showcumsum);
            loadPlot(datastreamID, graphType, isFirst, showcumsum);
            console.log("csrolling from datastream"+scrollTo);
            if(scrollTo){
                scroll2div(scrollTo);    
            }
        });
}




function datasetInfoBox(group, datasetID, whattodo){
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
            datasetName=alldata['datasetName'];
            if (whattodo=='create'){
                //create info box
                infoBox = L.control({position: 'topleft'});
                infoBox.onAdd = function () {
                    console.log("creating");
                    this._div = L.DomUtil.create('div', 'info menu');
                    txt="<p>showing:<br>"
                    txt+=datasetName;
                    txt+="</p>";
                    this._div.innerHTML = txt;
                    return this._div;
                }
                infoBox.update = function (datasetName) {
                    txt="<p>showing:<br>"
                    txt+=datasetName;
                    txt+="</p>";
                    this._div.innerHTML = txt;
                }
                infoBox.addTo(map);
            }else{
                infoBox.update(datasetName);
            }
        }
    );
}








function scroll2div(_div2scroll){
    console.log(_div2scroll);
    $('#'+_div2scroll).get(0).scrollIntoView({
        block: "start",
        behavior: "smooth"
    });
}

function showAndScroll(_txt,_div2show,_div2scroll){
    $('#'+_div2show).html(_txt);
    $('#'+_div2scroll).show();
    scroll2div(_div2scroll);
}



function centerLeafletMapOnMarker(marker) {
  var latLngs = marker.getLatLng();
  map.panTo(latLngs);
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

