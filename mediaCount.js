/* mediaCount
*
* This is a hobbyist's demo of some of the power of
* Harvard LibraryCloud, an open library metadata server
* More here: http://librarycloud.org
*
* For any subject keyword search, shows many items 
* in the various media types. Those types as expressed
* in the MODS that LibraryCloud uses:
*
* text
* cartographic
* notated [notated%20music]
* sound recording
* sound recording-musical
* sound recording-nonmusical
* still [still image]
* moving [moving image]
* three [three dimensional object]
* software [software, multimedia]
* mixed [mixed material]
*
* This app deals with six:
* text, recordings, movies, images, maps, and 3D objects
*
* For the charts and graphs, this uses http://www.jqplot.com/tests/ - Thanks!!
*
* The bar charts are working but not currently exposed because
*  the pie charts seem more useful.
*
* This is released under open licenses. Details to come.
*
* The code will soon be up at GitHub.
*
* This is a demo/prototype. It is offered without warrantee or guarantee.
* If you encounter problems, please le me know, although I make no promises.
*
* David Weinberger, david@weinberger.org
* Oct. 31, 2014
*
*/

// globals

var gsearchterms = new Array();



function init(){
	
	// pressing enter submits the search
	$(".searchbox").keypress(function(e){
		if (e.keyCode === 13){
			startSearch();
			$("#searchbox").blur(); // remove focus
			event.preventDefault();
		}
	});
	
	// entering first search box hides the pulldowns
	$("#sb0").mousedown(function(e){
		$('#explanation').slideUp(300);
		$('#about').slideUp(300);
		$("#instructionsbutton").removeClass("on");
		$("#instructionsbutton").addClass("off");
		$("#aboutbtn").removeClass("on");
		$("#aboutbtn").addClass("off");
	});
	
}

function addBox(){
	// unless there's a blank one, creates a new one
	
	// get all searchboxes
	var sbs = $(".searchbox");
	// check for empties
	for (var i=0; i < sbs.length; i++){
		if ($(sbs[i]).val == ""){
			// focus on it
			$(sbs[i]).focus();
			return
		}
	}
	
	// if at 10, stop
	if (sbs.length >= 10){
		alert("Ten is enough.");
		return;
	}
	
	// make new one
	var div=document.createElement("div");
	// hide it so we can reveal it
	div.style.display="none";
	// new text area
	var ta = document.createElement("textarea");
	var id = "sb" + sbs.length;
	ta.setAttribute("id",id);
	ta.setAttribute("class","searchbox");
	// new closebox
	var controlspan = document.createElement("span");
	controlspan.setAttribute("onclick","removeBox(this)");
	controlspan.setAttribute("class","removebox");
	$(controlspan).html("x");
	// appendChild
	$(div).append(ta);
	$(div).append(controlspan);
	$("#searchboxes").append(div);
	$(div).slideDown(300, function(){
  		$("#" + id).focus();
	});
	
	// create sequential ids
	var sbs = $(".searchbox");
	for (i=0; i < sbs.length; i++){
		// set id of the textarea
		sbs[i].setAttribute("id","sb" + i);
		// set id of the parent id
		$(sbs).parent().attr("id","sbdiv" + i);
	}
}

function removeBox(thisone){
	// get the div
	var par = $(thisone).parent()[0];
	
	$(par).slideUp(300, function(){
		$(par).remove();
	});
}

function startSearch(){
	
	var searchterm = $("#searchbox").val();
	if (searchterm == ""){
		alert("Enter a subject to search for");
		return
	}
	
	// build global array of search terms
	var boxes = $(".searchbox");
	gsearchterms.length = 0;
	for (var i= 0; i < boxes.length; i++){
		if ($(boxes[i]).val() != ""){
			gsearchterms.push( $(boxes[i]).val() );
		}
	}
	
	// DEBUG
	 fetchResults();
	//displayResults("");
}

function fetchResults(){
	//var searchjson = JSON.stringify(["elvis","hollywood","guitar"]);
	 var searchjson = JSON.stringify(gsearchterms);
	 $("#loading").show();
	
	$.ajax({
  		type: "POST",
  		data: {searchterms  : searchjson},
 		 url: './php/fetchTotals.php',
 		 success: function(r,mode){
                displayResults(r); 
                 $("#loading").hide();          
            },
        error: function(r,mode){
        	//$("#loading").hide();
        	 $("#loading").hide();
        	alert("Fetch failed.");
        }
  });
 
 
}

