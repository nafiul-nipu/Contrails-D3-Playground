


let attributes = ["TotalParticles", "Ice", "NewIce", "IceVolume", "Temp"]

let time = [0.06,0.07,0.08,0.09,0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2]

const files = ["data/contrails 1.csv", "data/contrails 2.csv", "data/contrails 3.csv"];
let promises = [];

files.forEach(url => {
    promises.push(d3.csv(url))
});;

// let promise = d3.csv('data/contrails 1.csv')
Promise.all(promises).then(function(files){
    
    // yVal.domain(d3.extent(data.length))
    // console.log(data)
    createMultipleBars(files)
    createStreamGraph(files)
});




