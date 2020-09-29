//************************************************************************************************************
// submit forms section
//


function validateForm(ado, argstring, returnstr) {
// form validation based on classes of text/textarea fields. This function handles "regular" validation and validation against database entries. The latter is done asynchronously - for that a queue of ajax calls is created, and a function executing these calls is called. Only once that function finishes, the submit function is called. If form validation returns false, submit function does not proceed, but displays warning alert. Otherwise form is submitted using url defined in argstring. On sucessful submision, form is closed and user is redirected to higherlevel page - defined by returnstr.

    if (argstring.includes("biodivdata")){
        base="biodivdata";
    }else{
        base="envmondata";
    }

    console.log("checking nonAjax");
    retvalue=true; //defalt, flips to false, if any check fails
    var queue = []; // array of ajax calls checking against database entries
    $("span.warning").html(""); // resetting warnings
        $("input[type=text]").each(function() {
            // checking each of the input text fields
            console.log(this.name);
            if (this.value.length>this.size){
                $("#"+this.name).html("too long<br>");
                retvalue=false;
            }
            if (this.value.length==0 & $(this).hasClass("nonempty")){
                $("span#"+this.name+"").html("cannot be empty<br>");
                retvalue=false;
            }

            if ($(this).hasClass("numeric") && this.value.length>0 && !$.isNumeric(this.value)){
                $("span#"+this.name+"").html(parseFloat(this.value)+"should be a number<br>");
                retvalue=false;
            }

            //if ($(this).hasClass("nospace") && /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?\ ]/g.test(this.value)){
            if ($(this).hasClass("nospace") && /[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?\ ]/g.test(this.value)){
                $("span#"+this.name+"").html("there should be no spaces or special characters<br>");
                retvalue=false;
            }

            if ($(this).hasClass("mustexist")){
                queue.push({file: 'checkID.php', data: {item: this.name, check: 'mustexist', base: base, value:this.value }});
            }

            if ($(this).hasClass("mustexistorempty")){
                if(this.value>""){
                    queue.push({file: 'checkID.php', data: {item: this.name, check: 'mustexist', base: base, value:this.value }});
                }
            }

            if ($(this).hasClass("unique") && ado=='add'){
                queue.push({file: 'checkID.php', data: {item: this.name, check: 'unique', base: base, value:this.value }});
            }

            if ($(this).hasClass("unique") && this.name=='emailAddress' && ado=="edit"){
   		        userID=$("input[name=userID]").val();
                queue.push({file: 'checkEmail.php', data: {item: this.name, check: 'unique', value:this.value, userID: userID}});
            }

            if ($(this).hasClass("unique") && this.name=='emailAddress' && ado=="add"){
                queue.push({file: 'checkEmail.php', data: {item: this.name, check: 'unique', value:this.value}});
            }
            console.log(retvalue);
        });

        $("textarea").each(function() {
            // checking textarea fields. Textareas are not supposed to be checked against the database entries, so there is no construction of the queue here.
            console.log(this.name);
            if (this.value.length>this.size){
                $("#"+this.name).html("too long");
                retvalue=false;
            }
            if (this.value.length==0 & $(this).hasClass("nonempty")){
                $("span#"+this.name+"").html("cannot be empty<br>");
                retvalue=false;
            }
            console.log(retvalue);
        });

        // running ajax checks
        console.log("checking Ajax "+queue.length);
        if (queue.length>0){
            runAjaxChecks(queue, 0, function(){
                console.log("checks done(1):", retvalue, argstring, returnstr);
                submitForm(argstring, returnstr)
            });
        }else{
            // if there were no ajax checks
            console.log("checks done(2): ", retvalue, argstring, returnstr);
            submitForm(argstring, returnstr);
        }
}



