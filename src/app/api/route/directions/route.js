import { getRouteDirections } from "@/lib/server/routeServer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { waypoints } = body;

    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "At least 2 waypoints with latitude and longitude are required",
        },
        { status: 400 }
      );
    }

    const directions = await getRouteDirections(waypoints);
    return NextResponse.json(directions);
  } catch (err) {
    console.error("Error calculating route directions:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}