function displayResults(r){
		var results = JSON.parse(r); // turn the response into json
		var testresults = [
					{"searchterm" : "term1", "text" : "1","recording" : "2", "movingImage" : "3"},
					{"searchterm" : "term2", "text" : "4","recording" : "5", "movingImage" : "6"},
					{"searchterm" : "term3", "text" : "7","recording" : "8", "movingImage" : "10"},
					{"searchterm" : "term4", "text" : "11","recording" : "12", "movingImage" : "13"}
				];

	// remove media that have no instances
	var texts=0; var images=0; var movies = 0; var maps = 0; var recordings = 0; var d3s = 0;
	for (var i = 0; i < results.length; i++){
		if (results[i]["text"] > 0) {texts++;}
		if (results[i]["map"] > 0) {maps++;}
		if (results[i]["recording"] > 0) {recordings++;}
		if (results[i]["image"] > 0) {images++;}
		if (results[i]["d3"] > 0) {d3s++;}
		if (results[i]["movie"] > 0) {movies++;}
	}
	for (var i = 0; i < results.length; i++){
		if (texts == 0){delete results[i]["text"];}
		if (recordings == 0){delete results[i]["recording"];}
		if (maps == 0){delete results[i]["map"];}
		if (movies == 0){delete results[i]["movie"];}
		if (images == 0){delete results[i]["image"];}
		if (d3s == 0){delete results[i]["d3"];}
	}
	// build the list of labels
	var existinglabels= new Array();
	if (texts > 0){existinglabels.push({"label":"texts"})};
	if (recordings > 0){existinglabels.push({"label":"audio"})};
	if (maps > 0){existinglabels.push({"label":"maps"})};
	if (movies > 0){existinglabels.push({"label":"movies"})};
	if (images > 0){existinglabels.push({"label":"images"})};
	if (d3s > 0){existinglabels.push({"label":"3D objects"})};
	
	

	// if we want percentage results
	// create new results that are by percent
	var resultspercent = new Array();
	for (var i=0; i < results.length; i++){
		var totalhits = parseInt(results[i]["text"]) +  parseInt(results[i]["recording"]) +  parseInt(results[i]["movingImage"]);
		var textpercent = (results[i]["text"] / totalhits) * 100;
		resultspercent.push( {
								"searchterm": results[i]["searchterm"],
								"text" : ((results[i]["text"] / totalhits) * 100).toString(),
								"recording" : ((results[i]["recording"] / totalhits) * 100).toString(),
								"movie" : ((results[i]["movie"] / totalhits) * 100).toString(),
								"map" : ((results[i]["map"] / totalhits) * 100).toString(),
								"image" : ((results[i]["image"] / totalhits) * 100).toString(),
								"d3" : ((results[i]["d3"] / totalhits) * 100).toString()
							});
	}
	
	//displayChartByTerms(results,existinglabels);
	//displayChartByMedia(results);
	displayPie(results);
}