function runAjaxChecks(queue, i, callback) {
    ii=i+1;
    console.log('running: '+i+' out of: '+queue.length);
    console.log(queue[i]);
    $.ajax({
        type: 'GET',
        url: queue[i].file,
        data: (queue[i].data),
        success: function(response) {
            //response is true if ID exists, false if it doesn't
            console.log("checkID...\n");
            console.log(response);
            console.log("_");
            if (response=='false' & queue[i].data.check=='mustexist'){
                $("span#"+queue[i].data.item+"").html("ID must exist in the database already<br>");
                retvalue=false;
            }
            if (response=='true' & queue[i].data.check=='unique'){
                $("span#"+queue[i].data.item+"").html("this field must be unique, and this one already exists in the database<br>");
                retvalue=false;
            }
            if (response=="error"){
                $("span#"+queue[i].data.item+"").html("Unexpected error ocurred... try again<br>");
                retvalue=false;
            }
            if (i<queue.length-1){
                runAjaxChecks(queue, ii, callback);
            }else{
                callback();
            }
        },
        error: function(response) {
            console.log("error");
            $("span#"+queue[i].data.item+"").html("Something went seriously wrong... We are terribly sorry. Please let us know what were you trying to do.<br>");
            retvalue=false;
            if (i<queue.length-1){
                runAjaxChecks(queue, ii, callback);
            }else{
                callback();
            }
        }
    });
}


function submitForm(argstring, returnstr){
// this submits form asynchronously, using post command and form serialization
    console.log(retvalue);
    if (retvalue){
         console.log("attempting submit...");
         $.post("./submit.php?"+argstring, $('#form').serialize(), function(data) {
             console.log(data);
             if(data=="success"){
                 alert("submit successful");
                 window.location = returnstr;
             }else{
                 alert("Something didn't work. Try again.\n"+data);
             }
        });
   }else{
        alert("There are errors in the form. Check, correct and submit again.");
   }
}


function uploadPhoto(){
    retval=true;
    aform=document.querySelector("#form");
    var fdata=new FormData(aform);
    var file = document.getElementById('fileToUpload').files[0];
    console.log(file, file.size);
    if(file && file.size > 2097152) {
        txt="Sorry. File too big. Max allowed size is 2 MB (2097152 Bytes). Yours is "+file.size+" bytes!";
        retval=false;
        $("span#associatedMedia").html(txt+"<br>");
    }else{
        $.ajax({
            url: "uploadMedia.php", 
            type: "POST",             
            data: fdata,
            contentType: false,       
            cache: false,             
            processData:false, 
            success: function(data) {
                     data=JSON.parse(data);
                     if(data[0]==1){
                         alert("Photo checked and stored on the server successfully\nNote that you still need to save changes to upload the photo to the database");
                         $("span#associatedMedia").html("");
                         txt="<input type=hidden name=associatedMedia class='none' value='"+data[1]+"'>";
                         txt+="<img width=400px src='"+data[1]+"'><br><input type=button onClick='removePhoto()' value='Remove this photo'>";
                         $("#associatedMediaDiv").html(txt);
                     }else{
                         $("span#associatedMedia").html(data[1]+"<br>");
                     }
            }
        });
    }
}


function removePhoto(){
    txt="<input type=hidden name=associatedMedia class='none' value=''>";
    txt+="<input type='file' name='fileToUpload' id='fileToUpload' onChange=activateUpload()><input type='button' id=uploadButton value='Upload photo' onClick='uploadPhoto()' disabled>";
    $("#associatedMediaDiv").html(txt);
}


function activateUpload(){
    $('#uploadButton').removeAttr('disabled');
    $("span#associatedMedia").html("");
}

//************************************************************************************************************
function editAnyInPopup(database, datasetID, locationID, locationType, baseTime, datetime){
    if (database=='env'){
        if (locationType=='monitoring'){
            editMonitoringRecords(datasetID, locationID, baseTime);
        }else{
            editOnceoffRecords(datasetID, locationID, datetime);
        }
    }
}



//************************************************************************************************************
// envmon onceoff section
//


