function populateSideMenu(){
    //calls this, but that php should be merged with other api functions into a single function
    $.get("api_menu.php",
        function(data){
            topmenuarr=JSON.parse(data);
            txt="<ul class='topnav'>";
            for (topg in topmenuarr){
                topGroupName=topmenuarr[topg].groupName; 
                txt=txt+"<li><div class=menuitem id=topgroup"+topg+">"+topGroupName+"</div>";
                txt=txt+"<ul>";
                menuarr=topmenuarr[topg].data;
                for (g in menuarr){
                    groupName=menuarr[g].groupName;
                    groupCode=menuarr[g].groupCode;
                    txt=txt+"<li><div class=menuitem id=group"+groupCode+">"+groupName+"</div>";
                    txt=txt+"<ul>"; 
                    for (tp in menuarr[g].dataTypes){
                        typeName=menuarr[g].dataTypes[tp].typeName;
                        typeCode=typeName.replace(/ /g, "_");
                        txt=txt+"<li><div class=menuitem id=type"+tp+">"+typeName+"</div>";
                        txt=txt+"<ul>";
                        //alert(type);
                        for (d in menuarr[g].dataTypes[tp].datasets){
                            datasetName=menuarr[g].dataTypes[tp].datasets[d].datasetName;
                            // alert(datasetName);
                            txt=txt+"<li><div class=menuitem><span id=marker-"+groupCode+"-"+d+"-"+typeCode+"></span><label>"+datasetName+"<input type=checkbox id="+groupCode+"-"+d+"-"+typeCode+" onClick=showhideDataset(\""+groupCode+"\",'"+d+"','"+typeCode+"')></label></div></li>";
                        }
                        txt=txt+"</ul>";
                        txt=txt+"</li>";
                    }
                    txt=txt+"</ul>";
                    txt=txt+"</li>";
                }    
                txt=txt+"</ul>";
                txt=txt+"</li>";
            }
            txt=txt+"</ul>";
            $("#sideMenuWindow").html(txt); //alert(txt);
            $(".topnav").accordion({
                accordion:false,
                speed: 500,
                closedSign: '<svg height="16" viewBox="0 0 6 16" width="6"><path fill-rule="evenodd" d="M0 14l6-6-6-6z"></path></svg>',
                openedSign: '<svg height="16" viewBox="1 0 12 16" width="12"><path fill-rule="evenodd" d="M0 5l6 6 6-6z"></path></svg>'
            });
        }
    );
}

function showhideDataset(group, datasetID, typeCode){
// changed by Piotr on 20170331
// shows and hide datasets from the main menu
// needs to be richer. For example, should allow displaying all datasets for a given data type with one click
//
//    alert(dataGroup+datasetID+typeCode);
//    alert($('#'+group+"-"+datasetID+"-"+typeCode).prop('checked'));
    dataGroup=group;
    if( $('#'+dataGroup+"-"+datasetID+"-"+typeCode).prop('checked')){
        typeName=typeCode.replace(/_/g," ");
        if (dataGroup=="biodiv"){
            apicall='./api_biodiv.php?datasetID='+datasetID+"&popularGroup="+typeName+"";
        }else{
            apicall='./api_envdata.php?datasetID='+datasetID+"&variableType="+typeName+"";
        }
//       alert(apicall);
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
                $('#marker-'+dataGroup+"-"+datasetID+"-"+typeCode).html("<img src=img/marker"+n+".svg>");
                alldata=JSON.parse(data);
                var geoJSONLayer = L.geoJSON(alldata, {
                    pointToLayer: function(feature, latlng) {
                        return L.marker(latlng, {icon: smallIcon});
                    },
                    onEachFeature: onEachFeature
                }).addTo(map);
                //pointOverlays is a global array that stores currently displayed layers
                pointOverlays[dataGroup+"-"+datasetID+"-"+typeCode]=geoJSONLayer; 
                $("#shade").hide();
            }
        );
    }else{
        // not sure if it wouldnt be better to hide the overlay... but let's remove it for the time being
        map.removeLayer(pointOverlays[dataGroup+"-"+datasetID+"-"+typeCode]);
        delete pointOverlays[dataGroup+"-"+datasetID+"-"+typeCode];
        $('#marker-'+dataGroup+"-"+datasetID+"-"+typeCode).html("");
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
      populatePopup(feature,layer); 
      layer.removeEventListener('mouseout', closePopup);
    });
    layer.on('mouseover', function (e) {
      txt=feature.properties.locationName;
      layer.bindPopup(txt).openPopup();
      layer.addEventListener('mouseout', closePopup);
    });
}

