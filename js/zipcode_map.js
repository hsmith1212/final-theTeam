// opacity will change how visible the zip code map is, with 0 being invisible and 1 being fully visible
function drawZipcodeMap(opacity) {
    return new Promise((resolve, reject) => {
        // constants for the map
        const container = document.getElementById("map-container");

        const width = container.clientWidth;
        const height = container.clientHeight;
        /*
        const width = 500;
        const height = 500;
        */
        // load zip code data
        const URL = MASS_ZIP_GEOJSON_URL;
        const BREAKDOWN_CSV_URL = 'data/worcester_zip_redlining_breakdown.csv';
        const CURRENT_DAY_CSV = 'data/zipCodeInfo.csv';

        // Load both the map data and the breakdown data
        Promise.all([
            d3.json(URL),
            d3.csv(BREAKDOWN_CSV_URL),
            d3.csv(CURRENT_DAY_CSV)
        ]).then(async function ([data, breakdownData, currentDayData]) {
            console.log(data); // for debugging
            console.log(breakdownData); // for debugging
            console.log("zip code properities: ", data.features[0].properties); // checking properties

            const worcesterData = getWorcesterZipFeatureCollection(data);

            for (let i = 0; i < worcesterData.features.length; i++) {
                const feature = worcesterData.features[i];
                console.log(`Feature ${i}: POSTCODE=${feature.properties.POSTCODE}, geometry type=${feature.geometry.type}`);
            }



            const svg = d3.select("#zipcode-map")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`);




            svg.selectAll("path").remove(); // clear the svg before drawing, so that re-draws don't overlap

            const g = svg.append("g").attr("class", "zoom-layer");

            const projection = await getSharedWorcesterProjection(width, height, 35);

            let path = d3.geoPath().projection(projection);
            const zipBounds = path.bounds(worcesterData);
            console.log("ZIP render diagnostics:", {
                featureCount: worcesterData.features.length,
                bounds: zipBounds
            });



            g.selectAll("path")
                .data(worcesterData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "transparent")
                .attr("stroke", "black")
                .attr("stroke-opacity", opacity)
                .attr("stroke-width", 1.5)
                .style("pointer-events", "fill")
                .style("cursor", "pointer")
                .on("click", function (event, d) {
                    //this code will make the selected zone "light up"
                    // prevent the click from bubbling up to the document
                    event.stopPropagation();

                    // remove selection from all zones
                    d3.selectAll("#zipcode-map path")
                        .classed("selected", false);

                    // add selection to the clicked one
                    d3.select(this)
                        .classed("selected", true);

                    const zipCode = d.properties.POSTCODE;

                    // Look up redlining breakdown for this zip.
                    // CSV column is lowercase "zip"; pad to 5 digits to match POSTCODE.
                    const breakdown = breakdownData.find(row =>
                        row.zip.padStart(5, '0') === String(zipCode)
                    );

                    const currentDayInfo = currentDayData.find(row =>
                        row.zip_code.padStart(5, '0') === String(zipCode)
                    );

                    const medianHousePrice = currentDayInfo ? currentDayInfo.median_housing_price : null;
                    const medianIncome = currentDayInfo ? currentDayInfo.median_household_income : null;

                    const detail = {
                        zipCode: zipCode,
                        breakdownData: breakdown || {},
                        medianHousePrice: medianHousePrice,
                        medianIncome: medianIncome
                    };

                    document.dispatchEvent(new CustomEvent("zipcode-clicked", { detail }));

                    console.log("zipcode-clicked →", zipCode, detail);
                });
        })
            .catch(err => console.error("Failed to load data:", err)); // if there is an error loading data
    });
}

document.addEventListener("click", function () {
    d3.selectAll("#zipcode-map path")
        .classed("selected", false);
});