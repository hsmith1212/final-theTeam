async function computeZipRedlineOverlap() {
  const redURL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/Worcester_Redlining_Zones.geojson';
  const zipURL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/ma_zipcodes.geojson';

  const [redData, zipData] = await Promise.all([d3.json(redURL), d3.json(zipURL)]);

  // keep Worcester ZIPs (same logic you already use)
  const worcesterZips = zipData.features.filter(f =>
    f.properties.CITY_TOWN && f.properties.CITY_TOWN.includes("WORCESTER")
  );

  // union all redlining polygons into one feature so we only intersect once per ZIP
  const redPolys = redData.features.filter(f =>
    f?.geometry && (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
  );

  let redUnion = redPolys[0];
  for (let i = 1; i < redPolys.length; i++) {
    // union sometimes returns null if a polygon is invalid; fallback to current union
    redUnion = turf.union(redUnion, redPolys[i]) || redUnion;
  }

  // compute % overlap per ZIP
  const results = worcesterZips.map(zip => {
    const zipArea = turf.area(zip);
    if (!zipArea) return null;

    const inter = turf.intersect(zip, redUnion);
    const interArea = inter ? turf.area(inter) : 0;

    return {
      zip: zip.properties.ZIP5 ?? zip.properties.ZCTA5CE10 ?? zip.properties.POSTCODE ?? zip.id,
      percentInsideRedlining: (interArea / zipArea) * 100
    };
  }).filter(Boolean);

  console.log("ZIP overlap results:", results);
  return results;
}