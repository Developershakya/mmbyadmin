import { Op } from "sequelize";
import { NextResponse } from "next/server";
import Bus from "../../../../../models/bus.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const where = query.trim().length >= 2
      ? { CityName: { [Op.like]: `%${query.trim()}%` } }
      : undefined;
    const cities = await Bus.findAll({
      where,
      attributes: ["CityId", "CityName"],
      order: [["CityName", "ASC"]],
      limit: 10,
      raw: true,
    });
    const rows = cities.map(({ CityId, CityName }) => ({
      cityid: CityId,
      Destination: CityName,
      country: "",
    }));
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Bus city search error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
