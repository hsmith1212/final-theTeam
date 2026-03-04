const MASS_ZIP_GEOJSON_URL = 'data/ma_zipcodes.geojson';
const WORCESTER_ZIP_CODES = new Set([
    '01602', '01603', '01604', '01605', '01606',
    '01607', '01608', '01609', '01610'
]);

function normalizeCityTownName(value) {
    return String(value || "").trim().toUpperCase();
}

function isWorcesterCityFeature(feature) {
    return normalizeCityTownName(feature?.properties?.CITY_TOWN) === "WORCESTER";
}

function isWorcesterZipCode(feature) {
    const zip = String(feature?.properties?.POSTCODE || "").padStart(5, '0');
    return WORCESTER_ZIP_CODES.has(zip);
}

function getWorcesterZipFeatureCollection(data) {
    const features = (data?.features || []).filter(function (feature) {
        return isWorcesterCityFeature(feature) && isWorcesterZipCode(feature);
    });
    return {
        type: "FeatureCollection",
        features
    };
}

function walkCoordinates(coords, callback) {
    if (!Array.isArray(coords)) return;

    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        callback(coords[0], coords[1]);
        return;
    }

    for (const child of coords) {
        walkCoordinates(child, callback);
    }
}

function getLonLatBounds(featureCollection) {
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;

    for (const feature of featureCollection.features) {
        walkCoordinates(feature?.geometry?.coordinates, function (lon, lat) {
            if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;
            if (lon < minLon) minLon = lon;
            if (lat < minLat) minLat = lat;
            if (lon > maxLon) maxLon = lon;
            if (lat > maxLat) maxLat = lat;
        });
    }

    if (!Number.isFinite(minLon) || !Number.isFinite(minLat) || !Number.isFinite(maxLon) || !Number.isFinite(maxLat)) {
        throw new Error('Could not compute Worcester lon/lat bounds.');
    }

    return {
        minLon,
        minLat,
        maxLon,
        maxLat,
        lonSpan: maxLon - minLon,
        latSpan: maxLat - minLat
    };
}

let sharedWorcesterFeatureCollectionPromise = null;

function getSharedWorcesterProjection(width, height, padding = 20) {
    if (!sharedWorcesterFeatureCollectionPromise) {
        sharedWorcesterFeatureCollectionPromise = d3.json(MASS_ZIP_GEOJSON_URL).then(function (data) {
            const worcesterData = getWorcesterZipFeatureCollection(data);

            if (!worcesterData.features.length) {
                throw new Error("No Worcester ZIP features found for shared projection.");
            }

            return worcesterData;
        });
    }

    return sharedWorcesterFeatureCollectionPromise.then(function (worcesterData) {
        const bounds = getLonLatBounds(worcesterData);

        const usableWidth = Math.max(1, width - padding * 2);
        const usableHeight = Math.max(1, height - padding * 2);
        const lonSpan = Math.max(bounds.lonSpan, 1e-9);
        const latSpan = Math.max(bounds.latSpan, 1e-9);

        // Compute both scales
        const xscale = usableWidth / lonSpan;
        const yscale = usableHeight / latSpan;

        // Use the smaller scale to maintain aspect ratio
        const scale = Math.min(xscale, yscale);

        // Projected dimensions
        const projectedWidth = lonSpan * scale;
        const projectedHeight = latSpan * scale;

        // Center offsets
        const offsetX = (width - projectedWidth) / 2;
        const offsetY = (height - projectedHeight) / 2;

        const projection = d3.geoTransform({
            point: function (lon, lat) {
                const x = offsetX + (lon - bounds.minLon) * scale;
                const y = offsetY + (bounds.maxLat - lat) * scale;
                this.stream.point(x, y);
            }
        });

        const projectedBounds = d3.geoPath(projection).bounds(worcesterData);
        console.log("Shared Worcester projection diagnostics:", {
            featureCount: worcesterData.features.length,
            lonLatBounds: bounds,
            projectedBounds,
            scale,
            offsetX,
            offsetY
        });

        return projection;
    });
}