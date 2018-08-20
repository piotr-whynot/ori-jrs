function populateSideMenu(){
// does what it promisses and more - e.g. loads login form/welcome screen, perhaps should be rename to initialize
//    popup(0.9,0.9, "welcome text, logos, login link, close button");
//    loginFunctions('loginForm');

    //calls this, but that php should be merged with other api functions into a single function
    apicall="/api/api_menu.php";
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
                            txt+="<li><div class=menuitem><span class=markerHolder id=marker-"+groupCode+"-"+d+"-"+typeCode+"></span><label><span class=checkboxLabel>"+datasetName+"</span><input class=menuCheckbox type=checkbox id="+groupCode+"-"+d+"-"+typeCode+" onClick=showhideDataset(\""+groupCode+"\",'"+d+"','"+typeCode+"')></label></div></li>";
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
            $("#sideMenuWindow").html(txt).hide();
            wh=$(window).height()*0.9;
            $("#sideMenuWindow").css("max-height", wh+"px");
            $(".topnav").accordion({
                accordion:false,
                speed: 500,
                closedSign: '<svg height="16" viewBox="0 0 6 16" width="6"><path fill-rule="evenodd" d="M0 14l6-6-6-6z"></path></svg>',
                openedSign: '<svg height="16" viewBox="1 0 12 16" width="12"><path fill-rule="evenodd" d="M0 5l6 6 6-6z"></path></svg>'
            });

            $("#sideMenuSymbol").click(function(){
                $("#sideMenuWindow").toggle('slide',{direction: "right" });
            });
 
        }
    );
}



function showhideDataset(group, datasetID, typeCode){
// shows and hide datasets from the main menu
// needs to be richer. For example, should allow displaying all datasets for a given data type with one click
//
//    alert(group+datasetID+typeCode);
//    alert($('#'+group+"-"+datasetID+"-"+typeCode).prop('checked'));
    dataGroup=group;
    if( $('#'+dataGroup+"-"+datasetID+"-"+typeCode).prop('checked')){
        typeName=typeCode.replace(/_/g," ");
        if (dataGroup=="biodiv"){
            apicall='/api/api_biodiv.php?datasetID='+datasetID+"&popularGroup="+typeName+"";
        }else{
            apicall='/api/api_envdata.php?datasetID='+datasetID+"&variableType="+typeName+"";
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
                $('#marker-'+dataGroup+"-"+datasetID+"-"+typeCode).html("<img src=img/marker"+n+".svg width=22>");
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
// what happens when one hovers over marker in a map, or clicks on it
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
      populateFirstPopup(feature,layer); 
      layer.removeEventListener('mouseout', closePopup);
    });
    layer.on('mouseover', function (e) {
      txt=feature.properties.locationName;
      layer.bindPopup(txt, {maxWidth: "auto"}).openPopup();
      layer.addEventListener('mouseout', closePopup);
    });
}





