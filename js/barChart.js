function createMultipleBars(files){   

    let data = []
    let TempDomain = {}
    let TotalParticlesDomain = {}
    let TotalIcePercentageDomain = {}
    let newIcePercentageDomain = {}
    let iceVolumeDomain = {}
    files.forEach((value, i) =>{
        data[i] = []
        value.forEach(d=>{
            data[i].push({
                Timesteps: parseFloat(d["Timesteps"]),
                attributes: [
                    {
                        attribute: "TotalParticles",
                        value: parseInt(d["TotalParticles"])},
                    // Ice: parseInt(d["Ice"]),
                    // NewIce: parseInt(d["NewIce"]),
                    {attribute:"IceVolume",
                    value: parseFloat(d["IceVolume"])},
                    {attribute:"Temp", 
                    value: parseFloat(d["Temp"])},
                    
                    {attribute:"Ice",
                    value: parseFloat(d["TotalIcePercentage"])},
                    {attribute:"NewIce",
                    value: parseFloat(d["newIcePercentage"])}
                ]
                
            });
            TempDomain.min = Math.min(TempDomain.min || Infinity, parseFloat(d['Temp']));
            TempDomain.max = Math.max(TempDomain.max || -Infinity, parseFloat(d['Temp']));

            TotalParticlesDomain.min = Math.min(TotalParticlesDomain.min || Infinity, parseInt(d['TotalParticles']));
            TotalParticlesDomain.max = Math.max(TotalParticlesDomain.max || -Infinity, parseInt(d['TotalParticles']));

            TotalIcePercentageDomain.min = Math.min(TotalIcePercentageDomain.min || Infinity, parseFloat(d['TotalIcePercentage']));
            TotalIcePercentageDomain.max = Math.max(TotalIcePercentageDomain.max || -Infinity, parseFloat(d['TotalIcePercentage']));

            newIcePercentageDomain.min = Math.min(newIcePercentageDomain.min || Infinity, parseFloat(d['newIcePercentage']));
            newIcePercentageDomain.max = Math.max(newIcePercentageDomain.max || -Infinity, parseFloat(d['newIcePercentage']));

            iceVolumeDomain.min = Math.min(iceVolumeDomain.min || Infinity, parseFloat(d['IceVolume']));
            iceVolumeDomain.max = Math.max(iceVolumeDomain.max || -Infinity, parseFloat(d['IceVolume']));
        });
    });


     console.log(data)
     let windowHeight = window.innerHeight;
    //  let margin = 50;
 
     let width = d3.select('#bar-chart').node().clientWidth;
     let height = (windowHeight/2) - 70    

     let margin = {top:20, right:20, bottom:30, left:40}

     let w = width - margin.left - margin.right;

     let h = height - margin.top - margin.bottom

     let x0 = d3.scaleBand().domain(time).rangeRound([0, w]).padding(0.01)

     let x1 = d3.scaleBand().domain(attributes).rangeRound([0, x0.bandwidth()])

     let y = d3.scaleLinear().range([h-margin.top, 0])

     let xAxis = d3.axisBottom()
                    .scale(x0)

    let yAxis = d3.axisLeft().scale(y)

    let color = d3.scaleOrdinal()
                .range(d3.schemeAccent);;

    let svg = d3.select('#bar-chart')
                .append('svg')
                .attr('width', w + margin.left + margin.right)
                .attr('height', h + margin.top + margin.bottom)
                .append('g')
                .attr('transform', "translate("+margin.left+","+margin.top+")")

    svg.append('g')
        .attr('class', 'xAxis')
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);

    // svg.append("g")
    //     .attr("class", "y axis")
    //     .style('opacity','0')
    //     .call(yAxis)

    let bars = svg.selectAll('bars')
                    .data(data[0])
                    .enter()
                    .append('g')
                    .attr('class', 'g')
                    .attr("transform",function(d,i) { 
                        // console.log(d)
                        return "translate(" + x0(d.Timesteps) + ",0)"; });

    console.log(attributes)

    var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .direction('e')
      .html(function(d) { return `
        Attrbute: ${d.attribute} <br> 
        Value: ${d.value}`});
    svg.call(tool_tip);

    bars.selectAll("rect")
            .data(function(d){
                // console.log(d.attributes)
                return d.attributes})
        .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function(d,i) { 
                // console.log(d.attribute, x1(d.attribute))
                return x1(d.attribute); })
            .style("fill", function(d) { return color(d.attribute) })
            .attr("y", function(d) { 
                if(d.attribute == 'TotalParticles'){
                    y.domain([TotalParticlesDomain.min, TotalParticlesDomain.max])
                }else if(d.attribute == 'IceVolume'){
                    y.domain([iceVolumeDomain.min, iceVolumeDomain.max])
                }else if(d.attribute == 'Temp'){
                    y.domain([TempDomain.min, TempDomain.max])
                }else if(d.attribute == 'NewIce'){
                    y.domain([newIcePercentageDomain.min, newIcePercentageDomain.max])
                }else if(d.attribute == 'Ice'){
                    y.domain([TotalIcePercentageDomain.min, TotalIcePercentageDomain.max])
                }
                return y(d.value); })
            .attr("height", function(d) { 
                
                if(d.attribute == 'TotalParticles'){
                    y.domain([TotalParticlesDomain.min, TotalParticlesDomain.max])
                }else if(d.attribute == 'IceVolume'){
                    y.domain([iceVolumeDomain.min, iceVolumeDomain.max])
                }else if(d.attribute == 'Temp'){
                    y.domain([TempDomain.min, TempDomain.max])
                }else if(d.attribute == 'NewIce'){
                    y.domain([newIcePercentageDomain.min, newIcePercentageDomain.max])
                }else if(d.attribute == 'Ice'){
                    y.domain([TotalIcePercentageDomain.min, TotalIcePercentageDomain.max])
                }
                // console.log(h, y(d.value), d.attribute, d.value)
                return h - y(d.value); })
                .on('mouseover', tool_tip.show)
                .on('mouseout', tool_tip.hide);

    

}



// let x = d3.scaleLinear()
//                     .domain(d3.extent(time))
//                     .range([margin.left+margin.right+2, w])

//     svg.append('g')
//         .attr('transform', "translate(0," + h * 0.95 + ")")
//         .call(d3.axisBottom(x))

//     let y = d3.scaleBand()
//         .domain(["Contrails 1", "Contrails 2", "Contrails 3"])
//         .range([0, h])
//     let yAxis = d3.axisLeft()
//         .scale(y)

//     svg.append('g')
//         .call(yAxis)
//         .attr("transform", "translate("+(margin.left+margin.right+2)+",0)")
//         .selectAll("text")	  
//         // .style("font-size", '1em')          
//         .attr("transform", "rotate(-45)");