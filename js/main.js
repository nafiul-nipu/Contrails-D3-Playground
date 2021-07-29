let margin = {left: 100, right: 10, top: 10, bottom: 100};
let width = 800 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

let xVal, yVal

let svg = d3.select("#chart-area")
			.append("svg")
			.attr("viewBox", "0 0 " + (width + margin.left + margin.right) +" " + (height + margin.top + margin.bottom) + " "); //min-x , min -y , width , height
			// .attr("width", width + margin.left + margin.right)
			// .attr("height", height + margin.top + margin.bottom);

let g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");



const mixingData = {}
mixingData.temperature = []
mixingData.pressure = []


d3.csv("data/mixingLine.csv", data =>{
	mixingData.temperature.push((parseFloat(data['temperature'])));
	mixingData.pressure.push((parseFloat(data['pressure'])));
}).then(function(){
	console.log(d3.extent(mixingData.temperature))

	xVal = d3.scaleLinear()
			.domain(d3.extent(mixingData.temperature))
		  .range([0, width]);

	yVal = d3.scaleLinear()
		.domain(d3.extent(mixingData.pressure))
			.range([height, 0]);


	let xAxis = d3.axisBottom(xVal)

	let xAxis_group = g.append("g")
						.attr("class", "x axis")
						.call(xAxis)
						.attr("transform", "translate(0, " + height + ")");

	let xLabel = g.append("g")
				.append("text")
				.attr("class", "x label")
				.text("Temperature")
				.attr("font-size", "20px")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", height + 40);
				
	let yAxis = d3.axisLeft(yVal)

	let yAxis_group = g.append("g")
						.attr("class", "y axis")
						.call(yAxis)

	let yLabel = g.append("g")
				.append("text")
				.attr("class", "y label")
				.text("Partial Pressure")
				.attr("transform", "rotate(-90)")
				.attr("text-anchor", "middle")
				.attr("x", -(height/2))
				.attr("y", -30)
				.attr("font-size", "20px");

	let scatterplot = g.append('g')
						.selectAll('dot')
						.data(mixingData.temperature)
						.enter()
						.append('circle')
						.attr('cx', function(d, i){ 
							return xVal(d)})
						.attr('cy', function(d,i){ return yVal(mixingData.pressure[i])})
						.attr('r', 1)
						.style("fill", 'black')
})

const saturation = []
// saturation.temp = []
// saturation.ice = []
// saturation.water = []

d3.csv('data/saturationCurve.csv', data => {
	// saturation.temp.push((parseFloat(data['temp'])));
	// saturation.ice.push((parseFloat(data['ice'])));
	// saturation.water.push((parseFloat(data['water'])));
	saturation.push(((data)));
}).then(function(){
	console.log(saturation)

	// let xValT = d3.scaleLinear()
	// 		.domain([200, 300])
	// 	  .range([0, width]);

	// let yValI = d3.scaleLinear()
	// 	.domain([0.16248073676043007, 4258.528558415896])
	// 		.range([height, 0]);

	let satIce = d3.line()
					.x(p => xVal(p.temp))
					.y(p => yVal(p.ice))
					// .curve(d3.curveCardinal)

	let satWater = d3.line()
					.x(p => xVal(p.temp))
					.y(p => yVal(p.water))
					// .curve(d3.curveCardinal)

	let iceSatCurve = g.append('g')
						.append('path')
						.attr('d', satIce(saturation))
						.attr('fill', 'none')
						.attr('stroke', 'green')

	let waterSatCurve = g.append('g')
						.append('path')
						.attr('d', satWater(saturation))
						.attr('fill', 'none')
						.attr('stroke', 'red')
})