function editOnceoffRecords(datasetID, locationID, datetime){
    datetime=decodeURIComponent(datetime);

    // create table with all datastreams in columns
    apicall="./api/api_envdata.php?calltype=data&datasetID="+datasetID+"&locationID="+locationID

    $.get(apicall,
    function(data0){
        console.log(apicall);
        alldata=JSON.parse(data0);
        datastreams=alldata[0].datastreams;
        locationName=alldata[0].locationName;
        datasetID=alldata[0].datasetID;
        txt="<div class=infotableDiv id=recordsinfoDiv>";
        txt+="<div class=tableTitle>";
        txt+=locationName;
        txt+="</div>";
        txt+="<table class='fullwidthTable infoTable'>";
        txt+="<tr><td class=infoLabel width=50%>dataset ID:<td width=50%>"+datasetID+"</tr>";
        txt+="<tr><td class=infoLabel>Location ID:<td>"+locationID+"</tr>";
        txt+="</table>";
        txt+="</div>";

        // getting all dates for which data are available in any datastream for given locationID and datasetID
        dates=new Array();
        for (dstrm in datastreams){
            dstrm=datastreams[dstrm];
            //console.log(dstrm);
            for (data in dstrm.data){
                data=dstrm.data[data];
                dates.push(data[0]);
            }
        }
        dates=$.unique(dates);
        dates=dates.sort();

        // creating a select box with all dates;
        txt+="<div class=auxDiv>";
        txt+="Select date: ";
        txt+='<select id=dateSelect>';
        for (i in dates){
            txt+="<option value="+i+">"+dates[i]+"</option>";
        }
        // increases index to accommodate add new data option
        last=parseInt(i)+1;
        txt+="<option value="+last+">add new date</option>";
        txt+='</select>';
        // datetime picker. Located in empty span so that it shows in neat position
        txt+="<span id=datepicker></span>";
        txt+="</div>";

        txt+="<div class=listtableDiv id=records_table></div>";
        showAndScroll(txt,"dataContents","dataWindow");

        // this happens only once when loading
        populateOnceoffRecords(datasetID, locationID);

        // jquery functions
        $("#datepicker").datetimepicker({
            format: "dd MM yyyy - hh:ii",
            autoclose: 1,
        }).on('changeDate', function(ev){
            newDate=formatDate(ev.date);
            //newDate = new Date (timestamp);
            $('#dateSelect option[value='+last+']').text(newDate);
            last=last+1;
            $('#dateSelect').append($('<option>', {value:last, text:'add new date'}));        
            populateOnceoffRecords(datasetID, locationID);
        });

        $("#dateSelect").on('change', function(ev){
            indx=ev.target.value;
            if (indx==last){
                $("#datepicker").datetimepicker('show');
            }else{
                populateOnceoffRecords(datasetID, locationID);
            }
        });
    });
}


function populateOnceoffRecords(datasetID, locationID){
    datetime=$("#dateSelect option:selected").text();
    console.log(datetime);
    $.get("./api/api_envdata.php?calltype=data&datasetID="+datasetID+"&locationID="+locationID,
    function(data0){
        data0=JSON.parse(data0);
        datastreams=data0[0].datastreams;
        var d= new Date(datetime);
        // unix timestamp
        timestamp=Math.round(d.getTime() / 1000); 
        txt='';
        txt+="<table class='narrowTable dataTable'>"
        txt+="<tr><th>variable name<th>Unit<th>Value";
        //txt+="<th>QC code<th>Censored code";
        txt+="</tr>";
        for (dstrm in datastreams){
            dstrm=datastreams[dstrm];
            txt+="<tr><td>"+dstrm.variableName+"<td>["+dstrm.variableUnit+"]";
            txt+="<td class=Cell><input type=text name="+dstrm.datastreamID+"~~"+timestamp+"~~measurementValue onChange='return chkDigits(this);' onkeypress='GetChar(event, this);'>";
//            txt+="<td class=Cell><input type=text name="+dstrm.datastreamID+"~~"+timestamp+"~~qcCode onChange='return chkDigits(this);' onkeypress='GetChar(event, this);'>";
//            txt+="<td class=Cell><input type=text name="+dstrm.datastreamID+"~~"+timestamp+"~~censoredCode onChange='return chkDigits(this);' onkeypress='GetChar(event, this);'>";
        }
        txt+="</table>";

        $("#records_table").html(txt);
        if(datetime){
            // populate table - get data for given month
            apicall="./api/api_envdata.php?calltype=data&datasetID="+datasetID+"&locationID="+locationID+"&datetime="+datetime;
            console.log(apicall);
            $.get(apicall,
            function(data){
                data=JSON.parse(data);
                console.log(data);
                console.log(data[0].datastreams);
                if (data[0].datastreams.length>0){
                    datastreams=data[0].datastreams;
                    for (dstrm in datastreams){
                        dstrm=datastreams[dstrm];
                        for (record in dstrm.data){
                            record=dstrm.data[record];
                            var d= new Date(record[0]);
                            // unix timestamp
                            timestamp=Math.round(d.getTime() / 1000); 
                            cellID=dstrm.datastreamID+"~~"+timestamp+"~~measurementValue";
                            $("input[name='"+cellID+"']").val(record[1]);
                            //cellID=dstrm.datastreamID+"~~"+timestamp+"~~qcCode";
                            //$("input[name='"+cellID+"']").val(record[2]);
                            //cellID=dstrm.datastreamID+"~~"+timestamp+"~~censoredCode";
                            //$("input[name='"+cellID+"']").val(record[3]);
                        }
                    }
                }
            });
        }
    });
}


