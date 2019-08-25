// global variables
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
    console.log("initialize");
    wh=$(window).height();
    ww=$(window).width();
    $("#allContents").css({
        "height":wh-25,
        "width":ww-20,
    });
    $(".spacer").css({
        "height":wh-30,
    });
    $("#mapWindow").css({
        "height":wh-25,
    });


    populateHeaders();
    populateFloatNav();
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


    // scroll indicators
    $('#allContents').scroll(function() {
        var sTop = $('#allContents').scrollTop();
        var sBot = -$('#allContents').scrollTop() - $('#allContents').height()+$('#allContents')[0].scrollHeight;
        if ( sTop > 50 ) { 
            $('#fup').fadeIn(1000);
        }else{
            $('#fup').hide();
        }
        if ( sBot > 50 ) { 
            $('#fdown').fadeIn(1000);
        }else{
            $('#fdown').hide();
        }

    });

    call="./login.php?action=userInfo";
    $.get(call,
        function(data){
        console.log(data);
	    data=JSON.parse(data);
        ownedItems= new Array();
        userType= data[1];
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



function populateFloatNav(){
    console.log("floatNav");
    txt="<span class='clickable nav current' data-id=introWindow>Intro</span><br>";
    txt+="<span class='clickable nav'  data-id=menuWindow>Select</span><br>";
    txt+="<span class='clickable nav' data-id=mapWindow>Map</span><br>";
    txt+="<span class='clickable nav' data-id=datasetWindow>Dataset</span><br>";
    txt+="<span class='clickable nav' data-id=locationWindow>Location</span><br>";
    txt+="<span class='clickable nav' data-id=figureWindow>Graph</span><br>";
    $('#floatNav').html(txt);

    $(".nav").on("click", function(){
        target=$(this).data('id');
        scroll2div(target);
    });  
}


function populateHeaders(){
    console.log("page headers");
    txt="<div id=intro>Welcome to Okavango Delta Monitoring and Data Sharing<br><img src=img/UB-logo.png></div>";
    $('#introContents').html(txt);
    $('#introHeader').html("<span class=headerText>Okavango monitoring and data sharing</span>");
    $('#menuHeader').html("<span class=headerText>Data Sources</span>");
    $('#datasetHeader').html("<span class=headerText>Dataset Info</span>");
    $('#locationHeader').html("<span class=headerText>Location Info</span>");
    $('#figureHeader').html("<span class=headerText>Graphs and Data</span>");
    $('#dataHeader').html("<span class=headerText>Data Editor</span>");
    $('#datasetContents').html("Select dataset first");
    $('#locationContents').html("Select location first");
    $('#figureContents').html("Select variable first");
    //$('#figureWindow').hide();
    //$('#locationWindow').hide();
    //$('#datasetWindow').hide();
    $('#dataWindow').hide();
}






function clickOnMapItem(itemId, dataGroup, datasetID, typeCode) {
    closePopup();
    //fire event 'click' on target layer. Layer here is the clicked marker. 
    currentLayerfireEvent('click');  
}




function showAll(datastreamID, locationID, datasetID, obsType, dbaseCat, varType){
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
                $('#figureContents').html("Select location and variable first");
               // $('#figureWindow').hide();
                $('#dataContents').html("");
                $('#dataWindow').hide();
            }
            if (locationID>""){
                $('#locationWindow').show();
                // location to show
                console.log(locationID);
                showLocation(locationID, dataGroup, null, false);
            }else{
                $('#locationContents').html("Select location first");
                //$('#locationWindow').hide();
                //$('#figureContents').html("");
                $('#figureContents').html("Select location and variable first");
                //$('#figureWindow').hide();
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
    console.log(dbaseCat, varType, obsType); 
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
    console.log(apicall);
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
            map.fitBounds(geoJSONLayer.getBounds());
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
//    console.log("listing locations");
//    console.log(apicall);
//    console.log(target);
    $.get(apicall, 
        function(data){
            alldata=JSON.parse(data);
		    features=alldata['features'];
            txt="<div class=tableTitle>";
            txt+="Listing all locations in this dataset";
            if (typeCode>''){
                txt+="\n that report "+typeName+" data";
            }
            txt+="</div>";
		    txt+="<table class='twoColour fullwidthTable listTable'>";
            txt+="<tr><th>Location ID<th>Location name<th>Locality<th>LatLon coordinates<th><th></tr>";
		    for (i in features){
		        props=features[i]['properties'];
		        geom=features[i]['geometry'];
                coords=geom.coordinates;
                txt+="<tr><td>"+props['locationID']+"<td>"+props['locationName']+"<td>"+props['locality']+"<td>"+coords[0]+" "+coords[1]+"<td><span class=clickable onClick=showLocation('"+props['locationID']+"','"+dataGroup+"','locationWindow',true)>select</span><td>";
                txt+="</tr>";
		    }
		    txt+="</table>";
		    $("#"+target).html(txt);
        }
    );
}





function describeDataset(group, datasetID, varType, scrollTo){
    //console.log("describe dataset");
    dataGroup=group;
    if (dataGroup=="biodiv"){
        apicall="./api/api_biodiv.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }else{
        apicall="./api/api_envdata.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }
    //console.log(apicall);
    $("#shade").show();
    $.get(apicall, 
        function(data){
            alldata=JSON.parse(data);
            txt="<div class=infotableDiv id=dsetinfoDiv>";
            txt+="<div class=tableTitle>";
		    txt+=alldata['datasetName'];
            txt+="</div>";
		    txt+="<table class='fullwidthTable infoTable'>";
            txt+="<tr><td class=infoLabel width=50%>dataset ID:<td width=50%>"+alldata['datasetID']+"</tr>";
            txt+="<tr><td class=infoLabel>dataset name:<td>"+alldata['datasetName']+"</tr>";
            txt+="<tr><td class=infoLabel>description:<td>"+alldata['datasetDescription']+"</tr>";
            txt+="<tr><td class=infoLabel>institution holding data:<td>"+alldata['institutionCode']+"</tr>";
            txt+="<tr><td class=infoLabel>institution owning data:<td>"+alldata['ownerInstitutionCode']+"</tr>";
		    if (alldata['publications']){
                txt+="<tr><td class=infoLabel>relevant publications:<td>"+alldata['publications']+"</tr>";
		    }
		    if (alldata['datasetRemarks']){
                txt+="<tr><td class=infoLabel>remarks:<td>"+alldata['datasetRemarks']+"</tr>";
		    }
            if (ownedItems[0].includes(datasetID) || userType=="admin"){
                txt+="<tr><td class=infoLabel><span class=clickable onClick=editDataset('"+dataGroup+"','"+alldata['datasetID']+"')>edit dataset info</span><td></tr>";
            }
		    txt+="</table>";
            txt+="</div>";
            txt+="<div class=auxDiv><span class=clickable onClick=downloadAPI('"+dataGroup+"','"+alldata['datasetID']+"','','','','csv')>download entire dataset</span></div>";
            txt+="<div class=listtableDiv id=dsetlistDiv></div>";
            $("#datasetContents").html(txt);

            listLocationsInDataset(group, datasetID, varType, 'dsetlistDiv')

            if(scrollTo){
                scroll2div(scrollTo);    
            }
            $("#shade").hide();
        }
    );
}





function showLocationWrapper(feature,layer){
    showLocation(feature.properties.locationID, feature.properties.dataGroup, 'locationWindow', true);
}



function showLocation(locationID, dataGroup, scrollTo, cleanup){
    console.log("loading location");
    $('#locationWindow').show();
    if(typeof currentMarker === 'undefined'){
    }else{
        currentMarker.setIcon(smallIcon);
        currentMarker.setZIndexOffset(-1000);
        delete currentMarker;
    }
    currentMarker=allMarkers[locationID];
    currentMarker.setIcon(largeIcon);
    currentMarker.setZIndexOffset(1000);
    centerLeafletMapOnMarker(currentMarker);

    if (dataGroup=="biodiv") {
        //  biodiv - this is still verbatim from populateSecondPopup, needs to be adapated
        featureapicall="./api/api_biodiv.php?calltype=event&locationID="+locationID;
        $.get(featureapicall, 
        function(data){
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            txt="<div class=infotableDiv id=locinfoDiv>";
            txt+="<div class=tableTitle>";
            txt+=selfeature['locationName'];
            txt+="</div>";
            txt+="<table class='infoTable fullwidthTable'>";
	    // this displays all properties coming from api
            for (key in selfeature){
                if ( key != "events"){
                    txt+="<tr><td class=infoLabel width=50%>"+key+":<td width=50%>"+selfeature[key]+"</tr>";
                }
            }
            datasetID=selfeature['datasetID'];
            txt+="</table>";
            txt+="</div>";
            txt+="<div id=loclistTable class=listtableDiv>";
            txt+="<div class=tableTitle>"
            txt+="Sampling events";
            txt+="</div>";
            txt+="<table class='twoColour listTable fullwidthTable'>";
            txt+="<tr><th>Event date</th><th>protocol</th><th>recorded by</th><th></th><th></th></tr>"; 
            for (ev in selfeature['events']){
                ev=selfeature['events'][ev];
                txt+="<tr><td>"+ev.eventDate+"<td>"+ev.samplingProtocol+"<td>"+ev.recordedBy+"<td><span onClick=showBiodivEvent('"+ev.eventID+"','figureWindow') class='clickable rf'>view data</span></tr>";  
            }
            txt+="</table>";
            txt+="</div>";
            $('#locationContents').html(txt);
            console.log("csrolling from location "+scrollTo);
            if (cleanup){
                $('#figureContents').html("Select loctation and variable first");
                $('#dataContents').html("");
                //$('#figureWindow').hide();
                $('#dataWindow').hide();
            }
            if (scrollTo){
                console.log("csrolling from location "+scrollTo);
                scroll2div(scrollTo);
            }
        });
    }else{
        // this is when dataGroup=='envdata';
        featureapicall="./api/api_envdata.php?calltype=datastream&locationID="+locationID;
        //console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            console.log(alldata);
            //selfeature=alldata.features[0].properties;
            selfeature=alldata[0];
            // Location info
            txt="<div id=locinfoDiv class=infotableDiv>";
            txt+="<div class=tableTitle>";
            txt+=selfeature['locationName'];
            txt+="</div>";
            txt+="<table class='infoTable fullwidthTable'>";
            txt+="<tr><td class=infoLabel width=50%>dataset ID:<td width=50%>"+selfeature['datasetID']+"</tr>";
            txt+="<tr><td class=infoLabel>Location Name:<td>"+selfeature['locationName']+"</tr>";
            txt+="<tr><td class=infoLabel>Location type:<td>"+selfeature['locationType']+"</tr>";
            txt+="<tr><td class=infoLabel>locality:<td>"+selfeature['locality']+"</tr>";
            txt+="<tr><td class=infoLabel>latitude:<td>"+selfeature['decimalLatitude']+"</tr>";
            txt+="<tr><td class=infoLabel>longitude:<td>"+selfeature['decimalLongitude']+"</tr>";
            txt+="<tr><td class=infoLabel>coordinate uncertainty [m]:<td>"+selfeature['coordinateUncertaintyInMeters']+"</tr>";
            txt+="<tr><td class=infoLabel>elevation [m a.m.s.l]:<td>"+selfeature['verbatimElevation']+"</tr>";
            txt+="<tr><td class=infoLabel>elevation uncertainty [m]:<td>"+selfeature['elevationUncertaintyInMeters']+"</tr>";
            txt+="<tr><td class=infoLabel>location owner:<td>"+selfeature['locationOwner']+"</tr>";
            txt+="<tr><td class=infoLabel>geomorphological position:<td>"+selfeature['geomorphologicalPosition']+"</tr>";
            txt+="<tr><td class=infoLabel>location remarks:<td>"+selfeature['locationRemarks']+"</tr>";
            if (ownedItems[0].includes(datasetID) || ownedItems[1].includes(locationID) || userType=="admin"){
                txt+="<tr><td class=infoLabel><span class=clickable onClick=editLocation('"+dataGroup+"','"+props['locationID']+"')>edit location info</span><td></tr>";
            }
            txt+="</table><br>";
            txt+="</div>";
            datasetID=selfeature['datasetID'];
            // base times or events
            if (selfeature.locationType!="monitoring"){
                //onceoff
                txt+="<div id=eventlistDiv class=listtableDiv>";
                txt+="<div class=tableTitle>";
                txt+="Measurement dates";
                txt+="</div>";
                txt+="<table class='twoColour listTable fullwidthTable'>";
                eventDates=new Array();
                for (dstrm in selfeature['datastreams']){
                    data=selfeature['datastreams'][dstrm].data;
                    for (rec in data){
                        if ($.inArray(data[rec][0], eventDates)==-1){
                            eventDates.push(data[rec][0]);
                        }
                    }
                }
                txt+="<tr><th>Date<th>Data</tr>";
                for (i in eventDates){
                    txt+="<tr><td>"+eventDates[i];
//                    if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID)){
//                        txt+="<td><span class=clickable onClick=editOnceoffRecordsInPopup('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+encodeURIComponent(eventDates[i])+"')>edit/add data</span>";
//                        txt+="</td>";
//                    }
                    datestr=eventDates[i].replace(/ /g,"_");
                    console.log(datestr);
                    txt+="<td><span class=clickable onClick=showEnvmonEvent('"+selfeature.locationID+"','"+datestr+"','')>view all data\n at this location</span></td></tr>";
                }
                txt+="</table>";
                txt+="</div>";
            }else{
                //variables in monitoring
                txt+="<div id=loclistDiv class=infotableDiv>";
                txt+="<div class=tableTitle>";
                txt+="Available variables";
                txt+="</div>";
                txt+="<table class='twoColour listTable fullwidthTable'>";
                txt+="<tr><th>Name</th><th>Unit</th><th>Type</th><th>First</th><th>Most recent</th><th></th><th></th></tr>"; 
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
                        txt+="<tr><td>"+dstrm.variableName+"</td><td>["+dstrm.variableUnit+"]</td><td>"+dstrm.baseTime+"</td><td>"+firstDatestr+"</td><td>"+lastDatestr+"<td><span onClick=showDatastream('"+dstrm.datastreamID+"','figureWindow') class='clickable rf'>graph</span>&nbsp&nbsp"; 
                        txt+="<td>";

                        if (ownedItems[0].includes(datasetID) || ownedItems[1].includes(selfeature.locationID) || userType=="admin"){
                            txt+="<span class=clickable onClick=\"editMonitoringRecords('"+dataGroup+"','"+selfeature.locationID+"','"+dstrm.baseTime+"'); showDatastream('"+dstrm.datastreamID+"',null)\">edit/add data</span>";
                        }

                        //txt+="<td><span class=clickable onClick=downloadAPI('envdata','','','','"+dstrm.datastreamID+"','csv')>download</span></td></tr>"; //downloadAPI(dataGroup, datasetID, locationID, baseTime, datastreamID, format)
                        txt+="</td></tr>"; 
                    }else{
                        txt+="<tr><td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]<td>"+dstrm.baseTime+"<td><span onClick=showOnceoffDatastreamInPopup('"+dstrm.datastreamID+"') class='clickable rf'>view</span>&nbsp&nbsp"; 
                        txt+="</td>";
                       // txt+="<td><span class=clickable onClick=downloadAPI('envdata','','','','"+dstrm.datastreamID+"','csv')>download</span></td>";
                        txt+="</tr>";
                    } 
                }
            txt+="</table>";
            txt+="</div>";
            }
            txt+="</div>";  
            txt+="</div>";
            $('#locationContents').html(txt);
            console.log("csrolling from location "+scrollTo);
            if (cleanup){
                $('#figureContents').html("Select location and variable first");
                $('#dataContents').html("");
                //$('#figureWindow').hide();
                $('#dataWindow').hide();
            }
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



function showBiodivEvent(ev, scrollTo){
    eventapicall="./api/api_biodiv.php?calltype=data&eventID="+ev;
    console.log(eventapicall);
    $('#figureWindow').show();
    $.get(eventapicall, 
        function(data){
            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            console.log(selfeature);
            ev=selfeature['events'][0];
            //for (ev in selfeature['events']){
            txt="<div id=locinfoDiv class=infotableDiv>";
            txt+="<div class=tableTitle>";
            txt+="Sampling on "+ev.eventDate+" at "+selfeature.locationID;
            txt+="</div>";
            txt+="<table class='infoTable fullwidthTable'>";
            txt+="<tr><td class=infoLabel width=50%>date:<td width=50%>"+ev.eventDate+"</tr>";  
            txt+="<tr><td class=infoLabel>protocol<td>"+ev.samplingProtocol+"</tr>";
            txt+="<tr><td class=infoLabel>sampling size:<td>"+ev.sampleSizeValue+" "+ev.sampleSizeUnit+"</tr>";
            txt+="<tr><td class=infoLabel>remarks:<td>"+ev.eventRemarks+"</tr>";
            txt+="<tr><td class=infoLabel>recorded by: <td>"+ev.recordedBy+"</tr>";
            txt+="</table>";
            txt+="</div>";

            txt+="<div id=loclistDiv class=listtableDiv>";
            txt+="<div class=tableTitle>";
            txt+="Occurrence records";
            txt+="</div>";
            txt+="<table class='twoColour listTable narrowTable'>";
            txt+="<tr><th>Name</th><th>Unit</th><th>Value</th></tr>";
            mftxt="" 
            for (oc in ev.occurrenceData){
                oc=ev.occurrenceData[oc];
                txt+="<tr><td>"+oc.scientificName+"<td>"+oc.organismQuantityType+"<td>"+oc.organismQuantity+"</tr>";
                for (mf in oc.measurementOrFact){
                    mf=oc.measurementOrFact[mf];
                    mftxt+="<tr><td>"+oc.scientificName+"<td>"+mf.measurementType+": <td>"+mf.measurementValue+" "+mf.measurementUnit+"</tr>";
                }
            }
            txt+="</table>";
            txt+="</div>";

            if (mftxt>""){
            txt+="<div id=loclistDiv class=listtableDiv>";
            txt+="<div class=tableTitle>";
            txt+="Other measurements";
            txt+="</div>";
            txt+="<table class='twoColour listTable narrowTable'>";
            txt+="<tr><th>Name<th>Measurement<th>value</tr>";
            txt+=mftxt;
            txt+="</table>";
            txt+="</div>";
            }

        // this directs output to "full screen popup" 
        $('#figureContents').html(txt);
        if (scrollTo){
            console.log("csrolling from location "+scrollTo);
            scroll2div(scrollTo);
        }
   });
}







function showEnvmonEvent(locationID, evDate){
    evDate=evDate.replace(/_/g," ");
    console.log(evDate);
    featureapicall="./api/api_envdata.php?calltype=data&locationID="+locationID;
    console.log(featureapicall);
    $('#figureWindow').show();
    $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            console.log(selfeature);

            txt="<div id=loclistDiv class=listtableDiv>";
            txt+="<div class=tableTitle>";
            txt+="Measurements <br>at "+locationID+" <br>on "+evDate;
            txt+="</div>";
            txt+="<table class='twoColour listTable narrowTable'>";
            txt+="<tr><th>Variable name</th><th>Unit</th><th>Value</th></tr>";
 
            for (dstrm in selfeature['datastreams']){
                dstrmdata=selfeature['datastreams'][dstrm]
                data=dstrmdata.data;
                for (rec in data){
                    if (data[rec][0]==evDate){
            txt+="<tr><td>"+dstrmdata.variableName+"<td>"+dstrmdata.variableUnit+"<td>"+data[rec][1]+"</tr>";
                    }
                }
            }
            txt+="</table>";
            txt+="</div>";
            $('#figureContents').html(txt);
            scroll2div('figureWindow');
        }
    );
}



function initializeMap(){
//main function for initializing map interface
    console.log("map");
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
//    if($(window).height()*0.9<400){
//        mapheight=400;
//    }else{
//        mapheight=$(window).height()-20;
//    }
        map = L.map('mapContents', {dragging: true, center: new L.LatLng(-19.3, 23), zoom: 9, zindex: 30});
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

