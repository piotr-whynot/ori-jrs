// global variables
var map;
var ismap=false;

var suff="/biodiv";
var currentLayer;
var currentMarker;
var allMarkers=new Array();
var smallIcon = new L.Icon({
     iconUrl:"img/marker.svg",
     iconAnchor:   [16, 45],
     popupAnchor:  [0, -45]
});
var largeIcon = new L.Icon({
     iconUrl:"img/marker0.svg", 
     iconAnchor:   [16, 45],
     popupAnchor:  [0, -45]
});

var taxonData=new Array();
var currentDataset=new Array();

window.addEventListener("resize", resizeElements);



// Initialization
//
// ******************************************************************************************************************************

function initialize(){
    //just some housekeeping to adjust sizes of divs to the current screen
    console.log("initialize");

    $.get("intro_contents", function(data){
            $('#introContents').append(data);
            console.log("loaded intro_contents");
            $("#myCarousel").carousel();
        },"html"
    );
 

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
        //console.log(data);
	    data=JSON.parse(data);
        ownedItems= new Array();
        userType= data[1];
	    if (data[0]==null){ //when not registered;
            txt="<li><a href=# onClick='registerForm()'><span class='glyphicon glyphicon-user'></span> Sign Up</a></li>";
            txt+="<li><a href=# onClick='loginForm()'><span class='glyphicon glyphicon-log-in'></span> Login</a></li>";
            ownedItems.push([]);
            ownedItems.push([]);
        }else{ //when registered
            ownedItems.push(data[6]);
            ownedItems.push(data[7]);
            txt="";
            if(data[1]=="admin"){
                txt+="<li><a href=# onClick=window.location.href='./admin/';><span class='glyphicon glyphicon-wrench'></span> admin&nbsppages</a></li>";
            }
            txt+="<li><a href=# onClick='logoutForm()'><span class='glyphicon glyphicon-log-out'></span> Log out</a></li>";
            txt+="<li><a href=# onClick=updateUserForm()><span class='glyphicon glyphicon-edit'></span> Your&nbspaccount</a></li>";
            if (ownedItems.length>0){

            }
	    }
        $('#loginContainer').html(txt);

	    if (init=="updatePassword"){
             updatePasswordForm(tempPassword);
        }
        populateSources();
        initializeExplore();
        showHome();
    });

// global functions
    $('#floatFaq').on("click", function(){
        pageinModal("faq_contents","FAQ")
    });
}



function initializeExplore(){
    $('#datasetInfo').html("<div class='alert alert-info text-center'>Select dataset in <a class=alert-link href=# onclick=openDiv('sourcesWindow')>Data Sources</a> panel first</div>");
    $('#locationContents').html("<div class='alert alert-info text-center'>Select location in <a class=alert-link href=#  onclick=openDiv('datasetWindow')>Dataset</a> panel first</div>");
    $('#figureContents').html("<div class='alert alert-info text-center'>Select variable in  <a class=alert-link href=#  onclick=openDiv('locationWindow')>Location </a> panel first</div>");
    $('#dataContents').html("<div class='alert alert-info text-center'>Select variable in <a class=alert-link href=#  onclick=openDiv('locationWindow')>Location</a> panel first</div>");
    $('#exploreMenu').show();

    $(".expmenuItem").on("click", function(){
        target=$(this).data('id');
        openDiv(target);
    });

    if (!ismap){
        initializeMap()
        ismap=true;
    }
}




// Navigation 
//
// ******************************************************************************************************************************


function showHome(){
    $(".exploreDiv").hide()
    $(".homeDiv").show()
    $("#exploreMenu").hide()
    resizeElements();
}

function showExplore(){
    $(".homeDiv").hide()
    $("#exploreMenu").show()
    openDiv("sourcesWindow");
    openAccordion("all");
}





