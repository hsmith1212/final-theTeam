// opacity will change how visible the zip code map is, with 0 being invisible and 1 being fully visible
function drawZipcodeMap(opacity) {
    // constants for the map
    const width = 500;
    const height = 500;
    // load zip code data
    const URL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/ma_zipcodes.geojson';
    d3.json(URL).then(function (data) {
        console.log(data); // for debugging

        // only keep Worcester zip codes. Auto complete helped with this, but I edited what property to filter by
        const worcesterData = {
            type: "FeatureCollection",
            features: data.features.filter(feature =>
                feature.properties.CITY_TOWN.includes("WORCESTER")
            )
        };

        console.log(worcesterData); // for debugging
        console.log(worcesterData.features.map(f => f.properties.COUNTY)); // also debugging

        const svg = d3.select("#zipcode-map")
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("path").remove(); // clear the svg before drawing, so that re-draws don't overlap

        // for creating map, referenced https://www.d3indepth.com/geographic/
        const projection = d3.geoMercator()
            .center([-71.8, 42.27])
            .scale(130000) // needed to way up the map to fit the svg, this was found through trial and error
            .translate([width / 2, height / 2]);

        console.log(projection([-71.8, 42.2])); // for debugging, should be around the center of the map
        console.log(projection([-71.9, 42.3]));
        console.log(width, height); // for debugging, should be 500, 500

        let path = d3.geoPath().projection(projection);

        svg.selectAll("path")
            .data(worcesterData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("opacity", opacity);
    });
}