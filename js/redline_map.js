// opacity will change how visible the zip code map is, with 0 being invisible and 1 being fully visible
function drawRedlineMap(opacity) {
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
        const URL = 'data/Worcester_Redlining_Zones.geojson';
        console.log("AHHHHH");
        d3.json(URL).then(async function (data) {
            console.log(data); // for debugging
            console.log("red line properties: ", data.features[0].properties); // checking properties
            const svg = d3.select("#redline-map")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`);




            svg.selectAll("path").remove(); // clear the svg before drawing, so that re-draws don't overlap

            const g = svg.append("g").attr("class", "zoom-layer");

            const projection = await getSharedWorcesterProjection(width, height, 35);

            let path = d3.geoPath().projection(projection);
            const redlineBounds = path.bounds(data);
            console.log("Redline render diagnostics:", {
                featureCount: data.features.length,
                bounds: redlineBounds
            });


            // mapping zone colors to color fills in map
            const zoneColors = {
                "Red": "#FF0000",
                "Yellow": "#FFFF00",
                "Green": "#13d213",
                "Blue": "#77b8e3",
                "Gray": "#808080"
            };



            g.selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", (d) => zoneColors[d.properties.ZoneColor])
                .attr("stroke", "black")
                .attr("opacity", opacity)
                .on("click", function (event, d) {
                    // when a zip code is clicked, dispatch a custom event with the zip code, breakdown data, and placeholders (for now until eloisa updates)
                    const redLineNum = d.properties.ZoneNumber;
                    const customEvent = new CustomEvent("redline-clicked", {
                        detail: {
                            redLineNum: redLineNum,
                            zoneColor: d.properties.ZoneColor,
                            description: d.properties.ZoneDesc,
                            zoneCategory: d.properties.ZoneCat
                        }
                    });
                    document.dispatchEvent(customEvent);
                    console.log("Dispatched redline-clicked event for redline number:", redLineNum); // for debugging
                    console.log("information about the redline zone:", {
                        redLineNum: redLineNum,
                        zoneColor: d.properties.ZoneColor,
                        description: d.properties.ZoneDesc
                    }); // for debugging
                });


        });
    });
}