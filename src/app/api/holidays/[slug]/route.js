import { Op } from "sequelize";
import { NextResponse } from "next/server";
import Package from "../../../../../models/Package.js";
import PackagePhoto from "../../../../../models/PackagePhoto.js";
import Itinerary from "../../../../../models/Itinerary.js";

export async function GET(request, { params }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ success: false, message: "Slug is required" }, { status: 400 });
  }

  try {
    const pkg = await Package.findOne({
      where: { [Op.or]: [{ packageName: slug }, { id: slug }] },
    });

    if (!pkg) {
      return NextResponse.json({ success: false, message: "Package not found" });
    }

    const [photoRows, itineraryRows] = await Promise.all([
      PackagePhoto.findAll({
        where: { package_id: pkg.id },
        attributes: ["photo"],
        raw: true,
      }),
      Itinerary.findAll({
        where: { package_id: pkg.id },
        attributes: ["day_number", "title", "description", "image"],
        order: [["day_number", "ASC"]],
        raw: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      package: pkg,
      photos: photoRows.map((photo) => photo.photo),
      itinerary: itineraryRows,
    });
  } catch (error) {
    console.error("Holiday detail API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}