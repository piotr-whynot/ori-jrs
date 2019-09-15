var chart;

function loadPlot(datastream, graphType, isFirst, showcumsum){
// find first and last date of record and other information from metadata call
    $('#graph').html("<div id=loader><img src='./img/ajax-loader.gif' class='ajax_loader'></div>");
    ds=datastream; // this has to be like this because datastream may change dynamically, or so I think;-)
    eventapicall="./api/api_envdata.php?calltype=datastream&datastreamID="+ds;
    console.log(eventapicall);
    if (isFirst){
    //isFirst indicates whether this is a first call to loadPlot for a particular datastream. 
    // if yes - graph controlbox is populated depending on showcumsum
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
            //console.log(alldata[0]);
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

            if(variableName=="rainfall" || variableName=="Rainfall"){
                firstm=6;
            }else{
                firstm=9;
            }
            if (graphType=="timeseries"){
                gapSize=100;
                seriesColor="#999999";
            }else{
                gapSize=1000;
                seriesColor="#DDDDDD";
            }
            markerRadius=1;
            lineWidth=2;

            locationName=alldata[0].locationName;
           $('#'+graphType).addClass('current');

            setTimeout(function(){
                prepareChart("graph", ds, fy, ly+1, measuringUnit, variableName, locationName, graphType, firstm, gapSize)
            }, 1000);
        }
    );
}





function prepareChart(divname, ds, firstyr, lastyr, measuringUnit, variableName, locationName, graphType, firstm, gapSize){
    //series type: cumsum or normal, graphType:compareyears or timeseries
    apidatacall="./api/api_envdata.php?calltype=data&datastreamID="+ds+"&startdate="+firstyr+"&enddate="+lastyr;
    //console.log(apidatacall);
    $.get(apidatacall, 
        function(data){
            // this will be a geojson objest with a number of columns. It needs to be processed
            data=JSON.parse(data);
            // now we get data only
            data=data[0].datastreams[0].data;
            // this will be returned
            outdata= new Array();
            // what follows here is a mess of variables that provides ability to define an arbitrary month as the beginning of the "hydrological year"
            // the function is not very transparent and perhaps can be neater, but it works, so don't touch it!
            seriesData=[];
            datayrs=[];
            yrdata=[];
            started=false;
            cumsum=0;
            if (firstm>0){
                yadd=1
            }else{
                yadd=0
            }
            mindays=0
            for(var i=0, len=data.length; i < len; i++){
                dte0=new Date(data[i][0]);
                dte=new Date(data[i][0]);
                cury=dte.getFullYear();
                curm=dte.getMonth();
                hydrom=curm-firstm;
                hydroy=cury+yadd;
                if (graphType=="timeseries"){
                    hyearcode=hydroy
                    if (hydrom<0){
                       hydrom=11+hydrom;
                       hydroy=cury;
                       hyearcode=hydroy+yadd
                    }
                }else{
                    hyearcode=1970
                    if (hydrom<0){
                       hydrom=11+hydrom;
                       hydroy=cury;
                       hyearcode=1970+yadd
                    }
                }

                parsedval=parseFloat(data[i][1]);
                //console.log(hydroy);
                if(hydrom>=0 & hydrom<12 & !started){ //allow to skip two months before start
                    started=true;
                    oldhydroy=hydroy;
                }
                if (started){
                    dte.setFullYear(hyearcode);
                    if (oldhydroy==hydroy){
                        if (graphType=="compareyearscumsum"){
                            cumsum=cumsum+parsedval;
                            ar=[dte.valueOf(), cumsum];
                        }else{
                            ar=[dte.valueOf(), parsedval];
                        }
                        yrdata.push(ar);
                    }else{
                        //console.log("new year");
                        if(yrdata.length>mindays){
                            if (firstm>0){
                                prevy=oldhydroy-1
                                id=prevy.toString()+"-"+oldhydroy.toString();
                            }else{
                                id=oldhydroy.toString()
                            }
                            datayrs.push(id);
                            seriesData.push({id: id, name: id, data: yrdata, color: seriesColor, showInLegend:false});
                        }
                        yrdata= new Array();
                        oldhydroy=hydroy;
                        cumsum=0;
                        ar=[dte.valueOf(), parsedval];
                        yrdata.push(ar);
                        
                    }
                }
            }

            if (firstm>0){
                prevy=oldhydroy-1;
                id=prevy.toString()+"-"+hydroy.toString();
            }else{
                id=hydroy.toString()
            }
            seriesData.push({id: id, name: id, data: yrdata, showInLegend:false, color: seriesColor, gapSize: gapSize});
            datayrs.push(id);
            txt="<b> Highlight years:</b><br>";
            year2show=0;
            for(var i=datayrs.length-1, len=0; i >= len; i--){
                y=datayrs[i];
                if (year2show==0){year2show=y;}
                txt+="<input type='checkbox' name='years' onclick='showhideYear(this.value)' value="+y+" />"+y+" <br/>"
            }
            $('#graphMenuAux').html(txt);
            chart=createChart(divname, variableName, measuringUnit, locationName, graphType, seriesData);
            $(":checkbox[value="+year2show+"]").prop("checked","true");
	    showhideYear(year2show);
            $("#shade").hide();
        }
    );   
}



