async function computeZipRedlineOverlap() {

  const redURL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/Worcester_Redlining_Zones.geojson';
  const zipURL = 'https://raw.githubusercontent.com/hsmith1212/final-theTeam/40393d3f61b1e17cef011baaadc89e315d49a4f9/data/ma_zipcodes.geojson';

  const [redData, zipData] = await Promise.all([
    d3.json(redURL),
    d3.json(zipURL)
  ]);

  // Filter Worcester ZIPs
  const worcesterZips = zipData.features.filter(f =>
    f.properties.CITY_TOWN &&
    f.properties.CITY_TOWN.includes("WORCESTER")
  );

  // Keep valid redlining polygons
  const redPolys = redData.features.filter(f =>
    f?.geometry &&
    (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
  );

  const results = worcesterZips.map(zip => {

    const zipArea = turf.area(zip);
    if (!zipArea) return null;

    let maxIntersectionArea = 0;
    let dominantZoneColor = null;

    redPolys.forEach(zone => {

      const intersection = turf.intersect(zip, zone);

      if (intersection) {
        const interArea = turf.area(intersection);

        if (interArea > maxIntersectionArea) {
          maxIntersectionArea = interArea;
          dominantZoneColor = zone.properties.ZoneColor ?? null;
        }
      }

    });

    const percentLargestZone = (maxIntersectionArea / zipArea) * 100;

    return {
      zip: zip.properties.ZIP5 ??
           zip.properties.ZCTA5CE10 ??
           zip.properties.POSTCODE ??
           zip.id,
      percentLargestZone,
      dominantZoneColor
    };

  }).filter(Boolean);

  console.log("Largest-zone overlap results:", results);
  return results;
}