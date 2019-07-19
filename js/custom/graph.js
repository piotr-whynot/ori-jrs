function loadPlot(datastream, graphType, isFirst, showcumsum){
// find first and last date of record and other information from metadata call
    ds=datastream;
    eventapicall="./api/api_envdata.php?calltype=datastream&datastreamID="+ds;
    //console.log(eventapicall);
    //console.log(isFirst);
    if (isFirst){
    //populates graph controlbox
        txt="<div id=graphMenu><div class=graphMenuItem id=timeseries>Show one long time series</div>";
        if (showcumsum){
            txt+="<div class='graphMenuItem' id=compareyearscumsum>Show year-by-year cumulative</div>";
        }
        txt+="<div class=graphMenuItem id=compareyearsnormal>Show year-by-year</div></div><hr><div id=graphMenuAux></div>";
        $('#graphControls').html(txt);
    }

    $.get(eventapicall,
        function(data){
            alldata=JSON.parse(data);
            console.log(alldata[0]);
            //metadata=alldata.features[0].properties.datastreams[0];
            metadata=alldata[0].datastreams[0];
            firstDate=metadata.firstMeasurementDate;
            lastDate=metadata.lastMeasurementDate;
            a = new Date(lastDate);
            ly=a.getFullYear();
            a = new Date(firstDate);
            fy=a.getFullYear();
            // function that plots
            measuringUnit=metadata.variableUnit;
            variableName=metadata.variableName;
            locationName=alldata[0].locality;
            if(graphType=="compareyearscumsum"){
                prepareChart_compareyears("graph", ds, fy, ly, measuringUnit, variableName, locationName, "cumsum")
                txt="<b> Highlight years:</b><br>";
                for (var y = fy; y <= ly; y++) {
                    txt=txt+"<input type='checkbox' name='years' onclick='showhideYear(this)' value="+y+" />"+y+" <br/>"
                }
                $('#graphMenuAux').html(txt);
                $('#compareyearscumsum').addClass('current');
            }
            if(graphType=="compareyearsnormal"){
                prepareChart_compareyears("graph", ds, fy, ly, measuringUnit, variableName, locationName, "normal")
                txt="<b> Highlight years:</b><br>";
                for (var y = fy; y <= ly; y++) {
                    txt=txt+"<input type='checkbox' name='years' onclick='showhideYear(this)' value="+y+" />"+y+" <br/>"
                }
                $('#graphMenuAux').html(txt);
                $('#compareyearsnormal').addClass('current');
            }
            if(graphType=="timeseries"){
                prepareChart_timeseries("graph", ds, fy, ly, measuringUnit, variableName, locationName, "normal")
                $('#graphMenuAux').html("");
                $('#timeseries').addClass('current');
            }
        }
    );

}





function getData(ds, firstDateString, lastDateString, seriesType, dateType, callback){
// reads data from api for a given year, calculates cumsum and adjusts dates to be in 1970
    apidatacall="./api/api_envdata.php?calltype=data&datastreamID="+ds+"&startdate="+firstDateString+"&enddate="+lastDateString;
    //console.log(apidatacall);
    $.get(apidatacall, 
        function(data){
            // this will be a geojson objest with a number of columns. It needs to be processed
            data=JSON.parse(data);
            // now we get data only
            console.log(data[0].datastreams[0]);
            data=data[0].datastreams[0].data;
            // this will be returned
            outdata= new Array();
            if (dateType=="sameyear"){
                //process dates so that year is 1970, and date is expressed in miliseconds since 1 Jan 1970
                for(var i=0, len=data.length; i < len; i++){
                    dte=new Date(data[i][0]);
                    dte.setFullYear(1970);
                    if (i==0){
                        //if first data point is not 1st Jan, adds that date with zero value
                        if((dte.getDay()!=1 || dte.getMonth()!=1) && seriesType=="cumsum"){
                            current=0
                            d = new Date("1970-01-01");
                            ar=[d.valueOf(), current];
                            outdata.push(ar);
                        }else{
                            current=parseFloat(data[i][1]);
                        }
                    }else if(seriesType=="cumsum"){
                        current = current+parseFloat(data[i][1]);
                    }else{
                        current = parseFloat(data[i][1]);
                    }
                    ar=[dte.valueOf(), current];
                    outdata.push(ar);
                }
                callback(outdata);
            }else{
                //process dates so that year is 1970, and date is expressed in miliseconds since 1 Jan 1970
                for(var i=0, len=data.length; i < len; i++){
                    dte=new Date(data[i][0]);
                    ar=[dte.valueOf(), parseFloat(data[i][1])];
                    outdata.push(ar);
                }
                callback(outdata);
            }
        }
    )   
}



function prepareChart_compareyears(divname,ds,fy,ly, measuringUnit, variableName, locationName, seriesType){
// populates
    dateFormat='%b %Y';
    enableMarker="true";
    lineWidth=4;
    // creates chart
    chart=createChart_compareYears(divname, variableName, measuringUnit, locationName, enableMarker, lineWidth)
    // creates series of years
    var yrs = [];
    for (var y = fy; y <= ly; y++) {
        yrs.push(y);
    }


    $.each(yrs, function(i,yr){
        firstDateString=yr+"-01-01"
        lastDateString=yr+"-12-31"
        //5th argument takes "sameyear" - which makes all data points have same year, or "normal", which is, well, normal 
        getData(ds, firstDateString, lastDateString, seriesType, "sameyear", function(retoutdata){
            chart.addSeries({id: yr, name: yr, data: retoutdata, color: "#999999", showInLegend:false});
        });
    });

    txt=""
    for (var y = fy; y <= ly; y++) {
        txt=txt+"<input type='checkbox' name='years' onclick='showhideYear(this)' value="+y+" />"+y+" <br/>"
    }
    $('#graphMenuAux').html(txt);
}