function populateFirstPopup(feature,layer){
//makes leaflet popup that appears when one clicks on a marker
    apicall0=feature.properties.apicall;
    dataGroup=feature.properties.dataGroup;
    if (dataGroup=="biodiv") {
        //  biodiv
        featureapicall=apicall0+"&calltype=event&locationID="+feature.properties.locationID;
        console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=popupLocInfo>"
            txt+="<h1>Location:</h1>";
            txt+="<table width=400px>";
            for (key in selfeature.properties){
                if ( key != "events"){
                    txt+="<tr><td>"+key+":<td>"+selfeature.properties[key]+"</tr>";
                }
            }
            txt+="</table>";
            txt+="<h1>Sampling events:</h1>";
            txt+="<table width=400px>";
            for (ev in selfeature.properties['events']){
                ev=selfeature.properties['events'][ev];
                txt+="<tr><td>date: <td>"+ev.eventDate+"<td><span onClick=showEventInPopup('"+ev.eventID+"') class='clickable rf'>view</span></tr>";  
                txt+="<tr><td>protocol:<td>"+ev.samplingProtocol+"</tr>";
                txt+="<tr><td>recorded by:<td>"+ev.recordedBy+"</tr>";
            }
            txt+="</table>";
            txt+="</div>";
            layer.bindPopup(txt).openPopup();
        });
    }else{
        // this is when dataGroup=='envdata';
        featureapicall=apicall0+"&calltype=data&locationID="+feature.properties.locationID;
        console.log(featureapicall);
        $.get(featureapicall, 
        function(data){
            console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=popupDataStreamInfo>"
            // Location info
            txt+="<h1>Location info:</h1>";
            txt+="<table width=300px>";
            for (key in selfeature.properties){
                if ( key != "datastreams"){
                    txt+="<tr><td>"+key+"<td>"+selfeature.properties[key]+"</tr>";
                }
            }
            txt+="</table><br>";
            // base times or events
            if (selfeature.properties.locationType=="monitoring"){
                //monitoring
                txt+="<h1>Measurement frequencies:</h1>";
                baseTimes=new Array();
                for (dstrm in selfeature.properties['datastreams']){
                    dstrm=selfeature.properties['datastreams'][dstrm];
                    if ($.inArray(dstrm.baseTime, baseTimes)==-1){
                        baseTimes.push(dstrm.baseTime);
                    }
                }
                txt+="<table width=580px>";  
                for (i in baseTimes){
                    txt+="<tr><td>"+baseTimes[i];
                    // this will need to be dependent on access rights
                    txt+="<td><span class=clickable onClick=editMonitoringRecordsInPopup('"+selfeature.properties.datasetID+"','"+selfeature.properties.locationID+"','"+dstrm.baseTime+"')>edit/add data</span>";
                }
                txt+="</table>";
            }else{
                //onceoff
                txt+="<h1>Measurement events:</h1>";
                // this will need to be dependent on access rights
                eventDates=new Array();
                for (dstrm in selfeature.properties['datastreams']){
                    data=selfeature.properties['datastreams'][dstrm].data;
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
                    txt+="<td><span class=clickable onClick=editOnceoffRecordsInPopup('"+selfeature.properties.datasetID+"','"+selfeature.properties.locationID+"','"+encodeURIComponent(eventDates[i])+"')>edit/add data</span>";
                    console.log("editOnceoffRecordsInPopup('"+selfeature.properties.datasetID+"','"+selfeature.properties.locationID+"','"+eventDates[i]+"')");
                }
                txt+="</table>";
            }

            //variables
            txt+="<h1>Available variables:</h1>";
            
            txt+="<div style='height:200px; overflow-y:auto; width:600px;'>";  
            txt+="<table width=580px>";  
            txt+="<tr><th>Name</th><th>Unit</th><th>Type</th><th>Time period</th><th></th></tr>"; 
            for (dstrm in selfeature.properties['datastreams']){
                dstrm=selfeature.properties['datastreams'][dstrm];
console.log(selfeature.properties.locationType);
                if (selfeature.properties.locationType=="monitoring"){
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
                    txt+="</td></tr>";
                }else{
                    txt+="<tr><td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]<td>"+dstrm.baseTime+"<td><span onClick=showOnceoffDatastreamInPopup('"+dstrm.datastreamID+"') class='clickable rf'>view</span>&nbsp&nbsp"; 
                    txt+="</td></tr>";
                } 
            }
            txt+="</table>";
            txt+="</div>";  
            txt+="</div>";
            layer.bindPopup(txt,{maxWidth: "650px"}).openPopup();
        });
   }
}