function formatDate(dte){
    var dte= new Date(dte);
    m=dte.getMonth()+1
    if (m<10){m="0"+m;}
    d=dte.getDate()
    if (d<10){d="0"+d;}
    h=dte.getHours()
    if (h<10){h="0"+h;}
    i=dte.getMinutes()
    if (i<10){i="0"+i;}
    dstr=dte.getFullYear()+"-"+m+"-"+d+" "+h+":"+i+":00";
    return dstr
}







//************************************************************************************************************
// envmon monitoring section
//


function populateMonitoringRecords(datasetID, locationID, baseTime){
    console.log(datasetID, locationID);
    if (baseTime=="daily"){
        // Date asssumes that string in locale datetime, and it converts it to UTC datetime
        d= new Date("15 "+$("#datepicker").val()+" UTC");
        m=d.getMonth();
        month=parseInt(m)+1;
        year=d.getFullYear();
        console.log(d, month, year);
        // create data table - needs to be re-created at every date change
        var fd= new Date(year+" "+month+" 01 UTC");
        m=fd.getMonth()+1;
        var ld = new Date(fd.getFullYear(), m, 0);
        fdstr=date2str(fd);
        ldstr=date2str(ld);
        console.log(fdstr, ldstr);
	// reading all datastreams for location
        console.log("./api/api_envdata.php?calltype=datastream&datasetID="+datasetID+"&locationID="+locationID);
        $.get("./api/api_envdata.php?calltype=datastream&datasetID="+datasetID+"&locationID="+locationID,
        function(data0){
	    //console.log(data0);
            data0=JSON.parse(data0);
            datastreams=data0[0].datastreams;
            txt='';
            w=0.9*$(window).width();
            txt+="<table class='narrowTable dataTable'>";
            // populating table header rows
            // first and last record to be shown in current table
            var fd= new Date(year+"-"+month+"-01");
            var ld = new Date(fd.getFullYear(), fd.getMonth() + 1, 0);
            txt+="<tr><th>Day";
            datesrow="<tr><td>first:<br>last:";
            for (dstrm in datastreams){
                dstrm=datastreams[dstrm];
                txt+="<th>"+dstrm.variableName+"<br>["+dstrm.variableUnit+"]";
                // first and last record in the database
                var fmeasd= new Date(dstrm.firstMeasurementDate);
                fmeasdstr=date2str(fmeasd);
                var lmeasd= new Date(dstrm.lastMeasurementDate);
                lmeasdstr=date2str(lmeasd);
                datesrow+="<td>"+fmeasdstr+"<br>"+lmeasdstr;
            }
            txt+="</tr>";
            datesrow+="</tr>";
            txt+=datesrow;
            //create empty table
            var curdate=new Date(fd);
            while (curdate<=ld){
                // unix timestamp
                timestamp=Math.round(curdate.getTime() / 1000);
                m=curdate.getMonth()+1
                dstr=curdate.getFullYear()+"-"+m+"-"+curdate.getDate();
//                console.log(curdate, timestamp);
                txt+="<tr>";
                txt+="<td class=Cell>"+dstr;
                for (dstrm in datastreams){
                    dstrm=datastreams[dstrm];
                    txt+="<td class=Cell><input type=text size=6 name="+dstrm.datastreamID+"~~"+timestamp+"~~measurementValue onChange='return chkDigits(this);' onkeypress='GetChar(event, this);' >";
                }
                curday=curdate.getDate();
                curday=curday+1;
                var curdate = new Date(curdate.getFullYear(), curdate.getMonth(), curday);
            }
            txt+="</table>";
            $("#records_table").html(txt);

            //populate cells with actual data

            console.log("./api/api_envdata.php?calltype=data&datasetID="+datasetID+"&locationID="+locationID+"&startdate="+fdstr+"&enddate="+ldstr);
            $.get("./api/api_envdata.php?calltype=data&datasetID="+datasetID+"&locationID="+locationID+"&startdate="+fdstr+"&enddate="+ldstr,
            function(data){
                data=JSON.parse(data);
                if (data.length>0){
                    datastreams=data[0].datastreams;
                    for (dstrm in datastreams){
                        alldata=datastreams[dstrm].data;
                        datastreamID=datastreams[dstrm].datastreamID;
                        for (data in alldata){
                            var curdate=new Date(alldata[data][0]);
                            // unix timestamp
                            timestamp=Math.round(curdate.getTime() / 1000); 
                            console.log(curdate, timestamp);
                            $("input[name='"+datastreamID+"~~"+timestamp+"~~measurementValue']").val(parseFloat(alldata[data][1]));
                        }
                        txt='';
                    }
                }
            });
        });
    }// end if baseTime==daily
}


