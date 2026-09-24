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

    const existing = await Sightseeing.findOne({
      where,
    });

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

async function findSightseeing(id) {
  const numericId = Number(id);

  if (!Number.isNaN(numericId) && String(numericId) === String(id)) {
    return Sightseeing.findByPk(numericId);
  }

  return Sightseeing.findOne({
    where: {
      slug: id,
    },
  });
}

/**
 * GET /api/admin/sightseeing/:id
 *
 * /api/admin/sightseeing/12
 * /api/admin/sightseeing/goa-baga-beach
 */
export async function GET(request, { params }) {
  try {
    await sequelize.authenticate();

    const { id } = await params;

    const sightseeing = await findSightseeing(id);

    if (!sightseeing) {
      return NextResponse.json(
        {
          success: false,
          message: "Sightseeing not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sightseeing: formatSightseeingResponse(sightseeing),
    });
  } catch (error) {
    console.error("GET sightseeing details error:", error);

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
 * PUT /api/admin/sightseeing/:id
 *
 * Full update
 */
export async function PUT(request, { params }) {
  return updateSightseeing(request, params);
}

/**
 * PATCH /api/admin/sightseeing/:id
 *
 * Partial update
 */
export async function PATCH(request, { params }) {
  return updateSightseeing(request, params);
}

async function updateSightseeing(request, params) {
  try {
    await sequelize.authenticate();

    const { id } = await params;

    const sightseeing = await findSightseeing(id);

    if (!sightseeing) {
      return NextResponse.json(
        {
          success: false,
          message: "Sightseeing not found",
        },
        { status: 404 }
      );
    }

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
      slug,
    } = body;

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name cannot be empty",
        },
        { status: 400 }
      );
    }

    if (city !== undefined && !String(city).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "City cannot be empty",
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

    const finalName =
      name !== undefined ? String(name).trim() : sightseeing.name;

    const finalCity =
      city !== undefined ? String(city).trim() : sightseeing.city;

    // Duplicate check
    const duplicate = await Sightseeing.findOne({
      where: {
        id: {
          [Op.ne]: sightseeing.id,
        },

        name: {
          [Op.like]: finalName,
        },

        [Op.or]: [
          {
            city: {
              [Op.like]: finalCity,
            },
          },
          {
            cityName: {
              [Op.like]: finalCity,
            },
          },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Another sightseeing with same name and city already exists",
        },
        { status: 409 }
      );
    }

    let finalSlug = sightseeing.slug;

    if (slug !== undefined || name !== undefined || city !== undefined) {
      const baseSlug = slugify(
        slug || `${finalName}-${finalCity}`
      );

      finalSlug = await ensureUniqueSlug(
        baseSlug,
        sightseeing.id
      );
    }

    const updateData = {};

    if (name !== undefined) updateData.name = finalName;
    if (city !== undefined) updateData.city = finalCity;

    if (cityName !== undefined) {
      updateData.cityName = cityName?.trim() || null;
    }

    if (state !== undefined) {
      updateData.state = state?.trim() || null;
    }

    if (country !== undefined) {
      updateData.country = country?.trim() || null;
    }

    if (location !== undefined) {
      updateData.location = location?.trim() || null;
    }

    if (latitude !== undefined) {
      updateData.latitude =
        latitude === "" || latitude === null
          ? null
          : Number(latitude);
    }

    if (longitude !== undefined) {
      updateData.longitude =
        longitude === "" || longitude === null
          ? null
          : Number(longitude);
    }

    if (image !== undefined) {
      updateData.image = image?.trim() || null;
    }

    if (gallery !== undefined) {
      updateData.gallery = gallery;
    }

    if (shortDescription !== undefined) {
      updateData.shortDescription =
        shortDescription?.trim() || null;
    }

    if (description !== undefined) {
      updateData.description =
        description?.trim() || null;
    }

    if (masterDescription !== undefined) {
      updateData.masterDescription =
        masterDescription?.trim() || null;
    }

    if (duration !== undefined) {
      updateData.duration = duration?.trim() || null;
    }

    if (bestTimeToVisit !== undefined) {
      updateData.bestTimeToVisit =
        bestTimeToVisit?.trim() || null;
    }

    if (entryFee !== undefined) {
      updateData.entryFee = entryFee?.trim() || null;
    }

    if (openingTime !== undefined) {
      updateData.openingTime = openingTime?.trim() || null;
    }

    if (closingTime !== undefined) {
      updateData.closingTime = closingTime?.trim() || null;
    }

    if (category !== undefined) {
      updateData.category = category?.trim() || null;
    }

    if (status !== undefined) {
      if (!["Active", "Inactive"].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Status must be Active or Inactive",
          },
          { status: 400 }
        );
      }

      updateData.status = status;
    }

    updateData.slug = finalSlug;

    await sightseeing.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Sightseeing updated successfully",
      sightseeing: formatSightseeingResponse(sightseeing),
    });
  } catch (error) {
    console.error("UPDATE sightseeing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update sightseeing",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sightseeing/:id
 *
 * Normal:
 * DELETE /api/admin/sightseeing/12
 *
 * Force:
 * DELETE /api/admin/sightseeing/12?force=true
 */
export async function DELETE(request, { params }) {
  try {
    await sequelize.authenticate();

    const { id } = await params;

    const sightseeing = await findSightseeing(id);

    if (!sightseeing) {
      return NextResponse.json(
        {
          success: false,
          message: "Sightseeing not found",
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    const force =
      searchParams.get("force") === "true";

    /*
     * Reference checking depends on your other Sequelize models.
     *
     * If you already have checkSightseeingReferences()
     * from the old Express API, call it here.
     *
     * Example:
     *
     * const references = await checkSightseeingReferences(sightseeing);
     */

    if (!force) {
      // Safety-first:
      // Don't silently delete when reference-checking
      // has not been implemented yet.
      return NextResponse.json(
        {
          success: false,
          message:
            "Delete protection is enabled. Use force=true only when you are sure this sightseeing is not referenced.",
          canForceDelete: true,
        },
        { status: 409 }
      );
    }

    await sightseeing.destroy();

    return NextResponse.json({
      success: true,
      message: "Sightseeing deleted successfully",
      id: sightseeing.id,
    });
  } catch (error) {
    console.error("DELETE sightseeing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete sightseeing",
        error: error.message,
      },
      { status: 500 }
    );
  }
}