function prepareChart_timeseries(divname,ds,fd,ld, measuringUnit, variableName, locationName, seriesType){
    enableMarker="true";
    lineWidth=4;
    // creates chart
    chart=createChart_timeseries(divname, variableName, measuringUnit, locationName, enableMarker, lineWidth)
    // show series
    getData(ds, fd, ld, seriesType, "normal", function(retoutdata){
            chart.addSeries({id: variableName, name: variableName, data: retoutdata, color: "#999999"});
        });
    $('#graphMenuAux').html("");
}




function showhideYear(item){
colours=["#654b8b","#8f9500","#613cae","#01c89c","#630070","#fb6e48","#dcb5ff","#803900","#ff6cbf","#8f0023"]
    $.each(chart.series, function(i,s){
        if(s.name==item.value.toString()){
            if(item.checked){
                j=i%10;
                s.options.color=colours[j];
                s.options.showInLegend=true;
                s.update(s.options);
            }else{
                s.options.color="#888888";
                s.options.showInLegend=false;
                s.update(s.options);
            }
        }
    });
}




function createChart_compareYears(divname, variableName, measuringUnit, locationName, enableMarker, lineWidth){
//creates empty chart. all chart formatting defined here
    chart = new Highcharts.StockChart({
        chart: {renderTo: divname, zoomType: 'xy', marginRight: 0},
        legend: {
            enabled:true,
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            floating: true
        },
        credits: {text: '(C) Climate System Analysis Group, University of Cape Town', enabled: true, href: 'http://www.csag.uct.ac.za'},
        tooltip: { valueDecimals: 2,
	    formatter: function() {
                var s = variableName;
	        $.each(this.points, function(i, point) {				
                yrlabel=point.series.name;
                    s += '<br>' + Highcharts.dateFormat('%b, %e ', this.x) + ', '+ yrlabel +': '+ point.y+" ["+measuringUnit+"]";
                });
	        return s;			
            },
            shared: true				
        },
        scrollbar: {enabled: false}, 
        navigator: {enabled: false},
        rangeSelector: {enabled: false},
        xAxis: {type: 'datetime', ordinal: false, dateTimeLabelFormats: {month: '%e. %b'}, showLastLabel: true},
        yAxis: {title: {text: variableName+" ["+measuringUnit+"]"}, offset: 30, labels:{align: 'right', x: 0, y: 0},  min:0},
        title: {text: (locationName).bold()},
        plotOptions: {series: {marker: {enabled: enableMarker, symbol:"circle", radius: 3}, lineWidth: lineWidth}, line: {dataGrouping: {enabled:false}}, column: {dataGrouping: {enabled:false}, pointWidth: 2}},
        series: [] 
    });
    return chart;
}




function createChart_timeseries(divname, variableName, measuringUnit, locationName, enableMarker, lineWidth){
    dateFormat='%b %Y';
//creates empty chart. all chart formatting defined here
    chart = new Highcharts.StockChart({
        chart: {renderTo: divname, zoomType: 'xy', marginRight: 0},
        legend: {
            enabled:false,
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            floating: true
        },
        credits: {text: '(C) Climate System Analysis Group, University of Cape Town', enabled: true, href: 'http://www.csag.uct.ac.za'},
        tooltip: { valueDecimals: 2,
	    formatter: function() {
                var s = variableName;
	        $.each(this.points, function(i, point) {				
                    s += '<br>' + Highcharts.dateFormat('%b %e %Y', this.x) +': '+ point.y+" ["+measuringUnit+"]";
                });
	        return s;			
            },
            shared: true				
        },
        scrollbar: {enabled: true}, 
        navigator: {enabled: false},
        rangeSelector: {enabled: true},
        xAxis: {type: 'datetime', ordinal: false, dateTimeLabelFormats: {dateFormat}, showLastLabel: true},
        yAxis: {title: {text: variableName+" ["+measuringUnit+"]"}, offset: 30, labels:{align: 'right', x: 0, y: 0},  min:0},
        title: {text: (locationName).bold()},
        plotOptions: {series: {marker: {enabled: enableMarker, symbol:"circle", radius: 3}, lineWidth: lineWidth}, line: {dataGrouping: {enabled:false}}, column: {dataGrouping: {enabled:false}, pointWidth: 2}},
        series: [] 
    });
    return chart;
}



$(document).on('click','.graphMenuItem', function(event){
        var evID=$(event.target).attr('id');
        var currSelect=$(event.target);
        if (! $(currSelect).hasClass("current")){
            //console.log(evID);
            $(".current").removeClass("current");
            $(currSelect).addClass("current")
            if (evID=="timeseries"){
                loadPlot(ds,"timeseries", false);
            }
            if (evID=="compareyearsnormal"){
                loadPlot(ds,"compareyearsnormal", false);
            }
            if (evID=="compareyearscumsum"){
                loadPlot(ds,"compareyearscumsum", false);
            }
        }
});





