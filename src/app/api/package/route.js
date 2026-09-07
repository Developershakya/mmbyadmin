import { NextResponse } from "next/server";
import Package from "../../../../models/Package.js";

export async function GET() {
  try {
    const packages = await Package.findAll();

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Get packages error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}