var heatmap = null;
var giggleUrl = "http://potter.genetics.utah.edu:8080/";
var scoreField = "";


$(document).ready(function() {
	$.material.init();

	heatmap = new heatmapD3().cellSize(15)
                             .legendCellSize(20)
                             .margin({top: 10, bottom: 10, left: 10, right: 70})
                             .colors(colorbrewer.YlGnBu[9])
                             //.colors(colorbrewer.Oranges[9]);
                             .on('d3click', function(d,i) {
                             	loadOverlapDetail(d.name);
                             });

	loadHeatmap();
});

function myJsonMethod(data) {	
  	heatmap.score( function(d) { return d[scoreField]} );

  	var selection = d3.select("#chart").datum(data);
  	heatmap(selection);	
}

function loadOverlapDetail(fileName) {
	var detailUrl = giggleUrl + "?region=" + $('#overlaps').val() + "&files=" + fileName + "&full";
	$.ajax({
	    url: detailUrl,
	    type: "GET",
	    crossDomain: true,
	    dataType: "text",
	    success: function(data) {
	    	var results = [];
	    	var header = null;
	    	var records = [];
			data.split("\n").forEach(function(row) {
				if (row == null || row.trim() == "") {

				} else {
					fields = row.split("\t");
					if (row.indexOf("#") == 0) {
						if (header) {
							results.push({'header': header, 'rows': records});
							recs = [];
						}
						header = {};
						header.name = fields[0].split("#split/")[1];
						header.size = fields[1];
						header.overlaps = fields[2];
					} else {
						var rec = {};
						rec.chr   = fields[0];
						rec.start = fields[1];
						rec.end   = fields[2];
						records.push(rec);
					}

				}
			});
			if (header) {				
				results.push({'header': header, 'rows': records});
			}
			$('#overlaps-modal .modal-body').html("");

			results.forEach(function(result) {
				var content = "";
				content += "<div style='margin-bottom:4px'>" + result.header.name + "</div>";
				content += "<table style='width:300px'>";
				content +=	"<tr>" 
						+ "<td></td>"
						+ "<td>Chromsome</td>"
						+ "<td style='text-align:right'>Start</td>"
						+ "<td style='text-align:right'>End</td>"
						+ "</tr>";
				var rowNbr = 1;
				result.rows.forEach( function(row) {
					content += 
						"<tr>" 
						+ "<td>" + rowNbr++ + ".</td>"
						+ "<td>" + row.chr + "</td>"
						+ "<td style='text-align:right'>" + addCommas(row.start) + "</td>"
						+ "<td style='text-align:right'>" + addCommas(row.end) + "</td>"
						+ "</tr>";
				
				})
				content += "</table>";
				$('#overlaps-modal .modal-body').append(content);
			});



			$('#overlaps-modal').modal('show');
			
		  

	    },
	    error: function(error) {
	    	console.log(error);
	    }
	});	

}

function loadHeatmap() {

	var defUrl  = giggleUrl + "?data";
	var dataUrl = giggleUrl + "?region=" + $('#overlaps').val();


	// Get matrix definition
	var sourceFileMap = {};	
	$.ajax({
	    url: defUrl,
	    type: "GET",
	    crossDomain: true,
	    dataType: "text",
	    success: function(data) {

	    	def = JSON.parse(data);
			def.sourceFiles.forEach( function( sourceFile ) {
				var cellCoord = {};
				cellCoord.row = sourceFile.position[0];
				cellCoord.col = sourceFile.position[1];
				sourceFileMap[sourceFile.name] = cellCoord;
			});
			def.cells = [];

			var recordMap = {};

			// get matrix data (tab delimited) and fill in heatmap
			$.ajax({
			    url: dataUrl,
			    type: "GET",
			    crossDomain: true,
			    dataType: "text",
			    success: function(data) {
					data.split("\n").forEach(function(row) {
						fields = row.split("\t");
						if (fields.length == 0 || fields[0] == "") {

						} else {
							var rec = {};
							rec.name = fields[0].split("split/")[1];
							rec.size = fields[1];
							rec.overlaps = fields[2];
							rec.row = sourceFileMap[rec.name].row;
							rec.col = sourceFileMap[rec.name].col;
							def.cells.push(rec);

						}
					});

					maxValue = d3.max(def.cells, function(d,i) {return d.overlaps});
					if (maxValue <= 2) {
						maxValue = 3;
					}
					heatmap.colors(colorbrewer.YlGnBu[Math.min(maxValue, 9)])

					
				  	var selection = d3.select("#chart").datum(def);
		  			heatmap(selection);	

			    },
			    error: function(error) {

			    }
			});
		},
	    error: function(error) {
	    	console.error;
	    }
	});



}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}