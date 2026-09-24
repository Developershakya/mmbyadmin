import { NextResponse } from "next/server";
import Sightseeing from "@/models/Sightseeing";
import sequelize from "@/config/sequelize";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    await sequelize.authenticate();

    const { id } = await params;

    const sightseeing = await Sightseeing.findByPk(Number(id));

    if (!sightseeing) {
      return NextResponse.json(
        {
          success: false,
          message: "Sightseeing not found",
        },
        { status: 404 }
      );
    }

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    let newStatus = body.status;

    if (!newStatus) {
      newStatus =
        sightseeing.status === "Active"
          ? "Inactive"
          : "Active";
    }

    if (!["Active", "Inactive"].includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status must be Active or Inactive",
        },
        { status: 400 }
      );
    }

    sightseeing.status = newStatus;

    await sightseeing.save();

    return NextResponse.json({
      success: true,
      message: `Sightseeing ${newStatus.toLowerCase()} successfully`,
      sightseeing: {
        id: sightseeing.id,
        status: sightseeing.status,
      },
    });
  } catch (error) {
    console.error("PATCH sightseeing status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update sightseeing status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}