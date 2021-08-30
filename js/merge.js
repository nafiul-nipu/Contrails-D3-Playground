let attributes = ["TotalParticles", "Ice", "NewIce", "IceVolume", "Temp"]

let time = [0.06,0.07,0.08,0.09,0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2]

const files = ["data/contrails 1.csv", "data/contrails 2.csv", "data/contrails 3.csv"];
let promises = [];

files.forEach(url => {
    promises.push(d3.csv(url))
});;

// let promise = d3.csv('data/contrails 1.csv')
Promise.all(promises).then(function(files){
    init(files)
    // createMultipleBars(files)
    // createStreamGraph(files)
});

function init(data){
    let width = 960 ;
    let height = 500;
    let margin = {top:20, right:20, bottom:50, left:40}

    let barx0 = d3.scaleBand().domain(time).rangeRound([2, width]).padding(0.1)

    let xAxis = d3.axisBottom()
                    .scale(barx0)

    let yScale = d3.scaleBand()
    .domain(["Contrails 1", "Contrails 2", "Contrails 3"])
    .range([0, height])
    let yAxis = d3.axisLeft()
        .scale(yScale)

    let svg = d3.select('#merge')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', "translate("+margin.left+","+margin.top+")")

    svg.append('g')
                .attr('class', 'xAxis')
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
        
    svg.append('g')
                .call(yAxis)
                .attr("transform", "translate("+(1)+",0)")
                .selectAll("text")	  
                // .style("font-size", '1em')          
                .attr("transform", "rotate(-45)");

    // streamgraph
    var streamColor = d3.scaleOrdinal()
     .domain(attributes)
     .range(d3.schemePastel2);

    var streamx = d3.scaleLinear()
            .domain(d3.extent(time))
            .range([2, width])

    for (let j = 0; j < data.length; j++){
        // console.log(h)
        
        // console.log((j+1)*((h-10)/3), j*(h-10)/3)
        var y = d3.scaleLinear()
                .domain([-2300, 2300])
                // .range([(((height-margin.top)/data.length)*(j+1)) + (5*j), (((height-margin.top)/data.length)*j)+(5*j)])
                .range([(j+1)*((height-10)/3), j*(height-10)/3 ]);

   

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
            return streamx(d.data.Timesteps); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(d3.curveBasis)

        // Show the areas
        // console.log(stackedData)
        svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", function(d){return `${d.key}`})
        .attr("id", `contrails${j}`)
        .style("fill", function(d) { return streamColor(d.key); })
        .attr("d", area)

    }

    // bar graph   

    let barData = []
    let TempDomain = {}
    let TotalParticlesDomain = {}
    let TotalIcePercentageDomain = {}
    let newIcePercentageDomain = {}
    let iceVolumeDomain = {}
    data.forEach((value, i) =>{
        barData[i] = []
        value.forEach(d=>{
            barData[i].push({
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


    var barcolor = d3.scaleOrdinal()
     .domain(attributes)
     .range(d3.schemeSet1);

    let barX1 = d3.scaleBand().domain(attributes).rangeRound([1, barx0.bandwidth()])

    var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .direction('e')
    .html(function(d) { return `
    Attrbute: ${d.attribute} <br> 
    Value: ${d.value}`});

    svg.call(tool_tip);



    for(let j = 0; j<barData.length; j++){
        // let y = d3.scaleLinear().range([(j+1)*((h-margin.top)/3), j*(h-margin.top)/3])

        // console.log((j+1)*((h-margin.top)/barData.length), j*((h)/barData.length))       


        let yPosition = d3.scaleLinear()
                            .range([(((height-margin.top)/barData.length)*(j+1)) + (5*j), (((height-margin.top)/barData.length)*j)+(5*j)])
        // let yPosition = d3.scaleLinear().range([j*((h-margin.top)/barData.length), (j+1)*((h-margin.top)/barData.length)])
        let yHeight = d3.scaleLinear().range([((height-margin.top)/data.length), 0])

        let bars = svg.append('g').selectAll('bars')
        .data(barData[j])
        .enter()
        .append('g')
        .attr('class', 'g')
        .attr("transform",function(d,i) { 
            // console.log(d)
            return "translate(" + barx0(d.Timesteps) + ",0)"; });

        // console.log(attributes)      


        bars.selectAll("rect")
        .data(function(d){
            // console.log(d.attributes)
            return d.attributes})
        .enter().append("rect")
        .attr("width", barX1.bandwidth())
        .attr("x", function(d,i) { 
            // console.log(d.attribute, x1(d.attribute))
            return barX1(d.attribute); })
        .style("fill", function(d) { return barcolor(d.attribute) })
        .attr("y", function(d) { 
            if(d.attribute == 'TotalParticles'){
                yPosition.domain([TotalParticlesDomain.min, TotalParticlesDomain.max])
            }else if(d.attribute == 'IceVolume'){
                yPosition.domain([iceVolumeDomain.min, iceVolumeDomain.max])
            }else if(d.attribute == 'Temp'){
                yPosition.domain([TempDomain.min, TempDomain.max])
            }else if(d.attribute == 'NewIce'){
                yPosition.domain([newIcePercentageDomain.min, newIcePercentageDomain.max])
            }else if(d.attribute == 'Ice'){
                yPosition.domain([TotalIcePercentageDomain.min, TotalIcePercentageDomain.max])
            }
            return yPosition(d.value); 
            // console.log(d.attribute, d.value, yPosition(d.value))
            // return (h-2.7*margin.top-margin.bottom) - j*((h+margin.top)/data.length)
        })
        .attr("height", function(d) { 
            
            if(d.attribute == 'TotalParticles'){
                yHeight.domain([TotalParticlesDomain.min, TotalParticlesDomain.max])
            }else if(d.attribute == 'IceVolume'){
                yHeight.domain([iceVolumeDomain.min, iceVolumeDomain.max])
            }else if(d.attribute == 'Temp'){
                yHeight.domain([TempDomain.min, TempDomain.max])
            }else if(d.attribute == 'NewIce'){
                yHeight.domain([newIcePercentageDomain.min, newIcePercentageDomain.max])
            }else if(d.attribute == 'Ice'){
                yHeight.domain([TotalIcePercentageDomain.min, TotalIcePercentageDomain.max])
            }
            return ((height-10)/data.length) - yHeight(d.value); })
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide)
            .attr('opacity', 0.5);

            } 



}