function showAll(datastreamID, locationID, datasetID, obsType, dBase, varType){
    //function loadding dataset, location or a particular variable called by clicking on an item in accordion
    showDataset(locationID, datasetID,dBase,varType, obsType, false,
        function(data){
            //this opens a dataset, and later, depending on context, opens either a datastream or a location
            targetDiv='datasetWindow';

            if (datastreamID>""){
                showDatastream(datastreamID, false);
                targetDiv='figureWindow';
            }else{
                $('#figureContents').html("<div class='alert alert-info text-center'>Select variable from <a class=alert-link href=# onclick=openDiv('locationWindow') Location </a> panel first</div>");
            }

            if (locationID>""){
                // location to show
                showLocation(locationID, dataGroup, false, false);
            }else{
                $('#locationContents').html("<div class='alert alert-info text-center'>Select location from <a class=alert-link href=# onclick=openDiv('datasetWindow')> Dataset </a> panel first</div>");
                $('#figureContents').html("<div class='alert alert-info text-center'>Select variable from <a class=alert-link href=# onclick=openDiv('locationWindow')>Location </a> panel first</div>");
            }
            $('#dataContents').html("<div class='alert alert-info text-center'>Select variable from <a class=alert-link href=# onclick=openDiv('locationWindow')>Location </a> panel first</div>");
            if (targetDiv){
                openDiv(targetDiv);
            }
        }
    );
}





function showDataset(locationID, datasetID,dBase,varType, obsType, targetDiv, callback){
    $("#shade").show();
// dBase - biodivdata or envmondata
// varType - climate etc // not functional yet??
// obsType - monitoring, once-off 
// shows dataset in map, highlights selected location if needed, moves to location tab and cleanup if needed
// only called from menu
// dataset always shown

    dataGroup=dBase;
    describeDataset(dataGroup, datasetID, varType, null);

    typeName=varType.replace(/_/g," ");
    //console.log(dBase, varType, obsType); 
    if (varType==""){
        if (dataGroup=="biodivdata"){
            apicall='./api/api_biodiv.php?datasetID='+datasetID+"";
        }else{
            apicall='./api/api_envdata.php?datasetID='+datasetID+"";
        }
    }else{
        if (dataGroup=="biodivdata"){
            apicall='./api/api_biodiv.php?datasetID='+datasetID+"&popularGroup="+typeName+"";
        }else{
            apicall='./api/api_envdata.php?datasetID='+datasetID+"&variableType="+typeName+"";
        }
    }
    //console.log(apicall);

    $.get(apicall, 
        function(data){
            alldata=JSON.parse(data);
            map.invalidateSize();
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
                datasetInfoBox(dBase, datasetID, "update");
            }else{
                datasetInfoBox(dBase, datasetID, "create");
            }
            geoJSONLayer.addTo(map);
            map.fitBounds(geoJSONLayer.getBounds());
            currentLayer=geoJSONLayer;

            if (locationID>''){
            }

            if (targetDiv){
                openDiv(targetDiv);
            }
            callback(true);
        }
    );
}





function listLocationsInDataset(group, datasetID, typeCode, target){
    dataGroup=group;
    typeName=typeCode.replace(/_/g," ");
    if (typeCode=="owned"){
        if (dataGroup=="biodivdata"){
            apicall='./api/api_biodiv.php?datasetID='+datasetID+"";
        }else{
            apicall='./api/api_envdata.php?datasetID='+datasetID+"";
        }
    }else{
        if (dataGroup=="biodivdata"){
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
            txt="<h4 class=text-center>";
            txt+="Listing all locations in this dataset";
            if (typeCode>''){
                txt+="\n that report "+typeName+" data";
            }
            txt+="</h4>";

            txt+="<div id=locations-table>";
		    txt+="<table class='listTable table table-striped'>";
            txt+="<thead>";
            txt+="<tr><th>Select<th>Location name<th>Locality</tr>";
            txt+="<tbody>";
		    for (i in features){
		        props=features[i]['properties'];
		        geom=features[i]['geometry'];
                coords=geom.coordinates;
                txt+="<tr><td><input type='radio' name='locationradio' id='row-"+props['locationID']+"' onClick=showLocation('"+props['locationID']+"','"+dataGroup+"','locationWindow',true)><td>"+props['locationName']+"<td>"+props['locality']+"";
                txt+="</tr>";
		    }
		    txt+="</table>";
		    $("#"+target).html(txt);
        }
    );
}





