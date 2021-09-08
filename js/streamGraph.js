function createStreamGraph(data){
    // console.log(TotalParticlesDomain)
    // console.log(time)
    let windowHeight = window.innerHeight;
    // let margin = 50;

    // let width = 500
    let width = d3.select('#bar-chart').node().clientWidth;
    //  let height = 120
    let height =   (windowHeight/2) - 70  

    let margin = {top:20, right:20, bottom:30, left:40}

    let w = width - margin.left - margin.right
    
    let h = height - margin.top - margin.bottom

    let svg = d3.select('#streamgraph')
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top+margin.bottom)
            .append('g')
            .attr('transform', "translate("+margin.left+","+margin.top+")")

    // let keys = data[0].columns
    // console.log(data[0].columns)

    var x = d3.scaleLinear()
            .domain(d3.extent(time))
            .range([2, w])
    svg.append('g')
        .attr('transform', "translate(0," + h + ")")
        .call(d3.axisBottom(x))

        let yScale = d3.scaleBand()
        .domain(["Contrails 3", "Contrails 2", "Contrails 1"])
        .range([0, h])
        let yAxis = d3.axisLeft()
            .scale(yScale)

        svg.append('g')
        .call(yAxis)
        .attr("transform", "translate("+(1)+",0)")
        .selectAll("text")	  
        // .style("font-size", '1em')          
        .attr("transform", "rotate(-45)");
    
     // color palette
     var color = d3.scaleOrdinal()
     .domain(attributes)
     .range(d3.schemeAccent);


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

    // console.log(stTemp,stTotalPar,stTotalIce,stNewIce,sticeVol)

    let stTempScale = d3.scaleLinear()
        .range([0,250])
    let stTotalParScale = d3.scaleLinear()
        .range([0,250])
    let stTotalIceScale = d3.scaleLinear()
        .range([0,250])
    let stNewIceScale = d3.scaleLinear()
        .range([0,250])
    let sticeVolScale = d3.scaleLinear()
        .range([0,250])

    data.forEach((contrail, i) => {
        // console.log(stTemp[i].min, stTemp[i].max)
        
        stTempScale.domain([stTemp[i].min, stTemp[i].max])
        stTotalParScale.domain([stTotalPar[i].min, stTotalPar[i].max])
        stTotalIceScale.domain([stTotalIce[i].min, stTotalIce[i].max])
        stNewIceScale.domain([stNewIce[i].min, stNewIce[i].max])
        sticeVolScale.domain([sticeVol[i].min, sticeVol[i].max])

        contrail.forEach((row, i) => {
            // console.log(stTotalParScale(row.TotalParticles))

            row.TotalParticles = stTotalParScale(row.TotalParticles)
            row.Ice = stTotalIceScale(row.Ice )
            row.NewIce = stNewIceScale(row.NewIce )
            row.IceVolume = sticeVolScale(row.IceVolume) 
            row.Temp = stTempScale(row.Temp)
        })
    })

    for (let j = 0; j < data.length; j++){
        // console.log(h)
        
        // console.log((j+1)*((h-10)/3), j*(h-10)/3)
        var y = d3.scaleLinear()
                .domain([-600, 600])
                .range([(j+1)*((h-10)/3), j*(h-10)/3 ]);

   

        //stack the data?
        var stackedData = d3.stack()
        // .offset(d3.stackOffsetSilhouette)
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderInsideOut)
        .keys(attributes)
        (data[j])
    

        // Area generator
        var area = d3.area()
        .x(function(d) { 
            // console.log(d)
            return x(d.data.Timesteps); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(d3.curveBasis)

        // Show the areas
        console.log(stackedData)
        svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", function(d){return `${d.key}`})
        .attr("id", `contrails${j}`)
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    }

      // Add Y axis
    


}