function populatePopup(feature,layer){
//makes leaflet popup that appears when one clicks on marker
    apicall0=feature.properties.apicall;
    dataGroup=feature.properties.dataGroup;
    if (dataGroup=="biodiv") {
        //  biodiv
        featureapicall=apicall0+"&calltype=event&locationID="+feature.properties.locationID;
        $.get(featureapicall, 
        function(data){
//            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=popupLocInfo>"
            for (key in selfeature.properties){
                if ( key != "events"){
                    txt=txt+key+":"+selfeature.properties[key]+"<br>";
                }else{
                    txt=txt+"Sampling events:"+"<br>";
                    for (ev in selfeature.properties['events']){
                         ev=selfeature.properties['events'][ev];
                        txt=txt+"<ul>";  
                        txt=txt+"<li>date: "+ev.eventDate+"<span onClick=showEventInPopup('"+ev.eventID+"') class='clickable rf'>view</span></li>";  
                        txt=txt+"<ul><li>protocol:"+ev.samplingProtocol+"</li>";
                        txt=txt+"<li>recorded by: "+ev.recordedBy+"</li></ul>";
                        txt=txt+"</ul>";
//                        console.log(ev);
                    }
                }
            }
            txt=txt+"</div>";
            layer.bindPopup(txt).openPopup();
        });
    }else{
        // this is when dataGroup=='envdata';
        featureapicall=apicall0+"&calltype=datastream&locationID="+feature.properties.locationID;
        $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=popupDataStreamInfo>"
            for (key in selfeature.properties){
                if ( key != "datastreams"){
                    txt=txt+key+":"+selfeature.properties[key]+"<br>";
                }else{
                    txt=txt+"Measurements:"+"<br>";
                    for (ds in selfeature.properties['datastreams']){
                        ds=selfeature.properties['datastreams'][ds];
                        txt=txt+"<ul>";  
                        if (selfeature.properties.locationType=="monitoring"){
                            firstDate=ds.firstMeasurementDate.replace(/ /g,"_");
                            lastDate=ds.lastMeasurementDate.replace(/ /g,"_");
                            txt=txt+"<li>"+ds.variableName+" ["+ds.variableUnit+"] "+ds.baseTime+"<span onClick=showMonitoringDataStreamInPopup('"+ds.datastreamID+"','"+firstDate+"','"+lastDate+"') class='clickable rf'>view</span></li>"; 
                        }else{
                            txt=txt+"<li>"+ds.variableName+" ["+ds.variableUnit+"] "+ds.baseTime+"<span onClick=showDataStreamInPopup('"+ds.datastreamID+"') class='clickable rf'>view</span></li>"; 
                        } 
                        txt=txt+"</ul>";
                    }
                }
            }
            txt=txt+"</div>";
            layer.bindPopup(txt).openPopup();
        });
    }
}