function describeDataset(group, datasetID, varType, targetDiv){
    console.log("describe dataset "+group);
    dataGroup=group;
    if (dataGroup=="biodivdata"){
        apicall="./api/api_biodiv.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }else{
        apicall="./api/api_envdata.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }
    //console.log(apicall);
    $("#shade").show();
    $.get(apicall, 
        function(data){
            currentDataset=JSON.parse(data)[datasetID];
            //txt="<div class=infotableDiv id=dsetinfoDiv>";
            txt="<h3 class=text-center>";
		    txt+=currentDataset['datasetName'];
            txt+="</h3>";
		    txt+="<table class='infoTable'>";
            txt+="<tr><td class=infoLabel width=50%>dataset ID:<td width=50%>"+currentDataset['datasetID']+"</tr>";
            txt+="<tr><td class=infoLabel>dataset name:<td>"+currentDataset['datasetName']+"</tr>";
            txt+="<tr><td class=infoLabel>description:<td>"+currentDataset['datasetDescription']+"</tr>";
            txt+="<tr><td class=infoLabel>institution holding data:<td>"+currentDataset['institutionCode']+"</tr>";
            txt+="<tr><td class=infoLabel>institution owning data:<td>"+currentDataset['ownerInstitutionCode']+"</tr>";
		    if (currentDataset['publications']){
                txt+="<tr><td class=infoLabel>relevant publications:<td>"+currentDataset['publications']+"</tr>";
		    }
		    if (currentDataset['datasetRemarks']){
                txt+="<tr><td class=infoLabel>remarks:<td>"+currentDataset['datasetRemarks']+"</tr>";
		    }
		    txt+="</table>";
            if (ownedItems[0].includes(datasetID) || userType=="admin"){
                txt+="<div class=text-center><a href=# onClick=editDataset('"+dataGroup+"','"+currentDataset['datasetID']+"')>edit dataset info</a></div>";
            }
            //txt+="</div>";
            txt+="<button class='btn btn-block btn-info my-1' onClick=downloadAll('"+dataGroup+"','"+currentDataset['datasetID']+"','','','','')>download entire dataset</button>";
            $("#datasetInfo").html(txt);

            listLocationsInDataset(group, datasetID, varType, 'locationsList')

            if(targetDiv){
                openDiv(targetDiv);    
            }
            $("#shade").hide();
        }
    );
}





function showLocationWrapper(feature,layer){
    showLocation(feature.properties.locationID, feature.properties.dataGroup, null, true);
    console.log("check");
}




function showLocation(locationID, dataGroup, targetDiv, cleanup){
    console.log("loading location");
    //setting things on the map
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

    // setting things in the table
    $("#row-"+locationID).prop("checked", true);

    //
    if (dataGroup=="biodivdata") {
        //  biodiv - this is still verbatim from populateSecondPopup, needs to be adapated
        featureapicall="./api/api_biodiv.php?calltype=event&locationID="+locationID;
        $.get(featureapicall, 
        function(data){
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            txt="<h3 class=text-center>";
            txt+=selfeature['locationName'];
            txt+="</h3>";
            txt+="<table class='infoTable narrowTable'>";
            // this displays all properties coming from api
            for (key in selfeature){
                if ( key != "events"){
                    txt+="<tr><td class=infoLabel width=50%>"+key+":<td width=50%>"+selfeature[key]+"</tr>";
                }
            }
            datasetID=selfeature['datasetID'];
            txt+="</table>";

            if (selfeature.locationType=="monitoring"){
                txt+="<button class='btn btn-block btn-info my-1' onClick=showBiodivTimeseries('"+locationID+"','figureWindow')>Show time series</button>";
            }

            txt+="<h3 class=text-center>"
            txt+="Sampling events";
            txt+="</h3>";
            txt+="<table class='listTable table table-striped verynarrowTable'>";
            txt+="<thead>";
            txt+="<tr><th>Select<th>Event date</th><th></th></tr>"; 
            txt+="<tbody>";
            for (ev in selfeature['events']){
                ev=selfeature['events'][ev];
                txt+="<tr><td><input type='radio' name=eventradio onClick=showBiodivEvent('"+ev.eventID+"','figureWindow')><td>"+ev.eventDate+"<td></tr>";  
            }
            txt+="</table>";


            $('#locationContents').html(txt);

            if (cleanup){
                $('#figureContents').html("<div class='alert alert-info text-center'>Select variable from <a class=alert-link href=# onclick=openDiv('locationWindow') Location </a> panel first</div>");
                $('#dataContents').html("<div class='alert alert-info text-center'>Select variable from <a class=alert-link href=# onclick=openDiv('locationWindow') Location </a> panel first</div>");
            }

            if (targetDiv){
                openDiv(targetDiv);
            }
        });
    }else{
        // this is when dataGroup=='envdata';
        featureapicall="./api/api_envdata.php?calltype=data&locationID="+locationID;
        //console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            //console.log(featureapicall);
            alldata=JSON.parse(data);
            //console.log(alldata);
            //selfeature=alldata.features[0].properties;
            selfeature=alldata[0];
            // Location info
            txt="<h3 class=text-center>";
            txt+=selfeature['locationName'];
            txt+="</h3>";
            txt+="<table class='infoTable narrowTable'>";
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
            txt+="</table>";

            if (ownedItems[0].includes(datasetID) || ownedItems[1].includes(locationID) || userType=="admin"){
                txt+="<div class=text-center><a href=# onClick=editLocation('"+dataGroup+"','"+selfeature['datasetID']+"','"+selfeature['locationID']+"')>edit location info</a></div>";
            }
            //txt+="<div class=auxDiv><span class=clickable onClick=downloadAll('"+dataGroup+"','','"+alldata['locationID']+"','','','csv')>download data for this location</span></div>";
            datasetID=selfeature['datasetID'];

            // base times or events
            if (selfeature.locationType!="monitoring"){
                //onceoff
                txt+="<h3 class=text-center>";
                txt+="Measurement dates";
                txt+="</h3>";
                txt+="<table class='listTable table table-striped verynarrowTable'>";
                eventDates=new Array();
                for (dstrm in selfeature['datastreams']){
                    data=selfeature['datastreams'][dstrm].data;
                    for (rec in data){
                        if ($.inArray(data[rec][0], eventDates)==-1){
                            eventDates.push(data[rec][0]);
                        }
                    }
                }
                txt+="<thead>";
                txt+="<tr><th>Select<th>Event date<td></tr>";
                txt+="<tbody>";
                for (i in eventDates){
                    datestr=eventDates[i].replace(/ /g,"_");
                    txt+="<tr><td><input type=radio name=enveventradio onClick=showEnvmonEvent('"+selfeature.locationID+"','"+datestr+"','figureWindow')>";
                    txt+="<td>"+eventDates[i]+"<td>";
                    //console.log(datestr);
                    if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID) || userType=="admin"){
                        txt+="<a href=# onClick=\"showEnvmonEvent('"+selfeature.locationID+"','"+datestr+"',null); editOnceoffRecords('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+encodeURIComponent(eventDates[i])+"'); \">edit/add data</a>";
                    }
                    txt+="</tr>";
                }
                txt+="</table>";
            }else{
                //variables in monitoring
                txt+="<h3 class=text-center>";
                txt+="Available variables";
                txt+="</h3>";
                txt+="<table class='listTable table table-striped'>";
                txt+="<thead>";
                txt+="<tr><th>Select<th>Name</th><th>Unit</th><th>Type</th><th>First</th><th>Most recent</th><th></th></tr>"; 
                txt+="<tbody>";
                for (dstrm in selfeature['datastreams']){
                    dstrm=selfeature['datastreams'][dstrm];
                    if (selfeature.locationType=="monitoring"){
                        firstDate=dstrm.firstMeasurementDate;
                        lastDate=dstrm.lastMeasurementDate;
                        var fD = new Date(firstDate);
                        var lD = new Date(lastDate);
                        fm=fD.getMonth()+1;
                        lm=lD.getMonth()+1;
                        firstDatestr=fD.getFullYear()+"/"+fm+"/"+fD.getDate()
                        lastDatestr=lD.getFullYear()+"/"+lm+"/"+lD.getDate()
                        //console.log(firstDatestr);
                        firstDate=firstDate.replace(/ /g,"_");
                        lastDate=lastDate.replace(/ /g,"_");


                        txt+="<tr><td><input type='radio' name=variableradio id=var-"+dstrm.variableName+" onClick=\"showDatastream('"+dstrm.datastreamID+"','figureWindow');\" ><td>"+dstrm.variableName+"</td><td>["+dstrm.variableUnit+"]</td><td>"+dstrm.baseTime+"</td><td>"+firstDatestr+"</td><td>"+lastDatestr+""; 
                        txt+="<td>";

                        if (ownedItems[0].includes(datasetID) || ownedItems[1].includes(selfeature.locationID) || userType=="admin"){
                            txt+="<a href=# class=clickable onClick=\"editMonitoringRecords('"+dataGroup+"','"+selfeature.locationID+"','"+dstrm.baseTime+"'); showDatastream('"+dstrm.datastreamID+"',null)\">edit/add data</a>";
                        }

                        //txt+="<td><span class=clickable onClick=downloadAll('envdata','','','','"+dstrm.datastreamID+"','csv')>download</span></td></tr>"; //downloadAll(dataGroup, datasetID, locationID, baseTime, datastreamID, format)
                        txt+="</td></tr>"; 
                    }else{
                        txt+="<tr><td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]<td>"+dstrm.baseTime+"<td><span onClick=showOnceoffDatastreamInPopup('"+dstrm.datastreamID+"') class='clickable rf'>view</span>&nbsp&nbsp"; 
                        txt+="</td>";
                       // txt+="<td><span class=clickable onClick=downloadAll('envdata','','','','"+dstrm.datastreamID+"','csv')>download</span></td>";
                        txt+="</tr>";
                    } 
                }
            txt+="</table>";
            }
            $('#locationContents').html(txt);
            if (cleanup){
                $('#figureContents').html("<div class='alert alert-info text-center'>Select variable from <a class=alert-link href=# onclick=openDiv('locationWindow')>Location </a> panel first </>");
                $('#dataContents').html("<div class='alert alert-info text-center'>Select variable from <a class=alert-link href=# onclick=openDiv('locationWindow')>Location </a> panel first");
            }
            if (targetDiv){
                openDiv(targetDiv);
            }
        });
   }

}





