import { NextResponse } from "next/server";
import Package from "../../../../models/Package.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination")?.trim();
    const days = searchParams.get("days")?.trim();

    let packages = await Package.findAll();

    if (destination) {
      const destinationLower = destination.toLowerCase();
      packages = packages.filter((item) => {
        const city = String(item.city || "").toLowerCase();
        const state = String(item.state || "").toLowerCase();
        const name = String(item.packageName || "").toLowerCase();

        return (
          city.includes(destinationLower) ||
          state.includes(destinationLower) ||
          name.includes(destinationLower)
        );
      });
    }

    if (days) {
      const wantedDays = Number(days);
      packages = packages.filter((item) => {
        const itemDays = Number(item.days);
        if (!Number.isFinite(itemDays)) return false;
        return itemDays <= wantedDays;
      });
    }

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Get packages error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}