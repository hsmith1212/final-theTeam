// opacity will change how visible the zip code map is, with 0 being invisible and 1 being fully visible
function drawZipcodeMap(opacity) {
    // constants for the map
    const width = 500;
    const height = 500;
    // load zip code data
    const URL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/ma_zipcodes.geojson';
    const BREAKDOWN_CSV_URL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/refs/heads/main/data/worcester_zip_redlining_breakdown.csv';
    
    // Load both the map data and the breakdown data
    Promise.all([
        d3.json(URL),
        d3.csv(BREAKDOWN_CSV_URL)
    ]).then(function ([data, breakdownData]) {
        console.log(data); // for debugging
        console.log(breakdownData); // for debugging
        console.log("zip code properities: ", data.features[0].properties); // checking properties

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
            .attr("fill", "transparent")
            .attr("stroke", "black")
            .attr("stroke-opacity", opacity)
            .on("click", function (event, d) {
                // when a zip code is clicked, dispatch a custom event with the zip code, breakdown data, and placeholders (for now until eloisa updates)
                const zipCode = d.properties.POSTCODE;
                
                // find the % coloring data for this zipcode
                const zipBreakdownData = breakdownData.find(row => String(row.zip) === String(zipCode));
                
                const customEvent = new CustomEvent("zipcode-clicked", {
                    detail: {
                        zipCode: zipCode,
                        breakdownData: zipBreakdownData || {},
                        // placeholders for eloisa
                        demographicData: null,
                        historicalNotes: null,
                        additionalContext: null
                    }
                });
                document.dispatchEvent(customEvent);
                console.log("Dispatched zipcode-clicked event for zip code:", zipCode); // for debugging
                console.log("Breakdown data for this zip code:", zipBreakdownData); // for debugging
            });
    })
    .catch(err => console.error("Failed to load data:", err)); // if there is an error loading data
}