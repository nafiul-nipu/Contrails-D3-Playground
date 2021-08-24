let windowHeight = window.innerHeight;
let margin = 50;

let attributes = ["TotalParticles", "TotalIcePercentage", "newIcePercentage", "IceVolume", "Temp"]

let time = [0.06,0.07,0.08,0.09,0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2]


let width = d3.select('#bar-chart').node().clientWidth;
let height = (windowHeight/2) - margin


const files = ["data/contrails 1.csv", "data/contrails 2.csv", "data/contrails 3.csv"];
let promises = [];

files.forEach(url => {
    promises.push(d3.csv(url))
});;

let promise = d3.csv('data/contrails 1.csv')
promise.then(function(data){
    console.log(data)
    // yVal.domain(d3.extent(data.length))
    createMultipleBars(data)
    createStreamGraph(data)
});


function createMultipleBars(data){    
    let svg = d3.select('#bar-chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)

    let xScale = d3.scaleLinear()
                    .domain(d3.extent(time))
                    .range([margin, width-margin])
    let xAxis = d3.axisTop()
                    .scale(xScale)

    svg.append('g')
        .call(xAxis)
        .attr("transform", "translate(10," + margin +")")

    let yScale = d3.scaleBand()
                    .domain(["Contrails 1", "Contrails 2", "Contrails 3"])
                    .range([10, height - margin])
    let yAxis = d3.axisLeft()
                    .scale(yScale)
    
    svg.append('g')
        .call(yAxis)
        .attr("transform", "translate(50,40)")
        .selectAll("text")	  
            // .style("font-size", '1em')          
            .attr("transform", "rotate(-45)");

}

function createStreamGraph(data){

    let margin = {top:20, right:20, bottom:0, left:10}

    let w = width - margin.left - margin.right
    
    let h = height - margin.top - margin.bottom

    let svg = d3.select('#streamgraph')
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top+margin.bottom)
            .append('g')
            .attr('transform', "translate("+margin.left+","+margin.top+")")

    // let keys = data[0].columns

    var x = d3.scaleLinear()
            .domain(d3.extent(time))
            .range([0, w])
    svg.append('g')
        .attr('transform', "translate(0," + h * 0.8 + ")")
        .call(d3.axisBottom(x))

      // Add Y axis
    var y = d3.scaleLinear()
    .domain([-3500, 3500])
    .range([ h, 0 ]);

    // color palette
    var color = d3.scaleOrdinal()
    .domain(attributes)
    .range(d3.schemeDark2);

    //stack the data?
    var stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(attributes)
    (data)

    // create a tooltip
    var Tooltip = svg
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("font-size", 17)

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
    Tooltip.style("opacity", 1)
    d3.selectAll(".myArea").style("opacity", .2)
    d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    var mousemove = function(d,i) {
    grp = attributes[i]
    Tooltip.text(grp)
    }
    var mouseleave = function(d) {
    Tooltip.style("opacity", 0)
    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }

    // Area generator
    var area = d3.area()
    .x(function(d) { 
        console.log(d)
        return x(d.data.Timesteps); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })

    // Show the areas
    svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.attributes); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)


}