function displayChartByTerms(results,existinglabels){
	// for each term, show the various media
	
	// we want an array for the numbers for each medium
	// plus an array of "ticks", i.e., labels on the bottom axis
	var texts = new Array();
	var recordings = new Array();
	var movies = new Array();
	var images = new Array();
	var maps = new Array();
	var d3s = new Array();
	var ticks = new Array();
	var usedFactors = new Array();
	
	for (var i=0; i < results.length; i++){
			if (results[i]["text"] !== undefined){
				texts.push(parseInt(results[i]["text"]));
				if (i == 0){
					usedFactors.push(texts);
				}
			}
			if (results[i]["recording"] !== undefined){
				recordings.push(parseInt(results[i]["recording"]));
				if (i == 0){ // just do this once
					usedFactors.push(recordings);
				}
			}
			if (results[i]["movie"] !== undefined){
				movies.push(parseInt(results[i]["movie"]));
				if (i == 0){
					usedFactors.push(movies);
				}
			}
			if (results[i]["image"] !== undefined){
				images.push(parseInt(results[i]["image"]));
				if (i == 0){
					usedFactors.push(images);
				}
			}
			if (results[i]["map"] !== undefined){
				maps.push(parseInt(results[i]["map"]));
				if (i == 0){
					usedFactors.push(maps);
				}
			}
			if (results[i]["d3"] !== undefined){
				d3s.push(parseInt(results[i]["d3"]));
				if (i == 0){
					usedFactors.push(d3s);
				}
			}
			ticks.push(results[i]["searchterm"]);
	}
	
	

    var plot1 = $.jqplot('chartdiv1', usedFactors, {
        // The "seriesDefaults" option is an options object that will
        // be applied to all series in the chart.
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            rendererOptions: {fillToZero: true},
           // pointLabels: { show: true, location: 'n', edgeTolerance: -15 }
        },
        // Custom labels for the series are specified with the "label"
        // option on the series option.  Here a series option object
        // is specified for each series.
        series: existinglabels,
        // Show the legend and put it outside the grid, but inside the
        // plot container, shrinking the grid to accomodate the legend.
        // A value of "outside" would not shrink the grid and allow
        // the legend to overflow the container.
        legend: {
            show: true,
            placement: 'outsideGrid'
        },
        title: "By Search Term",
        highlighter:{
			show:true,
			tooltipContentEditor:tooltipContentEditor
		},
        axes: {
            // Use a category axis on the x axis and use our custom ticks.
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticks
            },
            // Pad the y axis just a little so bars can get close to, but
            // not touch, the grid boundaries.  1.2 is the default padding.
            yaxis: {
                pad: 1.05,
                tickOptions: {formatString: '%d'},
                min: null,      // minimum numerical value of the axis.  Determined automatically.
        		max: null
            }
        }
    });
}



function displayChartByMedia(results){

	// for each medium, show the various media
		var results = [
					{"searchterm" : "term1", "text" : "1","recording" : "2", "movingImage" : "3"},
					{"searchterm" : "term2", "text" : "4","recording" : "5", "movingImage" : "6"},
					{"searchterm" : "term3", "text" : "7","recording" : "8", "movingImage" : "9"},
					{"searchterm" : "term4", "text" : "10","recording" : "11", "movingImage" : "12"}
				];
	
	// we want an array for the numbers for each medium
	// plus an array of "ticks", i.e., labels on the bottom axis
	//
	//	    1,4,7,11   2,5,8,12     3,6,10,13 
	//  	text		record	      movie
	
	var texts = new Array();
	var recordings = new Array();
	var movies = new Array();
	var ticks = new Array("Text","Recording","Movie");
	var mediaterms = ["text","recording","movingImage"];
	var uberarray = new Array();
	for (var i=0; i < results.length; i++){
		var temparray = new Array();
		for (var j=0; j < ticks.length; j++){
			//temparray[j]=parseInt(results[j][mediaterms[i]]);
			temparray[j]=parseInt(results[i][mediaterms[j]]);
		}
		uberarray.push(temparray);
			
	}
	  var tarray = new Array();
        for (i=0 ; i < results.length; i++){
        	tarray.push({"label" : results[i]["searchterm"]});
        }

    var plot1 = $.jqplot('chartdiv2', [[1,2,3],[4,5,6],[7,8,9],[10,11,12]], {
        // The "seriesDefaults" option is an options object that will
        // be applied to all series in the chart.
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            rendererOptions: {fillToZero: true},
            pointLabels: { show: true, location: 'n', edgeTolerance: -15 }
        },
        // Custom labels for the series are specified with the "label"
        // option on the series option.  Here a series option object
        // is specified for each series.
      
        series : tarray,
        
        // series:[
//             {label:'text'},
//             {label:'recording'},
//             {label:'movie'}
//         ],
        // Show the legend and put it outside the grid, but inside the
        // plot container, shrinking the grid to accomodate the legend.
        // A value of "outside" would not shrink the grid and allow
        // the legend to overflow the container.
        legend: {
            show: true,
            placement: 'outsideGrid'
        },
        title: "By Media Type",
          highlighter:{
			show:true,
			tooltipContentEditor:tooltipContentEditor
		},
        axes: {
            // Use a category axis on the x axis and use our custom ticks.
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticks
            },
            // Pad the y axis just a little so bars can get close to, but
            // not touch, the grid boundaries.  1.2 is the default padding.
            yaxis: {
                pad: 1.05,
                tickOptions: {formatString: '%d'}
            }
        }
    });
}

