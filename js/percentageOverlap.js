async function computeZipRedlineOverlap() {
  const redURL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/Worcester_Redlining_Zones.geojson';
  const zipURL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/ma_zipcodes.geojson';

  const [redData, zipData] = await Promise.all([d3.json(redURL), d3.json(zipURL)]);

  // Worcester ZIPs
  const worcesterZips = zipData.features.filter(f =>
    f.properties.CITY_TOWN && f.properties.CITY_TOWN.includes("WORCESTER")
  );

  // Valid redlining polygons only
  const redPolys = redData.features.filter(f =>
    f?.geometry && (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
  );

  const ZONES = ["Red", "Yellow", "Green", "Blue", "Gray"];

  const results = worcesterZips.map(zip => {
    const zipArea = turf.area(zip);
    if (!zipArea) return null;

    // accumulate intersection areas by zone colors
    const areaByZone = Object.fromEntries(ZONES.map(z => [z, 0]));
    let areaUnknown = 0;

    for (const zone of redPolys) {
      const inter = turf.intersect(zip, zone);
      if (!inter) continue;

      const interArea = turf.area(inter);
      const zoneColor = zone.properties?.ZoneColor;

      if (areaByZone[zoneColor] != null) areaByZone[zoneColor] += interArea;
      else areaUnknown += interArea;
    }

    // convert to percentages of ZIP area
    const pctByZone = {};
    let pctTotal = 0;

    for (const z of ZONES) {
      const pct = (areaByZone[z] / zipArea) * 100;
      pctByZone[z] = pct;
      pctTotal += pct;
    }

    const pctUnknown = (areaUnknown / zipArea) * 100;

    return {
      zip: zip.properties.ZIP5 ?? zip.properties.ZCTA5CE10 ?? zip.properties.POSTCODE ?? zip.id,
      percentByZone: pctByZone,     // percent by color zone
      percentUnknown: pctUnknown,   // if any polygons don't have a color zone
      percentTotal: pctTotal + pctUnknown
    };
  }).filter(Boolean);

  console.log("ZIP overlap breakdown:", results);
  return results;
}