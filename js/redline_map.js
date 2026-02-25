// opacity will change how visible the zip code map is, with 0 being invisible and 1 being fully visible
function drawRedlineMap(opacity) {
    // constants for the map
    const width = 500;
    const height = 500;
    // load zip code data
    const URL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/Worcester_Redlining_Zones.geojson';
    d3.json(URL).then(function (data) {
        console.log(data); // for debugging
        console.log(data.features[0].properties); // checking properties
        const svg = d3.select("#redline-map")
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


        // mapping zone colors to color fills in map
        const zoneColors = {
            "Red": "#FF0000",
            "Yellow": "#FFFF00",
            "Green": "#13d213",
            "Blue": "#3e3ef3",
            "Gray": "#808080"
        };

        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d) => zoneColors[d.properties.ZoneColor])
            .attr("stroke", "black")
            .attr("opacity", opacity);
    });
}