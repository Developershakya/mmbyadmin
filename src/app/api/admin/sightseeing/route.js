import { Op } from "sequelize";
import { NextResponse } from "next/server";
import Sightseeing from "@/models/Sightseeing";
import sequelize from "@/config/sequelize";

export const dynamic = "force-dynamic";

function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug || `sightseeing-${Date.now()}`;
  let counter = 1;

  while (true) {
    const where = {
      slug,
    };

    if (excludeId) {
      where.id = {
        [Op.ne]: excludeId,
      };
    }

    const existing = await Sightseeing.findOne({ where });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function formatSightseeingResponse(s) {
  if (!s) return null;

  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    city: s.city,
    cityName: s.cityName,
    state: s.state,
    country: s.country,
    location: s.location,
    latitude: s.latitude,
    longitude: s.longitude,
    image: s.image,
    gallery: s.gallery,
    shortDescription: s.shortDescription,
    description: s.description,
    masterDescription: s.masterDescription,
    duration: s.duration,
    bestTimeToVisit: s.bestTimeToVisit,
    entryFee: s.entryFee,
    openingTime: s.openingTime,
    closingTime: s.closingTime,
    category: s.category,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

/**
 * GET /api/admin/sightseeing
 *
 * Examples:
 * /api/admin/sightseeing
 * /api/admin/sightseeing?search=fort
 * /api/admin/sightseeing?city=Goa
 * /api/admin/sightseeing?state=Goa
 * /api/admin/sightseeing?category=Beach
 * /api/admin/sightseeing?status=Active
 */
export async function GET(request) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const query = searchParams.get("q")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const state = searchParams.get("state")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const searchValue = search || query;

    const where = {};

    if (searchValue) {
      where[Op.or] = [
        {
          name: {
            [Op.like]: `%${searchValue}%`,
          },
        },
        {
          city: {
            [Op.like]: `%${searchValue}%`,
          },
        },
        {
          cityName: {
            [Op.like]: `%${searchValue}%`,
          },
        },
        {
          state: {
            [Op.like]: `%${searchValue}%`,
          },
        },
        {
          category: {
            [Op.like]: `%${searchValue}%`,
          },
        },
      ];
    }

    if (city) {
      where.city = {
        [Op.like]: `%${city}%`,
      };
    }

    if (state) {
      where.state = {
        [Op.like]: `%${state}%`,
      };
    }

    if (category) {
      where.category = {
        [Op.like]: `%${category}%`,
      };
    }

    if (status) {
      where.status = status;
    }

    const items = await Sightseeing.findAll({
      where,
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
    });

    return NextResponse.json({
      success: true,
      count: items.length,
      sightseeing: items.map(formatSightseeingResponse),
    });
  } catch (error) {
    console.error("GET /api/admin/sightseeing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sightseeing",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sightseeing
 */
export async function POST(request) {
  try {
    await sequelize.authenticate();

    const body = await request.json();

    const {
      name,
      city,
      cityName,
      state,
      country,
      location,
      latitude,
      longitude,
      image,
      gallery,
      shortDescription,
      description,
      masterDescription,
      duration,
      bestTimeToVisit,
      entryFee,
      openingTime,
      closingTime,
      category,
      status,
      slug: requestedSlug,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required",
        },
        { status: 400 }
      );
    }

    if (!city?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "City is required",
        },
        { status: 400 }
      );
    }

    if (
      latitude !== undefined &&
      latitude !== null &&
      latitude !== "" &&
      (Number.isNaN(Number(latitude)) ||
        Number(latitude) < -90 ||
        Number(latitude) > 90)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Latitude must be between -90 and 90",
        },
        { status: 400 }
      );
    }

    if (
      longitude !== undefined &&
      longitude !== null &&
      longitude !== "" &&
      (Number.isNaN(Number(longitude)) ||
        Number(longitude) < -180 ||
        Number(longitude) > 180)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Longitude must be between -180 and 180",
        },
        { status: 400 }
      );
    }

    // Duplicate check
    const duplicate = await Sightseeing.findOne({
      where: {
        name: {
          [Op.like]: name.trim(),
        },
        [Op.or]: [
          {
            city: {
              [Op.like]: city.trim(),
            },
          },
          {
            cityName: {
              [Op.like]: city.trim(),
            },
          },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Sightseeing with same name and city already exists",
          sightseeing: formatSightseeingResponse(duplicate),
        },
        { status: 409 }
      );
    }

    const baseSlug = slugify(requestedSlug || `${name}-${city}`);

    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    const sightseeing = await Sightseeing.create({
      name: name.trim(),
      slug: uniqueSlug,

      city: city.trim(),
      cityName: cityName?.trim() || city.trim(),

      state: state?.trim() || null,
      country: country?.trim() || "India",

      location: location?.trim() || null,

      latitude:
        latitude !== undefined && latitude !== null && latitude !== ""
          ? Number(latitude)
          : null,

      longitude:
        longitude !== undefined && longitude !== null && longitude !== ""
          ? Number(longitude)
          : null,

      image:
        image?.trim() ||
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",

      gallery: gallery || [],

      shortDescription: shortDescription?.trim() || null,
      description: description?.trim() || null,
      masterDescription: masterDescription?.trim() || null,

      duration: duration?.trim() || "2-3 Hours",
      bestTimeToVisit: bestTimeToVisit?.trim() || "October-March",
      entryFee: entryFee?.trim() || "Free Entry",
      openingTime: openingTime?.trim() || "09:00 AM",
      closingTime: closingTime?.trim() || "06:00 PM",
      category: category?.trim() || "Monument & Heritage",
      status: status === "Inactive" ? "Inactive" : "Active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sightseeing created successfully",
        sightseeing: formatSightseeingResponse(sightseeing),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/sightseeing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create sightseeing",
        error: error.message,
      },
      { status: 500 }
    );
  }
}