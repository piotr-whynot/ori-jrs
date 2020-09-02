var chart;


function plotEnvChart(graphType){
//    console.log("plotEnvChart");
    seriesColor="#bbb";
    markerRadius=1;
    lineWidth=1;
    processEnvChartData(graphType, function(seriesData, datayrs){
        setTimeout(function(){
            chart=createEnvChart("graph", graphType, seriesData, datayrs);
            txt="<div class='center-block text-center'>";
            txt+="<b> Highlight years:</b><br>";
            year2show=0;
            for(var i=datayrs.length-1, len=0; i >= len; i--){
                y=datayrs[i];
                if (year2show==0){year2show=y;}
                    txt+="<div class='checkbox'> <label><input type='checkbox' name='years' onclick='showhideYear(this.value)' value="+y+" />"+y+"</label></div>"
            }
            txt+="</div>";
            $('#graphMenuAux').html(txt);
            $(":checkbox[value="+year2show+"]").prop("checked","true");
            showhideYear(year2show);
        }, 1000);
    });
}





function processEnvChartData(graphType, callback){
    //console.log("processEnvChartData");
    var metadata=plotData[0].datastreams[0];
    var firstDate=metadata.firstMeasurementDate;
    var lastDate=metadata.lastMeasurementDate;
    var a = new Date(lastDate);
    var ly=a.getFullYear();
    a = new Date(firstDate);
    var fy=a.getFullYear();
    var variableName=metadata.variableName;
    if(variableName=="rainfall" || variableName=="Rainfall"){
        var firstm=6;
    }else{
        var firstm=9;
    }
    var data=plotData[0].datastreams[0].data;
    // what follows here is a mess of variables that provides ability to define an arbitrary month as the beginning of the "hydrological year"
    // the function is not very transparent and perhaps can be neater, but it works, so don't touch it!
    var seriesData=[]; // this has to stay global
    var datayrs=[]; //this has to stay global
    var yrdata=[];
    var started=false;
    var cumsum=0;
    if (firstm>0){
        var yadd=1
    }else{
        var yadd=0
    }
    var mindays=0
    for(var i=0, len=data.length; i < len; i++){
        var dte0=new Date(data[i][0]);
        var dte=new Date(data[i][0]);
        dte.setMinutes(dte.getMinutes() - dte.getTimezoneOffset())
        //console.log(dte);
        var cury=dte.getFullYear();
        var curm=dte.getMonth(); //this is zero-indexed month
        var hydrom=curm-firstm;
        var hydroy=cury+yadd;
        if (graphType=="timeseries"){
            var hyearcode=hydroy;
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

        var parsedval=parseFloat(data[i][1]);
        //console.log(hydroy);
        if(hydrom>=0 & hydrom<12 & !started){ //allow to skip two months before start
            var started=true;
            var oldhydroy=hydroy;
        }
        if (started){
            //console.log(hyearcode, hydroy, cury, firstm, curm, dte);
            if (graphType!="timeseries"){
                dte.setFullYear(hyearcode);
            }
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
        var id=prevy.toString()+"-"+hydroy.toString();
    }else{
        var id=hydroy.toString()
    }
    seriesData.push({id: id, name: id, data: yrdata, color: seriesColor, showInLegend:false});
    datayrs.push(id);
    callback(seriesData, datayrs);
}




function createEnvChart(divname, graphType, seriesData, datayrs){
    //creates chart
    var variableName=plotData[0].datastreams[0].variableName;
    var measuringUnit=plotData[0].datastreams[0].variableUnit;
    var locationName=plotData[0].locationName;
    if (graphType=="timeseries"){
        var axisdateFormat='%b %Y';
        var tipdateFormat='%b %e %Y';
        var legendEnable=false;
        var gapSize=100;
    }else{
        var axisdateFormat='%e. %b';
        var tipdateFormat='%b, %e';
        var legendEnable=true;
        var gapSize=1000;
    }

    chart = Highcharts.chart({
        chart: {renderTo: divname, zoomType: 'xy', marginRight: 0, backgroundColor: '#fafafa'},
        legend: {
            enabled: true,
            align: 'left',
            x:100,
            y:50,
            verticalAlign: 'top',
            layout: 'vertical',
            floating: true
        },
        credits: {text: '(CC-BY-ND) Okavango Research Institute, University of Botswana', enabled: true, href: 'http://www.ori.ub.bw'},
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
          shared: false	
        },

        scrollbar: {enabled: false}, 
        navigator: {enabled: false},
        rangeSelector: {enabled: false},
        xAxis: {type: 'datetime', ordinal: false, dateTimeLabelFormats: {month: axisdateFormat}, showLastLabel: true},
        yAxis: {offset: 30, labels:{align: 'right', x: 0, y: 0}, visible: true},
        yAxis: {title: {text: variableName+" ["+measuringUnit+"]"}, offset: 30, labels:{align: 'right', x: 0, y: 0}, visible: true},
        title: {text: (variableName+" at "+ locationName).bold()},
        plotOptions: {series: {marker: {enabled: true, symbol:"circle", radius: markerRadius}, lineWidth:lineWidth}, color:seriesColor, line: {dataGrouping: {enabled:false}}, column: {dataGrouping: {enabled:false}, pointWidth: 1}},
        exporting: {
            chartOptions: { // specific options for the exported image
                rangeSelector:{enabled:false},
                chart:{marginRight:10},
                plotOptions: {
                    series: {
                        dataLabels: {enabled: false},
                        marker: {enabled: false, symbol:"circle", radius: 1}
                    }
                }
            },
            sourceHeight:400,
            sourceWidth:1000,
            scale:1,
        },
        series:seriesData
    });
    return chart;
}




function createBioPieChart(targetDiv, evSeriesData, unit, title){
    Highcharts.chart(targetDiv, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        credits: {text: '(CC-BY-ND) Okavango Research Institute, University of Botswana', enabled: true, href: 'http://www.ori.ub.bw'},
        title: {
            text: title
        },
        tooltip: {
            pointFormat: '{point.name}: <b>{point.y:.1f} ['+unit+']</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: <b>{point.y:.1f} ['+unit+']</b>'
                }
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: evSeriesData
        }]
    });
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