function showBiodivTimeseries(locationID, targetDiv){
    $("#shade").show();
    populateFigureContents();
    showhideWrapper("graphWrapper");
    loadBiodivPlot(locationID);

    if(targetDiv){
        openDiv(targetDiv);    
    }
}




function populateFigureContents(){
    _txt="";
    _txt+="<div class=text-right><label class='btn btn-default btn-custom' id=btn-graphWrapper onClick=showhideWrapper('graphWrapper')>show/hide graph</label>";
    _txt+="<label class='btn btn-default btn-custom' id=btn-dataWrapper onClick=showhideWrapper('dataWrapper')>show/hide data</label></div>";
    _txt+="<div id=graphWrapper class='wrapper row collapse'>";
        _txt+="<div id=graphMenu class=col-lg-3></div>";
        _txt+="<div id=graph class='col-lg-7 my-1'>";
        _txt+="<div class='alert alert-info'> No graph available for this dataset</div>";
        _txt+="</div>";
        _txt+="<div id=graphMenuAux class=col-lg-2></div>";
    _txt+="</div>";
    _txt+="<div id=dataWrapper class='wrapper row collapse'>";
    _txt+="<div class='alert alert-info'> No data available for this dataset</div>";
    _txt+="</div>";
    $('#figureContents').html(_txt);
}





