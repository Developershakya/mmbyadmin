import { Op } from "sequelize";
import { NextResponse } from "next/server";
import Hotel from "../../../../../models/hotel.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const rows = await Hotel.findAll({
      attributes: ["cityid", "Destination", "country"],
      where: {
        Destination: {
          [Op.like]: `${query}%`,
        },
        status: "Active",
      },
      limit: 10,
      raw: true,
    });

    console.log("Hotel city rows:", rows);

    return NextResponse.json(rows);
  } catch (error) {
    console.log("Hotel city API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}