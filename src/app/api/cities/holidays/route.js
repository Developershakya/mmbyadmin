import { Op } from "sequelize";
import { NextResponse } from "next/server";
import Cities from "../../../../../models/cities.js";
import Package from "../../../../../models/Package.js";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const packages = await Package.findAll({
      attributes: ["city"],
      raw: true,
    });
    const packageCities = [...new Set(packages.map(({ city }) => city).filter(Boolean))];
    const cities = await Cities.findAll({
      where: {
        city_name: {
          [Op.and]: [
            { [Op.like]: `%${query || ""}%` },
            { [Op.in]: packageCities },
          ],
        },
      },
      attributes: [["id", "code"], ["city_name", "name"]],
      limit: 10,
      raw: true,
    });
    const rows = cities.map((city) => ({ ...city, country: "India" }));
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Holiday city API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