function showDatastream(datastreamID, targetDiv){
// when one clicks on "view" in leaflet popup. this is for envmon data of monitoring type
// popup to show stuff with is not leaflet popup, its the "full screen popup"
// shows time series plots
    console.log("datastream");
    $("#shade").show();
    eventapicall="./api/api_envdata.php?calltype=datastream&datastreamID="+datastreamID;
    //console.log(eventapicall);
    $.get(eventapicall, 
        function(data){
            alldata=JSON.parse(data);
            selfeature=alldata[0];
//            console.log(selfeature.properties);
            // there should be only one datastream at this stage...
            dstrm=selfeature['datastreams'];
            populateFigureContents();
            showhideWrapper("graphWrapper");

            graphType="compareyearsnormal";
            graphType="timeseries";
            isFirst=true;
            showcumsum=false;
            //console.log(dstrm[0]);

            if(dstrm[0].variableName=="rainfall" || dstrm[0].variableName=="Rainfall"){
                graphType="compareyearscumsum";
                showcumsum=true;
            }
            //console.log(datastreamID+" "+graphType+" "+isFirst+" "+showcumsum);
            loadPlot(datastreamID, graphType, isFirst, showcumsum);
            showDatastreamTable(datastreamID); 
        }
    );
    if(targetDiv){
        openDiv(targetDiv);    
    }
}


