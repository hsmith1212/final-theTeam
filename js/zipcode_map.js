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
            features: data.features
                .filter(feature => feature.properties.CITY_TOWN.includes("WORCESTER"))
        };

        for (let i = 0; i < worcesterData.features.length; i++) {
            const feature = worcesterData.features[i];
            console.log(`Feature ${i}: POSTCODE=${feature.properties.POSTCODE}, geometry type=${feature.geometry.type}`);
        }
        


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

                // Build O(1) lookup for CSV rows by zip
        const breakdownByZip = new Map(
        breakdownData.map(r => [String(r.zip).padStart(5, "0"), r])
        );

        svg.selectAll("path.zip")
        .data(worcesterData.features, f => String(f.properties.POSTCODE).padStart(5, "0"))
        .join("path")
        .attr("class", "zip")
        .attr("d", path)
        .attr("fill", "rgba(0,0,0,0)")     // transparent but still clickable
        .attr("stroke", "black")
        .attr("stroke-opacity", opacity)
        .style("pointer-events", "all")
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            // IMPORTANT: normalize to string ZIP
            const zipCode = String(d.properties.POSTCODE).padStart(5, "0");

            const breakdown = breakdownByZip.get(zipCode) || null;

            const detail = {
            zipCode,
            breakdownData: breakdown || {},
            demographicData: null,
            historicalNotes: null,
            additionalContext: null
            };

            document.dispatchEvent(new CustomEvent("zipcode-clicked", { detail }));
            console.log("zipcode-clicked →", zipCode, detail);
        });
    })
        .catch(err => console.error("Failed to load data:", err)); // if there is an error loading data
}