function editMonitoringRecords(datasetID, locationID, baseTime){
    apicall="./api/api_envdata.php?calltype=location&locationID="+locationID;
    console.log(apicall);
    $.get(apicall, function(data){
    console.log(data);
        alldata=JSON.parse(data);
        locationName=alldata.features[0].properties.locationName;        
        datasetID=alldata.features[0].properties.datasetID;        
        // populates fixed elements of the data editing popup
        txt="<h3 class=text-center>"+locationName+"</h3>";
        txt+="<table class='infoTable narrowTable'>";
        txt+="<tr><td class=infoLabel width=50%>dataset ID:<td width=50%>"+datasetID+"</tr>";
        txt+="<tr><td class=infoLabel>Location ID:<td>"+locationID+"</tr>";
        txt+="<tr><td class=infoLabel>Base time:<td>"+baseTime+"</tr>";
        txt+="</table>";

        txt+="<div class=text-center>Select date:<input type=text id=datepicker onChange=populateMonitoringRecords('"+datasetID+"','"+locationID+"','"+baseTime+"')></div>"; 
        txt+="<div class=listtableDiv id=records_table></div>";
        showAndScroll(txt,"dataContents","dataWindow");
        console.log(baseTime);
        if (baseTime=="daily"){
            months = new Array("January", "February","March","April","May","June","July","August","September","October","November","December");
            d= new Date();
            curm=d.getMonth();
            console.log(curm);
            cury=d.getFullYear();
            curm=curm+1;
            curdatestr=months[curm-1]+" "+cury;

            // this will need to be repeated for different basetimes

            $("#datepicker").datetimepicker({
                format: "MM yyyy",
                startView: 'year',
                minView: 'year',
                autoclose: 1
           });

       }
       $("#datepicker").val(curdatestr);
       populateMonitoringRecords(datasetID, locationID, baseTime);
   });
}



function date2str(dte){
    var dte= new Date(dte);
    m=dte.getMonth()+1
    if (m<10){m="0"+m;}
    d=dte.getDate()
    if (d<10){d="0"+d;}
    dstr=dte.getFullYear()+"-"+m+"-"+d;
    return dstr
}

function GetChar (event, object){
    var chCode = ('charCode' in event) ? event.charCode : event.keyCode;
    if (chCode==13){
//    alert ("The Unicode character code is: " + chCode);
        chkDigits(object);
//        $(object).blur();
    }
}