function showhideYear(item){
    colours=[ "#654b8b","#8f9500","#613cae","#01c89c","#630070","#fb6e48","#dcb5ff","#803900","#ff6cbf","#8f0023"]
    $.each(chart.series, function(i,s){
        if(s.name==item.toString()){
            if($(":checkbox[value="+item+"]").prop('checked')){
                j=i%10;
                if (i==chart.series.length-1){
                    s.options.color="#FF4500";
                }else{
                    s.options.color=colours[j];
                }
                s.options.marker.radius=3;
                s.options.lineWidth=3;
                s.options.zIndex=9000;
                s.options.showInLegend=true;
                s.update(s.options);
            }else{
                s.options.marker.radius=markerRadius;
                s.options.color=seriesColor;
                s.options.lineWidth=lineWidth;
                s.options.zIndex=8900;
                s.options.showInLegend=false;
                s.update(s.options);
            }
        }
    });
}



function createChart(divname, variableName, measuringUnit, locationName,  chartType, dataseries){
    $('#graph').html("");
    if (chartType=="timeseries"){
        axisdateFormat='%b %Y';
        tipdateFormat='%b %e %Y';
        legendEnable=false;
        scrollbarEnable=false;
        rangeSelEnable=true;
    }else{
        axisdateFormat='%e. %b';
        tipdateFormat='%b, %e';
        legendEnable=true;
        scrollbarEnable=false;
        rangeSelEnable=false;
    }
//creates empty chart. all chart formatting defined here
    chart = Highcharts.chart({
//    chart = new Highcharts.stockChart({
        chart: {renderTo: divname, zoomType: 'xy', marginRight: 0},
        legend: {
            enabled: legendEnable,
            align: 'left',
            x:100,
            y:50,
            verticalAlign: 'top',
            layout: 'vertical',
            floating: true
        },
        credits: {text: '(C) Okavango Research Institute, University of Botswana', enabled: true, href: 'http://www.ori.ub.bw'},
        tooltip: { valueDecimals: 2,
	      formatter: function() {
                var s = variableName;
	        $.each(this.points, function(i, point) {
                if (chartType=="timeseries"){
                    yrlabel='';
                }else{				
                    yrlabel=', '+point.series.name;
                }
                s += '<br>' + Highcharts.dateFormat(tipdateFormat, this.x) +yrlabel+': '+ point.y+" ["+measuringUnit+"]";
            });
	        return s;			
          },
          shared: true				
        },
        scrollbar: {enabled: scrollbarEnable}, 
        navigator: {enabled: false},
        rangeSelector: {enabled: rangeSelEnable},
        xAxis: {type: 'datetime', ordinal: false, dateTimeLabelFormats: {month: axisdateFormat}, showLastLabel: true},
        yAxis: {title: {text: variableName+" ["+measuringUnit+"]"}, offset: 30, labels:{align: 'right', x: 0, y: 0}, visible: true},
        title: {text: (variableName+" at "+ locationName).bold()},
        plotOptions: {series: {marker: {enabled: true, symbol:"circle", radius: markerRadius}, lineWidth: lineWidth}, color:seriesColor, line: {dataGrouping: {enabled:false}}, column: {dataGrouping: {enabled:false}, pointWidth: 1}},
        series: dataseries,
        exporting: {
        chartOptions: {
            plotOptions: {
                series: {
                   marker: {enabled: true, symbol:"circle", radius: 2}
                }
            }
        },
        printMaxWidth: 1200
        }
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




function createBiodivChart(divname, variableName, measuringUnit, locationName,  chartType, dataseries){
    $('#graph').html("");
    axisdateFormat='%b %Y';
    tipdateFormat='%b %e %Y';
    legendEnable=false;
    scrollbarEnable=false;
    rangeSelEnable=true;
//creates empty chart. all chart formatting defined here
    chart = Highcharts.chart({
//    chart = new Highcharts.stockChart({
        chart: {renderTo: divname, zoomType: 'xy', marginRight: 0, type:'area'},
        legend: {
            enabled: legendEnable,
            align: 'left',
            x:100,
            y:50,
            verticalAlign: 'top',
            layout: 'vertical',
            floating: true
        },
        credits: {text: '(C) Okavango Research Institute, University of Botswana', enabled: true, href: 'http://www.ori.ub.bw'},
        tooltip: { valueDecimals: 2,
	      formatter: function() {
                var s = variableName;
                s += '<br>';
                s+=Highcharts.dateFormat(tipdateFormat, this.x);
	        $.each(this.points, function(i, point) {
                label=', '+point.series.name;
                s += '<br>'+label+': '+ point.y;
            });
	        return s;			
          },
          shared: true				
        },
        scrollbar: {enabled: scrollbarEnable}, 
        navigator: {enabled: false},
        rangeSelector: {enabled: rangeSelEnable},
        xAxis: {type: 'datetime', ordinal: false, dateTimeLabelFormats: {month: axisdateFormat}, showLastLabel: true},
        yAxis: {title: {text: variableName+" ["+measuringUnit+"]"}, offset: 30, labels:{align: 'right', x: 0, y: 0}, visible: true},
        title: {text: (variableName+" at "+ locationName).bold()},
        plotOptions: {series: {marker: {enabled: true, symbol:"circle", radius: markerRadius}, lineWidth: lineWidth}, color:seriesColor, line: {dataGrouping: {enabled:false}}, column: {dataGrouping: {enabled:false}, pointWidth: 1}},
        series: dataseries,
        exporting: {
        chartOptions: {
            plotOptions: {
                series: {
                   marker: {enabled: true, symbol:"circle", radius: 2}
                }
            }
        },
        printMaxWidth: 1200
        }
    });
    return chart;
}







function loadBiodivPlot(locationID){
    markerRadius=1;
    lineWidth=2;
    txt="<div id=graphMenuAux></div>";
    $('#graphControls').html(txt);
    featureapicall="./api/api_biodiv.php?calltype=checklist&locationID="+locationID;
    $.get(featureapicall, 
        function(data0){
            taxaList=JSON.parse(data0);
            featureapicall="./api/api_biodiv.php?calltype=data&locationID="+locationID;
            $.get(featureapicall, 
                function(data){
                    alldata=JSON.parse(data);
                    selfeature=alldata[0];
                    taxonData.length=0;
                    seriesColor="#999999";
                    currentList=[];
                    for (e in selfeature['events']){
                        ev=selfeature['events'][e];
                        evDate=ev['eventDate'];
                        dte=new Date(evDate);
                        console.log(dte);
                        temp = Object.assign({}, taxaList);
                        for (o in ev['occurrenceData']){
                            occurrence=ev['occurrenceData'][o];
                            taxonID=occurrence['taxonID'];
                            parsedval=parseFloat(occurrence['organismQuantity']);
                            if (currentList.includes(taxonID)){
                                taxonData[taxonID].push([dte.valueOf(),parsedval]);
                            }else{
                                taxonData[taxonID]=[[dte.valueOf(),parsedval]];
                                currentList.push(taxonID);
                            }
                            delete temp[taxonID];
                        }
                        for (t in temp){
                            if (taxonData.includes(t)){
                          //      taxonData[t].push([dte.valueOf(),0]);
                            }else{
                             //   taxonData[t]=[[dte.valueOf(),0]];
                            }
                        }
                    }
                    seriesData=[];
                    txt="<b> Highlight taxon:</b><br>";
                    for (taxonID in taxaList){
                        taxonName=taxaList[taxonID]['scientificName'];
                        seriesData.push({id: taxonID, name: taxonID, data: taxonData[taxonID], color: seriesColor, showInLegend:false});
                        txt+="<input type='checkbox' name='taxon' onclick='showhideYear(this.value)' value="+taxonID+" />"+taxonName+" <br/>"
                    }
                    console.log(seriesData);

                    chart=createBiodivChart("graph", "organism count", "number or individuals", locationID, "timeseries", seriesData);

                    $('#graphMenuAux').html(txt);

                    $('#shade').hide();
            });
    });
}



