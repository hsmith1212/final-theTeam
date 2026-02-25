/* This file containes event listeners that change which map is in focus
by changing the opacity of the maps. When a map is in focus, it will have an opacity of 1, 
while the other map will have an opacity of 0.15. This makes it easier to see the map that 
is in focus, while still being able to see the other map in the background. It also changes the 
layering of the maps so that the more transparent map is on top, so it can still be seen.
The event listeners are triggered by the buttons in the index.html file, which dispatch custom events 
"focus-zipcode" and "focus-redline".
*/

document.addEventListener("focus-zipcode", () => {
    d3.select("#redline-map").raise(); // put more transparent map on top, so that it is easier to see the zip code map when it is focused
    d3.select("#zipcode-map")
        .selectAll("path")
        .attr("opacity", 1);

    d3.select("#redline-map")
        .selectAll("path")
        .attr("opacity", 0.15);
});

document.addEventListener("focus-redline", () => {
    d3.select("#zipcode-map").raise(); // put more transparent map on top, so that it is easier to see the redline map when it is focused
    d3.select("#zipcode-map")
        .selectAll("path")
        .attr("opacity", 0.15);

    d3.select("#redline-map")
        .selectAll("path")
        .attr("opacity", 1);
});