function showDatastreamTable(_datastreamID){
    $("#dataWrapper").html(_datastreamID);
}

function showBiodivEvent(ev, targetDiv){
    eventapicall="./api/api_biodiv.php?calltype=data&eventID="+ev;
    //console.log(eventapicall);
    $.get(eventapicall, 
        function(data){
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            //console.log(selfeature);
            ev=selfeature['events'][0];
            //for (ev in selfeature['events']){
            txt="<h3 class=text-center>";
            txt+="Sampling on "+ev.eventDate+" at "+selfeature.locationID;
            txt+="</h3>";
            txt+="<table class='infoTable narrowTable'>";
            txt+="<tr><td class=infoLabel width=50%>date:<td width=50%>"+ev.eventDate+"</tr>";  
            txt+="<tr><td class=infoLabel>protocol<td>"+ev.samplingProtocol+"</tr>";
            txt+="<tr><td class=infoLabel>sampling size:<td>"+ev.sampleSizeValue+" "+ev.sampleSizeUnit+"</tr>";
            txt+="<tr><td class=infoLabel>remarks:<td>"+ev.eventRemarks+"</tr>";
            txt+="<tr><td class=infoLabel>recorded by: <td>"+ev.recordedBy+"</tr>";
            txt+="</table>";

            txt+="<h4 class=text-center>";
            txt+="Occurrence records";
            txt+="</h4>";
            txt+="<table class='table listTable table-striped narrowTable'>";
            txt+="<thead>";
            txt+="<tr><th>Name</th><th>Unit</th><th>Value</th></tr>";
            txt+="<tbody>";
            mftxt="" 
            for (occ in ev.occurrenceData){
                oc=ev.occurrenceData[occ];
                txt+="<tr><td>"+oc.scientificName+"<td>"+oc.organismQuantityType+"<td>"+oc.organismQuantity+"</tr>";
                for (mf in oc.measurementOrFact){
                    mf=oc.measurementOrFact[mf];
                    mftxt+="<tr><td>"+oc.scientificName+"<td>"+mf.measurementType+": <td>"+mf.measurementValue+" "+mf.measurementUnit+"</tr>";
                }
            }
            txt+="</table>";

            if (mftxt>""){
                txt+="<h4 class=text-center>";
                txt+="Other measurements";
                txt+="</h4>";
                txt+="<table class='table listTable narrowTable table-striped'>";
                txt+="<thead>";
                txt+="<tr><th>Name<th>Measurement<th>value</tr>";
                txt+="<tbody>";
                txt+=mftxt;
                txt+="</table>";
            }
        
        // this directs output to "full screen popup" 
        populateFigureContents();
        showhideWrapper("dataWrapper");
        $('#dataWrapper').html(txt);

        if (targetDiv){
            openDiv(targetDiv);
        }
   });
}





