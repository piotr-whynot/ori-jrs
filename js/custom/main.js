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


function initialize(){
    //just some housekeeping to adjust sizes of divs to the current screen
    console.log("initialize");

    $.get("intro_contents", function(data){
            $('#introContents').append(data);
            console.log("loaded intro_contents");
        },"html"
    );
 
    initializeExplore();


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
            $('#loginContainer').html("<span class=clickable onClick=loginForm()>login</span>&nbsp|&nbsp<span class=clickable onClick=registerForm()>register</span>");
            ownedItems.push([]);
            ownedItems.push([]);
        }else{ //when registered
            ownedItems.push(data[6]);
            ownedItems.push(data[7]);
            if(data[1]=="admin"){
                $('#loginContainer').html("<span class=clickable onClick=window.location.href='./admin/';>admin&nbsppages</span>&nbsp|&nbsp<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your&nbspaccount</span>");
            }else{
                $('#loginContainer').html("<span class=clickable onClick=logoutForm()>logout</span>&nbsp|&nbsp<span class=clickable onClick=updateUserForm()>your account</span>");
            }
            if (ownedItems.length>0){

            }
	    }
	    if (init=="updatePassword"){
             updatePasswordForm(tempPassword);
        }
        populateSources();
    });


// global functions

    $('#floatFaq').on("click", function(){
        pageinPopup(0.5,0.8,"faq_contents","FALSE")
    });

    $(".topmenuItem").on("click", function(){
        target=$(this).data('id');
        if (target=="home"){
            showHome();
        }else if (target=="exploredata"){
            showExplore();
        }else if(target=="downloaddata"){
            showDownload();
        }
    });  
/*
    // scroll indicators
    $('#mainContents').scroll(function() {
        var sTop = $('#mainContents').scrollTop();
        var sBot = -$('#mainContents').scrollTop() - $('#mainContents').height()+$('#mainContents')[0].scrollHeight;
        if ( sTop > 50 ) { 
            $('#fup').fadeIn(1000);
//            $('#faqPointer').hide();
        }else{
//            $('#faqPointer').fadeIn(1000);
            $('#fup').hide();
        }
        if ( sBot > 50 ) { 
            $('#fdown').fadeIn(1000);
        }else{
            $('#fdown').hide();
        }
        $('#floatNav').stop(true, true).show().fadeOut(6000);
    });
*/
    showHome();
//    resizeElements();
}

function showHome(){
    $(".exploreDiv").hide()
    $(".homeDiv").show()
    $("#exploreMenu").hide()
    resizeElements();
}

function showExplore(){
    $(".homeDiv").hide()
    $("#exploreMenu").show()
    scroll2div("sourcesWindow");
}




function initializeExplore(){
    //$('#introHeader').html("<span class=headerText>Okavango monitoring and data sharing</span>");
    $('#sourcesHeader').html("<span class=headerText>Data Sources</span>");
    $('#datasetHeader').html("<span class=headerText>Dataset Info</span>");
    $('#locationHeader').html("<span class=headerText>Location Info</span>");
    $('#figureHeader').html("<span class=headerText>Graphs and Data</span>");
    $('#dataHeader').html("<span class=headerText>Data Editor</span>");
    $('#datasetInfo').html("<p>Select dataset in <span class='clickable' onclick=scroll2div('sourcesWindow')>Data sources</span> panel first</p>");
    $('#locationContents').html("<p>Select location in <span class='clickable navItem'  onclick=scroll2div('datasetWindow')>Dataset</span> panel first</p>");
    $('#figureContents').html("<p>Select variable in  <span class='clickable navItem'  onclick=scroll2div('locationWindow')>Location </span> panel first</p>");
    $('#dataContents').html("<p>Select variable in <span class='clickable navItem'  onclick=scroll2div('locationWindow')>Location</span> panel first</p>");

    txt="<div class='clickable expmenuItem navItem' id=nav-sourcesWindow data-id=sourcesWindow><span>Data sources</span></div>";
    txt+="<div class='clickable expmenuItem navItem' id=nav-datasetWindow data-id=datasetWindow><span>Dataset Info</span></div>";
    txt+="<div class='clickable expmenuItem navItem' id=nav-locationWindow data-id=locationWindow><span>Location Info</span></div>";
    txt+="<div class='clickable expmenuItem navItem' id=nav-figureWindow data-id=figureWindow><span>Graph</span></div>";
    txt+="<div class='clickable expmenuItem navItem' id=nav-dataWindow data-id=dataWindow><span>Data</span></div>";
    $('#exploreMenu').html(txt);
    $('#exploreMenu').show();
    $("#nav-sourcesWindow").addClass("active");
    $("#nav-sourcesWindow").addClass("current");
    $(".expmenuItem").on("click", function(){
        target=$(this).data('id');
        scroll2div(target);
    });
    initializeMap()
    ismap=true;
}