$(document).on('click','.graphMenuItem', function(event){
        txt="<div class=loader id=loader-1></div>";
        $('#graph').html(txt);
        var evID=$(event.target).attr('id');
        console.log(evID);
        var currSelect=$(event.target);
        if (! $(currSelect).parent().hasClass("active")){
            //console.log(evID);
            $(".graphMenuItem").parent().removeClass("active");
            $(currSelect).parent().addClass("active")
            if (evID=="timeseries"){
                plotEnvChart("timeseries");
            }
            if (evID=="compareyearsnormal"){
                plotEnvChart("compareyearsnormal");
            }
            if (evID=="compareyearscumsum"){
                plotEnvChart("compareyearscumsum");
            }
        }
});




function createBioTSChart(divname, variableName, measuringUnit, locationName,  chartType, dataseries){
    axisdateFormat='%b %Y';
    tipdateFormat='%b %e %Y';
    legendEnable=false;
    scrollbarEnable=false;
    rangeSelEnable=false;
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
        credits: {text: '(CC-BY-ND) Okavango Research Institute, University of Botswana', enabled: true, href: 'http://www.ori.ub.bw'},
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
            chartOptions: { // specific options for the exported image
                rangeSelector:{enabled:false},
                chart:{marginRight:30},
                plotOptions: {
                    series: {
                        dataLabels: {enabled: false},
                        marker: {enabled: false, symbol:"circle", radius: 1}
                    }
                }
            },
            sourceHeight:400,
            sourceWidth:1000,
            scale:1,
//            fallbackToExportServer: false
        }

    });
    return chart;
}







function loadBioTSChart(locationID){
    txt="<div class=loader id=loader-1></div>";
    $('#graph').html(txt);
    markerRadius=1;
    lineWidth=2;
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
                        txt+="<div class=checkbox><label><input type='checkbox' name='taxon' onclick='showhideYear(this.value)' value="+taxonID+" />"+taxonName+" </label></div>"
                    }

                    chart=createBioTSChart("graph", "organism count", "number or individuals", locationID, "timeseries", seriesData);

                    $('#graphMenuAux').html(txt);

                    $('#shade').hide();
            });
    });
}



