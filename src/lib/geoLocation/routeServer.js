import { Op } from "sequelize";

import Cities from "@/models/cities";
import Bus from "@/models/bus";
import Sightseeing from "@/models/Sightseeing";

// ============================================================
// GEOCODE CACHE
// ============================================================

const geocodeCache = new Map();

// ============================================================
// KNOWN COORDINATES
// ============================================================

export const KNOWN_COORDINATES = {
  // Cities
  delhi: {
    lat: 28.6139,
    lng: 77.209,
    state: "Delhi",
    category: "CITY",
    icon: "MapPin",
  },

  "new delhi": {
    lat: 28.6139,
    lng: 77.209,
    state: "Delhi",
    category: "CITY",
    icon: "MapPin",
  },

  mathura: {
    lat: 27.4924,
    lng: 77.6737,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "MapPin",
  },

  vrindavan: {
    lat: 27.5807,
    lng: 77.7006,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "Landmark",
  },

  nidhivan: {
    lat: 27.5815,
    lng: 77.702,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Trees",
  },

  "banke bihari": {
    lat: 27.5809,
    lng: 77.7003,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  "banke bihari temple": {
    lat: 27.5809,
    lng: 77.7003,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  "prem mandir": {
    lat: 27.5714,
    lng: 77.6729,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  "iskcon vrindavan": {
    lat: 27.5721,
    lng: 77.6784,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  govardhan: {
    lat: 27.4975,
    lng: 77.4647,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Mountain",
  },

  barsana: {
    lat: 27.6492,
    lng: 77.3752,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  agra: {
    lat: 27.1767,
    lng: 78.0081,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "MapPin",
  },

  "taj mahal": {
    lat: 27.1751,
    lng: 78.0421,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  "fatehpur sikri": {
    lat: 27.0945,
    lng: 77.6679,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  jaipur: {
    lat: 26.9124,
    lng: 75.7873,
    state: "Rajasthan",
    category: "CITY",
    icon: "MapPin",
  },

  manali: {
    lat: 32.2432,
    lng: 77.1892,
    state: "Himachal Pradesh",
    category: "CITY",
    icon: "Mountain",
  },

  "solang valley": {
    lat: 32.3166,
    lng: 77.1578,
    state: "Himachal Pradesh",
    category: "SIGHTSEEING",
    icon: "Mountain",
  },

  "rohtang pass": {
    lat: 32.3716,
    lng: 77.2466,
    state: "Himachal Pradesh",
    category: "SIGHTSEEING",
    icon: "Mountain",
  },

  shimla: {
    lat: 31.1048,
    lng: 77.1734,
    state: "Himachal Pradesh",
    category: "CITY",
    icon: "Mountain",
  },

  haridwar: {
    lat: 29.9457,
    lng: 78.1642,
    state: "Uttarakhand",
    category: "CITY",
    icon: "Landmark",
  },

  rishikesh: {
    lat: 30.0869,
    lng: 78.2676,
    state: "Uttarakhand",
    category: "CITY",
    icon: "Compass",
  },

  varanasi: {
    lat: 25.3176,
    lng: 82.9739,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "Landmark",
  },

  "kashi vishwanath": {
    lat: 25.3109,
    lng: 83.0107,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  ayodhya: {
    lat: 26.7922,
    lng: 82.1998,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "Landmark",
  },

  "ram mandir": {
    lat: 26.7956,
    lng: 82.1943,
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  amritsar: {
    lat: 31.634,
    lng: 74.8723,
    state: "Punjab",
    category: "CITY",
    icon: "MapPin",
  },

  "golden temple": {
    lat: 31.62,
    lng: 74.8765,
    state: "Punjab",
    category: "SIGHTSEEING",
    icon: "Landmark",
  },

  srinagar: {
    lat: 34.0837,
    lng: 74.7973,
    state: "Jammu and Kashmir",
    category: "CITY",
    icon: "Mountain",
  },

  chandigarh: {
    lat: 30.7333,
    lng: 76.7794,
    state: "Punjab / Haryana",
    category: "CITY",
    icon: "Building",
  },

  dehradun: {
    lat: 30.3165,
    lng: 78.0322,
    state: "Uttarakhand",
    category: "CITY",
    icon: "MapPin",
  },

  nainital: {
    lat: 29.3803,
    lng: 79.4636,
    state: "Uttarakhand",
    category: "CITY",
    icon: "Mountain",
  },

  mussoorie: {
    lat: 30.4598,
    lng: 78.0644,
    state: "Uttarakhand",
    category: "CITY",
    icon: "Mountain",
  },

  udaipur: {
    lat: 24.5854,
    lng: 73.7125,
    state: "Rajasthan",
    category: "CITY",
    icon: "Landmark",
  },

  jodhpur: {
    lat: 26.2389,
    lng: 73.0243,
    state: "Rajasthan",
    category: "CITY",
    icon: "Landmark",
  },

  mumbai: {
    lat: 19.076,
    lng: 72.8777,
    state: "Maharashtra",
    category: "CITY",
    icon: "Building",
  },

  pune: {
    lat: 18.5204,
    lng: 73.8567,
    state: "Maharashtra",
    category: "CITY",
    icon: "Building",
  },

  goa: {
    lat: 15.2993,
    lng: 74.124,
    state: "Goa",
    category: "CITY",
    icon: "Palmtree",
  },

  bengaluru: {
    lat: 12.9716,
    lng: 77.5946,
    state: "Karnataka",
    category: "CITY",
    icon: "Building",
  },

  lucknow: {
    lat: 26.8467,
    lng: 80.9462,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "Landmark",
  },

  prayagraj: {
    lat: 25.4358,
    lng: 81.8463,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "Landmark",
  },

  allahabad: {
    lat: 25.4358,
    lng: 81.8463,
    state: "Uttar Pradesh",
    category: "CITY",
    icon: "Landmark",
  },
};

// ============================================================
// GEOCODE LOCATION
// ============================================================

export async function geocodeLocation(query) {
  const qClean = (query || "").trim().toLowerCase();

  if (!qClean) {
    return null;
  }

  // ----------------------------------------------------------
  // 1. Known coordinates
  // ----------------------------------------------------------

  if (KNOWN_COORDINATES[qClean]) {
    return {
      latitude: KNOWN_COORDINATES[qClean].lat,
      longitude: KNOWN_COORDINATES[qClean].lng,
      source: "database",
    };
  }

  // Example:
  // "Mathura Bus Stand" -> Mathura coordinates
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (qClean.includes(key)) {
      return {
        latitude: coords.lat,
        longitude: coords.lng,
        source: "database",
      };
    }
  }

  // ----------------------------------------------------------
  // 2. Memory cache
  // ----------------------------------------------------------

  if (geocodeCache.has(qClean)) {
    return geocodeCache.get(qClean);
  }

  // ----------------------------------------------------------
  // 3. OpenStreetMap Nominatim fallback
  // ----------------------------------------------------------

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 3500);

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(`${query}, India`)}&` +
      `limit=1`;

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "MakeMyBharatYatra-RouteSearch/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();

      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const result = {
            latitude: lat,
            longitude: lon,
            source: "nominatim",
          };

          geocodeCache.set(qClean, result);

          return result;
        }
      }
    }
  } catch (err) {
    console.warn("Geocoding failed:", err.message);
  }

  return null;
}

// ============================================================
// SEARCH ROUTE LOCATIONS
// Cities + Bus + Sightseeing + Geocoding
// ============================================================

export async function searchRouteLocations(query) {
  const q = (query || "").trim();

  if (!q || q.length < 2) {
    return [];
  }

  const results = [];
  const seenKeys = new Set();

  const likeOp = Op.iLike || Op.like;

  // ==========================================================
  // 1. SEARCH KNOWN COORDINATES
  // ==========================================================

  const qLower = q.toLowerCase();

  for (const [nameKey, data] of Object.entries(KNOWN_COORDINATES)) {
    if (nameKey.includes(qLower) || qLower.includes(nameKey)) {
      const properName = nameKey
        .split(" ")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");

      const key = `${properName}-${data.category}`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);

        results.push({
          id: `known_${nameKey.replace(/\s+/g, "_")}`,
          name: properName,
          subtitle: `${data.state} · ${data.category}`,
          category: data.category,
          sourceType:
            data.category === "CITY"
              ? "CITY"
              : data.category === "SIGHTSEEING"
                ? "SIGHTSEEING"
                : "CAB",
          latitude: data.lat,
          longitude: data.lng,
          icon: data.icon || "MapPin",
          iconLibrary: "lucide",
        });
      }
    }
  }

  // ==========================================================
  // 2. SEARCH DATABASE CITIES
  // ==========================================================

  try {
    const dbCities = await Cities.findAll({
      where: {
        city_name: {
          [likeOp]: `%${q}%`,
        },
      },
      limit: 6,
    });

    for (const city of dbCities) {
      const cityName = city.city_name?.trim();

      if (!cityName) {
        continue;
      }

      const key = `${cityName}-CITY`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);

        const coords = await geocodeLocation(cityName);

        // Do not use fake/default coordinates
        if (coords) {
          results.push({
            id: `city_${city.id}`,
            name: cityName,
            subtitle: "Verified City · Destination Point",
            category: "CITY",
            sourceType: "CITY",
            latitude: coords.latitude,
            longitude: coords.longitude,
            icon: "MapPin",
            iconLibrary: "lucide",
          });

          // --------------------------------------------------
          // Also add Cab option
          // --------------------------------------------------

          const cabKey = `${cityName}-CAB`;

          if (!seenKeys.has(cabKey)) {
            seenKeys.add(cabKey);

            results.push({
              id: `cab_${city.id}`,
              name: `${cityName} (Cab Hub)`,
              subtitle: "Chauffeur / Private Cab Pickup",
              category: "CAB",
              sourceType: "CAB",
              latitude: coords.latitude,
              longitude: coords.longitude,
              icon: "Car",
              iconLibrary: "lucide",
            });
          }
        }
      }
    }
  } catch (err) {
    console.error(
      "Error querying Cities in route search:",
      err
    );
  }

  // ==========================================================
  // 3. SEARCH DATABASE BUS STANDS / TRANSIT HUBS
  // ==========================================================

  try {
    const dbBuses = await Bus.findAll({
      where: {
        CityName: {
          [likeOp]: `%${q}%`,
        },
      },
      limit: 6,
    });

    for (const bus of dbBuses) {
      if (!bus.CityName) {
        continue;
      }

      const cleanBusName = bus.CityName
        .replace(/\(.*?\)/g, "")
        .trim();

      const key = `${bus.CityName}-BUS`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);

        const coords = await geocodeLocation(cleanBusName);

        // Do not use fake/default coordinates
        if (coords) {
          results.push({
            id: `bus_${bus.id || bus.CityId}`,
            name: bus.CityName,
            subtitle: "Transport Hub / Bus Terminal",
            category: "TRANSPORT_HUB",
            sourceType: "BUS",
            latitude: coords.latitude,
            longitude: coords.longitude,
            icon: "Bus",
            iconLibrary: "lucide",
          });
        }
      }
    }
  } catch (err) {
    console.error(
      "Error querying Bus in route search:",
      err
    );
  }

  // ==========================================================
  // 4. SEARCH DATABASE SIGHTSEEING
  // ==========================================================

  try {
    const dbSightseeing = await Sightseeing.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [likeOp]: `%${q}%`,
            },
          },
          {
            cityName: {
              [likeOp]: `%${q}%`,
            },
          },
          {
            location: {
              [likeOp]: `%${q}%`,
            },
          },
        ],
      },
      limit: 6,
    });

    for (const sightseeing of dbSightseeing) {
      if (!sightseeing.name) {
        continue;
      }

      const key = `${sightseeing.name}-SIGHTSEEING`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);

        const searchLocation = [
          sightseeing.name,
          sightseeing.cityName,
        ]
          .filter(Boolean)
          .join(" ");

        const coords = await geocodeLocation(searchLocation);

        // Do not use fake/default coordinates
        if (coords) {
          results.push({
            id: `sight_${sightseeing.id}`,
            name: sightseeing.name,
            subtitle: `${
              sightseeing.cityName ||
              sightseeing.location ||
              ""
            } · Sightseeing`,
            category: "SIGHTSEEING",
            sourceType: "SIGHTSEEING",
            latitude: coords.latitude,
            longitude: coords.longitude,
            icon: "Landmark",
            iconLibrary: "lucide",
          });
        }
      }
    }
  } catch (err) {
    console.error(
      "Error querying Sightseeing in route search:",
      err
    );
  }

  // ==========================================================
  // 5. DYNAMIC GEOCODING
  // ==========================================================

  if (results.length === 0) {
    const dynamicCoords = await geocodeLocation(q);

    if (dynamicCoords) {
      results.push({
        id: `geo_${Date.now()}`,
        name: q,
        subtitle: "Geocoded Geographic Location",
        category: "CUSTOM",
        sourceType: "CUSTOM",
        latitude: dynamicCoords.latitude,
        longitude: dynamicCoords.longitude,
        icon: "MapPin",
        iconLibrary: "lucide",
      });
    }
  }

  return results;
}

// ============================================================
// HAVERSINE DISTANCE
// ============================================================

export function haversineDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

// ============================================================
// FORMAT DURATION
// ============================================================

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }

  return `${mins}m`;
}

// ============================================================
// GET ROUTE DIRECTIONS
// OSRM + HAVERSINE FALLBACK
// ============================================================

export async function getRouteDirections(waypoints = []) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return {
      success: false,
      error: "At least 2 waypoints required for route directions",
    };
  }

  // ==========================================================
  // VALIDATE COORDINATES
  // ==========================================================

  const validWaypoints = waypoints.filter(
    (waypoint) =>
      typeof waypoint.latitude === "number" &&
      !isNaN(waypoint.latitude) &&
      typeof waypoint.longitude === "number" &&
      !isNaN(waypoint.longitude) &&
      waypoint.latitude >= -90 &&
      waypoint.latitude <= 90 &&
      waypoint.longitude >= -180 &&
      waypoint.longitude <= 180
  );

  if (validWaypoints.length < 2) {
    return {
      success: false,
      error: "Invalid coordinates provided in waypoints",
    };
  }

  // ==========================================================
  // OSRM COORDINATES
  // Format:
  // longitude,latitude;longitude,latitude
  // ==========================================================

  const coordsParam = validWaypoints
    .map(
      (waypoint) =>
        `${waypoint.longitude.toFixed(
          6
        )},${waypoint.latitude.toFixed(6)}`
    )
    .join(";");

  // ==========================================================
  // OSRM REQUEST
  // ==========================================================

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 6000);

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${coordsParam}` +
      `?overview=full&geometries=geojson&steps=false`;

    const resp = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MakeMyBharatYatra-OSRMClient/1.0",
      },
    });

    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();

      if (
        data.code === "Ok" &&
        Array.isArray(data.routes) &&
        data.routes.length > 0
      ) {
        const route = data.routes[0];

        const totalDistanceMeters =
          route.distance || 0;

        const totalDistanceKm = (
          totalDistanceMeters / 1000
        ).toFixed(1);

        const totalDurationSeconds =
          route.duration || 0;

        const totalDurationFormatted =
          formatDuration(totalDurationSeconds);

        // ====================================================
        // SEGMENTS
        // ====================================================

        const segments = [];

        if (Array.isArray(route.legs)) {
          route.legs.forEach((leg, index) => {
            const fromWp = validWaypoints[index];
            const toWp = validWaypoints[index + 1];

            const legKm = (
              leg.distance / 1000
            ).toFixed(1);

            segments.push({
              from:
                fromWp?.name ||
                `Stop ${index + 1}`,

              to:
                toWp?.name ||
                `Stop ${index + 2}`,

              distance: `${legKm} km`,

              distanceMeters: leg.distance,

              duration: formatDuration(
                leg.duration
              ),
            });
          });
        }

        return {
          success: true,
          status: "osrm",

          totalDistance: `${totalDistanceKm} km`,

          totalDistanceKm:
            parseFloat(totalDistanceKm),

          totalDistanceMeters,

          totalDuration:
            totalDurationFormatted,

          totalDurationSeconds,

          segments,

          geometry: route.geometry,

          waypoints: validWaypoints,
        };
      }
    }
  } catch (err) {
    console.warn(
      "OSRM routing request failed, falling back to Haversine:",
      err.message
    );
  }

  // ==========================================================
  // HAVERSINE FALLBACK
  // ==========================================================

  let totalKm = 0;

  const segments = [];
  const lineCoords = [];

  for (
    let index = 0;
    index < validWaypoints.length;
    index++
  ) {
    const waypoint = validWaypoints[index];

    lineCoords.push([
      waypoint.longitude,
      waypoint.latitude,
    ]);

    if (index < validWaypoints.length - 1) {
      const nextWaypoint =
        validWaypoints[index + 1];

      const straightKm =
        haversineDistance(
          waypoint.latitude,
          waypoint.longitude,
          nextWaypoint.latitude,
          nextWaypoint.longitude
        );

      // Approx road distance
      const estimatedRoadKm =
        straightKm * 1.25;

      const roundedRoadKm =
        estimatedRoadKm.toFixed(1);

      totalKm += parseFloat(
        roundedRoadKm
      );

      const estimatedSeconds = Math.round(
        (parseFloat(roundedRoadKm) / 50) *
          3600
      );

      segments.push({
        from: waypoint.name,
        to: nextWaypoint.name,

        distance: `${roundedRoadKm} km`,

        distanceMeters:
          parseFloat(roundedRoadKm) *
          1000,

        duration:
          formatDuration(
            estimatedSeconds
          ),

        fallback: true,
      });
    }
  }

  const roundedTotalKm =
    totalKm.toFixed(1);

  const totalSecondsEst = Math.round(
    (totalKm / 50) * 3600
  );

  return {
    success: true,

    status: "fallback",

    warning:
      "Routing service temporarily busy; estimated road distance used.",

    totalDistance:
      `${roundedTotalKm} km`,

    totalDistanceKm:
      parseFloat(roundedTotalKm),

    totalDistanceMeters:
      totalKm * 1000,

    totalDuration:
      formatDuration(totalSecondsEst),

    totalDurationSeconds:
      totalSecondsEst,

    segments,

    geometry: {
      type: "LineString",
      coordinates: lineCoords,
    },

    waypoints: validWaypoints,
  };
}