function tooltipContentEditor(str, seriesIndex, pointIndex, plot) {
    // display series_label, x-axis_tick, y-axis value
    return "TST";
    //return plot.series[seriesIndex]["label"] + ", " + plot.data[seriesIndex][pointIndex];
//    var fullname = plot.series[seriesIndex]["label"]; // get library nickname
//   
//    var txt = fullname ;
//    return txt;
//     
    }

function displayPie(results){
// var data = [
//     ['Heavy Industry', 12],['Retail', 9], ['Light Industry', 14], 
//     ['Out of home', 16],['Commuting', 7], ['Orientation', 9]
//   ];

	var piecontainer = document.getElementById("piecontainer");
	piecontainer.innerHTML="";
	// prepare the data
	var multiPieData = new Array();
	for (var i = 0; i < results.length; i++){
		var tarray = new Array();
		tarray.push(["Text: " + results[i]["text"],results[i]["text"]]);
		tarray.push(["Audio: " + results[i]["recording"],results[i]["recording"]]);
		tarray.push(["Maps: " + results[i]["map"],results[i]["map"]]);
		tarray.push(["Images: " + results[i]["image"],results[i]["image"]]);
		tarray.push(["Movies: " + results[i]["movie"],results[i]["movie"]]);
		tarray.push(["3D: " + results[i]["d3"],results[i]["d3"]]);
		
		// create div for Pie
		var piediv = document.createElement("div");
		piediv.setAttribute("class","piediv");
		piediv.setAttribute("id","pie" + i);
		piediv.setAttribute("position","relative");
		$(piecontainer).append(piediv);
		
		// create label for entire chart
		var pieLabel = results[i]["searchterm"];
		pieLabel = pieLabel.replace("+"," ");
		

  var plot1 = jQuery.jqplot ('pie' + i, [tarray], 
    { 
    	// options = {
//     	 seriesColors: [ "#0080FF", "#66FFFF", "#8000FF", "#FF6666", "#FF0000", "#008000"]
//         },
      seriesDefaults: {
        // Make this a pie chart.
        renderer: jQuery.jqplot.PieRenderer, 
        rendererOptions: {
          // Put data labels on the pie slices.
          // By default, labels show the percentage of the slice.
          showDataLabels: true,
          
          markerOptions : {
          	show: true
          },
        },
        
      }, 
       seriesColors: [ "#FFFF66", "#66FFFF", "#8000FF", "#FF6666", "#FF0000", "#008000"],
          sliceMargin: 5,
       title: pieLabel,
          highlighter:{
			show:true,
			tooltipContentEditor:tooltipContentEditor
		},
      legend: { show:true, location: 'e' }
    }
  );
  }
}


function toggleButtons(which){
	// manage the buttons that show instructions and about info.
	
	if (which == "explanation"){ // explan is visible, so turn it off
		if ($("#explanation").is(':visible')){
			$('#explanation').slideUp(300);
			//$('#about').slideDown(300);
			$("#instructionsbutton").removeClass("on");
			$("#instructionsbutton").addClass("off");
		}
		else {
			$('#explanation').slideDown(300);
			$('#about').slideUp(300);
			$("#instructionsbutton").addClass("on");
			$("#instructionsbutton").removeClass("off");
			$("#aboutbutton").removeClass("on");
		}
	}
	if (which == "about"){
		if ($("#about").is(':visible')){
			$('#about').slideUp(300);
			//$('#explanation').slideDown(300);
			$("#aboutbutton").removeClass("on").addClass("off");
			//$("#explanationbutton").addClass("on");
		}
		else {
			$('#about').slideDown(300);
			$('#explanation').slideUp(300);
			$("#aboutbutton").removeClass("off").addClass("on");
			$("#instructionsbutton").addClass("off");
		}
	 }
}