function chkDigits(object){
    variables = object.name.split("~~"); 
    first_arr= variables[0]; 
    new_first_arr = first_arr.split("_"); //cell name 
    last_on_firstvariable = new_first_arr[new_first_arr.length-1];
    if(!(last_on_firstvariable == 'metadata')){ 
        if (isNaN(object.value)){
            alert("Please enter numbers only");
            $(object).focus();
            $(object).val("");
            return false;
        }
    }
    uploadCell(object);
    return true;
}


function uploadCell(object){
    objvariables = object.name.split("~~");
    datastreamID = objvariables[0];
    date = objvariables[1];
    field = objvariables[2];
    newval=object.value;    
    url = "./admin/updateCell.php?base=env&table=measurement&value="+newval+"&datastreamID="+datastreamID+"&date="+date+"&field="+field;
    console.log(object.name, field, date, newval, datastreamID);
    console.log(url);
    $.get(url,
        function(data){
            if(data!=""){
                console.log("a"+data+"a");
                alert(data);
            }
        $(object).blur();
    });
}



//************************************************************************************************************
// biodiv section

function editOccurrences(){
    var datasetID = $("input[name='datasetID']").val();
    var locationID = $("input[name='locationID']").val();
    var eventID = $("input[name='eventID']").val();
    console.log(datasetID, locationID);
    // create data table
    $('#records_table').html("<center style='font-size:14px; color:lightgrey;'><img src='../img/ajax-loader.gif'><br><b>Loading...</b></center>");
    console.log("./api/api_biodiv.php?calltype=data&datasetID="+datasetID+"&locationID="+locationID+"&eventID="+eventID);
    $.get("./api/api_biodiv.php?calltype=data&datasetID="+datasetID+"&locationID="+locationID+"&eventID="+eventID,
    function(data){
            data=JSON.parse(data);
            occurrences=data[0].events[0].occurrenceData;
            txt='';
            w=0.9*$(window).width();
            txt+="<div style='width: "+w+"px; overflow: auto'>";
            txt+="<form>";
            txt+="<table style='table-layout: fixed; white-space: nowrap;' id=occur>";
            txt+="<tr><th>Occurrence ID<th>Taxon ID<th>Organism quantity<th>Organism Quantity Typei<th></tr>";
            i=0;
            for (occur in occurrences){
                occur=occurrences[occur];
                //console.log(occur);
                txt+="<tr id=row"+i+"><td><span id=occurrenceID_"+i+" class=warning></span><input size=35 ype=text name=occurrenceID_"+i+" value="+occur.occurrenceID+" class='nonempty'><td><span id=taxonID_"+i+" class=warning></span><input type=text name=taxonID_"+i+" size=8 value="+occur.taxonID+" class='nonempty mustexist'><td><span id=organismQuantity_"+i+" class=warning></span><input type=text name=organismQuantity_"+i+" size=8 value="+occur.organismQuantity+" class=nonempty><td><span id=organismQuantityType_"+i+" class=warning></span><input type=text name=organismQuantityType_"+i+" value="+occur.organismQuantityType+" class=nonempty><td><span class=clickable onClick=removeRow("+i+")>remove</span></tr>";
                i+=1;
            }
            txt+="</table>";
            txt+="</form>";
            $('#records_table').html(txt);
            txt="<input id=ocount name=ocount type=hidden value="+i+"><br>";
            $('#extras').html(txt);
       });


}

function removeRow(n){
    $("#row"+n).remove();
}



function addRow(){
    n=$("#ocount").val();
   txt="<tr id=row"+n+"><td><input type=text name=occurrenceID_"+n+" value="+"><td><input type=text name=taxonID_"+n+" size=8 value="+"><td><input type=text size=8 name=organismQuantity_"+n+" value="+"><td><input type=text name=organismQuantityType_"+n+" value="+"><td><span onClick=removeRow("+n+")>remove</span></tr>";
    $("table").append(txt);
    n=parseInt(n)+1;
    $("#ocount").val(n);
}







