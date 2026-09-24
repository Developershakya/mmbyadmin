import { Op } from "sequelize";
import { NextResponse } from "next/server";
import Sightseeing from "@/models/Sightseeing";
import sequelize from "@/config/sequelize";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ||
      searchParams.get("q")?.trim() ||
      "";

    const destination =
      searchParams.get("destination")?.trim() ||
      searchParams.get("city")?.trim() ||
      "";

    const limitValue = Number(
      searchParams.get("limit") || 20
    );

    const limit = Math.min(
      Math.max(limitValue, 1),
      50
    );

    const where = {
      status: "Active",
    };

    const conditions = [];

    // FIX: wrap search fields in a single Op.or so any one of them
    // matching returns the row (previously each field was ANDed
    // together which rejected rows where only one field matched).
    if (search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { city: { [Op.like]: `%${search}%` } },
          { cityName: { [Op.like]: `%${search}%` } },
          { state: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (destination) {
      conditions.push({
        [Op.or]: [
          { city: { [Op.like]: `%${destination}%` } },
          { cityName: { [Op.like]: `%${destination}%` } },
        ],
      });
    }

    if (conditions.length > 0) {
      where[Op.and] = conditions;
    }

    const items = await Sightseeing.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "city",
        "cityName",
        "state",
        "location",
        "latitude",
        "longitude",
        "image",
        "category",
        "status",
      ],
      order: [
        ["name", "ASC"],
        ["id", "DESC"],
      ],
      limit,
    });

    return NextResponse.json({
      success: true,
      count: items.length,

      suggestions: items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        city: item.city,
        cityName: item.cityName,
        state: item.state,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        image: item.image,
        category: item.category,
      })),

      sightseeing: items,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/sightseeing/search error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search sightseeing",
        error: error.message,
      },
      { status: 500 }
    );
  }
}