function showEventInPopup(ev){
// when one clicks on "view" in leaflet popup. this is for biodiv data
// popup to show stuff with is not leaflet popup, its the "full screen popup"
    eventapicall="./api_biodiv.php?calltype=data&eventID="+ev;
    $.get(eventapicall, 
        function(data){
//            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=eventInfo>"
            for (key in selfeature.properties){
                if ( key != "events"){
                    txt=txt+key+":"+selfeature.properties[key]+"<br>";
                }else{
                    txt=txt+"Sampling event:"+"<br>";
                    for (ev in selfeature.properties['events']){
                        ev=selfeature.properties['events'][ev];
//                        console.log(ev);
                        txt=txt+"<ul>";  
                        txt=txt+"<li>date: "+ev.eventDate+"</li>";  
                        txt=txt+"<li>protocol:"+ev.samplingProtocol+"</li>";
                        txt=txt+"<li>sampling size:"+ev.sampleSizeValue+" "+ev.sampleSizeValueUnit+"</li>";
                        txt=txt+"<li>remarks:"+ev.eventRemarks+"</li>";
                        txt=txt+"<li>recorded by: "+ev.recordedBy+"</li>";
                        txt=txt+"<li>ocurrence records:</li>";
                        txt=txt+"<ul>";
                        for (oc in ev.ocurrenceData){
                            oc=ev.ocurrenceData[oc];
                            txt=txt+"<li>"+oc.scientificName+"</li>"
                            txt=txt+"<ul>";
                            txt=txt+"<li>"+oc.organismQuantityType+" :"+oc.organismQuantity+"</li>";
                            for (mf in oc.measurementOrFact){
                                mf=oc.measurementOrFact[mf];
                                txt=txt+"<li>"+mf.measurementType+": "+mf.measurementValue+": "+mf.measurementUnit+"</li>";
                            }
                            txt=txt+"</ul>";
                        }
                        txt=txt+"</ul>";
                     }
                }
            }
        // this directs output to "full screen popup" 
        popup(0.9,0.9, txt);
   });
}


function showDataStreamInPopup(ds){
// when one clicks on "view" in leaflet popup. this is for envmon data of non-monitoring type
// popup to show stuff with is not leaflet popup, its the "full screen popup"
// just shows a table of data, no graph
    eventapicall="./api_envdata.php?calltype=data&datastreamID="+ds;
    $.get(eventapicall, 
        function(data){
//            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=dataStreamInfo>"
//            console.log(selfeature.properties);
            for (key in selfeature.properties){
                if ( key != "datastreams"){
                    txt=txt+key+":"+selfeature.properties[key]+"<br>";
                }else{
                    txt=txt+"Data stream:"+"<br>";
                    for (ds in selfeature.properties['datastreams']){
//                        console.log(ds);
                        ds=selfeature.properties['datastreams'][ds];
//                        console.log(ds);
                        txt=txt+"<ul>";  
                        txt=txt+"<li>variable: "+ds.variableName+" ["+ds.variableUnit+"]</li>";  
                        txt=txt+"<li>base time:"+ds.baseTime+"</li>";
                        txt=txt+"<li>data:</li>";
                        txt=txt+"<ul>";
                        for (dt in ds.data){
                            dt=ds.data[dt];
//                            console.log(dt);
                            tstamp=dt[0];
                            txt=txt+"<li>"+dt[0]+": "+dt[1]+"</li>"
                        }
                        txt=txt+"</ul>";
                     }
                }
            }
        // this directs output to "full screen popup" 
        popup(0.9,0.9, txt);
   });
}