function showEnvmonEvent(locationID, evDate, targetDiv){
    evDate=evDate.replace(/_/g," ");
    //console.log(evDate);
    featureapicall="./api/api_envdata.php?calltype=data&locationID="+locationID;
    //console.log(featureapicall);
    $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            populateFigureContents();
            showhideWrapper("dataWrapper");

            txt="<h3 class=text-center>";
            txt+="Measurements <br>at "+locationID+" <br>on "+evDate;
            txt+="</h3>";
            txt+="<table class='listTable narrowTable table-striped'>";
            txt+="<thead>";
            txt+="<tr><th>Variable name</th><th>Unit</th><th>Value</th></tr>";
            txt+="<tbody>";
 
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
            $('#dataWrapper').html(txt);
            if (targetDiv){
                openDiv('figureWindow');
            }
        }
    );
}









// Map
//
// ************************************************************************************************************************************


function initializeMap(){
    //main function for initializing map interface
    console.log("map");
    map = L.map('mapDiv', {dragging: true, center: new L.LatLng(-19.3, 23), zoom: 9, zindex: 30});
    map.scrollWheelZoom.disable();
    // loads openstreetmap. For the time being the only option for background. Perhaps one day will implement google satellite overlay... 
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    osm=new L.TileLayer(osmUrl, {minZoom: 7, maxZoom: 15, attribution: osmAttrib});    
    osm.addTo(map);
    return("done");
}



function clickOnMapItem(itemId, dataGroup, datasetID, typeCode) {
    closePopup();
    //fire event 'click' on target layer. Layer here is the clicked marker. 
    currentLayerfireEvent('click');  
}




