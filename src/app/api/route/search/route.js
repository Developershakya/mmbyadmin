import { searchRouteLocations } from "@/lib/geoLocation/routeServer"; 
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  try {
    const q = searchParams.get("q") || searchParams.get("query") || "";
    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await searchRouteLocations(q);
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Error searching route locations:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        results: [],
      },
      { status: 500 }
    );
  }
}