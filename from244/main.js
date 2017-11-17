function populateSideMenu(){
    login('loginform');


    //calls this, but that php should be merged with other api functions into a single function
    $.get("api_menu.php",
        function(data){
           // console.log(data);
            topmenuarr=JSON.parse(data);
            txt="<ul class='topnav'>";
	          txt+="";
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
        featureapicall=apicall0+"&calltype=datastream&locationID="+feature.properties.locationID;
        $.get(featureapicall, 
        function(data){
            //console.log(featureapicall);
            alldata=JSON.parse(data);
            selfeature=alldata.features[0];
            txt="<div class=popupDataStreamInfo>"
            txt+="<h1>Location info:</h1>";
            txt+="<table width=300px>";
            for (key in selfeature.properties){
                if ( key != "datastreams"){
                    txt+="<tr><td>"+key+"<td>"+selfeature.properties[key]+"</tr>";
                }
            }
            txt+="</table>";
            txt+="<h1>Available variables:</h1>";
            txt+="<table width=600px>";  
            txt+="<tr><th>Name</th><th>Unit</th><th>Type</th><th>Time period</th><th></th></tr>"; 
            for (dstrm in selfeature.properties['datastreams']){
                dstrm=selfeature.properties['datastreams'][dstrm];
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
                    txt+="<tr><td>"+dstrm.variableName+"</td><td>["+dstrm.variableUnit+"]</td><td>"+dstrm.baseTime+"</td><td>"+firstDatestr+"-"+lastDatestr+"<td><span onClick=showMonitoringDataStreamInPopup('"+dstrm.datastreamID+"','"+firstDate+"','"+lastDate+"') class='clickable rf'>view</span></td></tr>"; 
                }else{
                    txt+="<tr><td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]<td>"+dstrm.baseTime+"<td><span onClick=showDataStreamInPopup('"+dstrm.datastreamID+"') class='clickable rf'>view</span></tr>"; 
                } 
            }
            txt+="</table>";
            txt+="</div>";
            layer.bindPopup(txt,{maxWidth: "650px"}).openPopup();
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
            //console.log(selfeature);
            txt="<div class=eventInfo>"
                txt+="<h1>Location:"+"</h1>";
                txt+="<table>";
                txt+="<tr><td>"+selfeature.properties.locationID+"</tr>";
                txt+="</table>";
                txt+="<h1>Sampling events:"+"</h1>";
                for (ev in selfeature.properties['events']){
                    txt+="<h2>date:"+ev.eventDate+"</h2>";  
                    txt+="<table>";
                    ev=selfeature.properties['events'][ev];
                    txt+="<tr><td>protocol:<td>"+ev.samplingProtocol+"</tr>";
                    txt+="<tr><td>sampling size:<td>"+ev.sampleSizeValue+" "+ev.sampleSizeValueUnit+"</tr>";
                    txt+="<tr><td>remarks:<td>"+ev.eventRemarks+"</tr>";
                    txt+="<tr><td>recorded by: <td>"+ev.recordedBy+"</tr>";
                    txt+="</table>";
                    txt+="<h3>Ocurrence records</h3>";
                    for (oc in ev.ocurrenceData){
                        oc=ev.ocurrenceData[oc];
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



function showMonitoringDataStreamInPopup(ds,firstDate,lastDate){
// when one clicks on "view" in leaflet popup. this is for envmon data of monitoring type
// popup to show stuff with is not leaflet popup, its the "full screen popup"
// shows time series plots
    firstDate=firstDate.replace(/_/g," ");
    lastDate=lastDate.replace(/_/g," ");
//    console.log(firstDate+lastDate);
    console.log(ds);
    eventapicall="./api_envdata.php?calltype=datastream&datastreamID="+ds;
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
function content(action,contentID){ //id is the contentID in text table

    if(action=='view'){alert(action);
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
	    .done(function(data) {alert(data);
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


function login(login){ 

    if(login=="login"){ 
        username = $('input[name=uname]').val();
        pwd = $('input[name=psw]').val();
        if(username !="" && pwd!=""){
	    var formData = {
              'action': 'login',
	      'username': $('input[name=uname]').val(),
	      'password': $('input[name=psw]').val()
	    };
          }else{

              $('#errors').html("Username and/or Password cannot be blank!");
          }
     }
    if(login=='loginform'){
        //Remove the element before it could be added from the form
        $(".modal-content").remove();
	    var formData = {
              'action': 'loginForm',
	      'status': 'login'
	      
	    };        
    } console.log(formData);
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
                var dataArray = data.split('_');
                      if(dataArray[0]=='islogged'){//There is a session which already existed
                          $('#login_menu').html(dataArray[1]);  
                      }
		      if(dataArray[0]=='true'){//If the user has successfully logged on
		          $('#login_menu').html("<a href='#' onClick='logout()'>Log Out</a>");
		          disablePopup();
		          location.reload();
		      }
                      if(dataArray[0]=='false'){  //console.log(dataArray[1]);
                          if(dataArray[1]!=""){
                              $('#errors').html(dataArray[1]);       
                           }
                              $('#login_menu').html(" <a href='#' onClick=login('loginform')>Log In</a>"); //alert($("#form-table").length);
                          //If the form is already on the pop it shouldn't be loaded again
                         // if($(".modal-content").length!=1){
                            if(login='loginform'){
                            // $('.modal-content').remove(); 
                              popup(0.4,0.6, dataArray[1]);
                             }
                         // }
		         // $('#errors').html("Username or password incorrect!");
		      
		      }
		  // here we will handle errors and validation messages 
	    });
                                                                                            
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
	    .done(function(data) {//alert(data);
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
	    .done(function(data) { console.log(data);
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
                 $('#login_menu').html(" <a href='#' onClick=login('loginform')>Log In</a>");
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
