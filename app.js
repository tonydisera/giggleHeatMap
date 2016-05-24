var heatmap = null;
var giggleUrl = "http://potter.genetics.utah.edu:8080/";
var scoreField = "";


$(document).ready(function() {
	$.material.init();

	heatmap = new heatmapD3().cellSize(15)
                             .legendCellSize(20)
                             .margin({top: 10, bottom: 10, left: 10, right: 70})
                             .colors(colorbrewer.YlGnBu[9]);
                             //.colors(colorbrewer.Oranges[9]);

	loadHeatmap("size");
});

function myJsonMethod(data) {	
  	heatmap.score( function(d) { return d[scoreField]} );

  	var selection = d3.select("#chart").datum(data);
  	heatmap(selection);	
}

function loadHeatmap() {

	scoreField = $("input:radio[name ='radio-value-field']:checked").val();
	var url = giggleUrl + "?region=" + $('#overlaps').val();


	$.ajax({
	    url: url,
	    jsonp: 'callback',
	    type: "GET",
	    dataType: "jsonp"
	});


//	d3.json("giggle.json", function(error, data) {
//	});
}