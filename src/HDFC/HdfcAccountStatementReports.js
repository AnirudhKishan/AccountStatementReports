var db;
var timestampBalanceArray;

(function() {
	var dbFileElem = document.getElementById('dbFile');
	
	dbFileElem.onchange = function() {
		document.getElementById('showChartBtn').disabled = false;
	};
})();

(function() {
	document.getElementById('showChartBtn').addEventListener('click', function() {
		populateGlobalDb().then(() => {
			populateTimestampBalanceArray();
			chart();
		});
	}, false);
})();

function populateTimestampBalanceArray() {
	var query = "SELECT [Timestamp], [ClosingBalance] FROM [Transactions] JOIN [HdfcTransactions] ON [Transactions].[Id] = [HdfcTransactions].[TransactionId]";
	var data = db.exec(query)[0];
	
	timestampBalanceArray = [];
	for (var row of data.values) {
		timestampBalanceArray.push({
			'Timestamp': row[0],
			'Balance': row[1],
		})
	}
}

function populateGlobalDb() {
	return new Promise((resolve, reject) => {
		var f = document.getElementById('dbFile').files[0];
		var r = new FileReader();
		r.onload = function() {
			var Uints = new Uint8Array(r.result)
			db = new SQL.Database(Uints);	
			resolve();
		}
		r.readAsArrayBuffer(f);
	});
}

function chart() {
	// clear existing chart, if any
	document.getElementById('chart').innerHTML = "";

	// fill data
	var data = [];
	for(var item of timestampBalanceArray) {
		data.push({
			'Timestamp': d3.isoParse(item.Timestamp),
			'Balance': item.Balance,
		})
	}

	// set the dimensions and margins of the graph
	var margin = {top: 20, right: 20, bottom: 100, left: 75};
	var width = document.documentElement.clientWidth - 10/*buffer*/ - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;

	// set the ranges
	var x = d3.scaleTime().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

	// scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.Timestamp; }));
	y.domain([0, d3.max(data, function(d) { return d.Balance; })]);

	// define the line
	var valueline = d3.line()
	.x(function(d) { return x(d.Timestamp); })
	.y(function(d) { return y(d.Balance); });

	// append the svg obgect to the #chart div
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// add the X Axis
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b-%Y")))
	.selectAll("text")
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
	.attr("dy", ".15em")
	.attr("transform", "rotate(-65)");

	// add the Y Axis
	svg.append("g")
	.attr("class", "axis")
	.call(d3.axisLeft(y))
	.attr("y",10)

	// add the value-line
	svg.append("path")
	.data([data])
	.attr("class", "line")
	.attr("d", valueline);
}

function chart2() {
	var data = [
	{'date': "1-May-12", 'close': 58.13},
	{'date': "30-Apr-12", 'close': 53.98},
	{'date': "27-Apr-12" ,'close': 67.00},
	];

	// set the dimensions and margins of the graph
	var margin = {top: 20, right: 20, bottom: 100, left: 50},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	// parse the date / time
	var parseTime = d3.timeParse("%d-%b-%y");

	// set the ranges
	var x = d3.scaleTime().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

	// define the line
	var valueline = d3.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.close); });

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

			// format the data
			data.forEach(function(d) {
				d.date = parseTime(d.date);
				d.close = +d.close;
			});

	// Scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.date; }));
	y.domain([0, d3.max(data, function(d) { return d.close; })]);

		// Add the valueline path.
		svg.append("path")
		.data([data])
		.attr("class", "line")
		.attr("d", valueline);

		 // Add the X Axis
		 svg.append("g")
		 .attr("class", "axis")
		 .attr("transform", "translate(0," + height + ")")
		 .call(d3.axisBottom(x)
			.tickFormat(d3.timeFormat("%Y-%m-%d")))
		 .selectAll("text")	
		 .style("text-anchor", "end")
		 .attr("dx", "-.8em")
		 .attr("dy", ".15em")
		 .attr("transform", "rotate(-65)");

			// Add the Y Axis
			svg.append("g")
			.attr("class", "axis")
			.call(d3.axisLeft(y));

		}