function showEventInPopup(ev){
// when one clicks on "view" in leaflet popup. this is for biodiv data
// popup to show stuff with is not leaflet popup, its the "full screen popup"
    eventapicall="/api/api_biodiv.php?calltype=data&eventID="+ev;
    $.get(eventapicall, 
        function(data){
            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            console.log(selfeature);
            txt="<div class=eventInfo>"
                txt+="<h1>Location:"+"</h1>";
                txt+="<table>";
                txt+="<tr><td>"+selfeature.properties.locationID+"</tr>";
                txt+="</table>";
                txt+="<h1>Sampling events:"+"</h1>";
                for (ev in selfeature.properties['events']){
                    ev=selfeature.properties['events'][ev];
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
    eventapicall="/api/api_envdata.php?calltype=data&datastreamID="+ds;
    $.get(eventapicall, 
        function(data){
//            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=dataStreamInfo>"
//            console.log(selfeature.properties);
            txt+="<h1>Location info:</h1>";
            txt+="<table width=400px>";
            for (key in selfeature.properties){
                if ( key != "datastreams"){
                    txt+="<tr><td>"+key+":<td>"+selfeature.properties[key]+"</tr>";
                }
            }
            txt+="</table>";
            txt+="<h1>Observations:</h1>";
            txt+="<table width=400px>";
            for (dstrm in selfeature.properties['datastreams']){
//              console.log(ds);
                dstrm=selfeature.properties['datastreams'][dstrm];
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
    eventapicall="/api/api_envdata.php?calltype=datastream&datastreamID="+ds;
    $.get(eventapicall, 
        function(data){
            console.log(eventapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=dataStreamInfo>"
//            console.log(selfeature.properties);
            txt+="<h1>Location info:</h1>";
            txt+="<table width=400px>";
            for (key in selfeature.properties){
                if ( key != "datastreams"){
                    txt+="<tr><td>"+key+"<td>"+selfeature.properties[key]+"</tr>";
                }
            }
            txt+="</table>";
            txt+="<h1>Monitoring Data:</h1>";
            txt+="<table width=400px>";
            // there should be only one datastream at this stage...
            for (dstrm in selfeature.properties['datastreams']){
//              console.log(ds);
                dstrm=selfeature.properties['datastreams'][dstrm];
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






//Function to be used by x-editable
/*
// this appears to be old one
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
*/


function content(action,contentID){ 
    //id is the contentID in text table
    if(action=='view'){
        alert(action);
        var formData = {
            'action': 'content',
	    'contentID': contentID
	};       
    }
    if(action=='edit'){

    }
    var formdata = JSON.stringify(formData);
    $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url  : 'admin.php', // the url where we want to POST
        data  : {data : formdata}, // our data object
        dataType  : 'json', // what type of data do we expect back from the server
        encode  : true
    })
    // using the done promise callback
    .done(function(data) {alert(data);
        console.log(data);
    }); 
}




function editContentForm(){
    username = $('input[name=uname]').val();
     //pwd = $('input[name=psw]').val();
    if(username!="" && pwd!=""){
        var formData = {
            'action': 'editContent',
            'username': $('input[name=uname]').val(),
	};
        var formdata = JSON.stringify(formData);// data is converted to string before being sent to the server
        //preventDefault();
        //console.log('Form data '+formData['password']);//alert(formdata);
        // process the form
        $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url  : 'admin.php', // the url where we want to POST
            data  : {data : formdata}, // our data object
            dataType  : 'json', // what type of data do we expect back from the server
            encode  : true
        })
        // using the done promise callback
        .done(function(data){
            alert(data);
            console.log(data);
            if(data=='true'){	          
                //$('#login_menu').html("<a href='#' onClick='logout()'>Log Out</a>");
                disablePopup();
                location.reload();
            }else{
                $('#errors').html("Username or password incorrect!");	      
            }
            // here we will handle errors and validation messages 
        });
        //from submitting the normal way and refreshing the page
        //event.preventDefault();
    }  
}



function loginFunctions(action){
    console.log(popupStatus); 
    if (popupStatus==0){
        txt="<span id=logo></span><div class=header>Okavango Delta Monitoring & Forecasting Portal</div>";
        txt+="<div id=loginForm class='container'>";
        txt+="</div>";
        popup(0.4,0.6,txt);
    }
    if(action=="login"){ 
        userName = $('input[name=userName]').val();
        pwd = $('input[name=pwd]').val();
        if(userName !="" && pwd!=""){
            var formData = {
              'action': 'login',
              'userName': userName,
              'password': pwd
            };
            var formdata = JSON.stringify(formData);// data is converted to string before being sent to the server
            // process the form
            $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url  : 'admin.php', // the url where we want to POST
                data  : {data : formdata}, // our data object
                dataType  : 'json', // what type of data do we expect back from the server
                encode  : true
            })
            .done(function(data){
                console.log("login:");
                console.log(data);
                var dataArray = data;
                console.log(dataArray['isloggedin']);
                if(dataArray['isloggedin']){ 
                    //login successful
                    txt="You are logged in as...<br>";
                    txt+="<button type='button' onClick=disablePopup() >OK, bring me to data</button>";
                    $("#loginForm").html(txt);
                }else{
                    $("#errors").html("username or password do not match. Try again.");
                }
            });                                                                                     
        }else{
            $('#errors').html("Username and/or Password cannot be blank!");
        }
    }
    if(action=='loginForm'){
        var formData = {
            'action': 'loginCheck',
        }; 
        console.log(formData);
        var formdata = JSON.stringify(formData);// data is converted to string before being sent to the server
        // process the form
        $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url  : 'admin.php', // the url where we want to POST
            data  : {data : formdata}, // our data object
            dataType  : 'json', // what type of data do we expect back from the server
            encode  : true
        })
        .done(function(data){
            console.log("loginCheck:");
            console.log(data);
            //var dataArray = JSON.parse(data); 
            var dataArray = data;
            console.log(dataArray['isloggedin']);
            
            if(dataArray['isloggedin']){ 
                //There is a session which already existed
                txt="You are logged in as... Would you like to log out?<br>";
                txt+="<button type='button' onClick=loginFunctions('logout') >Yes</button>";
                txt+="<tr><td></td><td><button type='button' onClick=disablePopup() >Cancel</button> || ";
            }else{
                txt="<table id=form-table><form class='modal-content animate'>"; 
                txt+="<tr><td><td><div id='errors'></div></td></tr>";
                txt+="<tr><td><label><b>Username:</b></label></td>";
                txt+="<td><input type='text' placeholder='Enter Username' name='userName' required><br /></td></tr>";
                txt+="<tr><td><label><b>Password:</b></label></td>";
                txt+="<td><input type='password' placeholder='Enter Password' name='passwd' required><br /></td></tr>";
                txt+="<tr><td></td><td><button type='button' onClick=loginFunctions('login') >Login</button></tr>";
                txt+="<tr><td><td><input type='checkbox' name=rememberMe> Remember me</tr>";
                txt+="<tr><td></td><td><span>Forgot <a href=# onClick=loginFunctions('resetPasswordForm')>password?</a></span></td></tr>";           
                txt+="<tr><td></td><td><a href=# onClick=loginFunctions('registerForm')>Register</a></td></td></tr>";
                txt+="</form></table>";
           }
           $("#loginForm").html(txt);
        });                                                                                      
    }
    if(action=='resetPasswordForm'){
        txt="<form class='modal-content animate' >";
        txt+="<div id='errors'></div>";
        txt+="<div id='info'>Reset password will be sent to your email for the username provided below.</div>";
        txt+="<label><b>Username:  </b></label>";
        txt+="<input type='text' placeholder='Enter Username' name='uname' required><br />";
        txt+="<button type='button' onClick=loginFunctions('resetPassword') >Reset</button>";
        txt+="<tr><td></td><td><button type='button' onClick=disablePopup() >Cancel</button> || ";
        txt+="</form>";
        $("#loginForm").html(txt);
    }
    if(action=='registerForm'){
        txt="<table><form class='modal-content animate' >";
        txt+= "<div class='container'>";
        txt+="<tr><td></td><td><div id='errors'></div></td></tr>";
        txt+="<tr><td><label><b>Firstname:  </b></label></td>";
        txt+="<td><input type='text' placeholder='Enter Firstname' name='fname' required></td></tr>";
        txt+="<tr><td><label><b>Lastname:  </b></label></td>";
        txt+="<td><input type='text' placeholder='Enter Lastname' name='lname' required></td></tr>";
        txt+="<tr><td><label><b>Email Address:  </b></label></td>";
        txt+="<td><input type='email' placeholder='Enter Email Adress' name='email' required></td></tr>";
        txt+="<tr><td><label><b>Password:  </b></label></td>";
        txt+="<td><input type='password' placeholder='Enter Password'  name='psw' required></td></tr>";
        txt+="<tr><td><label><b>Confirm Password:  </b></label></td>";
        txt+="<td><input type='password' placeholder='Confirm Password'  name='psw1' required></td></tr>";
        txt+="<tr><td><label><b>Organisation/Institution:  </b></label></td>";
        txt+="<td><input type='text' placeholder='Enter Organisation/Institution represented' name='lname' required></td></tr>";
        txt+="<tr><td></td><td><button type='button' onClick=disablePopup() >Cancel</button> || ";
        txt+="<button type='button' onClick=loginFunctions('register') >Submit</button></td></tr>";
        txt+="</div>";
        txt+="</form></table>";
        $("#loginForm").html(txt);
    }
}


function resetPassword(action){
    if(action=='loadform'){ 
        var formData = {
            'action': 'resetPassword',
            'what':'loadform'
        };
    }
    if(action=='reset'){
        username=$('input[name=uname]').val();
        var formData = {
            'action': 'resetPassword',
            'what':'reset',
            'username': $('input[name=uname]').val()
        };
//alert(action);
    }
     // var reset = {'action':'resetPassword'}
    var resetData = JSON.stringify(formData);
    $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url  : 'admin.php', // the url where we want to POST
        data  : {data : resetData}, // our data object
        dataType  : 'json', // what type of data do we expect back from the server
        encode  : true
    })
    // using the done promise callback
    .done(function(data) {
        //alert(data);
        if(action=='loadform'){
            disablePopup();
            popup(0.3,0.5, data);
        }
        if(action=='reset'){
            if(username=="" || username == null){
                $('#errors').html('Username field cannot be empty!');        
            }else{
                if(data=='success'){
                    $(document).ready(function(){
                        $('<div id=notification>Email has been sent, Check you email</div>').insertAfter('#popupWindow');
                        $('#notification').delay(3000).fadeOut("slow");
                    });
                    disablePopup();
                }else{
                    $('<div id=notification>'+data+'</div>').insertAfter('#popupWindow');
                    $('#notification').delay(3000).fadeOut("slow");
                }
                //$('#header').append('<div id=notification>Email has been sent, Check you email</div>').show().delay(10000).hide();
            }
            if(data!='success'){
                $('#errors').html(data);
            }
        }
        console.log(data);
        location.reload;
        if(data='success'){
            //$('#signin_menu').css('display','none'); 
        }
        // here we will handle errors and validation messages 
    });
}





function editUser(action){
    if(action=='view'){
    }
    if(action=='edit'){
    }
    username = $('input[name=uname]').val();
    pwd = $('input[name=psw]').val();
    if(username!="" && pwd!=""){ 
        var formData = {
            'action': 'editUser',
            'username': $('input[name=uname]').val(),
            'password': $('input[name=psw]').val()
        };
        var formdata = JSON.stringify(formData);// data is converted to string before being sent to the server
        //preventDefault();
        //console.log('Form data '+formData['password']);//alert(formdata);
        // process the form
        $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url  : 'admin.php', // the url where we want to POST
            data  : {data : formdata}, // our data object
            dataType  : 'json', // what type of data do we expect back from the server
            encode  : true
        })
        // using the done promise callback
        .done(function(data) {
             //console.log(data);
             if(data=='true'){
                 //$('#login_menu').html("<a href='#' onClick='logout()'>Log Out</a>");
                 //disablePopup();
                 //location.reload();
             }else{
                 $('#errors').html("Error occured and change not saved!");     
             }
             // here we will handle errors and validation messages 
        });
        //from submitting the normal way and refreshing the page
        //event.preventDefault();
    }
}




