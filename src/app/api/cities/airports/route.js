import { Op } from "sequelize";
import { NextResponse } from "next/server";
import AirportList from "../../../../../models/airport_list.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("query")?.trim() || "";
    const code = searchParams.get("code")?.trim();
    if (code) {
      const rows = await AirportList.findAll({
        where: { airport_code: String(code).toUpperCase() },
        attributes: ["airport_city_name", "airport_name", "airport_code"],
        group: ["airport_city_name", "airport_name", "airport_code"],
        limit: 1,
        raw: true,
      });
      return NextResponse.json(rows);
    }

    const search = `%${searchQuery || ""}%`;
    const rows = await AirportList.findAll({
      where: {
        [Op.or]: [
          { airport_city_name: { [Op.like]: search } },
          { airport_name: { [Op.like]: search } },
          { airport_code: { [Op.like]: search } },
        ],
      },
      attributes: ["airport_city_name", "airport_name", "airport_code"],
      group: ["airport_city_name", "airport_name", "airport_code"],
      limit: 10,
      raw: true,
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Airport city API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