function clickOnMapItem(itemId, dataGroup, datasetID, typeCode) {
    closePopup();
    //fire event 'click' on target layer. Layer here is the clicked marker. 
    currentLayerfireEvent('click');  
}




function showAll(datastreamID, locationID, datasetID, obsType, dBase, varType){
    console.log(dBase);
    scrollTo='datasetWindow';
    scroll2div(scrollTo);

    if (!ismap){
        initializeMap()
        ismap=true;
    }

    showDataset(locationID, datasetID,dBase,varType, obsType, false, 
        function(data){
            if (datastreamID>""){
                showDatastream(datastreamID, false);
                scrollTo='figureWindow';
            }else{
                $('#figureContents').html("Select variable from <span class=clickable onclick=scroll2div('locationWindow') Location </span> panel first");
            }
            if (locationID>""){
                // location to show
                showLocation(locationID, dataGroup, false, false);
            }else{
                $('#locationContents').html("Select location from <span class='clickable' onclick=scroll2div('datasetWindow')> Dataset info </span> panel first");
                $('#figureContents').html("Select variable from <span class='clickable' onclick=scroll2div('locationWindow')>Location info</span> panel first");
            }
            $('#dataContents').html("");
            //console.log("scrolling from all "+scrollTo);
            if (scrollTo){
            }
        }
    );
}





function showDataset(locationID, datasetID,dBase,varType, obsType, scrollTo, callback){
    $("#shade").show();
// dBase - biodivdata or envmondata
// varType - climate etc
// obsType - monitoring, once-off 
// shows dataset in map, highlights selected location if needed, executes scroll and cleanup if needed
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

            if (scrollTo){
                //console.log("scrolling from dataset "+scrollTo);
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
            txt="<div class=infotableDiv id=dsetinfoDiv>";
            txt+="<div class=tableTitle>";
		    txt+=currentDataset['datasetName'];
            txt+="</div>";
		    txt+="<table class='fullwidthTable infoTable'>";
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
                txt+="<div class=centered><span class=clickable onClick=editDataset('"+dataGroup+"','"+currentDataset['datasetID']+"')>edit dataset info</span></div>";
            }
            txt+="</div>";
            txt+="<div class=auxDiv><span class=clickable onClick=downloadAPI('"+dataGroup+"','"+currentDataset['datasetID']+"','','','','')>download entire dataset</span></div>";
            $("#datasetInfo").html(txt);

            listLocationsInDataset(group, datasetID, varType, 'locationsList')

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

    if (dataGroup=="biodivdata") {
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
            if (selfeature.locationType=="monitoring"){
                txt+="<div class=auxDiv><span class=clickable onClick=showBiodivTimeseries('"+locationID+"','figureWindow')>show time series</span></div>";
            }
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
            if (cleanup){
                $('#figureContents').html("Select loctation and variable first");
                $('#dataContents').html("");
            }
            if (scrollTo){
                //console.log("scrolling from location "+scrollTo);
                scroll2div(scrollTo);
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
            txt+="</table>";
            if (ownedItems[0].includes(datasetID) || ownedItems[1].includes(locationID) || userType=="admin"){
                txt+="<div class=centered><span class=clickable onClick=editLocation('"+dataGroup+"','"+selfeature['datasetID']+"','"+selfeature['locationID']+"')>edit location info</span></div>";
            }
            txt+="<div class=auxDiv><span class=clickable onClick=downloadAPI('"+dataGroup+"','','"+alldata['locationID']+"','','','csv')>download data for this location</span></div>";
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
                txt+="<tr><th>Date<th>Data<th></tr>";
                for (i in eventDates){
                    txt+="<tr><td>"+eventDates[i];
                    datestr=eventDates[i].replace(/ /g,"_");
                    //console.log(datestr);
                    txt+="<td><span class=clickable onClick=showEnvmonEvent('"+selfeature.locationID+"','"+datestr+"','figureWindow')>view all data\n at this location</span><td>";
                    if (ownedItems[0].includes(selfeature.datasetID) || ownedItems[1].includes(selfeature.locationID) || userType=="admin"){
                        txt+="<span class=clickable onClick=\"showEnvmonEvent('"+selfeature.locationID+"','"+datestr+"',null); editOnceoffRecords('"+selfeature.datasetID+"','"+selfeature.locationID+"','"+encodeURIComponent(eventDates[i])+"'); \">edit/add data</span>";
                    }
                    txt+="</tr>";
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
                        txt+="<tr><td>"+dstrm.variableName+"</td><td>["+dstrm.variableUnit+"]</td><td>"+dstrm.baseTime+"</td><td>"+firstDatestr+"</td><td>"+lastDatestr+"<td><span class='clickable rf' onClick=\"showDatastream('"+dstrm.datastreamID+"','figureWindow');\" >graph</span>&nbsp&nbsp"; 
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
            if (cleanup){
                $('#figureContents').html("Select location and variable first");
                $('#dataContents').html("");
            }
            if (scrollTo){
                //console.log("scrolling from location "+scrollTo);
                scroll2div(scrollTo);
            }
        });
   }

}



