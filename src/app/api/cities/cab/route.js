import { Op } from "sequelize";
import { NextResponse } from "next/server";
import Cities from "../../../../../models/cities.js";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const cities = await Cities.findAll({
      where: query.trim().length >= 2
        ? { city_name: { [Op.like]: `%${query.trim()}%` } }
        : undefined,
      attributes: [
        ["id", "cityid"],
        ["city_name", "Destination"],
        ["state_id", "country"],
      ],
      order: [["city_name", "ASC"]],
      limit: 10,
      raw: true,
    });
    const rows = cities;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Cab city API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