function onEachFeature(feature,layer){
// what happens when one hovers over marker in map, or clicks on it
    // this function needs to be here to enable closing or not closing popup dependent on context
    // this is leaflet popup
    function closePopup(){
        layer.closePopup();
    }

    //layer.bindPopup("<img src=img/ajax-loader.gif>");
    // this attaches apicall and dataGroup to properties of the feature for later use in populating popup
    // apicall and dataGroup are not passsed directly, they are defined here using js variable scope,
    // they need to be embedded in layer properties because they will disappear if another layer is opened
    layer.feature.properties.apicall = apicall;
    layer.feature.properties.dataGroup = dataGroup;
    layer.on('click', function (e) {
      showLocationWrapper(feature,layer); 
      //layer.removeEventListener('mouseout', closePopup);
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
    if (dataGroup=="biodivdata"){
        apicall="./api/api_biodiv.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }else{
        apicall="./api/api_envdata.php?calltype=datasetinfo&datasetID="+datasetID+"";
    }
    //console.log(apicall);
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



function centerLeafletMapOnMarker(marker) {
    var latLngs = marker.getLatLng();
    map.panTo(latLngs);
}







// Download
//
// ******************************************************************************************************************************


function directDownload(_base,_datasetID){
   if (_base=="biodivdata"){
        apicall="./api/api_biodiv.php?calltype=datasetinfo&datasetID="+_datasetID+"";
    }else{
        apicall="./api/api_envdata.php?calltype=datasetinfo&datasetID="+_datasetID+"";
    }
    //$("#shade").show();
    $.get(apicall, 
        function(data){
            currentDataset=JSON.parse(data)[_datasetID];
            downloadAll(_base, _datasetID,"","","","");
            //$("#shade").hide();
        });
}


function downloadAll(_base, _datasetID, _locationID, _baseTime, _datastreamID, _format){
    console.log(userType);
    if (userType===null){
        txt="<h2>Registration/Login required</h2>"; 
        txt+="<p>You have to register and be logged in to download data "; 
        txt+="<p><a href='#' onClick='registerForm()'><span class='glyphicon glyphicon-user'></span> Sign Up</a>&nbsp&nbsp<a href='#' onClick='loginForm()'><span class='glyphicon glyphicon-log-in'></span> Login</a>";
    }else{
        txt="<h2> Downloading data</h1>";
        txt+="<p>Dataset: "+currentDataset['datasetName']+" ("+_datasetID+")";
        txt+="<p>";

        if(_base=="biodivdata"){
            apicall="./api/api_biodiv.php?";
        }
        if(_base=="envmondata"){
            apicall="./api/api_envdata.php?";
        }
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
        console.log(currentDataset);

        if (_base=="biodivdata"){
            txt+="<p>Download all data in one file (<b>json</b> format) ";
            txt+="&nbsp<a href=#  onClick=downloadAPI('"+apicall+"&calltype=data&format=json','json','"+_datasetID+"','alldata')>download json file </a>";
            txt+="<p>";
            txt+="<p>";
            txt+="<p>";
            txt+="<p>Download data in separate files (<b>csv</b> format)";
            txt+="<p>Occurrence data <a onClick=downloadAPI('"+apicall+"&calltype=data&format=csv','csv','"+_datasetID+"','occurrence')>csv file</a>";
            txt+="<p>\"Measurement or fact\" data <a onClick=downloadAPI('"+apicall+"&calltype=mof&format=csv','csv','"+_datasetID+"','measurementorfact')>csv file</a>";

        }else{
            txt+="<p>Entire dataset in ";
            txt+="<a onClick=downloadAPI('"+apicall+"&calltype=data&format=json','json','"+_datasetID+"','alldata')>json</a>";
            txt+=" or ";
            txt+="<a onClick=downloadAPI('"+apicall+"&calltype=data&format=csv','csv','"+_datasetID+"','alldata')>csv</a>";
            txt+=" format";
        }
    }
    textinModal(txt, "Download dataset");
}




function downloadAPI(_apicall,_format,_datasetID,_prefix){
    $("#shade").show();

    console.log(_apicall);
        $.get(_apicall,function(data){
        var blob=new Blob([data]);
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link.download=_prefix+"_"+_datasetID+"."+_format;
        link.click();
        $("#shade").hide();
    });
}






// Stuff
//
// *******************************************************************************************************************************************


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





function editLocation(_base, _datasetID, _locationID){
    url="./admin/?base="+_base+"&do=edit&table=location&datasetID="+_datasetID+"&locationID="+_locationID;
    openInNewTab(url);
}




function editDataset(_base, _datasetID){
    url="admin/?base="+_base+"&do=edit&table=dataset&datasetID="+_datasetID;
    openInNewTab(url);
}






//Helpers 
//
//**************************************************************************************************************************


function openInNewTab(url){
  var win = window.open(url, '_blank');
  win.focus();
}




function resizeElements(){ 
    wh=$(window).height();
    ww=$(window).width();
    $("#mapDiv").css({
        "height":0.5*wh,
        "width":ww*0.7,
    });
}



function showhideInfo(_datasetID){
    if($("#info-"+_datasetID).is(":visible") == true){
        $("#info-"+_datasetID).hide();
    }else{
        $(".info").hide();
        $("#info-"+_datasetID).show();
    }
}



function closeModal(){
     $("#myModal").modal('hide');
}


function pageinModal(page,title){ 
    $.get(page, function(data){
        $(".modal-title").html(title);
        $(".modal-body").html(data);
        $('#myModal').modal('show');
    });
}


function textinModal(txt,title){ 
    $(".modal-title").html(title);
    $(".modal-body").html(txt);
    $('#myModal').modal('show');
}


function openAccordion(_id){
    $(".topnav ul").show();
    $(".topnav span.openCloseSign").html("<img src='img/icon_minus.svg' height=20 width=20>");
//    $("#"+_id+"~ul").show();
//    $("#"+_id+"~span").html("<img src='img/icon_minus.svg' height=20 width=20>");
}



function showAndScroll(_txt,_targettxt,_targetopen){
    $("#"+_targettxt).html(_txt);
    openDiv(_targetopen);
}




function openDiv(_target){
    if(_target==null){

    }else{
        console.log(_target);
        $(".exploreDiv").hide();
        if(_target=="datasetWindow"){
            $("#"+_target).animate({targetDiv: 0}, 1).fadeIn(500, function(){
                map.invalidateSize();
            });
        }else{
            $("#"+_target).animate({targetDiv: 0}, 1).fadeIn(500);
        }
        $(".expmenuItem").parent().removeClass("active");
        $("a[data-id="+_target+"]").parent().addClass("active");
    }
}

function showhideWrapper(_id){
    $("#btn-"+_id).toggleClass("active");
    $('#'+_id).collapse('toggle')
}