function showMonitoringDataStreamInPopup(ds,firstDate,lastDate){
// when one clicks on "view" in leaflet popup. this is for envmon data of monitoring type
// popup to show stuff with is not leaflet popup, its the "full screen popup"
// shows time series plots
    firstDate=firstDate.replace(/_/g," ");
    lastDate=lastDate.replace(/_/g," ");
//    console.log(firstDate+lastDate);

    eventapicall="./api_envdata.php?calltype=data&datastreamID="+ds+"&startdate="+firstDate+"&enddate="+lastDate;
    $.get(eventapicall, 
        function(data){
            console.log(eventapicall);
            alldata=JSON.parse(data); 
            selfeature=alldata.features[0];
            txt="<div class=dataStreamInfo>"
            //console.log(alldata.features[0][0][0].properties);
            for (key in selfeature.properties){
                if ( key != "datastreams"){
                    txt=txt+key+":"+selfeature.properties[key]+"<br>";
                }else{
                    txt=txt+"Monitoring Data Stream:"+"<br>";
                    for (ds in selfeature.properties['datastreams']){
                        console.log(ds);
                        ds=selfeature.properties['datastreams'][ds];
                       // console.log(ds);
                        txt=txt+"<ul>";  
                        txt=txt+"<li>variable: "+ds.variableName+" ["+ds.variableUnit+"]</li>";  
                        txt=txt+"<li>base time:"+ds.baseTime+"</li>";
                        txt=txt+"</ul>";  
                        txt=txt+"<div id=graph>";
                        txt=txt+"</div>";
                        // need to reshape data array
                        chartdata=[];
                        for (i in ds.data){
                            chartdata.push([Date.parse(ds.data[i][0]),parseFloat(ds.data[i][1])]);
                        }
                        console.log(chartdata);
                     }
                }
            }
        // this directs output to "full screen popup" 
        popup(0.9,0.9, txt);
        plotchart("graph",chartdata);
   });
}


function plotchart(divname,data){// alert(alldata[0][1]);
// console.log(alldata.features[0].properties["datastreams"][0]["variableName"]);
 
// this is a strawdog function. it needs to be seriously expanded:
// - limit of time (we don't want to pull 8 years of 5 minute data)
// - what follows - ability to define time range
// - abilty to plot various chart types - line, bar, cumulative line graph. The easiest is to leave the choice which type to the user.
// - choice of time series and year-by-year comparison
// - different starts of the year - again, easiest is to leave choice to the user
// - indicating seasons on time series, through a grey background for rainy season
//

    //these need to be picked from api before this function is called, and passed to this function
    variablesArray=alldata.features[0].properties["datastreams"][0];

    measuring_unit=variablesArray["variableUnit"];
    dateformat='%b %Y';
    variablename=variablesArray["variableName"];
    station=alldata.features[0].properties["locationName"];
    enableMarker="true";
    lineWidth=2;
    gtype="line";
    chart = new Highcharts.StockChart({
        chart: {renderTo: divname, zoomType: 'xy'},
        credits: {text: '(C) Okavango Research Insitute & wolski@csag.uct.ac.za', enabled: true, href: 'http://www.ori.ub.bw'},
        tooltip: { valueDecimals: 2,
	    formatter: function() {
                var s = variable;
	        $.each(this.points, function(i, point) {				
                    s += '<br>' + Highcharts.dateFormat(dateformat, this.x) + ', '+ point.y+" ["+measuring_unit+"]";
                });
	        return s;			
            },
            shared: true				
        }, 
        navigator: {enabled: false},
        rangeSelector: {inputEnabled: false, buttons: [{type: 'all', text: 'All'}]},
        xAxis: {type: 'datetime', ordinal: false, dateTimeLabelFormats: {month: dateformat}, showLastLabel: true},
        yAxis: {title: {text: variablename+" ["+measuring_unit+"]"}, offset: 30, labels:{align: 'right', x: 0, y: 0},  min:0},
        title: {text: ('<span class=texttransform>'+variablename+'</span> @ '+station).bold()},
        plotOptions: {series: {marker: {enabled: enableMarker, symbol:"circle", radius: 3}, lineWidth: lineWidth}, line: {dataGrouping: {enabled:false}}, column: {dataGrouping: {enabled:false}, pointWidth: 2}},
        series: [{name: variablename, type: gtype, data: data}] 
    });
}




//Function to be used by x-editable
function editContent(id){ //id is the contentID in text table
    $.fn.editable.defaults.mode = 'inline'; // Can be set to popup or inline
    $('.editable-field').editable({
        type: 'textarea',
        pk: id,
        url: '/php_functions.php?f=editContent&pk='+id,
       // url: '/test.php',
        success: function(response, newValue) { //i don't know what this does at the moment
            if(response.status == 'error') return response.msg; //msg will be shown in editable form
        }
     }); 
}