function register(action){
    if(action=='register'){
        validate=true;
        firstname=$('input[name=uname]').val();
        lastname=$('input[name=lname]').val();
        username=$('input[name=lname]').val();
        email=$('input[email=uname]').val();
        password=$('input[name=psw]').val();
        organisation=$('input[name=institute]').val();
        if(validate===register('validate')){
            alert('done');  
        }
        var formData = {
            'action': 'register',
            'what':'register'
        };
    }
    if(action=='loadform'){validate=true;
        var formData = {
            'action': 'register',
            'what':'loadform'
        };
    }
    if(action=='loadform' || action =='register'){
        //var act = {'action':actioninfo};
        var regData = JSON.stringify(formData); 
        $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url  : 'admin.php', // the url where we want to POST
            data  : {data : regData}, // our data object
            dataType  : 'json', // what type of data do we expect back from the server
            encode  : true
        })
        // using the done promise callback
        .done(function(data){
            console.log(data);
            if(action=='loadform'){
                disablePopup();
                popup(0.7,0.5,data);
            }
            //location.reload();
            if(data='success'){
               //$('#signin_menu').css('display','none'); 
            }
            // here we will handle errors and validation messages 
        });
    }
    if(action=='validate'){
        return true;
    }
}




function logout(){ //call a php function to unset sessions
    //alert('logout');
    var logOut = {'action':'logout'}
    var logOutData = JSON.stringify(logOut);
    $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url  : 'admin.php', // the url where we want to POST
        data  : {data : logOutData}, // our data object
        dataType  : 'json', // what type of data do we expect back from the server
        encode  : true
    })
    // using the done promise callback
    .done(function(data) {//alert(data);
         //console.log(data);
         //This element existed when the form was created
         // it has to be remove in order to successfully show the form again
         //$("#form-table").remove();
         $('#login_menu').html(" <a href='#' onClick=loginFunctions('loginForm')>Log In</a>");
         location.reload();
         if(data='success'){
              //$('#signin_menu').css('display','none'); 
         }
         // here we will handle errors and validation messages 
    });
}



function adminMenu(action){
    if(action=='list'){//alert(action);
        var formData = {
            'action': 'adminContent',
            'what':'list'
        };
    }
    if(action=='view'){
    }
    var adminData = JSON.stringify(formData); 
    $.ajax({ type : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url  : 'admin.php', // the url where we want to POST
        data  : {data : adminData}, // our data object
        dataType  : 'json', // what type of data do we expect back from the server
        encode  : true
    })
    // using the done promise callback
    .done(function(data) { console.log(data);
        if(action=='list'){
            //disablePopup();
            popup(0.4,0.9,data);
        }
        //location.reload();
        if(data='success'){            
        }
        // here we will handle errors and validation messages 
    });
}               
