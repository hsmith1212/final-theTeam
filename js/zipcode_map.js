// opacity will change how visible the zip code map is, with 0 being invisible and 1 being fully visible
function drawZipcodeMap(opacity) {
    // load zip code data
    d3.json('../data/ma_zipcodes.geojson').then(function(data){ 
        console.log(data);
        print(data);
    });
}