function showBiodivTimeseries(locationID, scrollTo){
    $("#shade").show();
    txt="";
    txt+="<div id=graphWrapper>";
    txt+="<div id=graphControls></div>";
    txt+="<div id=graph></div>";
    txt+="</div>";
    $('#figureContents').html(txt);
        loadBiodivPlot(locationID);
    if(scrollTo){
        scroll2div(scrollTo);    
    }
}


function showDatastream(datastreamID, scrollTo){
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
                txt="";
                txt+="<div id=graphWrapper>";
                txt+="<div id=graphControls></div>";
                txt+="<div id=graph></div>";
                txt+="</div>";
//            console.log(selfeature.properties);
            // there should be only one datastream at this stage...
            dstrm=selfeature['datastreams'];

            $('#figureContents').html(txt);

            graphType="compareyearsnormal";
            graphType="timeseries";
            isFirst=true;
            showcumsum=false;
            //console.log(dstrm[0]);

            if(dstrm[0].variableName=="rainfall" || dstrm[0].variableName=="Rainfall"){
                graphType="compareyearscumsum";
                showcumsum=true;
            }
            if(datastreamID=="dwa1972_mohembo_wdisch"){
                graphType="compareyears";
                showcumsum=true;
            }
            //console.log(datastreamID+" "+graphType+" "+isFirst+" "+showcumsum);
            loadPlot(datastreamID, graphType, isFirst, showcumsum);
        }
    );
    if(scrollTo){
        //console.log("scrolling from datastream "+scrollTo);
        scroll2div(scrollTo);    
    }
}



function showBiodivEvent(ev, scrollTo){
    eventapicall="./api/api_biodiv.php?calltype=data&eventID="+ev;
    //console.log(eventapicall);
    $.get(eventapicall, 
        function(data){
            alldata=JSON.parse(data);
            selfeature=alldata[0];
            //console.log(selfeature);
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
            for (occ in ev.occurrenceData){
                oc=ev.occurrenceData[occ];
                txt+="<tr><td>"+oc.scientificName+"<td>"+oc.organismQuantityType+"<td>"+oc.organismQuantity+"</tr>";
		console.log(oc.measurementOrFact);
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
            //console.log("scrolling from location "+scrollTo);
            scroll2div(scrollTo);
        }
   });
}







