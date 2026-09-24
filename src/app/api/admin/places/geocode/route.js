import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").trim();
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!q && (!lat || !lng)) {
      return NextResponse.json(
        {
          success: false,
          error: "Query (q) or coordinates (lat, lng) required",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY;

    // =========================================================
    // 1. Google Maps Geocoding API
    // =========================================================

    if (apiKey) {
      try {
        const googleUrl = q
          ? `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              q
            )}&key=${apiKey}`
          : `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

        const googleResponse = await fetch(googleUrl, {
          cache: "no-store",
        });

        const googleData = await googleResponse.json();

        if (
          googleData.status === "OK" &&
          Array.isArray(googleData.results) &&
          googleData.results.length > 0
        ) {
          const results = googleData.results.map((item) => {
            const components = item.address_components || [];

            const getComponent = (types) => {
              const component = components.find((comp) =>
                types.some((type) => comp.types?.includes(type))
              );

              return component ? component.long_name : "";
            };

            const city =
              getComponent([
                "locality",
                "sublocality_level_1",
                "administrative_area_level_2",
                "postal_town",
              ]) || "";

            const state =
              getComponent(["administrative_area_level_1"]) || "";

            const country =
              getComponent(["country"]) || "India";

            const location =
              item.formatted_address || "";

            const latitude =
              item.geometry?.location?.lat;

            const longitude =
              item.geometry?.location?.lng;

            return {
              name:
                components[0]?.long_name ||
                q,

              city,
              state,
              country,
              location,

              latitude:
                typeof latitude === "number"
                  ? Number(latitude.toFixed(6))
                  : null,

              longitude:
                typeof longitude === "number"
                  ? Number(longitude.toFixed(6))
                  : null,

              source: "google",
            };
          });

          return NextResponse.json({
            success: true,
            provider: "google",
            results,
          });
        }
      } catch (googleError) {
        console.warn(
          "Google geocoding error, falling back to Photon:",
          googleError?.message
        );
      }
    }

    // =========================================================
    // 2. Photon / OpenStreetMap fallback
    // =========================================================

    if (q) {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        q
      )}&limit=8`;

      const photonResponse = await fetch(photonUrl, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!photonResponse.ok) {
        throw new Error(
          `Photon API returned ${photonResponse.status}`
        );
      }

      const photonData = await photonResponse.json();

      if (
        photonData &&
        Array.isArray(photonData.features) &&
        photonData.features.length > 0
      ) {
        const results = photonData.features.map((feature) => {
          const properties = feature.properties || {};
          const geometry = feature.geometry || {};

          const coordinates = Array.isArray(
            geometry.coordinates
          )
            ? geometry.coordinates
            : [0, 0];

          const longitude = coordinates[0];
          const latitude = coordinates[1];

          const name =
            properties.name || q;

          const city =
            properties.city ||
            properties.district ||
            properties.county ||
            properties.locality ||
            properties.state ||
            "";

          const state =
            properties.state || "";

          const country =
            properties.country || "India";

          const addressParts = [
            properties.name,
            properties.street,
            properties.locality,
            properties.district &&
            properties.district !== properties.city
              ? properties.district
              : null,
            properties.city,
            properties.state,
            properties.postcode,
            properties.country,
          ].filter(Boolean);

          const uniqueParts = addressParts.filter(
            (item, index) =>
              addressParts.indexOf(item) === index
          );

          const location =
            uniqueParts.join(", ");

          return {
            name,
            city,
            state,
            country,
            location,

            latitude:
              typeof latitude === "number"
                ? Number(latitude.toFixed(6))
                : null,

            longitude:
              typeof longitude === "number"
                ? Number(longitude.toFixed(6))
                : null,

            source: "maps",
          };
        });

        return NextResponse.json({
          success: true,
          provider: "maps",
          results,
        });
      }
    }

    // =========================================================
    // No results
    // =========================================================

    return NextResponse.json({
      success: true,
      results: [],
    });
  } catch (error) {
    console.error(
      "Geocode route error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to geocode location",
      },
      { status: 500 }
    );
  }
}