function showEnvmonEvent(locationID, evDate, scrollTo){
    evDate=evDate.replace(/_/g," ");
    //console.log(evDate);
    featureapicall="./api/api_envdata.php?calltype=data&locationID="+locationID;
    //console.log(featureapicall);
    $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata[0];

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
            if (scrollTo){
                scroll2div('figureWindow');
            }
        }
    );
}



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






function scroll2div(_target){
    $(".exploreDiv").hide();
    $("#"+_target).show();
    $(".expmenuItem").removeClass("current");
    $("#nav-"+_target).addClass("current");
    if(_target=="datasetWindow"){
        map.invalidateSize();
    }
}



function showAndScroll(_txt, _div2show, _div2scroll){
    $("#"+_div2show).html(_txt);
    $('#'+_div2scroll).get(0).scrollIntoView({
        block: "start",
        behavior: "smooth"
    });
}

function centerLeafletMapOnMarker(marker) {
  var latLngs = marker.getLatLng();
  map.panTo(latLngs);
}




function downloadAPI(_base, _datasetID, _locationID, _baseTime, _datastreamID, _format){
    txt="<h1> Downloading data</h1>";
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
        txt+="&nbsp<span class=clickable onClick=downloadAPI_call('"+apicall+"&calltype=data&format=json','json','"+_datasetID+"','alldata')>download json file </span>";
        txt+="<p>";
        txt+="<p>";
        txt+="<p>";
        txt+="<p>Download data in separate files (<b>csv</b> format)";
        txt+="<p>Occurrence data <span class=clickable onClick=downloadAPI_call('"+apicall+"&calltype=data&format=csv','csv','"+_datasetID+"','occurrence')>csv file</span>";
        txt+="<p>\"Measurement or fact\" data <span class=clickable onClick=downloadAPI_call('"+apicall+"&calltype=mof&format=csv','csv','"+_datasetID+"','measurementorfact')>csv file</span>";

    }else{
        txt+="<p>Entire dataset in ";
        txt+="<span class=clickable onClick=downloadAPI_call('"+apicall+"&calltype=data&format=json','json','"+_datasetID+"','alldata')>json</span>";
        txt+=" or ";
        txt+="<span class=clickable onClick=downloadAPI_call('"+apicall+"&calltype=data&format=csv','csv','"+_datasetID+"','alldata')>csv</span>";
        txt+=" format";
        
    }
    popup(0.9,0.9, txt);
    //alert("not available at the moment");
}


function downloadAPI_call(_apicall,_format,_datasetID,_prefix){
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


function openInNewTab(url){
  var win = window.open(url, '_blank');
  win.focus();
}

function editLocation(_base, _datasetID, _locationID){
    url="./admin/?base="+_base+"&do=edit&table=location&datasetID="+_datasetID+"&locationID="+_locationID;
    openInNewTab(url);
}

function editDataset(_base, _datasetID){
    url="admin/?base="+_base+"&do=edit&table=dataset&datasetID="+_datasetID;
    openInNewTab(url);
}


function resizeElements(){ 
    wh=$(window).height();
    ww=$(window).width();

    tmh=$("#topMenu").height();
    fh=$("#footer").height();
    emh=$("#exploreMenu").height();

    if (wh<ww){
        //landscape
        size="100% auto"; 
        $("#exploreMenu").css({
            "width":80,
            "top": wh/3,
        });
        $("#exploreMenu").addClass("floatRight");
        emh=0
    }else{
        //portrait
        size="auto 100%";
        $("#exploreMenu").css({
            "width":"100%",
        });
        $("#exploreMenu").removeClass("floatRight");
        if($("#introWindow").is(":visible") == true ){
             emh=0;
        }
   }

    ch=wh-tmh-fh-emh-1,
    console.log(wh,tmh,fh,emh);
    $("#mainContents").css({
        "height":ch,
        "width":ww,
    });

    $(".spacer").css({
        "height":ch,
    });

    $("#mapDiv").css({
        "height":0.8*ch,
        "width":ww*0.7,
    });


    $("#introWindow").css({
        "background-size": size,
    });
}


